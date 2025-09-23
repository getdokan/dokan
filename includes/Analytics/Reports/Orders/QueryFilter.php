<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders;

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
    protected $context = 'orders';

    /**
     * Register hooks for filtering WooCommerce analytics queries.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'woocommerce_analytics_clauses_join_orders_subquery', [ $this, 'add_join_subquery' ] );
        add_filter( 'woocommerce_analytics_clauses_where_orders_subquery', [ $this, 'add_where_subquery' ], 30 );
        add_filter( 'woocommerce_analytics_clauses_select_orders_subquery', [ $this, 'add_select_subquery' ] );
        add_filter( 'woocommerce_analytics_order_excludes', [ $this, 'exclude_order_ids' ], 12, 4 );
        add_filter( 'woocommerce_analytics_order_includes', [ $this, 'exclude_order_ids' ], 12, 4 );
        add_filter( 'woocommerce_admin_report_columns', [ $this, 'modify_admin_report_columns' ], 20, 3 );
    }

    /**
     * Modify WooCommerce admin report columns for orders.
     *
     * @param array $column The existing columns.
     * @param string $context The context of the report.
     * @param string $wc_table_name The WooCommerce table name.
     *
     * @return array The modified columns.
     */
    public function modify_admin_report_columns( array $column, string $context, string $wc_table_name ): array {
        if ( $context !== 'orders' ) {
            return $column;
        }

        $order_type = new OrderType();
        $refund_types = implode( ',', $order_type->get_refund_types() );
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
     * Exclude order IDs from WooCommerce analytics queries based on seller or admin context.
     *
     * @param array $ids The existing excluded order IDs.
     * @param array $query_args The query arguments.
     * @param string $field The field being queried.
     * @param string $context The context of the query.
     *
     * @return array The modified excluded order IDs.
     */
    public function exclude_order_ids( array $ids, array $query_args, string $field, $context ): array {
        if ( $context !== 'orders' || ! $this->should_filter_by_vendor_id() ) {
            return $ids;
        }

        return [];
    }

    /**
     * Add custom columns to the select clause of WooCommerce analytics queries.
     *
     * @param array $clauses The existing select clauses.
     *
     * @return array The modified select clauses.
     */
    public function add_select_subquery( array $clauses ): array {
        $clauses[] = ', vendor_earning, vendor_gateway_fee, vendor_discount, admin_commission, admin_gateway_fee, admin_discount, admin_subsidy';

        return array_unique( $clauses );
    }
}
