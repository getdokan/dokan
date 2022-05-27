<?php

namespace WeDevs\Dokan;

use WeDevs\Dokan\Abstracts\DokanCache;

/**
 * Cache Helper class.
 *
 * Manage all of the caches of Dokan and handles it beautifully.
 *
 * @since 3.3.2
 */
class Cache extends DokanCache {

    /**
     * Set Cache Group Prefix.
     *
     * @since 3.3.2
     *
     * @param string $cache_group_prefix
     *
     * @return string
     */
    protected static function get_cache_group_prefix() {
        return 'dokan_cache';
    }

    /**
     * Get Cache Key Prefix.
     *
     * @since 3.3.2
     *
     * @return string
     */
    protected static function get_cache_prefix() {
        return 'dokan';
    }
}
