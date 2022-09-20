<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Product_Attribute_Terms_V1_Controller;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

class ProductAttributeTermsController extends WC_REST_Product_Attribute_Terms_V1_Controller {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Check if a given request has access to read the attributes.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'dokandar' );
    }

    /**
     * Check if a given request has access to create a attribute.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'dokan_add_product' );
    }

    /**
     * Check if a given request has access to read a attribute.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function get_item_permissions_check( $request ) {
        return current_user_can( 'dokandar' );
    }


    /**
     * Check if a given request has access to update a attribute.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'dokan_edit_product' );
    }

    /**
     * Check if a given request has access to delete a attribute.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|boolean
     */
    public function delete_item_permissions_check( $request ) {
        return current_user_can( 'dokan_delete_product' );
    }


    /**
     * Delete a single term from a taxonomy.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function delete_item( $request ) {
        $taxonomy = $this->get_taxonomy( $request );

        $term = get_term( (int) $request['id'], $taxonomy );

        if ( empty( $term ) ) {
            return new WP_Error( 'dokan_rest_no_term', __( 'The term cannot found', 'dokan-lite' ), array( 'status' => 500 ) );
        }

        $request->set_param( 'context', 'edit' );
        $response = $this->prepare_item_for_response( $term, $request );

        $retval = wp_delete_term( $term->term_id, $term->taxonomy );
        if ( ! $retval ) {
            return new WP_Error( 'dokan_rest_cannot_delete', __( 'The resource cannot be deleted.', 'dokan-lite' ), array( 'status' => 500 ) );
        }

        do_action( "dokan_rest_delete_{$taxonomy}", $term, $response, $request );

        return $response;
    }
}
