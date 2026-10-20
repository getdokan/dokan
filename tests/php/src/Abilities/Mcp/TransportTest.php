<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\Catalog;
use WeDevs\Dokan\Abilities\Mcp\OAuth;
use WeDevs\Dokan\Abilities\Mcp\RateLimiter;
use WeDevs\Dokan\Abilities\Mcp\Server;
use WeDevs\Dokan\Abilities\Mcp\Session;
use WeDevs\Dokan\Abilities\Mcp\Tokens;
use WeDevs\Dokan\Abilities\Mcp\Transport;
use WeDevs\Dokan\Abilities\Support\RequestContext;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Error;
use WP_REST_Request;

/**
 * @group abilities
 * @group mcp
 *
 * The transport's authentication decision, in the order it is made, and the per-request state
 * the ability layer reads from it.
 */
class TransportTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();

        if ( ! class_exists( '\WP\MCP\Transport\HttpTransport' ) ) {
            $this->markTestSkipped( 'The MCP adapter is not loaded.' );
        }

        remove_all_filters( 'dokan_mcp_enabled' );
        remove_all_filters( 'dokan_mcp_vendor_access_enabled' );
        add_filter( 'dokan_mcp_allow_insecure_transport', '__return_true' );

        Session::reset();
        RequestContext::reset();
        RateLimiter::clear();
        wp_set_current_user( 0 );
    }

    /**
     * An MCP request carrying a bearer token.
     *
     * @param string $token Token, or '' for none.
     *
     * @return WP_REST_Request
     */
    private function request( string $token = '' ): WP_REST_Request {
        $request = new WP_REST_Request( 'POST', '/dokan/mcp' );

        if ( '' !== $token ) {
            $request->set_header( 'authorization', 'Bearer ' . $token );
        }

        return $request;
    }

    public function test_a_switched_off_server_refuses_everyone_the_same_way() {
        $token = Tokens::mint( $this->admin_id )['token'];

        $result = Transport::authenticate( $this->request( $token ) );

        $this->assertInstanceOf( WP_Error::class, $result );
        $this->assertSame( 'dokan_mcp_disabled', $result->get_error_code() );
        $this->assertSame( 0, Session::user_id() );
        $this->assertSame( 0, get_current_user_id() );
    }

    public function test_no_credential_is_a_401_with_a_challenge() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $result = Transport::authenticate( $this->request() );

        $this->assertInstanceOf( WP_Error::class, $result );
        $this->assertSame( 'dokan_mcp_unauthorized', $result->get_error_code() );
        $this->assertSame( 401, $result->get_error_data()['status'] );
        $this->assertStringContainsString( OAuth::resource_metadata_url(), Transport::challenge_header() );
        $this->assertNotFalse( has_filter( 'rest_post_dispatch', [ Transport::class, 'add_challenge_header' ] ) );
    }

    public function test_bad_tokens_are_counted_and_lock_the_client_out() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );
        add_filter(
            'dokan_mcp_rate_limits',
            static function () {
                return [
                    'max_fails' => 2,
                    'lockout'   => 60,
                ];
            }
        );

        $first = Transport::authenticate( $this->request( 'bogus' ) );
        $this->assertSame( 'dokan_mcp_unauthorized', $first->get_error_code() );

        Transport::authenticate( $this->request( 'bogus' ) );

        $third = Transport::authenticate( $this->request( 'bogus' ) );
        $this->assertSame( 'dokan_mcp_too_many_attempts', $third->get_error_code() );
        $this->assertSame( 429, $third->get_error_data()['status'] );

        // Even a good token waits out the window: the compare never runs for a locked client.
        $token = Tokens::mint( $this->admin_id )['token'];
        $this->assertSame( 'dokan_mcp_too_many_attempts', Transport::authenticate( $this->request( $token ) )->get_error_code() );
    }

    public function test_an_admin_token_authenticates_and_flags_the_ability_context() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $token = Tokens::mint( $this->admin_id )['token'];

        $this->assertTrue( Transport::authenticate( $this->request( $token ) ) );
        $this->assertSame( $this->admin_id, get_current_user_id() );
        $this->assertSame( $this->admin_id, Session::user_id() );
        $this->assertFalse( Session::is_read_only() );
        $this->assertTrue( RequestContext::is_ability_context() );
    }

    public function test_a_vendor_token_needs_vendor_access() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $token = Tokens::mint( $this->seller_id1 )['token'];

        $denied = Transport::authenticate( $this->request( $token ) );

        $this->assertInstanceOf( WP_Error::class, $denied );
        $this->assertSame( 'dokan_mcp_grant_revoked', $denied->get_error_code() );
        $this->assertSame( 0, get_current_user_id() );

        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        $this->assertTrue( Transport::authenticate( $this->request( $token ) ) );
        $this->assertSame( $this->seller_id1, get_current_user_id() );
        $this->assertTrue( RequestContext::is_vendor_ability_context() );
    }

    public function test_an_oauth_token_carries_its_scope() {
        add_filter( 'dokan_mcp_enabled', '__return_true' );
        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        $tokens = $this->oauth_tokens_for( $this->seller_id1, 'read' );

        $this->assertTrue( Transport::authenticate( $this->request( $tokens['access_token'] ) ) );
        $this->assertSame( $this->seller_id1, Session::user_id() );
        $this->assertTrue( Session::is_read_only() );
    }

    public function test_read_only_connections_are_refused_write_tools() {
        if ( ! function_exists( 'wp_has_ability' ) || ! wp_has_ability( 'woocommerce/product-update' ) || ! wp_has_ability( 'dokan/current-vendor' ) ) {
            $this->markTestSkipped( 'Abilities are not registered in this environment.' );
        }

        add_filter( 'dokan_mcp_enabled', '__return_true' );
        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        $server = new Server();
        $tokens = $this->oauth_tokens_for( $this->seller_id1, 'read' );

        Transport::authenticate( $this->request( $tokens['access_token'] ) );

        $this->assertTrue( $server->enforce_read_only_scope( true, 'dokan/current-vendor' ) );

        $refused = $server->enforce_read_only_scope( true, 'woocommerce/product-update' );

        $this->assertInstanceOf( WP_Error::class, $refused );
        $this->assertSame( 'dokan_mcp_read_only', $refused->get_error_code() );

        // A denial from the ability itself is never overturned, and a full-access session is untouched.
        $this->assertFalse( $server->enforce_read_only_scope( false, 'woocommerce/product-update' ) );

        Session::reset();
        $this->assertTrue( $server->enforce_read_only_scope( true, 'woocommerce/product-update' ) );
    }

    public function test_catalog_only_lists_registered_abilities_and_honours_the_filter() {
        if ( ! function_exists( 'wp_has_ability' ) ) {
            $this->markTestSkipped( 'The Abilities API is not loaded.' );
        }

        add_filter(
            'dokan_mcp_server_abilities',
            static function ( array $ids ) {
                $ids[] = 'dokan/does-not-exist';

                return array_values( array_diff( $ids, [ 'woocommerce/product-delete' ] ) );
            }
        );

        $ids = Catalog::ability_ids();

        $this->assertNotContains( 'dokan/does-not-exist', $ids );
        $this->assertNotContains( 'woocommerce/product-delete', $ids );

        if ( wp_has_ability( 'dokan/current-vendor' ) ) {
            $this->assertContains( 'dokan/current-vendor', $ids );
            $this->assertContains( 'dokan/orders-summary-get', $ids );
        }
    }

    /**
     * Run the OAuth flow for a user and return its tokens.
     *
     * @param int    $user_id Approving user.
     * @param string $scope   Requested scope.
     *
     * @return array
     */
    private function oauth_tokens_for( int $user_id, string $scope ): array {
        $redirect = 'https://claude.ai/api/mcp/auth_callback';
        $client   = OAuth::register_client( [ 'redirect_uris' => [ $redirect ] ] );
        $verifier = 'transport-verifier-transport-verifier-transport-verifier';
        $request  = OAuth::validate_authorize_request(
            [
                'client_id'             => $client['client_id'],
                'redirect_uri'          => $redirect,
                'response_type'         => 'code',
                'code_challenge'        => OAuth::s256( $verifier ),
                'code_challenge_method' => 'S256',
                'scope'                 => $scope,
            ]
        );

        return OAuth::grant(
            [
                'grant_type'    => 'authorization_code',
                'code'          => OAuth::issue_code( $request, $user_id ),
                'client_id'     => $client['client_id'],
                'redirect_uri'  => $redirect,
                'code_verifier' => $verifier,
            ]
        );
    }
}
