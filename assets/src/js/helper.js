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
 * @since DOKAN_LITE
 *
 * @param {string} message The event message for notification
 * @param {object} [options] Configuration of sweet alert.
 *
 * @return {Promise | bool} Return Promise on success, and false on failure
 */
 async function dokan_sweet_alert( message = '' , options = {} ) {
  switch( options.action ) {
    case 'confirm' :
        return await Swal.fire({
          text: message,
          html: options.html,
          showCancelButton: true,
          confirmButtonColor: '#f97325',
          cancelButtonColor: '#c92d0e',
        });
        break;

    case 'alert' :
    default :
        Swal.fire({
          icon: options.status,
          html: options.html,
          text: message,
          confirmButtonColor: '#ee502f'
        });
  }
}