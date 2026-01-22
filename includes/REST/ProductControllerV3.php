<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Products_Controller;
use WeDevs\Dokan\Product\FormManager;
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
				'sections' => FormManager::get_form_fields( $product_id ),
				'vendor_earning' => dokan()->commission->get_earning_by_product( $product_id ),
			]
        );
    }
}
