<?php

namespace WeDevs\Dokan\Analytics\Reports;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Seller analytics data filter.
 *
 * @since DOKAN_SINCE
 */
class SellerDataModifier implements Hookable {

    /**
     * Report entities to modify.
     *
     * @since DOKAN_SINCE
     *
     * @var array
     */
    protected array $entities;

    /**
     * SellerDataModifier constructor.
     * Registers the hooks on instantiation.
     */
    public function __construct() {
        $this->setup_entities();
        $this->register_hooks();
    }

    /**
     * Setup analytics entities
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function setup_entities(): void {
        $this->entities = [
            'categories',
            'coupons',
            'coupons_stats',
            'customers',
            'customers_stats',
            'downloads',
            'downloads_stats',
            'orders',
            'orders_stats',
            'products',
            'products_stats',
            'revenue',
            'stock',
            'taxes',
            'taxes_stats',
            'variations',
            'variations_stats',
        ];
    }

    /**
     * Register necessary hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        foreach ( $this->entities as $entity ) {
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
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    protected function is_valid_seller_id( int $seller_id ): bool {
        return $seller_id > 0;
    }
}
