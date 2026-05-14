<?php

namespace WeDevs\Dokan\Models\DataStore;

use DatePeriod;
use DateInterval;
use DateTimeImmutable;
use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Utilities\ReportUtil;

/**
 * Vendor Order Stats Store Class
 *
 * @since 4.1.0
 */
class VendorOrderStatsStore extends BaseDataStore {

    /**
     * Get the fields with format as an array where key is the db field name and value is the format.
     *
     * @since 4.1.0
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
            'vendor_shipping_tax' => '%f',
            'vendor_order_tax'    => '%f',
            'admin_earning'       => '%f',
            'admin_commission'    => '%f',
            'admin_gateway_fee'   => '%f',
            'admin_shipping_fee'  => '%f',
            'admin_discount'      => '%f',
            'admin_shipping_tax'  => '%f',
            'admin_order_tax'     => '%f',
            'admin_subsidy'       => '%f',
        ];
    }

    /**
     * Get the table name.
     *
     * @since 4.1.0
     *
     * @return string
     */
    public function get_table_name(): string {
        return 'dokan_order_stats';
    }

    /**
     * Get the ID field name.
     *
     * @since 4.1.0
     *
     * @return string
     */
    protected function get_id_field_name(): string {
        return 'order_id';
    }

    /**
     * Get count of active vendors within a date range.
     *
     * @since 4.1.0
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     *
     * @return int Count of active vendors.
     */
    public function get_active_vendors_count( string $start_date, string $end_date ): int {
        global $wpdb;

        // Get the order statuses to exclude from the report.
        $exclude_order_statuses = ReportUtil::get_exclude_order_statuses();

        // @codingStandardsIgnoreStart
        $this->clear_all_clauses();
        $this->add_sql_clause( 'select', 'COUNT(DISTINCT dos.vendor_id)' );
        $this->add_sql_clause( 'from', $this->get_table_name_with_prefix() . ' dos' );
        $this->add_sql_clause( 'join', "JOIN {$wpdb->prefix}wc_order_stats wos ON dos.order_id = wos.order_id" );
        if ( ! empty( $exclude_order_statuses ) ) {
            $placeholders = implode( ', ', array_fill( 0, count( $exclude_order_statuses ), '%s' ) );
            $this->add_sql_clause( 'where', $wpdb->prepare( " AND wos.status NOT IN ( $placeholders )", ...$exclude_order_statuses ) );
        }

        $this->add_sql_clause( 'where', ' AND dos.vendor_earning > 0' );
        $this->add_sql_clause( 'where', $wpdb->prepare( ' AND wos.date_created BETWEEN %s AND %s', $start_date, $end_date ) );

        $query_statement = $this->get_query_statement();
        $count           = $wpdb->get_var( $query_statement );
        // @codingStandardsIgnoreEnd

        return apply_filters(
            'dokan_admin_dashboard_active_vendors_count',
            (int) $count,
            $start_date,
            $end_date
        );
    }

    /**
     * Get top performing vendors.
     *
     * @since 4.1.0
     *
     * @param string $start_date Start date in Y-m-d format. Optional.
     * @param string $end_date   End date in Y-m-d format. Optional.
     * @param int $limit         Number of vendors to retrieve. Default 5.
     *
     * @return array Array of vendor data with sales metrics.
     */
    public function get_top_performing_vendors( string $start_date, string $end_date, int $limit = 5 ): array {
        global $wpdb;

        $this->clear_all_clauses();
        $this->add_sql_clause( 'select', 'dos.vendor_id,' );
        $this->add_sql_clause( 'select', 'COUNT(dos.order_id) as total_orders,' );
        $this->add_sql_clause( 'select', 'SUM(dos.vendor_earning) as total_earning,' );
        $this->add_sql_clause( 'select', 'SUM(dos.admin_commission) as total_commission' );
        $this->add_sql_clause( 'from', $this->get_table_name_with_prefix() . ' dos' );
        $this->add_sql_clause( 'join', "JOIN {$wpdb->prefix}wc_order_stats wos ON dos.order_id = wos.order_id" );
        $this->add_sql_clause( 'where', $wpdb->prepare( ' AND DATE(wos.date_created) BETWEEN %s AND %s', $start_date, $end_date ) );
        
        $this->add_sql_clause( 'group_by', 'dos.vendor_id' );
        $this->add_sql_clause( 'order_by', 'total_earning DESC' );
        $this->add_sql_clause( 'limit', 'LIMIT ' . $limit );

        $vendors = $wpdb->get_results( $this->get_query_statement(), ARRAY_A ); // phpcs:ignore

        return $vendors ?? [];
    }

