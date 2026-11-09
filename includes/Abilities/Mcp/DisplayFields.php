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
 * section as a whole, so the display-only fields are named here and dropped before the write.
 *
 * @since DOKAN_SINCE
 */
class DisplayFields implements Hookable {

    /**
     * Display-only field ids of the new settings UI, see
     * {@see \WeDevs\Dokan\Admin\Settings\Schema\SettingsSchema::mcp_connection_fields()}.
     *
     * @since DOKAN_SINCE
     */
    const DISPLAY_FIELDS = [
        'mcp_connector_url',
        'mcp_sign_in',
        'mcp_adapter_notice',
        'mcp_woocommerce_feature_notice',
        'mcp_https_notice',
    ];

    /**
     * Display-only field names of the legacy settings UI, the sub-section heading included, see
     * {@see \WeDevs\Dokan\Intelligence\Admin\Settings::mcp_connection_fields()}.
     *
     * @since DOKAN_SINCE
     */
    const LEGACY_DISPLAY_FIELDS = [
        'dokan_mcp',
        'dokan_mcp_connector_url',
        'dokan_mcp_sign_in',
    ];

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
        return is_array( $slice ) ? array_diff_key( $slice, array_flip( self::DISPLAY_FIELDS ) ) : $slice;
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

        return array_diff_key( $values, array_flip( self::LEGACY_DISPLAY_FIELDS ) );
    }
}
