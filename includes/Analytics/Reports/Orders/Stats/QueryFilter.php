<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders\Stats;

use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Analytics\Reports\Orders\QueryFilter as OrdersQueryFilter;

class QueryFilter extends OrdersQueryFilter {
	protected $context = 'order_stats';

	public function __construct() {
		$this->register_hooks();
	}

	public function register_hooks(): void {
		add_filter( 'woocommerce_analytics_clauses_join_orders_stats_total', [ $this, 'add_join_subquery' ] );
		add_filter( 'woocommerce_analytics_clauses_join_orders_stats_interval', [ $this, 'add_join_subquery' ] );

		add_filter( 'woocommerce_analytics_clauses_where_orders_stats_total', [ $this, 'add_where_subquery' ], 30 );
		add_filter( 'woocommerce_analytics_clauses_where_orders_stats_interval', [ $this, 'add_where_subquery' ], 30 );

		add_filter( 'woocommerce_analytics_clauses_select_orders_stats_total', [ $this, 'add_select_subquery_for_total' ] );
		add_filter( 'woocommerce_analytics_clauses_select_orders_stats_interval', [ $this, 'add_select_subquery_for_total' ] );

		add_filter( 'woocommerce_analytics_order_excludes', [ $this, 'exclude_order_ids' ], 12, 4 );
		add_filter( 'woocommerce_analytics_order_includes', [ $this, 'exclude_order_ids' ], 12, 4 );

		add_filter( 'woocommerce_admin_report_columns', [ $this, 'modify_admin_report_columns' ], 20, 3 );
	}

    public function modify_admin_report_columns( array $column, string $context, string $wc_table_name ): array {
		if ( $context !== 'orders_stats' ) {
			return $column;
		}

		$table_name = DataStore::get_db_table_name();
		$types = $this->get_order_types_by_current_user();

		$column['orders_count']         = "SUM( CASE WHEN {$table_name}.order_type IN ($types) THEN 1 ELSE 0 END ) as orders_count";
		$column['avg_items_per_order']  = "SUM( {$wc_table_name}.num_items_sold ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_items_per_order";
		$column['avg_order_value']      = "SUM( {$wc_table_name}.net_total ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_order_value";
		$column['avg_admin_commission'] = "SUM( {$table_name}.admin_commission ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_admin_commission";
		$column['avg_seller_earning']   = "SUM( {$table_name}.seller_earning ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_seller_earning";

		return $column;
	}

	protected function get_order_types_by_current_user() {
		$order_type = new OrderType();

		if ( $this->should_filter_by_seller_id() ) {
			return implode( ',', $order_type->get_types_for_seller() );
		}

		return implode( ',', $order_type->get_types_for_admin() );
	}

    public function add_select_subquery_for_total( $clauses ) {
		$table_name = DataStore::get_db_table_name();
		$types = $this->get_order_types_by_current_user();

        $clauses[] = ', sum(seller_earning) as total_seller_earning, sum(seller_gateway_fee) as total_seller_gateway_fee, sum(seller_discount) as total_seller_discount, sum(admin_commission) as total_admin_commission, sum(admin_gateway_fee) as total_admin_gateway_fee, sum(admin_discount) as total_admin_discount, sum(admin_subsidy) as total_admin_subsidy';
        $clauses[] = ", SUM( {$table_name}.admin_commission ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_admin_commission";
        $clauses[] = ", SUM( {$table_name}.seller_earning ) / SUM( CASE WHEN {$table_name}.order_type IN($types) THEN 1 ELSE 0 END ) AS avg_seller_earning";

        return $clauses;
    }

	public function should_filter_by_seller_id(): bool {
		return true;
	}
}
