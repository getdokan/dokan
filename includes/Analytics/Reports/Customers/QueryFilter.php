<?php

namespace WeDevs\Dokan\Analytics\Reports\Customers;

use WeDevs\Dokan\Analytics\Reports\BaseQueryFilter;

/**
 * Class QueryFilter
 *
 * Filters and modifies WooCommerce analytics queries for Dokan orders.
 *
 * @since 3.13.0
 */
class QueryFilter extends BaseQueryFilter {
    /**
     * @var string The context of the query filter.
     */
    protected $context = 'customers';

    /**
     * Register hooks for filtering WooCommerce analytics queries.
     *
     * @return void
     */
    public function register_hooks(): void {
        // add_filter( 'woocommerce_analytics_clauses_join_products', [ $this, 'add_join_subquery' ] );
        add_filter( 'woocommerce_analytics_clauses_join_customers_subquery', [ $this, 'add_join_subquery' ] );
        add_filter( 'woocommerce_analytics_clauses_where_customers_subquery', [ $this, 'add_where_subquery' ], 30 );
        // add_filter( 'woocommerce_analytics_clauses_select_products_subquery', [ $this, 'add_select_subquery' ] );
        // add_filter( 'woocommerce_admin_report_columns', [ $this, 'modify_admin_report_columns' ], 20, 3 );

        add_filter( 'woocommerce_admin_report_columns', [ $this, 'modify_admin_report_columns' ], 20, 3 );
    }

    /**
     *
     * Modify WooCommerce admin report columns for orders.
     *
     * @param array $column The existing columns.
     * @param string $context The context of the report.
     * @param string $wc_table_name The WooCommerce table name.
     *
     * @return array The modified columns.
     */
    public function modify_admin_report_columns( array $column, string $context, string $wc_table_name ): array {
        if ( $context !== $this->context ) {
            return $column;
        }

        $types = $this->get_order_and_refund_types_to_include();
        $table_name = $this->get_dokan_table();

        $orders_count         = "COUNT( DISTINCT (CASE WHEN {$table_name}.order_type IN ($types) THEN  {$table_name}.order_id END) )  "; //'SUM( CASE WHEN parent_id = 0 THEN 1 ELSE 0 END )';
		$total_spend          = "SUM(CASE WHEN {$table_name}.order_type IN ($types) THEN total_sales ELSE 0 END )";  //'SUM( total_sales )';

        /**
         * Parent order ID need to be set to 0 for Dokan suborder.
         * Because, WC orders analytics generates order details link against the parent order
         * assuming the order having parent ID as a refund order.
         */
        $column['orders_count']     = "{$orders_count} as orders_count";
        $column['total_spend']      = "{$total_spend} as total_spend";
        $column['avg_order_value']  = "CASE WHEN {$orders_count} = 0 THEN NULL ELSE {$total_spend} / {$orders_count} END AS avg_order_value";

        return $column;
    }
}
