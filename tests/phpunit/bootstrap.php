<?php
if ( PHP_MAJOR_VERSION >= 8 ) {
    echo "The scaffolded tests cannot currently be run on PHP 8.0+. See https://github.com/wp-cli/scaffold-command/issues/285" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    exit( 1 );
}

// Composer autoloader must be loaded before WP_PHPUNIT__DIR will be available
require_once dirname( dirname( dirname( __FILE__ ) ) ) . '/vendor/autoload.php';
$_tests_dir = getenv( 'WP_TESTS_DIR' ) ?: getenv( 'WP_PHPUNIT__DIR' );

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
    echo "Could not find $_tests_dir/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    exit( 1 );
}

// Give access to tests_add_filter() function.
require_once $_tests_dir . '/includes/functions.php';

define( 'TEST_DOKAN_DIR', dirname( dirname( __DIR__ ) ) );
require __DIR__ . '/helpers/helper.php';

function _manually_load_plugin() {
    require dirname( TEST_DOKAN_DIR ) . '/woocommerce/woocommerce.php';
    require TEST_DOKAN_DIR . '/dokan.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';
