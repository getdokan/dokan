<?php

namespace WeDevs\Dokan\Models\DataStore;

use Automattic\WooCommerce\Admin\API\Reports\Orders\Stats\Query as DataStore;
use WeDevs\Dokan\Utilities\ReportUtil;

/**
 * Admin Report Stats Store Class
 *
 * @since DOKAN_SINCE
 */
class AdminReportStatsStore extends BaseDataStore {

    /**
     * Vendor Order Stats Store instance.
     *
     * @var VendorOrderStatsStore
     */
    protected $vendor_order_stats_store;

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        $this->vendor_order_stats_store = new VendorOrderStatsStore();
        parent::__construct();
    }

    /**
     * Get the fields with format as an array where key is the db field name and value is the format.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    protected function get_fields_with_format(): array {
        return [
            'order_id'  => '%d',
            'net_total' => '%f',
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
        return 'wc_order_stats';
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
     * Get net sales for a given date range.
     *
     * @since DOKAN_SINCE
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     * @param int    $seller_id  Seller ID. Optional.
     *
     * @return float Net sales amount.
     */
    public function get_net_sales( string $start_date, string $end_date, int $seller_id = 0 ): float {
        $query_args = apply_filters(
            'dokan_admin_report_stats_net_sales_args',
            [
                'before' => $end_date . ' 23:59:59',
                'after'  => $start_date . ' 00:00:00',
                'fields' => [
                    'net_revenue',
                ],
            ],
            $start_date,
            $end_date,
            $seller_id
        );

        $net_sales = $this->get_stats_data( $query_args, 'net_revenue' );

        return apply_filters( 'dokan_admin_report_stats_net_sales', (float) $net_sales, $start_date, $end_date, $seller_id );
    }

    /**
     * Get commission earned for a given date range.
     *
     * @since DOKAN_SINCE
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     * @param int    $seller_id  Seller ID. Optional.
     *
     * @return float Commission earned amount.
     */
    public function get_commission_earned( string $start_date, string $end_date, int $seller_id = 0 ): float {
        $query_args = apply_filters(
            'dokan_admin_report_stats_commission_earned_args',
            [
                'before' => $end_date . ' 23:59:59',
                'after'  => $start_date . ' 00:00:00',
                'fields' => [
                    'net_revenue',
                    'total_admin_commission',
                ],
            ],
            $start_date,
            $end_date,
            $seller_id
        );

        $commission = $this->get_stats_data( $query_args, 'total_admin_commission' );

        return apply_filters( 'dokan_admin_report_stats_commission_earned', (float) $commission, $start_date, $end_date, $seller_id );
    }

    /**
     * Get stats data for a given query args and field.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $query_args Query arguments.
     * @param string $field      Field name.
     *
     * @return float Stats data.
     */
    protected function get_stats_data( array $query_args, string $field ): float {
        $stats_query = new DataStore( $query_args );
        $stats_data  = $stats_query->get_data();

        if ( is_wp_error( $stats_data ) ) {
            return 0;
        }

        return (float) ( $stats_data->totals->$field ?? 0 );
    }

    /**
     * Get order count for a given date range.
     *
     * @since DOKAN_SINCE
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     * @param int    $seller_id  Seller ID. Optional.
     *
     * @return int Order count.
     */
    public function get_order_count( string $start_date, string $end_date, int $seller_id = 0 ): int {
        global $wpdb;

        $exclude_order_statuses = ReportUtil::get_exclude_order_statuses();

        $this->clear_all_clauses();
        $this->add_sql_clause( 'select', 'COUNT(DISTINCT dos.order_id) as total_orders' );
        $this->add_sql_clause( 'from', "{$wpdb->prefix}dokan_order_stats dos" );
        $this->add_sql_clause( 'join', "INNER JOIN {$wpdb->prefix}wc_order_stats wos ON dos.order_id = wos.order_id" );
        $this->add_sql_clause( 'where', " AND wos.status NOT IN ('" . implode( "','", $exclude_order_statuses ) . "')" );
        $this->add_sql_clause( 'where', $wpdb->prepare( ' AND DATE(wos.date_created) BETWEEN %s AND %s', $start_date, $end_date ) );

        if ( $seller_id ) {
            $this->add_sql_clause( 'where', $wpdb->prepare( ' AND dos.vendor_id = %d', $seller_id ) );
        }

        $result = $wpdb->get_var( $this->get_query_statement() ); // phpcs:ignore

        return apply_filters( 'dokan_admin_report_stats_order_count', (int) ( $result ?? 0 ), $start_date, $end_date, $seller_id );
    }

    /**
     * Get overview chart data for a given date range.
     *
     * @since DOKAN_SINCE
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     * @param string $group_by   Group by 'day' or 'month'. Default 'day'.
     * @param int    $seller_id  Seller ID. Optional.
     *
     * @return array Chart data rows.
     */
    public function get_overview_chart_data( string $start_date, string $end_date, string $group_by = 'day', int $seller_id = 0 ): array {
        global $wpdb;

        $exclude_order_statuses = ReportUtil::get_exclude_order_statuses();

        $this->clear_all_clauses();

        if ( 'day' === $group_by ) {
            $this->add_sql_clause( 'select', 'DATE(wos.date_created) as date,' );
        } else {
            $this->add_sql_clause( 'select', "DATE_FORMAT(wos.date_created, '%Y-%m-01') as date," );
        }

        $this->add_sql_clause( 'select', 'SUM(wos.net_total) as net_sales,' );
        $this->add_sql_clause( 'select', 'COUNT(DISTINCT dos.order_id) as total_orders,' );
        $this->add_sql_clause( 'select', 'SUM(dos.admin_commission) as commission' );
        $this->add_sql_clause( 'from', "{$wpdb->prefix}dokan_order_stats dos" );
        $this->add_sql_clause( 'join', "INNER JOIN {$wpdb->prefix}wc_order_stats wos ON dos.order_id = wos.order_id" );
        $this->add_sql_clause( 'where', " AND wos.status NOT IN ('" . implode( "','", $exclude_order_statuses ) . "')" );
        $this->add_sql_clause( 'where', ' AND wos.net_total > 0' );
        $this->add_sql_clause(
            'where',
            $wpdb->prepare(
                ' AND wos.date_created BETWEEN %s AND %s',
                $start_date . ' 00:00:00',
                $end_date . ' 23:59:59'
            )
        );

        if ( $seller_id ) {
            $this->add_sql_clause( 'where', $wpdb->prepare( ' AND dos.vendor_id = %d', $seller_id ) );
        }

        if ( 'day' === $group_by ) {
            $this->add_sql_clause( 'group_by', 'DATE(wos.date_created)' );
            $this->add_sql_clause( 'order_by', 'DATE(wos.date_created) ASC' );
        } else {
            $this->add_sql_clause( 'group_by', "DATE_FORMAT(wos.date_created, '%Y-%m-01')" );
            $this->add_sql_clause( 'order_by', "DATE_FORMAT(wos.date_created, '%Y-%m-01') ASC" );
        }

        $results = $wpdb->get_results( $this->get_query_statement(), ARRAY_A ); // phpcs:ignore

        return apply_filters( 'dokan_admin_report_stats_overview_chart_data', $results ?? [], $start_date, $end_date, $group_by, $seller_id );
    }

    /**
     * Get vendor data including signup counts and approval status.
     *
     * @since DOKAN_SINCE
     *
     * @param string|null $from Start date. Optional.
     * @param string|null $to   End date. Optional.
     *
     * @return array Vendor data.
     */
    public function get_vendor_data( $from = null, $to = null ): array {
        $vendor_data = dokan_get_seller_count( $from, $to );

        // Remove percentage data - calculated in frontend.
        unset( $vendor_data['class'], $vendor_data['parcent'], $vendor_data['this_period'] );

        return apply_filters( 'dokan_admin_report_stats_vendor_data', $vendor_data, $from, $to );
    }

    /**
     * Get product count data.
     *
     * @since DOKAN_SINCE
     *
     * @param string|null $from      Start date. Optional.
     * @param string|null $to        End date. Optional.
     * @param int         $seller_id Seller ID. Optional.
     *
     * @return array Product count data.
     */
    public function get_product_data( $from = null, $to = null, $seller_id = 0 ): array {
        $product_data = dokan_get_product_count( $from, $to, $seller_id );

        // Remove percentage data - calculated in frontend.
        unset( $product_data['class'], $product_data['parcent'], $product_data['this_period'] );

        return apply_filters( 'dokan_admin_report_stats_product_data', $product_data, $from, $to, $seller_id );
    }

    /**
     * Get pending withdrawal count data.
     *
     * @since DOKAN_SINCE
     *
     * @return array Withdraw data.
     */
    public function get_withdraw_data(): array {
        return apply_filters( 'dokan_admin_report_stats_withdraw_data', dokan_get_withdraw_count() );
    }
}
