<?php

namespace WeDevs\Dokan\Models\DataStore;

use DatePeriod;
use DateInterval;
use DateTimeImmutable;
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

        $this->clear_all_clauses();
        $this->add_sql_clause( 'select', 'COUNT(DISTINCT dos.vendor_id)' );
        $this->add_sql_clause( 'from', $this->get_table_name_with_prefix() . ' dos' );
        $this->add_sql_clause( 'join', "JOIN {$wpdb->prefix}wc_order_stats wos ON dos.order_id = wos.order_id" );
        $this->add_sql_clause( 'where', " AND wos.status NOT IN ( '" . implode( "','", $exclude_order_statuses ) . "' )" );
        $this->add_sql_clause( 'where', ' AND dos.vendor_earning > 0' );
        $this->add_sql_clause( 'where', $wpdb->prepare( ' AND wos.date_created BETWEEN %s AND %s', $start_date, $end_date ) );

        $query_statement = $this->get_query_statement();
        $count           = $wpdb->get_var( $query_statement ); // phpcs:ignore

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
        $this->add_sql_clause( 'where', " AND wos.status NOT IN ( '" . implode( "','", ReportUtil::get_exclude_order_statuses() ) . "' )" );
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
        $results         = $wpdb->get_results( $query_statement, ARRAY_A ); // phpcs:ignore

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
}
