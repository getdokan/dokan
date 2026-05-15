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
}
