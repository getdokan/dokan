<?php
namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Abstracts\DokanRESTVendorController;
use WP_Error;
use WP_REST_Server;

class ProductCategoriesVendorController extends DokanRESTVendorController {

    protected $rest_base = 'product-categories';

    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->rest_base, [
				[
					'methods'             => 'GET',
                    'callback' => array( $this, 'get_product_categories' ),
					'permission_callback' => [ $this, 'check_permission' ],
                    'args' => $this->get_collection_params(),

                ],
			]
        );
    }

    /**
     * Get the product categories
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return \WP_REST_Response | \WP_Error Response object on success, or WP_Error object on failure.
     */
    public function get_product_categories( $request ) {
        // Get parameters from request
        $per_page = $request->get_param( 'per_page' ) ? $request->get_param( 'per_page' ) : 10;
        $page = $request->get_param( 'page' ) ? $request->get_param( 'page' ) : 1;
        $search = $request->get_param( 'search' );
        $exclude = $request->get_param( 'exclude' );
        $include = $request->get_param( 'include' );
        $order = $request->get_param( 'order' );
        $orderby = $request->get_param( 'orderby' );
        $hide_empty = $request->get_param( 'hide_empty' );
        $parent = $request->get_param( 'parent' );
        $fields = $request->get_param( '_fields' );
        // Set up query arguments
        $args = array(
            'taxonomy' => 'product_cat',
            'number' => $per_page,
            'offset' => ( $page - 1 ) * $per_page,
            'hide_empty' => $hide_empty === 'true',
            'orderby' => $orderby ? $orderby : 'name',
            'order' => $order ? $order : 'ASC',
        );

        // Add conditional parameters
        if ( $search ) {
            $args['search'] = $search;
        }
        if ( $exclude ) {
            $args['exclude'] = array_map( 'absint', explode( ',', $exclude ) );
        }
        if ( $include ) {
            $args['include'] = array_map( 'absint', explode( ',', $include ) );
        }
        if ( $parent ) {
            $args['parent'] = absint( $parent );
        }

        // Get categories
        $categories = get_terms( $args );

        if ( is_wp_error( $categories ) ) {
            return new WP_Error(
                'rest_category_error',
                __( 'Error retrieving product categories.', 'dokan-lite' ),
                array( 'status' => 400 )
            );
        }

        // Get total count for pagination
        $total_args = $args;
        unset( $total_args['number'] );
        unset( $total_args['offset'] );
        $total_categories = wp_count_terms( $args );

        // Format the response data
        $data = array();
        foreach ( $categories as $category ) {
            $response = $this->prepare_category_for_response( $category, $request );
            if ( $fields ) {
                $response = $this->filter_response_by_fields( $response, $fields );
            }
            $data[] = $response;
        }

        // Create response with pagination headers
        $response = new \WP_REST_Response( $data );
        $response->header( 'X-WP-Total', (int) $total_categories );
        $response->header( 'X-WP-TotalPages', ceil( $total_categories / $per_page ) );

        return $response;
    }

    /**
     * Prepare category data for REST response
     *
     * @param WP_Term $category The category object.
     * @param WP_REST_Request $request Request object.
     * @return array Formatted category data.
     */
    protected function prepare_category_for_response( $category, $request ) {
        $thumbnail_id = get_term_meta( $category->term_id, 'thumbnail_id', true );
        $thumbnail_url = $thumbnail_id ? wp_get_attachment_url( $thumbnail_id ) : '';

        return array(
            'id' => (int) $category->term_id,
            'name' => $category->name,
            'slug' => $category->slug,
            'parent' => (int) $category->parent,
            'description' => $category->description,
            'count' => (int) $category->count,
            'thumbnail' => $thumbnail_url,
            'link' => get_term_link( $category ),
        );
    }

    /**
     * Filter response data by requested fields
     *
     * @param array $response Response data.
     * @param string $fields Requested fields.
     * @return array Filtered response data.
     */
    protected function filter_response_by_fields( $response, $fields ) {
        $fields = explode( ',', $fields );
        return array_intersect_key( $response, array_flip( $fields ) );
    }

    /**
     * Get collection parameters for the REST API
     *
     * @return array Collection parameters.
     */
    public function get_collection_params() {
        return array(
            'page' => array(
                'description' => 'Current page of the collection.',
                'type' => 'integer',
                'default' => 1,
                'minimum' => 1,
                'sanitize_callback' => 'absint',
            ),
            'per_page' => array(
                'description' => 'Maximum number of items to be returned in result set.',
                'type' => 'integer',
                'default' => 10,
                'minimum' => 1,
                'maximum' => 100,
                'sanitize_callback' => 'absint',
            ),
            'search' => array(
                'description' => 'Limit results to those matching a string.',
                'type' => 'string',
            ),
            'exclude' => array(
                'description' => 'Ensure result set excludes specific IDs.',
                'type' => 'string',
            ),
            'include' => array(
                'description' => 'Limit result set to specific IDs.',
                'type' => 'string',
            ),
            'order' => array(
                'description' => 'Order sort attribute ascending or descending.',
                'type' => 'string',
                'default' => 'ASC',
                'enum' => array( 'ASC', 'DESC' ),
            ),
            'orderby' => array(
                'description' => 'Sort collection by term attribute.',
                'type' => 'string',
                'default' => 'name',
                'enum' => array( 'name', 'id', 'slug', 'count' ),
            ),
            'hide_empty' => array(
                'description' => 'Whether to hide terms not assigned to any posts.',
                'type' => 'boolean',
                'default' => false,
            ),
            'parent' => array(
                'description' => 'Limit result set to terms assigned to a specific parent.',
                'type' => 'integer',
            ),
            '_fields' => array(
                'description' => 'Limit response to specific fields.',
                'type' => 'string',
            ),
        );
    }
}
