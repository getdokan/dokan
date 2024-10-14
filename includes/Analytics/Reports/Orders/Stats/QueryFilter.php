<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders\Stats;

use WeDevs\Dokan\Analytics\Reports\Orders\QueryFilter as OrdersQueryFilter;

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

        // Define Additional Schema Items
        add_filter( 'woocommerce_rest_report_revenue_stats_schema', [ $this, 'add_additional_fields_schema' ] );
    }

    public function add_additional_fields_schema( $schema ) {
		$schema['properties']['totals']['properties']['products'] = array(
			'description' => __( 'Total Earnings', 'dokan-lite' ),
			'type'        => 'integer',
			'context'     => array( 'view', 'edit' ),
			'readonly'    => true,
		);

        return $schema;
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

        $table_name = $this->get_dokan_table();
        $types = $this->get_non_refund_order_types_to_include();

        $column['orders_count']         = "SUM( CASE WHEN {$table_name}.order_type IN ($types) THEN 1 ELSE 0 END ) as orders_count";
        $column['avg_items_per_order']  = "SUM( {$wc_table_name}.num_items_sold ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_items_per_order";
        $column['avg_order_value']      = "SUM( {$wc_table_name}.net_total ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_order_value";
        $column['avg_admin_commission'] = "SUM( {$table_name}.admin_commission ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_admin_commission";
        $column['avg_seller_earning']   = "SUM( {$table_name}.seller_earning ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_seller_earning";

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

        $clauses[] = ', sum(seller_earning) as total_seller_earning, sum(seller_gateway_fee) as total_seller_gateway_fee, sum(seller_discount) as total_seller_discount, sum(admin_commission) as total_admin_commission, sum(admin_gateway_fee) as total_admin_gateway_fee, sum(admin_discount) as total_admin_discount, sum(admin_subsidy) as total_admin_subsidy';
        $clauses[] = ", SUM( {$table_name}.admin_commission ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_admin_commission";
        $clauses[] = ", SUM( {$table_name}.seller_earning ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_seller_earning";

        return $clauses;
    }
}
