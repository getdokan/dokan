<?php

namespace WeDevs\Dokan\Analytics;

use Automattic\WooCommerce\Internal\Admin\WCAdminAssets;
use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Utilities\ReportUtil;

class Assets implements Hookable {
	public function register_hooks(): void {
        if ( ! ReportUtil::is_analytics_enabled() ) {
            return;
        }

		add_action( 'init', [ $this, 'register_all_scripts' ] );

        if ( ! is_admin() ) {
            add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_front_scripts' ] );
        }
	}

	/**
	 * Localize the data following the similar data structure of the WC admin settings.
	 *
	 * @param array $settings
	 * @return array
	 */
	protected function localize_wc_admin_settings( $settings = [] ) {
        return apply_filters( 'dokan_analytics_reports_settings', [] );
	}

    /**
     * Register all Dokan scripts and styles.
     *
     * @return void
     */
	public function register_all_scripts() {
        if ( is_admin() ) {
            return;
        }

        // Register WooCommerce Admin Assets for the React-base Dokan Vendor ler dashboard.
        if ( ! function_exists( 'get_current_screen' ) ) {
            require_once ABSPATH . '/wp-admin/includes/screen.php';
        }

        add_filter( 'doing_it_wrong_trigger_error', [ $this, 'disable_doing_it_wrong_error' ] );

        $wc_instance = WCAdminAssets::get_instance();
		$wc_instance->register_scripts();

        remove_filter( 'doing_it_wrong_trigger_error', [ $this, 'disable_doing_it_wrong_error' ] );

        // $this->register_styles();
		$this->register_scripts();
	}

    /**
     * Disable "doing it wrong" error
     *
     * @return bool
     */
    public function disable_doing_it_wrong_error() {
        return false;
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

		$asset            = include DOKAN_DIR . '/assets/js/vendor-dashboard/reports/index.asset.php';
        $dependencies     = $asset['dependencies'] ?? [];
        $component_handle = 'dokan-react-components';
        $version          = $asset['version'] ?? '';
        $dependencies[]   = $component_handle;

		wp_register_script(
            'vendor_analytics_script',
            $frontend_script,
            $dependencies,
            $version,
            true
        );

		$dep = array(
			'wc-components',
			'wc-admin-layout',
			'wc-customer-effort-score',
			// 'wc-product-editor',
			'wp-components',
			'wc-experimental',
            $component_handle,
            'dokan-react-frontend',
		);

		$frontend_style = DOKAN_PLUGIN_ASSEST . '/js/vendor-dashboard/reports/index.css';

		wp_register_style(
            'vendor_analytics_style',
            $frontend_style,
            $dep,
            $version
        );
	}

    /**
     * Enqueue front-end scripts.
     *
     * @return void
     */
	public function enqueue_front_scripts() {
        if ( ! dokan_is_seller_dashboard() ) {
            return;
        }

        wp_enqueue_script( 'vendor_analytics_script' );
        wp_enqueue_style( 'vendor_analytics_style' );

		wp_add_inline_script(
            'vendor_analytics_script', 'var vendorAnalyticsDokanConfig = ' . wp_json_encode(
                [
                    'seller_id'          => dokan_get_current_user_id(),
                    'orderListPageUlr'   => dokan_get_navigation_url( 'orders' ),
                    'vendorAnalyticsUrl' => dokan_get_navigation_url( 'analytics' ),
                    'dashboardPath' => wp_parse_url( dokan_get_navigation_url(), PHP_URL_PATH ),
                    'reportsPath'   => wp_parse_url( dokan_get_navigation_url( 'reports' ), PHP_URL_PATH ),
                ]
            ), 'before'
        );

		wp_add_inline_script(
            'vendor_analytics_script',
            'var vendorSharedSettings = ' . wp_json_encode( $this->localize_wc_admin_settings() ),
            'before'
		);
	}
}
