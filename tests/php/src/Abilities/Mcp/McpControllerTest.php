<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\OAuth;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 * @group mcp
 *
 * The OAuth REST routes around the MCP server.
 */
class McpControllerTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();
        remove_all_filters( 'dokan_mcp_enabled' );
        OAuth::revoke_all();
        wp_set_current_user( 0 );
    }

    public function test_oauth_routes_answer_only_while_the_server_is_on() {
        $this->assertSame( 404, $this->get_request( '/mcp/oauth/authorization-server' )->get_status() );
        $this->assertSame( 404, $this->get_request( '/mcp/oauth/protected-resource' )->get_status() );
        $this->assertSame( 404, $this->post_request( '/mcp/oauth/register', [ 'redirect_uris' => [ 'https://claude.ai/cb' ] ] )->get_status() );
        $this->assertSame( 404, $this->post_request( '/mcp/oauth/token', [ 'grant_type' => 'authorization_code' ] )->get_status() );

        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $metadata = $this->get_request( '/mcp/oauth/authorization-server' );

        $this->assertSame( 200, $metadata->get_status() );
        $this->assertSame( OAuth::issuer(), $metadata->get_data()['issuer'] );
        $this->assertSame( [ OAuth::issuer() ], $this->get_request( '/mcp/oauth/protected-resource' )->get_data()['authorization_servers'] );
    }

    public function test_registration_and_token_exchange_follow_the_oauth_shapes() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $registered = $this->post_request(
            '/mcp/oauth/register',
            [
                'redirect_uris' => [ 'https://claude.ai/cb' ],
                'client_name'   => 'Claude',
            ]
        );

        $this->assertSame( 201, $registered->get_status() );
        $this->assertStringStartsWith( 'dk_', $registered->get_data()['client_id'] );
        $this->assertSame( 'no-store', $registered->get_headers()['Cache-Control'] );

        $refused = $this->post_request(
            '/mcp/oauth/register',
            [ 'redirect_uris' => [ 'javascript://alert(1)' ] ]
        );

        $this->assertSame( 400, $refused->get_status() );
        $this->assertSame( 'invalid_redirect_uri', $refused->get_data()['error'] );

        $bad_code = $this->post_request(
            '/mcp/oauth/token',
            [
                'grant_type' => 'authorization_code',
                'code'       => 'nope',
            ]
        );

        $this->assertSame( 400, $bad_code->get_status() );
        $this->assertSame( 'invalid_grant', $bad_code->get_data()['error'] );
        $this->assertArrayHasKey( 'error_description', $bad_code->get_data() );
    }

    public function test_path_suffix_discovery_lives_under_the_mcp_endpoint() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $request  = new \WP_REST_Request( 'GET', '/dokan/mcp/.well-known/oauth-authorization-server' );
        $response = $this->server->dispatch( $request );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( OAuth::token_url(), $response->get_data()['token_endpoint'] );

        $request  = new \WP_REST_Request( 'GET', '/dokan/mcp/.well-known/oauth-protected-resource' );
        $response = $this->server->dispatch( $request );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( OAuth::resource(), $response->get_data()['resource'] );
    }
}
