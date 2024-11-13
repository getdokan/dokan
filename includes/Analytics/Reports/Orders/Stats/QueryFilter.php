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
 * @since 3.13.0
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

        // add_filter( 'woocommerce_analytics_clauses_where_orders_stats_total', [ $this, 'add_where_subquery' ], 30 );
        // add_filter( 'woocommerce_analytics_clauses_where_orders_stats_interval', [ $this, 'add_where_subquery' ], 30 );

        add_filter( 'woocommerce_analytics_clauses_where_orders_stats_total', [ $this, 'add_where_subquery_for_vendor_filter' ], 30 );
        add_filter( 'woocommerce_analytics_clauses_where_orders_stats_interval', [ $this, 'add_where_subquery_for_vendor_filter' ], 30 );

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
    public function modify_admin_report_columns( array $column, string $context, string $table_name ): array {
        if ( $context !== $this->context ) {
            return $column;
        }

        $dokan_table_name = $this->get_dokan_table();
        $order_types = $this->get_order_types_for_sql_excluding_refunds();
        $types = implode( ',', ( new OrderType() )->get_vendor_order_types() );
        // $types = $this->get_order_types_for_sql_excluding_refunds();

        $parent_order_types_str = implode( ',', ( new OrderType() )->get_admin_order_types_excluding_refunds() );
        $refund_order_types_str = implode( ',', ( new OrderType() )->get_vendor_refund_types() );

        $order_count = "SUM( CASE WHEN {$dokan_table_name}.order_type IN($order_types) THEN 1 ELSE 0 END )";

        /**
         * Override WC column.
         *
         * We can apply the common where clause after Dokan Coupon Distribution.
         * File to restore: @see https://github.com/getdokan/dokan/blob/2cffa360a94b32033e7591fece5950068ab758f5/includes/Analytics/Reports/Orders/Stats/QueryFilter.php#L4
         */
        $coupon = "SUM(CASE WHEN {$dokan_table_name}.order_type IN($parent_order_types_str) THEN discount_amount END)";

        $net_total = "SUM(CASE WHEN {$dokan_table_name}.order_type IN($types) THEN  {$table_name}.net_total END)";

        $item_sold = "SUM( CASE WHEN {$dokan_table_name}.order_type IN($types) THEN {$table_name}.num_items_sold END)";

        $refunds = "ABS( SUM( CASE WHEN {$table_name}.net_total < 0 AND {$dokan_table_name}.order_type IN($refund_order_types_str) THEN {$table_name}.net_total ELSE 0 END ) )";

		$gross_sales =
			"( SUM( CASE WHEN {$dokan_table_name}.order_type IN($types) THEN {$table_name}.total_sales END )" .
			" + COALESCE( $coupon, 0 )" . // SUM() all nulls gives null.
			" - SUM(CASE WHEN {$dokan_table_name}.order_type IN($types) THEN {$table_name}.tax_total END)" .
			" - SUM(CASE WHEN {$dokan_table_name}.order_type IN($types) THEN  {$table_name}.shipping_total END)" .
			" + {$refunds}" .
			' ) as gross_sales';

        $column['num_items_sold']      = "$item_sold as num_items_sold";
        $column['gross_sales']         = $gross_sales;
        $column['total_sales']         = "SUM( CASE WHEN {$dokan_table_name}.order_type IN($types) THEN  {$table_name}.total_sales END) AS total_sales";
        $column['coupons']             = "COALESCE( $coupon, 0 ) AS coupons"; // SUM() all nulls gives null;
        $column['coupons_count']       = 'COALESCE( coupons_count, 0 ) as coupons_count';
        $column['refunds']             = "{$refunds} AS refunds";
        $column['taxes']               = "SUM(CASE WHEN {$dokan_table_name}.order_type IN($types) THEN {$table_name}.tax_total END) AS taxes";
        $column['shipping']            = "SUM(CASE WHEN {$dokan_table_name}.order_type IN($types) THEN {$table_name}.shipping_total END) AS shipping";
        $column['net_revenue']         = " $net_total AS net_revenue";
        $column['total_customers']     = "COUNT( DISTINCT( {$table_name}.customer_id ) ) as total_customers";
        // End of override

        $column['orders_count'] = "{$order_count} as orders_count";

        $column['avg_items_per_order']  = "{$item_sold} / {$order_count} AS avg_items_per_order";
        $column['avg_order_value']      = "{$net_total} / {$order_count} AS avg_order_value";
        $column['avg_admin_commission'] = "SUM( CASE WHEN {$dokan_table_name}.order_type IN($types) THEN  {$dokan_table_name}.admin_commission END) / {$order_count} AS avg_admin_commission";
        $column['avg_vendor_earning']   = "SUM( CASE WHEN {$dokan_table_name}.order_type IN($types) THEN  {$dokan_table_name}.vendor_earning END) / {$order_count} AS avg_vendor_earning";

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

    /**
     * @inheritDoc
     */
    public function add_where_subquery_for_vendor_filter( array $clauses ): array {
        return parent::add_where_subquery_for_vendor_filter( $clauses );
    }
}
