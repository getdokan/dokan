<?php

namespace WeDevs\Dokan\REST;

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;
use WC_REST_Product_Tags_Controller;
use WP_REST_Server;

/**
 * Vendor Product Tags REST controller.
 *
 * Exposes product tags to vendors so the product editor can search/load tags
 * lazily instead of embedding the full tag list in the form schema.
 *
 * @since 5.0.5
 */
class VendorProductTagsController extends WC_REST_Product_Tags_Controller {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Register the routes for product tags.
     *
     * @return void
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
     * Check if a given request has access to read tags.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return bool
     */
    public function get_items_permissions_check( $request ): bool {
        return current_user_can( 'dokandar' );
    }

    /**
     * Check if a given request has access to read a single tag.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return bool
     */
    public function get_item_permissions_check( $request ): bool {
        return current_user_can( 'dokandar' );
    }

    /**
     * Get all product tags.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     */
    public function get_items( $request ) {
        $request = apply_filters( 'dokan_rest_product_tags_query', $request );

        return parent::get_items( $request );
    }

    /**
     * Get a single product tag.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     */
    public function get_item( $request ) {
        $request = apply_filters( 'dokan_rest_product_tag_query', $request );

        return parent::get_item( $request );
    }
}
