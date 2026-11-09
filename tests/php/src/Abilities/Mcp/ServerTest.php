<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\Access;
use WeDevs\Dokan\Abilities\Mcp\Server;
use WeDevs\Dokan\Abilities\Mcp\Transport;
use WeDevs\Dokan\Abilities\Support\RequestContext;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Error;
use WP_REST_Request;

/**
 * @group abilities
 * @group mcp
 *
 * Dokan's server on the MCP Adapter: the tools it names, how it is registered, and who it lets in.
 */
class ServerTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();

        RequestContext::reset();
        wp_set_current_user( 0 );
    }

    public function tear_down() {
        RequestContext::reset();
        unset( $GLOBALS['wp']->query_vars['rest_route'] );

        parent::tear_down();
    }

    /**
     * Simulate WordPress serving a REST request to Dokan's own route.
     *
     * Defines REST_REQUEST, so a test calling this must run in its own process.
     *
     * @return void
     */
    private function serve_dokan_mcp_route(): void {
        if ( ! defined( 'REST_REQUEST' ) ) {
            define( 'REST_REQUEST', true );
        }

        $GLOBALS['wp']->query_vars['rest_route'] = '/' . Access::ROUTE_NAMESPACE . '/' . Access::ROUTE;
    }

    /**
     * A stand-in for the adapter that records what Dokan asks it to create.
     *
     * @param mixed $result What `create_server()` answers.
     *
     * @return object
     */
    private function fake_adapter( $result = true ) {
        return new class( $result ) {

            public array $calls = [];

            private $result;

            public function __construct( $result ) {
                $this->result = $result;
            }

            public function create_server( ...$args ) {
                $this->calls[] = $args;

                return $this->result;
            }
        };
    }

    public function test_the_tools_are_dokans_abilities_and_the_scoped_woocommerce_ones_by_name() {
        $abilities = Server::configured_abilities();

        $this->assertCount( 13, Server::ABILITIES );
        $this->assertContains( 'dokan/current-vendor', $abilities );
        $this->assertContains( 'dokan/orders-summary-get', $abilities );
        $this->assertContains( 'woocommerce/products-query', $abilities );
        $this->assertContains( 'woocommerce/order-notes-query', $abilities );

        // No Dokan-named copy of a WooCommerce ability, and the named ones are all under the access policy.
        $this->assertNotContains( 'dokan/products-query', $abilities );

        foreach ( Server::ABILITIES as $ability ) {
            $this->assertContains( $ability, $abilities );
            $this->assertTrue( Access::governs( $ability ), $ability );
        }
    }

    public function test_the_server_follows_what_the_default_server_offers() {
        // Marked public for MCP by its owner, as WooCommerce's abilities are: offered here too.
        $this->assertTrue(
            Server::is_offered_by_default_server(
                [
                    'mcp' => [
                        'public' => true,
                        'type'   => 'tool',
                    ],
                ]
            )
        );

        // Kept off MCP by its owner, a resource or prompt, or malformed: not a tool here either.
        $this->assertFalse( Server::is_offered_by_default_server( [ 'mcp' => [ 'public' => false ] ] ) );
        $this->assertFalse( Server::is_offered_by_default_server( [] ) );
        $this->assertFalse(
            Server::is_offered_by_default_server(
                [
                    'mcp' => [
                        'public' => true,
                        'type'   => 'resource',
                    ],
                ]
            )
        );
        $this->assertFalse( Server::is_offered_by_default_server( [ 'mcp' => 'yes' ] ) );

        // Whatever the default server offers on this site is offered by Dokan's, beside its own.
        foreach ( Server::default_server_abilities() as $ability ) {
            $this->assertContains( $ability, Server::configured_abilities() );
        }

        // Dokan's own abilities are not the default server's.
        $this->assertNotContains( 'dokan/current-vendor', Server::default_server_abilities() );
    }

    public function test_the_tool_list_is_filterable_and_deduplicated() {
        add_filter(
            'dokan_mcp_server_abilities',
            static function ( $abilities ) {
                $abilities[] = 'dokan/coupons-query';
                $abilities[] = 'dokan/current-vendor';
                $abilities[] = 42;

                return $abilities;
            }
        );

        $abilities = Server::configured_abilities();

        $this->assertContains( 'dokan/coupons-query', $abilities );
        $this->assertCount( 1, array_keys( $abilities, 'dokan/current-vendor', true ) );
        $this->assertNotContains( 42, $abilities );

        // Only an ability registered on this site becomes a tool.
        $this->assertNotContains( 'dokan/coupons-query', Server::tools() );
    }

    /**
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function test_the_server_is_created_on_the_adapter_with_the_named_tools() {
        if ( ! function_exists( 'wp_has_ability' ) ) {
            $this->markTestSkipped( 'The Abilities API is not available.' );
        }

        $this->serve_dokan_mcp_route();

        $registered = null;
        add_action(
            'dokan_mcp_server_registered',
            static function ( $tools ) use ( &$registered ) {
                $registered = $tools;
            }
        );

        $adapter = $this->fake_adapter();

        // Registered with the master switch off too: the door answers with the reason.
        ( new Server() )->register_server( $adapter );

        $this->assertCount( 1, $adapter->calls );

        $args = $adapter->calls[0];

        $this->assertSame( 'dokan-mcp', $args[0] );
        $this->assertSame( 'dokan', $args[1] );
        $this->assertSame( 'mcp', $args[2] );
        $this->assertSame( Server::instructions(), $args[4] );
        $this->assertSame( [ Transport::class ], $args[6] );
        $this->assertSame( Server::tools(), $args[9] );
        $this->assertContains( 'dokan/current-vendor', $args[9] );
        // No permission callback is handed over: the transport answers, so the reason reaches the client.
        $this->assertCount( 10, $args );
        $this->assertSame( $args[9], $registered );
    }

    /**
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function test_a_failed_registration_is_not_announced() {
        $this->serve_dokan_mcp_route();

        $announced = 0;
        add_action(
            'dokan_mcp_server_registered',
            static function () use ( &$announced ) {
                ++$announced;
            }
        );

        $adapter = $this->fake_adapter( new WP_Error( 'invalid_server', 'Nope.' ) );

        ( new Server() )->register_server( $adapter );
        ( new Server() )->register_server( 'not an adapter' );

        $this->assertCount( 1, $adapter->calls );
        $this->assertSame( 0, $announced );
    }

    public function test_the_server_is_not_built_for_another_request() {
        $adapter = $this->fake_adapter();

        // Not a REST request to the endpoint: the adapter is never asked.
        ( new Server() )->register_server( $adapter );

        $this->assertSame( [], $adapter->calls );
    }

    public function test_nobody_connects_without_signing_in() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $refused = Server::authorize();

        $this->assertInstanceOf( WP_Error::class, $refused );
        $this->assertSame( 'dokan_mcp_unauthorized', $refused->get_error_code() );
        $this->assertSame( 401, $refused->get_error_data()['status'] );
        // An application password is the only credential named.
        $this->assertStringNotContainsStringIgnoringCase( 'consumer', $refused->get_error_message() );
    }

    public function test_a_switched_off_marketplace_refuses_everyone_with_the_reason() {
        wp_set_current_user( $this->admin_id );

        $refused = Server::authorize();

        $this->assertInstanceOf( WP_Error::class, $refused );
        $this->assertSame( 'dokan_mcp_disabled', $refused->get_error_code() );
        $this->assertSame( 403, $refused->get_error_data()['status'] );

        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $this->assertTrue( Server::authorize() );
    }

    public function test_a_vendor_connects_only_while_vendor_access_is_on() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );
        wp_set_current_user( $this->seller_id1 );

        $refused = Server::authorize();

        $this->assertInstanceOf( WP_Error::class, $refused );
        $this->assertSame( 'dokan_mcp_not_allowed', $refused->get_error_code() );
        $this->assertSame( 403, $refused->get_error_data()['status'] );

        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        $this->assertTrue( Server::authorize() );

        wp_set_current_user( $this->create_vendor_staff( $this->seller_id1 ) );
        $this->assertTrue( Server::authorize() );

        wp_set_current_user( $this->customer_id );
        $this->assertSame( 'dokan_mcp_not_allowed', Server::authorize()->get_error_code() );

        dokan()->vendor->get( $this->seller_id1 )->make_inactive();
        wp_set_current_user( $this->seller_id1 );
        $this->assertSame( 'dokan_mcp_not_allowed', Server::authorize()->get_error_code() );
    }

    public function test_the_transport_marks_an_admitted_request_as_mcp() {
        if ( ! class_exists( '\WP\MCP\Transport\HttpTransport' ) ) {
            $this->markTestSkipped( 'The MCP adapter is not loaded.' );
        }

        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $transport = ( new \ReflectionClass( Transport::class ) )->newInstanceWithoutConstructor();

        $this->assertInstanceOf( WP_Error::class, $transport->check_permission( new WP_REST_Request() ) );
        $this->assertFalse( RequestContext::is_mcp_request() );

        wp_set_current_user( $this->admin_id );

        $this->assertTrue( $transport->check_permission( new WP_REST_Request() ) );
        $this->assertTrue( RequestContext::is_mcp_request() );
    }

    public function test_the_instructions_are_one_filterable_paragraph() {
        $this->assertStringContainsString( 'dokan-current-vendor', Server::instructions() );
        $this->assertStringNotContainsString( "\n", Server::instructions() );

        add_filter( 'dokan_mcp_server_instructions', static fn() => 'Only this.' );

        $this->assertSame( 'Only this.', Server::instructions() );
    }
}
