<?php

namespace WeDevs\Dokan\Analytics\Reports\Coupons\Stats;

use WeDevs\Dokan\Analytics\Reports\Coupons\QueryFilter as OrdersQueryFilter;

/**
 * Class QueryFilter
 *
 * Extends the OrdersQueryFilter class to customize WooCommerce Analytics reports
 * for Dokan orders stats by adding additional subqueries and modifying report columns.
 *
 * @since 3.13.0
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

        // Todo: Enable WHERE clause filters after completing coupon amount sub-order distributions.
        // add_filter( 'woocommerce_analytics_clauses_where_coupons_stats_total', [ $this, 'add_where_subquery' ], 30 );
        // add_filter( 'woocommerce_analytics_clauses_where_coupons_stats_interval', [ $this, 'add_where_subquery' ], 30 );

        // Todo: We may remove the "woocommerce_admin_report_columns" filter after completing coupon amount sub-order distributions.
        add_filter( 'woocommerce_admin_report_columns', [ $this, 'modify_admin_report_columns' ], 20, 3 );
    }
}
