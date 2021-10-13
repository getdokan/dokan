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
  
  const args    = { ...defaults, ...options };

  switch( args.action ) {
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
