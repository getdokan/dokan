/**
 * This file is created to the unnecessery files.
 * For ex: webpack creates a simple.js file simple.less file and also for every less files.
 * if any specific file is needed to delete the file dir can be added and file will be delete when run the below code.
 */
const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');

const buidJsFiles = [
  'admin.js',
  'dokan-admin-product-style.js',
  'dokan-product-category-ui.js',
  'global-admin.js',
  'plugin.js',
  'reverse-withdrawal-style.js',
  'rtl.js',
  'setup.js',
  'setup-no-wc-style.js',
  'style.js',
];

console.log( chalk.bgYellowBright.black('🧹Removing useless .js files same named as .less files.') );

buidJsFiles.forEach( jsFile => {
  const jsFileDir = path.resolve(`assets/js/${jsFile}`);

  fs.remove( jsFileDir, ( error ) => {
    if ( error ) {
      console.log( chalk.red(error) );
    } else {
      console.log( chalk.green( `🗑️Removed: assets/js/${jsFile}` ) );
    }
  } );
} );
