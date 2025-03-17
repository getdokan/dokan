const fs = require( 'fs-extra' );
const path = require( 'path' );
const { exec } = require( 'child_process' );
const chalk = require( 'Chalk' );
const _ = require( 'lodash' );

const pluginFiles = [
    'assets/',
    'includes/',
    'languages/',
    'templates/',
    'lib/',
    'deprecated/',
    'vendor/',
    'CHANGELOG.md',
    'readme.txt',
    'dokan.php',
    'dokan-class.php',
    'uninstall.php',
    'composer.json',
];

const removeFiles = [ 'assets/src', 'composer.json', 'composer.lock' ];

const allowedVendorFiles = {
    'appsero/client': [ 'src' ],
    'jakeasmith/http_build_url': [ 'src' ],
};

const { version } = JSON.parse( fs.readFileSync( 'package.json' ) );

exec(
    'rm -rf *',
    {
        cwd: 'build',
    },
    ( error ) => {
        if ( error ) {
          console.log(
            chalk.yellow(
              `⚠️ Could not find the build directory.`
            )
          );
          console.log(
            chalk.green(
              `🗂 Creating the build directory ...`
            )
          );
          // Making build folder.
          fs.mkdirp( 'build' );
        }

        const dest = 'build/dokan-lite'; // Temporary folder name after coping all the files here.
        fs.mkdirp( dest );

        console.log( `🗜 Started making the zip ...` );
        try {
          console.log( `⚙️ Copying plugin files ...` );

          // Coping all the files into build folder.
          pluginFiles.forEach( ( file ) => {
              fs.copySync( file, `${ dest }/${ file }` );
          } );
          console.log( `📂 Finished copying files.` );
        } catch ( err ) {
            console.error( chalk.red( '❌ Could not copy plugin files.' ), err );
            return;
        }

        exec(
            'composer install --optimize-autoloader --no-dev',
            {
                cwd: dest
            },
            ( error ) => {
                if ( error ) {
                    console.log(
                        chalk.red(
                            `❌ Could not install composer in ${ dest } directory.`
                        )
                    );
                    console.log( chalk.bgRed.black( error ) );

                    return;
                }

                console.log(
                    `⚡️ Installed composer packages in ${ dest } directory.`
                );

                // Removing files that is not needed in the production now.
                removeFiles.forEach( ( file ) => {
                    fs.removeSync( `${ dest }/${ file }` );
                } );

                Object.keys( allowedVendorFiles ).forEach(
                    ( composerPackage ) => {
                        const packagePath = path.resolve(
                            `${ dest }/vendor/${ composerPackage }`
                        );

                        if ( ! fs.existsSync( packagePath ) ) {
                            return;
                        }

                        const list = fs.readdirSync( packagePath );
                        const deletables = _.difference(
                            list,
                            allowedVendorFiles[ composerPackage ]
                        );

                        deletables.forEach( ( deletable ) => {
                            fs.removeSync(
                                path.resolve( packagePath, deletable )
                            );
                        } );
                    }
                );

                // Output zip file name.
                const zipFile = `dokan-lite-v${ version }.zip`;

                console.log( `📦 Making the zip file ${ zipFile } ...` );

                // Making the zip file here.
                exec(
                    `zip ${ zipFile } dokan-lite -rq`,
                  {
                    cwd: 'build'
                  },
                    ( error ) => {
                        if ( error ) {
                            console.log(
                                chalk.red( `❌ Could not make ${ zipFile }.` )
                            );
                            console.log( chalk.bgRed.black( error ) );

                            return;
                        }

                        fs.removeSync( dest );
                        console.log(
                            chalk.green( `✅  ${ zipFile } is ready. 🎉` )
                        );
                    }
                );
            }
        );
    }
);
