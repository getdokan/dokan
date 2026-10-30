<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\Access;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 * @group mcp
 *
 * Who may hold a Dokan MCP connection, and the switches behind it.
 */
class AccessTest extends DokanTestCase {

    public function test_switches_are_off_by_default() {
        $this->assertFalse( Access::is_enabled() );
        $this->assertFalse( Access::vendor_access_enabled() );
    }

    public function test_switches_read_the_ai_assist_section() {
        dokan_save_legacy_settings_section(
            Access::SETTING_SECTION,
            [
                Access::SETTING_ENABLED       => 'on',
                Access::SETTING_VENDOR_ACCESS => 'on',
            ]
        );
        $this->flush_settings_caches();

        $this->assertTrue( Access::is_enabled() );
        $this->assertTrue( Access::vendor_access_enabled() );
    }

    public function test_store_admin_can_always_connect() {
        $this->assertTrue( Access::user_can_connect( $this->admin_id ) );
    }

    public function test_vendor_needs_the_vendor_access_switch() {
        $this->assertFalse( Access::user_can_connect( $this->seller_id1 ) );

        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        $this->assertTrue( Access::user_can_connect( $this->seller_id1 ) );
    }

    public function test_suspended_vendor_cannot_connect() {
        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        dokan()->vendor->get( $this->seller_id1 )->make_inactive();

        $this->assertFalse( Access::user_can_connect( $this->seller_id1 ) );
    }

    public function test_vendor_staff_follow_their_vendor() {
        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        $staff_id = $this->create_vendor_staff( $this->seller_id1 );

        $this->assertTrue( Access::user_can_connect( $staff_id ) );
    }

    public function test_customers_and_unknown_users_cannot_connect() {
        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        $this->assertFalse( Access::user_can_connect( $this->customer_id ) );
        $this->assertFalse( Access::user_can_connect( 0 ) );
        $this->assertFalse( Access::user_can_connect( 999999 ) );
    }

    public function test_endpoint_is_the_rest_route_of_the_server() {
        $this->assertSame( rest_url( 'dokan/mcp' ), Access::endpoint() );
    }

    public function test_the_endpoint_is_recognised_from_the_raw_request() {
        $backup = $_SERVER;

        $_SERVER['REQUEST_URI'] = '/wp-json/dokan/mcp';
        $this->assertTrue( Access::is_request_to_endpoint() );

        $_SERVER['REQUEST_URI'] = '/wp-json/dokan/mcp?foo=bar';
        $this->assertTrue( Access::is_request_to_endpoint() );

        // Neighbouring routes are not the endpoint.
        $_SERVER['REQUEST_URI'] = '/wp-json/dokan/mcp-other';
        $this->assertFalse( Access::is_request_to_endpoint() );

        $_SERVER['REQUEST_URI'] = '/wp-json/dokan/v1/mcp/settings';
        $this->assertFalse( Access::is_request_to_endpoint() );

        $_SERVER = $backup;
    }
}
