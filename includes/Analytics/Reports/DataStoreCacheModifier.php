<?php

namespace WeDevs\Dokan\Analytics\Reports;

use WeDevs\Dokan\Analytics\Reports\Orders\QueryFilter;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * DataStoreCacheModifier class
 *
 * @since 4.0.0
 */
class DataStoreCacheModifier implements Hookable {

    /**
     * Setup analytics entities
     *
     * @since 4.0.0
     *
     * @return array
     */
    protected function get_entities(): array {
        return apply_filters(
            'dokan_analytics_datastore_entities',
            [
                'orders',
                'orders_stats',
                'products_stats',
                'coupons_stats',
                'taxes_stats',
                'variations_stats',
                'products',
                'revenue_stats',
                'revenue',
                'variations',
            ]
        );
    }

    /**
     * Register hooks for modify vendor specific analytics data.
     * This method will be called automatically to register the hooks.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function register_hooks(): void {
        foreach ( $this->get_entities() as $entity ) {
            add_filter( "woocommerce_analytics_{$entity}_query_args", [ $this, 'add_query_param' ] );
        }
    }

    /**
     * Add seller_id query param to the analytics query.
     *
     * @param array $params
     *
     * @return array
     */
    public function add_query_param( array $params ): array {
        $seller_id = (int) dokan()->get_container()->get( QueryFilter::class )->get_vendor_id();

        // If seller ID is not set, return the original params.
        if ( ! $this->is_valid_seller_id( $seller_id ) ) {
            return $params;
        }

        $params['seller_id'] = $seller_id;
        return $params;
    }

    /**
     * Check if report can be filtered.
     *
     * @param int $seller_id Seller ID.
     *
     * @since 4.0.0
     *
     * @return bool
     */
    protected function is_valid_seller_id( int $seller_id ): bool {
        return $seller_id > 0;
    }
}