    /**
     * Get sales chart data for a date range.
     *
     * @since 4.1.0
     *
     * @param string $start_date   Start date in Y-m-d format.
     * @param string $end_date     End date in Y-m-d format.
     * @param bool   $group_by_day Whether to group data by day. Default false.
     *
     * @return array Sales chart data with totals.
     */
    public function get_sales_chart_data( string $start_date, string $end_date, bool $group_by_day = false ): array {
        global $wpdb;

        // @codingStandardsIgnoreStart
        $this->clear_all_clauses();
        if ( $group_by_day ) {
            $this->add_sql_clause( 'select', 'DATE(wos.date_created) as date,' );
        }

        $this->add_sql_clause( 'select', 'SUM(wos.total_sales) as total_sales,' );
        $this->add_sql_clause( 'select', 'SUM(wos.net_total) as net_sales,' );
        $this->add_sql_clause( 'select', 'SUM(dos.admin_commission) as commissions,' );
        $this->add_sql_clause( 'select', 'COUNT(dos.order_id) as order_count' );

        // From & Join clause.
        $this->add_sql_clause( 'from', "{$wpdb->prefix}dokan_order_stats dos" );
        $this->add_sql_clause( 'join', "INNER JOIN {$wpdb->prefix}wc_order_stats wos ON dos.order_id = wos.order_id" );

        // Where conditions.
        $exclude_order_statuses = ReportUtil::get_exclude_order_statuses();
        if ( ! empty( $exclude_order_statuses ) ) {
            $placeholders = implode( ', ', array_fill( 0, count( $exclude_order_statuses ), '%s' ) );
            $this->add_sql_clause( 'where', $wpdb->prepare( " AND wos.status NOT IN ( $placeholders )", ...$exclude_order_statuses ) );
        }

        $this->add_sql_clause( 'where', 'AND wos.total_sales > 0' );
        $this->add_sql_clause(
            'where',
            $wpdb->prepare(
                'AND wos.date_created BETWEEN %s AND %s',
                $start_date . ' 00:00:00',
                $end_date . ' 23:59:59'
            )
        );

        // Group by and order by.
        if ( $group_by_day ) {
            $this->add_sql_clause( 'group_by', 'DATE(wos.date_created)' );
            $this->add_sql_clause( 'order_by', 'DATE(wos.date_created) ASC' );
        }

        // Build & log query
        $query_statement = $this->get_query_statement();
        $results         = $wpdb->get_results( $query_statement, ARRAY_A );
        // @codingStandardsIgnoreEnd

        if ( $group_by_day ) {
            return array_map(
                function ( $row ) {
                    return [
                        'date'        => $row['date'],
                        'total_sales' => (float) $row['total_sales'],
                        'net_sales'   => (float) $row['net_sales'],
                        'commissions' => (float) $row['commissions'],
                        'order_count' => (int) $row['order_count'],
                    ];
                },
                $this->fill_missing_dates( $results, $start_date, $end_date )
            );
        }

        $result = $results[0] ?? [];

        return [
            'total_sales' => (float) ( $result['total_sales'] ?? 0 ),
            'net_sales'   => (float) ( $result['net_sales'] ?? 0 ),
            'commissions' => (float) ( $result['commissions'] ?? 0 ),
            'order_count' => (int) ( $result['order_count'] ?? 0 ),
        ];
    }

