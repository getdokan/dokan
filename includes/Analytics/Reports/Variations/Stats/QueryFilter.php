<?php

namespace WeDevs\Dokan\Analytics\Reports\Variations\Stats;

use WeDevs\Dokan\Analytics\Reports\Variations\QueryFilter as ProductsQueryFilter;

class QueryFilter extends ProductsQueryFilter {
	protected $context = 'variations_stats';

	/**
     * Register hooks for filtering WooCommerce analytics queries.
     *
     * @return void
     */
	public function register_hooks(): void {
		add_filter( 'woocommerce_analytics_clauses_join_variations_stats_total', [ $this, 'add_join_subquery' ] );
		add_filter( 'woocommerce_analytics_clauses_join_variations_stats_interval', [ $this, 'add_join_subquery' ] );

		add_filter( 'woocommerce_analytics_clauses_where_variations_stats_total', [ $this, 'add_where_subquery' ], 30 );
		add_filter( 'woocommerce_analytics_clauses_where_variations_stats_interval', [ $this, 'add_where_subquery' ], 30 );
	}
}
