<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\Access;
use WeDevs\Dokan\Abilities\Mcp\Server;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 * @group mcp
 *
 * The Dokan server on the MCP Adapter: which abilities it offers as tools, and where.
 */
class ServerTest extends DokanTestCase {

    public function test_the_tool_list_is_dokans_abilities_and_the_scoped_woocommerce_ones() {
        $ids = Server::tool_ability_ids();

        $this->assertContains( 'dokan/current-vendor', $ids );
        $this->assertContains( 'dokan/orders-summary-get', $ids );
        $this->assertContains( 'woocommerce/products-query', $ids );
        $this->assertContains( 'woocommerce/order-add-note', $ids );
        $this->assertCount( 12, $ids );

        foreach ( $ids as $id ) {
            $this->assertTrue( Access::governs( $id ), $id );
        }
    }

    public function test_the_tool_list_is_filterable_and_deduplicated() {
        add_filter(
            'dokan_mcp_server_abilities',
            static function ( $ids ) {
                $ids[] = 'dokan-pro/coupons-query';
                $ids[] = 'dokan/current-vendor';
                $ids[] = 42;

                return $ids;
            }
        );

        $ids = Server::tool_ability_ids();

        $this->assertContains( 'dokan-pro/coupons-query', $ids );
        $this->assertSame( 1, count( array_keys( $ids, 'dokan/current-vendor', true ) ) );
        $this->assertNotContains( 42, $ids );
    }

    public function test_the_server_lives_under_the_adapters_namespace() {
        $this->assertSame( rest_url( 'mcp/dokan' ), Access::endpoint() );
        $this->assertSame( rest_url( 'mcp/mcp-adapter-default-server' ), Access::default_server_endpoint() );
    }

    public function test_a_switched_off_dokan_registers_no_server() {
        if ( ! class_exists( '\WP\MCP\Core\McpAdapter' ) ) {
            $this->markTestSkipped( 'The MCP adapter is not loaded.' );
        }

        $registered = 0;
        add_action(
            'dokan_mcp_server_registered',
            static function () use ( &$registered ) {
                ++$registered;
            }
        );

        ( new Server() )->register_server( \WP\MCP\Core\McpAdapter::instance() );

        $this->assertSame( 0, $registered );
    }

    public function test_the_server_is_created_on_the_adapter_with_the_registered_tools() {
        if ( ! class_exists( '\WP\MCP\Core\McpAdapter' ) ) {
            $this->markTestSkipped( 'The MCP adapter is not loaded.' );
        }

        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $adapter = \WP\MCP\Core\McpAdapter::instance();
        $tools   = null;

        add_action(
            'dokan_mcp_server_registered',
            static function ( $registered ) use ( &$tools ) {
                $tools = $registered;
            }
        );

        // The container's Server instance is hooked to this action; the adapter only accepts
        // servers while it runs, and keeps them for the rest of the process.
        $created = null === $adapter->get_server( Access::SERVER_ID );

        if ( $created ) {
            do_action( 'mcp_adapter_init', $adapter );
        }

        $server = $adapter->get_server( Access::SERVER_ID );

        $this->assertNotNull( $server, 'The Dokan server was not created.' );
        $this->assertSame( 'mcp', $server->get_server_route_namespace() );
        $this->assertSame( 'dokan', $server->get_server_route() );

        if ( $created ) {
            $this->assertSame( array_values( array_filter( Server::tool_ability_ids(), 'wp_has_ability' ) ), $tools );
            $this->assertContains( 'dokan/current-vendor', $tools );
            $this->assertContains( 'woocommerce/orders-query', $tools );
        }
    }

    public function test_the_instructions_are_one_filterable_paragraph() {
        $this->assertStringContainsString( 'dokan-current-vendor', Server::instructions() );
        $this->assertStringNotContainsString( "\n", Server::instructions() );

        add_filter( 'dokan_mcp_server_instructions', static fn() => 'Only this.' );

        $this->assertSame( 'Only this.', Server::instructions() );
    }
}