    /**
     * Fill missing dates in the data array for a given date range.
     *
     * @since 4.1.0
     *
     * @param array  $data       The data array containing date and sales information.
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     *
     * @return array The data array with missing dates filled in.
     */
    protected function fill_missing_dates( array $data, string $start_date, string $end_date ): array {
        // More explicit and readable
        $start    = new DateTimeImmutable( $start_date );
        $end      = new DateTimeImmutable( $end_date );
        $interval = new DateInterval( 'P1D' );

        // Add one day to the end date to make it inclusive
        $end_inclusive = $end->modify( '+1 day' );
        $period        = new DatePeriod( $start, $interval, $end_inclusive );

        // Index data by date for faster lookup
        $data_by_date = array_column( $data, null, 'date' );

        $filled = [];
        foreach ( $period as $date ) {
            $date_key = $date->format( 'Y-m-d' );
            $filled[] = $data_by_date[ $date_key ] ?? [
                'date'        => $date_key,
                'total_sales' => 0,
                'net_sales'   => 0,
                'commissions' => 0,
                'order_count' => 0,
            ];
        }

        return $filled;
    }

    /**
     * Get report logs or earnings data from the dokan_order_stats table.
     *
     * @since 5.0.0
     *
     * @param array $args Query arguments.
     *
     * @return array Raw database results.
     */
    public function get_report_data( array $args ): array {
        global $wpdb;

        $orderby          = $args['orderby'] ?? 'order_id';
        $order            = strtoupper( $args['order'] ?? 'DESC' );
        $per_page         = absint( $args['per_page'] ?? 10 );
        $page             = absint( $args['page'] ?? 1 );
        $offset           = ( $page - 1 ) * $per_page;
        $exclude_statuses = isset( $args['exclude_statuses'] ) ? (bool) $args['exclude_statuses'] : false;

        // Whitelist orderby and order.
        $allowed_orderby = array_keys( $this->get_fields_with_format() );
        if ( ! in_array( $orderby, $allowed_orderby, true ) ) {
            $orderby = 'order_id';
        }

        if ( ! in_array( $order, [ 'ASC', 'DESC' ], true ) ) {
            $order = 'DESC';
        }

        // @codingStandardsIgnoreStart
        $this->clear_all_clauses();
        $this->add_sql_clause( 'select', 'dos.*, wos.total_sales AS order_total, wos.date_created AS order_date' );
        $this->add_sql_clause( 'from', "{$wpdb->prefix}dokan_order_stats dos" );
        $this->add_sql_clause( 'join', "INNER JOIN {$wpdb->prefix}wc_order_stats wos ON dos.order_id = wos.order_id" );

        if ( $exclude_statuses ) {
            $exclude_order_statuses = ReportUtil::get_exclude_order_statuses();
            if ( ! empty( $exclude_order_statuses ) ) {
                $placeholders = implode( ', ', array_fill( 0, count( $exclude_order_statuses ), '%s' ) );
                $this->add_sql_clause( 'where', $wpdb->prepare( " AND wos.status NOT IN ( $placeholders )", ...$exclude_order_statuses ) );
            }
        }

        // Apply query filters to report logs or earnings.
        $this->apply_report_filters( $args );

        $this->add_sql_clause( 'order_by', "dos.{$orderby} {$order}" );
        $this->add_sql_clause( 'limit', $wpdb->prepare( 'LIMIT %d OFFSET %d', $per_page, $offset ) );

        return $wpdb->get_results( $this->get_query_statement() ) ?: [];
        // @codingStandardsIgnoreEnd
    }

