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
    public static function is_analytics_enabled(): bool {
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

    /**
     * Check if product listing is belongs to Report menu
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_report_products_url(): bool {

        $path = isset( $_GET['path'] ) ? sanitize_text_field( wp_unslash( $_GET['path'] ) ) : ''; // phpcs:ignore

        $should_render = $path === '/analytics/products';

        /**
         * Filter to control product listing template rendering.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $should_render Whether to render the product listing template.
         */
        return apply_filters( 'dokan_is_report_products_url', $should_render );
    }
}
