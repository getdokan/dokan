<?php

namespace WeDevs\Dokan\Test\Abilities;

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
    }

    public function test_request_uri_does_not_identify_an_mcp_request() {
        $route = '/wc/v3/products/1';

        $request_uris = [
            '/wp-json' . $route . '?x=/dokan/mcp/',
            '/wp-json' . $route . '?x=/woocommerce/mcp',
            '/wp-json/woocommerce/mcp/?rest_route=' . $route,
        ];

        foreach ( $request_uris as $request_uri ) {
            $this->serve_rest_request( $request_uri, $route );

            $this->assertFalse( RequestContext::is_ability_context(), $request_uri );
        }
    }

    public function test_dispatched_mcp_route_is_an_ability_context() {
        foreach ( [ '/woocommerce/mcp', '/WooCommerce/MCP', '/dokan/mcp' ] as $route ) {
            $this->serve_rest_request( '/wp-json' . $route, $route );

            $this->assertTrue( RequestContext::is_ability_context(), $route );
        }

        $this->serve_rest_request( '/wp-json/woocommerce/mcpx', '/woocommerce/mcpx' );

        $this->assertFalse( RequestContext::is_ability_context() );
    }
}
