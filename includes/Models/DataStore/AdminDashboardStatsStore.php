<?php

namespace WeDevs\Dokan\Models\DataStore;

use WeDevs\Dokan\Utilities\ReportUtil;

/**
 * Admin Dashboard Stats Store Class
 *
 * @since 4.1.0
 */
class AdminDashboardStatsStore extends BaseDataStore {

    /**
     * Vendor Order Stats Store instance.
     *
     * @var VendorOrderStatsStore
     */
    protected $vendor_order_stats_store;

    /**
     * Constructor.
     *
     * @since 4.1.0
     */
    public function __construct() {
        $this->vendor_order_stats_store = new VendorOrderStatsStore();
        parent::__construct();
    }

    /**
     * Get the fields with format as an array where key is the db field name and value is the format.
     *
     * @since 4.1.0
     *
     * @return array
     */
    protected function get_fields_with_format(): array {
        return [
            'ID'                    => '%d',
            'post_author'           => '%d',
            'post_date'             => '%s',
            'post_date_gmt'         => '%s',
            'post_content'          => '%s',
            'post_title'            => '%s',
            'post_excerpt'          => '%s',
            'post_status'           => '%s',
            'comment_status'        => '%s',
            'ping_status'           => '%s',
            'post_password'         => '%s',
            'post_name'             => '%s',
            'to_ping'               => '%s',
            'pinged'                => '%s',
            'post_modified'         => '%s',
            'post_modified_gmt'     => '%s',
            'post_content_filtered' => '%s',
            'post_parent'           => '%d',
            'guid'                  => '%s',
            'menu_order'            => '%d',
            'post_type'             => '%s',
            'post_mime_type'        => '%s',
            'comment_count'         => '%d',
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
        return 'posts';
    }

    /**
     * Get the ID field name.
     *
     * @since 4.1.0
     *
     * @return string
     */
    protected function get_id_field_name(): string {
        return 'ID';
    }


    /**
     * Get recurring customers data for current and previous periods using wc_order_stats.
     *
     * @since 4.1.0
     *
     * @param array $date_range Array containing date range information.
     *
     * @return array Recurring customers data.
     */
    public function get_recurring_customers_data( array $date_range ): array {
        global $wpdb;

        // Get the order statuses to exclude from the report.
        $exclude_order_statuses = ReportUtil::get_exclude_order_statuses();

        $this->clear_all_clauses();
        // phpcs:disable
        $this->add_sql_clause(
            'select',
            $wpdb->prepare(
                'COUNT(DISTINCT CASE WHEN DATE(os1.date_created) BETWEEN %s AND %s THEN os1.customer_id END) as current_count,',
                $date_range['current_month_start'],
                $date_range['current_month_end']
            )
        );
        $this->add_sql_clause(
            'select',
            $wpdb->prepare(
                'COUNT(DISTINCT CASE WHEN DATE(os1.date_created) BETWEEN %s AND %s THEN os1.customer_id END) as previous_count',
                $date_range['previous_month_start'],
                $date_range['previous_month_end']
            )
        );
        $this->add_sql_clause( 'from', "{$wpdb->prefix}wc_order_stats os1" );
        $this->add_sql_clause( 'where', " AND os1.status NOT IN ( '" . implode( "','", $exclude_order_statuses ) . "' )" );
        $this->add_sql_clause( 'where', " AND os1.customer_id > 0" );
        $this->add_sql_clause(
            'where',
            $wpdb->prepare(
                ' AND ((DATE(os1.date_created) BETWEEN %s AND %s) OR (DATE(os1.date_created) BETWEEN %s AND %s))',
                $date_range['current_month_start'],
                $date_range['current_month_end'],
                $date_range['previous_month_start'],
                $date_range['previous_month_end']
            )
        );

        // Only include customers who had orders the comparison periods ago
        $this->add_sql_clause(
            'where',
            $wpdb->prepare(
                "AND os1.customer_id IN (
                SELECT DISTINCT customer_id
                FROM {$wpdb->prefix}wc_order_stats os2
                WHERE os2.status NOT IN ( '" . implode( "','", $exclude_order_statuses ) . "' )
                AND os2.customer_id > 0
                AND DATE(os2.date_created) < %s
            )",
                $date_range['previous_month_start']
            )
        );

        $query_statement = $this->get_query_statement();
        $result          = $wpdb->get_row( $query_statement, ARRAY_A ); // phpcs:ignore
        // phpcs:enable

        return apply_filters(
            'dokan_admin_dashboard_recurring_customers_data',
            [
                'icon'     => 'FileUser',
                'current'  => (int) ( $result['current_count'] ?? 0 ),
                'previous' => (int) ( $result['previous_count'] ?? 0 ),
                'title'    => esc_html__( 'Recurring Customers', 'dokan-lite' ),
                'tooltip'  => esc_html__( 'Customers who returned and purchased again in the time period', 'dokan-lite' ),
                'position' => 50,
            ],
            $date_range
        );
    }

