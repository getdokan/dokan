/**
 * This file is created to delete the unnecessery files.
 * For ex: webpack creates a simple.js file for simple.less file and also creates a js file for every single less files and we don't need the js file like simple.js file.
 * if any specific file is needed to delete the file dir can be added and file will be deleted when run the below code.
 *
 * @since DOKAN_SINCE
 */
const fs = require( 'fs-extra' );
const chalk = require( 'chalk' );
const path = require( 'path' );

// Files directories.
const targetFiles = [
    'assets/js/admin.js',
    'assets/js/dokan-admin-product-style.js',
    'assets/js/dokan-product-category-ui.js',
    'assets/js/global-admin.js',
    'assets/js/plugin.js',
    'assets/js/reverse-withdrawal-style.js',
    'assets/js/rtl.js',
    'assets/js/setup.js',
    'assets/js/setup-no-wc-style.js',
    'assets/js/style.js',
    'assets/js/dokan-tailwind.js',

    'assets/js/dokan-promo-notice.js.LICENSE.txt',
    'assets/js/vue-admin.js.LICENSE.txt',
    'assets/js/vue-bootstrap.js.LICENSE.txt',
    'assets/js/vue-frontend.js.LICENSE.txt',
    'assets/js/vue-vendor.js.LICENSE.txt',

    'assets/css/style.css.map',
    'assets/css/vue-admin.css.map',
    'assets/css/vue-bootstrap.css.map',
    'assets/css/vue-frontend.css.map',
    'assets/css/vue-vendor.css.map',
];

console.log(
    chalk.bgYellowBright.black(
        '🧹Removing files that are unnecessery for production build in dokan-lite.'
    )
);

targetFiles.forEach( ( file ) => {
    const fileDir = path.resolve( file );

    fs.remove( fileDir, ( error ) => {
        if ( error ) {
            console.log( chalk.red( error ) );
        } else {
            console.log( chalk.greenBright( `🗑️Removed: ${ file }` ) );
        }
    } );
} );
