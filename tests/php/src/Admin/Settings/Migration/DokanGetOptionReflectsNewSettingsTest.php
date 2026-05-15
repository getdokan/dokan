<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Migration;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class DokanGetOptionReflectsNewSettingsTest extends DokanTestCase {

    public function test_dokan_get_option_returns_value_from_new_settings_when_mapped(): void {
        $fixture = [
            [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
        ];
        $cb = static function () use ( $fixture ) { return $fixture; };
        add_filter( 'dokan_get_admin_settings_schema', $cb );
        update_option( 'dokan_settings', [ 'banner_width' => 1280 ] );
        delete_option( 'dokan_appearance' );

        $value = dokan_get_option( 'store_banner_width', 'dokan_appearance', 'unused' );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        delete_option( 'dokan_settings' );

        $this->assertSame( 1280, $value );
    }
}
