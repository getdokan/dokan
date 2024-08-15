<?php

namespace WeDevs\Dokan\Analytics\Reports\Coupons;

use WeDevs\Dokan\Analytics\Reports\BaseQueryFilter;
use WeDevs\Dokan\Analytics\Reports\OrderType;

/**
 * Class QueryFilter
 *
 * Filters and modifies WooCommerce analytics queries for Dokan orders.
 */
class QueryFilter extends BaseQueryFilter {
    /**
     * @var string The context of the query filter.
     */
    protected $context = 'coupons';

    /**
     * Register hooks for filtering WooCommerce analytics queries.
     *
     * @return void
     */
	public function register_hooks(): void {
		add_filter( 'woocommerce_analytics_clauses_join_coupons_subquery', [ $this, 'add_join_subquery' ] );
		add_filter( 'woocommerce_analytics_clauses_where_coupons_subquery', [ $this, 'add_where_subquery' ], 30 );
	}

    /**
     * Since coupon amount is not split among the sub-orders, so we have to consider only the parent order.
     *
     * @return boolean
     */
    public function should_filter_by_seller_id(): bool {
        return false;
    }
}
