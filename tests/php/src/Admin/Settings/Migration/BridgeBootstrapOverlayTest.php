<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Migration;

use WeDevs\Dokan\Admin\Settings\Migration\BridgeBootstrap;
use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Verifies the option_<section> overlay filters installed by BridgeBootstrap
 * so direct `get_option('dokan_<section>')` callers receive a payload with
 * mapped values projected in from the new flat option.
 *
 * @group admin-settings
 */
class BridgeBootstrapOverlayTest extends DokanTestCase {

    public function test_overlay_projects_new_value_onto_get_option_read(): void {
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

        // Legacy row holds ONLY unmapped data — this is the new invariant
        // after a strip-on-save.
        update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );
        update_option( 'dokan_admin_settings', [ 'vendor_welcome_wizard_enabled' => 'off' ] );

        $bootstrap = new BridgeBootstrap( new LegacySettingsBridge() );
        $bootstrap->register_overlay_filters();

        $legacy_view = get_option( 'dokan_general' );

        remove_filter( "option_dokan_general", [ $bootstrap, 'apply_overlay' ], 10 );
        remove_filter( "default_option_dokan_general", [ $bootstrap, 'apply_overlay' ], 10 );
        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_admin_settings' );
        delete_option( 'dokan_general' );

        $this->assertSame( 'shop', $legacy_view['custom_store_url'] );
        $this->assertSame(
            'off',
            $legacy_view['disable_welcome_wizard'],
            'Mapped key from dokan_admin_settings should appear in the overlay-applied legacy view'
        );
    }

    public function test_overlay_synthesizes_view_even_when_legacy_row_absent(): void {
        $cb = static function (): array {
            return [
                [
                    'id'         => 'banner_width',
                    'type'       => 'field',
                    'legacy_key' => 'dokan_appearance.store_banner_width',
                    'default'    => 400,
                ],
            ];
        };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        delete_option( 'dokan_appearance' );
        update_option( 'dokan_admin_settings', [ 'banner_width' => 1280 ] );

        $bootstrap = new BridgeBootstrap( new LegacySettingsBridge() );
        $bootstrap->register_overlay_filters();

        $value = get_option( 'dokan_appearance', false );

        remove_filter( "default_option_dokan_appearance", [ $bootstrap, 'apply_overlay' ], 10 );
        remove_filter( "option_dokan_appearance", [ $bootstrap, 'apply_overlay' ], 10 );
        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_admin_settings' );

        // The default_option_<name> filter chains through apply_overlay even
        // when the row is missing, so a synthesized array surfaces with the
        // mapped value populated.
        $this->assertIsArray( $value );
        $this->assertSame( 1280, $value['store_banner_width'] );
    }

    public function test_overlay_passes_through_when_section_has_no_mapping(): void {
        $cb = static function (): array {
            return [
                [
                    'id'         => 'banner_width',
                    'type'       => 'field',
                    'legacy_key' => 'dokan_appearance.store_banner_width',
                    'default'    => 400,
                ],
            ];
        };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        update_option( 'dokan_general', [ 'custom_store_url' => 'shop' ] );

        $bootstrap = new BridgeBootstrap( new LegacySettingsBridge() );
        $bootstrap->register_overlay_filters();

        // dokan_general has no mapped fields in this fixture — no filter
        // should have been registered for it, and the raw value passes
        // through unchanged.
        $value = get_option( 'dokan_general' );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_general' );

        $this->assertSame( [ 'custom_store_url' => 'shop' ], $value );
    }
}
