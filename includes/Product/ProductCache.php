<?php

namespace WeDevs\Dokan\Product;

use WeDevs\Dokan\Cache\CacheHelper;

/**
 * ProductCache class
 *
 * @since DOKAN_LITE_SINCE
 *
 * Manage all caches for products
 */
class ProductCache extends CacheHelper {

    public function __construct() {
        add_action( 'dokan_new_product_added', [ $this, 'dokan_cache_clear_seller_product_data' ], 20, 2 );
        add_action( 'dokan_product_updated', [ $this, 'dokan_cache_clear_seller_product_data' ], 20 );
        add_action( 'dokan_product_updated', [ $this, 'dokan_clear_product_caches' ], 20 );
        add_action( 'dokan_product_duplicate_after_save', [ $this, 'dokan_cache_clear_seller_product_data' ], 20, 3 );
        add_action( 'dokan_product_deleted', [ $this, 'dokan_cache_clear_seller_product_data' ], 20 );
        add_action( 'dokan_bulk_product_status_change', [ $this, 'dokan_bulk_product_status_change'], 21, 2 );
        add_action( 'dokan_bulk_product_delete', [ $this, 'dokan_cache_clear_seller_product_data'], 21 );

        add_action( 'woocommerce_product_duplicate', [ $this, 'dokan_cache_clear_seller_product_data' ], 20 );
        add_action( 'woocommerce_update_product', [ $this, 'dokan_cache_clear_seller_product_data' ], 20 );
        add_action( 'woocommerce_update_product', [ $this, 'dokan_clear_product_caches' ], 20 );
        add_action( 'woocommerce_product_import_inserted_product_object', [ $this, 'dokan_cache_clear_seller_product_data' ], 20 );
    }

    /**
     * Reset cache group related to seller products
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param int   $product_id
     * @param array $post_data
     *
     * @return void
     */
    public static function dokan_cache_clear_seller_product_data( $product_id, $post_data = [] ) {
        $seller_id = dokan_get_current_user_id();

        self::dokan_cache_clear_group( 'dokan_cache_seller_product_data_' . $seller_id );
        self::dokan_cache_clear_group( 'dokan_cache_seller_product_stock_data_' . $seller_id );
    }


    /**
     * Dokan clear product caches.
     *
     * We'll be calling `WC_Product_Data_Store_CPT::clear_caches()` to clear product caches.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param int|\WC_Product $product
     *
     * @return void
     */
    public static function dokan_clear_product_caches( $product ) {
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
     * Bulk Product Status Change
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param  string $status
     * @param  int    $product_id
     *
     * @return void
     */
    public function dokan_bulk_product_status_change( $status, $product_id ) {
        $seller_id = dokan_get_current_user_id();

        self::dokan_cache_clear_group( 'dokan_cache_seller_product_data_' . $seller_id );
    }
}
