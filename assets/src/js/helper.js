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
 * @param object args
 * 
 * @return void | bool
 */
 async function dokan_sweet_alert( args ) {
  switch( args.action ) {
    case 'alert' :
        Swal.fire({
          icon: args.status,
          text: args.message,
          confirmButtonColor: '#ee502f',
          });
        break;
    
    case 'confirm' : 
        return await Swal.fire({
          text: args.message,
          showCancelButton: true,
          confirmButtonColor: '#f97325',
          cancelButtonColor: '#c92d0e',
          });
          
    default : 
        Swal.fire({
          icon: args.status,
          text: args.message,
          confirmButtonColor: '#ee502f',
          });
  }
}