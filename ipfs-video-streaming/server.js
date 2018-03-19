var express = require('express');
var formidable = require('formidable');
var fs = require('fs-extra');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var mkdirp = require('mkdirp');
var Promise = require('promise');
var rimraf = require('rimraf');
var path = require('path');
var serveStatic = require('serve-static');
var multer = require('multer');
var Buffer = require('buffer');

var bodyParser = require('body-parser')

var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'})

const defaultPlaylistName = "master.m3u8"
let web3AccountAddress = "";
let description = "";
let title = "";

var app = express()


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(serveStatic(path.join(__dirname, 'src')))
app.use(serveStatic(path.join(__dirname, 'playlists')))
app.use(serveStatic(path.join(__dirname, 'hashes')))
app.use(serveStatic(path.join(__dirname, 'uploads')))
app.use(serveStatic(path.join(__dirname, 'build/contracts')))

app.use(multer({
  dest: path.join(__dirname, 'uploads')
}).any());

app.use('/playlists', function (req, res, next) { 
  res.send(JSON.stringify(fs.readdirSync("./playlists")));
})

app.use('/hashes/:name', function (req, res) { 
  res.send(JSON.parse(fs.readFileSync(`./hashes/${req.params.name}`, 'utf8')))
})

app.use('/fileupload', function (req, res, next) {
  var files = req.files;

  web3AccountAddress = req.body.web3AccountAddress;
  description = req.body.description;
  title = req.body.title;

  var name = files[0].originalname.substring(0, files[0].originalname.indexOf('.'))
  var oldpath = files[0].path;
  var outputDirectory = './uploads/' + name;
  var path = files[0].path;

    mkdirp(outputDirectory)

    ffmpeg(oldpath, { timeout: 432000 })
      //.addOption('-profile:v', 'baseline')
      .addOption('-level', 3.0)
      .addOption('-s', '640x360')
      .addOption('-start_number', 0)
      .addOption('-hls_time', 10)
      .addOption('-hls_list_size', 0)
      .format('hls')
      .on('start', function (cmd) {
        console.log('Started ' + cmd);
      })
      .on('error', function (err) {
        console.log('an error happened: ' + err.message);
      })
      .on('end', function () {
        console.log('File has been converted succesfully');
        uploadToIpfs(outputDirectory, name, path, files[0]).then(function (err) {       
          if (!err) { 
              cleanup(outputDirectory)
              res.redirect(301, "/");
              res.end();
          }
        })
      })
      .save(outputDirectory + "/" + defaultPlaylistName)
  });



function uploadToIpfs(outputDirectory, name, path, file) {
  return new Promise(function (resolve, reject) {
   uploadFiles = []

    var files = fs.readdirSync(outputDirectory);
    files
      .filter(file => file.substr(file.indexOf('.'), file.length) != "m3u8")
      .forEach(function (file) {
        uploadFiles.push({
          path: name + "/" + file,
          content: fs.createReadStream(outputDirectory + "/" + file)
        })
      })
    
    uploadFiles.push({
      path,
      content: fs.createReadStream(path)
    })
  
    ipfs.files.add(uploadFiles, function (err, files) {
      if (!err) {
        console.log("uploaded to ipfs")
      } else { 
        resolve(err)
      }
      console.log(files)

      fs.readFile(outputDirectory + "/" + defaultPlaylistName, "utf8", function(err, data) {
        let fileForDownload = files.pop();

        files.forEach(function(ipfsHash) { 
          split = ipfsHash.path.split('/')
          segment = split[split.length-1]

          data = data.replace(segment, "http://localhost:8080/ipfs/" + ipfsHash.hash)
        })

        fs.writeFile("./playlists/" + name + ".m3u8", data, "utf8", function(err) { 
          if (err) { 
            console.log("couldn't save the playlist file to playlist directory")
          } else { 
            resolve(err)
          }
        })
        
        //Save hash for ipfs address in json file
        let text = `{"name": "${name}", "ipfsHash": "${fileForDownload.hash}", "sender": "${web3AccountAddress}", "title": "${title}", "description": "${description}"}`;

        let hashData = JSON.parse(text);

        fs.writeFile("./hashes/" + name + ".json", JSON.stringify(hashData), function(err) { 
          if (err) { 
            console.log("couldn't save the json file to hashes directory")
          } else { 
            resolve(err)
          }
        })
      });
    })
  })
}

function cleanup(directory) { 
  rimraf(directory, function (err) { 
    if (err) { 
      console.log("oops.. didn't cleanup correctly")
      console.log(err)
    }
  });
}

app.listen(3000)