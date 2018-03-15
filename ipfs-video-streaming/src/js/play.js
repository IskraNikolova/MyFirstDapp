App = {
    web3Provider: null,
    contracts: {},
  
    init: function () {
      var video = document.getElementById('video');
      var playlist = new URLSearchParams(window.location.search).get("video")
  
      if (Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(playlist);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        })
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
      $(document).on('click', '.btn-pay', App.handlePay);
    },
  
    handlePay: function () {
      var payInstance;
  
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var sender = accounts[0]
        var to  = "0x8f0483125fcb9aaaefa9209d8e9d7b9c8b9fb90f"
        var value = 2
         
        App.contracts.ERC20Token.deployed().then(function(instance) {
          tokenContract = instance;
          console.log(tokenContract)
          return tokenContract.transfer(to, value)
          .then((txHash) => {
            console.log('Success')
          })
          .catch((err) => {
            console.error('Error', err)
          });
        });
      })
    }
  };

$(function () {
    $(window).load(function () {
        App.init();
    });
});