<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders;

use WeDevs\Dokan\Contracts\Hookable;

class FilterQuery implements Hookable {
	public function __construct() {
		$this->register_hooks();
	}

	public function register_hooks(): void {
		add_filter( 'woocommerce_analytics_clauses_join_orders_subquery', [ $this, 'add_join_subquery' ] );
		add_filter( 'woocommerce_analytics_clauses_join_orders_stats_total', [ $this, 'add_join_subquery' ] );
		add_filter( 'woocommerce_analytics_clauses_join_orders_stats_interval', [ $this, 'add_join_subquery' ] );

		add_filter( 'woocommerce_analytics_clauses_where_orders_subquery', [ $this, 'add_where_subquery' ] );
		add_filter( 'woocommerce_analytics_clauses_where_orders_stats_total', [ $this, 'add_where_subquery' ] );
		add_filter( 'woocommerce_analytics_clauses_where_orders_stats_interval', [ $this, 'add_where_subquery' ] );
	}

	public function add_join_subquery( $clauses ) {
		global $wpdb;

		$dokan_order_state_table = Stats\DataStore::get_db_table_name();

		$clauses[] = "JOIN {$dokan_order_state_table} ON {$wpdb->prefix}wc_order_stats.order_id = {$dokan_order_state_table}.order_id";

		return $clauses;
	}

	public function add_where_subquery( $clauses ) {
		$dokan_order_state_table = Stats\DataStore::get_db_table_name();

		$clauses[] = "AND {$dokan_order_state_table}.is_suborder = 0";

		return $clauses;
	}
}
