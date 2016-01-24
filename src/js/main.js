var $ = require('jquery');
var foundation = require('../../node_modules/foundation-sites/dist/foundation.js');

$(document).foundation();

$(function() {
  var foxSignup = new FoxSignup();

  $("#signup-form").validate(foxSignup.formValidatorOptions());

  console.log('starting...');
});
