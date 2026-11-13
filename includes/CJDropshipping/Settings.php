<?php

namespace WeDevs\Dokan\CJDropshipping;

/**
 * Reads the admin's CJ Dropshipping settings.
 *
 * @since DOKAN_SINCE
 */
class Settings {

    public const OPTION = 'dokan_cj_dropshipping';

    /**
     * Get one setting from the CJ settings group.
     *
     * @since DOKAN_SINCE
     *
     * @param string $key           Setting key.
     * @param mixed  $default_value Fallback when the setting was never saved.
     *
     * @return mixed
     */
    public static function get( string $key, $default_value = '' ) {
        return dokan_get_option( $key, self::OPTION, $default_value );
    }

    /**
     * Whether the admin has switched CJ Dropshipping on.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_enabled(): bool {
        return 'on' === self::get( 'enabled', 'off' );
    }

    /**
     * Markup percentage suggested on the import form.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public static function default_markup(): float {
        return max( 0.0, (float) self::get( 'default_markup', 50 ) );
    }

    /**
     * Store categories vendors may import into; empty means all.
     *
     * @since DOKAN_SINCE
     *
     * @return int[]
     */
    public static function allowed_categories(): array {
        $value = self::get( 'allowed_categories', [] );

        return array_values( array_filter( array_map( 'absint', (array) $value ) ) );
    }

    /**
     * Destination countries where CJ items can't be sold (E4).
     *
     * @since DOKAN_SINCE
     *
     * @return string[]
     */
    public static function blocked_countries(): array {
        $eu = [ 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE' ];

        return apply_filters( 'dokan_cj_blocked_countries', array_merge( $eu, [ 'GB', 'AU' ] ) );
    }

    /**
     * Units held back from CJ's warehouse stock before selling (C6).
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public static function stock_buffer(): int {
        return (int) apply_filters( 'dokan_cj_stock_buffer', 5 );
    }
}
