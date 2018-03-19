App = {
  playlistsName: [],

  init: function () {
     var request = $.getJSON("/playlists").then(function (files) {
        App.playlistsName = files;
      }).done(function () {
        for(let file = 0; file < App.playlistsName.length; file++){
          var playlistsRow = $('#playlistsRow');
          var playlistsTemplate = $('#playlistsTemplate');
          let playlist = App.playlistsName[file];

          //Get name of file
          var index = playlist.indexOf('.');
          var name = playlist.substring(0, index);
          var hash = "";
          var sender = "";
          
          $.getJSON(`/hashes/${name}.json`).then(function (file) {
            hash = file.ipfsHash;
            sender = file.sender;
            playlistsTemplate.find('.link')
                   .attr('href', `/play.html?video=${playlist}&hash=${hash}&sender=${sender}`);
            playlistsTemplate.find('.link').text(playlist)       
            playlistsRow.append(playlistsTemplate.html());
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
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
