<?php

namespace WeDevs\Dokan\REST;

use WC_Data;
use WC_Product;
use WC_Product_Variation;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WC_Product_Simple;
use WC_REST_Exception;
use WC_Product_Factory;
use WC_Product_Download;
use WeDevs\Dokan\ProductCategory\Categories;
use WeDevs\Dokan\Abstracts\DokanRESTController;
use WeDevs\Dokan\Product\ProductAttribute;

/**
 * Store API Controller
 *
 * @package dokan
 *
 * @author weDevs <info@wedevs.com>
 */
class ProductController extends DokanRESTController {

    /**
     * Endpoint namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route name
     *
     * @var string
     */
    protected $base = 'products';

    /**
     * Post type
     *
     * @var string
     */
    protected $post_type = 'product';

    /**
     * Post status
     */
    protected $post_status = [ 'publish', 'pending', 'draft' ];

    /**
     * Register all routes related with stores
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->base, [
                'args'   => [
                    'id' => [
                        'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_items' ],
                    'args'                => $this->get_collection_params(),
                    'permission_callback' => [ $this, 'get_product_permissions_check' ],
                ],
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'create_item' ],
                    'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
                    'permission_callback' => [ $this, 'create_product_permissions_check' ],
                ],
                'schema' => [ $this, 'get_public_item_schema' ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/', [
                'args' => [
                    'id' => [
                        'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_item' ],
                    'args'                => $this->get_collection_params(),
                    'permission_callback' => [ $this, 'get_single_product_permissions_check' ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_item' ],
                    'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
                    'permission_callback' => [ $this, 'update_product_permissions_check' ],
                ],
                [
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => [ $this, 'delete_item' ],
                    'permission_callback' => [ $this, 'delete_product_permissions_check' ],
                    'args'                => [
                        'force' => [
                            'type'        => 'boolean',
                            'default'     => false,
                            'description' => __( 'Whether to bypass trash and force deletion.', 'dokan-lite' ),
                        ],
                    ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/summary', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_product_summary' ],
                    'permission_callback' => [ $this, 'get_product_summary_permissions_check' ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/related', [
                'args' => [
                    'id'       => [
                        'description' => __( 'Unique identifier for the object.', 'dokan-lite' ),
                        'type'        => 'integer',
                        'required'    => true,
                    ],
                    'per_page' => [
                        'description' => __( 'Number of product you want to get top rated product', 'dokan-lite' ),
                        'type'        => 'integer',
                        'default'     => 10,
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_related_product' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/top_rated', [
                'args' => [
                    'per_page'  => [
                        'description' => __( 'Number of product you want to get top rated product', 'dokan-lite' ),
                        'type'        => 'integer',
                        'default'     => 8,
                    ],
                    'page'      => [
                        'description' => __( 'Number of page number', 'dokan-lite' ),
                        'type'        => 'integer',
                        'default'     => 1,
                    ],
                    'seller_id' => [
                        'description' => __( 'Top rated product for specific vendor', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_top_rated_product' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/best_selling', [
                'args' => [
                    'per_page'  => [
                        'description' => __( 'Number of product you want to get top rated product', 'dokan-lite' ),
                        'type'        => 'integer',
                        'default'     => 8,
                    ],
                    'page'      => [
                        'description' => __( 'Number of page number', 'dokan-lite' ),
                        'type'        => 'integer',
                        'default'     => 1,
                    ],
                    'seller_id' => [
                        'description' => __( 'Top rated product for specific vendor', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_best_selling_product' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/featured', [
                'args' => [
                    'per_page'  => [
                        'description' => __( 'Number of product you want to get top rated product', 'dokan-lite' ),
                        'type'        => 'integer',
                        'default'     => 8,
                    ],
                    'page'      => [
                        'description' => __( 'Number of page number', 'dokan-lite' ),
                        'type'        => 'integer',
                        'default'     => 1,
                    ],
                    'seller_id' => [
                        'description' => __( 'Top rated product for specific vendor', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_featured_product' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/latest', [
                'args' => [
                    'per_page'  => [
                        'description' => __( 'Number of product you want to get top rated product', 'dokan-lite' ),
                        'type'        => 'integer',
                        'default'     => 8,
                    ],
                    'page'      => [
                        'description' => __( 'Number of page number', 'dokan-lite' ),
                        'type'        => 'integer',
                        'default'     => 1,
                    ],
                    'seller_id' => [
                        'description' => __( 'Top rated product for specific vendor', 'dokan-lite' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_latest_product' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/multistep-categories', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_multistep_categories' ],
                    'permission_callback' => [ $this, 'get_product_permissions_check' ],
                ],
            ]
        );
    }

    /**
     * Get product object
     *
     * @since 2.8.0
     *
     * @return WC_Product|null|false
     */
    public function get_object( $id ) {
        return wc_get_product( $id );
    }

