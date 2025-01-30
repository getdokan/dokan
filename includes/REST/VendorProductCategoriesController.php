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
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'products/categories';

    /**
     *
     * @return false
     */

    public function create_item_permissions_check($request) {
        return false;
    }

    /**
     * @return false
     */
    public function delete_item_permissions_check($request) {
        return false;
    }

    /**
     * @return false
     */

    public function update_item_permissions_check($request)
    {
        return false;
    }
    /**
     * Check if a given request has access to read items.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function get_items_permissions_check($request) {
        return current_user_can( 'dokandar' );
    }

    /**
     * Get all product categories.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function get_items($request) {
        // Get current user ID
        $vendor_id = dokan_get_current_user_id();

        // Get categories using parent method
        $response = parent::get_items($request);

        if (is_wp_error($response)) {
            return $response;
        }

        $categories = $response->get_data();

        // Allow other modules to filter the categories
        $categories = apply_filters('dokan_rest_get_product_categories', $categories, $vendor_id, $request);

        // Check if categories are allowed for vendor's subscription

        if (dokan_pro()->module->is_active('product_subscription')) {
        // call method get_vendor_allowed_categories() from product_subscription module
            $allowed_categories = apply_filters('dokan_get_vendor_allowed_categories', [], $vendor_id);

            if (!empty($allowed_categories)) {
                $categories = array_filter($categories, function ($category) use ($allowed_categories) {
                    return in_array($category['id'], $allowed_categories);
                });
            }
        }

        $response->set_data($categories);

        return $response;
    }


    /**
     * Check if a given request has access to read an item.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|boolean
     */
    public function get_item_permissions_check( $request ) {

        return current_user_can( 'dokandar' );
    }

    /**
     * Get a single product category.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function get_item($request) {
        $response = parent::get_item($request);

        if (is_wp_error($response)) {
            return $response;
        }

        $vendor_id = dokan_get_current_user_id();
        $category = $response->get_data();

        // Allow modules to filter single category data
        $category = apply_filters('dokan_rest_get_product_category', $category, $vendor_id, $request);

        // Check if category is allowed for vendor's subscription
        if (dokan_pro()->module->is_active('product_subscription')) {
            $allowed_categories = apply_filters('dokan_get_vendor_allowed_categories', [], $vendor_id);

            if (!empty($allowed_categories) && !in_array($category['id'], $allowed_categories)) {
                return new WP_Error(
                    'dokan_rest_category_not_allowed',
                    __('This category is not allowed in your subscription plan.', 'dokan-lite'),
                    ['status' => 403]
                );
            }
        }

        $response->set_data($category);

        return $response;
    }

    /**
     * Get the query params for collections of product categories.
     *
     * @return array
     */
    public function get_collection_params() {
        $params = parent::get_collection_params();

        // Add additional query parameters for Dokan-specific filtering
        $params['vendor_allowed'] = [
            'description' => __('Limit result set to categories allowed for vendor.', 'dokan-lite'),
            'type'        => 'boolean',
            'default'     => false,
        ];

        return $params;
    }
}
