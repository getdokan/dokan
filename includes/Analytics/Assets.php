<?php

namespace WeDevs\Dokan\Analytics;

use Automattic\WooCommerce\Internal\Admin\WCAdminAssets;
use WeDevs\Dokan\Contracts\Hookable;
use WP_REST_Request;

class Assets implements Hookable {
	public function register_hooks(): void {
		add_action( 'wp_enqueue_scripts', [ $this, 'register_all_scripts' ], 8 );

		if ( ! is_admin() ) {
			add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_front_scripts' ] );
		}

		add_filter(
            'woocommerce_rest_check_permissions', function ( $permission, $context, $int_val, $object ) {
				if ( ! $permission && in_array( $object, [ 'reports', 'settings' ] ) && $context === 'read' ) {
					$current_user_id = dokan_get_current_user_id();
					$permission = dokan_is_user_seller( $current_user_id );
				}

				return $permission;
			}, 20, 4
		);
		add_filter( 'dokan_dashboard_nav_submenu', [ $this, 'add_report_submenu' ], 10, 2 );

		// Dummy hook for testing.
		add_action( 'dokan_dashboard_content_inside_before', [ $this, 'add_dashboard_content' ] );

		add_filter( 'woocommerce_rest_product_object_query', [ $this, 'product_query_args' ], 10, 2 );

		add_filter( 'woocommerce_admin_shared_settings', [ $this, 'localize_wc_admin_settings' ] );
	}

	/**
	 * Localize WC admin settings.
	 *
	 * @param array $settings
	 * @return array
	 */
	public function localize_wc_admin_settings( $settings ) {
		$preload_data_endpoints = apply_filters( 'woocommerce_component_settings_preload_endpoints', array() );
		$preload_data = [];

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
	 * Filter product query by the Vendor.
	 *
	 * @param array $args
	 * @return array
	 */
	public function product_query_args( array $args, WP_REST_Request $request ) {
		if (
			! is_user_logged_in()
			|| ! is_admin()
			|| current_user_can( 'manage_woocommerce' )
			|| '/wc-analytics/products' !== $request->get_route()
		) {
			return $args;
		}

		$args['author'] = get_current_user_id();

		return $args;
	}

	// This is dummy function for testing.
	public function add_dashboard_content() {
		echo '<div id="dokan-analytics-test">hello</div>';
	}

	/**
	 * Adds a new order menu item to the Dokan dashboard navigation.
	 *
	 * @param array  $submenu_items Existing submenu items.
	 * @param string $nav_key       Navigation key.
	 *
	 * @return array Modified submenu items.
	 * @since DOKAN_PRO_SINCE
	 */
	public function add_report_submenu( array $submenu_items, string $nav_key ): array {
		$parent_menu = 'dashboard';

		if ( $parent_menu === $nav_key && dokan_is_seller_enabled( dokan_get_current_user_id() ) ) {
			$submenu_items['report_overview'] = [
				'title'      => __( 'Overview', 'dokan-lite' ),
				// 'icon'       => '<i class="far fa-credit-card"></i>',
				'url'        => dokan_get_navigation_url( $parent_menu ) . '?path=%2Fanalytics%2FOverview',
				'pos'        => 50,
				'permission' => 'dokan_view_store_payment_menu',

			];
			$submenu_items['report_products'] = [
				'title'      => __( 'Products', 'dokan-lite' ),
				// 'icon'       => '<i class="far fa-credit-card"></i>',
				'url'        => dokan_get_navigation_url( $parent_menu ) . '?path=%2Fanalytics%2Fproducts',
				'pos'        => 50,
				'permission' => 'dokan_view_store_payment_menu',

			];
			$submenu_items['report_revenue'] = [
				'title'      => __( 'Revenue', 'dokan-lite' ),
				// 'icon'       => '<i class="far fa-credit-card"></i>',
				'url'        => dokan_get_navigation_url( $parent_menu ) . '?path=%2Fanalytics%2Frevenue',
				'pos'        => 50,
				'permission' => 'dokan_view_store_payment_menu',

			];

			$submenu_items['report_orders'] = [
				'title'      => __( 'Orders', 'dokan-lite' ),
				// 'icon'       => '<i class="far fa-credit-card"></i>',
				'url'        => dokan_get_navigation_url( $parent_menu ) . '?path=%2Fanalytics%2Forders',
				'pos'        => 50,
				'permission' => 'dokan_view_store_payment_menu',
			];

			$submenu_items['report_variations'] = [
				'title'      => __( 'Variations', 'dokan-lite' ),
				// 'icon'       => '<i class="far fa-credit-card"></i>',
				'url'        => dokan_get_navigation_url( $parent_menu ) . '?path=%2Fanalytics%2Fvariations',
				'pos'        => 50,
				'permission' => 'dokan_view_store_payment_menu',
			];

			$submenu_items['report_categories'] = [
				'title'      => __( 'Categories', 'dokan-lite' ),
				// 'icon'       => '<i class="far fa-credit-card"></i>',
				'url'        => dokan_get_navigation_url( $parent_menu ) . '?path=%2Fanalytics%2Fcategories',
				'pos'        => 50,
				'permission' => 'dokan_view_store_payment_menu',
			];

			$submenu_items['report_stock'] = [
				'title'      => __( 'Stock', 'dokan-lite' ),
				// 'icon'       => '<i class="far fa-credit-card"></i>',
				'url'        => dokan_get_navigation_url( $parent_menu ) . '?path=%2Fanalytics%2Fstock',
				'pos'        => 50,
				'permission' => 'dokan_view_store_payment_menu',
			];
		}

		return $submenu_items;
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
				'seller_id' => dokan_get_current_user_id(),
				'orderListPageUlr' => dokan_get_navigation_url( 'orders' ),
			]
		);
		wp_enqueue_style( 'vendor_analytics_style' );
	}
}
