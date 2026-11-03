<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\Gate;
use WeDevs\Dokan\Abilities\Support\RequestContext;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Error;

/**
 * @group abilities
 * @group mcp
 *
 * The marketplace's AI assistant policy, applied where the MCP Adapter's default server looks:
 * the exposure flag of Dokan's abilities and the permission callback of every governed ability.
 */
class GateTest extends DokanTestCase {

    /**
     * @var Gate
     */
    private Gate $gate;

    public function set_up() {
        parent::set_up();

        RequestContext::reset();
        wp_set_current_user( 0 );

        $this->gate = new Gate();
    }

    public function tear_down() {
        RequestContext::reset();

        parent::tear_down();
    }

    public function test_dokan_abilities_are_exposed_only_while_the_switch_is_on() {
        $args = [
            'meta' => [
                'mcp' => [
                    'public' => true,
                    'type'   => 'tool',
                ],
            ],
        ];

        $this->assertFalse( $this->gate->follow_the_switch( $args, 'dokan/current-vendor' )['meta']['mcp']['public'] );

        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $this->assertTrue( $this->gate->follow_the_switch( $args, 'dokan/current-vendor' )['meta']['mcp']['public'] );
        $this->assertSame( 'tool', $this->gate->follow_the_switch( $args, 'dokan/current-vendor' )['meta']['mcp']['type'] );

        // An ability registered without MCP meta gets the flag too; WooCommerce's are left alone.
        $this->assertTrue( $this->gate->follow_the_switch( [], 'dokan/vendors-query' )['meta']['mcp']['public'] );
        $this->assertSame( $args, $this->gate->follow_the_switch( $args, 'woocommerce/orders-query' ) );
    }

    public function test_the_gate_is_inert_outside_an_mcp_request() {
        wp_set_current_user( $this->seller_id1 );

        // Switch off, vendor access off, and still nothing is refused: this is not an MCP request.
        $this->assertTrue( $this->gate->authorize( true, 'dokan/current-vendor' ) );
        $this->assertTrue( $this->gate->authorize( true, 'woocommerce/orders-query' ) );
        $this->assertFalse( $this->gate->authorize( false, 'dokan/current-vendor' ) );
    }

    public function test_a_switched_off_dokan_refuses_its_own_tools_over_mcp_to_everyone() {
        RequestContext::flag_mcp_request();
        wp_set_current_user( $this->admin_id );

        $refused = $this->gate->authorize( true, 'dokan/current-vendor' );

        $this->assertInstanceOf( WP_Error::class, $refused );
        $this->assertSame( 'dokan_mcp_disabled', $refused->get_error_code() );
        $this->assertSame( 403, $refused->get_error_data()['status'] );

        // WooCommerce's abilities stay the Store Admin's to use.
        $this->assertTrue( $this->gate->authorize( true, 'woocommerce/orders-query' ) );
    }

    public function test_a_vendor_needs_both_switches_over_mcp() {
        RequestContext::flag_mcp_request();
        wp_set_current_user( $this->seller_id1 );

        // Vendor access alone is not enough: the master switch closes it too.
        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );
        $this->assertSame( 'dokan_mcp_not_allowed', $this->gate->authorize( true, 'woocommerce/orders-query' )->get_error_code() );

