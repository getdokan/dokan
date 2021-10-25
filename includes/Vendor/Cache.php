<?php

namespace WeDevs\Dokan\Vendor;

use WeDevs\Dokan\Cache as DokanCache;

/**
 * Vendor Cache class.
 *
 * Manage all of the caches for vendor.
 *
 * @since DOKAN_LITE_SINCE
 *
 * @see \WeDevs\Dokan\Cache
 */
class Cache {

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
     * @since DOKAN_LITE_SINCE
     *
     * @param int $vendor_id
     *
     * @return void
     */
    public function clear_cache_group( $vendor_id = null ) {
        DokanCache::invalidate_group( 'dokan_cache_vendors' );
    }
}
