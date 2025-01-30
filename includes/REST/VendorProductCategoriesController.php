<?php

namespace WeDevs\Dokan\REST;

use WP_Error;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WC_REST_Product_Categories_Controller;

class VendorProductCategoriesController extends WC_REST_Product_Categories_Controller {
    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Override the create_item_permissions_check method
     * @return false
     */

    public function create_item_permissions_check( $request ): bool {
        return false;
    }

    /**
     * Override the delete_item_permissions_check method
     * @return false
     */
    public function delete_item_permissions_check( $request ): bool {
        return false;
    }

    /**
     * Override the update_item_permissions_check method
     * @return false
     */

    public function update_item_permissions_check( $request ): bool {
        return false;
    }
    /**
     * Check if a given request has access to read items.
     *
     * Override the get_items_permissions_check method
     * @return boolean
     */
    public function get_items_permissions_check( $request ): bool {
        return current_user_can( 'dokandar' );
    }

    /**
     * Check if a given request has access batch create, update and delete items.
     *
     * @param  WP_REST_Request $request Full details about the request.
     *
     * @return boolean
     */
    public function batch_items_permissions_check( $request ) {
        return false;
    }

    /**
     * Get all product categories.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function get_items( $request ) {
		$request = apply_filters( 'dokan_rest_product_categories_query', $request );

        // Get categories using parent method
        return parent::get_items( $request );
    }


    /**
     * Check if a given request has access to read an item.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return boolean
     */
    public function get_item_permissions_check( $request ) {

        return current_user_can( 'dokandar' );
    }
}
