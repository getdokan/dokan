const fs       = require('fs-extra');
const path     = require('path');
const { exec } = require('child_process');
const util     = require('util');
const chalk    = require('Chalk');
const _        = require('lodash');

const asyncExec = util.promisify( exec );

const pluginFiles = [
  'assets/',
  'includes/',
  'languages/',
  'templates/',
  'lib/',
  'CHANGELOG.md',
  'readme.txt',
  'dokan.php',
  'uninstall.php',
  'vendor/'
];

const removeFiles = [
  'src',
  'assets/src',
  'composer.json',
  'composer.lock',
];

const allowedVendorFiles = {};

const { version } = JSON.parse( fs.readFileSync( 'package.json' ) );

// Removing old files.
fs.removeSync( 'build/*.zip' );

exec(
  'rm -rf versions && rm *.zip',
  {
    cwd: 'build',
  },
  () => {
    const planDir      = `build`; // Production build directory.
    const dest         = `${ planDir }/dokan`; // Temporary folder name after coping all the files here.
    const composerfile = `composer.json`;

    // Removing the old build folder.
    fs.removeSync( planDir );

    console.log( `🗜  Started making the zip...` );

    const fileList = [ ...pluginFiles ];

    // Making build folder.
    fs.mkdirp( dest );

    // Coping all the files into build folder.
    fileList.forEach( ( file ) => {
      fs.copySync( file, `${ dest }/${ file }`);
    } );

    // copy composer.json file
    try {
      if (fs.pathExistsSync(composerfile)) {
        fs.copySync(composerfile, `${dest}/composer.json`);
      } else {
        fs.copySync(`composer.json`, `${dest}/composer.json`);
      }
    } catch (err) {
      console.error(err);
    }

    console.log(`📂 Finished copying files.`);

    asyncExec(
      'composer install --optimize-autoloader --no-dev',
      {
        cwd: dest,
      },
      () => {
        console.log(
          `⚡️ Installed composer packages in ${dest} directory.`
        );

        // Removing files that is not needed in the production now.
        removeFiles.forEach((file) => {
          fs.removeSync(`${dest}/${file}`);
        });

        Object.keys( allowedVendorFiles ).forEach( ( composerPackage ) => {
          const packagePath = path.resolve(
            `${ dest }/vendor/${ composerPackage }`
          );

          if ( !fs.existsSync( packagePath ) ) {
            return;
          }

          const list = fs.readdirSync( packagePath );
          const deletables = _.difference(
            list,
            allowedVendorFiles[ composerPackage ]
          );

          deletables.forEach( ( deletable ) => {
            fs.removeSync( path.resolve( packagePath, deletable ) );
          } );
        } );

        // Output zip file name.
        const zipFile = `dokan-lite-v${ version }.zip`;

        console.log(`📦 Making zip file ${ zipFile }...`);

        // Making the zip file here.
        asyncExec(
          `zip ${ zipFile } dokan -rq`,
          {
            cwd: planDir,
          },
          () => {
            fs.removeSync( dest );
            console.log( chalk.green( `✅ ${zipFile} is ready. 🎉` ) );
          }
        ).catch( ( error ) => {
          console.log( chalk.red( `Could not make ${ zipFile }.`) );
          console.log( error );
        } );
      }
    ).catch( ( error ) => {
      console.log(
        chalk.red( `Could not install composer in ${dest} directory.` )
      );
      console.log( error );
    } );
  }
);
