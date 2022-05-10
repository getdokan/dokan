<?php

namespace WeDevs\Dokan\REST;

use DateInterval;
use DatePeriod;
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
                        'group_by'   => [
                            'type'        => 'string',
                            'description' => __( 'Group By', 'dokan-lite' ),
                            'required'    => false,
                            'default'     => 'day',
                            'enum'        => [ 'day', 'week', 'month', 'year' ],
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
                    'schema'              => [ $this, 'get_preferences_schema' ],
                    'permission_callback' => 'is_user_logged_in',
                ],
            ]
        );
    }

    /**
     * Get dashboard statistics.
     *
     * @since 3.3.3
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_dashboard_statistics() {
        $user_id = dokan_get_current_user_id();

        return rest_ensure_response(
            [
                'balance'  => dokan_get_seller_balance( $user_id ),
                'orders'   => dokan_count_orders( $user_id ),
                'products' => dokan_count_posts( 'product', $user_id ),
                'sales'    => wc_price( dokan_author_total_sales( $user_id ) ),
                'earnings' => wc_price( dokan_get_seller_earnings( $user_id ) ),
                'views'    => dokan_author_pageviews( $user_id ),
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
        $from           = $request->get_param( 'from' );
        $to             = $request->get_param( 'to' );
        $group_by       = $request->get_param( 'group_by' );
        $from_date      = dokan_current_datetime()->modify( $from );
        $to_date        = dokan_current_datetime()->modify( $to );
        $interval       = DateInterval::createFromDateString( '1 ' . $group_by );
        $to_date        = $to_date->add( $interval );
        $group_by_array = [];
        $date_time_format = 'Y-m-d';

        switch ( $group_by ) {
            case 'week':
                $group_by_array = [
                    'YEAR(post_date)',
					'MONTH(post_date)',
					'WEEK(post_date)',
                ];
                $date_time_format = 'W, Y';
                break;
            case 'month':
                $group_by_array = [
                    'YEAR(post_date)',
                    'MONTH(post_date)',
                ];
                $date_time_format = 'F, Y';
                break;
            case 'year':
                $group_by_array = [
                    'YEAR(post_date)',
                ];
                $date_time_format = 'Y';
                break;
            case 'day':
            default:
                $group_by_array = [
                    'YEAR(post_date)',
                    'MONTH(post_date)',
                    'DAY(post_date)',
                ];
                $date_time_format = 'F j, Y';
                break;
        }

        $order_report_data = dokan_get_order_report_data(
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
                'group_by'     => implode( ', ', $group_by_array ),
                'order_by'     => 'post_date ASC',
                'query_type'   => 'get_results',
                'filter_range' => true,
                'debug'        => false,
            ),
            $from_date->format( 'Y-m-d' ),
            $to_date->format( 'Y-m-d' )
        );

        array_walk(
            $order_report_data, function( &$item ) use ( $date_time_format ) {
				$item->post_date = dokan_current_datetime()->modify( $item->post_date )->format( $date_time_format );
			}
        );

        $date_range = new DatePeriod( $from_date, $interval, $to_date );

        foreach ( $date_range as $date ) {
            $post_date = $date->format( $date_time_format );
            $key = array_search( $post_date, array_column( $order_report_data, 'post_date' ), true );

            if ( false === $key ) {
                $data[] = array(
                    'post_date'    => $post_date,
                    'total_sales'  => 0,
                    'total_orders' => 0,
                );
            } else {
                $data[] = $order_report_data[ $key ];
            }
        }

        return rest_ensure_response( $data );
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

    /**
     * Get our sample schema for preferences.
     */
    public function get_preferences_schema() {
        return array(
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            // The title property marks the identity of the resource.
            'title'      => 'preferences',
            'type'       => 'object',
            // In JSON Schema you can specify object properties in the properties attribute.
            'properties' => array(
                'currency'              => array(
                    'description' => esc_html__( 'Payment currency.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'currency_position'     => array(
                    'description' => esc_html__( 'Payment currency position.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'currency_symbol'       => array(
                    'description' => esc_html__( 'Currency symbol.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'decimal_separator'     => array(
                    'description' => esc_html__( 'Decimal separator.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'thousand_separator'    => array(
                    'description' => esc_html__( 'Thousand separator.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'decimal_point'         => array(
                    'description' => esc_html__( 'Decimal point.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'tax_calculation'       => array(
                    'description' => esc_html__( 'Tax Calculation enabled or not.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'tax_display_cart'      => array(
                    'description' => esc_html__( 'Tax display in cart price.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'tax_round_at_subtotal' => array(
                    'description' => esc_html__( 'Tax Tax price round up in subtotal.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'coupon_enabled'        => array(
                    'description' => esc_html__( 'Coupon enabled in store.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'coupon_compound'       => array(
                    'description' => esc_html__( 'Compound coupon calculation.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'weight_unit'           => array(
                    'description' => esc_html__( 'Measurement unit for weight.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'dimension_unit'        => array(
                    'description' => esc_html__( 'Measurement unit for dimension.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'product_reviews'       => array(
                    'description' => esc_html__( 'Enabled product reviews.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'product_ratings'       => array(
                    'description' => esc_html__( 'Enabled product rating.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'stock_management'      => array(
                    'description' => esc_html__( 'Enabled product stock management.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'timezone'              => array(
                    'description' => esc_html__( 'Store timezone.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'date_format'           => array(
                    'description' => esc_html__( 'Store date format.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'time_format'           => array(
                    'description' => esc_html__( 'Store time format.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'language'              => array(
                    'description' => esc_html__( 'Store language.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
            ),
        );
    }
}
