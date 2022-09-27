<?php

namespace WeDevs\Dokan\Order;

use WeDevs\Dokan\Cache;
use WeDevs\Dokan\Withdraw\WithdrawCache;

/**
 * Order Cache class.
 *
 * Manage all caches for order related functionalities.
 *
 * @since 3.3.2
 *
 * @see   \WeDevs\Dokan\Cache
 */
class OrderCache {

    public function __construct() {
        add_action( 'dokan_checkout_update_order_meta', [ $this, 'reset_seller_order_data' ], 10, 2 );
        add_action( 'woocommerce_order_status_changed', [ $this, 'reset_order_cache' ], 10 );
        add_action( 'woocommerce_new_order', [ $this, 'reset_order_cache' ], 10, 1 );
        add_action( 'woocommerce_update_order', [ $this, 'reset_order_cache' ], 10 );
        add_action( 'woocommerce_order_refunded', [ $this, 'reset_order_cache' ], 10 );

        add_action( 'wp_trash_post', [ $this, 'reset_cache_before_deleting_order' ], 20 );
        add_action( 'before_delete_post', [ $this, 'reset_cache_before_deleting_order' ], 20 );
    }

    /**
     * Delete order cache
     *
     * @since 3.3.2
     *
     * @param int      $seller_id
     * @param int|null $order_id
     *
     * @return void
     */
    public static function delete( $seller_id, $order_id = null ) {
        Cache::invalidate_group( 'seller_order_data' );
        Cache::invalidate_group( "seller_order_data_{$seller_id}" );

        // Remove cached seller_id after an woocommerce order
        if ( ! empty( $order_id ) ) {
            Cache::delete( "get_seller_id_by_order_{$order_id}" );
        }

        // Remove withdraw cache
        WithdrawCache::delete( $seller_id );

        // delete report cache
        Cache::invalidate_transient_group( "report_data_seller_{$seller_id}" );
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
    public function reset_seller_order_data( $order_id, $seller_id ) {
        self::delete( $seller_id, $order_id );
    }

    /**
     * Reset cache data on update WooCommerce order.
     *
     * @since 3.3.2
     *
     * @param int $order_id
     *
     * @return void
     */
    public function reset_order_cache( $order_id ) {
        $seller_id = dokan_get_seller_id_by_order( $order_id );
        self::delete( $seller_id, $order_id );
    }

    /**
     * Reset cache data on deleting WooCommerce order.
     *
     * @since 3.3.2
     *
     * @param int $order_id
     *
     * @return void
     */
    public function reset_cache_before_deleting_order( $order_id ) {
        // wp_trash_post and delete_post is generic hooks and will be called for each product delete
        // we are making sure $order_id is a valid order
        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return;
        }

        $seller_id = dokan_get_seller_id_by_order( $order_id );

        self::delete( $seller_id, $order_id );
    }
}
