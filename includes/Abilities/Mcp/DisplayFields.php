<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Contracts\Hookable;

defined( 'ABSPATH' ) || exit;

/**
 * Keeps the connection block's display-only values out of the stored settings.
 *
 * Both settings screens describe the MCP connection (status, connector URL, how to sign in) in
 * ordinary fields whose values are filled in when the screen is built. Nothing in them is a
 * setting, but the new UI submits every field of a page on save and the legacy screen posts its
 * section as a whole. The rule is by name: every `mcp_*` / `dokan_mcp_*` field except the two
 * switches is display-only.
 *
 * @since DOKAN_SINCE
 */
class DisplayFields implements Hookable {

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_admin_settings_pre_save', [ $this, 'strip_display_values' ] );
        add_filter( 'dokan_save_settings_value', [ $this, 'strip_legacy_display_values' ], 10, 2 );
    }

    /**
     * Keep the display-only fields of the new settings UI out of `dokan_admin_settings`.
     *
     * @since DOKAN_SINCE
     *
     * @param array $slice Values about to be stored.
     *
     * @return array
     */
    public function strip_display_values( $slice ) {
        return is_array( $slice ) ? self::without_display_fields( $slice, 'mcp_', [ 'mcp_enabled', 'mcp_vendor_access' ] ) : $slice;
    }

    /**
     * Keep the display-only fields of the legacy settings UI out of the `dokan_ai` row.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $values  Section values about to be stored.
     * @param string $section Section id.
     *
     * @return array
     */
    public function strip_legacy_display_values( $values, $section ) {
        if ( Access::SETTING_SECTION !== $section || ! is_array( $values ) ) {
            return $values;
        }

        return self::without_display_fields( $values, 'dokan_mcp_', [ Access::SETTING_ENABLED, Access::SETTING_VENDOR_ACCESS ] );
    }

    /**
     * Drop every key with the MCP prefix that is not a real setting.
     *
     * @since DOKAN_SINCE
     *
     * @param array    $values   Values about to be stored.
     * @param string   $prefix   The screen's MCP field prefix.
     * @param string[] $settings The keys that are settings and stay.
     *
     * @return array
     */
    private static function without_display_fields( array $values, string $prefix, array $settings ): array {
        foreach ( array_keys( $values ) as $key ) {
            if ( is_string( $key ) && 0 === strpos( $key, $prefix ) && ! in_array( $key, $settings, true ) ) {
                unset( $values[ $key ] );
            }
        }

        return $values;
    }
}
