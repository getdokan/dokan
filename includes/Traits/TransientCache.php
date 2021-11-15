<?php

namespace WeDevs\Dokan\Traits;

/**
 * Transient trait.
 *
 * Handles Transient underneath functionalities with the help of this TransientTrait trait.
 *
 * @since 3.3.2
 *
 * @package WeDevs\Dokan\Abstracts\Traits
 */
trait TransientCache {

    /**
     * Get transient version.
     *
     * When using transients with unpredictable names, e.g. those containing an md5
     * hash in the name, we need a way to invalidate them all at once.
     *
     * With external cache however, this isn't possible. Instead, this function is used
     * to append a unique string (based on time()) to each transient. When transients
     * are invalidated, the transient version will increment and data will be regenerated
     *
     * @since 3.3.2
     *
     * @param  string $group   Name for the group of transients we need to invalidate.
     * @param  bool   $refresh true to force a new version.
     *
     * @return string transient version based on microtime().
     */
    private static function get_transient_version( $group, $refresh = false ) {
        $transient_name  = static::get_cache_group_with_prefix( $group ) . '-transient-version';
        $transient_value = get_transient( $transient_name );

        // If no transient value found,
        // Set a new version number by replacing some characters to underscores.
        if ( false === $transient_value || true === $refresh ) {
            $transient_value = static::get_time_prefix();

            set_transient( $transient_name, $transient_value );
        }

        return $transient_value;
    }

    /**
     * Add Cache Prefix to key.
     *
     * @since 3.3.2
     *
     * @param string $key
     * @param string $group; default: ''
     *
     * @return string processed key
     */
    private static function get_formatted_transient_key( $key, $group = '' ) {
        // Don't add prefix to non-cacheable groups.
        if ( empty( $group ) ) {
            return static::get_cache_prefix() . '_' . sanitize_key( $key );
        }

        $prefix = static::get_transient_version( $group );

        return static::get_cache_prefix() . '_' . $prefix . '_' . sanitize_key( $key );
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
     * Get transient value for a normal key.
     * ```
     * Cache::get_transient( 'transient_key' ); // returns only `transient_key`'s value
     * ```
     *
     * Get transient value for a group.
     * ```
     * Cache::get_transient( 'transient_key', 'group_name' );
     * ```
     *
     * @since 3.3.2
     *
     * @param string $key    eg: seller_data_[id]
     * @param string $group  eg: null, seller_earnings
     *
     * @return mixed|false   Transient value or false
     */
    public static function get_transient( $key, $group = '' ) {
        // get formatted transient key
        $key = static::get_formatted_transient_key( $key, $group );

        // if group is empty, we don't need to check transient version
        if ( empty( $group ) ) {
            return get_transient( $key );
        }

        $transient_version = static::get_transient_version( $group );
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
     * @since 3.3.2
     *
     * @param string $key           eg: seller_data_[id]
     * @param string $value         eg: 6000, ['earning' => 1]
     * @param string $group         eg: seller_earnings
     * @param int    $expiration    default: 1 Week => WEEK_IN_SECONDS
     *
     * @return bool True if the value was set, false otherwise
     */
    public static function set_transient( $key, $value, $group = '', $expiration = WEEK_IN_SECONDS ) {
        // get formatted transient key
        $key = static::get_formatted_transient_key( $key, $group );

        // if group is empty, set transient without version number
        if ( empty( $group ) ) {
            return set_transient( $key, $value, $expiration );
        }

        $transient_version = static::get_transient_version( $group );

        $transient_value = [
            'version' => $transient_version,
            'value'   => $value,
        ];

        return set_transient( $key, $transient_value, $expiration );
    }

    /**
     * Delete transient.
     *
     * @since 3.3.2
     *
     * @param string $key    eg: seller_data_[id]
     * @param string $group  eg: seller_earnings
     *
     * @return bool          True if the transient was deleted otherwise false.
     */
    public static function delete_transient( $key, $group = '' ) {
        // get formatted transient key
        $key = static::get_formatted_transient_key( $key, $group );

        return delete_transient( $key );
    }

    /**
     * Invalidate transient group at once by group name.
     *
     * Example:
     * ```
     * Cache::invalidate_transient_group( 'group_name' );
     * ```
     *
     * @since 3.3.2
     *
     * @param string $group Group of transients data to clear.
     *
     * @return string
     */
    public static function invalidate_transient_group( $group ) {
        return static::get_transient_version( $group, true );
    }
}
