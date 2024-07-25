<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders;

use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Contracts\Hookable;

class QueryFilter implements Hookable {
	public function __construct() {
		$this->register_hooks();
	}

	public function register_hooks(): void {
		add_filter( 'woocommerce_analytics_clauses_join_orders_subquery', [ $this, 'add_join_subquery' ] );

		add_filter( 'woocommerce_analytics_clauses_where_orders_subquery', [ $this, 'add_where_subquery' ], 30 );

		add_filter( 'woocommerce_analytics_clauses_select_orders_subquery', [ $this, 'add_select_subquery' ] );

		add_filter( 'woocommerce_analytics_order_excludes', [ $this, 'exclude_order_ids' ], 12, 4 );
		add_filter( 'woocommerce_analytics_order_includes', [ $this, 'exclude_order_ids' ], 12, 4 );

		add_filter( 'woocommerce_admin_report_columns', [ $this, 'modify_admin_report_columns' ], 20, 3 );
	}

	public function modify_admin_report_columns( array $column, $context, $wc_table_name ) {
		if ( $context !== 'orders' ) {
			return $column;
		}

		$order_type = new OrderType();
		$refund_types = implode( ',', $order_type->get_types_for_refund() );
		$table_name = Stats\DataStore::get_db_table_name();

		/**
		 * Parent order ID need to be set to 0 for Dokan suborder.
		 * Because, WC orders analytics generates order details link against the parent order
		 * assuming the order having parent ID as a refund order.
		 */
		$column['parent_id'] = "(CASE WHEN {$table_name}.order_type NOT IN ($refund_types) THEN 0 ELSE {$wc_table_name}.parent_id END ) as parent_id";

		return $column;
	}

	/**
	 * Disable suborder id exclusion if current user in Seller or Filter by seller.
	 * It is applied in
	 * Line 128: $excluded_orders = $this->get_excluded_orders( $query_args );
	 * Method: add_sql_query_params( $query_args )
	 * Class: \Automattic\WooCommerce\Admin\API\Reports\Orders\DataStore
	 * @param array $ids
	 * @param array $query_args
	 * @param string $field
	 * @param string $context
	 * @return void
	 */
	public function exclude_order_ids( $ids, $query_args, $field, $context ) {
		if ( $context !== 'orders' || ! $this->should_filter_by_seller_id() ) {
			return $ids;
		}

		return [];
	}

    public function add_select_subquery( $clauses ) {
        $clauses[] = ', seller_earning, seller_gateway_fee, seller_discount, admin_commission, admin_gateway_fee, admin_discount, admin_subsidy';

        return array_unique( $clauses );
    }

	public function add_join_subquery( $clauses ) {
		global $wpdb;

		$dokan_order_state_table = Stats\DataStore::get_db_table_name();

		$clauses[] = "JOIN {$dokan_order_state_table} ON {$wpdb->prefix}wc_order_stats.order_id = {$dokan_order_state_table}.order_id";

		return array_unique( $clauses );
	}

	public function add_where_subquery( $clauses ) {
		$dokan_order_state_table = Stats\DataStore::get_db_table_name();
		$order_type = new OrderType();

		if ( $this->should_filter_by_seller_id() ) {
			$seller_order_type = implode( ',', $order_type->get_types_for_seller() );
			$clauses[] = "AND {$dokan_order_state_table}.order_type in (  $seller_order_type ) ";
		} else {
			$admin_order_type = implode( ',', $order_type->get_types_for_admin() );
			$clauses[] = "AND {$dokan_order_state_table}.order_type in (  $admin_order_type ) ";
		}

		return array_unique( $clauses );
	}

	public function should_filter_by_seller_id(): bool {
		return true;
	}
}
