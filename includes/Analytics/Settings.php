<?php

namespace WeDevs\Dokan\Analytics;

use Exception;
use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Utilities\ReportUtil;

/**
 * Load the settings for the vendor analytics reports.
 */
class Settings implements Hookable {
    /**
     * @inheritDoc
     */
    public function register_hooks(): void {
        add_filter( 'dokan_analytics_reports_settings', [ $this,  'get_settings' ] );
    }

    /**
     * Get the analytics settings for the vendor dashboard.
     *
     * @param array $settings
     * @return array
     */
    public function get_settings( array $settings ): array {
        $settings['vendorBalance']      = dokan_get_seller_balance( dokan_get_current_user_id() );
        $settings['stockStatuses']      = wc_get_product_stock_status_options();
        $settings['isAnalyticsEnabled'] = ReportUtil::is_analytics_enabled();
        $settings['lastDayOfTheMonth']  = dokan_current_datetime()->format( 'Y-m-d' );
        $settings['firstDayOfTheMonth'] = dokan_current_datetime()->modify( 'first day of this month' )->format( 'Y-m-d' );
        $settings = array_merge( $settings, $this->load_data_endpoints() );

        return $settings;
    }

    /**
     * Get the analytics data endpoints.
     *
     * @return array
     */
    protected function load_data_endpoints(): array {
        $preload_data = [];
        $settings = [];

        /**
         * Wrapped with the try-catch since the WooCommerce may update their source code at any time.
         */
        try {
			$analytics_instances = \Automattic\WooCommerce\Internal\Admin\Analytics::get_instance();

			/**
			 * WooCommerce Source @see https://github.com/woocommerce/woocommerce/blob/17bf0b56214cf69ca01117193c591e904b19d97b/plugins/woocommerce/src/Internal/Admin/Settings.php#L154-L159
			 */
			$preload_data_endpoints = apply_filters( 'woocommerce_component_settings_preload_endpoints', $analytics_instances->add_preload_endpoints( [] ) );

			if ( ! empty( $preload_data_endpoints ) ) {
				$preload_data = array_reduce(
                    array_values( $preload_data_endpoints ),
                    'rest_preload_api_request'
				);
			}

			/**
			 * WooCommerce Source @see https://github.com/woocommerce/woocommerce/blob/17bf0b56214cf69ca01117193c591e904b19d97b/plugins/woocommerce/src/Internal/Admin/Settings.php#L226-L238
			 */
			if ( ! empty( $preload_data_endpoints ) ) {
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
		} catch ( Exception $exp ) {
            dokan_log( 'Dokan Vendor analytics dataEndpoints error:' . $exp->getMessage() );
        }

        return $settings;
    }
}
