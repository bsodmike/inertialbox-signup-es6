var $ = require('jquery');
var foundation = require('../../node_modules/foundation-sites/dist/foundation.js');

$(document).foundation();

$(function() {
  var foxSignup = new FoxSignup();

  FoxSignup.prototype.sendTracking = function(response) {
    console.log('override and send tracking...');
  }

  FoxSignup.prototype.ajaxCallback = function(response) {
    console.log('override and handle callback: %O', response);
  }

  $("#signup-form").validate(foxSignup.formValidatorOptions());

  console.log('starting...');
});
