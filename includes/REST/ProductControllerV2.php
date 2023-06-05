<?php

namespace WeDevs\Dokan\REST;

use WP_REST_Server;
use WP_REST_Request;
use WeDevs\Dokan\ProductCategory\Helper;

/**
 * Products API Controller V2
 *
 * @package dokan
 *
 * @author weDevs <info@wedevs.com>
 */
class ProductControllerV2 extends ProductController {

    /**
     * Endpoint namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v2';

    /**
     * Register all routes related with stores
     *
     * @since 3.7.10
     *
     * @return void
     */
    public function register_routes() {
        parent::register_routes();

        register_rest_route(
            $this->namespace, '/' . $this->base, [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_items' ],
                    'args'                => $this->get_product_collection_params(),
                    'permission_callback' => [ $this, 'get_product_permissions_check' ],
                ],
                'schema' => [ $this, 'get_item_schema' ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/filter-by-data', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_product_filter_by_data' ],
                    'permission_callback' => [ $this, 'get_product_permissions_check' ],
                ],
                'schema' => [ $this, 'get_filter_data_schema' ],
            ]
        );
    }

    /**
     * Saves product.
     *
     * @since 3.7.16
     *
     * @param WP_REST_Request $request
     *
     * @return void
     */
    public function create_item( $request ) {
        $response = parent::create_item( $request );

        $this->set_chosen_categories( $response );

        return $response;
    }

    /**
     * Updates product.
     *
     * @since 3.7.16
     *
     * @param WP_REST_Request $request
     *
     * @return void
     */
    public function update_item( $request ) {
        $response = parent::update_item( $request );

        $this->set_chosen_categories( $response );

        return $response;
    }

    /**
     * Save chosen category to database.
     *
     * @param WP_Error|WP_REST_Response $response
     *
     * @return void
     */
    private function set_chosen_categories( $response ) {
        if ( ! is_wp_error( $response ) ) {
            $product = $response->get_data();

            $chosen_cat = ! empty( $request['chosen_cat'] ) && is_array( $request['chosen_cat'] ) ? array_map( 'absint', $request['chosen_cat'] ) : [];

            $product['chosen_cat'] = $chosen_cat;
            $response->set_data( $product );

            Helper::generate_and_set_chosen_categories( $product['id'], $chosen_cat );
        }
    }

    /**
     * Product API query parameters collections.
     *
     * @since 3.7.10
     *
     * @return array Query parameters.
     */
    public function get_product_collection_params() {
        $params = parent::get_collection_params();

        $params['author'] = array(
            'description'       => __( 'Products author id', 'dokan-lite' ),
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        $params['post_status'] = array(
            'description'       => __( 'Product status publish, pending, draft etc.', 'dokan-lite' ),
            'type'              => 'array',
            'sanitize_callback' => 'wc_clean',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        $params['date'] = array(
            'description'       => __( 'Products publish month', 'dokan-lite' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        $params['product_cat'] = array(
            'description'       => __( 'Products category.', 'dokan-lite' ),
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        $params['product_type'] = array(
            'description'       => __( 'Products type simple, variable, grouped product etc.', 'dokan-lite' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        $params['stock_status'] = array(
            'description'       => __( 'Products stock status in stock or out of stock.', 'dokan-lite' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        $params['filter_by_other'] = array(
            'description'       => __( 'Best selling, featured products etc.', 'dokan-lite' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        return $params;
    }

    /**
     * Returns data by which products can be filtered.
     *
     * @since 3.7.10
     *
     * @return array
     */
    public function get_product_filter_by_data() {
        global $wp_locale;

        $months = dokan_get_products_listing_months_for_vendor( dokan_get_current_user_id() );

        foreach ( $months as $key => $arc_row ) {
            $month = zeroise( $arc_row->month, 2 );

            /* translators: 1: Month, 2: Year */
            $months [ $key ]->title = sprintf( esc_html__( '%1$s %2$d', 'dokan-lite' ), esc_html( $wp_locale->get_month( $month ) ), esc_html( $arc_row->year ) );
        }
        return [
            'allDates'   => $months,
        ];
    }

    /**
     * Preparing query parameters array to fetch products from database.
     *
     * @param WP_REST_Request $request
     *
     * @return array
     */
    protected function prepare_objects_query( $request ) {
        $args = parent::prepare_objects_query( $request );

        $args = array_merge(
            $args,
            array(
                'posts_per_page' => 10,
                'paged'          => 1,
                'author'         => dokan_get_current_user_id(),
                'orderby'        => 'post_date',
                'post_type'      => 'product',
                'date_query'     => [],
                'tax_query'      => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
                    array(
                        'taxonomy' => 'product_type',
                        'field'    => 'slug',
                        'terms'    => apply_filters( 'dokan_product_listing_exclude_type', array() ),
                        'operator' => 'NOT IN',
                    ),
                ),
            )
        );

        $stock_statuses = apply_filters( 'dokan_product_stock_statuses', [ 'instock', 'outofstock' ] );
        $product_types  = apply_filters( 'dokan_product_types', [ 'simple' => __( 'Simple', 'dokan-lite' ) ] );

        // If any vendor it trying to access other products then we need to replace author id by current user id.
        if ( $request->get_param( 'author' ) && ! current_user_can( dokana_admin_menu_capability() ) ) {
            $args['author'] = dokan_get_current_user_id();
        }

        // Pagination page number.
        if ( $request->get_param( 'page' ) ) {
            $args['paged'] = $request->get_param( 'page' );
        }

        // Products publish month.
        if ( $request->get_param( 'date' ) ) {
            $args['m'] = $request->get_param( 'date' );
        }

        // Products category.
        if ( $request->get_param( 'product_cat' ) && intval( $request->get_param( 'product_cat' ) ) !== -1 ) {
            $args['tax_query'][] = array(
                'taxonomy'         => 'product_cat',
                'field'            => 'id',
                'terms'            => intval( $request->get_param( 'product_cat' ) ),
                'include_children' => false,
            );
        }

        // Products type.
        if ( $request->get_param( 'product_type' ) ) {
            $product_type = $request->get_param( 'product_type' );

            if ( array_key_exists( $product_type, $product_types ) ) {
                $args['tax_query'][] = [
                    'taxonomy' => 'product_type',
                    'field'    => 'slug',
                    'terms'    => $product_type,
                ];
            }
        }

        // Product stock status.
        if ( isset( $request['stock_status'] ) && in_array( $request['stock_status'], $stock_statuses, true ) ) {
            $args['meta_query'][] = array(
                'key'     => '_stock_status',
                'value'   => sanitize_text_field( wp_unslash( $request['stock_status'] ) ),
                'compare' => ' = ',
            );
        }

        return apply_filters( 'dokan_rest_pre_product_listing_args', $args, $request );
    }

    /**
     * Returns filter data items schema.
     *
     * @since DOKAN_LITE
     *
     * @return array array of the schema.
     */
    public function get_filter_data_schema() {
        return array(
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'filter-by-data',
            'type'       => 'object',
            'properties' => array(
                'allDates'  => array(
                    'description' => esc_html__( 'All product created months.', 'dokan-lite' ),
                    'type'        => 'array',
                    'readonly'    => true,
                    'items' => array(
                        'type'   => 'object',
                        'properties' => array(
                            'year' => array(
                                'description' => esc_html__( 'Product publish year.', 'dokan-lite' ),
                                'type'        => 'integer',
                            ),
                            'month' => array(
                                'description' => esc_html__( 'Product publish month.', 'dokan-lite' ),
                                'type'        => 'integer',
                            ),
                            'title' => array(
                                'description' => esc_html__( 'Product publish month and year full title.', 'dokan-lite' ),
                                'type'        => 'string',
                            ),
                        ),
                    ),
                ),
            ),
        );
    }
}
