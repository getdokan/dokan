<?php

namespace WeDevs\Dokan\Product;

use WeDevs\Dokan\Cache;

/**
 * Product Cache class.
 *
 * Manage all caches for products.
 *
 * @since 3.3.2
 *
 * @see \WeDevs\Dokan\Cache
 */
class ProductCache {

    public function __construct() {
        add_action( 'dokan_new_product_added', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'dokan_product_updated', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'dokan_product_deleted', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'dokan_product_duplicate_after_save', [ $this, 'clear_seller_product_caches' ], 20 );

        add_action( 'woocommerce_new_product', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'woocommerce_update_product', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'woocommerce_product_duplicate', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'woocommerce_product_import_inserted_product_object', [ $this, 'clear_seller_product_caches' ], 20 );

        add_action( 'wp_trash_post', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'delete_post', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'woocommerce_attribute_updated', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'woocommerce_attribute_deleted', [ $this, 'clear_seller_product_caches' ], 20 );

        add_action( 'dokan_product_updated', [ $this, 'clear_single_product_caches' ], 20 );
        add_action( 'dokan_bulk_product_status_change', [ $this, 'cache_clear_bulk_product_status_change' ], 20, 2 );
    }

    /**
     * Reset cache group related to seller products.
     *
     * @since 3.3.2
     *
     * @param int|\WC_Product $product
     *
     * @return void
     */
    public function clear_seller_product_caches( $product ) {
        // some hooks can return product object also, making sure we are getting id only
        if ( ! $product instanceof \WC_Product ) {
            $product = wc_get_product( $product );
        }

        if ( ! $product instanceof \WC_Product ) {
            return;
        }

        // Delete caches for this product taxonomy.
        $this->clear_single_product_taxonomy_caches( $product );
        $seller_id = get_post_field( 'post_author', $product->get_id() );
        self::delete( $seller_id );
    }

    /**
     * Delete cache group related to seller products.
     *
     * @since 3.3.2
     *
     * @param int $seller_id
     *
     * @return void
     */
    public static function delete( $seller_id ) {
        Cache::invalidate_group( 'product_data' );
        Cache::invalidate_group( "seller_product_data_{$seller_id}" );
        Cache::invalidate_group( "seller_product_stock_data_{$seller_id}" );
        Cache::invalidate_transient_group( "seller_product_data_{$seller_id}" );
    }

    /**
     * Clear Single Product Caches.
     *
     * We'll be calling `WC_Product_Data_Store_CPT::clear_caches()` to clear product caches.
     *
     * @since 3.3.2
     *
     * @param int|\WC_Product $product
     *
     * @return void
     */
    public function clear_single_product_caches( $product ) {
        if ( ! $product instanceof \WC_Product ) {
            $product = wc_get_product( $product );
        }

        if ( ! $product instanceof \WC_Product ) {
            return;
        }

        // Delete caches for wp-post and post-meta for this product.
        wp_cache_delete( $product->get_id(), 'posts' );
        wp_cache_delete( $product->get_id(), 'post_meta' );

        // Delete caches for this product taxonomy.
        $this->clear_single_product_taxonomy_caches( $product );
        try {
            $store       = \WC_Data_Store::load( 'product-' . $product->get_type() );
            $class       = $store->get_current_class_name();
            $class       = is_object( $class ) ? $class : new $class();
            $reflection  = new \ReflectionClass( $class );
            $method_name = 'clear_caches';

            if ( ! $reflection->hasMethod( $method_name ) ) {
                return;
            }

            $method = $reflection->getMethod( $method_name );
            $method->setAccessible( true );
            $method->invokeArgs( $class, [ &$product ] );
        } catch ( \Exception $e ) {
            return;
        }
    }

    /**
     * Clear Single Product taxonomy Caches.
     *
     * @since 3.5.0
     *
     * @param int|\WC_Product $product
     *
     * @return void
     */
    public function clear_single_product_taxonomy_caches( $product ) {
        if ( ! $product instanceof \WC_Product ) {
            $product = wc_get_product( $product );
        }

        if ( ! $product instanceof \WC_Product ) {
            return;
        }

        $vendor_id = dokan_get_vendor_by_product( $product, true );
        $transient_group = "seller_taxonomy_widget_data_{$vendor_id}";

        Cache::invalidate_transient_group( $transient_group );
    }

    /**
     * Clear Cache on bulk product status change.
     *
     * @since 3.3.2
     *
     * @param  string $status
     * @param  array  $products
     *
     * @return void
     */
    public function cache_clear_bulk_product_status_change( $status, $products ) {
        // for delete action, separate hooks will be called
        if ( 'delete' === $status || empty( $products ) ) {
            return;
        }

        foreach ( $products  as $product_id ) {
            $this->clear_single_product_caches( $product_id );
            $this->clear_seller_product_caches( $product_id );
            // Delete caches for this product taxonomy.
            $this->clear_single_product_taxonomy_caches( $product_id );
        }
    }
}
