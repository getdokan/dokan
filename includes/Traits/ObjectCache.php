<?php

namespace WeDevs\Dokan\Traits;

/**
 * Object Cache trait.
 *
 * Handles Caching underneath functionalities with the help of this Cacheable trait.
 *
 * @since   3.3.2
 *
 * @package WeDevs\Dokan\Abstracts\Traits
 */
trait ObjectCache {

    /**
     * Add Cache Prefix to key.
     *
     * @since 3.3.2
     *
     * @param string $key
     * @param string $group default: ''
     *
     * @return string processed key
     */
    private static function get_cache_key_with_prefix( $key, $group = '' ) {
        // Don't add prefix to non-cacheable groups.
        if ( empty( $group ) ) {
            return static::get_cache_prefix() . '_' . sanitize_key( $key );
        }

        $group = static::get_cache_group_with_prefix( $group );

        $prefix = wp_cache_get( $group . '_prefix', $group );

        if ( false === $prefix ) {
            $prefix = static::get_time_prefix();
            wp_cache_set( $group . '_prefix', $prefix, $group );
        }

        return static::get_cache_prefix() . '_' . $prefix . '_' . sanitize_key( $key );
    }

    /**
     * Get Cache.
     *
     * Example:
     * ```
     * $cache_key   = 'cache_key_name',
     * $cache_group = 'cache_group_name';
     *
     * Cache::get( $cache_key, $cache_group );
     * ```
     *
     * @since 3.3.2
     *
     * @param string $key
     * @param string $group  Optional. Where the cache contents are grouped. Default empty.
     * @param bool   $forced Optional. Whether to force an update of the local cache from the persistent cache. Default false.
     *
     * @return mixed|false
     */
    public static function get( $key, $group = '', $forced = false ) {
        extract( static::get_key_and_group( $key, $group ) ); //phpcs:ignore WordPress.PHP.DontExtract.extract_extract

        if ( empty( $key ) ) {
            return false;
        }

        return wp_cache_get( $key, $group, $forced );
    }

    /**
     * Set Cache.
     *
     * Update the cache. We've added some defaults to set the cache.
     * Like, We set default expiry time, cache group to remove some redundant assign of those data.
     *
     * Example:
     * ```
     * $cache_key    = 'cache_key_name',
     * $cache_group  = 'cache_group_name';
     * $cache_result = Cache::get( $cache_key, $cache_group );
     *
     * if ( false === $cache_result ) {
     *      $cache_result = []; // Calculate & set to to $cache_result
     *      Cache::set( $cache_key, $cache_result, $cache_group );
     * }
     * ```
     *
     * @since 3.3.2
     *
     * @param string $key
     * @param mixed  $value
     * @param string $group  default: ``;                    eg: `products`, `employees`
     * @param int    $expire default: `WEEK_IN_SECONDS * 2`; eg: 120, DAY_IN_SECONDS
     *
     * @return bool
     */
    public static function set( $key, $value, $group = '', $expire = WEEK_IN_SECONDS * 2 ) {
        extract( static::get_key_and_group( $key, $group ) ); //phpcs:ignore WordPress.PHP.DontExtract.extract_extract

        if ( empty( $key ) ) {
            return false;
        }

        return wp_cache_set( $key, $value, $group, $expire );
    }

    /**
     * Delete Cache by key and group.
     *
     * Example:
     * ```
     * Cache::delete( 'cache_key_name', 'cache_group_name' );
     * ```
     *
     * @since 3.3.2
     *
     * @param string $key   The key under which to store the value.
     * @param string $group The group value appended to the $key.
     * @param int    $time  The amount of time the server will wait to delete the item in seconds.
     *
     * @return bool
     */
    public static function delete( $key, $group = '', $time = 0 ) {
        extract( static::get_key_and_group( $key, $group ) ); //phpcs:ignore WordPress.PHP.DontExtract.extract_extract

        if ( empty( $key ) ) {
            return false;
        }

        $deleted = wp_cache_delete( $key, $group, $time );

        /**
		 * Action hook to notify that cache has been deleted.
		 *
		 * @since 4.0.2
		 *
		 * @param string $key   The key under which the value is stored.
		 * @param string $group The group value appended to the $key.
		 * @param int    $time  The amount of time the server will wait to delete the item in seconds.
		 */
        do_action( 'dokan_cache_deleted', $key, $group, $time );

        return $deleted;
    }

    /**
     * Invalidate cache group at once by group name.
     *
     * Example:
     * ```
     * Cache::invalidate_group( 'group_name' );
     * ```
     *
     * @since 3.3.2
     *
     * @param string $group Group of caches to clear.
     *
     * @return bool
     */
    public static function invalidate_group( $group ) {
        $group = static::get_cache_group_with_prefix( $group );

        $supported = wp_cache_supports( 'flush_group' );
        if ( $supported ) {
            wp_cache_flush_group( $group . '_prefix' );
        }

        return wp_cache_set( $group . '_prefix', static::get_time_prefix(), $group );
    }

    /**
     * Get Cache Key and Group with Prefix added.
     *
     * @since 3.3.2
     *
     * @param string $key
     * @param string $group
     *
     * @return array
     */
    private static function get_key_and_group( $key, $group ) {
        $key   = static::get_cache_key_with_prefix( $key, $group );
        $group = static::get_cache_group_with_prefix( $group );

        return [
            'key'   => $key,
            'group' => $group,
        ];
    }
}
