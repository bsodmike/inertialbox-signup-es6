class FoxSignup {
  constructor(options) {
    this.emailRequiredText = "Please enter an email address.";
    this.emailFormatText = "Your email address must be in the format of name@domain.com.";
    this.thankYouMessage = "Thank you!";
    this.firstNameInvalidChars = "Your first name may only contain letters.";
    this.lastNameInvalidChars = "Your last name may only contain letters.";
    this.called = false;
  }

  /**
   * Minimum validation and submit handler options object for jQuery form validate()
   * Add and override validation options but leave the submitHandler.
   * @see {@link http://jqueryvalidation.org/validate|jQuery Validation Plugin}
   * @return {object} preconfigured 'options' object for jQuery formvalidate()
   */
  formValidatorOptions() {
    var self = this;

    return {
      rules: {
        EMAIL_ADDRESS_: {
          required: true,
          email: true
        },
        first_name: {
          firstNameRegEx: true
        },
        last_name: {
          lastNameRegEx: true
        }
      },
      messages: {
        EMAIL_ADDRESS_: {
          required: this.emailRequiredText,
          email: this.emailFormatText
        },
        first_name: {
          firstNameRegEx: this.firstNameInvalidChars
        },
        last_name: {
          lastNameRegEx: this.lastNameInvalidChars
        }
      },
      ignore: '[name="POSTAL_CODE_"]',
      errorPlacement: function (error, element) {
        error.insertBefore(element);
      },
      submitHandler: function(form, event) {
        event.preventDefault();
        self.ajaxSubmitHandler.call(self, form);

        return false;
      }
    };
  }

  /**
   * Callback to send form data to the collector, assign to form 'onsubmit' or validate() 'submitHandler'. Disables form buttons and updates signupHandler allowing UI response targeting.
   * @param {object} arg - Either an event - when used as 'onsubmit' handler on a form - or a form node - when used as 'submitHandler' in jQuery.validate().
   * @return {boolean} false.
   */
  ajaxSubmitHandler(arg) {
    let form;

    if (typeof arg.target == 'object' && typeof arg.preventDefault == 'function') { // we're used as onsubmit function
      arg.preventDefault();
      form = $(arg.target);
    } else { // we're used as validate() submitHandler
      form = $(arg);
    }

    //debugger
    console.log('pending');
    let data = this.prepareSignupForm(form);

    //if (!data) {
      //return false;
    //}

    //this.ajaxSignup( this.form.attr('action') , data, 'formsignup');
  }
}

$(function() {
  /**
   * Extend our validation for first name.
   * @return boolean
   */
  if ($.validator) {
    $.validator.addMethod(
      'firstNameRegEx', function(value, element) {
      return this.optional(element) || !(/\=|\#|\$|\[|\]|\{|\}|\\|\*|\"|<|>|\^|\_|\||%/i.test(value));
    });
  }

  /**
   * Extend our validation for last name.
   * @return boolean
   */
  if ($.validator) {
    $.validator.addMethod(
      'lastNameRegEx', function(value, element) {
      return this.optional(element) || !(/\=|\#|\$|\[|\]|\{|\}|\\|\*|\"|<|>|\^|\_|\||%/i.test(value));
    });
  }
});

window.FoxSignup = FoxSignup;
