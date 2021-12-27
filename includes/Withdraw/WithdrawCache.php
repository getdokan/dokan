<?php

namespace WeDevs\Dokan\Withdraw;

use WeDevs\Dokan\Cache;

/**
 * Withdraw Cache class.
 *
 * Manage all of the caches for vendor and admin withdrawal functionalities.
 *
 * @since 3.3.2
 *
 * @see \WeDevs\Dokan\Cache
 */
class WithdrawCache {

    public function __construct() {
        // after withdraw request is created
        add_action( 'dokan_after_withdraw_request', [ $this, 'withdraw_request_created' ], 10, 3 );
        // after withdraw status is updated
        add_action( 'dokan_withdraw_status_updated', [ $this, 'withdraw_status_updated' ], 10, 3 );

        // this will handle dokan_withdraw_request_(pending/approved/cancelled) hooks
        add_action( 'dokan_withdraw_updated', [ $this, 'invalidate_withdraw_cache' ], 10 );
        // after withdraw request is deleted
        add_action( 'dokan_withdraw_deleted', [ $this, 'invalidate_withdraw_cache' ], 10 );
    }

    /**
     * Clear Withdraw Cache Group for Seller.
     *
     * @since 3.3.2
     *
     * @param int $seller_id
     *
     * @return void
     */
    public static function delete( $seller_id ) {
        $cache_group = "withdraws_seller_$seller_id";
        Cache::invalidate_group( $cache_group );
        Cache::invalidate_group( 'withdraws' );
    }

    /**
     * Clear Cache After Seller Withdraw request.
     *
     * @since 3.3.2
     *
     * @param  int    $seller_id
     * @param  float  $amount
     * @param  string $method
     *
     * @return void
     */
    public function withdraw_request_created( $seller_id, $amount, $method ) {
        static::delete( $seller_id );
    }

    /**
     * Delete seller balance cache after a withdraw status is update.
     *
     * @since 3.3.2
     *
     * @param string $status
     * @param int    $seller_id
     * @param int    $id
     *
     * @return void
     */
    public function withdraw_status_updated( $status, $seller_id, $id ) {
        static::delete( $seller_id );
    }

    /**
     * Handle cache on Approve/Reject withdraw request.
     *
     * @since 3.3.2
     *
     * @param Withdraw $withdraw
     *
     * @return void
     */
    public function invalidate_withdraw_cache( $withdraw ) {
        $seller_id = $withdraw->get_user_id();
        static::delete( $seller_id );
    }
}
