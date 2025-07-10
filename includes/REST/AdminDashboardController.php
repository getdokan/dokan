<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Models\VendorOrderStats;
use WeDevs\DokanPro\Modules\ProductQA\Models\Question;
use WeDevs\DokanPro\Modules\RequestForQuotation\Helper as QuoteHelper;
use WeDevs\DokanPro\Modules\VendorVerification\Models\VerificationRequest;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
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
                    'callback'            => [ $this, 'get_sales_chart_data_endpoint' ],
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

                    // From dokan-pro
    //                'pending_verifications' => $this->get_pending_verifications_count(),
    //                'open_support_tickets'  => $this->get_open_support_tickets_count(),
    //                'return_requests'       => $this->get_return_requests_count(),
    //                'product_inquiries'     => $this->get_product_inquiries_count(),
    //                'pending_quotes'        => $this->get_pending_quotes_count(),
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
    public function get_sales_chart_data_endpoint( $request ) {
        // Get the selected month and year from the request (same as monthly overview)
        $date = $request->get_param( 'date' ) ? sanitize_text_field( $request->get_param( 'date' ) ) : date( 'Y-m' );

        return rest_ensure_response( $this->get_sales_chart_data( $date ) );
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
        $vendors = VendorOrderStats::get_top_performing_vendors();

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

        return $result;
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

        return $result;
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

        return [
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
        ];
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
    public function get_sales_chart_data( $date = '' ) {
        global $wpdb;

        // Current month totals
        $date_range = $this->parse_date_range( $date );
        $current    = VendorOrderStats::get_sales_chart_data(
			$date_range['current_month_start'],
			$date_range['current_month_end']
        );
        // Previous month totals
        $previous = VendorOrderStats::get_sales_chart_data(
            $date_range['previous_month_start'],
            $date_range['previous_month_end']
        );

        return [
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
        ];
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
        global $wpdb;

        // Query to find recurring customers
        // These are customers who have placed at least one order before the selected time period
        // and have placed at least one order during the selected time period
        $date_range          = $this->parse_date_range( $date );
        $recurring_customers = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(DISTINCT pm.meta_value)
                FROM {$wpdb->posts} p1
                JOIN {$wpdb->postmeta} pm ON p1.ID = pm.post_id AND pm.meta_key = '_customer_user' AND pm.meta_value > 0
                WHERE p1.post_type = 'shop_order'
                AND p1.post_status IN ('wc-completed', 'wc-processing', 'wc-on-hold')
                AND DATE(p1.post_date) BETWEEN %s AND %s
                AND pm.meta_value IN (
                    SELECT DISTINCT pm2.meta_value
                    FROM {$wpdb->posts} p2
                    JOIN {$wpdb->postmeta} pm2 ON p2.ID = pm2.post_id AND pm2.meta_key = '_customer_user' AND pm2.meta_value > 0
                    WHERE p2.post_type = 'shop_order'
                    AND p2.post_status IN ('wc-completed', 'wc-processing', 'wc-on-hold')
                    AND DATE(p2.post_date) < %s
                )",
                $date_range['current_month_start'],
                $date_range['current_month_end'],
                $date_range['current_month_start']
            )
        );

        return apply_filters(
			'dokan_admin_dashboard_customer_metrics',
			[
                'icon'  => 'FileUser',
                'count' => (int) $recurring_customers,
                'title' => esc_html__( 'Recurring Customers', 'dokan-lite' ),
            ]
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
        global $wpdb;

        $date_range        = $this->parse_date_range( $date );
        $advertise_product = get_option( 'dokan_advertisement_product_id', 0 );
        $product_types     = $this->get_filtered_product_types();

        $args = [
            'status'       => 'publish',
            'type'         => array_keys( $product_types ),
            'limit'        => -1,
            'return'       => 'ids',
            'post__not_in' => [ $advertise_product ],
        ];

        $product_ids = wc_get_products(
            array_merge(
                $args,
                [ 'date_created' => $date_range['current_month_start'] . '...' . $date_range['current_month_end'] ]
            )
        );

        $new_products_current    = count( $product_ids );
        $previous_month_products = wc_get_products(
            array_merge(
                $args,
                [ 'date_created' => $date_range['previous_month_start'] . '...' . $date_range['previous_month_end'] ]
            )
        );

        $new_products_previous   = count( $previous_month_products );
        $active_vendors_current  = VendorOrderStats::get_active_vendors_count(
			$date_range['current_month_start'],
			$date_range['current_month_end']
        );
        $active_vendors_previous = VendorOrderStats::get_active_vendors_count(
			$date_range['previous_month_start'],
			$date_range['previous_month_end']
        );

        $results = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT 
                    SUM(CASE WHEN u.user_registered BETWEEN %s AND %s THEN 1 ELSE 0 END) as current_count,
                    SUM(CASE WHEN u.user_registered BETWEEN %s AND %s THEN 1 ELSE 0 END) as previous_count
                FROM $wpdb->users u
                JOIN $wpdb->usermeta um ON u.ID = um.user_id
                WHERE u.user_registered BETWEEN %s AND %s
                AND um.meta_key = %s
                AND um.meta_value LIKE %s",
                $date_range['current_month_start'],
                $date_range['current_month_end'],
                $date_range['previous_month_start'],
                $date_range['previous_month_end'],
                $date_range['previous_month_start'],
                $date_range['current_month_end'],
                $wpdb->prefix . 'capabilities',
                '%customer%'
            )
        );

        $new_customers_current  = $results->current_count ?? 0;
        $new_customers_previous = $results->previous_count ?? 0;

        // Order cancellation rate.
        $stats = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    CASE 
                        WHEN post_date BETWEEN %s AND %s THEN 'current'
                        WHEN post_date BETWEEN %s AND %s THEN 'previous'
                    END as period,
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN post_status = 'wc-cancelled' THEN 1 ELSE 0 END) as cancelled_orders
                FROM $wpdb->posts 
                WHERE post_type = 'shop_order' 
                AND (
                    (post_date BETWEEN %s AND %s) OR 
                    (post_date BETWEEN %s AND %s)
                )
                GROUP BY period",
                $date_range['current_month_start'], $date_range['current_month_end'],    // CASE condition
                $date_range['previous_month_start'], $date_range['previous_month_end'],  // CASE condition
                $date_range['current_month_start'], $date_range['current_month_end'],    // WHERE condition
                $date_range['previous_month_start'], $date_range['previous_month_end']   // WHERE condition
            )
        );

        $order_stats = [];
        foreach ( $stats as $stat ) {
            $order_stats[ $stat->period ] = [
                'total_orders'     => (int) ( $stat->total_orders ?? 0 ),
                'cancelled_orders' => (int) ( $stat->cancelled_orders ?? 0 ),
            ];
        }

        return apply_filters(
            'dokan_rest_admin_dashboard_monthly_overview_data',
            [
                'new_products' => [
                    'icon'     => 'Box',
                    'current'  => (int) $new_products_current,
                    'previous' => (int) $new_products_previous,
                    'title'    => esc_html__( 'New Products', 'dokan-lite' ),
                    'tooltip'  => esc_html__( 'New products published in the month', 'dokan-lite' ),
                ],
                'active_vendors' => [
                    'icon'     => 'UserCog',
                    'current'  => (int) $active_vendors_current,
                    'previous' => (int) $active_vendors_previous,
                    'title'    => esc_html__( 'Active Vendors', 'dokan-lite' ),
                    'tooltip'  => esc_html__( 'Vendors sold minimum 1 product', 'dokan-lite' ),
                ],
                'new_customers' => [
                    'icon'     => 'FileUser',
                    'current'  => (int) $new_customers_current,
                    'previous' => (int) $new_customers_previous,
                    'title'    => esc_html__( 'New Customers', 'dokan-lite' ),
                    'tooltip'  => esc_html__( 'Total new customers registered in the time period', 'dokan-lite' ),
                ],
                'order_cancellation_rate' => [
                    ...$order_stats,
                    'icon'    => 'BanknoteX',
                    'title'   => esc_html__( 'Order Cancellation Rate', 'dokan-lite' ),
                    'tooltip' => esc_html__( 'Rate of orders which got cancelled in the time period', 'dokan-lite' ),
                ],
            ],
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
