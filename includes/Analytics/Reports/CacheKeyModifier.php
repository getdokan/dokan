<?php

namespace WeDevs\Dokan\Analytics\Reports;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Seller analytics data filter.
 *
 * @since 3.14.7
 */
class CacheKeyModifier implements Hookable {
    /**
     * Setup analytics entities
     *
     * @since 3.14.7
     *
     * WC apply filters from @see https://github.com/woocommerce/woocommerce/blob/be602de39d39878085e752f30ec1dabf16b0d642/plugins/woocommerce/src/Admin/API/Reports/GenericQuery.php#L77
     * WC reports generation pattern @see https://github.com/woocommerce/woocommerce/blob/be602de39d39878085e752f30ec1dabf16b0d642/plugins/woocommerce/src/Admin/API/Reports/Products/Controller.php#L53
     *
     * @return array
     */
    protected function get_entities(): array {
        return apply_filters(
            'dokan_analytics_entities_for_query_args',
            [
                'categories',
                'coupons',
                'coupons_stats',
                'customers',
                'downloads',
                'downloads_stats',
                'orders',
                'orders_stats',
                'products',
                'products_stats',
                'revenue',
                'taxes',
                'taxes_stats',
                'variations',
                'variations_stats',
			]
        );
    }

    /**
     * Register necessary hooks.
     *
     * @since 3.14.7
     *
     * @return void
     */
    public function register_hooks(): void {
        foreach ( $this->get_entities() as $entity ) {
            add_filter( "woocommerce_analytics_{$entity}_query_args", [ $this, 'apply_seller_filter' ] );
        }
    }

    /**
     * Apply seller filter to query arguments.
     *
     * Customize the WooCommerce analytics stats datastore to override the $total_query and $interval_query properties.
     * This modification replaces the Automattic\WooCommerce\Admin\API\Reports\SqlQuery class with WeDevs\Dokan\Analytics\Reports\WcSqlQuery
     * to apply specific filters to queries.
     *
     * @see https://github.com/woocommerce/woocommerce/tree/trunk/plugins/woocommerce/src/Admin/API/Reports
     *
     * @param array $args An array of query arguments.
     *
     * @return array Modified array of query arguments.
     */
    public function apply_seller_filter( array $args ): array {
        $seller_id = (int) dokan()->get_container()->get( \WeDevs\Dokan\Analytics\Reports\Stock\QueryFilter::class )->get_vendor_id();

        // If seller ID is not set, return the original arguments.
        if ( ! $this->is_valid_seller_id( $seller_id ) ) {
            return $args;
        }

        $args['seller_id'] = $seller_id;
        return $args;
    }

    /**
     * Check if report can be filtered.
     *
     * @param int $seller_id Seller ID.
     *
     * @since 3.14.7
     *
     * @return bool
     */
    protected function is_valid_seller_id( int $seller_id ): bool {
        return $seller_id > 0;
    }
}
