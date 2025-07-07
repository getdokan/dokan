<?php

namespace WeDevs\Dokan\Models\DataStore;

use WeDevs\Dokan\Models\BaseModel;
use WeDevs\Dokan\Models\VendorOrderStats;

/**
 * Vendor Order Stats Store Class
 *
 * @since DOKAN_SINCE
 */
class VendorOrderStatsStore extends BaseDataStore {

	/**
	 * Get the fields with format as an array where key is the db field name and value is the format.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @return array
	 */
	protected function get_fields_with_format(): array {
		return [
			'order_id'            => '%d',
			'vendor_id'           => '%d',
			'order_type'          => '%d',
			'vendor_earning'      => '%f',
			'vendor_gateway_fee'  => '%f',
			'vendor_shipping_fee' => '%f',
			'vendor_discount'     => '%f',
			'admin_commission'    => '%f',
			'admin_gateway_fee'   => '%f',
			'admin_shipping_fee'  => '%f',
			'admin_discount'      => '%f',
			'admin_subsidy'       => '%f',
		];
	}

	/**
	 * Get the table name.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @return string
	 */
	public function get_table_name(): string {
		return 'dokan_order_stats';
	}

	/**
	 * Get the ID field name.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @return string
	 */
	protected function get_id_field_name(): string {
		return 'order_id';
	}

	/**
	 * Get order stats by vendor ID.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @param int $vendor_id The vendor ID.
	 *
	 * @return array Array of VendorOrderStats objects.
	 */
	public function get_by_vendor_id( int $vendor_id ): array {
		global $wpdb;

		$table_name = $this->get_table_name_with_prefix();

		$this->clear_all_clauses();
		$this->add_sql_clause( 'select', $this->get_selected_columns() );
		$this->add_sql_clause( 'from', $table_name );
		$this->add_sql_clause(
			'where',
			$wpdb->prepare(
				' AND vendor_id = %d',
				$vendor_id
			)
		);

		$results = $wpdb->get_results( $this->get_query_statement() ); // phpcs:ignore
		if ( ! $results ) {
			return [];
		}

		$order_stats_array = [];
		foreach ( $results as $result ) {
			$order_stats = new VendorOrderStats();
			$order_stats->set_id( $result->order_id );
			$order_stats->set_props( $this->map_db_raw_to_model_data( $result ) );
			$order_stats->set_object_read( true );
			$order_stats_array[] = $order_stats;
		}

		return $order_stats_array;
	}

	/**
	 * Get total sales for a vendor within a date range.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @param int    $vendor_id  The vendor ID.
	 * @param string $start_date Start date in Y-m-d format.
	 * @param string $end_date   End date in Y-m-d format.
	 *
	 * @return float Total sales amount.
	 */
	public function get_total_sales_by_vendor( int $vendor_id, string $start_date, string $end_date ): float {
		global $wpdb;

		$this->clear_all_clauses();
		$this->add_sql_clause( 'select', 'SUM(dos.vendor_earning + dos.admin_commission) as total_sales' );
		$this->add_sql_clause( 'from', $this->get_table_name_with_prefix() . ' dos' );
		$this->add_sql_clause( 'join', "JOIN {$wpdb->posts} p ON dos.order_id = p.ID" );
		$this->add_sql_clause( 'where', $wpdb->prepare( 'dos.vendor_id = %d', $vendor_id ) );
		$this->add_sql_clause( 'where', "p.post_type = 'shop_order'" );
		$this->add_sql_clause( 'where', "p.post_status IN ('wc-completed', 'wc-processing', 'wc-on-hold')" );
		$this->add_sql_clause( 'where', $wpdb->prepare( 'DATE(p.post_date) BETWEEN %s AND %s', $start_date, $end_date ) );

		$query_statement = $this->get_query_statement();

		$total_sales = $wpdb->get_var( $query_statement );

		return (float) $total_sales;
	}

