<?php
/**
 * Dokan Feature API Loader
 *
 * @package WeDevs\Dokan\FeatureAPI
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI;

use WeDevs\Dokan\Contracts\Hookable;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Dokan Feature API Loader
 *
 * @since 4.0.0
 */
class Loader implements Hookable {

    /**
     * Constructor
     */
    public function register_hooks(): void {
		add_action( 'init', [ $this, 'register_dokan_features' ], 20 );
    }

    /**
     * Register all Dokan features
     */
    public function register_dokan_features() {
        if ( ! function_exists( 'wp_register_feature' ) ) {
            return;
        }

        // Register withdrawal features
        $withdraw_manager = new Features\Withdraw\WithdrawManager();
        $withdraw_manager->register_features();
		// TODO: Remove this after testing
        return;

        // Register vendor features
        $vendor_manager = new Features\Vendor\VendorManager();
        $vendor_manager->register_features();
        // Register product features
        $product_manager = new Features\Product\ProductManager();
        $product_manager->register_features();

        // Register order features
        $order_manager = new Features\Order\OrderManager();
        $order_manager->register_features();

        // Register commission features
        $commission_manager = new Features\Commission\CommissionManager();
        $commission_manager->register_features();

        // Register store features
        $store_manager = new Features\Store\StoreManager();
        $store_manager->register_features();

        // Register analytics features
        $analytics_manager = new Features\Analytics\AnalyticsManager();
        $analytics_manager->register_features();

        // Register settings features
        $settings_manager = new Features\Settings\SettingsManager();
        $settings_manager->register_features();

        /**
         * Hook for third-party plugins to register additional features
         */
        do_action( 'dokan_feature_api_registered' );

        // Initialize admin page
    }
}
