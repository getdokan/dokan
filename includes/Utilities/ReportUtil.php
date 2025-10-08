<?php
namespace WeDevs\Dokan\Utilities;

use Automattic\WooCommerce\Internal\Admin\Analytics;

/**
 * ReportUtil class
 *
 * @since 4.0.0
 */
class ReportUtil {

    /**
     * Check if analytics is enabled for the current seller.
     *
     * This checks if the seller is enabled and the analytics toggle option is set to "yes".
     *
     * @since 4.0.0
     *
     * @return bool True if analytics is enabled, false otherwise.
     */
    public static function is_analytics_enabled(): bool {
        $is_analytics_enabled = 'yes' === get_option( Analytics::TOGGLE_OPTION_NAME, 'no' );

        /**
         * Filter to modify the analytics enabled status for the current seller.
         *
         * @since 4.0.0
         *
         * @param bool $is_enabled Whether analytics is enabled for the current seller.
         */
        return apply_filters( 'dokan_is_analytics_enabled', $is_analytics_enabled );
    }

    /**
     * Check if product listing is belongs to Report menu
     *
     * @since 4.0.0
     *
     * @return bool
     */
    public static function is_report_products_url(): bool {

        $path = isset( $_GET['path'] ) ? sanitize_text_field( wp_unslash( $_GET['path'] ) ) : ''; // phpcs:ignore

        $should_render = $path === '/analytics/products';

        /**
         * Filter to control product listing template rendering.
         *
         * @since 4.0.0
         *
         * @param bool $should_render Whether to render the product listing template.
         */
        return apply_filters( 'dokan_is_report_products_url', $should_render );
    }


    /**
     * Get the excluded order statuses for analytics.
     *
     * @since 4.1.0
     *
     * @return array List of excluded order statuses.
     */
    public static function get_exclude_order_statuses(): array {
        $excluded_statuses = \WC_Admin_Settings::get_option( 'woocommerce_excluded_report_order_statuses', [ 'pending', 'failed', 'cancelled' ] );
        $excluded_statuses = array_merge(
            [ 'auto-draft', 'trash' ],
            array_map( 'esc_sql', $excluded_statuses )
        );
        $excluded_statuses = apply_filters( 'woocommerce_analytics_excluded_order_statuses', $excluded_statuses );

        return apply_filters(
            'dokan_analytics_excluded_order_statuses',
            array_map(
                function ( $status ) {
                    return 'wc-' . trim( $status );
                }, $excluded_statuses
            )
        );
    }
}