    /**
     * Get new customers data for current and previous periods.
     *
     * @since 4.1.0
     *
     * @param array $date_range Array containing date range information.
     *
     * @return array New customers data.
     */
    public function get_new_customers_data( array $date_range ): array {
        global $wpdb;

        $this->clear_all_clauses();
        $this->add_sql_clause(
            'select',
            $wpdb->prepare(
                'SUM(CASE WHEN u.user_registered BETWEEN %s AND %s THEN 1 ELSE 0 END) as current_count,',
                $date_range['current_month_start'],
                $date_range['current_month_end']
            )
        );
        $this->add_sql_clause(
            'select',
            $wpdb->prepare(
                'SUM(CASE WHEN u.user_registered BETWEEN %s AND %s THEN 1 ELSE 0 END) as previous_count',
                $date_range['previous_month_start'],
                $date_range['previous_month_end']
            )
        );
        $this->add_sql_clause( 'from', "{$wpdb->users} u" );
        $this->add_sql_clause( 'join', "JOIN {$wpdb->usermeta} um ON u.ID = um.user_id" );
        $this->add_sql_clause( 'where', $wpdb->prepare( ' AND u.user_registered BETWEEN %s AND %s', $date_range['previous_month_start'], $date_range['current_month_end'] ) );
        $this->add_sql_clause( 'where', $wpdb->prepare( ' AND um.meta_key = %s', $wpdb->prefix . 'capabilities' ) );
        $this->add_sql_clause( 'where', $wpdb->prepare( ' AND um.meta_value LIKE %s', '%customer%' ) );

        $query_statement = $this->get_query_statement();
        $result          = $wpdb->get_row( $query_statement, ARRAY_A ); // phpcs:ignore

        return apply_filters(
            'dokan_admin_dashboard_new_customers_data',
            [
                'icon'     => 'FileUser',
                'current'  => (int) ( $result['current_count'] ?? 0 ),
                'previous' => (int) ( $result['previous_count'] ?? 0 ),
                'title'    => esc_html__( 'New Customers', 'dokan-lite' ),
                'tooltip'  => esc_html__( 'Total new customers registered in the time period', 'dokan-lite' ),
                'position' => 40,
            ],
            $date_range
        );
    }

    /**
     * Get order cancellation rate data for current and previous periods.
     *
     * @since 4.1.0
     *
     * @param array $date_range Array containing date range information.
     *
     * @return array Order cancellation rate data.
     */
    public function get_order_cancellation_rate_data( array $date_range ): array {
        global $wpdb;

        $this->clear_all_clauses();
        $this->add_sql_clause(
            'select',
            $wpdb->prepare(
                'CASE 
                    WHEN post_date BETWEEN %s AND %s THEN \'current\'
                    WHEN post_date BETWEEN %s AND %s THEN \'previous\'
                END as period,',
                $date_range['current_month_start'], $date_range['current_month_end'],
                $date_range['previous_month_start'], $date_range['previous_month_end']
            )
        );
        $this->add_sql_clause( 'select', 'COUNT(*) as total_orders,' );
        $this->add_sql_clause( 'select', 'SUM(CASE WHEN post_status = \'wc-cancelled\' THEN 1 ELSE 0 END) as cancelled_orders' );
        $this->add_sql_clause( 'from', $this->get_table_name_with_prefix() );
        $this->add_sql_clause( 'where', " AND post_type = 'shop_order'" );
        $this->add_sql_clause(
            'where',
            $wpdb->prepare(
                ' AND ((post_date BETWEEN %s AND %s) OR (post_date BETWEEN %s AND %s))',
                $date_range['current_month_start'],
                $date_range['current_month_end'],
                $date_range['previous_month_start'],
                $date_range['previous_month_end']
            )
        );
        $this->add_sql_clause( 'group_by', 'period' );

        $query_statement = $this->get_query_statement();
        $stats = $wpdb->get_results( $query_statement ); // phpcs:ignore

        // Initialize order stats with default values.
        $order_stats = [
            'current' => [
                'total_orders'     => 0,
                'cancelled_orders' => 0,
            ],
            'previous' => [
                'total_orders'     => 0,
                'cancelled_orders' => 0,
            ],
        ];

        foreach ( $stats as $stat ) {
            $order_stats[ $stat->period ] = [
                'total_orders'     => (int) ( $stat->total_orders ?? 0 ),
                'cancelled_orders' => (int) ( $stat->cancelled_orders ?? 0 ),
            ];
        }

        return apply_filters(
            'dokan_admin_dashboard_order_cancellation_rate_data',
            [
                ...$order_stats,
                'icon'     => 'BanknoteX',
                'title'    => esc_html__( 'Order Cancellation Rate', 'dokan-lite' ),
                'tooltip'  => esc_html__( 'Rate of orders which got cancelled in the time period', 'dokan-lite' ),
                'position' => 80,
            ],
            $date_range
        );
    }

