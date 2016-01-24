var signupHandler = function(response) {
  // Set in prepareSignupForm
  signupHandler.foxSignup.sendTracking(response);
  signupHandler.foxSignup.ajaxCallback(response);
}

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
   * Override this handler accordingly.
   */
  sendTracking(response) {
    console.log('send tracking...');
  }

  /**
   * Override this handler accordingly.
   */
  ajaxCallback(response) {
    console.log('handle callback...');
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
    } else { // when used as validate() submitHandler
      form = $(arg);
    }

    let data = this.prepareSignupForm(form);

    if (!data) {
      return false;
    }

    console.log('ajaxSignup()');
    this.ajaxSignup(this.form.attr('action'), data, 'formsignup');
  }

  /**
   * Check for multiple submits, disable buttons, check dev defaults, update signupHandler and collect form data.
   * @param {object} submittedForm - jQuery DOM element of the form. The element will be assigned to signupHandler.submittedForm allowing targeting of UI responses. All buttons will be disabled to prevent double submissions.
   * @return {object} data - plainObject with the form data or null if submission should be prevented
   */
  prepareSignupForm(submittedForm)  {
    this.form = submittedForm;
    if (this._preventMultipleSubmit()){
      return null;
    }

    let inputs = this.form.serializeArray();
    let formData = {};

    $.each(inputs, function(i, field) {
      formData[field.name.toLowerCase()] = field.value;
    });

    if (this._preventDevDefaults(formData)){
      return null;
    }

    // update signupHandler
    signupHandler.foxSignup = this

    return formData;
  }

  disable() {
    $(this).prop('disabled', true);
  }

  /**
   * Check if the form is already being submitted.
   * @return true submit needs to be aborted, otherwise false.
   */
  _preventMultipleSubmit() {
    if (!this.called){
      this.called = true;
      return false;
    }

    this.form.find("input[type='submit']").each(this.disable);
    this.form.find("button").each(this.disable);
    this.form.find("input[type='button']").each(this.disable);
    return false;
  }

  // check defaults
  devCheck(data, field, check) {
    if (typeof data[field] == 'string' && data[field] && data[field] !== 'TEST' && data[field] !== check) {
      return true;
    }

    console.error('Developer, your ' + field + ' value is not defined properly, please contact Inertialbox IT');
    return false;
  }

  /**
   * Check if dev defaults are present in the HTML.
   * @return true submit needs to be aborted, otherwise false.
   */
  _preventDevDefaults(data) {
    if (!this.devCheck(data, '_ri_', 'PROVIDED_BY_INERTIALBOX') || !this.devCheck(data, 'reg_source', 'YYYYMMDD_TITLE_OR_EVENT') ) {
      return true;
    }

    return false;
  }

  /**
   * Send data to the collector.
   * @param {string} url - the url of the collector.
   * @param {object} data - the data to be sent. Must include at least '_ri_' and 'EMAIL_ADDRESS_'.
   * @return {boolean} false.
   */
  ajaxSignup(url, data, signupType) {
    this.form.prepend('<div class="sign-up-loader"></div>');
    this.trackEvent = signupType;
    // We are now putting all signups on a aws sqs and we do our branching
    // logic on the server end.

    var postUrl =  'https://forms.foxfilm.com/sqs/signup_handler.php';

    if (!data.ri_url) {
      data.ri_url = url;
    } else {
      postUrl=url;
    }

    $.ajax({
      type: 'POST',
      url: postUrl,
      data: data,
      crossDomain: true,
      success: function(response) {
        signupHandler(response);
      }
    });

    return false;
  }
}

/**
 * On $(document).ready()
 */
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
