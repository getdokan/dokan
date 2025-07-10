<?php

namespace WeDevs\Dokan\Models\DataStore;

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
        $this->add_sql_clause( 'select', 'COUNT(DISTINCT dos.vendor_id)' );
        $this->add_sql_clause( 'from', $this->get_table_name_with_prefix() . ' dos' );
        $this->add_sql_clause( 'join', "JOIN {$wpdb->prefix}wc_order_stats wos ON dos.order_id = wos.order_id" );
        $this->add_sql_clause( 'where', " AND wos.status IN ('wc-completed', 'wc-processing', 'wc-on-hold')" );
        $this->add_sql_clause( 'where', ' AND dos.vendor_earning > 0' );
        $this->add_sql_clause( 'where', $wpdb->prepare( ' AND wos.date_created BETWEEN %s AND %s', $start_date, $end_date ) );

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

    /**
     * Get sales chart data for a date range.
     *
     * @since DOKAN_SINCE
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     *
     * @return array Sales chart data with totals.
     */
    public function get_sales_chart_data( string $start_date, string $end_date ): array {
        global $wpdb;

        $this->clear_all_clauses();
        $this->add_sql_clause( 'select', 'SUM(wos.total_sales) as total_sales,' );
        $this->add_sql_clause( 'select', 'SUM(wos.net_total) as net_sales,' );
        $this->add_sql_clause( 'select', 'SUM(dos.admin_commission) as commissions,' );
        $this->add_sql_clause( 'select', 'COUNT(dos.order_id) as order_count' );
        $this->add_sql_clause( 'from', $this->get_table_name_with_prefix() . ' dos' );
        $this->add_sql_clause( 'join', "INNER JOIN {$wpdb->prefix}wc_order_stats wos ON dos.order_id = wos.order_id" );
        $this->add_sql_clause( 'where', " AND wos.status IN ('wc-completed', 'wc-processing', 'wc-on-hold')" );
        $this->add_sql_clause( 'where', ' AND wos.total_sales > 0' );
        $this->add_sql_clause( 'where', $wpdb->prepare( ' AND wos.date_created BETWEEN %s AND %s', $start_date, $end_date ) );

        $query_statement = $this->get_query_statement();

        $result = $wpdb->get_row( $query_statement, ARRAY_A ); // phpcs:ignore

        return [
            'total_sales' => (float) ( $result['total_sales'] ?? 0 ),
            'net_sales'   => (float) ( $result['net_sales'] ?? 0 ),
            'commissions' => (float) ( $result['commissions'] ?? 0 ),
            'order_count' => (int) ( $result['order_count'] ?? 0 ),
        ];
    }
}
