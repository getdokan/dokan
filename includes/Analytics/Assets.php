<?php

namespace WeDevs\Dokan\Analytics;

use Automattic\WooCommerce\Internal\Admin\WCAdminAssets;
use WeDevs\Dokan\Contracts\Hookable;

class Assets implements Hookable {
	public function register_hooks(): void {
		add_action( 'wp_enqueue_scripts', [ $this, 'register_all_scripts' ], 8 );

		if ( ! is_admin() ) {
			add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_front_scripts' ] );
		}
		add_filter( 'woocommerce_admin_shared_settings', [ $this, 'localize_wc_admin_settings' ] );

		( new VendorDashboardManager() )->register_hooks();
        ( new Reports\DataStoreCacheModifier() )->register_hooks();
	}

	/**
	 * Localize WC admin settings.
	 *
	 * @param array $settings
	 * @return array
	 */
	public function localize_wc_admin_settings( $settings ) {
        $settings['stockStatuses'] = wc_get_product_stock_status_options();
        $settings['vendorBalance'] = dokan_get_seller_balance( dokan_get_current_user_id(), 2 );

        $preload_data           = [];
        $preload_data_endpoints = apply_filters( 'woocommerce_component_settings_preload_endpoints', array() );

        if ( ! empty( $preload_data_endpoints ) ) {
			// @see https://github.com/woocommerce/woocommerce/blob/f469bba6f28edd8616b5423755c6559912d47a4a/plugins/woocommerce/src/Internal/Admin/Settings.php#L140-L146
			$preload_data = array_reduce(
				array_values( $preload_data_endpoints ),
				'rest_preload_api_request'
			);
			// @see https://github.com/woocommerce/woocommerce/blob/f469bba6f28edd8616b5423755c6559912d47a4a/plugins/woocommerce/src/Internal/Admin/Settings.php#L215-L225
			$settings['dataEndpoints'] = isset( $settings['dataEndpoints'] )
				? $settings['dataEndpoints']
				: array();
			foreach ( $preload_data_endpoints as $key => $endpoint ) {
				// Handle error case: rest_do_request() doesn't guarantee success.
				if ( empty( $preload_data[ $endpoint ] ) ) {
					$settings['dataEndpoints'][ $key ] = array();
				} else {
					$settings['dataEndpoints'][ $key ] = $preload_data[ $endpoint ]['body'];
				}
			}
		}

		return $settings;
	}

    /**
     * Register all Dokan scripts and styles.
     *
     * @return void
     */
	public function register_all_scripts() {
		$wc_instance = WCAdminAssets::get_instance();
		$wc_instance->register_scripts();

		// $this->register_styles();
		$this->register_scripts();
	}

    /**
     * Register scripts.
     *
     * @param array $scripts
     *
     * @return void
     */
	public function register_scripts() {
		$frontend_script = DOKAN_PLUGIN_ASSEST . '/js/vendor-dashboard/reports/index.js';

		$asset = include DOKAN_DIR . '/assets/js/vendor-dashboard/reports/index.asset.php';

		wp_register_script( 'vendor_analytics_script', $frontend_script, $asset['dependencies'] ?? [], $asset['version'] ?? '', true );

		$dep = array(
			'wc-components',
			'wc-admin-layout',
			'wc-customer-effort-score',
			// 'wc-product-editor',
			'wp-components',
			'wc-experimental',
		);

		$frontend_style = DOKAN_PLUGIN_ASSEST . '/js/vendor-dashboard/reports/index.css';

		wp_register_style( 'vendor_analytics_style', $frontend_style, $dep, $asset['version'] ?? '' );
	}

    /**
     * Enqueue front-end scripts.
     *
     * @return void
     */
	public function enqueue_front_scripts() {
		wp_enqueue_script( 'vendor_analytics_script' );
		wp_localize_script(
            'vendor_analytics_script', 'vendorAnalyticsDokanConfig', [
				'seller_id'        => dokan_get_current_user_id(),
				'orderListPageUlr' => dokan_get_navigation_url( 'orders' ),
			]
		);
        wp_enqueue_style( 'vendor_analytics_style' );
		wp_enqueue_style( 'wc-chunks-9966-style', plugins_url( 'woocommerce/assets/client/admin/chunks/9966.style.css' ), array(), filemtime( WP_PLUGIN_DIR . '/woocommerce/assets/client/admin/chunks/9966.style.css' ) );
	}
}
