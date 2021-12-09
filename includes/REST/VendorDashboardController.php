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
                    'callback'            => [ $this, 'get_profile_information' ],
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
                            'default'     => dokan_current_datetime()->modify( 'first day of this month' )->format( 'c' ),
                        ],
                        'to'   => [
                            'type'        => 'string',
                            'format'      => 'date-time',
                            'description' => __( 'To Date', 'dokan-lite' ),
                            'required'    => true,
                            'default'     => dokan_current_datetime()->format( 'c' ),
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
        register_rest_route(
            $this->namespace, '/' . $this->base . '/preferences', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_preferences' ],
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
        return rest_ensure_response(
            [
                'balance'  => dokan_get_seller_balance( dokan_get_current_user_id() ),
                'orders'   => dokan_count_orders( dokan_get_current_user_id() ),
                'products' => dokan_count_posts( 'product', dokan_get_current_user_id() ),
                'earnings' => wc_price( dokan_author_total_sales( dokan_get_current_user_id() ) ),
                'views'    => dokan_author_pageviews( dokan_get_current_user_id() ),
            ]
        );
    }

    /**
     * Get Vendor profile Information.
     *
     * @since 3.3.3
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_profile_information() {
        return rest_ensure_response(
            dokan_get_store_info( dokan_get_current_user_id() )
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

    /**
     * Get Preferences.
     *
     * @since 3.3.3
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_preferences() {
        return rest_ensure_response(
            [
                'currency'              => get_woocommerce_currency(),
                'currency_position'     => get_option( 'woocommerce_currency_pos' ),
                'currency_symbol'       => get_woocommerce_currency_symbol(),
                'decimal_separator'     => wc_get_price_decimal_separator(),
                'thousand_separator'    => wc_get_price_thousand_separator(),
                'decimal_point'         => wc_get_price_decimals(),
                'tax_calculation'       => get_option( 'woocommerce_calc_taxes' ),
                'tax_display_cart'      => get_option( 'woocommerce_tax_display_cart' ),
                'tax_round_at_subtotal' => get_option( 'woocommerce_tax_round_at_subtotal' ),
                'coupon_enabled'        => get_option( 'woocommerce_enable_coupons' ),
                'coupon_compound'       => get_option( 'woocommerce_calc_discounts_sequentially' ),
                'weight_unit'           => get_option( 'woocommerce_weight_unit' ),
                'dimension_unit'        => get_option( 'woocommerce_dimension_unit' ),
                'product_reviews'       => get_option( 'woocommerce_enable_reviews' ),
                'product_ratings'       => get_option( 'woocommerce_enable_review_rating' ),
                'stock_management'      => get_option( 'woocommerce_manage_stock' ),
                'timezone'              => wp_timezone_string(),
                'date_format'           => get_option( 'date_format' ),
                'time_format'           => get_option( 'time_format' ),
                'language'              => get_locale(),
            ]
        );
    }
}
