<?php

namespace WeDevs\Dokan\Analytics\Reports\Taxes\Stats;

use WeDevs\Dokan\Analytics\Reports\Taxes\QueryFilter as TaxesQueryFilter;

/**
 * Class QueryFilter
 *
 * Filters and modifies WooCommerce analytics queries for Tax Stats.
 *
 * @since 3.13.0
 */
class QueryFilter extends TaxesQueryFilter {
	protected $context = 'taxes_stats';

	/**
     * Register hooks for filtering WooCommerce analytics queries.
     *
     * @return void
     */
	public function register_hooks(): void {
		add_filter( 'woocommerce_analytics_clauses_join_taxes_stats_total', [ $this, 'add_join_subquery' ] );
		add_filter( 'woocommerce_analytics_clauses_join_taxes_stats_interval', [ $this, 'add_join_subquery' ] );

		add_filter( 'woocommerce_analytics_clauses_where_taxes_stats_total', [ $this, 'add_where_subquery' ], 30 );
		add_filter( 'woocommerce_analytics_clauses_where_taxes_stats_interval', [ $this, 'add_where_subquery' ], 30 );

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

		$table_name = $this->get_dokan_table();
		$types = $this->get_order_types_for_sql_excluding_refunds();

		$column['orders_count'] = "SUM( CASE WHEN {$table_name}.order_type IN ($types) THEN 1 ELSE 0 END ) as orders_count";

		return $column;
	}
}
