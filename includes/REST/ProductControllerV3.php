<?php

namespace WeDevs\Dokan\REST;

use WC_Product;
use WC_Product_Simple;
use WC_REST_Products_Controller;
use WeDevs\Dokan\Intelligence\Manager;
use WeDevs\Dokan\Intelligence\Services\Model;
use WeDevs\Dokan\ProductEditor\FormSchema;
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
     * @since 5.0.0
     *
     * @var string
     */
    protected $namespace = 'dokan/v3';

    /**
     * Whether the rest_pre_dispatch filter has already been registered.
     *
     * @since 5.0.0
     *
     * @var bool
     */
    private static $filter_registered = false;

    /**
     * Check if the current user can create a product.
     *
     * @since 5.0.0
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return true|WP_Error
     */
    public function create_item_permissions_check( $request ) {
        if ( ! current_user_can( 'dokan_add_product' ) ) {
            return new WP_Error( 'dokan_rest_cannot_create', __( 'You do not have permission to create products.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        return true;
    }

    /**
     * Check if the current user can view/update the given product.
     *
     * @since 5.0.0
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return true|WP_Error
     */
    public function check_permission( $request ) {
        if ( ! current_user_can( 'dokan_edit_product' ) ) {
            return new WP_Error( 'dokan_rest_cannot_edit', __( 'You do not have permission to edit products.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        $product_id = $request->get_param( 'id' );

        if ( $product_id && ! dokan_is_product_author( $product_id ) ) {
            return new WP_Error( 'dokan_rest_cannot_view', __( 'You do not have permission to view/edit this product.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        return true;
    }

    /**
     * Check if the current user has permission for batch operations.
     *
     * @since 5.0.0
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return true|WP_Error
     */
    public function batch_items_permissions_check( $request ) {
        if ( ! current_user_can( 'dokan_edit_product' ) ) {
            return new WP_Error( 'dokan_rest_cannot_batch', __( 'You do not have permission to batch update products.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        return true;
    }

    /**
     * Bulk create, update and delete items.
     *
     * Resolves each item's payload through PayloadResolver before delegating
     * to the parent WC_REST_Controller::batch_items().
     *
     * @since 5.0.0
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return array|WP_Error
     */
    public function batch_items( $request ) {
        $body = $request->get_json_params();

        if ( empty( $body ) ) {
            $body = $request->get_body_params();
        }

        foreach ( [ 'update', 'create' ] as $key ) {
            if ( ! empty( $body[ $key ] ) && is_array( $body[ $key ] ) ) {
                foreach ( $body[ $key ] as $index => $item ) {
                    $body[ $key ][ $index ] = PayloadResolver::resolve( $item );
                }
            }
        }

        $request->set_body( wp_json_encode( $body ) );

        return parent::batch_items( $request );
    }

    /**
     * Register the routes for products.
     *
     * @since 5.0.0
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
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
                ],
                'schema' => [ $this, 'get_item_schema' ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/batch',
            [
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'batch_items' ],
                    'permission_callback' => [ $this, 'batch_items_permissions_check' ],
                ],
                'schema' => [ $this, 'get_public_batch_schema' ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/init/fields',
            [
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'init_form_fields' ],
					'permission_callback' => [ $this, 'check_permission' ],
				],
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
     * Create a product item.
     *
     * @since 5.0.0
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
        $this->populate_post_data( $params );

        do_action( 'dokan_new_product_added', $product_id, $params );

        return $product;
    }

    /**
     * Update a product item.
     *
     * @since 5.0.0
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
        $this->populate_post_data( $params );

        do_action( 'dokan_product_updated', $product_id, $params );

        return $product;
    }

    /**
     * Populate $_POST with resolved request params so legacy hooks
     * (e.g. dokan_new_product_added, dokan_product_updated consumers)
     * that read from $_POST continue to work.
     *
     * @since 5.0.0
     *
     * @param array $params Resolved request parameters.
     *
     * @return void
     */
    private function populate_post_data( array $params ): void {
        $_POST = array_merge( $_POST, $params ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
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

    public function init_form_fields( $request ) {

        if ( ! current_user_can( 'dokan_edit_product' ) || ! dokan_is_seller_enabled( dokan_get_current_user_id() ) ) {
            return new WP_Error(
                'dokan_rest_product_init_error',
                __( 'Invalid product ID.', 'dokan-lite' ),
                [ 'status' => 401 ]
            );
        }

        $product_id = $request->get_param( 'id' );
        $product = wc_get_product( $product_id );
        $is_new_product = false;

        if ( empty( $product_id ) ) {
            $product = new WC_Product_Simple();
            $product->set_status( 'auto-draft' );
            $product->set_name( '' );
            $product->save();
            $is_new_product = true;

            // Assign the current vendor as the product author.
            wp_update_post(
                [
                    'ID'          => $product->get_id(),
                    'post_author' => dokan_get_current_user_id(),
                ]
            );
            $product_id = $product->get_id();
        }
        // check if product exists and belongs to the current vendor
        if ( ! dokan_is_product_author( $product_id ) ) {
            return new WP_Error(
                'dokan_rest_product_init_error',
                __( 'Invalid product ID.', 'dokan-lite' ),
                [ 'status' => 404 ]
            );
        }

        $vendor_earning = dokan()->commission->get_earning_by_product( $product_id );
        $fields = dokan()->product_editor->get_schema( $product_id );
        $layouts = FormSchema::get_layouts();
        $is_enabled = dokan_get_option( 'dokan_ai_image_gen_availability', 'dokan_ai', 'off' ) === 'on';
        $manager = dokan()->get_container()->get( Manager::class );
        $is_image_configured = $is_enabled && $manager->is_configured( Model::SUPPORTS_IMAGE );

        $args = [
            'form_items'             => $fields,
            'form_layouts'           => $layouts,
            'product_id'             => $product_id,
            'is_new_product'         => $is_new_product,
            'view_product_url'       => get_permalink( $product_id ),
            'vendor_earning'         => $vendor_earning,
            'can_add_new_attribute'  => dokan_get_option( 'add_new_attribute', 'dokan_selling', 'off' ) === 'on',
            'ai_settings'            => [
                'ai_text_enable'    => $manager->is_configured(),
                'ai_image_enable'   => $is_image_configured,
            ],
            'products_url'           => dokan_get_navigation_url( 'products', true ),
        ];

        $data = apply_filters( 'dokan_product_editor_args', $args, $product_id, $product );

        return rest_ensure_response( $data );
    }

    /**
     * Get item fields for form manager
     *
     * @param WP_REST_Request $request Request data.
     *
     * @since 5.0.0
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_form_fields( $request ) {
        $product_id = $request->get_param( 'id' );
        $product    = wc_get_product( $product_id );
        $force      = $request->get_param( 'force' ) ?? false;

        if ( ! $product && ! $force ) {
            return new WP_Error( 'dokan_rest_product_invalid_id', __( 'Invalid product ID.', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $data = [
            'form_items'     => dokan()->product_editor->get_schema( $product_id ),
            'vendor_earning' => dokan()->commission->get_earning_by_product( $product_id ),
        ];

        $data = apply_filters( 'dokan_rest_prepare_product_editor_fields', $data, $product, $request );

        return rest_ensure_response( $data );
    }
}
