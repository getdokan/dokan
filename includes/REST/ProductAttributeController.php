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

        // REST API for lazily fetching / creating terms of a global attribute.
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/terms',
            array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_attribute_terms' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                    'args'                => array(
                        'id'       => array(
                            'description' => __( 'Attribute ID.', 'dokan-lite' ),
                            'type'        => 'integer',
                            'required'    => true,
                        ),
                        'search'   => array(
                            'description' => __( 'Limit results to terms matching a string.', 'dokan-lite' ),
                            'type'        => 'string',
                        ),
                        'page'     => array(
                            'description' => __( 'Current page of the collection.', 'dokan-lite' ),
                            'type'        => 'integer',
                            'default'     => 1,
                        ),
                        'per_page' => array(
                            'description' => __( 'Maximum number of terms to return in the result set.', 'dokan-lite' ),
                            'type'        => 'integer',
                            'default'     => 20,
                        ),
                    ),
                ),
                array(
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_attribute_term' ),
                    'permission_callback' => array( $this, 'create_attribute_term_permissions_check' ),
                    'args'                => array(
                        'id'   => array(
                            'description' => __( 'Attribute ID.', 'dokan-lite' ),
                            'type'        => 'integer',
                            'required'    => true,
                        ),
                        'name' => array(
                            'description'       => __( 'Term name.', 'dokan-lite' ),
                            'type'              => 'string',
                            'required'          => true,
                            'sanitize_callback' => 'sanitize_text_field',
                        ),
                    ),
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
     * Check if a given request has access to create a new attribute term.
     *
     * Creating terms is only allowed when vendors are permitted to add new
     * attributes from the selling options.
     *
     * @since 5.0.5
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return bool|WP_Error
     */
    public function create_attribute_term_permissions_check( $request ) {
        if ( 'on' !== dokan_get_option( 'add_new_attribute', 'dokan_selling', 'off' ) ) {
            return new WP_Error(
                'dokan_rest_cannot_create',
                __( 'Sorry, you are not allowed to create new attribute terms.', 'dokan-lite' ),
                array( 'status' => rest_authorization_required_code() )
            );
        }

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

        return rest_ensure_response( $product_attribute->get( $product_id ) );
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

    /**
     * Resolve a global attribute taxonomy from its attribute ID.
     *
     * @since 5.0.5
     *
     * @param int $attribute_id Global attribute ID.
     *
     * @return string|WP_Error Taxonomy name, or error if the attribute is invalid.
     */
    protected function get_attribute_taxonomy_by_id( $attribute_id ) {
        $taxonomy = wc_attribute_taxonomy_name_by_id( absint( $attribute_id ) );

        if ( empty( $taxonomy ) || ! taxonomy_exists( $taxonomy ) ) {
            return new WP_Error( 'dokan_rest_attribute_invalid', __( 'Invalid attribute.', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return $taxonomy;
    }

    /**
     * Format a term for the product editor response.
     *
     * @since 5.0.5
     *
     * @param \WP_Term $term Term object.
     *
     * @return array
     */
    protected function prepare_attribute_term( $term ) {
        return [
            'id'    => $term->term_id,
            'name'  => $term->name,
            'value' => $term->term_id,
            'label' => $term->name,
        ];
    }

    /**
     * Get terms of a global product attribute (searchable + paginated).
     *
     * Terms are loaded lazily by the product editor instead of being embedded
     * into the form schema, so stores with very large attribute taxonomies do
     * not exhaust memory while building the editor payload.
     *
     * @since 5.0.5
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     */
    public function get_attribute_terms( $request ) {
        $taxonomy = $this->get_attribute_taxonomy_by_id( $request['id'] );

        if ( is_wp_error( $taxonomy ) ) {
            return $taxonomy;
        }

        $per_page = absint( $request['per_page'] );
        $per_page = $per_page > 0 ? $per_page : 20;
        $page     = max( 1, absint( $request['page'] ) );
        $search   = isset( $request['search'] ) ? sanitize_text_field( wp_unslash( $request['search'] ) ) : '';

        $args = [
            'taxonomy'   => $taxonomy,
            'hide_empty' => false,
            'number'     => $per_page,
            'offset'     => ( $page - 1 ) * $per_page,
            'orderby'    => 'name',
            'order'      => 'ASC',
        ];

        if ( '' !== $search ) {
            $args['search'] = $search;
        }

        $terms = get_terms( $args );

        if ( is_wp_error( $terms ) ) {
            return rest_ensure_response( [] );
        }

        return rest_ensure_response( array_map( [ $this, 'prepare_attribute_term' ], $terms ) );
    }

    /**
     * Create a new term for a global product attribute.
     *
     * @since 5.0.5
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_Error|WP_REST_Response
     */
    public function create_attribute_term( $request ) {
        $taxonomy = $this->get_attribute_taxonomy_by_id( $request['id'] );

        if ( is_wp_error( $taxonomy ) ) {
            return $taxonomy;
        }

        $name = sanitize_text_field( wp_unslash( $request['name'] ) );

        if ( '' === $name ) {
            return new WP_Error( 'dokan_rest_term_name_required', __( 'Term name is required.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        // Return the existing term instead of erroring when the term already exists.
        $existing = get_term_by( 'name', $name, $taxonomy );
        if ( $existing && ! is_wp_error( $existing ) ) {
            return rest_ensure_response( $this->prepare_attribute_term( $existing ) );
        }

        $inserted = wp_insert_term( $name, $taxonomy );

        if ( is_wp_error( $inserted ) ) {
            return new WP_Error( 'dokan_rest_cannot_create_term', $inserted->get_error_message(), [ 'status' => 400 ] );
        }

        $term = get_term( $inserted['term_id'], $taxonomy );

        if ( ! $term || is_wp_error( $term ) ) {
            return new WP_Error( 'dokan_rest_cannot_create_term', __( 'Failed to create attribute term.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        return rest_ensure_response( $this->prepare_attribute_term( $term ) );
    }
}
