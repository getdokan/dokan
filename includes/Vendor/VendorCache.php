<?php

namespace WeDevs\Dokan\Vendor;

use WeDevs\Dokan\Cache;
use WeDevs\Dokan\Product\ProductCache;

/**
 * Vendor Cache class.
 *
 * Manage all of the caches for vendor.
 *
 * @since 3.3.2
 *
 * @see \WeDevs\Dokan\Cache
 */
class VendorCache {

    public function __construct() {
        add_action( 'dokan_new_vendor', [ $this, 'clear_cache_group' ], 10 );
        add_action( 'dokan_update_vendor', [ $this, 'clear_cache_group' ], 10 );
        add_action( 'dokan_delete_vendor', [ $this, 'clear_cache_group' ], 10 );
        add_action( 'dokan_vendor_enabled', [ $this, 'clear_cache_group' ], 10 );
        add_action( 'dokan_vendor_disabled', [ $this, 'clear_cache_group' ], 10 );
        add_action( 'dokan_store_profile_saved', [ $this, 'after_update_vendor_profile' ], 10, 2 );

        /* Clear wp-user related caches */
        add_action( 'delete_user', [ $this, 'before_deleting_wp_user' ], 10, 2 ); // this will support both 5.5 and latest wp version

        // Check wp-version, from version 5.8, `$userdata` added.
        if ( version_compare( get_bloginfo( 'version' ), '5.8', '>=' ) ) {
            add_action( 'user_register', [ $this, 'after_created_new_wp_user' ], 10, 2 );
            add_action( 'profile_update', [ $this, 'after_updated_wp_user' ], 10, 3 );
        } else {
            add_action( 'user_register', [ $this, 'after_created_new_wp_user' ], 10, 1 );
            add_action( 'profile_update', [ $this, 'after_updated_wp_user' ], 10, 2 );
        }
    }

    /**
     * Clear vendor cache group.
     *
     * @since 3.3.2
     *
     * @return void
     */
    public static function delete() {
        Cache::invalidate_group( 'vendors' );
    }

    /**
     * Clear Vendor Cache Group.
     *
     * @since 3.3.2
     *
     * @param int $vendor_id
     *
     * @return void
     */
    public function clear_cache_group( $vendor_id ) {
        // Delete vendor cache group
        self::delete();

        // delete product cache for this vendor
        ProductCache::delete( $vendor_id );
    }

    /**
     * Clear Vendor Cache Group after vendor profile update.
     *
     * @since 3.3.2
     *
     * @param int   $store_id
     * @param array $dokan_settings
     *
     * @return void
     */
    public function after_update_vendor_profile( $store_id, $dokan_settings ) {
        // We'll just delete vendor cache group,
        // no need to delete product caches
        self::delete();
    }

    /**
     * Clear Vendor Cache Group after changing wp_user.
     *
     * @since 3.3.5
     *
     * @param int   $user_id
     * @param array $userdata
     *
     * @return void
     */
    private function clear_wp_user_cache( $user_id, $userdata = null ) {
        // If a user is created with seller role, then delete vendor cache.
        if ( ! empty( $userdata ) && ! empty( $userdata['role'] ) && 'seller' === $userdata['role'] ) {
            self::delete();
        } else {
            $user = get_user_by( 'id', $user_id );
            if ( ! $user ) {
                return;
            }

            if ( in_array( 'seller', (array) $user->roles ) ) {
                self::delete();
            }
        }
    }

    /**
     * Clear Vendor Cache Group after new user added to wp user.
     *
     * @since 3.3.2
     *
     * @param int   $user_id
     * @param array $userdata
     *
     * @return void
     */
    public function after_created_new_wp_user( $user_id, $userdata = null ) {
        $this->clear_wp_user_cache( $user_id, $userdata );
    }

    /**
     * Clear Vendor Cache Group after updated wp user.
     *
     * @since 3.3.5
     *
     * @param int   $user_id
     * @param array $old_user_data
     * @param array $userdata
     *
     * @return void
     */
    public function after_updated_wp_user( $user_id, $old_user_data, $userdata = null ) {
        $this->clear_wp_user_cache( $user_id, $userdata );
    }

    /**
     * Clear Vendor Cache Group before deleting wp user.
     *
     * @since 3.3.5
     *
     * @param int   $user_id
     * @param array $reassign
     *
     * @return void
     */
    public function before_deleting_wp_user( $user_id, $reassign ) {
        $this->clear_wp_user_cache( $user_id, null );
    }
}
