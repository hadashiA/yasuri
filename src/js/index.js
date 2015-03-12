var $      = require('jquery'),
    Ladda  = require('Ladda/dist/ladda.min'),
    suzuri = require('./lib/suzuri');

var signinScene = function() {
  $('.scene').hide();
  $('.signin-scene').show();
};

var uploadScene = function() {
  var $button   = $('.uploader button'),
      $input    = $('.uploader input[type=file]'),
      $products = $('.products'),
      button    = Ladda.create($button[0]);

  $('.scene').hide();
  $('.upload-scene').show();

  $input.on('change', function(e) {
    var file = this.files[0];
    button.start();
  });

  $button.on('click', function(e) {
    $input.click();
  });
};


$(function() {
  var $indicator = $('#indicator');

  suzuri.currentUser()
    .then(function() {
      $indicator.hide();
      uploadScene();
    })
    .catch(function() {
      $indicator.hide();
      signinScene();
    });
});


   
