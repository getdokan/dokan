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
        add_action( 'dokan_new_vendor', [ $this, 'clear_cache_group' ] );
        add_action( 'dokan_update_vendor', [ $this, 'clear_cache_group' ] );
        add_action( 'dokan_delete_vendor', [ $this, 'clear_cache_group' ] );
        add_action( 'dokan_vendor_enabled', [ $this, 'clear_cache_group' ] );
        add_action( 'dokan_vendor_disabled', [ $this, 'clear_cache_group' ] );
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
        Cache::invalidate_group( 'vendors' );
        // delete product cache for this vendor
        ProductCache::delete( $vendor_id );
    }
}
