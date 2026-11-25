<?php

namespace WeDevs\Dokan\Test\Admin\Settings;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Round-trip behavior of dokan_save_legacy_settings_section(): mapped keys
 * land in the new flat option (canonical) AND — with the legacy mirror on by
 * default — stay physically in the legacy row so a downgraded plugin version
 * still reads current data.
 *
 * @group admin-settings
 */
class DokanSaveLegacySettingsSectionTest extends DokanTestCase {

    public function test_round_trip_keeps_mapped_key_in_legacy_row_and_in_new_option(): void {
        $cb = static function (): array {
            return [
                [
                    'id'         => 'vendor_welcome_wizard_enabled',
                    'type'       => 'field',
                    'legacy_key' => 'dokan_general.disable_welcome_wizard',
                    'default'    => 'on',
                ],
            ];
        };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        delete_option( 'dokan_general' );
        delete_option( 'dokan_admin_settings' );

        dokan_save_legacy_settings_section(
            'dokan_general',
            [
                'disable_welcome_wizard' => 'off',
                'custom_store_url'       => 'store7',
            ]
        );

        // Read the raw row directly via $wpdb — `get_option()` would route
        // through BridgeBootstrap's overlay filter and re-inject the mapped
        // key from the new flat option, masking what is physically stored
        // (which is exactly what a downgraded plugin version would read).
        global $wpdb;
        $raw_serialized = $wpdb->get_var(
            $wpdb->prepare( "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s", 'dokan_general' )
        );
        $raw_legacy   = is_string( $raw_serialized ) ? maybe_unserialize( $raw_serialized ) : [];
        $new_settings = get_option( 'dokan_admin_settings', [] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_general' );
        delete_option( 'dokan_admin_settings' );

        $this->assertSame( 'off', $new_settings['vendor_welcome_wizard_enabled'] );
        // The legacy mirror (default) keeps the mapped key physically in the
        // row so an old plugin version without the bridge reads current data.
        $this->assertIsArray( $raw_legacy );
        $this->assertSame( 'store7', $raw_legacy['custom_store_url'] );
        $this->assertSame(
            'off',
            $raw_legacy['disable_welcome_wizard'] ?? null,
            'Mapped key must persist physically in the legacy row (downgrade safety).'
        );
    }
}
