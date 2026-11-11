<?php

namespace WeDevs\Dokan\Test\Abilities;

use WeDevs\Dokan\Abilities\Mcp\Access;
use WeDevs\Dokan\Abilities\Mcp\Server;
use WeDevs\Dokan\Abilities\Support\RequestContext;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 *
 * Tests how a REST request is recognised as a request to an MCP endpoint.
 *
 * Each test defines REST_REQUEST, so each runs in its own process.
 *
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
class RequestContextTest extends DokanTestCase {

    /**
     * Simulate WordPress serving a REST request.
     *
     * @param string $request_uri Raw request URI, as the client sent it.
     * @param string $route       REST route WordPress dispatches for it.
     *
     * @return void
     */
    private function serve_rest_request( string $request_uri, string $route ): void {
        if ( ! defined( 'REST_REQUEST' ) ) {
            define( 'REST_REQUEST', true );
        }

        $_SERVER['REQUEST_URI']                  = $request_uri;
        $GLOBALS['wp']->query_vars['rest_route'] = $route;

        // WordPress serves REST from inside `parse_request`, so the route is known by then.
        if ( ! did_action( 'parse_request' ) ) {
            remove_all_actions( 'parse_request' );
            do_action( 'parse_request' );
        }
    }

    public function test_request_uri_does_not_identify_an_mcp_request() {
        $route = '/wc/v3/products/1';

        $request_uris = [
            '/wp-json' . $route . '?x=/dokan/mcp/',
            '/wp-json' . $route . '?x=/woocommerce/mcp',
            '/wp-json' . $route . '?x=/wp-json/mcp/mcp-adapter-default-server',
            '/wp-json/woocommerce/mcp/?rest_route=' . $route,
            '/wp-json/mcp/mcp-adapter-default-server?rest_route=' . $route,
        ];

        foreach ( $request_uris as $request_uri ) {
            $this->serve_rest_request( $request_uri, $route );

            $this->assertFalse( RequestContext::is_ability_context(), $request_uri );
            $this->assertFalse( RequestContext::is_mcp_request(), $request_uri );
            $this->assertFalse( Access::is_request_to_endpoint(), $request_uri );
        }
    }

    public function test_dokans_server_is_only_built_for_its_own_route() {
        foreach ( [ '/dokan/mcp', '/Dokan/MCP', '/dokan/mcp/' ] as $route ) {
            $this->serve_rest_request( '/wp-json' . $route, $route );

            $this->assertTrue( Access::is_request_to_endpoint(), $route );
            $this->assertTrue( Server::serves_this_request(), $route );
        }

        foreach ( [ '/mcp/mcp-adapter-default-server', '/woocommerce/mcp', '/dokan/v1/stores', '/dokan/mcpx' ] as $route ) {
            $this->serve_rest_request( '/wp-json' . $route . '?x=/dokan/mcp', $route );

            $this->assertFalse( Access::is_request_to_endpoint(), $route );
            $this->assertFalse( Server::serves_this_request(), $route );
        }
    }

    public function test_dokans_server_is_not_built_outside_a_rest_request() {
        // wp-admin builds the REST server too (editor preloads), where no assistant can reach the endpoint.
        set_current_screen( 'dashboard' );

        $this->assertFalse( Access::is_request_to_endpoint() );
        $this->assertFalse( Server::serves_this_request() );
    }

    public function test_dispatched_mcp_route_is_an_ability_context() {
        $routes = [
            '/mcp/mcp-adapter-default-server',
            '/MCP/Mcp-Adapter-Default-Server',
            '/mcp/another-server',
            '/woocommerce/mcp',
            '/WooCommerce/MCP',
            '/dokan/mcp',
            '/Dokan/MCP/',
        ];

        foreach ( $routes as $route ) {
            $this->serve_rest_request( '/wp-json' . $route, $route );

            $this->assertTrue( RequestContext::is_ability_context(), $route );
            $this->assertTrue( RequestContext::is_mcp_request(), $route );
        }

        foreach ( [ '/woocommerce/mcpx', '/mcpx/server', '/dokan/mcpx', '/dokan/v1/stores' ] as $route ) {
            $this->serve_rest_request( '/wp-json' . $route, $route );

            $this->assertFalse( RequestContext::is_ability_context(), $route );
        }
    }
}
