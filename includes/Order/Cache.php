<?php

namespace WeDevs\Dokan\Order;

use WeDevs\Dokan\Cache\CacheHelper;

/**
 * Order Cache class.
 *
 * Manage all caches for order related functionalities.
 *
 * @since DOKAN_LITE_SINCE
 *
 * @see \WeDevs\Dokan\Cache\CacheHelper
 */
class Cache extends CacheHelper {

    public function __construct() {
        add_action( 'dokan_checkout_update_order_meta', [ $this, 'reset_seller_order_data' ], 10, 2 );
        add_action( 'woocommerce_order_status_changed', [ $this, 'reset_seller_order_data' ], 10, 4 );
        add_action( 'woocommerce_update_order', [ $this, 'reset_cache_on_update_order' ] );
        add_action( 'woocommerce_order_refunded', [ $this, 'reset_cache_on_update_order' ] );
    }

    /**
     * Reset cache group related to seller orders.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param int $order_id
     * @param int $seller_id
     *
     * @return void
     */
    public static function reset_seller_order_data( $order_id, $seller_id ) {
        self::invalidate_cache_group( 'dokan_seller_data_' . $seller_id );

        // Remove cached seller_id after an woocommerce order
        wp_cache_delete( 'dokan_get_seller_id_' . $order_id, 'dokan_get_seller_id_by_order' );
    }

    /**
     * Reset cache data on update woocomerce order.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param int $order_id
     *
     * @return void
     */
    public static function reset_cache_on_update_order( $order_id ) {
        $seller_id = dokan_get_seller_id_by_order( $order_id );

        self::reset_seller_order_data( $order_id, $seller_id );
    }
}
