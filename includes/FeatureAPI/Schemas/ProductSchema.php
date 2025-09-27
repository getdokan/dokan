<?php
/**
 * Product Schema for Feature API
 *
 * @package WeDevs\Dokan\FeatureAPI\Schemas
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Schemas;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Product Schema
 *
 * @since 4.0.0
 */
class ProductSchema {

    /**
     * Get products list input schema
     *
     * @return array
     */
    public static function get_products_list_schema() {
        return [
            'type' => 'object',
            'properties' => [
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
                'orderby' => [
                    'type' => 'string',
                    'description' => __( 'Order by field', 'dokan-lite' ),
                    'enum' => [ 'date', 'title', 'price', 'popularity', 'rating' ],
                    'default' => 'date',
                ],
                'order' => [
                    'type' => 'string',
                    'description' => __( 'Order direction', 'dokan-lite' ),
                    'enum' => [ 'ASC', 'DESC' ],
                    'default' => 'DESC',
                ],
                'status' => [
                    'type' => 'string',
                    'enum' => [ 'publish', 'pending', 'draft', 'private' ],
                    'description' => __( 'Product status', 'dokan-lite' ),
                    'default' => 'publish',
                ],
                'vendor_id' => [
                    'type' => 'integer',
                    'description' => __( 'Filter by vendor ID', 'dokan-lite' ),
                ],
                'category' => [
                    'type' => 'integer',
                    'description' => __( 'Filter by category ID', 'dokan-lite' ),
                ],
                'search' => [
                    'type' => 'string',
                    'description' => __( 'Search products by name, description, or SKU', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get product create input schema
     *
     * @return array
     */
    public static function get_product_create_schema() {
        return [
            'type' => 'object',
            'required' => [ 'name', 'vendor_id' ],
            'properties' => [
                'name' => [
                    'type' => 'string',
                    'description' => __( 'Product name', 'dokan-lite' ),
                    'minLength' => 1,
                    'maxLength' => 200,
                ],
                'description' => [
                    'type' => 'string',
                    'description' => __( 'Product description', 'dokan-lite' ),
                ],
                'short_description' => [
                    'type' => 'string',
                    'description' => __( 'Product short description', 'dokan-lite' ),
                ],
                'regular_price' => [
                    'type' => 'string',
                    'description' => __( 'Regular price', 'dokan-lite' ),
                ],
                'sale_price' => [
                    'type' => 'string',
                    'description' => __( 'Sale price', 'dokan-lite' ),
                ],
                'status' => [
                    'type' => 'string',
                    'enum' => [ 'publish', 'pending', 'draft' ],
                    'description' => __( 'Product status', 'dokan-lite' ),
                    'default' => 'draft',
                ],
                'vendor_id' => [
                    'type' => 'integer',
                    'description' => __( 'Vendor ID', 'dokan-lite' ),
                ],
                'categories' => [
                    'type' => 'array',
                    'description' => __( 'Product category IDs', 'dokan-lite' ),
                    'items' => [
                        'type' => 'integer',
                    ],
                ],
                'tags' => [
                    'type' => 'array',
                    'description' => __( 'Product tag IDs', 'dokan-lite' ),
                    'items' => [
                        'type' => 'integer',
                    ],
                ],
                'sku' => [
                    'type' => 'string',
                    'description' => __( 'Product SKU', 'dokan-lite' ),
                ],
                'manage_stock' => [
                    'type' => 'boolean',
                    'description' => __( 'Whether to manage stock', 'dokan-lite' ),
                    'default' => false,
                ],
                'stock_quantity' => [
                    'type' => 'integer',
                    'description' => __( 'Stock quantity', 'dokan-lite' ),
                    'minimum' => 0,
                ],
                'stock_status' => [
                    'type' => 'string',
                    'enum' => [ 'instock', 'outofstock', 'onbackorder' ],
                    'description' => __( 'Stock status', 'dokan-lite' ),
                    'default' => 'instock',
                ],
                'featured_image' => [
                    'type' => 'integer',
                    'description' => __( 'Featured image ID', 'dokan-lite' ),
                ],
                'gallery_images' => [
                    'type' => 'array',
                    'description' => __( 'Gallery image IDs', 'dokan-lite' ),
                    'items' => [
                        'type' => 'integer',
                    ],
                ],
            ],
        ];
    }

    /**
     * Get product update input schema
     *
     * @return array
     */
    public static function get_product_update_schema() {
        return [
            'type' => 'object',
            'required' => [ 'id' ],
            'properties' => [
                'id' => [
                    'type' => 'integer',
                    'description' => __( 'Product ID', 'dokan-lite' ),
                ],
                'name' => [
                    'type' => 'string',
                    'description' => __( 'Product name', 'dokan-lite' ),
                    'minLength' => 1,
                    'maxLength' => 200,
                ],
                'description' => [
                    'type' => 'string',
                    'description' => __( 'Product description', 'dokan-lite' ),
                ],
                'short_description' => [
                    'type' => 'string',
                    'description' => __( 'Product short description', 'dokan-lite' ),
                ],
                'regular_price' => [
                    'type' => 'string',
                    'description' => __( 'Regular price', 'dokan-lite' ),
                ],
                'sale_price' => [
                    'type' => 'string',
                    'description' => __( 'Sale price', 'dokan-lite' ),
                ],
                'status' => [
                    'type' => 'string',
                    'enum' => [ 'publish', 'pending', 'draft', 'private' ],
                    'description' => __( 'Product status', 'dokan-lite' ),
                ],
                'categories' => [
                    'type' => 'array',
                    'description' => __( 'Product category IDs', 'dokan-lite' ),
                    'items' => [
                        'type' => 'integer',
                    ],
                ],
                'tags' => [
                    'type' => 'array',
                    'description' => __( 'Product tag IDs', 'dokan-lite' ),
                    'items' => [
                        'type' => 'integer',
                    ],
                ],
                'sku' => [
                    'type' => 'string',
                    'description' => __( 'Product SKU', 'dokan-lite' ),
                ],
                'manage_stock' => [
                    'type' => 'boolean',
                    'description' => __( 'Whether to manage stock', 'dokan-lite' ),
                ],
                'stock_quantity' => [
                    'type' => 'integer',
                    'description' => __( 'Stock quantity', 'dokan-lite' ),
                    'minimum' => 0,
                ],
                'stock_status' => [
                    'type' => 'string',
                    'enum' => [ 'instock', 'outofstock', 'onbackorder' ],
                    'description' => __( 'Stock status', 'dokan-lite' ),
                ],
                'featured_image' => [
                    'type' => 'integer',
                    'description' => __( 'Featured image ID', 'dokan-lite' ),
                ],
                'gallery_images' => [
                    'type' => 'array',
                    'description' => __( 'Gallery image IDs', 'dokan-lite' ),
                    'items' => [
                        'type' => 'integer',
                    ],
                ],
            ],
        ];
    }

    /**
     * Get product search input schema
     *
     * @return array
     */
    public static function get_product_search_schema() {
        return [
            'type' => 'object',
            'required' => [ 'search' ],
            'properties' => [
                'search' => [
                    'type' => 'string',
                    'description' => __( 'Search term', 'dokan-lite' ),
                    'minLength' => 2,
                ],
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
                'vendor_id' => [
                    'type' => 'integer',
                    'description' => __( 'Filter by vendor ID', 'dokan-lite' ),
                ],
                'category' => [
                    'type' => 'integer',
                    'description' => __( 'Filter by category ID', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get product output schema
     *
     * @return array
     */
    public static function get_product_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'id' => [
                    'type' => 'integer',
                    'description' => __( 'Product ID', 'dokan-lite' ),
                ],
                'name' => [
                    'type' => 'string',
                    'description' => __( 'Product name', 'dokan-lite' ),
                ],
                'slug' => [
                    'type' => 'string',
                    'description' => __( 'Product slug', 'dokan-lite' ),
                ],
                'description' => [
                    'type' => 'string',
                    'description' => __( 'Product description', 'dokan-lite' ),
                ],
                'short_description' => [
                    'type' => 'string',
                    'description' => __( 'Product short description', 'dokan-lite' ),
                ],
                'price' => [
                    'type' => 'string',
                    'description' => __( 'Current price', 'dokan-lite' ),
                ],
                'regular_price' => [
                    'type' => 'string',
                    'description' => __( 'Regular price', 'dokan-lite' ),
                ],
                'sale_price' => [
                    'type' => 'string',
                    'description' => __( 'Sale price', 'dokan-lite' ),
                ],
                'status' => [
                    'type' => 'string',
                    'description' => __( 'Product status', 'dokan-lite' ),
                ],
                'type' => [
                    'type' => 'string',
                    'description' => __( 'Product type', 'dokan-lite' ),
                ],
                'sku' => [
                    'type' => 'string',
                    'description' => __( 'Product SKU', 'dokan-lite' ),
                ],
                'manage_stock' => [
                    'type' => 'boolean',
                    'description' => __( 'Whether stock is managed', 'dokan-lite' ),
                ],
                'stock_quantity' => [
                    'type' => 'integer',
                    'description' => __( 'Stock quantity', 'dokan-lite' ),
                ],
                'stock_status' => [
                    'type' => 'string',
                    'description' => __( 'Stock status', 'dokan-lite' ),
                ],
                'featured' => [
                    'type' => 'boolean',
                    'description' => __( 'Whether product is featured', 'dokan-lite' ),
                ],
                'vendor_id' => [
                    'type' => 'integer',
                    'description' => __( 'Vendor ID', 'dokan-lite' ),
                ],
                'vendor_name' => [
                    'type' => 'string',
                    'description' => __( 'Vendor name', 'dokan-lite' ),
                ],
                'categories' => [
                    'type' => 'array',
                    'description' => __( 'Product categories', 'dokan-lite' ),
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'id' => [
                                'type' => 'integer',
                                'description' => __( 'Category ID', 'dokan-lite' ),
                            ],
                            'name' => [
                                'type' => 'string',
                                'description' => __( 'Category name', 'dokan-lite' ),
                            ],
                            'slug' => [
                                'type' => 'string',
                                'description' => __( 'Category slug', 'dokan-lite' ),
                            ],
                        ],
                    ],
                ],
                'tags' => [
                    'type' => 'array',
                    'description' => __( 'Product tags', 'dokan-lite' ),
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'id' => [
                                'type' => 'integer',
                                'description' => __( 'Tag ID', 'dokan-lite' ),
                            ],
                            'name' => [
                                'type' => 'string',
                                'description' => __( 'Tag name', 'dokan-lite' ),
                            ],
                            'slug' => [
                                'type' => 'string',
                                'description' => __( 'Tag slug', 'dokan-lite' ),
                            ],
                        ],
                    ],
                ],
                'images' => [
                    'type' => 'object',
                    'description' => __( 'Product images', 'dokan-lite' ),
                    'properties' => [
                        'featured' => [
                            'type' => 'object',
                            'description' => __( 'Featured image', 'dokan-lite' ),
                            'properties' => [
                                'id' => [
                                    'type' => 'integer',
                                    'description' => __( 'Image ID', 'dokan-lite' ),
                                ],
                                'src' => [
                                    'type' => 'string',
                                    'description' => __( 'Image URL', 'dokan-lite' ),
                                ],
                                'name' => [
                                    'type' => 'string',
                                    'description' => __( 'Image name', 'dokan-lite' ),
                                ],
                                'alt' => [
                                    'type' => 'string',
                                    'description' => __( 'Image alt text', 'dokan-lite' ),
                                ],
                            ],
                        ],
                        'gallery' => [
                            'type' => 'array',
                            'description' => __( 'Gallery images', 'dokan-lite' ),
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'id' => [
                                        'type' => 'integer',
                                        'description' => __( 'Image ID', 'dokan-lite' ),
                                    ],
                                    'src' => [
                                        'type' => 'string',
                                        'description' => __( 'Image URL', 'dokan-lite' ),
                                    ],
                                    'name' => [
                                        'type' => 'string',
                                        'description' => __( 'Image name', 'dokan-lite' ),
                                    ],
                                    'alt' => [
                                        'type' => 'string',
                                        'description' => __( 'Image alt text', 'dokan-lite' ),
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
                'date_created' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => __( 'Date created', 'dokan-lite' ),
                ],
                'date_modified' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => __( 'Date modified', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get products list output schema
     *
     * @return array
     */
    public static function get_products_list_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'products' => [
                    'type' => 'array',
                    'description' => __( 'List of products', 'dokan-lite' ),
                    'items' => self::get_product_output_schema(),
                ],
                'total' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of products', 'dokan-lite' ),
                ],
                'total_pages' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of pages', 'dokan-lite' ),
                ],
                'current_page' => [
                    'type' => 'integer',
                    'description' => __( 'Current page number', 'dokan-lite' ),
                ],
            ],
        ];
    }
} 