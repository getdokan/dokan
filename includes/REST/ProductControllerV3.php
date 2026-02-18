<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Products_Controller;
use WeDevs\Dokan\ProductForm\PayloadResolver;
use WeDevs\Dokan\Traits\VendorAuthorizable;
use WP_REST_Server;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class ProductControllerV3 extends WC_REST_Products_Controller {

    use VendorAuthorizable;

    /**
     * Endpoint namespace
     *
     * @since DOKAN_SINCE
     *
     * @var string
     */
    protected $namespace = 'dokan/v3';

    /**
     * Register the routes for products.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_routes() {
        add_filter( 'rest_pre_dispatch', [ $this, 'resolve_product_payload_before_validation' ], 1, 3 );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            [
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'create_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
                ],
                'schema' => [ $this, 'get_item_schema' ],
            ]
        );
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            [
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
                ],
                'schema' => [ $this, 'get_item_schema' ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)/fields',
            [
				'args' => [
					'id' => [
						'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
						'type'        => 'integer',
					],
				],
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_form_fields' ],
					'permission_callback' => [ $this, 'check_permission' ],
				],
			]
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)/variations',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_product_variations' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
    }

    /**
     * Create a product item
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     */

    public function create_item( $request ) {
        $product = parent::create_item( $request );
        $params = $request->get_params();
        $product_id = is_wp_error( $product ) ? 0 : (int) $product->data['id'];
        do_action( 'dokan_new_product_added', $product_id, $params );
        return $product;
    }

    /**
     * Create a product item
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     */

    public function update_item( $request ) {
        $product = parent::update_item( $request );
        $product_id = is_wp_error( $product ) ? 0 : (int) $product->data['id'];
        $params = $request->get_params();
        do_action( 'dokan_product_updated', $product_id, $params );
        return $product;
    }

    /**
     * Resolve product request body before schema validation runs (so WC schema sees WC-shaped payload).
     * Runs on rest_pre_dispatch so that schema_to_wc_api is applied before args validation.
     *
     * @param mixed            $result  Response to replace the short-circuit result with.
     * @param WP_REST_Server  $server  Server instance.
     * @param WP_REST_Request $request Request used to generate the response.
     *
     * @return mixed Unchanged result so dispatch continues; request body is modified in place.
     */
    public function resolve_product_payload_before_validation( $result, $server, $request ) {
        $route = $request->get_route();
        $route_normalized = trim( $route, '/' );
        $prefix = trim( $this->namespace . '/' . $this->rest_base, '/' );
        // Only resolve for create (dokan/v3/products) or update (dokan/v3/products/123), not for .../fields.
        if ( $route_normalized !== $prefix && ! preg_match( '#^' . preg_quote( $prefix, '#' ) . '/\d+$#', $route_normalized ) ) {
            return $result;
        }

        $params = $request->get_params();
        $resolved = PayloadResolver::schema_to_wc_api( $params );
        $request->set_body( wp_json_encode( $resolved ) );
        return $result;
    }

    /**
     * Get item fields for form manager
     *
     * @param WP_REST_Request $request Request data.
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_form_fields( $request ) {
        $product_id = $request->get_param( 'id' );
        $product    = wc_get_product( $product_id );
        if ( ! $product ) {
            return new WP_Error( 'dokan_rest_product_invalid_id', __( 'Invalid product ID.', 'dokan-lite' ), [ 'status' => 404 ] );
        }
        return rest_ensure_response(
            [
                'form_items'     => dokan()->product_form->get_fields( $product_id ),
                'vendor_earning' => dokan()->commission->get_earning_by_product( $product_id ),
            ]
        );
    }

    /**
     * Get product variations for form manager
     *
     * @param WP_REST_Request $request Request data.
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_product_variations( $request ) {
        $product_id = $request->get_param( 'id' );
        $product    = wc_get_product( $product_id );
        if ( ! $product ) {
            return new WP_Error( 'dokan_rest_product_invalid_id', __( 'Invalid product ID.', 'dokan-lite' ), [ 'status' => 404 ] );
        }
        return rest_ensure_response( dokan()->product_form->get_product_variations( $product_id ) );
    }
}
