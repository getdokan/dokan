<?php

namespace WeDevs\Dokan\Analytics\Reports\Products\Stats;

use WeDevs\Dokan\Analytics\Reports\Products\QueryFilter as ProductsQueryFilter;

/**
 * Filters and modifies WooCommerce analytics queries for Dokan Products Stats.
 *
 * @since 3.13.0
 */
class QueryFilter extends ProductsQueryFilter {
	protected $context = 'products_stats';

	/**
     * Register hooks for filtering WooCommerce analytics queries.
     *
     * @return void
     */
	public function register_hooks(): void {
		add_filter( 'woocommerce_analytics_clauses_join_products_stats_total', [ $this, 'add_join_subquery' ] );
		add_filter( 'woocommerce_analytics_clauses_join_products_stats_interval', [ $this, 'add_join_subquery' ] );

		add_filter( 'woocommerce_analytics_clauses_where_products_stats_total', [ $this, 'add_where_subquery' ], 30 );
		add_filter( 'woocommerce_analytics_clauses_where_products_stats_interval', [ $this, 'add_where_subquery' ], 30 );
	}
}
