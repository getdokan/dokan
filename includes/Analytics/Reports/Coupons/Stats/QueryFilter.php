<?php

namespace WeDevs\Dokan\Analytics\Reports\Coupons\Stats;

use WeDevs\Dokan\Analytics\Reports\Coupons\QueryFilter as OrdersQueryFilter;

/**
 * Class QueryFilter
 *
 * Extends the OrdersQueryFilter class to customize WooCommerce Analytics reports
 * for Dokan orders stats by adding additional subqueries and modifying report columns.
 *
 * @package WeDevs\Dokan\Analytics\Reports\Orders\Stats
 */
class QueryFilter extends OrdersQueryFilter {
    /**
     * The context for this query filter, used to differentiate between different report types.
     *
     * @var string
     */
    protected $context = 'coupons_stats';

    /**
     * Registers the necessary WordPress hooks to modify WooCommerce Analytics reports.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'woocommerce_analytics_clauses_join_coupons_stats_total', [ $this, 'add_join_subquery' ] );
        add_filter( 'woocommerce_analytics_clauses_join_coupons_stats_interval', [ $this, 'add_join_subquery' ] );

        add_filter( 'woocommerce_analytics_clauses_where_coupons_stats_total', [ $this, 'add_where_subquery' ], 30 );
        add_filter( 'woocommerce_analytics_clauses_where_coupons_stats_interval', [ $this, 'add_where_subquery' ], 30 );
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
