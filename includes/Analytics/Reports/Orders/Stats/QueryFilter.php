<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders\Stats;

use WeDevs\Dokan\Analytics\Reports\Orders\QueryFilter as OrdersQueryFilter;

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
     * @since 4.0.0
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

		$table_name = $this->get_dokan_table();
		$types      = $this->get_order_types_for_sql_excluding_refunds();

		$order_count_expr = "SUM(CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END)";
		$order_count_safe = "NULLIF({$order_count_expr}, 0)";

		$column['orders_count']         = "{$order_count_expr} AS orders_count";
		$column['avg_items_per_order']  = "COALESCE(SUM({$wc_table_name}.num_items_sold) / {$order_count_safe}, 0) AS avg_items_per_order";
		$column['avg_order_value']      = "COALESCE(SUM({$wc_table_name}.net_total) / {$order_count_safe}, 0) AS avg_order_value";
		$column['avg_admin_commission'] = "COALESCE(SUM({$table_name}.admin_commission) / {$order_count_safe}, 0) AS avg_admin_commission";
		$column['avg_vendor_earning']   = "COALESCE(SUM({$table_name}.vendor_earning) / {$order_count_safe}, 0) AS avg_vendor_earning";

		return $column;
	}

    /**
     * Adds custom select subqueries for calculating Dokan-specific totals in the analytics reports.
     *
     * @since 4.0.0
     *
     * @param array $clauses The existing SQL select clauses.
     *
     * @return array Modified SQL select clauses.
     */
	public function add_select_subquery_for_total( $clauses ) {
		$table_name = $this->get_dokan_table();
		$types      = $this->get_order_and_refund_types_to_include();

		$order_count_expr = "SUM(CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END)";
		$order_count_safe = "NULLIF({$order_count_expr}, 0)";

		$clauses[] = ', 
        SUM(vendor_earning) AS total_vendor_earning, 
        SUM(vendor_gateway_fee) AS total_vendor_gateway_fee, 
        SUM(vendor_discount) AS total_vendor_discount, 
        SUM(admin_commission) AS total_admin_commission, 
        SUM(admin_gateway_fee) AS total_admin_gateway_fee, 
        SUM(admin_discount) AS total_admin_discount, 
        SUM(admin_subsidy) AS total_admin_subsidy';

		$clauses[] = ", COALESCE(SUM({$table_name}.admin_commission) / {$order_count_safe}, 0) AS avg_admin_commission";
		$clauses[] = ", COALESCE(SUM({$table_name}.vendor_earning) / {$order_count_safe}, 0) AS avg_vendor_earning";

		return $clauses;
	}
}
