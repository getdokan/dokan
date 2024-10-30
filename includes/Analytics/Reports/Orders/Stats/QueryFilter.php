<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders\Stats;

use WeDevs\Dokan\Analytics\Reports\Orders\QueryFilter as OrdersQueryFilter;
use WeDevs\Dokan\Analytics\Reports\OrderType;

/**
 * Class QueryFilter
 *
 * Extends the OrdersQueryFilter class to customize WooCommerce Analytics reports
 * for Dokan orders stats by adding additional subqueries and modifying report columns.
 *
 * @since DOKAN_SINCE
 */
class QueryFilter extends OrdersQueryFilter {
    /**
     * The context for this query filter, used to differentiate between different report types.
     *
     * @var string
     */
    protected $context = 'orders_stats';

    /**
     * Registers the necessary WordPress hooks to modify WooCommerce Analytics reports.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'woocommerce_analytics_clauses_join_orders_stats_total', [ $this, 'add_join_subquery' ] );
        add_filter( 'woocommerce_analytics_clauses_join_orders_stats_interval', [ $this, 'add_join_subquery' ] );

        add_filter( 'woocommerce_analytics_clauses_where_orders_stats_total', [ $this, 'add_where_subquery' ], 30 );
        add_filter( 'woocommerce_analytics_clauses_where_orders_stats_interval', [ $this, 'add_where_subquery' ], 30 );

        add_filter( 'woocommerce_analytics_clauses_select_orders_stats_total', [ $this, 'add_select_subquery_for_total' ] );
        add_filter( 'woocommerce_analytics_clauses_select_orders_stats_interval', [ $this, 'add_select_subquery_for_total' ] );

        add_filter( 'woocommerce_analytics_order_excludes', [ $this, 'exclude_order_ids' ], 12, 4 );
        add_filter( 'woocommerce_analytics_order_includes', [ $this, 'exclude_order_ids' ], 12, 4 );

        // Apply Dokan condition for SELECT fields.
        add_filter( 'woocommerce_admin_report_columns', [ $this, 'modify_admin_report_columns' ], 20, 3 );
    }

    /**
     * Modifies the admin report columns to include Dokan-specific data.
     *
     * @param array  $column        The existing report columns.
     * @param string $context       The context of the report.
     * @param string $wc_table_name The WooCommerce table name being queried.
     *
     * @return array Modified report columns.
     */
    public function modify_admin_report_columns( array $column, string $context, string $wc_table_name ): array {
        if ( $context !== $this->context ) {
            return $column;
        }

        global $wpdb;

        $table_name = $this->get_dokan_table();
        $types      = $this->get_order_types_for_sql_excluding_refunds();

        // Calculate refunds to resolve Dokan refund distribution issue.
        $order_count = "SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END )";
        $refunds     = "ABS( SUM( CASE WHEN {$wc_table_name}.net_total < 0 THEN {$wc_table_name}.net_total ELSE 0 END ) )";

        // Calculate coupons to resolve Dokan coupon distribution issue.
        $parent_order_types_str = implode( ',', ( new OrderType() )->get_admin_order_types_excluding_refunds() );
        $wc_coupon_table        = "{$wpdb->prefix}wc_order_coupon_lookup";
        $coupon                 = "( Select SUM(discount_amount) FROM {$wc_coupon_table} JOIN {$table_name} ON {$table_name}.order_id = {$wc_coupon_table}.order_id WHERE {$table_name}.order_type IN($parent_order_types_str) )";

        $gross_sales =
            "( SUM({$wc_table_name}.total_sales)" .
            " + COALESCE($coupon, 0)" . // SUM() all nulls gives null.
            " - SUM({$wc_table_name}.tax_total)" .
            " - SUM({$wc_table_name}.shipping_total)" .
            " + {$refunds}" .
            ' ) as gross_sales';

        $column['gross_sales']          = $gross_sales;
        $column['coupons']              = "{$coupon} AS coupons";
        $column['orders_count']         = "{$order_count} as orders_count";
        $column['avg_items_per_order']  = "SUM( {$wc_table_name}.num_items_sold ) / {$order_count} AS avg_items_per_order";
        $column['avg_order_value']      = "SUM( {$wc_table_name}.net_total ) / {$order_count} AS avg_order_value";
        $column['avg_admin_commission'] = "SUM( {$table_name}.admin_commission ) / {$order_count} AS avg_admin_commission";
        $column['avg_vendor_earning']   = "SUM( {$table_name}.vendor_earning ) / {$order_count} AS avg_vendor_earning";

        return $column;
    }

    /**
     * Adds custom select subqueries for calculating Dokan-specific totals in the analytics reports.
     *
     * @param array $clauses The existing SQL select clauses.
     *
     * @return array Modified SQL select clauses.
     */
    public function add_select_subquery_for_total( $clauses ) {
        $table_name = $this->get_dokan_table();
        $types = $this->get_order_and_refund_types_to_include();

        $clauses[] = ', sum(vendor_earning) as total_vendor_earning, sum(vendor_gateway_fee) as total_vendor_gateway_fee, sum(vendor_discount) as total_vendor_discount, sum(admin_commission) as total_admin_commission, sum(admin_gateway_fee) as total_admin_gateway_fee, sum(admin_discount) as total_admin_discount, sum(admin_subsidy) as total_admin_subsidy';
        $clauses[] = ", SUM( {$table_name}.admin_commission ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_admin_commission";
        $clauses[] = ", SUM( {$table_name}.vendor_earning ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_vendor_earning";

        return $clauses;
    }
}
