<?php

namespace WeDevs\Dokan\REST;

use WP_Error;
use WP_HTTP_Response;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class VendorDashboardController extends \WP_REST_Controller {

    /**
     * Endpoint namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route name
     *
     * @var string
     */
    protected $base = 'vendor-dashboard';

    /**
     * Vendor dashboard controller constructor.
     *
     * @since 3.3.3
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->base, [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_dashboard_statistics' ],
                    'args'                => [],
                    'permission_callback' => 'is_user_logged_in',
                ],
            ]
        );
        register_rest_route(
            $this->namespace, '/' . $this->base . '/profile', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_profile_completeness' ],
                    'args'                => [],
                    'permission_callback' => 'is_user_logged_in',
                ],
            ]
        );
        register_rest_route(
            $this->namespace, '/' . $this->base . '/sales', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_sales_reports' ],
                    'args'                => [
                        'from' => [
                            'type'        => 'string',
                            'format'      => 'date-time',
                            'description' => __( 'From Date', 'dokan-lite' ),
                            'required'    => true,
                        ],
                        'to'   => [
                            'type'        => 'string',
                            'format'      => 'date-time',
                            'description' => __( 'To Date', 'dokan-lite' ),
                            'required'    => true,
                        ],
                    ],
                    'permission_callback' => 'is_user_logged_in',
                ],
            ]
        );
        register_rest_route(
            $this->namespace, '/' . $this->base . '/products', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_products_summary' ],
                    'args'                => [],
                    'permission_callback' => 'is_user_logged_in',
                ],
            ]
        );
        register_rest_route(
            $this->namespace, '/' . $this->base . '/orders', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_orders_summary' ],
                    'args'                => [],
                    'permission_callback' => 'is_user_logged_in',
                ],
            ]
        );
    }

    /**
     * Get dashboard statistics.
     *
     *
     * @since 3.3.3
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_dashboard_statistics() {
        $vendor = dokan()->vendor->get( dokan_get_current_user_id() );

        return rest_ensure_response(
            [
                'total_sales'    => $vendor->get_sales(),
                'total_orders'   => $vendor->get_orders_count(),
                'total_products' => $vendor->get_products_count(),
                'total_earnings' => $vendor->get_earnings(),
                'total_views'    => $vendor->get_pageview(),
            ]
        );
    }

    /**
     * Get Vendor profile completeness.
     *
     * @since 3.3.3
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_profile_completeness() {
        $vendor = dokan()->vendor->get( get_current_user_id() );

        return rest_ensure_response(
            $vendor->get_profile_completeness()
        );
    }

    /**
     * Get Vendor Sales Report.
     *
     * @since 3.3.3
     *
     * @param WP_REST_Request $request
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_sales_reports( $request ) {
        return rest_ensure_response(
            dokan_get_order_report_data(
                array(
                    'data' => array(
                        '_order_total' => array(
                            'type'     => 'meta',
                            'function' => 'SUM',
                            'name'     => 'total_sales',
                        ),
                        'ID' => array(
                            'type'     => 'post_data',
                            'function' => 'COUNT',
                            'name'     => 'total_orders',
                            'distinct' => true,
                        ),
                        'post_date' => array(
                            'type'     => 'post_data',
                            'function' => '',
                            'name'     => 'post_date',
                        ),
                    ),
                    'group_by'     => 'YEAR(post_date), MONTH(post_date), DAY(post_date)',
                    'order_by'     => 'post_date ASC',
                    'query_type'   => 'get_results',
                    'filter_range' => true,
                    'debug' => false,
                ),
                dokan_current_datetime()->modify( $request->get_param( 'from' ) )->format( 'Y-m-d' ),
                dokan_current_datetime()->modify( $request->get_param( 'to' ) )->format( 'Y-m-d' )
            )
        );
    }

    /**
     * Get Vendor products reports summary.
     *
     * @since 3.3.3
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_products_summary() {
        return rest_ensure_response( dokan_count_posts( 'product', dokan_get_current_user_id() ) );
    }

    /**
     * Get Vendor Order reports summary.
     *
     * @since 3.3.3
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_orders_summary() {
        return rest_ensure_response(
            dokan_count_orders( dokan_get_current_user_id() )
        );
    }
}
