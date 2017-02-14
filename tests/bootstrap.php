<?php

$_tests_dir = getenv('WP_TESTS_DIR');
if ( !$_tests_dir ) $_tests_dir = '/tmp/wordpress-tests-lib';

require_once $_tests_dir . '/includes/functions.php';

define( 'TEST_WC_DIR', dirname( __FILE__ ) . '/../../woocommerce' );
define( 'TEST_DOKAN_DIR', dirname( dirname( __FILE__ ) ) );

function _manually_load_plugin() {
    require TEST_WC_DIR . '/woocommerce.php';
	require TEST_DOKAN_DIR . '/dokan.php';
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

function install_wc() {
    // clean existing install first
    define( 'WP_UNINSTALL_PLUGIN', true );

    include( TEST_WC_DIR . '/uninstall.php' );
    $installer = include( TEST_WC_DIR . '/includes/class-wc-install.php' );
    $installer->install();
    // reload capabilities after install, see https://core.trac.wordpress.org/ticket/28374
    $GLOBALS['wp_roles']->reinit();
    echo "Installing WooCommerce..." . PHP_EOL;
}

/**
 * Placeholder for activation function
 *
 * Nothing being called here yet.
 */
function install_dokan() {
    global $wpdb;

    $wpdb->dokan_withdraw = $wpdb->prefix . 'dokan_withdraw';
    $wpdb->dokan_orders   = $wpdb->prefix . 'dokan_orders';

    require_once TEST_DOKAN_DIR . '/includes/theme-functions.php';

    echo "Installing Dokan..." . PHP_EOL;
    $installer = new Dokan_Installer();
    $installer->do_install();
}

// install WC
tests_add_filter( 'setup_theme', 'install_wc' );
tests_add_filter( 'setup_theme', 'install_dokan' );

require $_tests_dir . '/includes/bootstrap.php';
require dirname( __FILE__ ) . '/helpers/helper.php';

$current_user = new WP_User(1);
$current_user->set_role('administrator');