    /**
     * Get the total count of report logs or earnings from the dokan_order_stats table.
     *
     * @since 5.0.0
     *
     * @param array $args Query arguments.
     *
     * @return int Total count.
     */
    public function get_report_count( array $args ): int {
        global $wpdb;

        $exclude_statuses = (bool) ( $args['exclude_statuses'] ?? false );

        // @codingStandardsIgnoreStart
        $this->clear_all_clauses();
        $this->add_sql_clause( 'select', 'COUNT(*)' );
        $this->add_sql_clause( 'from', "{$wpdb->prefix}dokan_order_stats dos" );
        $this->add_sql_clause( 'join', "JOIN {$wpdb->prefix}wc_order_stats wos ON dos.order_id = wos.order_id" );

        // Get the order statuses to exclude from the report.
        $exclude_order_statuses = ReportUtil::get_exclude_order_statuses();
        if ( $exclude_statuses && ! empty( $exclude_order_statuses ) ) {
            $placeholders = implode( ', ', array_fill( 0, count( $exclude_order_statuses ), '%s' ) );
            $this->add_sql_clause( 'where', $wpdb->prepare( " AND wos.status NOT IN ( $placeholders )", ...$exclude_order_statuses ) );
        }

        $this->apply_report_filters( $args );

        return (int) $wpdb->get_var( $this->get_query_statement() );
        // @codingStandardsIgnoreEnd
    }

    /**
     * Get the report summary from the dokan_order_stats table.
     *
     * @since 5.0.0
     *
     * @return array Summary totals.
     */
    public function get_report_summary( array $args = [] ): array {
        global $wpdb;

        $exclude_statuses = (bool) ( $args['exclude_statuses'] ?? false );

        // @codingStandardsIgnoreStart
        $this->clear_all_clauses();
        $this->add_sql_clause( 'select', 'COALESCE(SUM(dos.admin_earning), 0) AS total_earnings,' );
        $this->add_sql_clause( 'select', 'COALESCE(SUM(dos.admin_commission) + SUM(CASE WHEN dos.order_type IN (' . OrderType::DOKAN_SUBSCRIPTION_ORDER . ', ' . OrderType::DOKAN_SUBSCRIPTION_REFUND_ORDER . ', ' . OrderType::DOKAN_ADVERTISEMENT_PRODUCT_ORDER . ', ' . OrderType::DOKAN_ADVERTISEMENT_REFUND_ORDER . ') THEN dos.admin_earning ELSE 0 END), 0) AS net_earning,' );
        $this->add_sql_clause( 'select', 'COALESCE(SUM(dos.admin_commission), 0) AS commission,' );
        $this->add_sql_clause( 'select', 'COALESCE(SUM(CASE WHEN dos.order_type IN (' . OrderType::DOKAN_SUBSCRIPTION_ORDER . ', ' . OrderType::DOKAN_SUBSCRIPTION_REFUND_ORDER . ') THEN dos.admin_earning ELSE 0 END), 0) AS subscription_revenue,' );
        $this->add_sql_clause( 'select', 'COALESCE(SUM(CASE WHEN dos.order_type IN (' . OrderType::DOKAN_ADVERTISEMENT_PRODUCT_ORDER . ', ' . OrderType::DOKAN_ADVERTISEMENT_REFUND_ORDER . ') THEN dos.admin_earning ELSE 0 END), 0) AS other_revenue' );
        $this->add_sql_clause( 'from', "{$wpdb->prefix}dokan_order_stats dos" );
        $this->add_sql_clause( 'join', "JOIN {$wpdb->prefix}wc_order_stats wos ON dos.order_id = wos.order_id" );

        // Get the order statuses to exclude from the report.
        $exclude_order_statuses = ReportUtil::get_exclude_order_statuses();
        if ( $exclude_statuses && ! empty( $exclude_order_statuses ) ) {
            $placeholders = implode( ', ', array_fill( 0, count( $exclude_order_statuses ), '%s' ) );
            $this->add_sql_clause( 'where', $wpdb->prepare( " AND wos.status NOT IN ( $placeholders )", ...$exclude_order_statuses ) );
        }

        $result = $wpdb->get_row( $this->get_query_statement(), ARRAY_A );
        // @codingStandardsIgnoreEnd

        return [
            'total_earnings'       => (float) ( $result['total_earnings'] ?? 0 ),
            'net_earning'          => (float) ( $result['net_earning'] ?? 0 ),
            'commission'           => (float) ( $result['commission'] ?? 0 ),
            'subscription_revenue' => (float) ( $result['subscription_revenue'] ?? 0 ),
            'other_revenue'        => (float) ( $result['other_revenue'] ?? 0 ),
        ];
    }

