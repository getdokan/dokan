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
    // Unnecessary JS files generated from CSS/LESS-only webpack entries
    'assets/js',
    'assets/css',
];

console.log(
    chalk.gray.black(
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
