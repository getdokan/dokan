const fs = require( 'fs-extra' );
const replace = require( 'replace-in-file' );

const pluginFiles = [
    'assets/src/**/*',
    'deprecated/**/*',
    'includes/**/*',
    'templates/**/*',
    'src/**/*',
    'dokan.php',
    'uninstall.php',
];

const { version } = JSON.parse( fs.readFileSync( 'package.json' ) );

replace( {
    files: pluginFiles,
    from: /DOKAN_SINCE/g,
    to: version,
} );