    /**
     * Get new products data for current and previous periods.
     *
     * @since 4.1.0
     *
     * @param array $date_range Array containing date range information.
     *
     * @return array New products' data.
     */
    public function get_new_products_data( array $date_range ): array {
        $advertise_product = get_option( 'dokan_advertisement_product_id', 0 );
        $product_types     = $this->get_filtered_product_types();

        $args = [
            'status'       => 'publish',
            'type'         => array_keys( $product_types ),
            'limit'        => -1,
            'return'       => 'ids',
            'post__not_in' => [ $advertise_product ],
        ];

        $current_products = wc_get_products(
            array_merge(
                $args,
                [ 'date_created' => $date_range['current_month_start'] . '...' . $date_range['current_month_end'] ]
            )
        );

        $previous_products = wc_get_products(
            array_merge(
                $args,
                [ 'date_created' => $date_range['previous_month_start'] . '...' . $date_range['previous_month_end'] ]
            )
        );

        return apply_filters(
            'dokan_admin_dashboard_new_products_data',
            [
                'icon'     => 'Box',
                'current'  => count( $current_products ),
                'previous' => count( $previous_products ),
                'title'    => esc_html__( 'New Products', 'dokan-lite' ),
                'tooltip'  => esc_html__( 'New products published in the month', 'dokan-lite' ),
                'position' => 10,
            ],
            $date_range
        );
    }

    /**
     * Get active vendors data for current and previous periods using VendorOrderStatsStore.
     *
     * @since 4.1.0
     *
     * @param array $date_range Array containing date range information.
     *
     * @return array Active vendors data.
     */
    public function get_active_vendors_data( array $date_range ): array {
        // Use VendorOrderStatsStore for dokan_order_stats queries
        $current_count = $this->vendor_order_stats_store->get_active_vendors_count(
            $date_range['current_month_start'],
            $date_range['current_month_end']
        );

        $previous_count = $this->vendor_order_stats_store->get_active_vendors_count(
            $date_range['previous_month_start'],
            $date_range['previous_month_end']
        );

        return apply_filters(
            'dokan_admin_dashboard_active_vendors_data',
            [
                'icon'     => 'UserCog',
                'current'  => (int) $current_count,
                'previous' => (int) $previous_count,
                'title'    => esc_html__( 'Active Vendors', 'dokan-lite' ),
                'tooltip'  => esc_html__( 'Vendors sold minimum 1 product', 'dokan-lite' ),
                'position' => 20,
            ],
            $date_range
        );
    }

