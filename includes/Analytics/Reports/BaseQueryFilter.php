<?php

namespace WeDevs\Dokan\Analytics\Reports;

use WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore;
use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Class QueryFilter
 *
 * Filters and modifies WooCommerce analytics queries for Dokan orders.
 */
abstract class BaseQueryFilter implements Hookable {
    /**
     * QueryFilter constructor.
     * Registers the hooks on instantiation.
     */
    public function __construct() {
        $this->register_hooks();
    }

    /**
     * Add join clause for Dokan order state table in WooCommerce analytics queries.
     *
     * @param array $clauses The existing join clauses.
     *
     * @return array The modified join clauses.
     */
    public function add_join_subquery( array $clauses ): array {
        global $wpdb;

        $dokan_order_state_table = DataStore::get_db_table_name();

        $clauses[] = "JOIN {$dokan_order_state_table} ON {$wpdb->prefix}wc_order_stats.order_id = {$dokan_order_state_table}.order_id";

        return array_unique( $clauses );
    }

    /**
     * Add where clause for Dokan order state in WooCommerce analytics queries.
     *
     * @param array $clauses The existing where clauses.
     *
     * @return array The modified where clauses.
     */
    public function add_where_subquery( array $clauses ): array {
        $dokan_order_state_table = DataStore::get_db_table_name();
        $order_types = $this->get_order_types_to_include();

        $clauses[] = "AND {$dokan_order_state_table}.order_type in ( $order_types ) ";

        $clauses = $this->add_where_subquery_for_refund( $clauses );

        return array_unique( $clauses );
    }

    /**
     * Add where clause for refunds in WooCommerce analytics queries.
     *
     * @param array $clauses The existing where clauses.
     *
     * @return array The modified where clauses.
     */
    protected function add_where_subquery_for_refund( array $clauses ): array {
        if ( ! isset( $_GET['refunds'] ) ) {
            return $clauses;
        }

        $dokan_order_state_table = DataStore::get_db_table_name();
        $order_types = $this->get_refund_types_to_include();

        $clauses[] = "AND {$dokan_order_state_table}.order_type in ( $order_types ) ";

        return $clauses;
    }

    /**
     * Determine if the query should be filtered by seller ID.
     *
     * @return bool True if the query should be filtered by seller ID, false otherwise.
     */
    public function should_filter_by_seller_id(): bool {
        return true;
    }

    /**
     * Get the order types to include in WooCommerce analytics queries.
     *
     * @return string The order types to include.
     */
    protected function get_order_types_to_include(): string {
        $order_type = new OrderType();

        if ( $this->should_filter_by_seller_id() ) {
            return implode( ',', $order_type->get_types_for_seller() );
        }

        return implode( ',', $order_type->get_types_for_admin() );
    }

    /**
     * Get the refund types to include in WooCommerce analytics queries.
     *
     * @return string The refund types to include.
     */
    protected function get_refund_types_to_include(): string {
        $order_type = new OrderType();

        if ( $this->should_filter_by_seller_id() ) {
            return implode( ',', $order_type->get_refund_types_for_seller() );
        }

        return implode( ',', $order_type->get_refund_types_for_admin() );
    }
}
