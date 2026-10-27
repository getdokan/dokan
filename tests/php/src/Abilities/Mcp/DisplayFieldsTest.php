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

    public function test_only_the_two_switches_survive_a_new_ui_save() {
        $stored = ( new DisplayFields() )->strip_display_values(
            [
                'mcp_enabled'              => 'on',
                'mcp_vendor_access'        => 'off',
                'mcp_connector_url'        => 'https://example.com/wp-json/dokan/mcp',
                'mcp_application_password' => '<p>how to</p>',
                'mcp_some_future_notice'   => 'x',
                'ai_product_info_engine'   => 'openai',
            ]
        );

        $this->assertSame(
            [
                'mcp_enabled'            => 'on',
                'mcp_vendor_access'      => 'off',
                'ai_product_info_engine' => 'openai',
            ],
            $stored
        );
    }

    public function test_only_the_two_switches_survive_a_legacy_ai_section_save() {
        $fields = new DisplayFields();

        $stored = $fields->strip_legacy_display_values(
            [
                'dokan_mcp_enabled'       => 'on',
                'dokan_mcp_vendor_access' => 'on',
                'dokan_mcp_status'        => 'Active',
                'dokan_mcp_connector_url' => 'https://example.com/wp-json/dokan/mcp',
                'dokan_ai_engine'         => 'openai',
            ],
            Access::SETTING_SECTION
        );

        $this->assertSame(
            [
                'dokan_mcp_enabled'       => 'on',
                'dokan_mcp_vendor_access' => 'on',
                'dokan_ai_engine'         => 'openai',
            ],
            $stored
        );

        // Another section is not this class's business.
        $this->assertSame( [ 'dokan_mcp_status' => 'x' ], $fields->strip_legacy_display_values( [ 'dokan_mcp_status' => 'x' ], 'dokan_general' ) );
    }
}
