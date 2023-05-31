/**
 * This file cleans and removes everything that is in production build directory.
 */
const fs = require('fs-extra');
const dir = 'build/';
const chalk = require('chalk');

// Removing old files.
fs.remove( dir, ( error ) => {
  if ( error ) {
    console.log( error );
  } else {
    console.log( chalk.greenBright(`🗑️Deleted the production directory - ${dir}.`) );
  }
} );
