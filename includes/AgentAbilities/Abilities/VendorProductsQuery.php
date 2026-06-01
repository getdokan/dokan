<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;
use WeDevs\Dokan\AgentAbilities\Schemas;

/**
 * dokan/vendor-products-query — products filtered by vendor.
 */
class VendorProductsQuery {

    const NAME = 'dokan/vendor-products-query';

    public static function definition(): array {
        return [
            'label'               => __( 'List Vendor Products', 'dokan-lite' ),
            'description'         => __( 'List products belonging to a specific vendor with optional search, category, and stock filters.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => array_merge(
                    [
                        'vendor_id' => [ 'type' => 'integer', 'description' => __( 'Vendor (user) ID.', 'dokan-lite' ), 'required' => true ],
                        'search'    => [ 'type' => 'string' ],
                        'category'  => [ 'type' => 'string', 'description' => __( 'Category slug.', 'dokan-lite' ) ],
                        'stock'     => [ 'type' => 'string', 'enum' => [ 'any', 'instock', 'outofstock' ], 'default' => 'any' ],
                    ],
                    Schemas::pagination()
                ),
                'required'   => [ 'vendor_id' ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'products' => [ 'type' => 'array', 'items' => Schemas::product_summary() ],
                    'total'    => [ 'type' => 'integer' ],
                    'page'     => [ 'type' => 'integer' ],
                ],
            ],
            'execute_callback'    => [ self::class, 'execute' ],
            'permission_callback' => [ Permissions::class, 'public_read' ],
            'meta'                => [
                'annotations'  => [ 'readonly' => true, 'idempotent' => true ],
                'show_in_rest' => true,
            ],
        ];
    }

    public static function execute( $input ) {
        $vendor_id = isset( $input['vendor_id'] ) ? (int) $input['vendor_id'] : 0;
        if ( $vendor_id <= 0 ) {
            return new \WP_Error( 'invalid_vendor', __( 'A valid vendor_id is required.', 'dokan-lite' ) );
        }

        $args = [
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'author'         => $vendor_id,
            'posts_per_page' => isset( $input['per_page'] ) ? (int) $input['per_page'] : 20,
            'paged'          => isset( $input['page'] ) ? (int) $input['page'] : 1,
        ];

        if ( ! empty( $input['search'] ) ) {
            $args['s'] = sanitize_text_field( $input['search'] );
        }

        if ( ! empty( $input['category'] ) ) {
            $args['tax_query'][] = [
                'taxonomy' => 'product_cat',
                'field'    => 'slug',
                'terms'    => sanitize_title( $input['category'] ),
            ];
        }

        if ( isset( $input['stock'] ) && in_array( $input['stock'], [ 'instock', 'outofstock' ], true ) ) {
            $args['meta_query'][] = [
                'key'   => '_stock_status',
                'value' => $input['stock'],
            ];
        }

        $query    = new \WP_Query( $args );
        $products = [];

        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( ! $product ) {
                continue;
            }
            $vendor     = function_exists( 'dokan_get_vendor_by_product' ) ? dokan_get_vendor_by_product( $product ) : dokan_get_vendor( $vendor_id );
            $products[] = [
                'id'           => (int) $product->get_id(),
                'title'        => (string) $product->get_name(),
                'url'          => (string) get_permalink( $product->get_id() ),
                'price'        => (string) $product->get_price(),
                'currency'     => get_woocommerce_currency(),
                'sku'          => (string) $product->get_sku(),
                'stock_status' => (string) $product->get_stock_status(),
                'vendor_id'    => $vendor ? (int) $vendor->get_id() : (int) $vendor_id,
                'vendor_name'  => $vendor ? (string) $vendor->get_shop_name() : '',
                'vendor_url'   => $vendor ? (string) $vendor->get_shop_url() : '',
            ];
        }

        return [
            'products' => $products,
            'total'    => (int) $query->found_posts,
            'page'     => (int) $args['paged'],
        ];
    }
}
