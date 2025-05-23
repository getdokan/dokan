const fs = require( 'fs-extra' );
const replace = require( 'replace-in-file' );

const pluginFiles = [
    'assets/src/**/*',
    'includes/**/*',
    'templates/**/*',
    'src/**/*',
    'dokan.php',
    'dokan-class.php',
    'uninstall.php',
];

const { version } = JSON.parse( fs.readFileSync( 'package.json' ) );

replace( {
    files: pluginFiles,
    from: [ /DOKAN_SINCE/g, /DOKAN_PRO_SINCE/g ],
    to: version,
} );
