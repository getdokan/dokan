<?php

namespace WeDevs\Dokan\REST;

use WC_REST_Product_Categories_Controller;
use WP_Error;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WP_Term;

/**
 * Vendor Product Categories REST Controller
 *
 * Extends WooCommerce Product Categories REST API for vendor-specific functionality
 *
 * @since 3.0.0
 */
class VendorProductCategoriesController extends WC_REST_Product_Categories_Controller {
    /**
     * Endpoint namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route base
     *
     * @var string
     */
    protected $rest_base = 'products/categories';

    /**
     * Register routes
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_items' ],
                    'permission_callback' => [ $this, 'get_items_permissions_check' ],
                    'args'                => $this->get_collection_params(),
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_item' ],
                    'permission_callback' => [ $this, 'get_item_permissions_check' ],
                    'args'                => [
                        'id' => [
                            'description' => __( 'Unique identifier for the resource.', 'dokan-lite' ),
                            'type'        => 'integer',
                        ],
                        'context' => $this->get_context_param( [ 'default' => 'view' ] ),
                    ],
                ],
            ]
        );
    }

    /**
     * Check permissions for getting items
     *
     * @param WP_REST_Request $request Request object
     * @return bool|WP_Error
     */
    public function get_items_permissions_check( $request ) {
        if ( ! is_user_logged_in() ) {
            return new WP_Error(
                'dokan_rest_unauthorized',
                __( 'You are not logged in.', 'dokan-lite' ),
                [ 'status' => rest_authorization_required_code() ]
            );
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return new WP_Error(
                'dokan_rest_forbidden',
                __( 'You are not authorized to view product categories.', 'dokan-lite' ),
                [ 'status' => 403 ]
            );
        }

        return true;
    }

