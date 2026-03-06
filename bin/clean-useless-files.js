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
    'assets/js/admin.js',
    'assets/js/dokan-admin-commission-suborder-metabox.js',
    'assets/js/dokan-admin-product-style.js',
    'assets/js/dokan-product-category-ui.js',
    'assets/js/dokan-tailwind.js',
    'assets/js/dokan-vue-vendor.js',
    'assets/js/global-admin.js',
    'assets/js/plugin.js',
    'assets/js/reverse-withdrawal-style.js',
    'assets/js/rtl.js',
    'assets/js/setup.js',
    'assets/js/setup-no-wc-style.js',
    'assets/js/style.js',

    // Redundant CSS/RTL files in assets/js/ (already exist in assets/css/)
    'assets/js/admin.css',
    'assets/js/admin-rtl.css',
    'assets/js/components.css',
    'assets/js/components-rtl.css',
    'assets/js/dokan-admin-commission-suborder-metabox.css',
    'assets/js/dokan-admin-commission-suborder-metabox-rtl.css',
    'assets/js/dokan-admin-dashboard.css',
    'assets/js/dokan-admin-dashboard-rtl.css',
    'assets/js/dokan-admin-onboard.css',
    'assets/js/dokan-admin-onboard-rtl.css',
    'assets/js/dokan-admin-product-style.css',
    'assets/js/dokan-admin-product-style-rtl.css',
    'assets/js/dokan-pro-features.css',
    'assets/js/dokan-pro-features-rtl.css',
    'assets/js/dokan-product-category-ui.css',
    'assets/js/dokan-product-category-ui-rtl.css',
    'assets/js/dokan-setup-wizard-commission.css',
    'assets/js/dokan-setup-wizard-commission-rtl.css',
    'assets/js/dokan-tailwind.css',
    'assets/js/dokan-tailwind-rtl.css',
    'assets/js/dokan-vue-vendor.css',
    'assets/js/dokan-vue-vendor-rtl.css',
    'assets/js/frontend.css',
    'assets/js/frontend-rtl.css',
    'assets/js/global-admin.css',
    'assets/js/global-admin-rtl.css',
    'assets/js/plugin.css',
    'assets/js/plugin-rtl.css',
    'assets/js/reverse-withdrawal-style.css',
    'assets/js/reverse-withdrawal-style-rtl.css',
    'assets/js/rtl.css',
    'assets/js/rtl-rtl.css',
    'assets/js/setup.css',
    'assets/js/setup-rtl.css',
    'assets/js/setup-no-wc-style.css',
    'assets/js/setup-no-wc-style-rtl.css',
    'assets/js/style.css',
    'assets/js/style-rtl.css',
    'assets/js/vue-admin.css',
    'assets/js/vue-admin-rtl.css',
    'assets/js/vue-bootstrap.css',
    'assets/js/vue-bootstrap-rtl.css',

    // LICENSE.txt files
    'assets/js/8139.js.LICENSE.txt',
    'assets/js/components.js.LICENSE.txt',
    'assets/js/dokan-admin-dashboard.js.LICENSE.txt',
    'assets/js/dokan-admin-notice.js.LICENSE.txt',
    'assets/js/dokan-admin-onboard.js.LICENSE.txt',
    'assets/js/dokan-admin-panel-header.js.LICENSE.txt',
    'assets/js/dokan-intelligence.js.LICENSE.txt',
    'assets/js/dokan-pro-features.js.LICENSE.txt',
    'assets/js/dokan-promo-notice.js.LICENSE.txt',
    'assets/js/frontend.js.LICENSE.txt',
    'assets/js/setup-guide-banner.js.LICENSE.txt',
    'assets/js/utilities.js.LICENSE.txt',
    'assets/js/vue-admin.js.LICENSE.txt',
    'assets/js/vue-bootstrap.js.LICENSE.txt',
    'assets/js/vue-frontend.js.LICENSE.txt',
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
