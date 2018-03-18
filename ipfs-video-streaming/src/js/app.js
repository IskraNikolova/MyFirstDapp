App = {
  web3Provider: null,
  contracts: {},
  playlistsName: [],

  init: function () {
     var request = $.getJSON("/playlists").then(function (files) {
        App.playlistsName = files;
      }).done(function () {
        for(let file = 0; file < App.playlistsName.length; file++){
          var playlistsRow = $('#playlistsRow');
          var playlistsTemplate = $('#playlistsTemplate');
          let playlist = App.playlistsName[file]
          console.log(playlist)
          //Get name of file
          var index = playlist.indexOf('.');
          var name = playlist.substring(0, index);
          var hash = "";
          var sender = "";
          $.getJSON(`/hashes/${name}.json`).then(function (file) {
            hash = file.ipfsHash;
            sender = file.sender;
            console.log(hash)
            playlistsTemplate.find('.link').attr('href', `/play.html?video=${playlist}&hash=${hash}&sender=${sender}`);
            playlistsTemplate.find('.link').text(playlist)       
            playlistsRow.append(playlistsTemplate.html());
            console.log("done")
            console.log(playlist)
          });
        
        }})
        App.bindEvents();
    },

  bindEvents: function () {
    $(document).on('click', '.btn-pay', App.handleAdopt);
    $(document).on('click', '.btn-mySubmit', App.handleClickUpload);
  },

  handleClickUpload: function () {
    document.getElementById('loader').style = "visibility:visible;"
    document.getElementById('uploadVideoButton').style = "visibility:hidden;"
  },

  handleAdopt: function () {
    var payInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0]
      console.log(account)
      App.contracts.Pay.deployed().then(function (instance) {
        payInstance = instance;

        return payInstance.pay({ from: account });

      }).then(function (result) {
        document.find('button').text('Success').attr('disabled', true);
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
