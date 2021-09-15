<?php

namespace WeDevs\Dokan\Cache;

use WC_Cache_Helper;
use WeDevs\Dokan\Traits\ChainableContainer;
use WeDevs\Dokan\Order\Cache as OrderCache;
use WeDevs\Dokan\Product\Cache as ProductCache;
use WeDevs\Dokan\Vendor\Cache as VendorCache;
use WeDevs\Dokan\Withdraw\Cache as WithdrawCache;

defined( 'ABSPATH' ) || exit;

/**
 * CacheHelper class
 *
 * Manage all of the caches of Dokan and handles it beautifully
 */
class CacheHelper extends WC_Cache_Helper {

    use ChainableContainer;

    public function __construct() {
        $this->init_classes();
    }

    /**
     * Initializes all classes for caching independently
     *
     * @since DOKAN_LITE_SINCE
     */
    public function init_classes() {
        $this->container['product']  = new ProductCache();
        $this->container['order']    = new OrderCache();
        $this->container['vendor']   = new VendorCache();
        $this->container['withdraw'] = new WithdrawCache();
    }

    /**
     * Get prefix for use with wp_cache_set. Allows all cache in a group to be invalidated at once.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param  string $group Group of cache to get.
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
     * Increment group cache prefix (invalidates cache).
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $group Group of cache to clear.
     */
    public static function incr_cache_prefix( $group ) {
        self::invalidate_cache_group( $group );
    }

    /**
     * Invalidate cache group.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $group Group of cache to clear
     */
    public static function invalidate_cache_group( $group ) {
        wp_cache_set( 'dokan_' . $group . '_cache_prefix', microtime(), $group );
    }

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
	 * @param  boolean            $refresh true to force a new version.
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
     * Get Transient value from a key both From Object & Normal data
     *
     * If needs only key value, just pass `$transient_key`
     * If the transient value is an object, and need to get the params of that object
     * then pass the second args `$param`
     *
     * Examples:
     *
     * Get transient value for a normal key
     * ```
     * CacheHelper::dokan_get_transient( 'transient_key' ); // returns `transient_key` value;
     * ```
     *
     * Get transient value for the object's param
     * ```
     * CacheHelper::dokan_get_transient( 'transient_key', 'param_name' ); // returns `get_transient(transient_key)[param_name]` value;
     * ```
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string        $transient_key  eg: seller_data_[id]
     * @param string        $param          eg: null, seller_earnings
     *
     * @return bool|string  False or Transient value
     */
	public static function dokan_get_transient( $transient_key, $param = null) {
		$transient_value = get_transient( $transient_key );

        if ( ! $transient_value ) {
            return false;
        }

        if ( ! empty( $param ) && is_array( $transient_value ) ) {
            $value = $transient_value[ $param ];

            if ( ! empty( $value ) ) {
                return $value;
            }

            return false;
        }

        return $transient_value;
	}

    /**
     * Set Transient value for a key
     *
     * If needs to set only the key value, then pass only the first transient key
     * If needs to update/insert the transient value on that object's param, pass params key also
     *
     * Examples:
     *
     * When needs to add/update values inside an array param, like add/update `seller_earnings` param
     * in `sellers_data` transient, the calling process would be:
     *
     * ```
     * CacheHelper::dokan_set_transient( 'sellers_data', 100, 'seller_earnings');
     * ```
     *
     * When needs to add/update only key value:
     *
     * ```
     * CacheHelper::dokan_set_transient( 'announcements', array());
     * ```
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $transient_key     eg: seller_data_[id]
     * @param string $transient_value   eg: 6000, ['earning' => 1]
     * @param string $param             eg: seller_earnings
     * @param int    $expiration        default: 1 Day => DAY_IN_SECONDS
     *
     * @return void  Insert/Update the transient
     */
	public static function dokan_set_transient( $transient_key, $transient_value, $param = null, $expiration = DAY_IN_SECONDS ) {
        if ( ! empty( $param ) ) {
            $previous_transient_value = get_transient( $transient_key );

            if ( ! empty( $previous_transient_value ) && is_array( $previous_transient_value )) {
                $previous_transient_value[ $param ] = $transient_value;
                set_transient( $transient_key, $previous_transient_value, $expiration );
            } else {
                $data = [
                    $param => $transient_value
                ];

                set_transient( $transient_key, $data, $expiration );
            }
        } else {
            set_transient( $transient_key, $transient_value, $expiration );
        }
	}

    /**
     * When the transient version increases, this is used to remove all past transients to avoid filling the DB.
     *
     * Note: this only works on transients appended with the transient version, and when object caching is not being used.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $version Version of the transient to remove.
     */
    public static function delete_version_transients( $version = '' ) {
        if ( ! wp_using_ext_object_cache() && ! empty( $version ) ) {
            global $wpdb;

            $limit = apply_filters( 'dokan_delete_version_transients_limit', 1000 );

            if ( ! $limit ) {
                return;
            }

            $affected = $wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s LIMIT %d;", '\_transient\_dokan\_%' . $version, $limit ) );

            // If affected rows is equal to limit, there are more rows to delete. Delete in 30 secs.
            if ( $affected === $limit ) {
                wp_schedule_single_event( time() + 30, 'delete_version_transients', array( $version ) );
            }
        }
    }

    /**
     * Bulk clear cache values by group name
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $group
     *
     * @return void
     */
    public static function clear_group( $group ) {
        $keys = get_option( $group, [] );

        if ( ! empty( $keys ) ) {
            foreach ( $keys as $key ) {
                wp_cache_delete( $key, $group );
                unset( $keys[ $key ] );
            }
        }

        update_option( $group, $keys );
    }

    /**
     * Keep record of keys by group name
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $key
     * @param string $group
     *
     * @return void
     */
    public static function update_group( $key, $group ) {
        $keys = get_option( $group, [] );

        if ( in_array( $key, $keys ) ) {
            return;
        }

        $keys[] = $key;
        update_option( $group, $keys );
    }
}

CacheHelper::init();
