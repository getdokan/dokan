<?php

namespace WeDevs\Dokan\Withdraw;

use WeDevs\Dokan\Cache as DokanCache;

/**
 * Withdraw Cache class.
 *
 * Manage all of the caches for vendor and admin withdrawal functionalities.
 *
 * @since 3.3.2
 *
 * @see \WeDevs\Dokan\Cache
 */
class Cache {

    /**
     * Admin Cache Group Name
     *
     * @var string
     */
    const CACHE_GROUP_ADMIN = 'withdraws';

    public function __construct() {
        add_action( 'dokan_after_withdraw_request', [ $this, 'clear_cache_after_seller_request' ], 10, 3 );
        add_action( 'dokan_withdraw_updated', [ $this, 'clear_cache_after_admin_update' ], 10 );
        add_action( 'dokan_withdraw_status_updated', [ $this, 'delete_seller_balance_cache' ], 10, 3 );

        add_action( 'dokan_withdraw_request_approved', [ $this, 'handle_withdraw_request_approval' ], 11 );
    }

    /**
     * Clear Withdraw Cache Group for Admin.
     *
     * @since 3.3.2
     *
     * @return void
     */
    public function clear_admin_cache_group() {
        DokanCache::invalidate_group( self::CACHE_GROUP_ADMIN );
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
    public function clear_seller_cache_group( $seller_id ) {
        $cache_group = 'withdraws_seller_' . $seller_id;
        DokanCache::invalidate_group( $cache_group );
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
    public function clear_cache_after_seller_request( $seller_id, $amount, $method ) {
        $this->clear_seller_cache_group( $seller_id );
        $this->clear_admin_cache_group();
    }

    /**
     * Clear Cache After Update Withdraws by admin.
     *
     * @since 3.3.2
     *
     * @param Withdraw $withdraw
     *
     * @return void
     */
    public function clear_cache_after_admin_update( $withdraw ) {
        $this->clear_admin_cache_group();

        $seller_id = $withdraw->get_user_id();
        $this->clear_seller_cache_group( $seller_id );
    }

    /**
     * Delete seller balance cache after a withdraw update.
     *
     * @since 3.3.2
     *
     * @param string $status
     * @param int    $seller_id
     * @param int    $id
     *
     * @return void
     */
    public function delete_seller_balance_cache( $status, $seller_id, $id ) {
        $cache_group = 'withdraws_seller_' . $seller_id;
        $cache_key   = 'seller_balance_' . $seller_id;

        DokanCache::delete( $cache_key, $cache_group );
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
    public function handle_withdraw_request_approval( $withdraw ) {
        $seller_id = $withdraw->get_user_id();

        $this->delete_seller_balance_cache( null, $seller_id, null );
        $this->clear_seller_cache_group( $seller_id );
    }
}
