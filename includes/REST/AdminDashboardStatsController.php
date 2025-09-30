<?php

namespace WeDevs\Dokan\REST;

use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WeDevs\Dokan\Models\AdminDashboardStats;
use WeDevs\Dokan\Models\VendorOrderStats;
use Automattic\WooCommerce\Admin\API\Reports\Orders\Stats\Query as DataStore;

/**
 * Todo Dashboard API Controller
 *
 * Handles todo endpoint requests
 *
 * @since 4.1.0
 */
class AdminDashboardStatsController extends DokanBaseAdminController {

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
        // Add a new endpoint for a to_do section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/todo', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_to_do' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'schema'              => [ $this, 'get_todo_schema' ],
                    'args'                => [],
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/analytics', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_analytics_data' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'schema'              => [ $this, 'get_analytics_schema' ],
                    'args'                => [],
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
                    'schema'              => [ $this, 'get_monthly_overview_schema' ],
                    'args'                => [
                        'date' => [
                            'description'       => esc_html__( 'Date in Y-m format (e.g., 2024-01)', 'dokan-lite' ),
                            'type'              => 'string',
                            'required'          => false,
                            'sanitize_callback' => 'sanitize_text_field',
                            'validate_callback' => function ( $param ) {
                                return empty( $param ) || preg_match( '/^\d{4}-\d{2}$/', $param );
                            },
                        ],
                    ],
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
                    'schema'              => [ $this, 'get_sales_chart_schema' ],
                    'args'                => [
                        'date' => [
                            'description'       => esc_html__( 'Date in Y-m format (e.g., 2024-01)', 'dokan-lite' ),
                            'type'              => 'string',
                            'required'          => false,
                            'sanitize_callback' => 'sanitize_text_field',
                            'validate_callback' => function ( $param ) {
                                return empty( $param ) || preg_match( '/^\d{4}-\d{2}$/', $param );
                            },
                        ],
                    ],
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
                    'schema'              => [ $this, 'get_all_time_stats_schema' ],
                    'args'                => [],
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
                    'schema'              => [ $this, 'get_top_performing_vendors_schema' ],
                    'args'                => [
                        'date' => [
                            'description'       => esc_html__( 'Date in Y-m format (e.g., 2024-01)', 'dokan-lite' ),
                            'type'              => 'string',
                            'required'          => false,
                            'sanitize_callback' => 'sanitize_text_field',
                            'validate_callback' => function ( $param ) {
                                return empty( $param ) || preg_match( '/^\d{4}-\d{2}$/', $param );
                            },
                        ],
                    ],
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
                    'schema'              => [ $this, 'get_most_reviewed_products_schema' ],
                    'args'                => [],
                ],
            ]
        );

        // Add a new endpoint for a vendor metrics section
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/vendor-metrics', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_vendor_metrics_data' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'schema'              => [ $this, 'get_vendor_metrics_schema' ],
                    'args'                => [
                        'date' => [
                            'description'       => esc_html__( 'Date in Y-m format (e.g., 2024-01)', 'dokan-lite' ),
                            'type'              => 'string',
                            'required'          => false,
                            'sanitize_callback' => 'sanitize_text_field',
                            'validate_callback' => function ( $param ) {
                                return empty( $param ) || preg_match( '/^\d{4}-\d{2}$/', $param );
                            },
                        ],
                    ],
                ],
            ]
        );
    }

    /**
     * Get to_do data
     *
     * @since 4.1.0
     *
     * @return WP_REST_Response
     */
    public function get_to_do() {
        $data = apply_filters(
            'dokan_rest_admin_dashboard_todo_data',
            [
                'vendor_approvals'    => [
                    'icon'         => 'UserCheck',
                    'count'        => $this->get_vendor_approvals_count(),
                    'title'        => esc_html__( 'Vendor Approvals', 'dokan-lite' ),
                    'redirect_url' => admin_url( 'admin.php?page=dokan#/vendors?status=pending' ),
                    'position'     => 10,
                ],
                'product_approvals'   => [
                    'icon'         => 'Box',
                    'count'        => $this->get_product_approvals_count(),
                    'title'        => esc_html__( 'Product Approvals', 'dokan-lite' ),
                    'redirect_url' => admin_url( 'edit.php?post_status=pending&post_type=product' ),
                    'position'     => 20,
                ],
                'pending_withdrawals' => [
                    'icon'         => 'PanelTop',
                    'count'        => $this->get_pending_withdrawals_count(),
                    'title'        => esc_html__( 'Pending Withdrawals', 'dokan-lite' ),
                    'redirect_url' => admin_url( 'admin.php?page=dokan#/withdraw?status=pending' ),
                    'position'     => 30,
                ],
            ],
            $this
        );

        return rest_ensure_response( $data );
    }

    /**
     * Get analytics data.
     *
     * @since 4.1.0
     *
     * @return WP_REST_Response
     */
    public function get_analytics_data() {
        $data = apply_filters(
            'dokan_rest_admin_dashboard_analytics_data',
            [
                'sales_overview' => [
                    'icon'  => 'Coins',
                    'url'   => wc_admin_url( '&path=/analytics/overview' ),
                    'title' => esc_html__( 'Sales Overview', 'dokan-lite' ),
                ],
                'revenue_insight' => [
                    'icon'  => 'BadgeDollarSign',
                    'url'   => wc_admin_url( '&path=/analytics/revenue' ),
                    'title' => esc_html__( 'Revenue Insight', 'dokan-lite' ),
                ],
            ],
            $this
        );

        return rest_ensure_response( $data );
    }

    /**
     * Get monthly_overview data
     *
     * @since 4.1.0
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function get_monthly_overview_data( $request ) {
        // Get the selected month and year from the request
        $date = $request->get_param( 'date' ) ?? dokan_current_datetime()->format( 'Y-m' );

        return rest_ensure_response( $this->get_monthly_overview( $date ) );
    }

    /**
     * Get sales_chart data
     *
     * @since 4.1.0
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function get_sales_chart_data( $request ) {
        // Get the selected month and year from the request (same as monthly overview)
        $date = $request->get_param( 'date' )
            ? sanitize_text_field( $request->get_param( 'date' ) )
            : dokan_current_datetime()->format( 'Y-m' );

        return rest_ensure_response( $this->get_sales_chart( $date ) );
    }


    /**
     * Get all_time_stats data
     *
     * @since 4.1.0
     *
     * @return WP_REST_Response
     */
    public function get_all_time_stats_data() {
        return rest_ensure_response( $this->get_all_time_stats() );
    }

    /**
     * Get top_performing_vendors data
     *
     * @since 4.1.0
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function get_top_performing_vendors_data( $request ) {
        // Get the selected month and year from the request
        $date = $request->get_param( 'date' )
            ? sanitize_text_field( $request->get_param( 'date' ) )
            : dokan_current_datetime()->format( 'Y-m' );

        return rest_ensure_response( $this->get_top_performing_vendors( $date ) );
    }

    /**
     * Get most_reviewed_products data
     *
     * @since 4.1.0
     *
     * @return WP_REST_Response
     */
    public function get_most_reviewed_products_data() {
        return rest_ensure_response( $this->get_most_reviewed_products() );
    }

    /**
     * Get vendor_metrics data
     *
     * @since 4.1.0
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response
     */
    public function get_vendor_metrics_data( $request ) {
        // Get the selected month and year from the request
        $date = $request->get_param( 'date' )
            ? sanitize_text_field( $request->get_param( 'date' ) )
            : dokan_current_datetime()->format( 'Y-m' );

        return rest_ensure_response( $this->get_vendor_metrics( $date ) );
    }

    /**
     * Get vendor approvals count
     *
     * @since 4.1.0
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
     * @since 4.1.0
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
     * @since 4.1.0
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
     * @since 4.1.0
     *
     * @param string $date The date for which to get the vendor data (optional).
     *
     * @return array
     */
    public function get_top_performing_vendors( $date = '' ) {
        $result     = [];
        $date_range = $this->parse_date_range( $date );
        $vendors    = AdminDashboardStats::get_top_performing_vendors( $date_range['current_month_start'], $date_range['current_month_end'], 5 );

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
            $result,
            $date
        );
    }

    /**
     * Get most reviewed products
     *
     * @since 4.1.0
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
     * @since 4.1.0
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
                ],
            ]
        );

        $stats_query = new DataStore( $query_args );
        $stats_data  = $stats_query->get_data();

        // If there's an error, set the totals to 0.
        if ( is_wp_error( $stats_data ) ) {
            $total_sales       = 0;
            $total_commissions = 0;
        } else {
            $total_sales       = $stats_data->totals->total_sales ?? 0;
            $total_commissions = $stats_data->totals->total_admin_commission ?? 0;
        }

        return apply_filters(
            'dokan_rest_admin_dashboard_all_time_stats_data',
            [
                'total_products'    => [
                    'icon'  => 'Box',
                    'count' => (int) $total_products,
                    'title' => esc_html__( 'Total Products', 'dokan-lite' ),
                ],
                'total_vendors'     => [
                    'icon'  => 'UserRound',
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
     * @since 4.1.0
     *
     * @param string $date The date for which to get the sales data (optional).
     *
     * @return array
     */
    public function get_sales_chart( $date = '' ) {
        // Current month totals
        $date_range = $this->parse_date_range( $date );

        // Get a daily breakdown
        $daily_intervals = VendorOrderStats::get_sales_chart_data(
            $date_range['current_month_start'],
            $date_range['current_month_end'],
            true // group by day
        );

        return apply_filters(
            'dokan_rest_admin_dashboard_sales_chart_data',
            [
                'intervals' => $daily_intervals,
            ],
            $date_range
        );
    }

    /**
     * Get vendor metrics data
     *
     * @since 4.1.0
     *
     * @param string $date
     *
     * @return array
     */
    public function get_vendor_metrics( string $date = '' ): array {
        // Date range for the current month.
        $date_range     = $this->parse_date_range( $date );
        $vendor_metrics = AdminDashboardStats::get_vendor_metrics(
            $date_range['current_month_start'],
            $date_range['current_month_end']
        );

        return apply_filters(
            'dokan_rest_admin_dashboard_vendor_metrics_data',
            $vendor_metrics,
            $date_range
        );
    }

    /**
     * Get monthly overview data
     *
     * @since 4.1.0
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
     * @since 4.1.0
     *
     * @param string $date The date string in Y-m format (optional)
     *
     * @return array Array containing parsed date information
     */
    public function parse_date_range( $date = '' ) {
        // Parse the selected date to get year and month
        $date       = ! empty( $date ) ? sanitize_text_field( $date ) : dokan_current_datetime()->format( 'Y-m' );
        $date_parts = explode( '-', $date );
        $year       = (int) ( $date_parts[0] ?? dokan_current_datetime()->format( 'Y' ) );
        $month      = (int) ( $date_parts[1] ?? dokan_current_datetime()->format( 'm' ) );

        // Ensure valid month range
        $month = max( 1, min( 12, $month ) );

        // Get current date information
        $current_datetime = dokan_current_datetime();
        $current_year     = (int) $current_datetime->format( 'Y' );
        $current_month    = (int) $current_datetime->format( 'm' );
        $current_day      = (int) $current_datetime->format( 'd' );

        // Check if the selected month is the current running month
        $is_current_running_month = ( $year === $current_year && $month === $current_month );

        // Calculate the start and end dates for the selected month
        $current_month_start = dokan_current_datetime()->modify( "$year-$month-01" )->format( 'Y-m-01' );

        if ( $is_current_running_month ) {
            $current_month_end = $current_datetime->format( 'Y-m-d' );
        } else {
            $current_month_end = dokan_current_datetime()->modify( "$year-$month-01" )->format( 'Y-m-t' );
        }

        // Calculate the start and end dates for the previous month
        $previous_month_start = dokan_current_datetime()->modify( "$year-$month-01 -1 month" )->format( 'Y-m-01' );
        if ( $is_current_running_month ) {
            $previous_month_datetime = dokan_current_datetime()->modify( "$year-$month-01 -1 month" );
            $previous_month_year     = (int) $previous_month_datetime->format( 'Y' );
            $previous_month_num      = (int) $previous_month_datetime->format( 'm' );

            $days_in_previous_month = (int) $previous_month_datetime->format( 't' );
            $target_day = min( $current_day, $days_in_previous_month );

            $previous_month_end = sprintf( '%04d-%02d-%02d', $previous_month_year, $previous_month_num, $target_day );
        } else {
            $previous_month_end = dokan_current_datetime()->modify( "$year-$month-01 -1 month" )->format( 'Y-m-t' );
        }

        return apply_filters(
            'dokan_rest_admin_dashboard_date_range',
            [
                'current_month_start'  => $current_month_start,
                'current_month_end'    => $current_month_end,
                'previous_month_start' => $previous_month_start,
                'previous_month_end'   => $previous_month_end,
            ]
        );
    }

    /**
     * Get filtered product types
     *
     * @since 4.1.0
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

    /**
     * Get schema for todo endpoint
     *
     * @since 4.1.0
     *
     * @return array
     */
    public function get_todo_schema() {
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => esc_html__( 'Todo Dashboard Data', 'dokan-lite' ),
            'type'       => 'object',
            'properties' => [
                'vendor_approvals'    => [
                    'description' => esc_html__( 'Vendor approval task information', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'         => [
                            'description' => esc_html__( 'Icon name for the task', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                        'count'        => [
                            'description' => esc_html__( 'Number of pending vendor approvals', 'dokan-lite' ),
                            'type'        => 'integer',
                        ],
                        'title'        => [
                            'description' => esc_html__( 'Task title', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                        'redirect_url' => [
                            'description' => esc_html__( 'URL to redirect for this task', 'dokan-lite' ),
                            'type'        => 'string',
                            'format'      => 'uri',
                        ],
                        'position'     => [
                            'description' => esc_html__( 'Display position order', 'dokan-lite' ),
                            'type'        => 'integer',
                        ],
                    ],
                ],
                'product_approvals'   => [
                    'description' => esc_html__( 'Product approval task information', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'         => [
                            'description' => esc_html__( 'Icon name for the task', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                        'count'        => [
                            'description' => esc_html__( 'Number of pending product approvals', 'dokan-lite' ),
                            'type'        => 'integer',
                        ],
                        'title'        => [
                            'description' => esc_html__( 'Task title', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                        'redirect_url' => [
                            'description' => esc_html__( 'URL to redirect for this task', 'dokan-lite' ),
                            'type'        => 'string',
                            'format'      => 'uri',
                        ],
                        'position'     => [
                            'description' => esc_html__( 'Display position order', 'dokan-lite' ),
                            'type'        => 'integer',
                        ],
                    ],
                ],
                'pending_withdrawals' => [
                    'description' => esc_html__( 'Pending withdrawal task information', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'         => [
                            'description' => esc_html__( 'Icon name for the task', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                        'count'        => [
                            'description' => esc_html__( 'Number of pending withdrawals', 'dokan-lite' ),
                            'type'        => 'integer',
                        ],
                        'title'        => [
                            'description' => esc_html__( 'Task title', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                        'redirect_url' => [
                            'description' => esc_html__( 'URL to redirect for this task', 'dokan-lite' ),
                            'type'        => 'string',
                            'format'      => 'uri',
                        ],
                        'position'     => [
                            'description' => esc_html__( 'Display position order', 'dokan-lite' ),
                            'type'        => 'integer',
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Get schema for analytics endpoint
     *
     * @since 4.1.0
     *
     * @return array
     */
    public function get_analytics_schema() {
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => esc_html__( 'Analytics Dashboard Data', 'dokan-lite' ),
            'type'       => 'object',
            'properties' => [
                'sales_overview'  => [
                    'description' => esc_html__( 'Sales overview analytics link', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'  => [
                            'description' => esc_html__( 'Icon name for the analytics item', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                        'url'   => [
                            'description' => esc_html__( 'URL to the analytics page', 'dokan-lite' ),
                            'type'        => 'string',
                            'format'      => 'uri',
                        ],
                        'title' => [
                            'description' => esc_html__( 'Analytics item title', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                    ],
                ],
                'revenue_insight' => [
                    'description' => esc_html__( 'Revenue insight analytics link', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'  => [
                            'description' => esc_html__( 'Icon name for the analytics item', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                        'url'   => [
                            'description' => esc_html__( 'URL to the analytics page', 'dokan-lite' ),
                            'type'        => 'string',
                            'format'      => 'uri',
                        ],
                        'title' => [
                            'description' => esc_html__( 'Analytics item title', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Get schema for monthly overview endpoint
     *
     * @since 4.1.0
     *
     * @return array
     */
    public function get_monthly_overview_schema() {
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => esc_html__( 'Monthly Overview Dashboard Data', 'dokan-lite' ),
            'type'       => 'object',
            'properties' => [
                'new_products' => [
                    'description' => esc_html__( 'New products statistics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'     => [ 'type' => 'string' ],
                        'current'  => [ 'type' => 'integer' ],
                        'previous' => [ 'type' => 'integer' ],
                        'title'    => [ 'type' => 'string' ],
                        'tooltip'  => [ 'type' => 'string' ],
                        'position' => [ 'type' => 'integer' ],
                    ],
                ],
                'active_vendors' => [
                    'description' => esc_html__( 'Active vendors statistics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'     => [ 'type' => 'string' ],
                        'current'  => [ 'type' => 'integer' ],
                        'previous' => [ 'type' => 'integer' ],
                        'title'    => [ 'type' => 'string' ],
                        'tooltip'  => [ 'type' => 'string' ],
                        'position' => [ 'type' => 'integer' ],
                    ],
                ],
                'new_vendor_registration' => [
                    'description' => esc_html__( 'New vendor registration statistics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'     => [ 'type' => 'string' ],
                        'current'  => [ 'type' => 'integer' ],
                        'previous' => [ 'type' => 'integer' ],
                        'title'    => [ 'type' => 'string' ],
                        'tooltip'  => [ 'type' => 'string' ],
                        'position' => [ 'type' => 'integer' ],
                    ],
                ],
                'new_customers' => [
                    'description' => esc_html__( 'New customers statistics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'     => [ 'type' => 'string' ],
                        'current'  => [ 'type' => 'integer' ],
                        'previous' => [ 'type' => 'integer' ],
                        'title'    => [ 'type' => 'string' ],
                        'tooltip'  => [ 'type' => 'string' ],
                        'position' => [ 'type' => 'integer' ],
                    ],
                ],
                'order_cancellation_rate' => [
                    'description' => esc_html__( 'Order cancellation rate statistics', 'dokan-lite' ),
                    'type'        => 'object',
                ],
                'recurring_customers' => [
                    'description' => esc_html__( 'Recurring customers statistics', 'dokan-lite' ),
                    'type'        => 'object',
                ],
            ],
        ];
    }

    /**
     * Get schema for sales chart endpoint
     *
     * @since 4.1.0
     *
     * @return array
     */
    public function get_sales_chart_schema() {
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => esc_html__( 'Sales Chart Data', 'dokan-lite' ),
            'type'       => 'object',
            'properties' => [
                'intervals' => [
                    'description' => esc_html__( 'Daily sales intervals data', 'dokan-lite' ),
                    'type'        => 'array',
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'date'         => [ 'type' => 'string' ],
                            'total_sales'  => [ 'type' => 'number' ],
                            'net_sales'    => [ 'type' => 'number' ],
                            'order_count'  => [ 'type' => 'integer' ],
                            'commissions'  => [ 'type' => 'number' ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Get schema for all-time stats endpoint
     *
     * @since 4.1.0
     *
     * @return array
     */
    public function get_all_time_stats_schema() {
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => esc_html__( 'All Time Stats Data', 'dokan-lite' ),
            'type'       => 'object',
            'properties' => [
                'total_products' => [
                    'description' => esc_html__( 'Total products statistics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'  => [ 'type' => 'string' ],
                        'count' => [ 'type' => 'integer' ],
                        'title' => [ 'type' => 'string' ],
                    ],
                ],
                'total_vendors' => [
                    'description' => esc_html__( 'Total vendors statistics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'  => [ 'type' => 'string' ],
                        'count' => [ 'type' => 'integer' ],
                        'title' => [ 'type' => 'string' ],
                    ],
                ],
                'total_customers' => [
                    'description' => esc_html__( 'Total customers statistics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'  => [ 'type' => 'string' ],
                        'count' => [ 'type' => 'integer' ],
                        'title' => [ 'type' => 'string' ],
                    ],
                ],
                'total_orders' => [
                    'description' => esc_html__( 'Total orders statistics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'  => [ 'type' => 'string' ],
                        'count' => [ 'type' => 'integer' ],
                        'title' => [ 'type' => 'string' ],
                    ],
                ],
                'total_sales' => [
                    'description' => esc_html__( 'Total sales statistics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'  => [ 'type' => 'string' ],
                        'count' => [ 'type' => 'number' ],
                        'title' => [ 'type' => 'string' ],
                    ],
                ],
                'total_commissions' => [
                    'description' => esc_html__( 'Total commissions statistics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'  => [ 'type' => 'string' ],
                        'count' => [ 'type' => 'number' ],
                        'title' => [ 'type' => 'string' ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Get schema for top performing vendors endpoint
     *
     * @since 4.1.0
     *
     * @return array
     */
    public function get_top_performing_vendors_schema() {
        return [
            '$schema' => 'http://json-schema.org/draft-04/schema#',
            'title'   => esc_html__( 'Top Performing Vendors Data', 'dokan-lite' ),
            'type'    => 'array',
            'items'   => [
                'type'       => 'object',
                'properties' => [
                    'rank' => [
                        'description' => esc_html__( 'Vendor ranking position', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                    'vendor_name' => [
                        'description' => esc_html__( 'Vendor shop name', 'dokan-lite' ),
                        'type'        => 'string',
                    ],
                    'total_earning' => [
                        'description' => esc_html__( 'Total earnings amount', 'dokan-lite' ),
                        'type'        => 'number',
                    ],
                    'total_orders' => [
                        'description' => esc_html__( 'Total number of orders', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                    'total_commission' => [
                        'description' => esc_html__( 'Total commission amount', 'dokan-lite' ),
                        'type'        => 'number',
                    ],
                ],
            ],
        ];
    }

    /**
     * Get schema for most reviewed products endpoint
     *
     * @since 4.1.0
     *
     * @return array
     */
    public function get_most_reviewed_products_schema() {
        return [
            '$schema' => 'http://json-schema.org/draft-04/schema#',
            'title'   => esc_html__( 'Most Reviewed Products Data', 'dokan-lite' ),
            'type'    => 'array',
            'items'   => [
                'type'       => 'object',
                'properties' => [
                    'rank' => [
                        'description' => esc_html__( 'Product ranking position', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                    'product_id' => [
                        'description' => esc_html__( 'Product ID', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                    'product_title' => [
                        'description' => esc_html__( 'Product title', 'dokan-lite' ),
                        'type'        => 'string',
                    ],
                    'review_count' => [
                        'description' => esc_html__( 'Number of reviews', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                ],
            ],
        ];
    }

    /**
     * Get schema for vendor metrics endpoint
     *
     * @since 4.1.0
     *
     * @return array
     */
    public function get_vendor_metrics_schema() {
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => esc_html__( 'Vendor Metrics Data', 'dokan-lite' ),
            'type'       => 'object',
            'properties' => [
                'subscribed_vendors' => [
                    'description' => esc_html__( 'Subscribed vendors metrics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'  => [
                            'description' => esc_html__( 'Icon name for the metric', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                        'count' => [
                            'description' => esc_html__( 'Number of subscribed vendors', 'dokan-lite' ),
                            'type'        => 'integer',
                        ],
                        'title' => [
                            'description' => esc_html__( 'Metric title', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                    ],
                ],
                'vendors_on_vacation' => [
                    'description' => esc_html__( 'Vendors on vacation metrics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'  => [
                            'description' => esc_html__( 'Icon name for the metric', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                        'count' => [
                            'description' => esc_html__( 'Number of vendors on vacation', 'dokan-lite' ),
                            'type'        => 'integer',
                        ],
                        'title' => [
                            'description' => esc_html__( 'Metric title', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                    ],
                ],
                'verified_vendors' => [
                    'description' => esc_html__( 'Verified vendors metrics', 'dokan-lite' ),
                    'type'        => 'object',
                    'properties'  => [
                        'icon'  => [
                            'description' => esc_html__( 'Icon name for the metric', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                        'count' => [
                            'description' => esc_html__( 'Number of verified vendors', 'dokan-lite' ),
                            'type'        => 'integer',
                        ],
                        'title' => [
                            'description' => esc_html__( 'Metric title', 'dokan-lite' ),
                            'type'        => 'string',
                        ],
                    ],
                ],
            ],
        ];
    }
}
