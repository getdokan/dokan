<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\Access;
use WeDevs\Dokan\Abilities\Mcp\DisplayFields;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 * @group mcp
 *
 * The connection block's display-only values never become settings.
 */
class DisplayFieldsTest extends DokanTestCase {

    public function test_display_only_values_are_dropped_from_a_new_ui_save() {
        $fields = new DisplayFields();

        $stored = $fields->strip_display_values(
            [
                'mcp_enabled'              => 'on',
                'mcp_vendor_access'        => 'off',
                'mcp_connector_url'        => 'https://example.com/wp-json/dokan/mcp',
                'mcp_application_password' => '<p>how to</p>',
                'mcp_server_status'        => 'Active',
            ]
        );

        $this->assertSame(
            [
                'mcp_enabled'       => 'on',
                'mcp_vendor_access' => 'off',
            ],
            $stored
        );
    }

    public function test_display_only_values_are_dropped_from_the_legacy_ai_section_only() {
        $fields = new DisplayFields();

        $stored = $fields->strip_legacy_display_values(
            [
                'dokan_mcp_enabled'       => 'on',
                'dokan_mcp_status'        => 'Active',
                'dokan_mcp_connector_url' => 'https://example.com/wp-json/dokan/mcp',
                'dokan_mcp_api_key'       => 'how to',
            ],
            Access::SETTING_SECTION
        );

        $this->assertSame( [ 'dokan_mcp_enabled' => 'on' ], $stored );

        // Another section with a same-named key is not this class's business.
        $this->assertSame( [ 'dokan_mcp_status' => 'x' ], $fields->strip_legacy_display_values( [ 'dokan_mcp_status' => 'x' ], 'dokan_general' ) );
    }
}
