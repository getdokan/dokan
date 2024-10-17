<?php

namespace WeDevs\Dokan\Analytics\Reports;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * DataStoreCacheModifier class
 *
 * @since DOKAN_LITE_SINCE
 */
class DataStoreCacheModifier implements Hookable {

    /**
     * Register hooks for modify vendor specific analytics data.
     * This method will be called automatically to register the hooks.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'woocommerce_analytics_products_stats_query_args', [ $this, 'add_query_param' ] );
        add_filter( 'woocommerce_analytics_products_query_args', [ $this, 'add_query_param' ] );
    }

    /**
     * Add seller_id query param to the analytics query.
     *
     * @param array $params
     *
     * @return array
     */
    public function add_query_param( array $params ): array {
        $params['seller_id'] = $_GET['seller_id'] ?? 0; // phpcs:ignore
        return $params;
    }
}
