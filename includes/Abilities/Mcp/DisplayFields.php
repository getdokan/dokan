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
 * section as a whole, so the values would otherwise be written next to the real switches.
 *
 * @since DOKAN_SINCE
 */
class DisplayFields implements Hookable {

    /**
     * New-UI field ids whose values are display-only and never stored.
     *
     * @since DOKAN_SINCE
     */
    const FIELDS = [ 'mcp_server_status', 'mcp_connector_url', 'mcp_application_password', 'mcp_vendor_authorize_url', 'mcp_claude_code', 'mcp_api_key', 'mcp_adapter_notice', 'mcp_https_notice' ];

    /**
     * Legacy field names whose values are display-only and never stored.
     *
     * @since DOKAN_SINCE
     */
    const LEGACY_FIELDS = [ 'dokan_mcp_status', 'dokan_mcp_connector_url', 'dokan_mcp_application_password', 'dokan_mcp_api_key' ];

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
        if ( ! is_array( $slice ) ) {
            return $slice;
        }

        foreach ( self::FIELDS as $id ) {
            unset( $slice[ $id ] );
        }

        return $slice;
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

        foreach ( self::LEGACY_FIELDS as $name ) {
            unset( $values[ $name ] );
        }

        return $values;
    }
}
