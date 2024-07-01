;(function(document, window, $) {

  /**
   * Gets i18n date format
   *
   * @since DOKAN_PRO_SINCE
   */
  window.dokan_get_i18n_date_format = function ( format = true ) {
    if( ! format ) {
      return dokan_helper.i18n_date_format;
    }

    let formatMap = {
      // Day
      d: 'dd',
      D: 'D',
      j: 'd',
      l: 'DD',
      // Month
      F: 'MM',
      m: 'mm',
      M: 'M',
      n: 'm',
      // Year
      o: 'yy', // not exactly same. see php date doc for details
      Y: 'yy',
      y: 'y'
    }

    let i = 0;
    let char = '';
    let datepickerFormat = '';

    for (i = 0; i < dokan_helper.i18n_date_format.length; i++) {
      char = dokan_helper.i18n_date_format[i];
      if (char in formatMap) {
        datepickerFormat += formatMap[char];
      } else {
        datepickerFormat += char;
      }
    }

    return datepickerFormat;
  }

  /**
   * Get i18n time format.
   *
   * @since DOKAN_PRO_SINCE
   *
   * @param {string|boolean} format Time format.
   *
   * @return {string} Return a specific time format
   */
  window.dokan_get_i18n_time_format = function ( format = true ) {
    if ( ! format ) {
      return dokan_helper.i18n_time_format;
    }

    let replacements = {
      N: 'E',
      S: 'o',
      w: 'e',
      z: 'DDD',
      W: 'W',
      F: 'MMMM',
      m: 'MM',
      M: 'MMM',
      n: 'M',
      o: 'YYYY',
      Y: 'YYYY',
      y: 'YY',
      a: 'a',
      A: 'A',
      g: 'h',
      G: 'H',
      h: 'hh',
      H: 'HH',
      i: 'mm',
      s: 'ss',
      u: 'SSS',
      e: 'zz',
      U: 'X',
    }

    let i        = 0,
      char       = '',
      timeFormat = '';

    for ( i = 0; i < dokan_helper.i18n_time_format.length; i++ ) {
      if ( '\\' === dokan_helper.i18n_time_format[ i ] ) {
        timeFormat += dokan_helper.i18n_time_format[ i ];
        i++;
        timeFormat += dokan_helper.i18n_time_format[ i ];
        continue;
      }

      char = dokan_helper.i18n_time_format[ i ];

      if ( char in replacements ) {
        timeFormat += replacements[ char ];
      } else {
        timeFormat += char;
      }
    }

    return timeFormat;
  }

  /**
   * Get formatted time.
   *
   * @since DOKAN_PRO_SINCE
   *
   * @param {string} time   Time.
   * @param {string} format Time format type.
   *
   * @return {string} Return formatted time.
   */
  window.dokan_get_formatted_time = function ( time_string, output_format, input_format = dokan_get_i18n_time_format() ) {
    const length = output_format.length;
    // return if no length is provided
    if ( length <= 0 ) {
      return '';
    }

    const times   = moment( time_string, input_format ).toDate(), // We used this date for getting time info.
      add0        = function( t ) { return t < 10 ? '0' + t : t; },
      hours       = String( times.getHours() ),
      minutes     = String( times.getMinutes() ),
      seconds     = String( times.getSeconds() ),
      sampm       = hours >= 12 ? 'pm' : 'am',
      campm       = hours >= 12 ? 'PM' : 'AM',
      checkFormat = ( formats, format ) => {
        return formats[format] ? formats[format] : format;
      }
    convertTime = ( time ) => {
      // Check correct time format and split into components
      time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

      if ( time.length > 1 ) {
        time    = time.slice (1);
        time[0] = +time[0] % 12 || 12;
      }

      return time[0];
    },
      hour12      = convertTime (`${add0( hours )}:${add0( minutes )}`),
      replaceMent = {
        'hh' : add0( hour12 ),
        'h'  : hour12,
        'HH' : add0( hours ),
        'H'  : hours,
        'g'  : hour12,
        'MM' : add0( minutes ),
        'M'  : minutes,
        'mm' : add0( minutes ),
        'm'  : minutes,
        'i'  : add0( minutes ),
        'ss' : add0( seconds ),
        's'  : seconds,
        'A'  : campm,
        'a'  : sampm,
      };

    let formatted_string = '',
      temp_string 			 = '',
      current_string 		 = '';

    for ( let i = 0; i < length; i++ ) {
      // get current string
      current_string = output_format[i];

      if ( '\\' === current_string ) {
        if ( temp_string.length > 0 ) {
          formatted_string += checkFormat( replaceMent, temp_string );
          temp_string 			= '';
        }
        i++;
        formatted_string += output_format[i];
      } else if ( temp_string.length === 0 ) {
        temp_string = current_string;
      } else if ( temp_string !== current_string ) {
        formatted_string += checkFormat( replaceMent, temp_string );
        temp_string 		  = current_string;
      } else if ( temp_string === current_string ) {
        temp_string += current_string;
      }
    }

    formatted_string += temp_string.length ? checkFormat( replaceMent, temp_string ) : '';

    return formatted_string;
  }

  /**
   * Get date range picker supported date format
   *
   * @since 3.3.6
   *
   * @param {string} dateTime The date time to convert
   *
   * @return {string} Date range picker supported date format
   */
  window.dokan_get_daterange_picker_format = function ( dateTime = dokan_helper.i18n_date_format ) {
    let formatMap = {
      // Day
      d: 'D',
      D: 'DD',
      j: 'D',
      l: 'DD',
      // Month
      F: 'MMMM',
      m: 'MM',
      M: 'MM',
      n: 'M',
      // Year
      o: 'YYYY', // not exactly same. see php date doc for details
      Y: 'YYYY',
      y: 'YY',
      // Hour
      g: 'h',
      G: 'H',
      h: 'hh',
      H: 'HH',
      // Minute
      i: 'mm',
      // Second
      s: 'ss'
    }

    let i = 0;
    let char = '';
    let dateRangePickerFormat = '';

    for ( i = 0; i < dateTime.length; i++ ) {
      char = dateTime[i];

      if ( char in formatMap ) {
        dateRangePickerFormat += formatMap[char];
      } else {
        dateRangePickerFormat += char;
      }
    }

    return dateRangePickerFormat;
  }

  /**
   * Dokan Sweet Alert
   *
   * @since 3.2.13
   *
   * @param {string} message The event message for notification
   * @param {object} [options] Configuration of sweet alert modal
   *
   * @return {Promise | bool} Return Promise on success, and false on failure
   */
  window.dokan_sweetalert = async function ( message = '' , options = {} ) {
    const defaults = {
      text              : message,
      showCancelButton  : true,
      confirmButtonColor:'#28a745',
      cancelButtonColor :'#dc3545',
      ...dokan_helper.sweetalert_local
    };

    const args   = { ...defaults, ...options };
    const action = args.action;

    // Unset action property form args
    delete args.action;

    switch( action ) {
      case 'confirm':
      case 'prompt' :
        return await Swal.fire( args );
        break;

      case 'alert' :
      default :
        delete args.showCancelButton;
        Swal.fire( args );
        break;
    }
  }

  /**
   * Execute recaptcha token request
   *
   * @since 3.3.3
   *
   * @param {string} inputFieldSelector The input field for recaptcha token
   * @param {string} action The action for recaptcha
   *
   * @return {Promise} Return Promise
   */
  window.dokan_execute_recaptcha = function (inputFieldSelector, action) {
    return new Promise( function(resolve) {
      // Check if dokan_google_recaptcha object exists
      if ( 'undefined' === typeof dokan_google_recaptcha ) {
        resolve();
      }

      const recaptchaSiteKey    = dokan_google_recaptcha.recaptcha_sitekey;
      const recaptchaTokenField = document.querySelector(inputFieldSelector);

      // Check if the recaptcha site key exists
      if ( '' === recaptchaSiteKey ) {
        resolve();
      }

      // Execute recaptcha after passing checks
      grecaptcha.ready(function() {
        grecaptcha.execute(recaptchaSiteKey, { action: action }).then(function(token) {
          recaptchaTokenField.value = token;
          resolve();
        });
      });
    });
  }

  /**
   * This method will extract ajax error message from ajax response
   *
   * @since 3.5.1
   *
   * @param jqXHR
   *
   * @returns {string}
   */
  window.dokan_handle_ajax_error = function ( jqXHR ) {
    let error_message = '';
    if ( jqXHR.responseJSON && jqXHR.responseJSON.message ) {
      error_message = jqXHR.responseJSON.message;
    } else if ( jqXHR.responseJSON && jqXHR.responseJSON.data && jqXHR.responseJSON.data.message ) {
      error_message = jqXHR.responseJSON.data.message;
    } else if( jqXHR.responseText ) {
      error_message = jqXHR.responseText;
    }
    return error_message;
  }

  /**
   * Sanitize phone number characters.
   *
   * @since 3.7.22
   *
   * @param evt Event Object
   *
   * @return {void}
   */
  window.dokan_sanitize_phone_number = function ( evt ) {
    // Allow: backspace, tab, enter and escape.
    if ( [ "Backspace", "Tab", "Enter", "Escape" ].indexOf( evt.key ) !== -1 ) {
      return;
    }

    // Allow: special characters.
    if ( [ "(", ")", ".", "-", "_", "+" ].indexOf( evt.key ) !== -1  ) {
      return;
    }

    // Allow: Ctrl+A.
    if ( "a" === evt.key && true === evt.ctrlKey ) {
      return;
    }

    // Allow: arrow keys.
    if ( [ "ArrowLeft", "ArrowRight" ].indexOf( evt.key ) !== -1  ) {
      return;
    }

    // Ensure that it is a number and stop the keypress.
    if ( ( evt.shiftKey && ! isNaN( Number( evt.key ) ) ) ) {
      return;
    }

    if ( isNaN( Number( evt.key ) ) ) {
      evt.preventDefault();
    }
  }

  let copyIcon = `<svg width='20px' height='20px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
  <path d='M8 4V16C8 17.1046 8.89543 18 10 18L18 18C19.1046 18 20 17.1046 20 16V7.24162C20 6.7034 19.7831 6.18789 19.3982 5.81161L16.0829 2.56999C15.7092 2.2046 15.2074 2 14.6847 2H10C8.89543 2 8 2.89543 8 4Z' stroke='#000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>
  <path d='M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V9C4 7.89543 4.89543 7 6 7H8' stroke='#000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>
  </svg>`;
  let tickIcon = `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4.89163 13.2687L9.16582 17.5427L18.7085 8" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  let copyHolder = null;

  let Functions = {
    init() {
      this.copyToClipBoardInit();
      $('.dokan-copy-to-clipboard').on( 'click', this.copyToClipboardClickhandler );
    },

    copyToClipBoardInit() {
      copyHolder = $('.dokan-copy-to-clipboard');
      copyHolder.css( 'cursor', 'pointer' );
      copyHolder.html( copyIcon )
    },

    copyToClipboardClickhandler() {
      let copyItem = $(this);
      let copydata = $(this).data('copy') ? $(this).data('copy') : '';

      const textarea = document.createElement('textarea');
      textarea.classList.add("dokan-copy-to-clipboard-textarea");
      document.body.appendChild(textarea);
      textarea.value = copydata;
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      let copiedSuccessfully = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (copiedSuccessfully) {
        copyItem.html( tickIcon )
        setTimeout(() => {
          copyItem.html( copyIcon )
        }, 1000);
      }
    }
  };

  $( document ).ready( function() {
    Functions.init();
  });
})(document, window, jQuery);
