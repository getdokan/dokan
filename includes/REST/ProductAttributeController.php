<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Product_Attributes_V1_Controller;
use WP_Error;

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
    }

    /**
     * Check if a given request has access to read the attributes.
     *
     * @param  WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'dokandar' );
    }

    /**
     * Check if a given request has access to create a attribute.
     *
     * @param  WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'dokan_add_product' );
    }

    /**
     * Check if a given request has access to read a attribute.
     *
     * @param  WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
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
     * @return WP_Error|boolean
     */
    public function update_item_permissions_check( $request ) {
        if ( ! $this->get_taxonomy( $request ) ) {
            return new WP_Error( 'dokan_rest_taxonomy_invalid', __( 'Resource does not exist.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        return current_user_can( 'dokan_edit_product' );
    }

    /**
     * Check if a given request has access to delete a attribute.
     *
     * @param  WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
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
}
