<?php

namespace WeDevs\Dokan\Vendor;

use WeDevs\Dokan\Cache\CacheHelper;

/**
 * VendorCache class
 *
 * @since DOKAN_LITE_SINCE
 *
 * Manage all of the caches for vendor
 */
class VendorCache extends CacheHelper {

    private $cache_group;

    public function __construct() {
        $this->cache_group = 'dokan_vendors';

        add_action( 'dokan_new_vendor', [ $this, 'clear_cache_group' ] );
        add_action( 'dokan_update_vendor', [ $this, 'clear_cache_group' ] );
        add_action( 'dokan_delete_vendor', [ $this, 'clear_cache_group' ] );
        add_action( 'dokan_vendor_enabled', [ $this, 'clear_cache_group' ] );
        add_action( 'dokan_vendor_disabled', [ $this, 'clear_cache_group' ] );
    }

    public function clear_cache_group( $vendor_id = null )
    {
        self::dokan_cache_clear_group( $this->cache_group );
    }

    public function get_cache_group() {
        return $this->cache_group;
    }
}