    /**
     * Get new vendor registration data for current and previous periods.
     *
     * @since 4.1.0
     *
     * @param array $date_range Array containing date range information.
     *
     * @return array New vendor registration data.
     */
    public function get_new_vendor_registration_data( array $date_range ): array {
        global $wpdb;

        $this->clear_all_clauses();
        $this->add_sql_clause(
            'select',
            $wpdb->prepare(
                'SUM(CASE WHEN u.user_registered BETWEEN %s AND %s THEN 1 ELSE 0 END) as current_count,',
                $date_range['current_month_start'] . ' 00:00:00',
                $date_range['current_month_end'] . ' 23:59:59'
            )
        );
        $this->add_sql_clause(
            'select',
            $wpdb->prepare(
                'SUM(CASE WHEN u.user_registered BETWEEN %s AND %s THEN 1 ELSE 0 END) as previous_count',
                $date_range['previous_month_start'] . ' 00:00:00',
                $date_range['previous_month_end'] . ' 23:59:59'
            )
        );
        $this->add_sql_clause( 'from', "{$wpdb->users} u" );
        $this->add_sql_clause( 'join', "JOIN {$wpdb->usermeta} um ON u.ID = um.user_id" );
        $this->add_sql_clause( 'where', $wpdb->prepare( ' AND u.user_registered BETWEEN %s AND %s', $date_range['previous_month_start'] . ' 00:00:00', $date_range['current_month_end'] . ' 23:59:59' ) );
        $this->add_sql_clause( 'where', $wpdb->prepare( ' AND um.meta_key = %s', $wpdb->prefix . 'capabilities' ) );
        $this->add_sql_clause( 'where', $wpdb->prepare( ' AND um.meta_value LIKE %s', '%seller%' ) );

        $query_statement = $this->get_query_statement();
        $result          = $wpdb->get_row( $query_statement, ARRAY_A ); // phpcs:ignore

        return apply_filters(
            'dokan_admin_dashboard_new_vendor_registration_data',
            [
                'icon'     => 'UserRoundPlus',
                'current'  => (int) ( $result['current_count'] ?? 0 ),
                'previous' => (int) ( $result['previous_count'] ?? 0 ),
                'title'    => esc_html__( 'New Vendor Registration', 'dokan-lite' ),
                'tooltip'  => esc_html__( 'Total vendors who got registered in the time period', 'dokan-lite' ),
                'position' => 30,
            ],
            $date_range
        );
    }

    /**
     * Get monthly overview data including new customers and order stats.
     *
     * @since 4.1.0
     *
     * @param array $date_range Array containing date range information.
     *
     * @return array Monthly overview data.
     */
    public function get_monthly_overview( array $date_range ): array {
        return apply_filters(
            'dokan_admin_dashboard_monthly_overview',
            [
                'new_products'            => $this->get_new_products_data( $date_range ),
                'active_vendors'          => $this->get_active_vendors_data( $date_range ),
                'new_vendor_registration' => $this->get_new_vendor_registration_data( $date_range ),
                'new_customers'           => $this->get_new_customers_data( $date_range ),
                'order_cancellation_rate' => $this->get_order_cancellation_rate_data( $date_range ),
                'recurring_customers'     => $this->get_recurring_customers_data( $date_range ),
            ],
            $date_range
        );
    }

    /**
     * Get top performing vendors using VendorOrderStatsStore.
     *
     * @since 4.1.0
     *
     * @param string $start_date Start date in Y-m-d format. Optional.
     * @param string $end_date   End date in Y-m-d format. Optional.
     * @param int $limit Number of vendors to retrieve. Default 5.
     *
     * @return array Array of vendor data with sales metrics.
     */
    public function get_top_performing_vendors( string $start_date, string $end_date, int $limit = 5 ): array {
        // Use VendorOrderStatsStore for dokan_order_stats queries
        return $this->vendor_order_stats_store->get_top_performing_vendors( $start_date, $end_date, $limit );
    }

    /**
     * Get vendor metrics data.
     *
     * @since 4.1.0
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     *
     * @return array Vendor metrics data.
     */
    public function get_vendor_metrics( string $start_date, string $end_date ): array {
        return apply_filters(
            'dokan_rest_admin_dashboard_vendor_metrics_data',
            [],
            $start_date,
            $end_date
        );
    }

    /**
     * Get filtered product types.
     *
     * @since 4.1.0
     *
     * @return array Filtered product types.
     */
    public function get_filtered_product_types(): array {
        $exclude_product_types = apply_filters(
            'dokan_rest_admin_dashboard_exclude_product_types',
            [ 'product_pack', 'subscription' ]
        );

        return array_filter(
            wc_get_product_types(),
            function ( $type ) use ( $exclude_product_types ) {
                return ! in_array( $type, $exclude_product_types, true );
            }
        );
    }
}
