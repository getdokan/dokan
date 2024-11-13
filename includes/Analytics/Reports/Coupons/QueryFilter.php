<?php

namespace WeDevs\Dokan\Analytics\Reports\Coupons;

use WeDevs\Dokan\Analytics\Reports\BaseQueryFilter;
use WeDevs\Dokan\Analytics\Reports\OrderType;

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
    protected $context = 'coupons';

    /**
     * Register hooks for filtering WooCommerce analytics queries.
     *
     * @return void
     */
	public function register_hooks(): void {
		add_filter( 'woocommerce_analytics_clauses_join_coupons_subquery', [ $this, 'add_join_subquery' ] );

        // Todo: Enable WHERE clause filter after completing coupon amount sub-order distributions.
		// add_filter( 'woocommerce_analytics_clauses_where_coupons_subquery', [ $this, 'add_where_subquery' ], 30 );

        add_filter( 'woocommerce_admin_report_columns', [ $this, 'modify_admin_report_columns' ], 20, 3 );
    }

    /**
     *
     * Todo: We may remove this method after completing coupon amount sub-order distributions.
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

        $order_type = new OrderType();
        $vendor_types = implode( ',', $order_type->get_vendor_order_types() );
        $admin_types = implode( ',', $order_type->get_admin_order_types() );
        $table_name = $this->get_dokan_table();

        /**
         * Parent order ID need to be set to 0 for Dokan suborder.
         * Because, WC orders analytics generates order details link against the parent order
         * assuming the order having parent ID as a refund order.
         */
        // $column['parent_id'] = "(CASE WHEN {$table_name}.order_type NOT IN ($refund_types) THEN 0 ELSE {$wc_table_name}.parent_id END ) as parent_id";
        $column['amount'] = "SUM(CASE WHEN {$table_name}.order_type IN ($admin_types) THEN discount_amount ELSE 0 END ) as amount";
        $column['orders_count'] = "COUNT( DISTINCT (CASE WHEN {$table_name}.order_type IN ($vendor_types) THEN  {$table_name}.order_id END) ) as orders_count";

        return $column;
    }
}
