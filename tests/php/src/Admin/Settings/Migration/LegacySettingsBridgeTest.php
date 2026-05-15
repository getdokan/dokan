<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Migration;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class LegacySettingsBridgeTest extends DokanTestCase {

    public function test_class_exists_and_construct(): void {
        $bridge = new LegacySettingsBridge();
        $this->assertInstanceOf( LegacySettingsBridge::class, $bridge );
    }

    public function test_get_mapping_harvests_legacy_key_attribute(): void {
        $fixture = [
            [
                'id'         => 'banner_width',
                'type'       => 'field',
                'default'    => 400,
                'legacy_key' => 'dokan_appearance.store_banner_width',
            ],
            [
                'id'      => 'no_legacy_field',
                'type'    => 'field',
                'default' => '',
            ],
            [
                'id'   => 'not_a_field',
                'type' => 'section',
            ],
        ];

        $cb = static function () use ( $fixture ) { return $fixture; };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        $bridge = new LegacySettingsBridge();
        $map    = $bridge->get_mapping();

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertArrayHasKey( 'banner_width', $map );
        $this->assertSame(
            [ 'option' => 'dokan_appearance', 'field' => 'store_banner_width' ],
            $map['banner_width']
        );
        $this->assertArrayNotHasKey( 'no_legacy_field', $map );
        $this->assertArrayNotHasKey( 'not_a_field', $map );
    }

    public function test_dokan_legacy_settings_key_mapping_filter_adds_entries(): void {
        add_filter( 'dokan_get_admin_settings_schema', '__return_empty_array' );
        $cb = static function ( array $map ): array {
            $map['extra_addon_field'] = 'dokan_some_addon.extra';
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $cb );

        $bridge = new LegacySettingsBridge();
        $map    = $bridge->get_mapping();

        remove_filter( 'dokan_legacy_settings_key_mapping', $cb );
        remove_filter( 'dokan_get_admin_settings_schema', '__return_empty_array' );

        $this->assertSame(
            [ 'option' => 'dokan_some_addon', 'field' => 'extra' ],
            $map['extra_addon_field']
        );
    }

    public function test_malformed_legacy_key_is_dropped(): void {
        $fixture = [
            [ 'id' => 'good',         'type' => 'field', 'legacy_key' => 'dokan_general.foo' ],
            [ 'id' => 'no_dot',       'type' => 'field', 'legacy_key' => 'just_a_word' ],
            [ 'id' => 'empty_option', 'type' => 'field', 'legacy_key' => '.bar' ],
            [ 'id' => 'empty_field',  'type' => 'field', 'legacy_key' => 'dokan_general.' ],
        ];
        $cb = static function () use ( $fixture ) { return $fixture; };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        $bridge = new LegacySettingsBridge();
        $map    = $bridge->get_mapping();

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertSame( [ 'good' ], array_keys( $map ) );
    }

    public function test_transform_legacy_payload_to_new_returns_mapped_slice(): void {
        $fixture = [
            [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
            [ 'id' => 'unrelated',    'type' => 'field', 'legacy_key' => 'dokan_general.unrelated_field',       'default' => '' ],
        ];
        $cb = static function () use ( $fixture ) { return $fixture; };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        $bridge = new LegacySettingsBridge();
        $slice  = $bridge->transform_legacy_payload_to_new(
            'dokan_appearance',
            [ 'store_banner_width' => 800, 'untracked' => 'ignored' ]
        );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertSame( [ 'banner_width' => 800 ], $slice );
    }

    public function test_transform_preserves_explicit_null_and_false(): void {
        $fixture = [
            [ 'id' => 'enable_x', 'type' => 'field', 'legacy_key' => 'dokan_general.enable_x', 'default' => false ],
            [ 'id' => 'note_x',   'type' => 'field', 'legacy_key' => 'dokan_general.note_x',   'default' => '' ],
        ];
        $cb = static function () use ( $fixture ) { return $fixture; };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        $bridge = new LegacySettingsBridge();
        $slice  = $bridge->transform_legacy_payload_to_new(
            'dokan_general',
            [ 'enable_x' => false, 'note_x' => null ]
        );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertSame( [ 'enable_x' => false, 'note_x' => null ], $slice );
    }

    public function test_transform_returns_empty_for_unmapped_option(): void {
        add_filter( 'dokan_get_admin_settings_schema', '__return_empty_array' );

        $bridge = new LegacySettingsBridge();
        $slice  = $bridge->transform_legacy_payload_to_new( 'dokan_unknown', [ 'x' => 1 ] );

        remove_filter( 'dokan_get_admin_settings_schema', '__return_empty_array' );

        $this->assertSame( [], $slice );
    }

    public function test_hydrate_new_does_not_overwrite_existing_new_values(): void {
        $fixture = [
            [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
        ];
        $cb = static function () use ( $fixture ) { return $fixture; };
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        update_option( 'dokan_appearance', [ 'store_banner_width' => 999 ] );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [ 'banner_width' => 200 ] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        $this->assertSame( 200, $hydrated['banner_width'] );
    }

    public function test_hydrate_new_adopts_legacy_when_new_missing(): void {
        $fixture = [
            [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
        ];
        $cb = static function () use ( $fixture ) { return $fixture; };
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        update_option( 'dokan_appearance', [ 'store_banner_width' => 999 ] );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        $this->assertSame( 999, $hydrated['banner_width'] );
    }

    public function test_hydrate_new_falls_back_to_schema_default(): void {
        $fixture = [
            [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
        ];
        $cb = static function () use ( $fixture ) { return $fixture; };
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_appearance' );

        $bridge   = new LegacySettingsBridge();
        $hydrated = $bridge->hydrate_new_from_legacy( [] );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );

        $this->assertSame( 400, $hydrated['banner_width'] );
    }
}