    /**
     * Validation_before_create_product
     *
     * @param $request
     *
     * @since 1.0.0
     *
     * @return bool|WP_Error
     */
    public function validation_before_create_item( $request ) {
        $store_id = dokan_get_current_user_id();

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_store_found', __( 'No seller found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        if ( ! dokan_is_seller_enabled( $store_id ) ) {
            return new WP_Error( 'invalid_request', __( 'Error! Your account is not enabled for selling, please contact the admin', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        if ( ! empty( $request['id'] ) ) {
            // translators: 1) %s: post type name
            return new WP_Error( "woocommerce_rest_{$this->post_type}_exists", sprintf( __( 'Cannot create existing %s.', 'dokan-lite' ), 'product' ), [ 'status' => 400 ] );
        }

        if ( empty( $request['name'] ) ) {
            return new WP_Error( 'dokan_product_no_title_found', sprintf( __( 'Product title must be required', 'dokan-lite' ), 'product' ), [ 'status' => 404 ] );
        }

        $category_selection = dokan_get_option( 'product_category_style', 'dokan_selling', 'single' );

        if ( empty( $request['categories'] ) ) {
            return new WP_Error( 'dokan_product_category', __( 'Category must be required', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        if ( 'single' === $category_selection ) {
            if ( count( $request['categories'] ) > 1 ) {
                return new WP_Error( 'dokan_product_category_no_more_one', __( 'You can not select more than category', 'dokan-lite' ), [ 'status' => 404 ] );
            }
        }

        return true;
    }

    /**
     * Validation before update product
     *
     * @param $request
     *
     * @since 2.8.0
     *
     * @return bool|WP_Error
     */
    public function validation_before_update_item( $request ) {
        $store_id = dokan_get_current_user_id();

        if ( empty( $store_id ) ) {
            return new WP_Error( 'no_store_found', __( 'No seller found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $object = $this->get_object( (int) $request['id'] );

        if ( ! $object || 0 === $object->get_id() ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_invalid_id", __( 'Invalid ID.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        $product_author = (int) get_post_field( 'post_author', $object->get_id() );

        if ( $store_id !== $product_author ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_invalid_id", __( 'Sorry, you have no permission to do this. Since it\'s not your product.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        return true;
    }

    /**
     * Validation_before_delete_item
     *
     * @since 2.8.0
     *
     * @return WP_Error|Boolean
     */
    public function validation_before_delete_item( $request ) {
        $store_id = dokan_get_current_user_id();
        $object   = $this->get_object( (int) $request['id'] );
        $result   = false;

        if ( ! $object || 0 === $object->get_id() ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_invalid_id", __( 'Invalid ID.', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $product_author = (int) get_post_field( 'post_author', $object->get_id() );

        if ( $store_id !== $product_author ) {
            return new WP_Error( "dokan_rest_{$this->post_type}_invalid_id", __( 'Sorry, you have no permission to do this. Since it\'s not your product.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        return true;
    }

    /**
     * Get product permissions check
     *
     * @since 2.8.0
     *
     * @return bool
     */
    public function get_product_permissions_check() {
        return current_user_can( 'dokan_view_product_menu' );
    }

    /**
     * Create_product_permissions_check
     *
     * @since 2.8.0
     *
     * @return bool
     */
    public function create_product_permissions_check() {
        return current_user_can( 'dokan_add_product' );
    }

    /**
     * Get_single_product_permissions_check
     *
     * @since 2.8.0
     *
     * @return bool
     */
    public function get_single_product_permissions_check() {
        return current_user_can( 'dokandar' );
    }

    /**
     * Update_product_permissions_check
     *
     * @since 2.8.0
     *
     * @return bool
     */
    public function update_product_permissions_check() {
        return current_user_can( 'dokan_edit_product' );
    }

    /**
     * Delete product permission checking
     *
     * @since 2.8.0
     *
     * @return bool
     */
    public function delete_product_permissions_check() {
        return current_user_can( 'dokan_delete_product' );
    }

    /**
     * Get product summary report
     *
     * @since 2.8.0
     *
     * @return bool
     */
    public function get_product_summary_permissions_check() {
        return current_user_can( 'dokan_view_product_status_report' );
    }

    /**
     * Get product summary report in dashboard
     *
     * @since 2.8.0
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_product_summary( $request ) {
        $seller_id = dokan_get_current_user_id();

        $data = [
            'post_counts'  => dokan_count_posts( 'product', $seller_id ),
            'products_url' => dokan_get_navigation_url( 'products' ),
        ];

        return rest_ensure_response( $data );
    }

    /**
     * Get related product
     *
     * @since 2.9.1
     *
     * @param WP_REST_Request $request
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_related_product( $request ) {
        $related_ids = wc_get_related_products( $request['id'], $request['per_page'] );
        $response    = [];

        if ( ! empty( $related_ids ) ) {
            $objects = array_map( [ $this, 'get_object' ], $related_ids );

            foreach ( $objects as $object ) {
                $data           = $this->prepare_data_for_response( $object, $request );
                $data_objects[] = $this->prepare_response_for_collection( $data );
            }

            $response = rest_ensure_response( $data_objects );
        }

        return $response;
    }

    /**
     * Top rated product
     *
     * @since 2.9.1
     *
     * @return array|object|WP_Error|WP_REST_Response
     */
    public function get_top_rated_product( $request ) {
        $result   = dokan_get_top_rated_products( $request['per_page'], $request['seller_id'], $request['page'] );
        $data     = [];
        $response = [];

        if ( $result->posts ) {
            $objects = array_map( [ $this, 'get_object' ], $result->posts );

            foreach ( $objects as $object ) {
                $data           = $this->prepare_data_for_response( $object, $request );
                $data_objects[] = $this->prepare_response_for_collection( $data );
            }

            $response = rest_ensure_response( $data_objects );
            $response = $this->format_collection_response( $response, $request, $result->found_posts );
        }

        return $response;
    }

    /**
     * Best selling product
     *
     * @since 2.9.1
     *
     * @return WP_REST_Response|array|WP_Error
     */
    public function get_best_selling_product( $request ) {
        $result   = dokan_get_best_selling_products( $request['per_page'], $request['seller_id'], $request['page'] );
        $data     = [];
        $response = [];

        if ( $result->posts ) {
            $objects = array_map( [ $this, 'get_object' ], $result->posts );

            foreach ( $objects as $object ) {
                $data           = $this->prepare_data_for_response( $object, $request );
                $data_objects[] = $this->prepare_response_for_collection( $data );
            }

            $response = rest_ensure_response( $data_objects );
            $response = $this->format_collection_response( $response, $request, $result->found_posts );
        }

        return $response;
    }

    /**
     * Featured product
     *
     * @since 2.9.1
     *
     * @return WP_REST_Response|array|WP_Error
     */
    public function get_featured_product( $request ) {
        $result   = dokan_get_featured_products( $request['per_page'], $request['seller_id'], $request['page'] );
        $data     = [];
        $response = [];

        if ( $result->posts ) {
            $objects = array_map( [ $this, 'get_object' ], $result->posts );

            foreach ( $objects as $object ) {
                $data           = $this->prepare_data_for_response( $object, $request );
                $data_objects[] = $this->prepare_response_for_collection( $data );
            }

            $response = rest_ensure_response( $data_objects );
            $response = $this->format_collection_response( $response, $request, $result->found_posts );
        }

        return $response;
    }

    /**
     * Latest product
     *
     * @since 2.9.1
     *
     * @return WP_REST_Response|array|WP_Error
     */
    public function get_latest_product( $request ) {
        $result   = dokan_get_latest_products( $request['per_page'], $request['seller_id'], $request['page'] );
        $data     = [];
        $response = [];

        if ( $result->posts ) {
            $objects = array_map( [ $this, 'get_object' ], $result->posts );

            foreach ( $objects as $object ) {
                $data           = $this->prepare_data_for_response( $object, $request );
                $data_objects[] = $this->prepare_response_for_collection( $data );
            }

            $response = rest_ensure_response( $data_objects );
            $response = $this->format_collection_response( $response, $request, $result->found_posts );
        }

        return $response;
    }

    /**
     * Prepare objects query
     *
     * @param WP_REST_Request|array $request
     *
     * @return array
     */
    protected function prepare_objects_query( $request ) {
        $args = parent::prepare_objects_query( $request );

        // Set post_status.
        $args['post_status'] = ! empty( $request['status'] ) ? $request['status'] : $this->post_status;

        // Taxonomy query to filter products by type, category,
        // tag, shipping class, and attribute.
        $tax_query = [];

        // Map between taxonomy name and arg's key.
        $taxonomies = [
            'product_cat'            => 'category',
            'product_tag'            => 'tag',
            'product_shipping_class' => 'shipping_class',
        ];

        // Set tax_query for each passed arg.
        foreach ( $taxonomies as $taxonomy => $key ) {
            if ( ! empty( $request[ $key ] ) ) {
                $tax_query[] = [
                    'taxonomy' => $taxonomy,
                    'field'    => 'term_id',
                    'terms'    => $request[ $key ],
                ];
            }
        }

        // Filter product type by slug.
        if ( ! empty( $request['type'] ) ) {
            $tax_query[] = [
                'taxonomy' => 'product_type',
                'field'    => 'slug',
                'terms'    => $request['type'],
            ];
        }

        // Filter by attribute and term.
        if ( ! empty( $request['attribute'] ) && ! empty( $request['attribute_term'] ) ) {
            if ( in_array( $request['attribute'], wc_get_attribute_taxonomy_names(), true ) ) {
                $tax_query[] = [
                    'taxonomy' => $request['attribute'],
                    'field'    => 'term_id',
                    'terms'    => $request['attribute_term'],
                ];
            }
        }

        if ( ! empty( $tax_query ) ) {
            $args['tax_query'] = $tax_query; //phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
        }

        // Filter featured.
        if ( rest_is_boolean( $request['featured'] ) && wc_string_to_bool( $request['featured'] ) ) {
            $args['tax_query'][] = [
                'taxonomy' => 'product_visibility',
                'field'    => 'name',
                'terms'    => 'featured',
            ];
        }

        // Filter by sku.
        if ( ! empty( $request['sku'] ) ) {
            $skus = explode( ',', $request['sku'] );
            // Include the current string as a SKU too.
            if ( 1 < count( $skus ) ) {
                $skus[] = $request['sku'];
            }

            $args['meta_query'] = $this->add_meta_query( //phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                $args, [
                    'key'     => '_sku',
                    'value'   => $skus,
                    'compare' => 'IN',
                ]
            );
        }

        // Filter by tax class.
        if ( ! empty( $request['tax_class'] ) ) {
            $args['meta_query'] = $this->add_meta_query( //phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                $args, [
                    'key'   => '_tax_class',
                    'value' => 'standard' !== $request['tax_class'] ? $request['tax_class'] : '',
                ]
            );
        }

        // Price filter.
        if ( ! empty( $request['min_price'] ) || ! empty( $request['max_price'] ) ) {
            $args['meta_query'] = $this->add_meta_query( $args, wc_get_min_max_price_meta_query( $request ) );  //phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
        }

        // Filter product in stock or out of stock.
        if ( rest_is_boolean( $request['in_stock'] ) ) {
            $args['meta_query'] = $this->add_meta_query( //phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                $args, [
                    'key'   => '_stock_status',
                    'value' => wc_string_to_bool( $request['in_stock'] ) ? 'instock' : 'outofstock',
                ]
            );
        }

        // Filter by on sale products.
        if ( rest_is_boolean( $request['on_sale'] ) ) {
            $on_sale_key = wc_string_to_bool( $request['on_sale'] ) ? 'post__in' : 'post__not_in';
            $on_sale_ids = wc_get_product_ids_on_sale();

            // Use 0 when there's no on sale products to avoid return all products.
            $on_sale_ids = empty( $on_sale_ids ) ? [ 0 ] : $on_sale_ids;

            $args[ $on_sale_key ] = ! empty( $args[ $on_sale_key ] ) && is_array( $args[ $on_sale_key ] ) ? array_merge( $args[ $on_sale_key ], $on_sale_ids ) : $on_sale_ids;
        }

        // Force the post_type argument, since it's not a user input variable.
        if ( ! empty( $request['sku'] ) ) {
            $args['post_type'] = [ 'product', 'product_variation' ];
        } else {
            $args['post_type'] = $this->post_type;
        }

        return $args;
    }

    /**
     * Get product data.
     *
     * @param WC_Product $product Product instance.
     * @param WP_REST_Request $request Request context.
     *                            Options: 'view' and 'edit'.
     *
     * @return WP_REST_Response|array|WP_Error
     */
    protected function prepare_data_for_response( $product, $request ) {
        $context   = ! empty( $request['context'] ) ? $request['context'] : 'view';
        $author_id = get_post_field( 'post_author', $product->get_id() );
        $store     = dokan()->vendor->get( $author_id );
        $data      = [
            'id'                    => $product->get_id(),
            'name'                  => $product->get_name( $context ),
            'slug'                  => $product->get_slug( $context ),
            'post_author'           => $author_id,
            'permalink'             => $product->get_permalink(),
            'date_created'          => wc_rest_prepare_date_response( $product->get_date_created( $context ), false ),
            'date_created_gmt'      => wc_rest_prepare_date_response( $product->get_date_created( $context ) ),
            'date_modified'         => wc_rest_prepare_date_response( $product->get_date_modified( $context ), false ),
            'date_modified_gmt'     => wc_rest_prepare_date_response( $product->get_date_modified( $context ) ),
            'type'                  => $product->get_type(),
            'status'                => $product->get_status( $context ),
            'featured'              => $product->is_featured(),
            'catalog_visibility'    => $product->get_catalog_visibility( $context ),
            'description'           => 'view' === $context ? wpautop( do_shortcode( $product->get_description() ) ) : $product->get_description( $context ),
            'short_description'     => 'view' === $context ? apply_filters( 'woocommerce_short_description', $product->get_short_description() ) : $product->get_short_description( $context ),
            'sku'                   => $product->get_sku( $context ),
            'price'                 => $product->get_price( $context ),
            'regular_price'         => $product->get_regular_price( $context ),
            'sale_price'            => $product->get_sale_price( $context ) ? $product->get_sale_price( $context ) : '',
            'date_on_sale_from'     => wc_rest_prepare_date_response( $product->get_date_on_sale_from( $context ), false ),
            'date_on_sale_from_gmt' => wc_rest_prepare_date_response( $product->get_date_on_sale_from( $context ) ),
            'date_on_sale_to'       => wc_rest_prepare_date_response( $product->get_date_on_sale_to( $context ), false ),
            'date_on_sale_to_gmt'   => wc_rest_prepare_date_response( $product->get_date_on_sale_to( $context ) ),
            'price_html'            => $product->get_price_html(),
            'on_sale'               => $product->is_on_sale( $context ),
            'purchasable'           => $product->is_purchasable(),
            'total_sales'           => $product->get_total_sales( $context ),
            'virtual'               => $product->is_virtual(),
            'downloadable'          => $product->is_downloadable(),
            'downloads'             => $this->get_downloads( $product ),
            'download_limit'        => $product->get_download_limit( $context ),
            'download_expiry'       => $product->get_download_expiry( $context ),
            'external_url'          => $product->is_type( 'external' ) ? $product->get_product_url( $context ) : '',
            'button_text'           => $product->is_type( 'external' ) ? $product->get_button_text( $context ) : '',
            'tax_status'            => $product->get_tax_status( $context ),
            'tax_class'             => $product->get_tax_class( $context ),
            'manage_stock'          => $product->managing_stock(),
            'stock_quantity'        => $product->get_stock_quantity( $context ),
            'low_stock_amount'      => version_compare( WC_VERSION, '3.4.7', '>' ) ? $product->get_low_stock_amount( $context ) : '',
            'in_stock'              => $product->is_in_stock(),
            'backorders'            => $product->get_backorders( $context ),
            'backorders_allowed'    => $product->backorders_allowed(),
            'backordered'           => $product->is_on_backorder(),
            'sold_individually'     => $product->is_sold_individually(),
            'weight'                => $product->get_weight( $context ),
            'dimensions'            => [
                'length' => $product->get_length( $context ),
                'width'  => $product->get_width( $context ),
                'height' => $product->get_height( $context ),
            ],
            'shipping_required'     => $product->needs_shipping(),
            'shipping_taxable'      => $product->is_shipping_taxable(),
            'shipping_class'        => $product->get_shipping_class(),
            'shipping_class_id'     => $product->get_shipping_class_id( $context ),
            'reviews_allowed'       => $product->get_reviews_allowed( $context ),
            'average_rating'        => 'view' === $context ? wc_format_decimal( $product->get_average_rating(), 2 ) : $product->get_average_rating( $context ),
            'rating_count'          => $product->get_rating_count(),
            'related_ids'           => array_map( 'absint', array_values( wc_get_related_products( $product->get_id() ) ) ),
            'upsell_ids'            => array_map( 'absint', $product->get_upsell_ids( $context ) ),
            'cross_sell_ids'        => array_map( 'absint', $product->get_cross_sell_ids( $context ) ),
            'parent_id'             => $product->get_parent_id( $context ),
            'purchase_note'         => 'view' === $context ? wpautop( do_shortcode( wp_kses_post( $product->get_purchase_note() ) ) ) : $product->get_purchase_note( $context ),
            'categories'            => $this->get_taxonomy_terms( $product ),
            'tags'                  => $this->get_taxonomy_terms( $product, 'tag' ),
            'images'                => $this->get_images( $product ),
            'attributes'            => $this->get_attributes( $product ),
            'default_attributes'    => $this->get_default_attributes( $product ),
            'variations'            => $product->is_type( 'variable' ) ? $product->get_children() : [],
            'grouped_products'      => $product->is_type( 'grouped' ) ? $product->get_children() : [],
            'menu_order'            => $product->get_menu_order( $context ),
            'meta_data'             => $product->get_meta_data(),
            'store'                 => [
                'id'      => $store->get_id(),
                'name'    => $store->get_shop_name(),
                'url'     => $store->get_shop_url(),
                'avatar'  => $store->get_avatar(),
                'address' => $store->get_address(),
            ],
            'row_actions'           => dokan_product_get_row_action( $product->get_id(), false ),
        ];

        $response = rest_ensure_response( $data );
        $response->add_links( $this->prepare_links( $product, $request ) );

        return apply_filters( "dokan_rest_prepare_{$this->post_type}_object", $response, $product, $request );
    }

    /**
     * Prepare object for database mapping
     *
     * @param object $request
     * @param boolean $creating
     *
     * @return object
     * @throws WC_REST_Exception
     * @throws \WC_Data_Exception
     */
    protected function prepare_object_for_database( $request, $creating = false ) {
        $id = isset( $request['id'] ) ? absint( $request['id'] ) : 0;

        // Type is the most important part here because we need to be using the correct class and methods.
        if ( isset( $request['type'] ) ) {
            $classname = WC_Product_Factory::get_classname_from_product_type( $request['type'] );

            if ( ! class_exists( $classname ) ) {
                $classname = 'WC_Product_Simple';
            }

            $product = new $classname( $id );
        } elseif ( isset( $request['id'] ) ) {
            $product = wc_get_product( $id );
        } else {
            $product = new WC_Product_Simple();
        }

        if ( 'variation' === $product->get_type() ) {
            return new WP_Error(
                "dokan_rest_invalid_{$this->post_type}_id", __( 'To manipulate product variations you should use the /products/&lt;product_id&gt;/variations/&lt;id&gt; endpoint.', 'dokan-lite' ), [
                    'status' => 404,
                ]
            );
        }

        // Post title.
        if ( isset( $request['name'] ) ) {
            $product->set_name( wp_filter_post_kses( $request['name'] ) );
        }

        // Post content.
        if ( isset( $request['description'] ) ) {
            $product->set_description( wp_filter_post_kses( $request['description'] ) );
        }

        // Post excerpt.
        if ( isset( $request['short_description'] ) ) {
            $product->set_short_description( wp_filter_post_kses( $request['short_description'] ) );
        }

        // Post status.
        if ( dokan_is_seller_trusted( get_current_user_id() ) ) {
            if ( isset( $request['status'] ) ) {
                $product->set_status( get_post_status_object( $request['status'] ) ? $request['status'] : 'draft' );
            }
        } else {
            $status = dokan_get_option( 'product_status', 'dokan_selling', 'pending' );
            $product->set_status( get_post_status_object( $status ) ? $status : 'draft' );
        }

        // Post slug.
        if ( isset( $request['slug'] ) ) {
            $product->set_slug( $request['slug'] );
        }

        // Menu order.
        if ( isset( $request['menu_order'] ) ) {
            $product->set_menu_order( $request['menu_order'] );
        }

        // Comment status.
        if ( isset( $request['reviews_allowed'] ) ) {
            $product->set_reviews_allowed( $request['reviews_allowed'] );
        }

        // Virtual.
        if ( isset( $request['virtual'] ) ) {
            $product->set_virtual( $request['virtual'] );
        }

        // Tax status.
        if ( isset( $request['tax_status'] ) ) {
            $product->set_tax_status( $request['tax_status'] );
        }

        // Tax Class.
        if ( isset( $request['tax_class'] ) ) {
            $product->set_tax_class( $request['tax_class'] );
        }

        // Catalog Visibility.
        if ( isset( $request['catalog_visibility'] ) ) {
            $product->set_catalog_visibility( $request['catalog_visibility'] );
        }

        // Purchase Note.
        if ( isset( $request['purchase_note'] ) ) {
            $product->set_purchase_note( wc_clean( $request['purchase_note'] ) );
        }

        // Featured Product.
        if ( isset( $request['featured'] ) ) {
            $product->set_featured( $request['featured'] );
        }

        // Shipping data.
        $product = $this->save_product_shipping_data( $product, $request );

        // SKU.
        if ( isset( $request['sku'] ) ) {
            $product->set_sku( wc_clean( $request['sku'] ) );
        }

        // Attributes.
        if ( isset( $request['attributes'] ) ) {
            $product_attribute = new ProductAttribute( $request['attributes'] );
            $product_attribute->set( $product );
        }

        // Sales and prices.
        if ( in_array( $product->get_type(), [ 'variable', 'grouped' ], true ) ) {
            $product->set_regular_price( '' );
            $product->set_sale_price( '' );
            $product->set_date_on_sale_to( '' );
            $product->set_date_on_sale_from( '' );
            $product->set_price( '' );
        } else {
            // Regular Price.
            if ( isset( $request['regular_price'] ) ) {
                $product->set_regular_price( $request['regular_price'] );
            }

            // Sale Price.
            if ( isset( $request['sale_price'] ) ) {
                $product->set_sale_price( $request['sale_price'] );
            }

            if ( isset( $request['date_on_sale_from'] ) ) {
                $product->set_date_on_sale_from( $request['date_on_sale_from'] );
            }

            if ( isset( $request['date_on_sale_from_gmt'] ) ) {
                $product->set_date_on_sale_from( $request['date_on_sale_from_gmt'] ? strtotime( $request['date_on_sale_from_gmt'] ) : null );
            }

            if ( isset( $request['date_on_sale_to'] ) ) {
                $product->set_date_on_sale_to( $request['date_on_sale_to'] );
            }

            if ( isset( $request['date_on_sale_to_gmt'] ) ) {
                $product->set_date_on_sale_to( $request['date_on_sale_to_gmt'] ? strtotime( $request['date_on_sale_to_gmt'] ) : null );
            }
        }

        // Product parent ID for groups.
        if ( isset( $request['parent_id'] ) ) {
            $product->set_parent_id( $request['parent_id'] );
        }

        // Sold individually.
        if ( isset( $request['sold_individually'] ) ) {
            $product->set_sold_individually( $request['sold_individually'] );
        }

        // Stock status.
        if ( isset( $request['in_stock'] ) ) {
            $stock_status = true === $request['in_stock'] ? 'instock' : 'outofstock';
        } else {
            $stock_status = $product->get_stock_status();
        }

        // Stock data.
        if ( 'yes' === get_option( 'woocommerce_manage_stock' ) ) {
            // Manage stock.
            if ( isset( $request['manage_stock'] ) ) {
                $product->set_manage_stock( $request['manage_stock'] );
            }

            // Backorders.
            if ( isset( $request['backorders'] ) ) {
                $product->set_backorders( $request['backorders'] );
            }

            if ( $product->is_type( 'grouped' ) ) {
                $product->set_manage_stock( 'no' );
                $product->set_backorders( 'no' );
                $product->set_stock_quantity( '' );
                $product->set_stock_status( $stock_status );
                $product->set_low_stock_amount( '' );
            } elseif ( $product->is_type( 'external' ) ) {
                $product->set_manage_stock( 'no' );
                $product->set_backorders( 'no' );
                $product->set_stock_quantity( '' );
                $product->set_stock_status( 'instock' );
                $product->set_low_stock_amount( '' );
            } elseif ( $product->get_manage_stock() ) {
                // Stock status is always determined by children so sync later.
                if ( ! $product->is_type( 'variable' ) ) {
                    $product->set_stock_status( $stock_status );
                }

                // Stock quantity.
                if ( isset( $request['stock_quantity'] ) ) {
                    $product->set_stock_quantity( wc_stock_amount( $request['stock_quantity'] ) );
                } elseif ( isset( $request['inventory_delta'] ) ) {
                    $stock_quantity = wc_stock_amount( $product->get_stock_quantity() );
                    $stock_quantity += wc_stock_amount( $request['inventory_delta'] );
                    $product->set_stock_quantity( wc_stock_amount( $stock_quantity ) );
                }

                if ( isset( $request['low_stock_amount'] ) ) {
                    $product->set_low_stock_amount( wc_stock_amount( $request['low_stock_amount'] ) );
                }
            } else {
                // Don't manage stock.
                $product->set_manage_stock( 'no' );
                $product->set_stock_quantity( '' );
                $product->set_stock_status( $stock_status );
            }
        } elseif ( ! $product->is_type( 'variable' ) ) {
            $product->set_stock_status( $stock_status );
        }

        // Upsells.
        if ( isset( $request['upsell_ids'] ) ) {
            $upsells = [];
            $ids     = $request['upsell_ids'];

            if ( ! empty( $ids ) ) {
                foreach ( $ids as $id ) {
                    if ( $id && $id > 0 ) {
                        $upsells[] = $id;
                    }
                }
            }

            $product->set_upsell_ids( $upsells );
        }

        // Cross sells.
        if ( isset( $request['cross_sell_ids'] ) ) {
            $crosssells = [];
            $ids        = $request['cross_sell_ids'];

            if ( ! empty( $ids ) ) {
                foreach ( $ids as $id ) {
                    if ( $id && $id > 0 ) {
                        $crosssells[] = $id;
                    }
                }
            }

            $product->set_cross_sell_ids( $crosssells );
        }

        // Product categories.
        if ( isset( $request['categories'] ) && is_array( $request['categories'] ) ) {
            $product = $this->save_taxonomy_terms( $product, $request['categories'] );
        }

        // Product tags.
        if ( isset( $request['tags'] ) && is_array( $request['tags'] ) ) {
            $product = $this->save_taxonomy_terms( $product, $request['tags'], 'tag' );
        }

        // Downloadable.
        if ( isset( $request['downloadable'] ) ) {
            $product->set_downloadable( $request['downloadable'] );
        }

        // Downloadable options.
        if ( $product->get_downloadable() ) {

            // Downloadable files.
            if ( isset( $request['downloads'] ) && is_array( $request['downloads'] ) ) {
                $product = $this->save_downloadable_files( $product, $request['downloads'] );
            }

            // Download limit.
            if ( isset( $request['download_limit'] ) ) {
                $product->set_download_limit( $request['download_limit'] );
            }

            // Download expiry.
            if ( isset( $request['download_expiry'] ) ) {
                $product->set_download_expiry( $request['download_expiry'] );
            }
        }

        // Product url and button text for external products.
        if ( $product->is_type( 'external' ) ) {
            if ( isset( $request['external_url'] ) ) {
                $product->set_product_url( $request['external_url'] );
            }

            if ( isset( $request['button_text'] ) ) {
                $product->set_button_text( $request['button_text'] );
            }
        }

        // Save default attributes for variable products.
        if ( $product->is_type( 'variable' ) ) {
            $product = $this->save_default_attributes( $product, $request );
        }

        // Set children for a grouped product.
        if ( $product->is_type( 'grouped' ) && isset( $request['grouped_products'] ) ) {
            $product->set_children( $request['grouped_products'] );
        }

        // Check for featured/gallery images, upload it and set it.
        if ( isset( $request['images'] ) ) {
            $product = $this->set_product_images( $product, $request['images'] );
        }

        // Allow set meta_data.
        if ( is_array( $request['meta_data'] ) ) {
            foreach ( $request['meta_data'] as $meta ) {
                $product->update_meta_data( $meta['key'], $meta['value'], isset( $meta['id'] ) ? $meta['id'] : '' );
            }
        }

        /**
         * Filters an object before it is inserted via the REST API.
         *
         * The dynamic portion of the hook name, `$this->post_type`,
         * refers to the object type slug.
         *
         * @param WC_Data $product Object object.
         * @param WP_REST_Request $request Request object.
         * @param bool $creating If is creating a new object.
         */
        return apply_filters( "woocommerce_rest_pre_insert_{$this->post_type}_object", $product, $request, $creating );
    }

    /**
     * Prepare links for the request.
     *
     * @param WC_Data $object Object data.
     * @param WP_REST_Request $request Request object.
     *
     * @return array                   Links for the given post.
     */
    protected function prepare_links( $object, $request ) {
        $links = [
            'self'       => [
                'href' => rest_url( sprintf( '/%s/%s/%d', $this->namespace, $this->base, $object->get_id() ) ),
            ],
            'collection' => [
                'href' => rest_url( sprintf( '/%s/%s', $this->namespace, $this->base ) ),
            ],
        ];

        if ( $object->get_parent_id() ) {
            $links['up'] = [
                'href' => rest_url( sprintf( '/%s/products/%d', $this->namespace, $object->get_parent_id() ) ),
            ];
        }

        return $links;
    }

    /**
     * Get taxonomy terms.
     *
     * @param WC_Product $product Product instance.
     * @param string $taxonomy Taxonomy slug.
     *
     * @return array
     */
    protected function get_taxonomy_terms( $product, $taxonomy = 'cat' ) {
        $terms = [];

        foreach ( wc_get_object_terms( $product->get_id(), 'product_' . $taxonomy ) as $term ) {
            $terms[] = [
                'id'   => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
            ];
        }

        return $terms;
    }

    /**
     * Get the images for a product or product variation.
     *
     * @param WC_Product|WC_Product_Variation $product Product instance.
     *
     * @return array
     */
    protected function get_images( $product ) {
        $images         = [];
        $attachment_ids = [];

        // Add featured image.
        if ( has_post_thumbnail( $product->get_id() ) ) {
            $attachment_ids[] = $product->get_image_id();
        }

        // Add gallery images.
        $attachment_ids = array_merge( $attachment_ids, $product->get_gallery_image_ids() );

        // Build image data.
        foreach ( $attachment_ids as $position => $attachment_id ) {
            $attachment_post = get_post( $attachment_id );
            if ( is_null( $attachment_post ) ) {
                continue;
            }

            $attachment = wp_get_attachment_image_src( $attachment_id, 'full' );
            if ( ! is_array( $attachment ) ) {
                continue;
            }

            $images[] = [
                'id'                => (int) $attachment_id,
                'date_created'      => wc_rest_prepare_date_response( $attachment_post->post_date, false ),
                'date_created_gmt'  => wc_rest_prepare_date_response( strtotime( $attachment_post->post_date_gmt ) ),
                'date_modified'     => wc_rest_prepare_date_response( $attachment_post->post_modified, false ),
                'date_modified_gmt' => wc_rest_prepare_date_response( strtotime( $attachment_post->post_modified_gmt ) ),
                'src'               => current( $attachment ),
                'name'              => get_the_title( $attachment_id ),
                'alt'               => get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ),
                'position'          => (int) $position,
                'is_featured'       => $product->get_image_id() === $attachment_id,
            ];
        }

        // Set a placeholder image if the product has no images set.
        if ( empty( $images ) ) {
            $images[] = [
                'id'                => 0,
                'date_created'      => wc_rest_prepare_date_response( current_time( 'mysql' ), false ),
                // Default to now.
                'date_created_gmt'  => wc_rest_prepare_date_response( time() ),
                // Default to now.
                'date_modified'     => wc_rest_prepare_date_response( current_time( 'mysql' ), false ),
                'date_modified_gmt' => wc_rest_prepare_date_response( time() ),
                'src'               => wc_placeholder_img_src(),
                'name'              => __( 'Placeholder', 'dokan-lite' ),
                'alt'               => __( 'Placeholder', 'dokan-lite' ),
                'position'          => 0,
            ];
        }

        return $images;
    }

    /**
     * Get attribute taxonomy label.
     *
     * @param string $name Taxonomy name.
     *
     * @return string
     * @deprecated 2.8.0
     */
    protected function get_attribute_taxonomy_label( $name ) {
        $tax    = get_taxonomy( $name );
        $labels = get_taxonomy_labels( $tax );

        return $labels->singular_name;
    }

    /**
     * Get product attribute taxonomy name.
     *
     * @param string $slug Taxonomy name.
     * @param WC_Product $product Product data.
     *
     * @since  2.8.0
     * @return string
     */
    protected function get_attribute_taxonomy_name( $slug, $product ) {
        $attributes = $product->get_attributes();

        if ( ! isset( $attributes[ $slug ] ) ) {
            return str_replace( 'pa_', '', $slug );
        }

        $attribute = $attributes[ $slug ];

        // Taxonomy attribute name.
        if ( $attribute->is_taxonomy() ) {
            $taxonomy = $attribute->get_taxonomy_object();

            return $taxonomy->attribute_label;
        }

        // Custom product attribute name.
        return $attribute->get_name();
    }

    /**
     * Get default attributes.
     *
     * @param WC_Product $product Product instance.
     *
     * @return array
     */
    protected function get_default_attributes( $product ) {
        $default = [];

        if ( $product->is_type( 'variable' ) ) {
            foreach ( array_filter( (array) $product->get_default_attributes(), 'strlen' ) as $key => $value ) {
                if ( 0 === strpos( $key, 'pa_' ) ) {
                    $default[] = [
                        'id'     => wc_attribute_taxonomy_id_by_name( $key ),
                        'name'   => $this->get_attribute_taxonomy_name( $key, $product ),
                        'option' => $value,
                    ];
                } else {
                    $default[] = [
                        'id'     => 0,
                        'name'   => $this->get_attribute_taxonomy_name( $key, $product ),
                        'option' => $value,
                    ];
                }
            }
        }

        return $default;
    }

    /**
     * Get attribute options.
     *
     * @param int $product_id Product ID.
     * @param array $attribute Attribute data.
     *
     * @return array
     */
    protected function get_attribute_options( $product_id, $attribute ) {
        if ( isset( $attribute['is_taxonomy'] ) && $attribute['is_taxonomy'] ) {
            return wc_get_product_terms(
                $product_id, $attribute['name'], [
                    'fields' => 'names',
                ]
            );
        } elseif ( isset( $attribute['value'] ) ) {
            return array_map( 'trim', explode( '|', $attribute['value'] ) );
        }

        return [];
    }

    /**
     * Get the attributes for a product or product variation.
     *
     * @param WC_Product|WC_Product_Variation $product Product instance.
     *
     * @return array
     */
    protected function get_attributes( $product ) {
        $attributes = [];

        if ( $product->is_type( 'variation' ) ) {
            $_product = wc_get_product( $product->get_parent_id() );
            foreach ( $product->get_variation_attributes() as $attribute_name => $attribute ) {
                $name = str_replace( 'attribute_', '', $attribute_name );

                if ( ! $attribute ) {
                    continue;
                }

                // Taxonomy-based attributes are prefixed with `pa_`, otherwise simply `attribute_`.
                if ( 0 === strpos( $attribute_name, 'attribute_pa_' ) ) {
                    $option_term  = get_term_by( 'slug', $attribute, $name );
                    $attributes[] = [
                        'id'     => wc_attribute_taxonomy_id_by_name( $name ),
                        'slug'   => $attribute_name,
                        'name'   => $this->get_attribute_taxonomy_name( $name, $_product ),
                        'option' => $option_term && ! is_wp_error( $option_term ) ? $option_term->name : $attribute,
                    ];
                } else {
                    $attributes[] = [
                        'id'     => 0,
                        'slug'   => $attribute_name,
                        'name'   => $this->get_attribute_taxonomy_name( $name, $_product ),
                        'option' => $attribute,
                    ];
                }
            }
        } else {
            foreach ( $product->get_attributes() as $attribute ) {
                $attributes[] = [
                    'id'        => $attribute['is_taxonomy'] ? wc_attribute_taxonomy_id_by_name( $attribute['name'] ) : 0,
                    'slug'      => $attribute['name'],
                    'name'      => $this->get_attribute_taxonomy_name( $attribute['name'], $product ),
                    'position'  => (int) $attribute['position'],
                    'visible'   => (bool) $attribute['is_visible'],
                    'variation' => (bool) $attribute['is_variation'],
                    'options'   => $this->get_attribute_options( $product->get_id(), $attribute ),
                ];
            }
        }

        return $attributes;
    }

    /**
     * Get the downloads for a product or product variation.
     *
     * @param WC_Product|WC_Product_Variation $product Product instance.
     *
     * @return array
     */
    protected function get_downloads( $product ) {
        $downloads = [];

        if ( $product->is_downloadable() ) {
            foreach ( $product->get_downloads() as $file_id => $file ) {
                $downloads[] = [
                    'id'   => $file_id, // MD5 hash.
                    'name' => $file['name'],
                    'file' => $file['file'],
                ];
            }
        }

        return $downloads;
    }

    /**
     * Set product images.
     *
     * @param WC_Product $product Product instance.
     * @param array $images Images data.
     *
     * @return WC_Product
     * @throws WC_REST_Exception REST API exceptions.
     */
    protected function set_product_images( $product, $images ) {
        $images = is_array( $images ) ? array_filter( $images ) : [];

        if ( ! empty( $images ) ) {
            $gallery = [];

            foreach ( $images as $image ) {
                $attachment_id = isset( $image['id'] ) ? absint( $image['id'] ) : 0;

                if ( 0 === $attachment_id && isset( $image['src'] ) ) {
                    $upload = wc_rest_upload_image_from_url( esc_url_raw( $image['src'] ) );

                    if ( is_wp_error( $upload ) ) {
                        if ( ! apply_filters( 'woocommerce_rest_suppress_image_upload_error', false, $upload, $product->get_id(), $images ) ) {
                            throw new WC_REST_Exception( 'woocommerce_product_image_upload_error', $upload->get_error_message(), 400 );
                        } else {
                            continue;
                        }
                    }

                    $attachment_id = wc_rest_set_uploaded_image_as_attachment( $upload, $product->get_id() );
                }

                if ( ! wp_attachment_is_image( $attachment_id ) ) {
                    /* translators: %s: attachment id */
                    throw new WC_REST_Exception( 'woocommerce_product_invalid_image_id', sprintf( __( '#%s is an invalid image ID.', 'dokan-lite' ), $attachment_id ), 400 );
                }

                if ( isset( $image['position'] ) && 0 === absint( $image['position'] ) ) {
                    $product->set_image_id( $attachment_id );
                } else {
                    $gallery[] = $attachment_id;
                }

                // Set the image alt if present.
                if ( ! empty( $image['alt'] ) ) {
                    update_post_meta( $attachment_id, '_wp_attachment_image_alt', wc_clean( $image['alt'] ) );
                }

                // Set the image name if present.
                if ( ! empty( $image['name'] ) ) {
                    wp_update_post(
                        [
                            'ID'         => $attachment_id,
                            'post_title' => $image['name'],
                        ]
                    );
                }

                // Set the image source if present, for future reference.
                if ( ! empty( $image['src'] ) ) {
                    update_post_meta( $attachment_id, '_wc_attachment_source', esc_url_raw( $image['src'] ) );
                }
            }

            $product->set_gallery_image_ids( $gallery );
        } else {
            $product->set_image_id( '' );
            $product->set_gallery_image_ids( [] );
        }

        return $product;
    }

    /**
     * Save product shipping data.
     *
     * @param WC_Product $product Product instance.
     * @param array $data Shipping data.
     *
     * @return WC_Product
     */
    protected function save_product_shipping_data( $product, $data ) {
        // Virtual.
        if ( isset( $data['virtual'] ) && true === $data['virtual'] ) {
            $product->set_weight( '' );
            $product->set_height( '' );
            $product->set_length( '' );
            $product->set_width( '' );
        } else {
            if ( isset( $data['weight'] ) ) {
                $product->set_weight( $data['weight'] );
            }

            // Height.
            if ( isset( $data['dimensions']['height'] ) ) {
                $product->set_height( $data['dimensions']['height'] );
            }

            // Width.
            if ( isset( $data['dimensions']['width'] ) ) {
                $product->set_width( $data['dimensions']['width'] );
            }

            // Length.
            if ( isset( $data['dimensions']['length'] ) ) {
                $product->set_length( $data['dimensions']['length'] );
            }
        }

        // Shipping class.
        if ( isset( $data['shipping_class'] ) ) {
            $data_store        = $product->get_data_store();
            $shipping_class_id = $data_store->get_shipping_class_id_by_slug( wc_clean( $data['shipping_class'] ) );
            $product->set_shipping_class_id( $shipping_class_id );
        }

        return $product;
    }

    /**
     * Save downloadable files.
     *
     * @param WC_Product $product Product instance.
     * @param array $downloads Downloads data.
     * @param int $deprecated Deprecated since 3.0.
     *
     * @return WC_Product
     */
    protected function save_downloadable_files( $product, $downloads, $deprecated = 0 ) {
        if ( $deprecated ) {
            wc_deprecated_argument( 'variation_id', '3.0', 'save_downloadable_files() not requires a variation_id anymore.' );
        }

        $files = [];
        foreach ( $downloads as $key => $file ) {
            if ( empty( $file['file'] ) ) {
                continue;
            }

            $download = new WC_Product_Download();
            $download->set_id( $key );
            $download->set_name( $file['name'] ? $file['name'] : wc_get_filename_from_url( $file['file'] ) );
            $download->set_file( apply_filters( 'woocommerce_file_download_path', $file['file'], $product, $key ) );
            $files[] = $download;
        }
        $product->set_downloads( $files );

        return $product;
    }

    /**
     * Save taxonomy terms.
     *
     * @param WC_Product $product Product instance.
     * @param array $terms Terms data.
     * @param string $taxonomy Taxonomy name.
     *
     * @return WC_Product
     */
    protected function save_taxonomy_terms( $product, $terms, $taxonomy = 'cat' ) {
        $term_ids = wp_list_pluck( $terms, 'id' );

        if ( 'cat' === $taxonomy ) {
            $product->set_category_ids( $term_ids );
        } elseif ( 'tag' === $taxonomy ) {
            $product->set_tag_ids( $term_ids );
        }

        return $product;
    }

    /**
     * Save default attributes.
     *
     * @param WC_Product $product Product instance.
     * @param WP_REST_Request $request Request data.
     *
     * @since 3.0.0
     *
     * @return WC_Product
     */
    protected function save_default_attributes( $product, $request ) {
        if ( isset( $request['default_attributes'] ) && is_array( $request['default_attributes'] ) ) {
            $product_attribute = new ProductAttribute( $request['default_attributes'] );
            $product_attribute->set_default( $product );
        }

        return $product;
    }

    /**
     * Returns all categories.
     *
     * @since 3.6.2
     *
     * @return WP_REST_Response|WP_Error
     */
    public function get_multistep_categories() {
        $categories_controller = new Categories();
        $categories = apply_filters( 'dokan_rest_product_categories', $categories_controller->get() );

        return rest_ensure_response( $categories );
    }

    /**
     * Get the Product's schema, conforming to JSON Schema.
     *
     * @return array
     */

    public function get_item_schema() {
        $weight_unit    = get_option( 'woocommerce_weight_unit' );
        $dimension_unit = get_option( 'woocommerce_dimension_unit' );
        $schema         = [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => $this->post_type,
            'type'       => 'object',
            'properties' => [
                'id'                    => [
                    'description' => __( 'Unique identifier for the resource.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'name'                  => [
                    'description' => __( 'Product name.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'slug'                  => [
                    'description' => __( 'Product slug.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'permalink'             => [
                    'description' => __( 'Product URL.', 'dokan-lite' ),
                    'type'        => 'string',
                    'format'      => 'uri',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'date_created'          => [
                    'description' => __( "The date the product was created, in the site's timezone.", 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'date_created_gmt'      => [
                    'description' => __( 'The date the product was created, as GMT.', 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'date_modified'         => [
                    'description' => __( "The date the product was last modified, in the site's timezone.", 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'date_modified_gmt'     => [
                    'description' => __( 'The date the product was last modified, as GMT.', 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'type'                  => [
                    'description' => __( 'Product type.', 'dokan-lite' ),
                    'type'        => 'string',
                    'default'     => 'simple',
                    'enum'        => array_keys( wc_get_product_types() ),
                    'context'     => [ 'view', 'edit' ],
                ],
                'status'                => [
                    'description' => __( 'Product status (post status).', 'dokan-lite' ),
                    'type'        => 'string',
                    'default'     => 'publish',
                    'enum'        => array_keys( get_post_statuses() ),
                    'context'     => [ 'view', 'edit' ],
                ],
                'featured'              => [
                    'description' => __( 'Featured product.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'default'     => false,
                    'context'     => [ 'view', 'edit' ],
                ],
                'catalog_visibility'    => [
                    'description' => __( 'Catalog visibility.', 'dokan-lite' ),
                    'type'        => 'string',
                    'default'     => 'visible',
                    'enum'        => [ 'visible', 'catalog', 'search', 'hidden' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'description'           => [
                    'description' => __( 'Product description.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'short_description'     => [
                    'description' => __( 'Product short description.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'sku'                   => [
                    'description' => __( 'Unique identifier.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'price'                 => [
                    'description' => __( 'Current product price.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'regular_price'         => [
                    'description' => __( 'Product regular price.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'sale_price'            => [
                    'description' => __( 'Product sale price.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'date_on_sale_from'     => [
                    'description' => __( "Start date of sale price, in the site's timezone.", 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => [ 'view', 'edit' ],
                ],
                'date_on_sale_from_gmt' => [
                    'description' => __( 'Start date of sale price, as GMT.', 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => [ 'view', 'edit' ],
                ],
                'date_on_sale_to'       => [
                    'description' => __( "End date of sale price, in the site's timezone.", 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => [ 'view', 'edit' ],
                ],
                'date_on_sale_to_gmt'   => [
                    'description' => __( 'End date of sale price, as GMT.', 'dokan-lite' ),
                    'type'        => 'date-time',
                    'context'     => [ 'view', 'edit' ],
                ],
                'price_html'            => [
                    'description' => __( 'Price formatted in HTML.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'on_sale'               => [
                    'description' => __( 'Shows if the product is on sale.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'purchasable'           => [
                    'description' => __( 'Shows if the product can be bought.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'total_sales'           => [
                    'description' => __( 'Amount of sales.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'virtual'               => [
                    'description' => __( 'If the product is virtual.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'default'     => false,
                    'context'     => [ 'view', 'edit' ],
                ],
                'downloadable'          => [
                    'description' => __( 'If the product is downloadable.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'default'     => false,
                    'context'     => [ 'view', 'edit' ],
                ],
                'downloads'             => [
                    'description' => __( 'List of downloadable files.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'id'   => [
                                'description' => __( 'File MD5 hash.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'name' => [
                                'description' => __( 'File name.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'file' => [
                                'description' => __( 'File URL.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                        ],
                    ],
                ],
                'download_limit'        => [
                    'description' => __( 'Number of times downloadable files can be downloaded after purchase.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'default'     => - 1,
                    'context'     => [ 'view', 'edit' ],
                ],
                'download_expiry'       => [
                    'description' => __( 'Number of days until access to downloadable files expires.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'default'     => - 1,
                    'context'     => [ 'view', 'edit' ],
                ],
                'external_url'          => [
                    'description' => __( 'Product external URL. Only for external products.', 'dokan-lite' ),
                    'type'        => 'string',
                    'format'      => 'uri',
                    'context'     => [ 'view', 'edit' ],
                ],
                'button_text'           => [
                    'description' => __( 'Product external button text. Only for external products.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'tax_status'            => [
                    'description' => __( 'Tax status.', 'dokan-lite' ),
                    'type'        => 'string',
                    'default'     => 'taxable',
                    'enum'        => [ 'taxable', 'shipping', 'none' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'tax_class'             => [
                    'description' => __( 'Tax class.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'manage_stock'          => [
                    'description' => __( 'Stock management at product level.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'default'     => false,
                    'context'     => [ 'view', 'edit' ],
                ],
                'stock_quantity'        => [
                    'description' => __( 'Stock quantity.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                ],
                'in_stock'              => [
                    'description' => __( 'Controls whether or not the product is listed as "in stock" or "out of stock" on the frontend.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'default'     => true,
                    'context'     => [ 'view', 'edit' ],
                ],
                'backorders'            => [
                    'description' => __( 'If managing stock, this controls if backorders are allowed.', 'dokan-lite' ),
                    'type'        => 'string',
                    'default'     => 'no',
                    'enum'        => [ 'no', 'notify', 'yes' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'backorders_allowed'    => [
                    'description' => __( 'Shows if backorders are allowed.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'backordered'           => [
                    'description' => __( 'Shows if the product is on backordered.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'sold_individually'     => [
                    'description' => __( 'Allow one item to be bought in a single order.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'default'     => false,
                    'context'     => [ 'view', 'edit' ],
                ],
                'weight'                => [
                    /* translators: %s: weight unit */
                    'description' => sprintf( __( 'Product weight (%s).', 'dokan-lite' ), $weight_unit ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'dimensions'            => [
                    'description' => __( 'Product dimensions.', 'dokan-lite' ),
                    'type'        => 'object',
                    'context'     => [ 'view', 'edit' ],
                    'properties'  => [
                        'length' => [
                            /* translators: %s: dimension unit */
                            'description' => sprintf( __( 'Product length (%s).', 'dokan-lite' ), $dimension_unit ),
                            'type'        => 'string',
                            'context'     => [ 'view', 'edit' ],
                        ],
                        'width'  => [
                            /* translators: %s: dimension unit */
                            'description' => sprintf( __( 'Product width (%s).', 'dokan-lite' ), $dimension_unit ),
                            'type'        => 'string',
                            'context'     => [ 'view', 'edit' ],
                        ],
                        'height' => [
                            /* translators: %s: dimension unit */
                            'description' => sprintf( __( 'Product height (%s).', 'dokan-lite' ), $dimension_unit ),
                            'type'        => 'string',
                            'context'     => [ 'view', 'edit' ],
                        ],
                    ],
                ],
                'shipping_required'     => [
                    'description' => __( 'Shows if the product need to be shipped.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'shipping_taxable'      => [
                    'description' => __( 'Shows whether or not the product shipping is taxable.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'shipping_class'        => [
                    'description' => __( 'Shipping class slug.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'shipping_class_id'     => [
                    'description' => __( 'Shipping class ID.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'reviews_allowed'       => [
                    'description' => __( 'Allow reviews.', 'dokan-lite' ),
                    'type'        => 'boolean',
                    'default'     => true,
                    'context'     => [ 'view', 'edit' ],
                ],
                'average_rating'        => [
                    'description' => __( 'Reviews average rating.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'rating_count'          => [
                    'description' => __( 'Amount of reviews that the product have.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'related_ids'           => [
                    'description' => __( 'List of related products IDs.', 'dokan-lite' ),
                    'type'        => 'array',
                    'items'       => [
                        'type' => 'integer',
                    ],
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'upsell_ids'            => [
                    'description' => __( 'List of up-sell products IDs.', 'dokan-lite' ),
                    'type'        => 'array',
                    'items'       => [
                        'type' => 'integer',
                    ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'cross_sell_ids'        => [
                    'description' => __( 'List of cross-sell products IDs.', 'dokan-lite' ),
                    'type'        => 'array',
                    'items'       => [
                        'type' => 'integer',
                    ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'parent_id'             => [
                    'description' => __( 'Product parent ID.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                ],
                'purchase_note'         => [
                    'description' => __( 'Optional note to send the customer after purchase.', 'dokan-lite' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'categories'            => [
                    'description' => __( 'List of categories.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'id'   => [
                                'description' => __( 'Category ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'name' => [
                                'description' => __( 'Category name.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'slug' => [
                                'description' => __( 'Category slug.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                        ],
                    ],
                ],
                'tags'                  => [
                    'description' => __( 'List of tags.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'id'   => [
                                'description' => __( 'Tag ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'name' => [
                                'description' => __( 'Tag name.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'slug' => [
                                'description' => __( 'Tag slug.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                        ],
                    ],
                ],
                'images'                => [
                    'description' => __( 'List of images.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'id'                => [
                                'description' => __( 'Image ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'date_created'      => [
                                'description' => __( "The date the image was created, in the site's timezone.", 'dokan-lite' ),
                                'type'        => 'date-time',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'date_created_gmt'  => [
                                'description' => __( 'The date the image was created, as GMT.', 'dokan-lite' ),
                                'type'        => 'date-time',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'date_modified'     => [
                                'description' => __( "The date the image was last modified, in the site's timezone.", 'dokan-lite' ),
                                'type'        => 'date-time',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'date_modified_gmt' => [
                                'description' => __( 'The date the image was last modified, as GMT.', 'dokan-lite' ),
                                'type'        => 'date-time',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'src'               => [
                                'description' => __( 'Image URL.', 'dokan-lite' ),
                                'type'        => 'string',
                                'format'      => 'uri',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'name'              => [
                                'description' => __( 'Image name.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'alt'               => [
                                'description' => __( 'Image alternative text.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'position'          => [
                                'description' => __( 'Image position. 0 means that the image is featured.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                            ],
                        ],
                    ],
                ],
                'attributes'            => [
                    'description' => __( 'List of attributes.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'id'        => [
                                'description' => __( 'Attribute ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'name'      => [
                                'description' => __( 'Attribute name.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'position'  => [
                                'description' => __( 'Attribute position.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'visible'   => [
                                'description' => __( "Define if the attribute is visible on the \"Additional information\" tab in the product's page.", 'dokan-lite' ),
                                'type'        => 'boolean',
                                'default'     => false,
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'variation' => [
                                'description' => __( 'Define if the attribute can be used as variation.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'default'     => false,
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'options'   => [
                                'description' => __( 'List of available term names of the attribute.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => [ 'view', 'edit' ],
                                'items'       => [
                                    'type' => 'string',
                                ],
                            ],
                        ],
                    ],
                ],
                'default_attributes'    => [
                    'description' => __( 'Defaults variation attributes.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'id'     => [
                                'description' => __( 'Attribute ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'name'   => [
                                'description' => __( 'Attribute name.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'option' => [
                                'description' => __( 'Selected attribute term name.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                        ],
                    ],
                ],
                'variations'            => [
                    'description' => __( 'List of variations IDs.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'items'       => [
                        'type' => 'integer',
                    ],
                    'readonly'    => true,
                ],
                'grouped_products'      => [
                    'description' => __( 'List of grouped products ID.', 'dokan-lite' ),
                    'type'        => 'array',
                    'items'       => [
                        'type' => 'integer',
                    ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'menu_order'            => [
                    'description' => __( 'Menu order, used to custom sort products.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                ],
                'meta_data'             => [
                    'description' => __( 'Meta data.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'id'    => [
                                'description' => __( 'Meta ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'key'   => [
                                'description' => __( 'Meta key.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'value' => [
                                'description' => __( 'Meta value.', 'dokan-lite' ),
                                'type'        => 'mixed',
                                'context'     => [ 'view', 'edit' ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        return $this->add_additional_fields_schema( $schema );
    }

}