	/**
	 * Get daily sales data for a date range.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @param string $start_date Start date in Y-m-d format.
	 * @param string $end_date   End date in Y-m-d format.
	 *
	 * @return array Daily sales data.
	 */
	public function get_daily_sales_data( string $start_date, string $end_date ): array {
		global $wpdb;

		$this->clear_all_clauses();
		$this->add_sql_clause( 'select', 'DATE(p.post_date) as date' );
		$this->add_sql_clause( 'select', 'SUM(dos.vendor_earning + dos.admin_commission) as total_sales' );
		$this->add_sql_clause( 'select', 'SUM(dos.vendor_earning) as net_sales' );
		$this->add_sql_clause( 'select', 'SUM(dos.admin_commission) as commissions' );
		$this->add_sql_clause( 'from', $this->get_table_name_with_prefix() . ' dos' );
		$this->add_sql_clause( 'join', "JOIN {$wpdb->posts} p ON dos.order_id = p.ID" );
		$this->add_sql_clause( 'where', "p.post_type = 'shop_order'" );
		$this->add_sql_clause( 'where', "p.post_status IN ('wc-completed', 'wc-processing', 'wc-on-hold')" );
		$this->add_sql_clause( 'where', $wpdb->prepare( 'DATE(p.post_date) BETWEEN %s AND %s', $start_date, $end_date ) );
		$this->add_sql_clause( 'group_by', 'DATE(p.post_date)' );
		$this->add_sql_clause( 'order_by', 'DATE(p.post_date) ASC' );

		$query_statement = $this->get_query_statement();

		$results = $wpdb->get_results( $query_statement, ARRAY_A ); // phpcs:ignore

		return $results ?: [];
	}

	/**
	 * Get count of active vendors within a date range.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @param string $start_date Start date in Y-m-d format.
	 * @param string $end_date   End date in Y-m-d format.
	 *
	 * @return int Count of active vendors.
	 */
	public function get_active_vendors_count( string $start_date, string $end_date ): int {
		global $wpdb;

		$this->clear_all_clauses();
		$this->add_sql_clause( 'select', 'COUNT(DISTINCT vendor_id)' );
		$this->add_sql_clause( 'from', $this->get_table_name_with_prefix() . ' dos' );
		$this->add_sql_clause( 'join', "JOIN {$wpdb->posts} p ON dos.order_id = p.ID" );
		$this->add_sql_clause( 'where', "p.post_type = 'shop_order'" );
		$this->add_sql_clause( 'where', "p.post_status IN ('wc-completed', 'wc-processing', 'wc-on-hold')" );
		$this->add_sql_clause( 'where', $wpdb->prepare( 'DATE(p.post_date) BETWEEN %s AND %s', $start_date, $end_date ) );

		$query_statement = $this->get_query_statement();

		$count = $wpdb->get_var( $query_statement ); // phpcs:ignore

		return (int) $count;
	}

	/**
	 * Get top performing vendors.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @param int $limit Number of vendors to retrieve. Default 5.
	 *
	 * @return array Array of vendor data with sales metrics.
	 */
	public function get_top_performing_vendors( int $limit = 5 ): array {
		global $wpdb;

		$this->clear_all_clauses();
		$this->add_sql_clause( 'select', 'vendor_id,' );
		$this->add_sql_clause( 'select', 'COUNT(order_id) as total_orders,' );
		$this->add_sql_clause( 'select', 'SUM(vendor_earning) as total_earning,' );
		$this->add_sql_clause( 'select', 'SUM(admin_commission) as total_commission' );
		$this->add_sql_clause( 'from', $this->get_table_name_with_prefix() );
		$this->add_sql_clause( 'group_by', 'vendor_id' );
		$this->add_sql_clause( 'order_by', 'total_earning DESC' );
		$this->add_sql_clause( 'limit', 'LIMIT ' . $limit );

		$vendors = $wpdb->get_results( $this->get_query_statement(), ARRAY_A );

		return $vendors ?? [];
	}
}
