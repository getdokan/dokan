<?php

namespace WeDevs\Dokan\Vendor;

use WeDevs\Dokan\Cache\CacheHelper;

/**
 * Vendor Cache class.
 *
 * Manage all of the caches for vendor.
 *
 * @since DOKAN_LITE_SINCE
 *
 * @see \WeDevs\Dokan\Cache\CacheHelper
 */
class Cache extends CacheHelper {

    private $cache_group;

    public function __construct() {
        $this->cache_group = 'dokan_vendors';

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
        self::clear_group( $this->cache_group );
    }

    /**
     * Get Vendor Cache Group Name.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string $cache_group name
     */
    public function get_cache_group() {
        return $this->cache_group;
    }
}
