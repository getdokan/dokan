<?php

namespace WeDevs\Dokan\Analytics\Reports\Customers\Stats;

use WeDevs\Dokan\Analytics\Reports\Customers\QueryFilter as CustomersQueryFilter;

/**
 * Class QueryFilter
 *
 * @since 3.13.0
 */
class QueryFilter extends CustomersQueryFilter {
	protected $context = 'customers_stats';

	/**
     * Register hooks for filtering WooCommerce analytics queries.
     *
     * @return void
     */
	public function register_hooks(): void {
		add_filter( 'woocommerce_analytics_clauses_join_customers_stats_subquery', [ $this, 'add_join_subquery' ] );

		add_filter( 'woocommerce_analytics_clauses_where_customers_stats_subquery', [ $this, 'add_where_subquery' ], 30 );

		// add_filter( 'woocommerce_analytics_clauses_select', [ $this, 'add_select_subquery' ], 30 );
		add_filter( 'woocommerce_analytics_clauses_select_customers_stats_subquery', [ $this, 'add_select_subquery' ], 30 );
		// add_filter( 'woocommerce_analytics_clauses_select_customers_stats', [ $this, 'add_select_subquery' ], 30 );
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
	public function add_select_subquery( array $wc_clauses ): array {
		$modified_clauses = [];

		foreach ( $wc_clauses as $clause ) {
			$modified_clauses[] = $this->modify_select_field( $clause );
		}

		return $modified_clauses;
	}

	protected function modify_select_field( string $field ): string {
		$parts = explode( ' as ', strtolower( $field ) );
		$renamed_field = trim( $parts[1] ?? '' );

		// The following fields need be modified.
		// [0] => SUM( total_sales ) AS total_spend,
		// [1] => SUM( CASE WHEN parent_id = 0 THEN 1 END ) as orders_count,
		// [2] => CASE WHEN SUM( CASE WHEN parent_id = 0 THEN 1 ELSE 0 END ) = 0 THEN NULL ELSE SUM( total_sales ) / SUM( CASE WHEN parent_id = 0 THEN 1 ELSE 0 END ) END AS avg_order_value

		$table_name = $this->get_dokan_table();

		$types = $this->get_order_and_refund_types_to_include();

		switch ( str_replace( ',', '', $renamed_field ) ) {
			case 'total_spend':
				$field = "SUM(CASE WHEN {$table_name}.order_type IN ($types) THEN total_sales ELSE 0 END ) as total_spend";
				break;
			case 'orders_count':
				$field = "COUNT( DISTINCT (CASE WHEN {$table_name}.order_type IN ($types) THEN  {$table_name}.order_id END) )  as orders_count";
				break;
			case 'avg_order_value':
				$order_types_conditions = "CASE WHEN  {$table_name}.order_type IN ($types) THEN 1 ELSE 0 END";

				$field = "CASE WHEN SUM( $order_types_conditions ) = 0 THEN NULL ELSE SUM( total_sales ) / SUM( $order_types_conditions ) END AS avg_order_value";
				break;
			default:
				break;
		}

		// Append comma if the given field ends with comma[","].
		if ( str_ends_with( $renamed_field, ',' ) ) {
			$field = $field . ',';
		}

		return $field;
	}
}
