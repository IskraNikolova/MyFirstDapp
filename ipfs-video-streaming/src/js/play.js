App = {
    web3Provider: null,
    contracts: {},
    ipfsHash: "",
    senderVideo: "",
  
    init: function () {
      let video = document.getElementById('video');
      let playlist = new URLSearchParams(window.location.search).get("video")
      let hash = new URLSearchParams(window.location.search).get("hash")
      let address = new URLSearchParams(window.location.search).get("sender")
      App.ipfsHash = hash;
      App.senderVideo = address;
  
      if (Hls.isSupported()) {
        let hls = new Hls();
        hls.loadSource(playlist);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        })
      }else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        alert("here")
        video.src = playlist;
        video.addEventListener('canplay',function() {
          video.play();
        });
      }

      return App.initWeb3();
    },

    initWeb3: function () { 
      // Is there is an injected web3 instance?
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider;
      } else {
        // If no injected web3 instance is detected, fallback to the TestRPC
        App.web3Provider = new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545');
      }
      web3 = new Web3(App.web3Provider);
  
      return App.initContract();
    },

   //SimpleToken
    initContract: function () {
      $.getJSON('ERC20Token.json', function (data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var ERC20TokenArtifact = data;
        App.contracts.ERC20Token = TruffleContract(ERC20TokenArtifact);
  
        // Set the provider for our contract
        App.contracts.ERC20Token.setProvider(App.web3Provider);
      });
  
      return App.bindEvents();
    },
  
    bindEvents: function () {
      $(document).on('click', '.btn-like', App.handlePay);
      $(document).on('click', '#download', App.getVideo);
    },
  
    handlePay: function () {
      var payInstance; 
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var sender = accounts[0]
        var to  = App.senderVideo;      
        var value = 2
         
        App.contracts.ERC20Token.deployed().then(function(instance) {
          tokenContract = instance;
          return tokenContract.transfer(to, value)
          .then((txHash) => {           
            console.log('Success')
            $("#download").css("display", "block")
          })
          .catch((err) => {
            console.error('Error', err)
          });
        });
      })
    },

    getVideo: function(){      
        $("#download").attr('href', `http://localhost:8080/ipfs/${App.ipfsHash}`)
    }
  };

$(function () {
    $(window).load(function () {
        App.init();
    });
});