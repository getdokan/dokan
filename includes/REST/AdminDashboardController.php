<?php

namespace WeDevs\Dokan\REST;

use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WeDevs\Dokan\Models\AdminDashboardStats;
use Automattic\WooCommerce\Admin\API\Reports\Orders\Stats\Query as DataStore;

/**
 * Todo Dashboard API Controller
 *
 * Handles todo endpoint requests
 *
 * @since DOKAN_SINCE
 */
class AdminDashboardController extends DokanBaseAdminController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'dashboard';

    /**
     * Register all routes related with todo
     *
     * @return void
     */
    public function register_routes() {
        // Main endpoint for backward compatibility
        register_rest_route(
            $this->namespace, '/' . $this->rest_base, [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_todo_counts' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        // Add a new endpoint for a to_do section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/todo', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_to_do' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        // Add a new endpoint for a monthly_overview section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/monthly-overview', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_monthly_overview_data' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        // Add new endpoint for sales_chart section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/sales-chart', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_sales_chart_data' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        // Add a new endpoint for a customer_metrics section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/customer-metrics', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_customer_metrics_data' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        // Add a new endpoint for an all_time_stats section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/all-time-stats', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_all_time_stats_data' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        // Add a new endpoint for a top_performing_vendors section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/top-performing-vendors', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_top_performing_vendors_data' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        // Add a new endpoint for a most_reviewed_product section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/most-reviewed-products', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_most_reviewed_products_data' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
    }

    /**
     * Get todo permissions check
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function get_todo_permissions_check() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Get todo counts
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function get_todo_counts( $request ) {
        // Get the selected month and year from the request
        $date = $request->get_param( 'date' ) ? sanitize_text_field( $request->get_param( 'date' ) ) : date( 'Y-m' );

        $data = [
            'to_do' => apply_filters(
                'dokan_rest_admin_dashboard_todo_data',
                [
                    // From dokan-lite
                    'vendor_approvals'    => [
                        'icon'  => 'UserCheck',
                        'count' => $this->get_vendor_approvals_count(),
                        'title' => esc_html__( 'Vendor Approvals', 'dokan-lite' ),
                    ],
                    'product_approvals'   => [
                        'icon'  => 'Box',
                        'count' => $this->get_product_approvals_count(),
                        'title' => esc_html__( 'Product Approvals', 'dokan-lite' ),
                    ],
                    'pending_withdrawals' => [
                        'icon'  => 'PanelTop',
                        'count' => $this->get_pending_withdrawals_count(),
                        'title' => esc_html__( 'Pending Withdrawals', 'dokan-lite' ),
                    ],
                ]
            ),
            'monthly_overview'       => $this->get_monthly_overview( $date ),
            'sales_chart'            => $this->get_sales_chart_data( $date ),
            'customer_metrics'       => $this->get_customer_metrics(),
            'all_time_stats'         => $this->get_all_time_stats(),
            'top_performing_vendors' => $this->get_top_performing_vendors(),
            'most_reviewed_product'  => $this->get_most_reviewed_products(),
        ];

        return rest_ensure_response( $data );
    }

    /**
     * Get to_do data
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response
     */
    public function get_to_do() {
        $data = apply_filters(
            'dokan_rest_admin_dashboard_todo_data',
            [
                'vendor_approvals'    => [
                    'icon'  => 'UserCheck',
                    'count' => $this->get_vendor_approvals_count(),
                    'title' => esc_html__( 'Vendor Approvals', 'dokan-lite' ),
                ],
                'product_approvals'   => [
                    'icon'  => 'Box',
                    'count' => $this->get_product_approvals_count(),
                    'title' => esc_html__( 'Product Approvals', 'dokan-lite' ),
                ],
                'pending_withdrawals' => [
                    'icon'  => 'PanelTop',
                    'count' => $this->get_pending_withdrawals_count(),
                    'title' => esc_html__( 'Pending Withdrawals', 'dokan-lite' ),
                ],
            ],
            $this
        );

        return rest_ensure_response( $data );
    }

    /**
     * Get monthly_overview data
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function get_monthly_overview_data( $request ) {
        // Get the selected month and year from the request
        $date = $request->get_param( 'date' ) ?? date( 'Y-m' );

        return rest_ensure_response( $this->get_monthly_overview( $date ) );
    }

    /**
     * Get sales_chart data
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function get_sales_chart_data( $request ) {
        // Get the selected month and year from the request (same as monthly overview)
        $date = $request->get_param( 'date' ) ? sanitize_text_field( $request->get_param( 'date' ) ) : date( 'Y-m' );

        return rest_ensure_response( $this->get_sales_chart( $date ) );
    }

    /**
     * Get customer_metrics data
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function get_customer_metrics_data( $request ) {
        // Get the selected month and year from the request
        $date = $request->get_param( 'date' ) ? sanitize_text_field( $request->get_param( 'date' ) ) : date( 'Y-m' );

        return rest_ensure_response( $this->get_customer_metrics( $date ) );
    }

    /**
     * Get all_time_stats data
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response
     */
    public function get_all_time_stats_data() {
        return rest_ensure_response( $this->get_all_time_stats() );
    }

    /**
     * Get top_performing_vendors data
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response
     */
    public function get_top_performing_vendors_data() {
        return rest_ensure_response( $this->get_top_performing_vendors() );
    }

    /**
     * Get most_reviewed_products data
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response
     */
    public function get_most_reviewed_products_data() {
        return rest_ensure_response( $this->get_most_reviewed_products() );
    }

    /**
     * Get vendor approvals count
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_vendor_approvals_count() {
        $counts = dokan_get_seller_status_count();
        return $counts['inactive'] ?? 0;
    }

    /**
     * Get product approvals count
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_product_approvals_count() {
        $products = dokan()->product->all(
            [
                'post_type'   => 'product',
                'post_status' => 'pending',
                'fields'      => 'ids',
            ]
        );

        return $products->found_posts;
    }

    /**
     * Get pending withdrawals count
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_pending_withdrawals_count() {
        $args = [
            'status' => dokan()->withdraw->get_status_code( 'pending' ),
            'return' => 'count',
        ];

        $withdraw_count = dokan()->withdraw->all( $args );
        return (int) ( $withdraw_count['pending'] ?? 0 );
    }

    /**
     * Get top-performing vendors
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_top_performing_vendors() {
        $result  = [];
        $vendors = AdminDashboardStats::get_top_performing_vendors();

        // If vendors found, then populate the result array
        if ( ! empty( $vendors ) ) {
            $rank = 0;
            foreach ( $vendors as $vendor ) {
                $vendor_info = dokan()->vendor->get( $vendor['vendor_id'] );
                if ( ! $vendor_info->get_id() ) {
                    continue;
                }

                $result[] = [
                    'rank'             => ++$rank,
                    'vendor_name'      => $vendor_info->get_shop_name(),
                    'total_earning'    => (float) $vendor['total_earning'],
                    'total_orders'     => (int) $vendor['total_orders'],
                    'total_commission' => (float) $vendor['total_commission'],
                ];
            }
        }

        return apply_filters(
            'dokan_rest_admin_dashboard_top_performing_vendors_data',
            $result
        );
    }

    /**
     * Get most reviewed products
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_most_reviewed_products() {
        // Get products with the most reviews
        $products = wc_get_products(
            [
                'limit'      => 5,
                'orderby'    => 'comment_count',
                'order'      => 'DESC',
                'status'     => 'publish',
                'meta_query' => [ // phpcs:ignore
                    [
                        'key'     => '_wc_review_count',
                        'value'   => 0,
                        'compare' => '>',
                        'type'    => 'NUMERIC',
                    ],
                ],
            ]
        );

        $result = [];
        if ( ! empty( $products ) ) {
            foreach ( $products as $key => $product ) {
                $result[] = [
                    'rank'          => $key + 1,
                    'product_id'    => $product->get_id(),
                    'product_title' => $product->get_name(),
                    'review_count'  => $product->get_review_count(),
                ];
            }
        }

        return apply_filters(
            'dokan_rest_admin_dashboard_most_reviewed_products_data',
            $result,
            $products
        );
    }

    /**
     * Get all time marketplace stats
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_all_time_stats() {
        // Get total products (excluding subscription and product advertisement products, only published)
        $advertise_product = get_option( 'dokan_advertisement_product_id', 0 );
        $product_types     = $this->get_filtered_product_types();

        $args = [
            'status'       => 'publish',
            'type'         => array_keys( $product_types ),
            'limit'        => -1,
            'return'       => 'ids',
            'post__not_in' => [ $advertise_product ],
        ];

        $product_ids    = wc_get_products( $args );
        $total_products = count( $product_ids );

        // Get total vendors (approved only)
        $total_vendors = 0;
        if ( function_exists( 'dokan_get_seller_status_count' ) ) {
            $counts        = dokan_get_seller_status_count();
            $total_vendors = $counts['active'] ?? 0;
        }

        // Get total customers
        $user_counts     = count_users();
        $total_customers = $user_counts['avail_roles']['customer'] ?? 0;

        // Get total orders
        $total_orders = dokan()->order->all(
            [
                'status' => [ 'wc-completed', 'wc-processing', 'wc-on-hold', 'wc-refunded' ],
                'return' => 'count',
            ]
        );

        $query_args = apply_filters(
            'dokan_rest_admin_dashboard_all_time_stats_sales_args',
            [
                'fields' => [
                    'total_sales',
                    'total_admin_commission',
                ]
            ]
        );

        $stats_query = new DataStore( $query_args );
        $stats_data  = $stats_query->get_data();

        $total_sales       = $stats_data->totals->total_sales ?? 0;
        $total_commissions = $stats_data->totals->total_admin_commission ?? 0;

        return apply_filters(
            'dokan_rest_admin_dashboard_all_time_stats_data',
            [
                'total_products'    => [
                    'icon'  => 'Box',
                    'count' => (int) $total_products,
                    'title' => esc_html__( 'Total Products', 'dokan-lite' ),
                ],
                'total_vendors'     => [
                    'icon'  => 'User',
                    'count' => (int) $total_vendors,
                    'title' => esc_html__( 'Total Vendors', 'dokan-lite' ),
                ],
                'total_customers'   => [
                    'icon'  => 'SquareUserRound',
                    'count' => (int) $total_customers,
                    'title' => esc_html__( 'Total Customers', 'dokan-lite' ),
                ],
                'total_orders'      => [
                    'icon'  => 'ShoppingCart',
                    'count' => (int) $total_orders,
                    'title' => esc_html__( 'Total Orders', 'dokan-lite' ),
                ],
                'total_sales'       => [
                    'icon'  => 'Banknote',
                    'count' => (float) $total_sales,
                    'title' => esc_html__( 'Total Sales', 'dokan-lite' ),
                ],
                'total_commissions' => [
                    'icon'  => 'CircleDollarSign',
                    'count' => (float) $total_commissions,
                    'title' => esc_html__( 'Total Commissions', 'dokan-lite' ),
                ],
            ]
        );
    }

    /**
     * Get sales chart data for the current month
     *
     * @since DOKAN_SINCE
     *
     * @param string $date The date for which to get the sales data (optional).
     *
     * @return array
     */
    public function get_sales_chart( $date = '' ) {
        // Current month totals
        $date_range = $this->parse_date_range( $date );
        $current    = AdminDashboardStats::get_sales_chart_data(
            $date_range['current_month_start'],
            $date_range['current_month_end']
        );
        // Previous month totals
        $previous = AdminDashboardStats::get_sales_chart_data(
            $date_range['previous_month_start'],
            $date_range['previous_month_end']
        );

        return apply_filters(
            'dokan_rest_admin_dashboard_sales_chart_data',
            [
                'current_month' => [
                    'total_sales'  => (float) ( $current['total_sales'] ?? 0 ),
                    'net_sales'    => (float) ( $current['net_sales'] ?? 0 ),
                    'commissions'  => (float) ( $current['commissions'] ?? 0 ),
                    'order_count'  => (int) ( $current['order_count'] ?? 0 ),
                ],
                'previous_month' => [
                    'total_sales'  => (float) ( $previous['total_sales'] ?? 0 ),
                    'net_sales'    => (float) ( $previous['net_sales'] ?? 0 ),
                    'commissions'  => (float) ( $previous['commissions'] ?? 0 ),
                    'order_count'  => (int) ( $previous['order_count'] ?? 0 ),
                ]
            ],
            $date_range
        );
    }

    /**
     * Get customer metrics data
     *
     * @since DOKAN_SINCE
     *
     * @param string $date
     *
     * @return array
     */
    public function get_customer_metrics( string $date = '' ): array {
        // Date range for the current month.
        $date_range       = $this->parse_date_range( $date );
        $monthly_overview = AdminDashboardStats::get_customer_metrics(
            $date_range['current_month_start'],
            $date_range['current_month_end']
        );

        return apply_filters(
            'dokan_rest_admin_dashboard_customer_metrics_data',
            $monthly_overview,
            $date_range
        );
    }

    /**
     * Get monthly overview data
     *
     * @since DOKAN_SINCE
     *
     * @param string $date
     *
     * @return array
     */
    public function get_monthly_overview( $date ) {
        $date_range    = $this->parse_date_range( $date );
        $overview_data = AdminDashboardStats::get_monthly_overview( $date_range );

        return apply_filters(
            'dokan_rest_admin_dashboard_monthly_overview_data',
            $overview_data,
            $date_range,
            $this
        );
    }

    /**
     * Parse date and return formatted date ranges
     *
     * @since DOKAN_SINCE
     *
     * @param string $date The date string in Y-m format (optional)
     *
     * @return array Array containing parsed date information
     */
    public function parse_date_range( $date = '' ) {
        // Parse the selected date to get year and month
        $date       = ! empty( $date ) ? sanitize_text_field( $date ) : date( 'Y-m' );
        $date_parts = explode( '-', $date );
        $year       = (int) ( $date_parts[0] ?? date( 'Y' ) );
        $month      = (int) ( $date_parts[1] ?? date( 'm' ) );

        // Ensure valid month range
        $month = max( 1, min( 12, $month ) );

        // Calculate the start and end dates for the selected month
        $current_month_start = date( 'Y-m-01', strtotime( "$year-$month-01" ) );
        $current_month_end   = date( 'Y-m-t', strtotime( "$year-$month-01" ) );

        // Calculate the start and end dates for the previous month
        $previous_month_start = date( 'Y-m-01', strtotime( "$year-$month-01 -1 month" ) );
        $previous_month_end   = date( 'Y-m-t', strtotime( "$year-$month-01 -1 month" ) );

        return [
            'current_month_start'  => $current_month_start,
            'current_month_end'    => $current_month_end,
            'previous_month_start' => $previous_month_start,
            'previous_month_end'   => $previous_month_end,
        ];
    }

    /**
     * Get filtered product types
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_filtered_product_types() {
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
