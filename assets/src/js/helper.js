/**
 * Gets i18n date format
 *
 * @since DOKAN_PRO_SINCE
 */
function dokan_get_i18n_date_format( format = true ) {
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
 function dokan_get_i18n_time_format( format = true ) {
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
function dokan_get_formatted_time( time, format ) {
  const times   = new Date( Date.parse( `Jan 1 ${time}` ) ), // We used this dummy date for getting time info.
    add0        = function( t ) { return t < 10 ? '0' + t : t; },
    hours       = times.getHours(),
    minutes     = times.getMinutes(),
    seconds     = times.getSeconds(),
    sampm       = hours >= 12 ? 'pm' : 'am',
    campm       = hours >= 12 ? 'PM' : 'AM',
    convertTime = ( time ) => {
      // Check correct time format and split into components
      time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

      if ( time.length > 1 ) {
        time    = time.slice (1);
        time[0] = +time[0] % 12 || 12;
      }

      return time[0];
    },
    hour12 = convertTime (`${add0( hours )}:${add0( minutes )}`),
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

  for ( let key in replaceMent ) {
    format = format.replace( key, replaceMent[ key ] );
  }

  return format;
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
function dokan_get_daterange_picker_format( dateTime = dokan_helper.i18n_date_format ) {
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
 async function dokan_sweetalert( message = '' , options = {} ) {
  const defaults = {
    text              : message,
    showCancelButton  : true,
    confirmButtonColor:'#28a745',
    cancelButtonColor :'#dc3545',
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
function dokan_execute_recaptcha(inputFieldSelector, action) {
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
