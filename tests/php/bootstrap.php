<?php

define( 'TEST_DOKAN_PLUGIN_DIR', dirname( __DIR__, 2 ) );
define( 'TEST_WC_DIR', dirname( TEST_DOKAN_PLUGIN_DIR, 1 ) . '/woocommerce' );

// Composer autoloader must be loaded before WP_PHPUNIT__DIR will be available
require_once TEST_DOKAN_PLUGIN_DIR . '/vendor/autoload.php';

$_tests_dir = getenv( 'WP_TESTS_DIR' ) ? getenv( 'WP_TESTS_DIR' ) : getenv( 'WP_PHPUNIT__DIR' );

if ( ! $_tests_dir ) {
    $_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
    echo "Could not find $_tests_dir/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    exit( 1 );
}

function dokan_truncate_table_data(): void {
	$tables = [
		'dokan_withdraw',
		'dokan_orders',
		'dokan_announcement',
		'dokan_refund',
		'dokan_vendor_balance',
		'wc_orders', // WooCommerce HPOS orders table
		'wc_order_addresses', // WooCommerce HPOS addresses table
		'wc_order_operational_data', // WooCommerce HPOS operational data table
    ];
    global $wpdb;
    foreach ( $tables as $table_name ) {
		$table_exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->prefix . $table_name ) );
		if ( $table_exists ) {
			$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}{$table_name}" );
		}
    }
}

// Give access to tests_add_filter() function.
require_once $_tests_dir . '/includes/functions.php';

// Enable WooCommerce HPOS for tests
tests_add_filter(
    'muplugins_loaded', function () {
		// Enable WooCommerce HPOS feature
		add_filter(
            'woocommerce_feature_enabled', function ( $enabled, $feature ) {
				if ( 'custom_order_tables' === $feature ) {
					return true;
				}
				return $enabled;
			}, 10, 2
		);

		// Enable WooCommerce order data sync
		add_filter( 'pre_option_woocommerce_custom_orders_table_enabled', '__return_true' );
		add_filter( 'pre_option_woocommerce_custom_orders_table_data_sync_enabled', '__return_true' );
	}, 1
);

function _manually_load_plugin() {
	define( 'WC_TAX_ROUNDING_MODE', 'auto' );
	define( 'WC_USE_TRANSACTIONS', false );

	require TEST_WC_DIR . '/woocommerce.php';
	require TEST_DOKAN_PLUGIN_DIR . '/dokan.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

function install_wc() {
	define( 'WP_UNINSTALL_PLUGIN', true );
	define( 'WC_REMOVE_ALL_DATA', true );

	include TEST_WC_DIR . '/uninstall.php';

	WC_Install::install();

	// Enable HPOS and create custom order tables
	update_option( 'woocommerce_custom_orders_table_enabled', 'yes' );
	update_option( 'woocommerce_custom_orders_table_data_sync_enabled', 'yes' );

	// Create all WooCommerce database tables including HPOS
	WC_Install::create_tables();

	// Create HPOS tables specifically
	if ( class_exists( 'Automattic\WooCommerce\Internal\DataStores\Orders\CustomOrdersTableController' ) ) {
		$controller = wc_get_container()->get( 'Automattic\WooCommerce\Internal\DataStores\Orders\CustomOrdersTableController' );
		if ( method_exists( $controller, 'create_database_tables' ) ) {
			$controller->create_database_tables();
		}
	}

	// Create WooCommerce Analytics tables
	if ( class_exists( 'Automattic\WooCommerce\Admin\Install' ) ) {
		\Automattic\WooCommerce\Admin\Install::create_tables();
	}

	// WC()->init();

	// Reload capabilities after install, see https://core.trac.wordpress.org/ticket/28374.
	if ( version_compare( $GLOBALS['wp_version'], '4.7', '<' ) ) {
		$GLOBALS['wp_roles']->reinit();
	} else {
		$GLOBALS['wp_roles'] = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		wp_roles();
	}

	echo esc_html( 'Installing WooCommerce with HPOS enabled...' . PHP_EOL );
}

/**
 * Placeholder for activation function
 *
 * Nothing being called here yet.
 */
function install_dokan() {
	echo 'Installing Dokan...' . PHP_EOL;
    dokan_truncate_table_data();

	dokan()->activate();
}

// install WC
tests_add_filter( 'setup_theme', 'install_wc' );
tests_add_filter( 'setup_theme', 'install_dokan' );

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';
