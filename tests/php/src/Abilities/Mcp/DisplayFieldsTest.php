<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\Access;
use WeDevs\Dokan\Abilities\Mcp\DisplayFields;
use WeDevs\Dokan\Abilities\Mcp\Status;
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
                'mcp_enabled'                    => 'on',
                'mcp_vendor_access'              => 'off',
                'mcp_connector_url'              => 'https://example.com/wp-json/dokan/mcp',
                'mcp_sign_in'                    => 'Assistants sign in with a WordPress application password',
                'mcp_adapter_notice'             => '',
                'mcp_woocommerce_feature_notice' => '',
                'mcp_https_notice'               => '',
                'ai_product_info_engine'         => 'openai',
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

    public function test_every_notice_the_screen_can_show_is_listed() {
        $summaries = [
            // No adapter at all.
            [
                'adapter_available'   => false,
                'woocommerce_feature' => false,
                'https'               => false,
            ],
            // The adapter is bundled but WooCommerce's feature is off.
            [
                'adapter_available'   => true,
                'woocommerce_feature' => false,
                'https'               => true,
            ],
        ];

        foreach ( $summaries as $summary ) {
            foreach ( array_keys( Status::warnings( $summary ) ) as $key ) {
                // The schema builds the notice id from the warning key; the list must name every one.
                $this->assertContains( 'mcp_' . $key . '_notice', DisplayFields::DISPLAY_FIELDS, $key );
            }
        }
    }

    public function test_only_the_two_switches_survive_a_legacy_ai_section_save() {
        $fields = new DisplayFields();

        $stored = $fields->strip_legacy_display_values(
            [
                'dokan_mcp'               => '',
                'dokan_mcp_enabled'       => 'on',
                'dokan_mcp_vendor_access' => 'on',
                'dokan_mcp_connector_url' => 'https://example.com/wp-json/dokan/mcp',
                'dokan_mcp_sign_in'       => 'Assistants sign in with a WordPress application password',
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
        $this->assertSame( [ 'dokan_mcp_sign_in' => 'x' ], $fields->strip_legacy_display_values( [ 'dokan_mcp_sign_in' => 'x' ], 'dokan_general' ) );
    }
}
