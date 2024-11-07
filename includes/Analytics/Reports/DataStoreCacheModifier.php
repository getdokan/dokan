<?php

namespace WeDevs\Dokan\Analytics\Reports;

use WeDevs\Dokan\Analytics\Reports\Orders\QueryFilter;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * DataStoreCacheModifier class
 *
 * @since DOKAN_SINCE
 */
class DataStoreCacheModifier implements Hookable {

    /**
     * Register hooks for modify vendor specific analytics data.
     * This method will be called automatically to register the hooks.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'woocommerce_analytics_orders_query_args', [ $this, 'add_query_param' ] );
        add_filter( 'woocommerce_analytics_orders_stats_query_args', [ $this, 'add_query_param' ] );
        add_filter( 'woocommerce_analytics_products_stats_query_args', [ $this, 'add_query_param' ] );
        add_filter( 'woocommerce_analytics_coupons_stats_query_args', [ $this, 'add_query_param' ] );
        add_filter( 'woocommerce_analytics_taxes_stats_query_args', [ $this, 'add_query_param' ] );
        add_filter( 'woocommerce_analytics_variations_stats_query_args', [ $this, 'add_query_param' ] );

        add_filter( 'woocommerce_analytics_products_query_args', [ $this, 'add_query_param' ] );
        add_filter( 'woocommerce_analytics_revenue_stats_query_args', [ $this, 'add_query_param' ] );
        add_filter( 'woocommerce_analytics_revenue_query_args', [ $this, 'add_query_param' ] );
        add_filter( 'woocommerce_analytics_variations_query_args', [ $this, 'add_query_param' ] );
    }

    /**
     * Add seller_id query param to the analytics query.
     *
     * @param array $params
     *
     * @return array
     */
    public function add_query_param( array $params ): array {
        $params['seller_id'] = dokan()->get_container()->get( QueryFilter::class )->get_vendor_id();
        return $params;
    }
}
