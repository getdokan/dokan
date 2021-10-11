<?php

namespace WeDevs\Dokan\Cache;

defined( 'ABSPATH' ) || exit;

/**
 * Cache Helper class.
 *
 * Manage all of the caches of Dokan and handles caches beautifully.
 *
 * @since DOKAN_LITE_SINCE
 */
class CacheHelper {

    /**
	 * Get transient version.
	 *
	 * When using transients with unpredictable names, e.g. those containing an md5
	 * hash in the name, we need a way to invalidate them all at once.
	 *
	 * When using default WP transients we're able to do this with a DB query to
	 * delete transients manually.
	 *
	 * With external cache however, this isn't possible. Instead, this function is used
	 * to append a unique string (based on time()) to each transient. When transients
	 * are invalidated, the transient version will increment and data will be regenerated
     *
     * @since  DOKAN_LITE_SINCE
	 *
	 * @param  string             $group   Name for the group of transients we need to invalidate.
	 * @param  bool            $refresh true to force a new version.
     *
	 * @return string|array|false transient version based on time(), 10 digits.
	 */
	public static function get_transient_version( $group, $refresh = false ) {
		$transient_name  = 'dokan-' .  $group . '-transient-version';
		$transient_value = get_transient( $transient_name );

		if ( false === $transient_value || true === $refresh ) {
			$transient_value = (string) time();

			self::dokan_set_transient( $transient_name, $transient_value );
		}

		return $transient_value;
	}

    /**
     * Get Transient value from a key.
     *
     * It applies for oth from Object & Normal data
     * If needs only key value, just pass `$transient_key`
     * If the transient value is an object, and need to get the params of that object
     * then pass the second args `$param`.
     *
     * Examples:
     *
     * Get transient value for a normal key
     * ```
     * CacheHelper::dokan_get_transient( 'transient_key' ); // returns `transient_key` value;
     * ```
     *
     * Get transient value for a group
     * ```
     * CacheHelper::dokan_get_transient( 'transient_key', 'group_name' );
     * ```
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $key    eg: seller_data_[id]
     * @param string $group  eg: null, seller_earnings
     *
     * @return mixed false or Transient value
     */
	public static function dokan_get_transient( $key, $group = null) {
        if ( empty( $group ) ) {
            return get_transient( $key );
        }

        $transient_version = self::get_transient_version( $group );
        $transient_value   = get_transient( $key );

        if (
            isset( $transient_value['value'], $transient_value['version'] ) &&
            $transient_value['version'] === $transient_version
        ) {
            return $transient_value['value'];
        }

        return false;
	}

    /**
     * Set Transient value for a key.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $transient_key     eg: seller_data_[id]
     * @param string $transient_value   eg: 6000, ['earning' => 1]
     * @param string $group             eg: seller_earnings
     * @param int    $expiration        default: 1 Week => WEEK_IN_SECONDS
     *
     * @return bool  Inserted/Updated the transient or not
     */
	public static function dokan_set_transient( $key, $value, $group = null, $expiration = WEEK_IN_SECONDS ) {
        if ( empty( $group ) ) {
            return set_transient( $key, $value, $expiration );
        }

        $transient_version = self::get_transient_version( $group );

        $transient_value   = array(
            'version' => $transient_version,
            'value'   => $value,
        );

        return set_transient( $key, $transient_value, $expiration );
	}

    /**
	 * Get prefix for use with wp_cache_set.
     *
     * It allows all cache in a group to be invalidated at once.
	 *
     * @since DOKAN_LITE_SINCE
     *
	 * @param  string $group Group of cache to get.
     *
	 * @return string
	 */
	public static function get_cache_prefix( $group ) {
		$prefix = wp_cache_get( 'dokan_' . $group . '_cache_prefix', $group );

		if ( false === $prefix ) {
			$prefix = microtime();
			wp_cache_set( 'dokan_' . $group . '_cache_prefix', $prefix, $group );
		}

		return 'dokan_cache_' . $prefix . '_';
	}

    /**
     * Get Cache for Dokan.
     *
     * Example:
     * ```
     * CacheHelper::get_cache( 'all_products', 'seller_products' );
     * ```
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string  $key
     * @param string  $group   eg: `dokan`, `dokan_seller_data_[seller_id]`
     * @param bool $forced eg: default: `false`
     *
     * @return mixed|false
     */
    public static function get_cache( $key, $group = null, $forced = false ) {
        if ( empty( $group ) ) {
            return wp_cache_get( $key, $group, $forced );
        }

        $key = self::get_cache_prefix( $group ) . $key;

        return wp_cache_get( $key, $group, $forced );
	}

    /**
     * Set Cache for Dokan.
     *
     * Update the cache for dokan. We've added some defaults to set the cache.
     * Like, We set default expiry time, cache group to remove some redundant assign of those data.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $key
     * @param mixed  $data
     * @param string $group  eg: `dokan`, `dokan_seller_data_[seller_id]`
     * @param int    $expire time in seconds eg: default: `WEEK_IN_SECONDS`
     *
     * @return bool
     */
    public static function set_cache( $key, $data, $group = null, $expire = WEEK_IN_SECONDS ) {
        return wp_cache_set( $key, $data, $group, $expire );
	}

    /**
	 * Invalidate cache group at once.
     *
     * Example:
     * ```
     * CacheHelper::invalidate_cache_group( 'seller_products' );
     * ```
	 *
	 * @since DOKAN_LITE_SINCE
     *
	 * @param string $group Group of cache to clear.
     *
     * @return bool
	 */
	public static function invalidate_cache_group( $group ) {
		return wp_cache_set( 'dokan_' . $group . '_cache_prefix', microtime(), $group );
	}
}
