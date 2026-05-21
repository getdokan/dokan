<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Migration;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Behavior of LegacySettingsBridge::strip_mapped_keys() and
 * persist_legacy_section() — the write-side of the new-is-canonical
 * settings model.
 *
 * @group admin-settings
 */
class StripMappedKeysTest extends DokanTestCase {

    public function test_strip_removes_simple_mapped_keys_and_keeps_unmapped(): void {
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

        $bridge = new LegacySettingsBridge();
        $result = $bridge->strip_mapped_keys(
            'dokan_general',
            [
                'disable_welcome_wizard' => 'off',
                'custom_store_url'       => 'store7',
                'setup_wizard_message'   => '<p>hello</p>',
            ]
        );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertArrayNotHasKey( 'disable_welcome_wizard', $result );
        $this->assertSame( 'store7', $result['custom_store_url'] );
        $this->assertSame( '<p>hello</p>', $result['setup_wizard_message'] );
    }

    public function test_strip_removes_nested_path_and_prunes_empty_parent(): void {
        $cb = static function (): array {
            return [
                [
                    'id'         => 'paypal_method',
                    'type'       => 'field',
                    'legacy_key' => 'dokan_withdraw.withdraw_methods.paypal',
                    'default'    => 'on',
                ],
            ];
        };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        $bridge = new LegacySettingsBridge();
        $result = $bridge->strip_mapped_keys(
            'dokan_withdraw',
            [
                'withdraw_methods' => [ 'paypal' => 'on' ],
                'minimum'          => 50,
            ]
        );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        // The leaf was the only entry under withdraw_methods, so the parent
        // should be pruned too — we don't want orphan empty arrays clinging
        // to the legacy row.
        $this->assertArrayNotHasKey( 'withdraw_methods', $result );
        $this->assertSame( 50, $result['minimum'] );
    }

    public function test_strip_keeps_sibling_in_partially_mapped_nested_array(): void {
        $cb = static function (): array {
            return [
                [
                    'id'         => 'paypal_method',
                    'type'       => 'field',
                    'legacy_key' => 'dokan_withdraw.withdraw_methods.paypal',
                    'default'    => 'on',
                ],
            ];
        };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        $bridge = new LegacySettingsBridge();
        $result = $bridge->strip_mapped_keys(
            'dokan_withdraw',
            [
                'withdraw_methods' => [
                    'paypal'        => 'on',
                    'bank_transfer' => 'on',
                ],
            ]
        );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        // bank_transfer isn't mapped → parent must NOT be pruned.
        $this->assertSame(
            [ 'withdraw_methods' => [ 'bank_transfer' => 'on' ] ],
            $result
        );
    }

    public function test_strip_is_noop_when_section_has_no_mapped_fields(): void {
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

        $bridge = new LegacySettingsBridge();
        $payload = [
            'custom_store_url' => 'shop',
            'unrelated'        => 'value',
        ];
        $result = $bridge->strip_mapped_keys( 'dokan_general', $payload );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertSame( $payload, $result );
    }

    public function test_persist_legacy_section_writes_to_new_and_returns_stripped(): void {
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

        delete_option( 'dokan_admin_settings' );
        $bridge   = new LegacySettingsBridge();
        $stripped = $bridge->persist_legacy_section(
            'dokan_appearance',
            [
                'store_banner_width' => 1280,
                'site_layout'        => 'full-width',
            ]
        );

        $new_option = get_option( 'dokan_admin_settings', [] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_admin_settings' );

        $this->assertSame( 1280, $new_option['banner_width'] );
        $this->assertArrayNotHasKey( 'store_banner_width', $stripped );
        $this->assertSame( 'full-width', $stripped['site_layout'] );
    }
}