    /**
     * Apply common filters for report logs or earnings queries.
     *
     * @since 5.0.0
     *
     * @param array $args Query arguments.
     *
     * @return void
     */
    protected function apply_report_filters( array $args ): void {
        $this->apply_order_type_filter( $args );
        $this->apply_vendor_filter( $args );
        $this->apply_order_filter( $args );
        $this->apply_status_filter( $args );
        $this->apply_date_filter( $args );
    }

    /**
     * Apply order type filter for report logs or earnings queries.
     *
     * @since 5.0.0
     *
     * @param array $args Query arguments.
     *
     * @return void
     */
    protected function apply_order_type_filter( array $args ): void {
        global $wpdb;

        // Filter by earning type (maps to order_type values).
        $earning_type = $args['earning_type'] ?? '';
        $order_types  = $args['order_types'] ?? [];

        if ( empty( $order_types ) && ! empty( $earning_type ) ) {
            switch ( $earning_type ) {
                case 'commission':
                    $order_types = [ OrderType::DOKAN_SINGLE_ORDER, OrderType::DOKAN_SUBORDER ];
                    break;
                case 'subscription':
                    $order_types = [ OrderType::DOKAN_SUBSCRIPTION_ORDER, OrderType::DOKAN_SUBSCRIPTION_REFUND_ORDER ];
                    break;
                case 'other_revenue':
                    $order_types = [ OrderType::DOKAN_ADVERTISEMENT_PRODUCT_ORDER, OrderType::DOKAN_ADVERTISEMENT_REFUND_ORDER ];
                    break;
            }
        }

        // @codingStandardsIgnoreStart
        if ( ! empty( $order_types ) ) {
            $type_placeholders = implode( ', ', array_fill( 0, count( $order_types ), '%d' ) );
            $this->add_sql_clause( 'where', $wpdb->prepare( " AND dos.order_type IN ( $type_placeholders )", ...$order_types ) );
        } else {
            // Only exclude multivendor parent orders (order_type 0) and refund types (3, 4, 5, 7, 9).
            $exclude_order_types = [
                OrderType::DOKAN_PARENT_ORDER,
                OrderType::DOKAN_PARENT_ORDER_REFUND,
                OrderType::DOKAN_SUBORDER_REFUND,
                OrderType::DOKAN_SINGLE_ORDER_REFUND,
                OrderType::DOKAN_ADVERTISEMENT_REFUND_ORDER,
                OrderType::DOKAN_SUBSCRIPTION_REFUND_ORDER,
            ];
            $type_placeholders   = implode( ', ', array_fill( 0, count( $exclude_order_types ), '%d' ) );
            $this->add_sql_clause( 'where', $wpdb->prepare( " AND dos.order_type NOT IN ( $type_placeholders )", ...$exclude_order_types ) );
        }
        // @codingStandardsIgnoreEnd
    }

    /**
     * Apply vendor filter for report logs or earnings queries.
     *
     * @since 5.0.0
     *
     * @param array $args Query arguments.
     *
     * @return void
     */
    protected function apply_vendor_filter( array $args ): void {
        global $wpdb;

        // Filter by vendor_id.
        $vendor_id = $args['vendor_id'] ?? [];
        if ( ! empty( $vendor_id ) ) {
            $vendor_ids = is_array( $vendor_id ) ? array_map( 'absint', $vendor_id ) : [ absint( $vendor_id ) ];
            $vendor_ids = array_filter( $vendor_ids );

            // @codingStandardsIgnoreStart
            if ( ! empty( $vendor_ids ) ) {
                $placeholders = implode( ', ', array_fill( 0, count( $vendor_ids ), '%d' ) );
                $this->add_sql_clause( 'where', $wpdb->prepare( " AND dos.vendor_id IN ( $placeholders )", ...$vendor_ids ) );
            }
            // @codingStandardsIgnoreEnd
        }
    }

