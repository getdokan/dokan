<?php
namespace WeDevs\Dokan\Utilities;

use Automattic\WooCommerce\Internal\Admin\Analytics;

/**
 * ReportUtil class
 *
 * @since DOKAN_SINCE
 */
class ReportUtil {

    /**
     * Check if analytics is enabled for the current seller.
     *
     * This checks if the seller is enabled and the analytics toggle option is set to "yes".
     *
     * @since DOKAN_SINCE
     *
     * @return bool True if analytics is enabled, false otherwise.
     */
    public static function dokan_is_analytics_enabled(): bool {
        $is_seller_enabled    = dokan_is_seller_enabled( dokan_get_current_user_id() );
        $is_analytics_enabled = 'yes' === get_option( Analytics::TOGGLE_OPTION_NAME, 'no' );

        /**
         * Filter to modify the analytics enabled status for the current seller.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $is_enabled Whether analytics is enabled for the current seller.
         */
        return apply_filters( 'dokan_is_analytics_enabled', ( $is_seller_enabled && $is_analytics_enabled ) );
    }
}
