<?php
/**
 * Product Feature Manager
 *
 * @package WeDevs\Dokan\FeatureAPI\Features\Product
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Features\Product;

use WeDevs\Dokan\FeatureAPI\Schemas\ProductSchema;
use WeDevs\Dokan\FeatureAPI\Validators\ProductValidator;
use WeDevs\Dokan\FeatureAPI\Permissions\ProductPermissions;
use WP_Feature;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Product Manager
 *
 * @since 4.0.0
 */
class ProductManager {

    /**
     * Register product features
     */
    public function register_features() {
        $this->register_product_resources();
        $this->register_product_tools();
    }

    /**
     * Register product resource features (read-only)
     */
    private function register_product_resources() {
        // List products
        wp_register_feature(
            [
				'id' => 'dokan/products/list',
				'name' => __( 'List Products', 'dokan-lite' ),
				'description' => __( 'Get a list of all products with filtering options', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_RESOURCE,
				'callback' => [ $this, 'get_products_list' ],
				'permission_callback' => [ ProductPermissions::class, 'can_list_products' ],
				'input_schema' => ProductSchema::get_products_list_schema(),
				'output_schema' => ProductSchema::get_products_list_output_schema(),
				'categories' => [ 'dokan', 'product', 'marketplace' ],
			]
        );

        // Get single product
        wp_register_feature(
            [
				'id' => 'dokan/products/get',
				'name' => __( 'Get Product', 'dokan-lite' ),
				'description' => __( 'Get details of a specific product', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_RESOURCE,
				'callback' => [ $this, 'get_product' ],
				'permission_callback' => [ ProductPermissions::class, 'can_view_product' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Product ID', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => ProductSchema::get_product_output_schema(),
				'categories' => [ 'dokan', 'product', 'marketplace' ],
			]
        );

        // Get vendor products
        wp_register_feature(
            [
				'id' => 'dokan/products/vendor-products',
				'name' => __( 'Get Vendor Products', 'dokan-lite' ),
				'description' => __( 'Get products for a specific vendor', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_RESOURCE,
				'callback' => [ $this, 'get_vendor_products' ],
				'permission_callback' => [ ProductPermissions::class, 'can_view_vendor_products' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'vendor_id' ],
					'properties' => [
						'vendor_id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
						],
						'number' => [
							'type' => 'integer',
							'description' => __( 'Number of products to return', 'dokan-lite' ),
							'minimum' => 1,
							'maximum' => 100,
							'default' => 10,
						],
						'offset' => [
							'type' => 'integer',
							'description' => __( 'Number of products to skip', 'dokan-lite' ),
							'minimum' => 0,
							'default' => 0,
						],
						'status' => [
							'type' => 'string',
							'enum' => [ 'publish', 'pending', 'draft', 'private' ],
							'description' => __( 'Product status', 'dokan-lite' ),
							'default' => 'publish',
						],
					],
				],
				'output_schema' => ProductSchema::get_products_list_output_schema(),
				'categories' => [ 'dokan', 'product', 'vendor', 'marketplace' ],
			]
        );

        // Get featured products
        wp_register_feature(
            [
				'id' => 'dokan/products/featured',
				'name' => __( 'Get Featured Products', 'dokan-lite' ),
				'description' => __( 'Get a list of featured products', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_RESOURCE,
				'callback' => [ $this, 'get_featured_products' ],
				'permission_callback' => [ ProductPermissions::class, 'can_list_products' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [
						'number' => [
							'type' => 'integer',
							'description' => __( 'Number of products to return', 'dokan-lite' ),
							'minimum' => 1,
							'maximum' => 50,
							'default' => 10,
						],
						'offset' => [
							'type' => 'integer',
							'description' => __( 'Number of products to skip', 'dokan-lite' ),
							'minimum' => 0,
							'default' => 0,
						],
					],
				],
				'output_schema' => ProductSchema::get_products_list_output_schema(),
				'categories' => [ 'dokan', 'product', 'marketplace' ],
			]
        );

        // Search products
        wp_register_feature(
            [
				'id' => 'dokan/products/search',
				'name' => __( 'Search Products', 'dokan-lite' ),
				'description' => __( 'Search products by name, description, or SKU', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_RESOURCE,
				'callback' => [ $this, 'search_products' ],
				'permission_callback' => [ ProductPermissions::class, 'can_search_products' ],
				'input_schema' => ProductSchema::get_product_search_schema(),
				'output_schema' => ProductSchema::get_products_list_output_schema(),
				'categories' => [ 'dokan', 'product', 'marketplace' ],
			]
        );
    }

    /**
     * Register product tool features (create, update, delete)
     */
    private function register_product_tools() {
        // Create product
        wp_register_feature(
            [
				'id' => 'dokan/products/create',
				'name' => __( 'Create Product', 'dokan-lite' ),
				'description' => __( 'Create a new product', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_TOOL,
				'callback' => [ $this, 'create_product' ],
				'permission_callback' => [ ProductPermissions::class, 'can_create_product' ],
				'input_schema' => ProductSchema::get_product_create_schema(),
				'output_schema' => ProductSchema::get_product_output_schema(),
				'categories' => [ 'dokan', 'product', 'marketplace' ],
			]
        );

        // Update product
        wp_register_feature(
            [
				'id' => 'dokan/products/update',
				'name' => __( 'Update Product', 'dokan-lite' ),
				'description' => __( 'Update an existing product', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_TOOL,
				'callback' => [ $this, 'update_product' ],
				'permission_callback' => [ ProductPermissions::class, 'can_update_product' ],
				'input_schema' => ProductSchema::get_product_update_schema(),
				'output_schema' => ProductSchema::get_product_output_schema(),
				'categories' => [ 'dokan', 'product', 'marketplace' ],
			]
        );

        // Delete product
        wp_register_feature(
            [
				'id' => 'dokan/products/delete',
				'name' => __( 'Delete Product', 'dokan-lite' ),
				'description' => __( 'Delete a product', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_TOOL,
				'callback' => [ $this, 'delete_product' ],
				'permission_callback' => [ ProductPermissions::class, 'can_delete_product' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Product ID', 'dokan-lite' ),
						],
						'force' => [
							'type' => 'boolean',
							'description' => __( 'Force delete (skip trash)', 'dokan-lite' ),
							'default' => false,
						],
					],
				],
				'output_schema' => [
					'type' => 'object',
					'properties' => [
						'success' => [
							'type' => 'boolean',
							'description' => __( 'Whether the product was deleted successfully', 'dokan-lite' ),
						],
						'message' => [
							'type' => 'string',
							'description' => __( 'Success message', 'dokan-lite' ),
						],
					],
				],
				'categories' => [ 'dokan', 'product', 'marketplace' ],
			]
        );

        // Approve product
        wp_register_feature(
            [
				'id' => 'dokan/products/approve',
				'name' => __( 'Approve Product', 'dokan-lite' ),
				'description' => __( 'Approve a pending product', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_TOOL,
				'callback' => [ $this, 'approve_product' ],
				'permission_callback' => [ ProductPermissions::class, 'can_approve_product' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Product ID', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => ProductSchema::get_product_output_schema(),
				'categories' => [ 'dokan', 'product', 'marketplace' ],
			]
        );

        // Reject product
        wp_register_feature(
            [
				'id' => 'dokan/products/reject',
				'name' => __( 'Reject Product', 'dokan-lite' ),
				'description' => __( 'Reject a pending product', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_TOOL,
				'callback' => [ $this, 'reject_product' ],
				'permission_callback' => [ ProductPermissions::class, 'can_reject_product' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id', 'reason' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Product ID', 'dokan-lite' ),
						],
						'reason' => [
							'type' => 'string',
							'description' => __( 'Reason for rejection', 'dokan-lite' ),
							'minLength' => 1,
							'maxLength' => 500,
						],
					],
				],
				'output_schema' => ProductSchema::get_product_output_schema(),
				'categories' => [ 'dokan', 'product', 'marketplace' ],
			]
        );

        // Feature product
        wp_register_feature(
            [
				'id' => 'dokan/products/feature',
				'name' => __( 'Feature Product', 'dokan-lite' ),
				'description' => __( 'Feature or unfeature a product', 'dokan-lite' ),
				'type' => WP_Feature::TYPE_TOOL,
				'callback' => [ $this, 'feature_product' ],
				'permission_callback' => [ ProductPermissions::class, 'can_feature_product' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id', 'featured' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Product ID', 'dokan-lite' ),
						],
						'featured' => [
							'type' => 'boolean',
							'description' => __( 'Whether to feature the product', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => ProductSchema::get_product_output_schema(),
				'categories' => [ 'dokan', 'product', 'marketplace' ],
			]
        );
    }

    /**
     * Get products list
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_products_list( $context ) {
        $validator = new ProductValidator();
        $args = $validator->validate_list_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        $query_args = [
            'post_type' => 'product',
            'post_status' => $args['status'] ?? 'publish',
            'posts_per_page' => $args['number'] ?? 10,
            'paged' => ( $args['offset'] ?? 0 ) / ( $args['number'] ?? 10 ) + 1,
            'orderby' => $args['orderby'] ?? 'date',
            'order' => $args['order'] ?? 'DESC',
        ];

        // Add vendor filter if specified
        if ( ! empty( $args['vendor_id'] ) ) {
            $query_args['author'] = $args['vendor_id'];
        }

        // Add search filter
        if ( ! empty( $args['search'] ) ) {
            $query_args['s'] = $args['search'];
        }

        // Add category filter
        if ( ! empty( $args['category'] ) ) {
            $query_args['tax_query'][] = [
                'taxonomy' => 'product_cat',
                'field' => 'term_id',
                'terms' => $args['category'],
            ];
        }

        $query = new \WP_Query( $query_args );
        $products = [];

        if ( $query->have_posts() ) {
            while ( $query->have_posts() ) {
                $query->the_post();
                $product = wc_get_product( get_the_ID() );
                if ( $product ) {
                    $products[] = $this->format_product_response( $product );
                }
            }
        }

        wp_reset_postdata();

        return [
            'products' => $products,
            'total' => $query->found_posts,
            'total_pages' => $query->max_num_pages,
            'current_page' => $query->get( 'paged' ),
        ];
    }

    /**
     * Get single product
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_product( $context ) {
        $product_id = absint( $context['id'] );
        $product = wc_get_product( $product_id );

        if ( ! $product ) {
            return new \WP_Error( 'product_not_found', __( 'Product not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return $this->format_product_response( $product );
    }

    /**
     * Get vendor products
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_vendor_products( $context ) {
        $vendor_id = absint( $context['vendor_id'] );

        // Check if vendor exists
        if ( ! dokan_is_user_seller( $vendor_id ) ) {
            return new \WP_Error( 'vendor_not_found', __( 'Vendor not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $context['vendor_id'] = $vendor_id;
        return $this->get_products_list( $context );
    }

    /**
     * Get featured products
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_featured_products( $context ) {
        $args = [
            'number' => $context['number'] ?? 10,
            'offset' => $context['offset'] ?? 0,
            'featured' => true,
        ];

        return $this->get_products_list( $args );
    }

    /**
     * Search products
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function search_products( $context ) {
        $validator = new ProductValidator();
        $args = $validator->validate_search_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        return $this->get_products_list( $args );
    }

    /**
     * Create product
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function create_product( $context ) {
        $validator = new ProductValidator();
        $args = $validator->validate_create_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        // Create product
        $product = new \WC_Product_Simple();
        $product->set_name( $args['name'] );
        $product->set_description( $args['description'] ?? '' );
        $product->set_short_description( $args['short_description'] ?? '' );
        $product->set_regular_price( $args['regular_price'] ?? '' );
        $product->set_sale_price( $args['sale_price'] ?? '' );
        $product->set_status( $args['status'] ?? 'draft' );

        // Set vendor
        $vendor_id = $args['vendor_id'] ?? dokan_get_current_user_id();
        $product->set_author( $vendor_id );

        // Set categories
        if ( ! empty( $args['categories'] ) ) {
            $product->set_category_ids( $args['categories'] );
        }

        // Set tags
        if ( ! empty( $args['tags'] ) ) {
            $product->set_tag_ids( $args['tags'] );
        }

        // Set SKU
        if ( ! empty( $args['sku'] ) ) {
            $product->set_sku( $args['sku'] );
        }

        // Set stock
        if ( isset( $args['manage_stock'] ) ) {
            $product->set_manage_stock( $args['manage_stock'] );
        }

        if ( isset( $args['stock_quantity'] ) ) {
            $product->set_stock_quantity( $args['stock_quantity'] );
        }

        if ( isset( $args['stock_status'] ) ) {
            $product->set_stock_status( $args['stock_status'] );
        }

        $product_id = $product->save();

        if ( is_wp_error( $product_id ) ) {
            return $product_id;
        }

        return $this->format_product_response( wc_get_product( $product_id ) );
    }

    /**
     * Update product
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function update_product( $context ) {
        $product_id = absint( $context['id'] );
        $product = wc_get_product( $product_id );

        if ( ! $product ) {
            return new \WP_Error( 'product_not_found', __( 'Product not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $validator = new ProductValidator();
        $args = $validator->validate_update_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        // Update product fields
        if ( isset( $args['name'] ) ) {
            $product->set_name( $args['name'] );
        }

        if ( isset( $args['description'] ) ) {
            $product->set_description( $args['description'] );
        }

        if ( isset( $args['short_description'] ) ) {
            $product->set_short_description( $args['short_description'] );
        }

        if ( isset( $args['regular_price'] ) ) {
            $product->set_regular_price( $args['regular_price'] );
        }

        if ( isset( $args['sale_price'] ) ) {
            $product->set_sale_price( $args['sale_price'] );
        }

        if ( isset( $args['status'] ) ) {
            $product->set_status( $args['status'] );
        }

        if ( isset( $args['categories'] ) ) {
            $product->set_category_ids( $args['categories'] );
        }

        if ( isset( $args['tags'] ) ) {
            $product->set_tag_ids( $args['tags'] );
        }

        if ( isset( $args['sku'] ) ) {
            $product->set_sku( $args['sku'] );
        }

        if ( isset( $args['manage_stock'] ) ) {
            $product->set_manage_stock( $args['manage_stock'] );
        }

        if ( isset( $args['stock_quantity'] ) ) {
            $product->set_stock_quantity( $args['stock_quantity'] );
        }

        if ( isset( $args['stock_status'] ) ) {
            $product->set_stock_status( $args['stock_status'] );
        }

        $product->save();

        return $this->format_product_response( $product );
    }

    /**
     * Delete product
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function delete_product( $context ) {
        $product_id = absint( $context['id'] );
        $product = wc_get_product( $product_id );

        if ( ! $product ) {
            return new \WP_Error( 'product_not_found', __( 'Product not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $force = ! empty( $context['force'] );
        $result = $product->delete( $force );

        if ( ! $result ) {
            return new \WP_Error( 'delete_failed', __( 'Failed to delete product', 'dokan-lite' ) );
        }

        return [
            'success' => true,
            'message' => __( 'Product deleted successfully', 'dokan-lite' ),
        ];
    }

    /**
     * Approve product
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function approve_product( $context ) {
        $product_id = absint( $context['id'] );
        $product = wc_get_product( $product_id );

        if ( ! $product ) {
            return new \WP_Error( 'product_not_found', __( 'Product not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        if ( $product->get_status() !== 'pending' ) {
            return new \WP_Error( 'invalid_status', __( 'Product is not pending approval', 'dokan-lite' ) );
        }

        $product->set_status( 'publish' );
        $product->save();

        // Send notification to vendor
        do_action( 'dokan_product_approved', $product_id );

        return $this->format_product_response( $product );
    }

    /**
     * Reject product
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function reject_product( $context ) {
        $product_id = absint( $context['id'] );
        $product = wc_get_product( $product_id );

        if ( ! $product ) {
            return new \WP_Error( 'product_not_found', __( 'Product not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        if ( $product->get_status() !== 'pending' ) {
            return new \WP_Error( 'invalid_status', __( 'Product is not pending approval', 'dokan-lite' ) );
        }

        $reason = sanitize_textarea_field( $context['reason'] );
        $product->set_status( 'draft' );
        $product->save();

        // Store rejection reason
        update_post_meta( $product_id, '_dokan_rejection_reason', $reason );

        // Send notification to vendor
        do_action( 'dokan_product_rejected', $product_id, $reason );

        return $this->format_product_response( $product );
    }

    /**
     * Feature product
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function feature_product( $context ) {
        $product_id = absint( $context['id'] );
        $product = wc_get_product( $product_id );

        if ( ! $product ) {
            return new \WP_Error( 'product_not_found', __( 'Product not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $featured = ! empty( $context['featured'] );
        update_post_meta( $product_id, '_dokan_featured', $featured ? 'yes' : 'no' );

        return $this->format_product_response( $product );
    }

    /**
     * Format product response
     *
     * @param \WC_Product $product
     * @return array
     */
    private function format_product_response( $product ) {
        return [
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'slug' => $product->get_slug(),
            'description' => $product->get_description(),
            'short_description' => $product->get_short_description(),
            'price' => $product->get_price(),
            'regular_price' => $product->get_regular_price(),
            'sale_price' => $product->get_sale_price(),
            'status' => $product->get_status(),
            'type' => $product->get_type(),
            'sku' => $product->get_sku(),
            'manage_stock' => $product->get_manage_stock(),
            'stock_quantity' => $product->get_stock_quantity(),
            'stock_status' => $product->get_stock_status(),
            'featured' => get_post_meta( $product->get_id(), '_dokan_featured', true ) === 'yes',
            'vendor_id' => $product->get_author(),
            'vendor_name' => dokan_get_store_info( $product->get_author(), 'store_name' ),
            'categories' => $this->format_taxonomy_terms( $product->get_category_ids(), 'product_cat' ),
            'tags' => $this->format_taxonomy_terms( $product->get_tag_ids(), 'product_tag' ),
            'images' => $this->format_product_images( $product ),
            'date_created' => $product->get_date_created()->format( 'Y-m-d H:i:s' ),
            'date_modified' => $product->get_date_modified()->format( 'Y-m-d H:i:s' ),
        ];
    }

    /**
     * Format taxonomy terms
     *
     * @param array $term_ids
     * @param string $taxonomy
     * @return array
     */
    private function format_taxonomy_terms( $term_ids, $taxonomy ) {
        $terms = [];
        foreach ( $term_ids as $term_id ) {
            $term = get_term( $term_id, $taxonomy );
            if ( $term && ! is_wp_error( $term ) ) {
                $terms[] = [
                    'id' => $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                ];
            }
        }
        return $terms;
    }

    /**
     * Format product images
     *
     * @param \WC_Product $product
     * @return array
     */
    private function format_product_images( $product ) {
        $images = [];

        // Featured image
        $featured_image_id = $product->get_image_id();
        if ( $featured_image_id ) {
            $images['featured'] = [
                'id' => $featured_image_id,
                'src' => wp_get_attachment_url( $featured_image_id ),
                'name' => get_the_title( $featured_image_id ),
                'alt' => get_post_meta( $featured_image_id, '_wp_attachment_image_alt', true ),
            ];
        }

        // Gallery images
        $gallery_image_ids = $product->get_gallery_image_ids();
        $images['gallery'] = [];
        foreach ( $gallery_image_ids as $image_id ) {
            $images['gallery'][] = [
                'id' => $image_id,
                'src' => wp_get_attachment_url( $image_id ),
                'name' => get_the_title( $image_id ),
                'alt' => get_post_meta( $image_id, '_wp_attachment_image_alt', true ),
            ];
        }

        return $images;
    }
}
