<?php

namespace WeDevs\Dokan\Cache;

/**
 * OrderCache class
 *
 * @since DOKAN_LITE_SINCE
 *
 * Manage all caches for orders
 */
class OrderCache extends CacheHelper {

    public function __construct() {
        add_action( 'dokan_checkout_update_order_meta', [ $this, 'dokan_cache_reset_seller_order_data' ], 10, 2 );
        add_action( 'woocommerce_order_status_changed', [ $this, 'dokan_cache_reset_order_data_on_status' ], 10, 4 );
        add_action( 'woocommerce_update_order', [ $this, 'dokan_cache_reset_on_update_order' ] );
    }

    /**
     * Reset cache group related to seller orders
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param int $order_id
     * @param int $seller_id
     *
     * @return void
     */
    public static function dokan_cache_reset_seller_order_data( $order_id, $seller_id ) {
        self::invalidate_cache_group( 'dokan_seller_data_' . $seller_id );
    }

    /**
     * Reset order data on change status
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param int $order_id
     * @param string $from_status
     * @param string $to_status
     * @param WC_Order $order
     *
     * @return void
     */
    public static function dokan_cache_reset_order_data_on_status( $order_id, $from_status, $to_status, $order ) {
        $seller_id = dokan_get_seller_id_by_order( $order_id );
        self::invalidate_cache_group( 'dokan_seller_data_' . $seller_id );
    }

    /**
     * Reset order data on update order
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param int $order_id
     *
     * @return void
     */
    public static function dokan_cache_reset_on_update_order( $order_id ) {
        $seller_id = dokan_get_seller_id_by_order( $order_id );
        wp_cache_delete('dokan-count-orders-' . $seller_id, 'dokan_seller_data_' . $seller_id);
    }
}
