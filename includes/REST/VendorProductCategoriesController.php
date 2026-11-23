<?php

namespace WeDevs\Dokan\REST;

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WC_REST_Product_Categories_Controller;
use WP_REST_Server;
use WeDevs\Dokan\ProductCategory\Helper as ProductCategoryHelper;

class VendorProductCategoriesController extends WC_REST_Product_Categories_Controller {
    /**
     * Endpoint namespace.
     * @since 4.0.0
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Register the routes for terms.
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                    'args'                => $this->get_collection_params(),
                ),
                'schema' => array( $this, 'get_public_item_schema' ),
            )
        );

        // Nested category tree for the product editor's hierarchical category picker.
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/tree',
            array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_tree' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                'args'   => array(
                    'id' => array(
                        'description' => __( 'Unique identifier for the resource.', 'dokan-lite' ),
                        'type'        => 'integer',
                    ),
                ),
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => array( $this, 'get_item_permissions_check' ),
                    'args'                => array(
                        'context' => $this->get_context_param( array( 'default' => 'view' ) ),
                    ),
                ),
                'schema' => array( $this, 'get_public_item_schema' ),
            )
        );
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
     * Check if a given request has access to read a single item.
     *
     * Override the get_item_permissions_check method
     * @return boolean
     */

    public function get_item_permissions_check( $request ): bool {
        return current_user_can( 'dokandar' );
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
     * Get a single product category.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|WP_REST_Response
     */

    public function get_item( $request ) {
        $request = apply_filters( 'dokan_rest_product_category_query', $request );

        // Get category using parent method
        return parent::get_item( $request );
    }

    /**
     * Get the full nested product category tree.
     *
     * Returns the hierarchy as [ { value, label, children: [...] }, ... ] so the
     * product editor can render an indented category picker without embedding the
     * tree in the form schema.
     *
     * @since 5.0.5
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response
     */
    public function get_tree( $request ) {
        $tree = apply_filters(
            'dokan_rest_product_categories_tree',
            ProductCategoryHelper::get_product_categories_tree( true ),
            $request
        );

        return rest_ensure_response( $tree );
    }
}
