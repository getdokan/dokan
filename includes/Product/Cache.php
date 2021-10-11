<?php

namespace WeDevs\Dokan\Product;

use WeDevs\Dokan\Cache\CacheHelper;

/**
 * Product Cache class.
 *
 * Manage all caches for products.
 *
 * @since DOKAN_LITE_SINCE
 *
 * @see \WeDevs\Dokan\Cache\CacheHelper
 */
class Cache extends CacheHelper {

    public function __construct() {
        add_action( 'dokan_new_product_added', [ $this, 'clear_seller_product_caches' ], 20, 2 );
        add_action( 'dokan_product_updated', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'dokan_product_updated', [ $this, 'clear_single_product_caches' ], 20 );
        add_action( 'dokan_product_duplicate_after_save', [ $this, 'clear_seller_product_caches' ], 20, 3 );
        add_action( 'dokan_product_deleted', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'dokan_bulk_product_status_change', [ $this, 'cache_clear_bulk_product_status_change' ], 20, 2 );
        add_action( 'dokan_bulk_product_delete', [ $this, 'clear_seller_product_caches' ], 20 );

        add_action( 'woocommerce_product_duplicate', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'woocommerce_update_product', [ $this, 'clear_seller_product_caches' ], 20 );
        add_action( 'woocommerce_product_import_inserted_product_object', [ $this, 'clear_seller_product_caches' ], 20 );
    }

    /**
     * Reset cache group related to seller products.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param int   $product_id
     * @param array $post_data
     *
     * @return void
     */
    public static function clear_seller_product_caches( $product_id, $post_data = [] ) {
        $seller_id = dokan_get_current_user_id();

        self::invalidate_cache_group( 'dokan_cache_seller_product_data_' . $seller_id );
        self::invalidate_cache_group( 'dokan_cache_seller_product_stock_data_' . $seller_id );
    }


    /**
     * Clear Single Product Caches.
     *
     * We'll be calling `WC_Product_Data_Store_CPT::clear_caches()` to clear product caches.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param int|\WC_Product $product
     *
     * @return void
     */
    public static function clear_single_product_caches( $product ) {
        if ( ! $product instanceof \WC_Product ) {
            $product = wc_get_product( $product );
        }

        if ( $product instanceof \WC_Product ) {
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
        }
    }

    /**
     * Clear Cache on bulk product status change.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param  string $status
     * @param  array  $products
     *
     * @return void
     */
    public function cache_clear_bulk_product_status_change( $status, $products ) {
        foreach ( $products  as $product ) {
            self::clear_single_product_caches( $product );
        }

        self::clear_seller_product_caches( null, [] );
    }
}