        remove_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );
        add_filter( 'dokan_mcp_enabled', '__return_true' );

        foreach ( [ 'dokan/current-vendor', 'woocommerce/orders-query', 'woocommerce/order-notes-query', 'woocommerce/product-update' ] as $ability ) {
            $refused = $this->gate->authorize( true, $ability );

            $this->assertInstanceOf( WP_Error::class, $refused, $ability );
            $this->assertSame( 'dokan_mcp_not_allowed', $refused->get_error_code(), $ability );
        }

        // Abilities Dokan does not govern are not its call.
        $this->assertTrue( $this->gate->authorize( true, 'core/get-site-info' ) );

        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        $this->assertTrue( $this->gate->authorize( true, 'dokan/current-vendor' ) );
        $this->assertTrue( $this->gate->authorize( true, 'woocommerce/orders-query' ) );
        // A refusal decided by the ability itself is left standing.
        $this->assertFalse( $this->gate->authorize( false, 'woocommerce/orders-query' ) );
    }

    public function test_a_suspended_vendor_and_a_customer_are_refused_over_mcp() {
        RequestContext::flag_mcp_request();
        add_filter( 'dokan_mcp_enabled', '__return_true' );
        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        wp_set_current_user( $this->customer_id );
        $this->assertSame( 'dokan_mcp_not_allowed', $this->gate->authorize( true, 'dokan/current-vendor' )->get_error_code() );
        $this->assertSame( 'dokan_mcp_not_allowed', $this->gate->authorize( true, 'woocommerce/products-query' )->get_error_code() );

        dokan()->vendor->get( $this->seller_id1 )->make_inactive();
        wp_set_current_user( $this->seller_id1 );
        $this->assertSame( 'dokan_mcp_not_allowed', $this->gate->authorize( true, 'woocommerce/products-query' )->get_error_code() );
    }

    /**
     * The policy lives in the permission callback itself, so it holds on every WordPress with
     * the Abilities API, not only where the 7.1 permission-result filter exists.
     */
    public function test_the_policy_is_wrapped_into_the_permission_callback() {
        $calls = 0;
        $args  = [
            'permission_callback' => static function () use ( &$calls ) {
                ++$calls;

                return true;
            },
        ];

        $guarded = $this->gate->guard_registration( $args, 'woocommerce/orders-query' );
        $this->assertNotSame( $args['permission_callback'], $guarded['permission_callback'] );

        // Not an MCP request: the ability's own answer stands.
        wp_set_current_user( $this->seller_id1 );
        $this->assertTrue( call_user_func( $guarded['permission_callback'], [] ) );
        $this->assertSame( 1, $calls );

        RequestContext::flag_mcp_request();
        $refused = call_user_func( $guarded['permission_callback'], [] );

        $this->assertInstanceOf( WP_Error::class, $refused );
        $this->assertSame( 'dokan_mcp_not_allowed', $refused->get_error_code() );

        wp_set_current_user( $this->admin_id );
        $this->assertTrue( call_user_func( $guarded['permission_callback'], [] ) );

        // An ability outside the policy keeps its callback as registered.
        $this->assertSame( $args['permission_callback'], $this->gate->guard_registration( $args, 'core/get-site-info' )['permission_callback'] );
    }

    public function test_the_adapters_capability_filters_flag_the_request() {
        RequestContext::register_detection_hooks();

        $this->assertFalse( RequestContext::is_mcp_request() );

        foreach ( RequestContext::ADAPTER_CAPABILITY_FILTERS as $filter ) {
            RequestContext::reset();
            RequestContext::register_detection_hooks();

            $this->assertSame( 'read', apply_filters( $filter, 'read', null ), $filter );
            $this->assertTrue( RequestContext::is_mcp_request(), $filter );
        }
    }

    public function test_the_instructions_are_appended_to_the_default_server_description() {
        $config = [ 'server_description' => 'Default MCP server.' ];

        // Switched off, the adapter's description is left alone.
        $this->assertSame( $config, $this->gate->add_instructions( $config ) );

        add_filter( 'dokan_mcp_enabled', '__return_true' );
        $described = $this->gate->add_instructions( $config )['server_description'];

        $this->assertStringStartsWith( 'Default MCP server. ', $described );
        $this->assertStringContainsString( 'dokan/current-vendor', $described );
        $this->assertStringNotContainsString( "\n", Gate::instructions() );
    }

    public function test_only_dokan_tool_calls_over_mcp_leave_a_trail() {
        $calls = [];
        add_action(
            'dokan_mcp_ability_invoked',
            function ( $name, $input, $user_id ) use ( &$calls ) {
                $calls[] = [ $name, $user_id ];
            },
            10,
            3
        );

        wp_set_current_user( $this->admin_id );

        $this->gate->record_invocation( 'dokan/current-vendor', [] );
        $this->assertSame( [], $calls );

        RequestContext::flag_mcp_request();

        $this->gate->record_invocation( 'dokan/current-vendor', [] );
        $this->gate->record_invocation( 'woocommerce/orders-query', [] );

        $this->assertSame( [ [ 'dokan/current-vendor', $this->admin_id ] ], $calls );
    }
}
