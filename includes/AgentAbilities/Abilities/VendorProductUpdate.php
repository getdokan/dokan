<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;

/**
 * dokan-vendor/product-update — vendor updates an existing own product.
 *
 * Auth: vendor must own the product. Owner is checked via post_author
 * compared against dokan_get_current_user_id().
 */
class VendorProductUpdate {

    const NAME = 'dokan-vendor/product-update';

    public static function definition(): array {
        return [
            'label'               => __( 'Update Product (Vendor)', 'dokan-lite' ),
            'description'         => __( 'Update price, stock, title, or description on one of your existing products. You can only update products you own.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'product_id'        => [ 'type' => 'integer', 'required' => true ],
                    'title'             => [ 'type' => 'string' ],
                    'description'       => [ 'type' => 'string' ],
                    'short_description' => [ 'type' => 'string' ],
                    'price'             => [ 'type' => 'number', 'minimum' => 0 ],
                    'sale_price'        => [ 'type' => 'number', 'minimum' => 0 ],
                    'stock_quantity'    => [ 'type' => 'integer', 'minimum' => 0 ],
                    'stock_status'      => [ 'type' => 'string', 'enum' => [ 'instock', 'outofstock', 'onbackorder' ] ],
                ],
                'required'   => [ 'product_id' ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'id'      => [ 'type' => 'integer' ],
                    'fields_updated' => [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ],
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

        $product_id = isset( $input['product_id'] ) ? (int) $input['product_id'] : 0;
        if ( $product_id <= 0 ) {
            return new \WP_Error( 'invalid_product', __( 'A valid product_id is required.', 'dokan-lite' ) );
        }

        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            return new \WP_Error( 'product_not_found', __( 'Product not found.', 'dokan-lite' ) );
        }

        $owner_id = (int) get_post_field( 'post_author', $product_id );
        if ( $owner_id !== $vendor_id && ! current_user_can( 'manage_woocommerce' ) ) {
            return new \WP_Error( 'rest_forbidden', __( 'You can only update your own products.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        $updated = [];

        if ( isset( $input['title'] ) ) {
            wp_update_post( [ 'ID' => $product_id, 'post_title' => sanitize_text_field( $input['title'] ) ] );
            $updated[] = 'title';
        }
        if ( isset( $input['description'] ) ) {
            wp_update_post( [ 'ID' => $product_id, 'post_content' => wp_kses_post( $input['description'] ) ] );
            $updated[] = 'description';
        }
        if ( isset( $input['short_description'] ) ) {
            wp_update_post( [ 'ID' => $product_id, 'post_excerpt' => wp_kses_post( $input['short_description'] ) ] );
            $updated[] = 'short_description';
        }
        if ( isset( $input['price'] ) ) {
            $product->set_regular_price( (string) $input['price'] );
            $product->set_price( (string) $input['price'] );
            $updated[] = 'price';
        }
        if ( isset( $input['sale_price'] ) ) {
            $product->set_sale_price( (string) $input['sale_price'] );
            $updated[] = 'sale_price';
        }
        if ( isset( $input['stock_quantity'] ) ) {
            $product->set_manage_stock( true );
            $product->set_stock_quantity( (int) $input['stock_quantity'] );
            $updated[] = 'stock_quantity';
        }
        if ( isset( $input['stock_status'] ) ) {
            $product->set_stock_status( sanitize_key( $input['stock_status'] ) );
            $updated[] = 'stock_status';
        }

        if ( in_array( 'price', $updated, true ) || in_array( 'sale_price', $updated, true ) || in_array( 'stock_quantity', $updated, true ) || in_array( 'stock_status', $updated, true ) ) {
            $product->save();
        }

        if ( empty( $updated ) ) {
            return new \WP_Error( 'nothing_to_update', __( 'No update fields provided.', 'dokan-lite' ) );
        }

        do_action( 'dokan_product_updated', $product_id, $input );

        return [
            'id'             => (int) $product_id,
            'fields_updated' => $updated,
            'message'        => sprintf( __( 'Product updated. Changed %d field(s).', 'dokan-lite' ), count( $updated ) ),
        ];
    }
}
