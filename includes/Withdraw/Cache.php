<?php

namespace WeDevs\Dokan\Withdraw;

use WeDevs\Dokan\Cache\CacheHelper;

/**
 * Withdraw Cache class.
 *
 * Manage all of the caches for vendor and admin withdrawal functionalities.
 *
 * @since DOKAN_LITE_SINCE
 *
 * @see \WeDevs\Dokan\Cache\CacheHelper
 */
class Cache extends CacheHelper {

    public $seller_id;
    private $cache_group_admin;
    private $cache_group_seller;

    public function __construct() {
        $this->seller_id          = dokan_get_current_user_id();
        $this->cache_group_admin  = 'dokan_withdraws';
        $this->cache_group_seller = 'dokan_withdraws_seller_' . $this->seller_id;

        add_action( 'dokan_after_withdraw_request', [ $this, 'clear_cache_after_seller_request' ], 10, 3 );
        add_action( 'dokan_withdraw_updated', [ $this, 'clear_cache_after_admin_update' ], 10 );
        add_action( 'dokan_withdraw_status_updated', [ $this, 'delete_seller_balance_cache' ], 10, 3 );
        add_action( 'dokan_withdraw_request_approved', [ $this, 'update_vendor_balance' ], 11 );
    }

    /**
     * Get Withdraw Cache Group Name For Admin.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string $cache_group name
     */
    public function get_admin_cache_group() {
        return $this->cache_group_admin;
    }

    /**
     * Get Withdraw Cache Group Name for Vendor.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string $cache_group name
     */
    public function get_seller_cache_group() {
        return $this->cache_group_seller;
    }

    /**
     * Clear Withdraw Cache Group for Admin.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function clear_admin_cache_group() {
        self::invalidate_cache_group( $this->cache_group_admin );
    }

    /**
     * Clear Withdraw Cache Group for Seller.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param int $seller_id
     *
     * @return void
     */
    public function clear_seller_cache_group( $seller_id = null ) {
        if ( ! empty( $seller_id ) ) {
            $this->seller_id = $seller_id;
        }

        self::invalidate_cache_group( $this->cache_group_seller );
    }

    /**
     * Clear Cache After Seller Withdraw request.
     *
     * @since DOKAN_LITE_SINCE
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
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function clear_cache_after_admin_update() {
        $this->clear_admin_cache_group();
        $this->clear_seller_cache_group();
    }

    /**
     * Delete seller balance cache after a withdraw update.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $status
     * @param int    $seller_id
     * @param int    $id
     *
     * @return void
     */
    public function delete_seller_balance_cache( $status, $seller_id, $id ) {
        $cache_group = $this->cache_group_seller;
        $cache_key   = 'dokan_seller_balance_' . $seller_id;

        wp_cache_delete( $cache_key, $cache_group );
    }

    /**
     * Update vendor balance after approve a request.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param \WeDevs\Dokan\Withdraw\Withdraw $withdraw
     *
     * @return void
     */
    public function update_vendor_balance( $withdraw ) {
        global $wpdb;

        if ( round( dokan_get_seller_balance( $withdraw->get_user_id(), false ), 2 ) < round( $withdraw->get_amount(), 2 ) ) {
            return;
        }

        $balance_result = $wpdb->get_row(
            $wpdb->prepare(
                "select * from {$wpdb->dokan_vendor_balance} where trn_id = %d and trn_type = %s",
                $withdraw->get_id(),
                'dokan_withdraw'
            )
        );

        if ( empty( $balance_result ) ) {
            $wpdb->insert(
                $wpdb->dokan_vendor_balance,
                array(
                    'vendor_id'     => $withdraw->get_user_id(),
                    'trn_id'        => $withdraw->get_id(),
                    'trn_type'      => 'dokan_withdraw',
                    'perticulars'   => 'Approve withdraw request',
                    'debit'         => 0,
                    'credit'        => $withdraw->get_amount(),
                    'status'        => 'approved',
                    'trn_date'      => $withdraw->get_date(),
                    'balance_date'  => current_time( 'mysql' ),
                ),
                array(
                    '%d',
                    '%d',
                    '%s',
                    '%s',
                    '%f',
                    '%f',
                    '%s',
                    '%s',
                    '%s',
                )
            );
        }

        $this->delete_seller_balance_cache( $withdraw->get_status(), $withdraw->get_user_id(), $withdraw->get_id() );
    }
}
