/**
 * This file cleans and removes everything that is in production build directory.
 *
 * @since DOKAN_SINCE
 */
const fs = require( 'fs-extra' );
const dir = 'build/';
const chalk = require( 'chalk' );

// Removing old files.
fs.remove( dir, ( error ) => {
    if ( error ) {
        console.log( error );
    } else {
        console.log(
            chalk.greenBright(
                `✅  Cleaned dokan-lite production directory - ${ dir }.`
            )
        );
    }
} );
