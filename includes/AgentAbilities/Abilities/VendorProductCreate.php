<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;

/**
 * dokan-vendor/product-create — vendor creates a product on their own store.
 *
 * Auth: vendor only. The created product is assigned to the current user
 * (resolved via dokan_get_current_user_id() so vendor staff create products
 * under the parent vendor). Status defaults to "pending" so marketplace
 * approval workflows still apply.
 */
class VendorProductCreate {

    const NAME = 'dokan-vendor/product-create';

    public static function definition(): array {
        return [
            'label'               => __( 'Create Product (Vendor)', 'dokan-lite' ),
            'description'         => __( 'Create a new product on your own vendor store. The product is assigned to you automatically and starts in pending status if the marketplace requires approval.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'title'             => [ 'type' => 'string', 'required' => true, 'minLength' => 2 ],
                    'description'       => [ 'type' => 'string' ],
                    'short_description' => [ 'type' => 'string' ],
                    'price'             => [ 'type' => 'number', 'minimum' => 0 ],
                    'sale_price'        => [ 'type' => 'number', 'minimum' => 0 ],
                    'sku'               => [ 'type' => 'string' ],
                    'stock_quantity'    => [ 'type' => 'integer', 'minimum' => 0 ],
                    'stock_status'      => [ 'type' => 'string', 'enum' => [ 'instock', 'outofstock', 'onbackorder' ], 'default' => 'instock' ],
                    'categories'        => [ 'type' => 'array', 'items' => [ 'type' => 'string' ], 'description' => __( 'Category slugs.', 'dokan-lite' ) ],
                    'tags'              => [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ],
                ],
                'required'   => [ 'title' ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'id'      => [ 'type' => 'integer' ],
                    'title'   => [ 'type' => 'string' ],
                    'status'  => [ 'type' => 'string' ],
                    'edit_url' => [ 'type' => 'string' ],
                    'view_url' => [ 'type' => 'string' ],
                    'message' => [ 'type' => 'string' ],
                ],
            ],
            'execute_callback'    => [ self::class, 'execute' ],
            'permission_callback' => [ Permissions::class, 'vendor_only' ],
            'meta'                => [
                'annotations'  => [ 'destructive' => false ],
                'show_in_rest' => true,
            ],
        ];
    }

    public static function execute( $input ) {
        $vendor_id = function_exists( 'dokan_get_current_user_id' )
            ? (int) dokan_get_current_user_id()
            : (int) get_current_user_id();

        if ( ! $vendor_id || ! function_exists( 'dokan_is_user_seller' ) || ! dokan_is_user_seller( $vendor_id ) ) {
            return new \WP_Error( 'not_a_vendor', __( 'Only vendors can create products.', 'dokan-lite' ) );
        }

        if ( empty( $input['title'] ) ) {
            return new \WP_Error( 'missing_title', __( 'Product title is required.', 'dokan-lite' ) );
        }

        $approval_required = 'on' === dokan_get_option( 'product_status', 'dokan_selling', 'on' );
        $status            = $approval_required ? 'pending' : 'publish';

        $post_id = wp_insert_post( [
            'post_title'   => sanitize_text_field( $input['title'] ),
            'post_content' => isset( $input['description'] ) ? wp_kses_post( $input['description'] ) : '',
            'post_excerpt' => isset( $input['short_description'] ) ? wp_kses_post( $input['short_description'] ) : '',
            'post_type'    => 'product',
            'post_status'  => $status,
            'post_author'  => $vendor_id,
        ], true );

        if ( is_wp_error( $post_id ) ) {
            return $post_id;
        }

        wp_set_object_terms( $post_id, 'simple', 'product_type' );

        $product = wc_get_product( $post_id );
        if ( ! $product ) {
            return new \WP_Error( 'create_failed', __( 'Could not load the created product.', 'dokan-lite' ) );
        }

        if ( isset( $input['price'] ) ) {
            $product->set_regular_price( (string) $input['price'] );
            $product->set_price( (string) $input['price'] );
        }
        if ( isset( $input['sale_price'] ) && (float) $input['sale_price'] > 0 ) {
            $product->set_sale_price( (string) $input['sale_price'] );
        }
        if ( ! empty( $input['sku'] ) ) {
            $product->set_sku( sanitize_text_field( $input['sku'] ) );
        }
        if ( isset( $input['stock_quantity'] ) ) {
            $product->set_manage_stock( true );
            $product->set_stock_quantity( (int) $input['stock_quantity'] );
        }
        if ( isset( $input['stock_status'] ) ) {
            $product->set_stock_status( sanitize_key( $input['stock_status'] ) );
        }

        $product->save();

        if ( ! empty( $input['categories'] ) ) {
            $term_ids = [];
            foreach ( (array) $input['categories'] as $slug ) {
                $term = get_term_by( 'slug', sanitize_title( $slug ), 'product_cat' );
                if ( $term ) {
                    $term_ids[] = (int) $term->term_id;
                }
            }
            if ( $term_ids ) {
                wp_set_object_terms( $post_id, $term_ids, 'product_cat' );
            }
        }

        if ( ! empty( $input['tags'] ) ) {
            $tag_terms = array_map( 'sanitize_text_field', (array) $input['tags'] );
            wp_set_object_terms( $post_id, $tag_terms, 'product_tag' );
        }

        do_action( 'dokan_new_product_added', $post_id, $input );

        return [
            'id'      => (int) $post_id,
            'title'   => (string) get_the_title( $post_id ),
            'status'  => (string) get_post_status( $post_id ),
            'edit_url' => function_exists( 'dokan_edit_product_url' ) ? (string) dokan_edit_product_url( $post_id ) : '',
            'view_url' => (string) get_permalink( $post_id ),
            'message' => $approval_required
                ? __( 'Product created and submitted for marketplace approval.', 'dokan-lite' )
                : __( 'Product created and published.', 'dokan-lite' ),
        ];
    }
}
