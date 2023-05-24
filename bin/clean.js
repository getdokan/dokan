const fs = require('fs-extra');
const dir = 'build/';
// Removing old files.
fs.remove( dir, ( error ) => {
  if ( error ) {
    console.log( error );
  } else {
    console.log( `Deleted the production directory - ${dir}.` );
  }
} );
