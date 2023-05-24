const path = require( 'path' );
const { rimraf }  = require( 'rimraf' );
const chalk = require( 'chalk' );

const deleteDirs = [
    'build/',
];

deleteDirs.forEach( ( dir ) => {
    rimraf( path.resolve( dir ), {}, ( error ) => {
        if ( error ) {
            console.log( error );
        } else {
            console.log( chalk.green( `Deleted directory ${dir}.` ) );
        }
    } );
} );
