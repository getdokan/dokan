<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\Access;
use WeDevs\Dokan\Abilities\Mcp\VendorSettings;
use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Vendor\Settings\Schema\StoreSettingsSchema;
use WP_REST_Request;

/**
 * @group abilities
 * @group mcp
 * @group vendor-store-settings
 *
 * The "AI Assistant" tab of the Vendor Dashboard's Store settings: who is offered it, what it
 * hands the application-password field, and that a Store save never touches it.
 */
class VendorSettingsTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();

        wp_set_current_user( $this->seller_id1 );
    }

    /**
     * Assistants can connect: both switches on, an adapter running, and WordPress offering
     * application passwords, which it otherwise only does over HTTPS or on a local environment.
     *
     * @return void
     */
    private function open_the_marketplace_to_vendors(): void {
        add_filter( 'dokan_mcp_enabled', '__return_true' );
        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );
        add_filter( 'dokan_mcp_server_can_run', '__return_true' );
        add_filter( 'wp_is_application_passwords_available', '__return_true' );
    }

    /**
     * The Store settings schema elements keyed by id, for the vendor of the signed-in user.
     *
     * @return array
     */
    private function schema(): array {
        return array_column( StoreSettingsSchema::get_schema( dokan_get_current_user_id() ), null, 'id' );
    }

    public function test_the_tab_is_not_offered_until_vendors_may_connect() {
        $this->assertArrayNotHasKey( VendorSettings::TAB, $this->schema() );

        // Each of the three conditions closes the tab on its own.
        foreach ( [ 'dokan_mcp_enabled', 'dokan_mcp_vendor_access_enabled', 'dokan_mcp_server_can_run' ] as $missing ) {
            $this->open_the_marketplace_to_vendors();
            remove_filter( $missing, '__return_true' );

            $this->assertArrayNotHasKey( VendorSettings::TAB, $this->schema(), $missing );
            $this->assertArrayNotHasKey( VendorSettings::FIELD, $this->schema(), $missing );
        }
    }

    public function test_a_vendor_who_may_connect_gets_the_tab_with_their_own_sign_in() {
        $this->open_the_marketplace_to_vendors();

        $schema = $this->schema();

        $this->assertSame( 'tab', $schema[ VendorSettings::TAB ]['type'] );
        $this->assertSame( VendorSettings::TAB, $schema[ VendorSettings::SECTION ]['tab_id'] );

        // Where the assistant connects: a read-only copy field.
        $endpoint = $schema[ VendorSettings::FIELD_ENDPOINT ];

        $this->assertSame( 'copy_field', $endpoint['variant'] );
        $this->assertSame( VendorSettings::SECTION, $endpoint['section_id'] );
        $this->assertSame( Access::endpoint(), $endpoint['value'] );
        $this->assertTrue( $endpoint['non_meta'] );

        $field = $schema[ VendorSettings::FIELD ];

        $this->assertSame( VendorSettings::VARIANT, $field['variant'] );
        $this->assertSame( VendorSettings::SECTION, $field['section_id'] );
        $this->assertTrue( $field['non_meta'] );
        // The browser builds the token from this and a password it has just created.
        $this->assertSame( get_userdata( $this->seller_id1 )->user_login, $field['username'] );
        // Nothing about a password or a token travels with the schema: the field asks WordPress itself.
        $this->assertArrayNotHasKey( 'value', $field );
        $this->assertArrayNotHasKey( 'token', $field );
        $this->assertArrayNotHasKey( 'password', $field );
    }

    public function test_the_tab_follows_both_switches_for_a_store_admin_too() {
        wp_set_current_user( $this->admin_id );

        // A Store Admin may always connect, yet the tab is the vendor side of "Allow vendors to connect".
        add_filter( 'dokan_mcp_enabled', '__return_true' );
        add_filter( 'dokan_mcp_server_can_run', '__return_true' );

        $this->assertTrue( Access::user_can_connect( $this->admin_id ) );
        $this->assertFalse( VendorSettings::is_offered( $this->admin_id ) );
        $this->assertArrayNotHasKey( VendorSettings::TAB, $this->schema() );

        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        $this->assertTrue( VendorSettings::is_offered( $this->admin_id ) );
        $this->assertArrayHasKey( VendorSettings::TAB, $this->schema() );

        remove_filter( 'dokan_mcp_enabled', '__return_true' );

        $this->assertFalse( VendorSettings::is_offered( $this->admin_id ) );
        $this->assertArrayNotHasKey( VendorSettings::TAB, $this->schema() );
    }

    public function test_the_tab_sits_after_dokans_own_tabs_and_before_add_on_tabs() {
        $this->open_the_marketplace_to_vendors();

        // An add-on appends its tab the way the affiliate program does: priority 60, on an earlier filter run.
        add_filter(
            'dokan_get_vendor_settings_schema',
            static function ( $elements ) {
                $elements[] = [
                    'id'         => 'tab_add_on',
                    'type'       => 'tab',
                    'subpage_id' => 'store_settings',
                    'title'      => 'Add-on',
                    'priority'   => 60,
                ];

                return $elements;
            },
            20
        );

        $schema = $this->schema();
        $tab    = $schema[ VendorSettings::TAB ]['priority'];

        $this->assertGreaterThan( $schema['tab_general']['priority'], $tab );
        // Policies is the last of Dokan's own tabs, whether or not this vendor has it.
        $this->assertGreaterThan( 50, $tab );
        $this->assertLessThan( $schema['tab_add_on']['priority'], $tab );
    }

    public function test_vendor_staff_sign_in_as_themselves_not_as_their_vendor() {
        $this->open_the_marketplace_to_vendors();

        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );

        $this->assertSame( get_userdata( $staff_id )->user_login, $this->schema()[ VendorSettings::FIELD ]['username'] );
    }

    public function test_a_suspended_vendor_loses_the_tab() {
        $this->open_the_marketplace_to_vendors();

        dokan()->vendor->get( $this->seller_id1 )->make_inactive();

        $this->assertArrayNotHasKey( VendorSettings::TAB, $this->schema() );
    }

    public function test_wordpress_decides_whether_application_passwords_are_available() {
        $this->open_the_marketplace_to_vendors();

        $field = $this->schema()[ VendorSettings::FIELD ];

        $this->assertTrue( $field['available'] );
        $this->assertSame( '', $field['unavailable_text'] );

        // A security plugin switches them off for this account: the tab says so and offers nothing to connect with.
        add_filter( 'wp_is_application_passwords_available_for_user', '__return_false' );

        $schema = $this->schema();
        $field  = $schema[ VendorSettings::FIELD ];

        $this->assertFalse( $field['available'] );
        $this->assertNotSame( '', $field['unavailable_text'] );
        $this->assertArrayNotHasKey( VendorSettings::FIELD_ENDPOINT, $schema );

        remove_filter( 'wp_is_application_passwords_available', '__return_true' );
        add_filter( 'wp_is_application_passwords_available', '__return_false' );

        $field = $this->schema()[ VendorSettings::FIELD ];

        $this->assertFalse( $field['available'] );
        $this->assertNotSame( '', $field['unavailable_text'] );
    }

    public function test_a_store_save_never_writes_the_fields() {
        $this->open_the_marketplace_to_vendors();

        $before = get_user_meta( $this->seller_id1, 'dokan_profile_settings', true );

        $request = new WP_REST_Request( 'PUT', '/dokan/v1/vendor-settings/store' );
        $request->set_param(
            'values',
            [
                VendorSettings::FIELD          => 'anything a client might send',
                VendorSettings::FIELD_ENDPOINT => 'https://elsewhere.example/anything a client might send',
            ]
        );

        $response = rest_get_server()->dispatch( $request );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( $before, get_user_meta( $this->seller_id1, 'dokan_profile_settings', true ) );
        $this->assertStringNotContainsString( 'anything a client might send', wp_json_encode( $response->get_data() ) );

        // The copy field still says what the server says, not what the client sent.
        $saved = array_column( $response->get_data(), null, 'id' );

        $this->assertSame( Access::endpoint(), $saved[ VendorSettings::FIELD_ENDPOINT ]['value'] );
    }
}
