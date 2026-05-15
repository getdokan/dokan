<?php

namespace WeDevs\Dokan\Test\Admin\Settings;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Mirrors the merge logic performed by the legacy AJAX save handler in
 * `includes/Admin/Settings.php::save_settings_value`.
 *
 * @group admin-settings
 */
class LegacyAjaxBridgePropagationTest extends DokanTestCase {

    public function test_legacy_save_propagates_to_new_option_via_bridge(): void {
        $fixture = [
            [ 'id' => 'banner_width', 'type' => 'field', 'legacy_key' => 'dokan_appearance.store_banner_width', 'default' => 400 ],
        ];
        $cb = static function () use ( $fixture ) { return $fixture; };
        add_filter( 'dokan_get_admin_settings_schema', $cb );

        $bridge   = new LegacySettingsBridge();
        $slice    = $bridge->transform_legacy_payload_to_new(
            'dokan_appearance',
            [ 'store_banner_width' => 555 ]
        );
        $existing = get_option( 'dokan_settings', [] );
        update_option( 'dokan_settings', array_merge( is_array( $existing ) ? $existing : [], $slice ), true );

        remove_filter( 'dokan_get_admin_settings_schema', $cb );
        $stored = get_option( 'dokan_settings', [] );
        delete_option( 'dokan_settings' );

        $this->assertSame( 555, $stored['banner_width'] );
    }
}