    /**
     * Get a collection of product categories
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response|WP_Error
     */
    public function get_items( $request ) {
        $vendor_id = get_current_user_id();

        // Prepare query arguments
        $prepared_args = $this->prepare_vendor_category_args( $request, $vendor_id );

        if ( is_wp_error( $prepared_args ) ) {
            return $prepared_args;
        }

        // Get categories
        $terms = get_terms( $prepared_args );

        if ( is_wp_error( $terms ) ) {
            return new WP_Error(
                'dokan_rest_category_error',
                __( 'Error retrieving product categories.', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
        }

        $response = [];
        foreach ( $terms as $term ) {
            $data = $this->prepare_item_for_response( $term, $request );
            $response[] = $this->prepare_response_for_collection( $data );
        }

        // Pagination headers
        $total_terms = wp_count_terms( $prepared_args );
        $max_pages = ceil( $total_terms / (int) $prepared_args['number'] );

        $rest_response = rest_ensure_response( $response );
        $rest_response->header( 'X-WP-Total', (int) $total_terms );
        $rest_response->header( 'X-WP-TotalPages', (int) $max_pages );

        return $rest_response;
    }

    /**
     * Prepare vendor category arguments
     *
     * @param WP_REST_Request $request Request object
     * @param int $vendor_id Vendor user ID
     * @return array|WP_Error Prepared arguments
     */
    protected function prepare_vendor_category_args( $request, $vendor_id ) {
        // Start with default Dokan product category arguments
        $args = apply_filters(
            'dokan_product_cat_dropdown_args', [
				'taxonomy'   => 'product_cat',
				'number'     => false,
				'orderby'    => 'name',
				'order'      => 'asc',
				'hide_empty' => false,
			]
        );

        // Override with request parameters if provided
        $args['number'] = $request['per_page'] ?? $args['number'];
        $args['offset'] = $request['offset'] ?? 0;
        $args['order'] = $request['order'] ?? $args['order'];
        $args['orderby'] = $request['orderby'] ?? $args['orderby'];
        $args['hide_empty'] = $request['hide_empty'] === 'true' ?? $args['hide_empty'];

        // Handle search parameter
        if ( ! empty( $request['search'] ) ) {
            $args['search'] = $request['search'];
        }

        // Handle parent parameter
        if ( isset( $request['parent'] ) ) {
            $args['parent'] = $request['parent'];
        }

        // Handle include/exclude parameters
        if ( ! empty( $request['include'] ) ) {
            $args['include'] = array_map( 'absint', explode( ',', $request['include'] ) );
        }

        if ( ! empty( $request['exclude'] ) ) {
            $args['exclude'] = array_map( 'absint', explode( ',', $request['exclude'] ) );
        }

        // Filter categories based on vendor's products if needed
        if ( ! empty( $request['vendor_products_only'] ) && $request['vendor_products_only'] === 'true' ) {
            $vendor_products = get_posts(
                [
					'post_type'      => 'product',
					'author'         => $vendor_id,
					'posts_per_page' => -1,
					'fields'         => 'ids',
				]
            );

            if ( ! empty( $vendor_products ) ) {
                $args['object_ids'] = $vendor_products;
            }
        }

        return apply_filters( 'dokan_rest_vendor_product_categories_args', $args, $request, $vendor_id );
    }

    /**
     * Prepare a single product category for response
     *
     * @param WP_Term $item Term object
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response
     */
    public function prepare_item_for_response( $item, $request ) {
        $response = parent::prepare_item_for_response( $item, $request );
        $data = $response->get_data();

        // Add vendor-specific data
        $vendor_id = get_current_user_id();
        $data['vendor_product_count'] = $this->get_vendor_product_count( $item->term_id, $vendor_id );
        $data['can_use_category'] = $this->can_vendor_use_category( $item->term_id, $vendor_id );
        $data['children_count'] = $this->get_children_count( $item->term_id );

        $response->set_data( $data );
        return $response;
    }

    /**
     * Get product count for specific vendor in a category
     *
     * @param int $term_id Category term ID
     * @param int $vendor_id Vendor user ID
     * @return int
     */
    protected function get_vendor_product_count( $term_id, $vendor_id ) {
        $query = new \WP_Query(
            [
				'post_type'      => 'product',
				'author'         => $vendor_id,
				'tax_query'      => [
					[
						'taxonomy' => 'product_cat',
						'field'    => 'term_id',
						'terms'    => $term_id,
					],
				],
				'posts_per_page' => -1,
			]
        );

        return $query->found_posts;
    }

    /**
     * Get number of child categories
     *
     * @param int $term_id Category term ID
     * @return int
     */
    protected function get_children_count( $term_id ) {
        $children = get_terms(
            [
				'taxonomy'   => 'product_cat',
				'parent'     => $term_id,
				'fields'     => 'count',
				'hide_empty' => false,
			]
        );

        return is_wp_error( $children ) ? 0 : $children;
    }

    /**
     * Check if vendor can use this category
     *
     * @param int $term_id Category term ID
     * @param int $vendor_id Vendor user ID
     * @return bool
     */
    protected function can_vendor_use_category( $term_id, $vendor_id ) {
        // Implement your vendor category permission logic here
        // For example, check if the category is in allowed categories for the vendor
        return apply_filters( 'dokan_vendor_can_use_category', true, $term_id, $vendor_id );
    }

    /**
     * Get collection params
     *
     * @return array
     */
    public function get_collection_params() {
        $params = parent::get_collection_params();

        $params['vendor_products_only'] = [
            'description'       => __( 'Limit categories to those containing vendor products.', 'dokan-lite' ),
            'type'             => 'boolean',
            'default'          => false,
            'sanitize_callback' => 'rest_sanitize_boolean',
        ];

        return $params;
    }

    /**
     * Get the Product Category schema
     *
     * @return array
     */
    public function get_item_schema() {
        $schema = parent::get_item_schema();

        $schema['properties']['vendor_product_count'] = [
            'description' => __( 'Number of products in this category by the vendor.', 'dokan-lite' ),
            'type'        => 'integer',
            'context'     => [ 'view' ],
            'readonly'    => true,
        ];

        $schema['properties']['can_use_category'] = [
            'description' => __( 'Whether the vendor can use this category.', 'dokan-lite' ),
            'type'        => 'boolean',
            'context'     => [ 'view' ],
            'readonly'    => true,
        ];

        $schema['properties']['children_count'] = [
            'description' => __( 'Number of child categories.', 'dokan-lite' ),
            'type'        => 'integer',
            'context'     => [ 'view' ],
            'readonly'    => true,
        ];

        return $schema;
    }
}
