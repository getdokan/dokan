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
                            'default'     => dokan_current_datetime()->modify( 'first day of this month' )->format( 'c' ),
                        ],
                        'to'   => [
                            'type'        => 'string',
                            'format'      => 'date-time',
                            'description' => __( 'To Date', 'dokan-lite' ),
                            'default'     => dokan_current_datetime()->format( 'c' ),
                        ],
                        'filter_range'   => [
                            'type'              => 'boolean',
                            'description'       => __( 'Returns all sales reports if true', 'dokan-lite' ),
                            'default'           => true,
                            'validate_callback' => 'rest_is_boolean',
                            'sanitize_callback' => 'rest_sanitize_boolean',
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
                    'args'                => $this->get_collection_params(),
                    'permission_callback' => 'is_user_logged_in',
                ],
                'schema' => array( $this, 'get_public_item_schema' ),
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
                'earnings' => dokan_get_seller_earnings( $user_id ),
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
        $from             = $request->get_param( 'from' );
        $to               = $request->get_param( 'to' );
        $group_by         = $request->get_param( 'group_by' );
        $filter_range     = $request->get_param( 'filter_range' );
        $from_date        = dokan_current_datetime()->modify( $from );
        $to_date          = dokan_current_datetime()->modify( $to );
        $interval         = DateInterval::createFromDateString( '1 ' . $group_by );
        $to_date          = $to_date->add( $interval );
        $group_by_array   = [];
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
                    '_qty' => array(
                        'type'            => 'order_item_meta',
                        'order_item_type' => 'line_item',
                        'function'        => 'SUM',
                        'name'            => 'total_products',
                    ),
                    'net_amount' => array(
                        'type'     => 'dokan_orders',
                        'function' => 'SUM',
                        'name'     => 'total_earnings',
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
                'filter_range' => $filter_range,
                'debug'        => false,
            ),
            $from_date->format( 'Y-m-d' ),
            $to_date->format( 'Y-m-d' )
        );

        $min_date = time();

        array_walk(
            $order_report_data, function ( &$item ) use ( $date_time_format, &$min_date ) {
                $post_date       = dokan_current_datetime()->modify( $item->post_date );
                $min_date        = $post_date->getTimestamp() < $min_date ? $post_date->getTimestamp() : $min_date;
                $item->post_date = $post_date->format( $date_time_format );
            }
        );

        if ( $filter_range ) {
            $from_date = dokan_current_datetime()->setTimestamp( $min_date )->modify( '-3 day' );
        }

        $date_range = new DatePeriod( $from_date, $interval, $to_date );

        foreach ( $date_range as $date ) {
            $post_date = $date->format( $date_time_format );
            $key = array_search( $post_date, array_column( $order_report_data, 'post_date' ), true );

            if ( false === $key ) {
                $sales_item = new \stdClass();
                $sales_item->post_date      = $post_date;
                $sales_item->total_sales    = 0;
                $sales_item->total_orders   = 0;
                $sales_item->total_earnings = 0;
                $sales_item->total_products = 0;

                $data[] = $sales_item;
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
    public function get_orders_summary( $request ) {
        $start_date  = ! empty( $request['after'] ) ? sanitize_text_field( $request['after'] ) : '';
        $end_date    = ! empty( $request['before'] ) ? sanitize_text_field( $request['before'] ) : '';
        $customer_id = ! empty( $request['customer_id'] ) ? absint( $request['customer_id'] ) : 0;

        $args = [
            'return'    => 'count',
            'seller_id' => dokan_get_current_user_id(),
            'date'      => [
                'from' => $start_date,
                'to'   => $end_date,
            ],
            'customer_id' => $customer_id,
            'status'      => 'all',
        ];

        $dokan_order = dokan()->order;
        $result = [];
        $result['total'] = $dokan_order->all( $args );

        $order_statuses = wc_get_order_statuses();
        foreach ( $order_statuses as $key => $status ) {
            $args['status'] = $key;
            $result[ $key ] = $dokan_order->all( $args );
        }

        return rest_ensure_response( $result );
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
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            // The title property marks the identity of the resource.
            'title'      => 'preferences',
            'type'       => 'object',
            // In JSON Schema you can specify object properties in the properties attribute.
            'properties' => [
                'currency'              => [
                    'description' => esc_html__( 'Payment currency.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'currency_position'     => [
                    'description' => esc_html__( 'Payment currency position.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'currency_symbol'       => [
                    'description' => esc_html__( 'Currency symbol.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'decimal_separator'     => [
                    'description' => esc_html__( 'Decimal separator.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'thousand_separator'    => [
                    'description' => esc_html__( 'Thousand separator.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'decimal_point'         => [
                    'description' => esc_html__( 'Decimal point.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'tax_calculation'       => [
                    'description' => esc_html__( 'Tax Calculation enabled or not.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'tax_display_cart'      => [
                    'description' => esc_html__( 'Tax display in cart price.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'tax_round_at_subtotal' => [
                    'description' => esc_html__( 'Tax Tax price round up in subtotal.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'coupon_enabled'        => [
                    'description' => esc_html__( 'Coupon enabled in store.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'coupon_compound'       => [
                    'description' => esc_html__( 'Compound coupon calculation.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'weight_unit'           => [
                    'description' => esc_html__( 'Measurement unit for weight.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'dimension_unit'        => [
                    'description' => esc_html__( 'Measurement unit for dimension.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'product_reviews'       => [
                    'description' => esc_html__( 'Enabled product reviews.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'product_ratings'       => [
                    'description' => esc_html__( 'Enabled product rating.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'stock_management'      => [
                    'description' => esc_html__( 'Enabled product stock management.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'timezone'              => [
                    'description' => esc_html__( 'Store timezone.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'date_format'           => [
                    'description' => esc_html__( 'Store date format.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'time_format'           => [
                    'description' => esc_html__( 'Store time format.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
                'language'              => [
                    'description' => esc_html__( 'Store language.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view' ],
                    'readonly'    => true,
                ],
            ],
        ];
    }

    /**
     * Get our sample schema for order-summary.
     */
    public function get_order_summary_schema() {
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'order-summary',
            'type'       => 'object',
            'properties' => [
                'customer_id'          => array(
                    'description' => __( 'User ID who owns the order. 0 for guests.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'default'     => 0,
                    'context'     => array( 'view' ),
                ),
                'after' => array(
                    'description' => __( 'Start date to show orders', 'dokan-lite' ),
                    'type'        => 'date-time',
                    'default'     => null,
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'before' => array(
                    'description' => __( 'End date to show orders', 'dokan-lite' ),
                    'type'        => 'date-time',
                    'default'     => null,
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
            ],
        ];
    }

    /**
     * Retrieves the query params for the posts collection.
     *
     * @since 4.7.0
     *
     * @return array Collection parameters.
     */
    public function get_collection_params() {
        $query_params = parent::get_collection_params();

        $query_params['context']['default'] = 'view';

        $schema            = $this->get_order_summary_schema();
        $schema_properties = $schema['properties'];

        $query_params['customer_id'] = array(
            'required'    => false,
            'default'     => $schema_properties['customer_id']['default'],
            'description' => $schema_properties['customer_id']['description'],
            'type'        => $schema_properties['customer_id']['type'],
        );

        $query_params['after'] = array(
            'required'    => false,
            'default'     => $schema_properties['after']['default'],
            'description' => $schema_properties['after']['description'],
            'type'        => $schema_properties['after']['type'],
        );

        $query_params['before'] = array(
            'required'    => false,
            'default'     => $schema_properties['before']['default'],
            'description' => $schema_properties['before']['description'],
            'type'        => $schema_properties['before']['type'],
        );

        return $query_params;
    }
}
