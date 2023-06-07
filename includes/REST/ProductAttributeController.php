<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Product_Attributes_V1_Controller;
use WeDevs\Dokan\Product\ProductAttribute;
use WP_REST_Response;
use WP_REST_Server;
use WP_Error;
use WP_REST_Request;

class ProductAttributeController extends WC_REST_Product_Attributes_V1_Controller {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'products/attributes';

    /**
     * Attribute name.
     *
     * @var string
     */
    protected $attribute = '';

    /**
     * Register the routes for product attributes.
     */
    public function register_routes() {
        parent::register_routes();

        // REST API for Product attribute edit section.
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/edit-product/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_product_attribute' ),
                    'permission_callback' => array( $this, 'update_product_attribute_permissions_check' ),
                    'args'                => $this->get_product_update_collection_params(),
                ),
            )
        );

        // REST API for setting Product default attribute.
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/set-default/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_product_default_attribute' ),
                    'permission_callback' => array( $this, 'update_product_attribute_permissions_check' ),
                    'args'                => $this->get_product_update_collection_params(),
                ),
            )
        );
    }

    /**
     * Check if a given request has access to read the attributes.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return bool
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'dokandar' );
    }

    /**
     * Check if a given request has access to create a attribute.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return bool
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'dokan_add_product' );
    }

    /**
     * Check if a given request has access to read a attribute.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|bool
     */
    public function get_item_permissions_check( $request ) {
        if ( ! $this->get_taxonomy( $request ) ) {
            return new WP_Error( 'dokan_rest_taxonomy_invalid', __( 'Resource does not exist.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        return current_user_can( 'dokandar' );
    }

    /**
     * Check if a given request has access to update a attribute.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|bool
     */
    public function update_item_permissions_check( $request ) {
        if ( ! $this->get_taxonomy( $request ) ) {
            return new WP_Error( 'dokan_rest_taxonomy_invalid', __( 'Resource does not exist.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        return current_user_can( 'dokan_edit_product' );
    }

    /**
     * Check if a given request has access to update a product attribute.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|bool
     */
    public function update_product_attribute_permissions_check( $request ) {
        return current_user_can( 'dokan_edit_product' );
    }

    /**
     * Check if a given request has access to delete a attribute.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|bool
     */
    public function delete_item_permissions_check( $request ) {
        if ( ! $this->get_taxonomy( $request ) ) {
            return new WP_Error( 'woocommerce_rest_taxonomy_invalid', __( 'Resource does not exist.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        return current_user_can( 'dokan_delete_product' );
    }

    /**
     * Check if a given request has access batch create, update and delete items.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return bool|WP_Error
     */
    public function batch_items_permissions_check( $request ) {
        return current_user_can( 'dokandar' );
    }

    /**
     * Get product attribute and term update collection params.
     *
     * @since 3.7.10
     *
     * @return array
     */
    public function get_product_update_collection_params() {
        return [
            'attributes'  => [
                'description' => __( 'Attribute options.', 'dokan-lite' ),
                'type'        => 'array',
                'required'    => true,
                'context'     => [ 'edit' ],
                'items'       => [
                    'type'       => 'object',
                    'properties' => [
                        'id' => [
                            'description'       => __( 'Attribute id.', 'dokan-lite' ),
                            'type'              => 'int',
                            'context'           => [ 'edit' ],
                            'sanitize_callback' => 'absint',
                        ],
                        'name' => [
                            'description'       => __( 'Attribute name.', 'dokan-lite' ),
                            'type'              => 'string',
                            'context'           => [ 'edit' ],
                            'sanitize_callback' => 'sanitize_text_field',
                        ],
                        'visible' => [
                            'description'       => __( 'Attribute visible in product list page or not.', 'dokan-lite' ),
                            'type'              => 'boolean',
                            'default'           => false,
                            'context'           => [ 'edit' ],
                            'sanitize_callback' => 'boolval',
                        ],
                        'variation' => [
                            'description'       => __( 'Attribute is for variation or not.', 'dokan-lite' ),
                            'type'              => 'boolean',
                            'default'           => false,
                            'context'           => [ 'edit' ],
                            'sanitize_callback' => 'boolval',
                        ],
                        'options' => [
                            'description' => __( 'Attribute values.', 'dokan-lite' ),
                            'type'        => 'array',
                            'required'    => true,
                            'context'     => [ 'edit' ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Update product attributes by a product id.
     *
     * @since 3.7.10
     *
     * @param WP_Rest_Request            $request
     * @return WP_Error|WP_REST_Response Rest Response
     */
    public function update_product_attribute( $request ) {
        $product_id = isset( $request['id'] ) ? absint( wp_unslash( $request['id'] ) ) : 0;

        if ( empty( $product_id ) ) {
            return new WP_Error( 'invalid_product_id', __( 'Invalid product id.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        $product = wc_get_product( $product_id );

        if ( empty( $product ) ) {
            return new WP_Error( 'no_product_found', __( 'No product found.', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $product_attribute = new ProductAttribute( $request['attributes'] );
        $is_saved = $product_attribute->set( $product, true );

        if ( ! $is_saved ) {
            return new WP_Error( 'product_bulk_attribute_terms_saved_failed', __( 'Failed to save product bulk attribute and terms. Please try again later.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        return rest_ensure_response( $is_saved );
    }

    /**
     * Update product default attributes by a product id.
     *
     * @since 3.7.10
     *
     * @param WP_Rest_Request            $request
     *
     * @return WP_Error|WP_REST_Response Rest Response
     */
    public function update_product_default_attribute( $request ) {
        $product_id = isset( $request['id'] ) ? absint( wp_unslash( $request['id'] ) ) : 0;

        if ( empty( $product_id ) ) {
            return new WP_Error( 'invalid_product_id', __( 'Invalid product id.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        $product = wc_get_product( $product_id );

        if ( empty( $product ) ) {
            return new WP_Error( 'no_product_found', __( 'No product found.', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $product_attribute = new ProductAttribute( $request['attributes'] );
        $is_saved = $product_attribute->set_default( $product, true );

        if ( ! $is_saved ) {
            return new WP_Error( 'product_default_attribute_saved_failed', __( 'Failed to save product default attribute and terms. Please try again later.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        return rest_ensure_response( $is_saved );
    }
}
