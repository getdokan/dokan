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
 * Handles /todo endpoint requests
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
                    'permission_callback' => [ $this, 'get_todo_permissions_check' ],
                ],
            ]
        );

        // Add a new endpoint for a to_do section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/todo', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_to_do' ],
                    'permission_callback' => [ $this, 'get_todo_permissions_check' ],
                ],
            ]
        );

        // Add a new endpoint for a monthly_overview section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/monthly-overview', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_monthly_overview_data' ],
                    'permission_callback' => [ $this, 'get_todo_permissions_check' ],
                ],
            ]
        );

        // Add new endpoint for sales_chart section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/sales-chart', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_sales_chart_data_endpoint' ],
                    'permission_callback' => [ $this, 'get_todo_permissions_check' ],
                ],
            ]
        );

        // Add a new endpoint for a customer_metrics section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/customer-metrics', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_customer_metrics_data' ],
                    'permission_callback' => [ $this, 'get_todo_permissions_check' ],
                ],
            ]
        );

        // Add a new endpoint for an all_time_stats section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/all-time-stats', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_all_time_stats_data' ],
                    'permission_callback' => [ $this, 'get_todo_permissions_check' ],
                ],
            ]
        );

        // Add a new endpoint for a top_performing_vendors section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/top-performing-vendors', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_top_performing_vendors_data' ],
                    'permission_callback' => [ $this, 'get_todo_permissions_check' ],
                ],
            ]
        );

        // Add a new endpoint for a most_reviewed_product section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/most-reviewed-products', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_most_reviewed_products_data' ],
                    'permission_callback' => [ $this, 'get_todo_permissions_check' ],
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
        $data = [
            'to_do' => [
                // From dokan-lite
                'vendor_approvals'      => $this->get_vendor_approvals_count(),
                'product_approvals'     => $this->get_product_approvals_count(),
                'pending_withdrawals'   => $this->get_pending_withdrawals_count(),

                // From dokan-pro
                'pending_verifications' => $this->get_pending_verifications_count(),
                'open_support_tickets'  => $this->get_open_support_tickets_count(),
                'return_requests'       => $this->get_return_requests_count(),
                'product_inquiries'     => $this->get_product_inquiries_count(),
                'pending_quotes'        => $this->get_pending_quotes_count(),
            ],
            'monthly_overview'       => $this->get_monthly_overview(),
            'sales_chart'            => $this->get_sales_chart_data(),
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
            'dokan_rest_admin_dashboard_to_do_data',
            [
                // From dokan-lite
                'vendor_approvals'      => $this->get_vendor_approvals_count(),
                'product_approvals'     => $this->get_product_approvals_count(),
                'pending_withdrawals'   => $this->get_pending_withdrawals_count(),

                // From dokan-pro
                'pending_verifications' => $this->get_pending_verifications_count(),
                'open_support_tickets'  => $this->get_open_support_tickets_count(),
                'return_requests'       => $this->get_return_requests_count(),
                'product_inquiries'     => $this->get_product_inquiries_count(),
                'pending_quotes'        => $this->get_pending_quotes_count(),
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
     * @return WP_REST_Response
     */
    public function get_monthly_overview_data() {
        return rest_ensure_response( $this->get_monthly_overview() );
    }

    /**
     * Get sales_chart data
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response
     */
    public function get_sales_chart_data_endpoint() {
        return rest_ensure_response( $this->get_sales_chart_data() );
    }

    /**
     * Get customer_metrics data
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response
     */
    public function get_customer_metrics_data() {
        return rest_ensure_response( $this->get_customer_metrics() );
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
     * Get pending verifications count
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    private function get_pending_verifications_count() {
        try {
            $verification_request = new VerificationRequest();
            $count                = $verification_request->count( [ 'status' => VerificationRequest::STATUS_PENDING ] );

            return $count[ VerificationRequest::STATUS_PENDING ] ?? 0;
        } catch ( \Exception $e ) {
            return 0;
        }
    }

    /**
     * Get open support tickets count
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    private function get_open_support_tickets_count() {
        if ( ! class_exists( '\StoreSupportHelper' ) ) {
            return 0;
        }

        $counts = \StoreSupportHelper::dokan_get_support_topics_status_count();
        return $counts['open_topics'] ?? 0;
    }

    /**
     * Get return requests count
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    private function get_return_requests_count() {
        if ( ! function_exists( 'dokan_get_refund_count' ) ) {
            return 0;
        }

//        $counts = dokan_warranty_request_status_count();
        $counts = dokan_get_refund_count();

        return $counts['pending'] ?? 0;
    }

    /**
     * Get product inquiries count
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    private function get_product_inquiries_count() {
        try {
            $question = new Question();
            $count    = $question->count_status( [ 'answered' => false ] );

            return $count->unanswered() ?? 0;
        } catch ( \Exception $e ) {
            return 0;
        }
    }

    /**
     * Get pending quotes count
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    private function get_pending_quotes_count() {
        if ( ! class_exists( '\WeDevs\DokanPro\Modules\RequestForQuotation\Helper' ) ) {
            return 0;
        }

        $count = QuoteHelper::get_request_quote_count();
        return $count->pending ?? 0;
    }

    /**
     * Get vendor approvals count
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    private function get_vendor_approvals_count() {
        if ( ! function_exists( 'dokan_get_seller_status_count' ) ) {
            return 0;
        }

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
    private function get_product_approvals_count() {
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
    private function get_pending_withdrawals_count() {
        $args = [
            'status' => dokan()->withdraw->get_status_code( 'pending' ),
            'return' => 'count',
        ];

        $withdraw_count = dokan()->withdraw->all( $args );
        return $withdraw_count['pending'] ?? 0;
    }

    /**
     * Get top-performing vendors
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    private function get_top_performing_vendors() {
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
    private function get_most_reviewed_products() {
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
    private function get_all_time_stats() {
        global $wpdb;

        // Get total products (excluding subscription and product advertisement products, only published)
        $advertise_product = get_option( 'dokan_advertisement_product_id', 0 );
        $product_types     = array_filter(
            wc_get_product_types(),
            function ( $type ) {
                return ! in_array( $type, [ 'product_pack', 'subscription' ], true );
            }
        );

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

        // Get total sales and commissions from dokan_order_stats
//        $sales_stats = $wpdb->get_row(
//            "SELECT
//                SUM(vendor_earning + admin_commission) as total_sales,
//                SUM(admin_commission) as total_commissions
//            FROM {$wpdb->prefix}dokan_order_stats
//            WHERE order_id NOT IN (
//                SELECT post_id FROM $wpdb->postmeta
//                WHERE meta_key = '_wp_trash_meta_status'
//            )",
//            ARRAY_A
//        );
//
//        $total_sales = $sales_stats['total_sales'] ?? 0;
//        $total_commissions = $sales_stats['total_commissions'] ?? 0;

//        $args = apply_filters( 'woocommerce_analytics_revenue_query_args', array(
//            'per_page' => get_option( 'posts_per_page' ), // not sure if this should be the default.
//            'page'     => 1,
//            'order'    => 'DESC',
//            'orderby'  => 'date',
//            'before'   => '',
//            'after'    => '',
//            'interval' => 'week',
//            'fields'   => array(
//                'orders_count',
//                'num_items_sold',
//                'total_sales',
//                'coupons',
//                'coupons_count',
//                'refunds',
//                'taxes',
//                'shipping',
//                'net_revenue',
//                'gross_sales',
//            ),
//        ) );
//
//        error_log( print_r( $args, 1 ) );
//
//        $data_store = \WC_Data_Store::load( 'report-revenue-stats' );
//        $results    = $data_store->get_data( $args );
//
//        error_log( print_r( $results, 1 ) );

        $query_args = [
//                'after'  => '2010-01-01T00:00:00',
//                'before' => '2099-01-01T23:59:59',
            'fields' => [
                'total_sales',
                'total_admin_commission',
//                    'net_revenue',
//                    'orders_count',
//                    'avg_order_value',
//                    'num_items_sold',
            ]
        ];

        $stats_query = new DataStore( $query_args );
        $stats_data  = $stats_query->get_data();

        $total_sales       = $stats_data->totals->total_sales ?? 0;
        $total_commissions = $stats_data->totals->total_admin_commission ?? 0;

//            error_log( print_r( $stats_data, 1 ) );
//            return [
//                'net_revenue' => $stats_data->totals->net_revenue ?? 0,
//                'total_sales' => $stats_data->totals->total_sales ?? 0,
//                'orders_count' => $stats_data->totals->orders_count ?? 0,
//                'avg_order_value' => $stats_data->totals->avg_order_value ?? 0,
//                'num_items_sold' => $stats_data->totals->num_items_sold ?? 0,
//            ];

        return [
            'total_products'    => (int) $total_products,
            'total_vendors'     => (int) $total_vendors,
            'total_customers'   => (int) $total_customers,
            'total_orders'      => (int) $total_orders,
            'total_sales'       => (float) $total_sales,
            'total_commissions' => (float) $total_commissions,
            'tooltip'           => 'Overview of your all time result in your marketplace',
        ];
    }

    /**
     * Get sales chart data for the current month
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    private function get_sales_chart_data() {
        global $wpdb;

        // Get the current month's start and end dates
        $start_date = date('Y-m-01');
        $end_date = date('Y-m-t');

        // Query to get daily sales data for the current month
        $sales_data = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    DATE(p.post_date) as date,
                    SUM(dos.vendor_earning + dos.admin_commission) as total_sales,
                    SUM(dos.vendor_earning) as net_sales,
                    SUM(dos.admin_commission) as commissions
                FROM {$wpdb->prefix}dokan_order_stats dos
                JOIN {$wpdb->posts} p ON dos.order_id = p.ID
                WHERE p.post_type = 'shop_order'
                AND p.post_status IN ('wc-completed', 'wc-processing', 'wc-on-hold')
                AND DATE(p.post_date) BETWEEN %s AND %s
                GROUP BY DATE(p.post_date)
                ORDER BY DATE(p.post_date) ASC",
                $start_date,
                $end_date
            ),
            ARRAY_A
        );

        if ( empty( $sales_data ) ) {
            return [];
        }

        // Format the data for the chart
        $result = [];
        foreach ( $sales_data as $data ) {
            $result[] = [
                'date'        => $data['date'],
                'total_sales' => (float) $data['total_sales'],
                'net_sales'   => (float) $data['net_sales'],
                'commissions' => (float) $data['commissions'],
            ];
        }

        return $result;
    }

    /**
     * Get customer metrics data
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    private function get_customer_metrics() {
        global $wpdb;

        // Get the current month's start and end dates for the time filter
        $start_date = date('Y-m-01');
        $end_date = date('Y-m-t');

        // Query to find recurring customers
        // These are customers who have placed at least one order before the current time period
        // and have placed at least one order during the current time period
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
                $start_date,
                $end_date,
                $start_date
            )
        );

        return [
            'recurring_customers' => (int) $recurring_customers,
            'tooltip'             => 'Customers who returned and purchased again in the time period',
        ];
    }

    /**
     * Get monthly overview data
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    private function get_monthly_overview() {
        global $wpdb;

        $advertise_product = get_option( 'dokan_advertisement_product_id', 0 );
        $product_types     = array_filter(
            wc_get_product_types(),
            function ( $type ) {
                return ! in_array( $type, [ 'product_pack', 'subscription' ], true );
            }
        );

        // Get the current month's start and end dates
        $current_month_start = date( 'Y-m-01 00:00:00' );
        $current_month_end   = date( 'Y-m-t 23:59:59' );

        // Get the previous month's start and end dates
        $previous_month_start = date( 'Y-m-01 00:00:00', strtotime( 'first day of last month' ) );
        $previous_month_end = date( 'Y-m-t 23:59:59', strtotime( 'last day of last month' ) );

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
                [ 'date_created' => $current_month_start . '...' . $current_month_end ]
            )
        );
        $new_products_current    = count( $product_ids );
        $previous_month_products = wc_get_products(
            array_merge(
                $args,
                [ 'date_created' => $previous_month_start . '...' . $previous_month_end ]
            )
        );

        $new_products_previous = count( $previous_month_products );
        $new_products_growth   = $this->calculate_growth_rate( $new_products_current, $new_products_previous );

        // 2. Active Vendors
        // Current month - vendors with at least one sale
        $active_vendors_current = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(DISTINCT vendor_id) 
                FROM {$wpdb->prefix}dokan_order_stats dos
                JOIN {$wpdb->posts} p ON dos.order_id = p.ID
                WHERE p.post_type = 'shop_order'
                AND p.post_status IN ('wc-completed', 'wc-processing', 'wc-on-hold')
                AND DATE(p.post_date) BETWEEN %s AND %s",
                $current_month_start,
                $current_month_end
            )
        );

        // Previous month
        $active_vendors_previous = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(DISTINCT vendor_id) 
                FROM {$wpdb->prefix}dokan_order_stats dos
                JOIN {$wpdb->posts} p ON dos.order_id = p.ID
                WHERE p.post_type = 'shop_order'
                AND p.post_status IN ('wc-completed', 'wc-processing', 'wc-on-hold')
                AND DATE(p.post_date) BETWEEN %s AND %s",
                $previous_month_start,
                $previous_month_end
            )
        );

        // Calculate growth rate
        $active_vendors_growth = $this->calculate_growth_rate($active_vendors_current, $active_vendors_previous);

        // 3. New Customers
        // Current month
        $new_customers_current = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(ID) FROM $wpdb->users 
                WHERE user_registered BETWEEN %s AND %s
                AND ID IN (
                    SELECT user_id FROM $wpdb->usermeta 
                    WHERE meta_key = 'wp_capabilities' 
                    AND meta_value LIKE '%customer%'
                )",
                $current_month_start,
                $current_month_end
            )
        );

        // Previous month
        $new_customers_previous = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(ID) FROM $wpdb->users 
                WHERE user_registered BETWEEN %s AND %s
                AND ID IN (
                    SELECT user_id FROM $wpdb->usermeta 
                    WHERE meta_key = 'wp_capabilities' 
                    AND meta_value LIKE '%customer%'
                )",
                $previous_month_start,
                $previous_month_end
            )
        );

        // Calculate growth rate
        $new_customers_growth = $this->calculate_growth_rate($new_customers_current, $new_customers_previous);

        // 4. Support Tickets
        $support_tickets_current = 0;
        $support_tickets_previous = 0;

        if ( class_exists( '\StoreSupportHelper' ) ) {
            // Current month
            $support_tickets_current = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(ID) FROM $wpdb->posts 
                    WHERE post_type = 'dokan_store_support' 
                    AND post_date BETWEEN %s AND %s",
                    $current_month_start,
                    $current_month_end
                )
            );

            // Previous month
            $support_tickets_previous = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(ID) FROM $wpdb->posts 
                    WHERE post_type = 'dokan_store_support' 
                    AND post_date BETWEEN %s AND %s",
                    $previous_month_start,
                    $previous_month_end
                )
            );
        }

        // Calculate growth rate
        $support_tickets_growth = $this->calculate_growth_rate($support_tickets_current, $support_tickets_previous);

        // 5. Refund
        // Current month
        $refund_current = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT SUM(postmeta.meta_value) 
                FROM $wpdb->posts AS posts
                JOIN $wpdb->postmeta AS postmeta ON posts.ID = postmeta.post_id
                WHERE posts.post_type = 'shop_order_refund'
                AND posts.post_status = 'wc-completed'
                AND postmeta.meta_key = '_refund_amount'
                AND posts.post_date BETWEEN %s AND %s",
                $current_month_start,
                $current_month_end
            )
        );

        // Previous month
        $refund_previous = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT SUM(postmeta.meta_value) 
                FROM $wpdb->posts AS posts
                JOIN $wpdb->postmeta AS postmeta ON posts.ID = postmeta.post_id
                WHERE posts.post_type = 'shop_order_refund'
                AND posts.post_status = 'wc-completed'
                AND postmeta.meta_key = '_refund_amount'
                AND posts.post_date BETWEEN %s AND %s",
                $previous_month_start,
                $previous_month_end
            )
        );

        // Calculate growth rate
        $refund_growth = $this->calculate_growth_rate($refund_current, $refund_previous);

        // 6. Reviews
        // Current month
        $reviews_current = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(comment_ID) FROM $wpdb->comments 
                WHERE comment_type = 'review' 
                AND comment_approved = 1
                AND comment_date BETWEEN %s AND %s",
                $current_month_start,
                $current_month_end
            )
        );

        // Previous month
        $reviews_previous = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(comment_ID) FROM $wpdb->comments 
                WHERE comment_type = 'review' 
                AND comment_approved = 1
                AND comment_date BETWEEN %s AND %s",
                $previous_month_start,
                $previous_month_end
            )
        );

        // Calculate growth rate
        $reviews_growth = $this->calculate_growth_rate($reviews_current, $reviews_previous);

        // 7. Abuse Reports
        $abuse_reports_current = 0;
        $abuse_reports_previous = 0;

        // Check if the table exists
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$wpdb->prefix}dokan_report_abuse_reports'");

        if ( $table_exists ) {
            // Current month
            $abuse_reports_current = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(id) FROM {$wpdb->prefix}dokan_report_abuse_reports 
                    WHERE created_at BETWEEN %s AND %s",
                    $current_month_start,
                    $current_month_end
                )
            );

            // Previous month
            $abuse_reports_previous = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(id) FROM {$wpdb->prefix}dokan_report_abuse_reports 
                    WHERE created_at BETWEEN %s AND %s",
                    $previous_month_start,
                    $previous_month_end
                )
            );
        }

        // Calculate growth rate
        $abuse_reports_growth = $this->calculate_growth_rate($abuse_reports_current, $abuse_reports_previous);

        // 8. Order Cancellation Rate
        // Current month - total orders
        $total_orders_current = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(ID) FROM $wpdb->posts 
                WHERE post_type = 'shop_order' 
                AND post_date BETWEEN %s AND %s",
                $current_month_start,
                $current_month_end
            )
        );

        // Current month - cancelled orders
        $cancelled_orders_current = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(ID) FROM $wpdb->posts 
                WHERE post_type = 'shop_order' 
                AND post_status = 'wc-cancelled'
                AND post_date BETWEEN %s AND %s",
                $current_month_start,
                $current_month_end
            )
        );

        // Previous month - total orders
        $total_orders_previous = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(ID) FROM $wpdb->posts 
                WHERE post_type = 'shop_order' 
                AND post_date BETWEEN %s AND %s",
                $previous_month_start,
                $previous_month_end
            )
        );

        // Previous month - cancelled orders
        $cancelled_orders_previous = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(ID) FROM $wpdb->posts 
                WHERE post_type = 'shop_order' 
                AND post_status = 'wc-cancelled'
                AND post_date BETWEEN %s AND %s",
                $previous_month_start,
                $previous_month_end
            )
        );

        // Calculate cancellation rates
        $cancellation_rate_current = $total_orders_current > 0 ? ($cancelled_orders_current / $total_orders_current) * 100 : 0;
        $cancellation_rate_previous = $total_orders_previous > 0 ? ($cancelled_orders_previous / $total_orders_previous) * 100 : 0;

        // Calculate growth rate (note: for cancellation rate, a decrease is actually good)
        $cancellation_rate_growth = $this->calculate_growth_rate($cancellation_rate_current, $cancellation_rate_previous, true);

        return [
            'new_products' => [
                'count'      => (int) $new_products_current,
                'growth'     => $new_products_growth,
                'tooltip'    => 'New products published in the month',
            ],
            'active_vendors' => [
                'count'      => (int) $active_vendors_current,
                'growth'     => $active_vendors_growth,
                'tooltip'    => 'Vendors sold minimum 1 product',
            ],
            'new_customers' => [
                'count'      => (int) $new_customers_current,
                'growth'     => $new_customers_growth,
                'tooltip'    => 'Total new customers registered in the time period',
            ],
            'support_tickets' => [
                'count'      => (int) $support_tickets_current,
                'growth'     => $support_tickets_growth,
                'tooltip'    => 'Support tickets raised in the time period',
                'available'  => class_exists( '\StoreSupportHelper' ),
            ],
            'refund' => [
                'amount'     => (float) $refund_current,
                'growth'     => $refund_growth,
                'tooltip'    => 'Total refunded amount in the time period',
                'available'  => true,
            ],
            'reviews' => [
                'count'      => (int) $reviews_current,
                'growth'     => $reviews_growth,
                'tooltip'    => 'Total new reviews in the time period',
                'available'  => true,
            ],
            'abuse_reports' => [
                'count'      => (int) $abuse_reports_current,
                'growth'     => $abuse_reports_growth,
                'tooltip'    => 'Total vendors who got reported in the time period',
                'available'  => $table_exists ? true : false,
            ],
            'order_cancellation_rate' => [
                'rate'       => round($cancellation_rate_current, 2),
                'growth'     => $cancellation_rate_growth,
                'tooltip'    => 'Rate of orders which got cancelled in the time period',
            ],
        ];
    }

    /**
     * Calculate growth rate between current and previous values
     *
     * @since DOKAN_SINCE
     *
     * @param float $current Current value
     * @param float $previous Previous value
     * @param bool $inverse If true, a decrease is considered positive growth
     *
     * @return float
     */
    private function calculate_growth_rate( $current, $previous, $inverse = false ) {
        if ( empty( $previous ) ) {
            return $current > 0 ? 100 : 0;
        }

        $growth = ( ( $current - $previous ) / $previous ) * 100;

        if ( $inverse ) {
            $growth = -$growth;
        }

        return round( $growth, 2 );
    }
}
