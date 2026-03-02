<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Products_Controller;
use WeDevs\Dokan\ProductEditor\PayloadResolver;
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
     * Whether the rest_pre_dispatch filter has already been registered.
     *
     * @since DOKAN_PRO_SINCE
     *
     * @var bool
     */
    private static $filter_registered = false;

    /**
     * Check if the current user can create a product.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'dokan_add_product' );
    }

    /**
     * Check if the current user can update the given product.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return bool|WP_Error
     */
    public function update_item_permissions_check( $request ) {
        if ( ! current_user_can( 'dokan_edit_product' ) ) {
            return false;
        }

        $product_id = $request->get_param( 'id' );

        if ( $product_id && ! dokan_is_product_author( $product_id ) ) {
            return new WP_Error( 'dokan_rest_cannot_edit', __( 'You do not have permission to edit this product.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        return true;
    }

    /**
     * Check if the current user can view form fields for a product.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return bool|WP_Error
     */
    public function get_form_fields_permissions_check( $request ) {
        if ( ! current_user_can( 'dokan_edit_product' ) ) {
            return false;
        }

        $product_id = $request->get_param( 'id' );

        if ( $product_id && ! dokan_is_product_author( $product_id ) ) {
            return new WP_Error( 'dokan_rest_cannot_view', __( 'You do not have permission to view this product.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        return true;
    }

    /**
     * Register the routes for products.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_routes() {
        if ( ! self::$filter_registered ) {
            add_filter( 'rest_pre_dispatch', [ $this, 'resolve_product_payload_before_validation' ], 1, 3 );
            self::$filter_registered = true;
        }

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            [
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'create_item' ],
                    'permission_callback' => [ $this, 'create_item_permissions_check' ],
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
                    'permission_callback' => [ $this, 'update_item_permissions_check' ],
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
					'permission_callback' => [ $this, 'get_form_fields_permissions_check' ],
				],
			]
        );
    }

    /**
     * Create a product item.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     */
    public function create_item( $request ) {
        $product = parent::create_item( $request );

        if ( is_wp_error( $product ) ) {
            return $product;
        }

        $product_id = (int) $product->data['id'];
        $params     = $request->get_params();
        $this->merge_post_data( $request );

        do_action( 'dokan_new_product_added', $product_id, $params );

        return $product;
    }

    /**
     * Update a product item.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     */
    public function update_item( $request ) {
        $product = parent::update_item( $request );

        if ( is_wp_error( $product ) ) {
            return $product;
        }

        $product_id = (int) $product->data['id'];
        $params     = $request->get_params();
        $this->merge_post_data( $request );
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

        $params   = $request->get_params();
        $resolved = PayloadResolver::resolve( $params );
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
                'form_items'     => dokan()->product_editor->get_schema( $product_id ),
                'vendor_earning' => dokan()->commission->get_earning_by_product( $product_id ),
            ]
        );
    }

    /**
     * Merge request params with $_POST so that WC REST API handlers see the resolved payload as if it were sent as form data.
     */
    public function merge_post_data( $request ) {
        $params = $request->get_params();
        // merge all the params with $_POST global variable
        $_POST = array_merge( $_POST, $params ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
    }
}
