<?php

namespace WeDevs\Dokan\Abstracts;

use WeDevs\Dokan\Abstracts\Traits\ObjectCache;
use WeDevs\Dokan\Abstracts\Traits\TransientCache;

/**
 * Cache class.
 *
 * Manage all of the caches of your WordPress plugin and handles it beautifully.
 *
 * @since DOKAN_LITE_SINCE
 *
 * @package WeDevs\Dokan\Abstracts\Cache
 */
abstract class DokanCache {

    use ObjectCache, TransientCache;

    /**
     * Get Cache Group Prefix.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string
     */
    abstract protected static function get_cache_group_prefix();

    /**
     * Get Cache Key Prefix.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string
     */
    abstract protected static function get_cache_prefix();

    /**
     * Add Cache Group Prefix to group.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $group
     *
     * @return string
     */
    private static function get_cache_group_with_prefix( $group ) {
        // Add prefix to group.
        return empty( $group ) ? '' : static::get_cache_group_prefix() . '_' . sanitize_key( $group );
    }
}