    /**
     * Apply order filter for report logs or earnings queries.
     *
     * @since 5.0.0
     *
     * @param array $args Query arguments.
     *
     * @return void
     */
    protected function apply_order_filter( array $args ): void {
        global $wpdb;

        // Filter by order_id.
        $order_id = $args['order_id'] ?? 0;
        if ( ! empty( $order_id ) ) {
            $order_id = absint( $order_id );

            // @codingStandardsIgnoreStart
            $this->add_sql_clause( 'where', $wpdb->prepare( " AND dos.order_id IN ( %d )", $order_id ) );
            // @codingStandardsIgnoreEnd
        }
    }

    /**
     * Apply order status filter for report logs or earnings queries.
     *
     * @since 5.0.0
     *
     * @param array $args Query arguments.
     *
     * @return void
     */
    protected function apply_status_filter( array $args ): void {
        global $wpdb;

        // Filter by order_status via the WC orders table.
        $order_status = $args['order_status'] ?? '';
        if ( ! empty( $order_status ) ) {
            $status = sanitize_text_field( $order_status );
            // @codingStandardsIgnoreStart
            $this->add_sql_clause( 'where', $wpdb->prepare( " AND wos.status IN ( %s )", $status ) );
            // @codingStandardsIgnoreEnd
        }
    }

    /**
     * Apply date filter for report logs or earnings queries.
     *
     * @since 5.0.0
     *
     * @param array $args Query arguments.
     *
     * @return void
     */
    protected function apply_date_filter( array $args ): void {
        global $wpdb;

        // Date filters.
        $start_date = $args['start_date'] ?? '';
        $end_date   = $args['end_date'] ?? '';

        if ( $start_date && $end_date ) {
            // Check if join with wc_order_stats already exists.
            $join_clause = $this->get_sql_clause( 'join' );
            if ( false === strpos( $join_clause, 'wc_order_stats' ) ) {
                $this->add_sql_clause( 'join', "INNER JOIN {$wpdb->prefix}wc_order_stats wos ON dos.order_id = wos.order_id" );
            }

            $this->add_sql_clause(
                'where',
                $wpdb->prepare(
                    ' AND wos.date_created >= %s AND wos.date_created <= %s',
                    $start_date . ' 00:00:00',
                    $end_date . ' 23:59:59'
                )
            );
        }
    }
    /**
     * Get refund data for the given order IDs.
     *
     * @since 5.0.0
     *
     * @param array $order_ids Array of order IDs.
     *
     * @return array Refund data indexed by parent ID.
     */
    public function get_refund_data( array $order_ids ): array {
        if ( empty( $order_ids ) ) {
            return [];
        }

        global $wpdb;

        // @codingStandardsIgnoreStart
        $this->clear_all_clauses();
        $this->add_sql_clause( 'select', 'parent_id, SUM(total_sales) as total_refunded' );
        $this->add_sql_clause( 'from', "{$wpdb->prefix}wc_order_stats" );

        $placeholders = implode( ', ', array_fill( 0, count( $order_ids ), '%d' ) );
        $this->add_sql_clause( 'where', $wpdb->prepare( " AND parent_id IN ( $placeholders )", ...$order_ids ) );
        $this->add_sql_clause( 'where', " AND (status = 'wc-refunded' OR total_sales < 0)" );

        $this->add_sql_clause( 'group_by', 'parent_id' );

        $refund_results = $wpdb->get_results( $this->get_query_statement() );
        // @codingStandardsIgnoreEnd

        $refunds = [];
        foreach ( $refund_results as $refund ) {
            $refunds[ $refund->parent_id ] = abs( $refund->total_refunded );
        }

        return $refunds;
    }
}
