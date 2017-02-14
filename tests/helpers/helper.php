<?php

/**
 * Testing helpers
 */
class Dokan_Test_Helpers {

    public static function create_product( $product_name = 'Dummy Product', $price = 0, $seller_id = 0 ) {
        // Create the product
        $product = wp_insert_post( array(
            'post_title'  => $product_name,
            'post_type'   => 'product',
            'post_status' => 'publish',
            'post_author' => $seller_id
        ) );

        update_post_meta( $product, '_price', $price );
        update_post_meta( $product, '_regular_price', $price );
        update_post_meta( $product, '_sale_price', '' );
        update_post_meta( $product, '_sku', '' );
        update_post_meta( $product, '_manage_stock', 'no' );
        update_post_meta( $product, '_tax_status', '' );
        update_post_meta( $product, '_downloadable', 'yes' );
        update_post_meta( $product, '_virtual', 'yes' );
        update_post_meta( $product, '_visibility', 'visible' );
        update_post_meta( $product, '_stock_status', 'instock' );

        return $product;
    }
}