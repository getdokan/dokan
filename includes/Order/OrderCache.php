<?php

namespace WeDevs\Dokan\Order;

use WeDevs\Dokan\Cache;

/**
 * Order Cache class.
 *
 * Manage all caches for order related functionalities.
 *
 * @since 3.3.2
 *
 * @see \WeDevs\Dokan\Cache
 */
class OrderCache {

    public function __construct() {
        add_action( 'dokan_checkout_update_order_meta', [ $this, 'reset_seller_order_data' ], 10, 2 );
        add_action( 'woocommerce_order_status_changed', [ $this, 'reset_seller_order_data' ], 10, 4 );
        add_action( 'woocommerce_update_order', [ $this, 'reset_cache_on_update_order' ] );
        add_action( 'woocommerce_order_refunded', [ $this, 'reset_cache_on_update_order' ] );
    }

    /**
     * Reset cache group related to seller orders.
     *
     * @since 3.3.2
     *
     * @param int $order_id
     * @param int $seller_id
     *
     * @return void
     */
    public static function reset_seller_order_data( $order_id, $seller_id ) {
        Cache::invalidate_group( "seller_order_data_{$seller_id}" );

        // Remove cached seller_id after an woocommerce order
        Cache::delete( "get_seller_id_by_order_{$order_id}" );
    }

    /**
     * Reset cache data on update woocomerce order.
     *
     * @since 3.3.2
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
