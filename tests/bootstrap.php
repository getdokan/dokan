<?php

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( !$_tests_dir ) {
    $_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

if ( !file_exists( $_tests_dir . '/includes/functions.php' ) ) {
    echo "Could not find $_tests_dir/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    exit( 1 );
}

// Give access to tests_add_filter() function.
require_once $_tests_dir . '/includes/functions.php';

define( 'TEST_WC_DIR', __DIR__ . '/../../woocommerce' );
define( 'TEST_DOKAN_DIR', dirname( __DIR__ ) );

function _manually_load_plugin() {
    define( 'WC_TAX_ROUNDING_MODE', 'auto' );
    define( 'WC_USE_TRANSACTIONS', false );

    require TEST_WC_DIR . '/woocommerce.php';
    require TEST_DOKAN_DIR . '/dokan.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

function install_wc() {
    // clean existing install first

    define( 'WP_UNINSTALL_PLUGIN', true );
    define( 'WC_REMOVE_ALL_DATA', true );

    include TEST_WC_DIR . '/uninstall.php';

    WC_Install::install();

    // Initialize the WC API extensions.
    \Automattic\WooCommerce\Admin\Install::create_tables();
    \Automattic\WooCommerce\Admin\Install::create_events();

    // Reload capabilities after install, see https://core.trac.wordpress.org/ticket/28374.
    if ( version_compare( $GLOBALS['wp_version'], '4.7', '<' ) ) {
        $GLOBALS['wp_roles']->reinit();
    } else {
        $GLOBALS['wp_roles'] = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
        wp_roles();
    }

    echo esc_html( 'Installing WooCommerce...' . PHP_EOL );
}

/**
 * Placeholder for activation function
 *
 * Nothing being called here yet.
 */
function install_dokan() {
    echo 'Installing Dokan...' . PHP_EOL;

    dokan()->activate();
}

// install WC
tests_add_filter( 'setup_theme', 'install_wc' );
tests_add_filter( 'setup_theme', 'install_dokan' );

require __DIR__ . '/helpers/helper.php';

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';
