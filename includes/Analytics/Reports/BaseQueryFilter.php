<?php

namespace WeDevs\Dokan\Analytics\Reports;

use WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore;
use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Class QueryFilter
 *
 * Filters and modifies WooCommerce analytics queries for Dokan orders.
 *
 * @since 3.13.0
 */
abstract class BaseQueryFilter implements Hookable {
    protected $wc_table = 'wc_order_stats';
    protected $context = '';

    /**
     * Add join clause for Dokan order state table in WooCommerce analytics queries.
     *
     * @param array $clauses The existing join clauses.
     *
     * @return array The modified join clauses.
     */
	public function add_join_subquery( array $clauses ): array {
		global $wpdb;

		$dokan_order_state_table = $this->get_dokan_table();

		$clauses[] = "JOIN {$dokan_order_state_table} ON {$wpdb->prefix}{$this->wc_table}.order_id = {$dokan_order_state_table}.order_id";

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
		$dokan_order_state_table = $this->get_dokan_table();
		$order_types = $this->get_order_and_refund_types_to_include();

		$clauses[] = "AND {$dokan_order_state_table}.order_type in ( $order_types ) ";

		$clauses = $this->add_where_subquery_for_refund( $clauses );
		$clauses = $this->add_where_subquery_for_vendor_filter( $clauses );

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
		if ( ! isset( $_GET['refunds'] ) ) { //phpcs:ignore
			return $clauses;
		}

		$dokan_order_state_table = $this->get_dokan_table();
		$order_types = $this->get_refund_types_to_include();

		$clauses[] = "AND {$dokan_order_state_table}.order_type in ( $order_types ) ";

		return $clauses;
	}

    /**
     * Determine if the query should be filtered by seller ID.
     *
     * @return bool True if the query should be filtered by seller ID, false otherwise.
     */
	public function should_filter_by_vendor_id(): bool {
		return true;
	}

    /**
     * Get the order types to include in WooCommerce analytics queries.
     *
     * @return string The order types to include.
     */
	protected function get_order_and_refund_types_to_include(): string {
		$order_type = new OrderType();

		if ( $this->should_filter_by_vendor_id() ) {
			return implode( ',', $order_type->get_vendor_order_types() );
		}

		return implode( ',', $order_type->get_admin_order_types() );
	}

    /**
     * Get the refund types to include in WooCommerce analytics queries.
     *
     * @return string The refund types to include.
     */
	protected function get_refund_types_to_include(): string {
		$order_type = new OrderType();

		if ( $this->should_filter_by_vendor_id() ) {
			return implode( ',', $order_type->get_vendor_refund_types() );
		}

		return implode( ',', $order_type->get_admin_refund_types() );
	}

	protected function get_dokan_table(): string {
		return DataStore::get_db_table_name();
	}

    /**
     * Get the non refund order types to include in WooCommerce analytics queries.
     *
     * @return string The refund types to include.
     */
	protected function get_order_types_for_sql_excluding_refunds(): string {
		$order_type = new OrderType();

		if ( $this->should_filter_by_vendor_id() ) {
			return implode( ',', $order_type->get_vendor_order_types_excluding_refunds() );
		}

		return implode( ',', $order_type->get_admin_order_types_excluding_refunds() );
	}

	/**
     * Add where clause for seller query filter in WooCommerce analytics queries.
     *
     * @param array $clauses The existing where clauses.
     *
     * @return array The modified where clauses.
     */
	protected function add_where_subquery_for_vendor_filter( array $clauses ): array {
		$vendor_id = $this->get_vendor_id();

		if ( ! $vendor_id ) {
			return $clauses;
		}

		$dokan_order_state_table = $this->get_dokan_table();

		global $wpdb;

		$clauses[] = $wpdb->prepare( "AND {$dokan_order_state_table}.vendor_id = %s", $vendor_id ); //phpcs:ignore

		return $clauses;
	}

	/**
	 * Get seller id from Query param for Admin and currently logged in user as Vendor
	 *
	 * @return int
	 */
	public function get_vendor_id() {
		if ( ! is_user_logged_in() ) {
			return 0;
		}

		if ( ! current_user_can( 'view_woocommerce_reports' ) ) {
			return dokan_get_current_user_id();
		}

		return (int) ( wp_unslash( $_GET['sellers'] ?? 0 ) ); // phpcs:ignore
	}
}
