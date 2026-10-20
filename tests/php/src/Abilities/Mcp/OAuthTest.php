<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\Access;
use WeDevs\Dokan\Abilities\Mcp\Consent;
use WeDevs\Dokan\Abilities\Mcp\OAuth;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Error;

/**
 * @group abilities
 * @group mcp
 *
 * OAuth 2.1 for the MCP endpoint: registration, PKCE, single-use codes, rotating refresh tokens.
 */
class OAuthTest extends DokanTestCase {

    const REDIRECT = 'https://claude.ai/api/mcp/auth_callback';

    public function set_up() {
        parent::set_up();
        OAuth::revoke_all();
    }

    /**
     * Register a client and return its id.
     *
     * @return string
     */
    private function register(): string {
        $client = OAuth::register_client(
            [
                'client_name'   => 'Claude',
                'redirect_uris' => [ self::REDIRECT ],
            ]
        );

        $this->assertIsArray( $client );

        return $client['client_id'];
    }

    /**
     * Walk the consent half of the flow and return the authorization code.
     *
     * @param string $client_id Registered client.
     * @param string $verifier  PKCE verifier.
     * @param int    $user_id   Approving user.
     * @param string $scope     Requested scope.
     *
     * @return string
     */
    private function approve( string $client_id, string $verifier, int $user_id, string $scope = 'mcp' ): string {
        $request = OAuth::validate_authorize_request(
            [
                'client_id'             => $client_id,
                'redirect_uri'          => self::REDIRECT,
                'response_type'         => 'code',
                'code_challenge'        => OAuth::s256( $verifier ),
                'code_challenge_method' => 'S256',
                'scope'                 => $scope,
                'state'                 => 'xyz',
            ]
        );

        $this->assertIsArray( $request );

        return OAuth::issue_code( $request, $user_id );
    }

    public function test_s256_matches_the_rfc_7636_test_vector() {
        $this->assertSame( 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', OAuth::s256( 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk' ) );
    }

    public function test_registration_requires_a_usable_redirect_uri() {
        $this->assertInstanceOf( WP_Error::class, OAuth::register_client( [] ) );
        $this->assertInstanceOf( WP_Error::class, OAuth::register_client( [ 'redirect_uris' => [ 'javascript://alert(1)' ] ] ) );

        $client = OAuth::register_client( [ 'redirect_uris' => [ self::REDIRECT, 'not a url' ] ] );

        $this->assertSame( [ self::REDIRECT ], $client['redirect_uris'] );
        $this->assertSame( 'none', $client['token_endpoint_auth_method'] );
        $this->assertStringStartsWith( 'dk_', $client['client_id'] );
    }

    public function test_authorize_request_never_redirects_to_an_untrusted_destination() {
        $client_id = $this->register();

        $unknown = OAuth::validate_authorize_request( [ 'client_id' => 'dk_nope', 'redirect_uri' => self::REDIRECT ] );
        $this->assertInstanceOf( WP_Error::class, $unknown );
        $this->assertArrayNotHasKey( 'redirectable', (array) $unknown->get_error_data() );

        $mismatch = OAuth::validate_authorize_request( [ 'client_id' => $client_id, 'redirect_uri' => 'https://attacker.example/cb' ] );
        $this->assertInstanceOf( WP_Error::class, $mismatch );
        $this->assertArrayNotHasKey( 'redirectable', (array) $mismatch->get_error_data() );

        // A registered client at its registered callback may be told why it was refused.
        $no_pkce = OAuth::validate_authorize_request( [ 'client_id' => $client_id, 'redirect_uri' => self::REDIRECT, 'response_type' => 'code' ] );
        $this->assertInstanceOf( WP_Error::class, $no_pkce );
        $this->assertTrue( $no_pkce->get_error_data()['redirectable'] );
    }

    public function test_code_exchange_requires_the_matching_verifier_and_burns_the_code() {
        $client_id = $this->register();
        $code      = $this->approve( $client_id, 'correct-verifier-correct-verifier-correct-verifier', $this->seller_id1 );

        $wrong = OAuth::grant(
            [
                'grant_type'    => 'authorization_code',
                'code'          => $code,
                'client_id'     => $client_id,
                'redirect_uri'  => self::REDIRECT,
                'code_verifier' => 'wrong-verifier',
            ]
        );

        $this->assertInstanceOf( WP_Error::class, $wrong );
        $this->assertSame( 'invalid_grant', $wrong->get_error_code() );

        // Burned before verification: the right verifier gets no second attempt either.
        $retry = OAuth::grant(
            [
                'grant_type'    => 'authorization_code',
                'code'          => $code,
                'client_id'     => $client_id,
                'redirect_uri'  => self::REDIRECT,
                'code_verifier' => 'correct-verifier-correct-verifier-correct-verifier',
            ]
        );

        $this->assertInstanceOf( WP_Error::class, $retry );
    }

    public function test_tokens_are_bound_to_the_approving_user_and_scope() {
        $client_id = $this->register();
        $verifier  = 'vendor-verifier-vendor-verifier-vendor-verifier-x';
        $code      = $this->approve( $client_id, $verifier, $this->seller_id1, 'read' );

        $tokens = OAuth::grant(
            [
                'grant_type'    => 'authorization_code',
                'code'          => $code,
                'client_id'     => $client_id,
                'redirect_uri'  => self::REDIRECT,
                'code_verifier' => $verifier,
            ]
        );

        $this->assertIsArray( $tokens );
        $this->assertSame( 'Bearer', $tokens['token_type'] );
        $this->assertSame( 'read', $tokens['scope'] );

        $grant = OAuth::validate_token( $tokens['access_token'] );

        $this->assertSame( $this->seller_id1, (int) $grant['user_id'] );
        $this->assertTrue( OAuth::scope_is_read_only( $grant['scope'] ) );
        $this->assertNull( OAuth::validate_token( 'bogus' ) );

        $apps = OAuth::connected_apps();

        $this->assertCount( 1, $apps );
        $this->assertSame( $client_id, $apps[0]['client_id'] );
        $this->assertSame( 'vendor', $apps[0]['user_role'] );
        $this->assertTrue( $apps[0]['read_only'] );
        $this->assertSame( [ self::REDIRECT ], $apps[0]['redirect_uris'] );
    }

    public function test_refresh_rotates_and_revokes_the_previous_pair() {
        $client_id = $this->register();
        $verifier  = 'refresh-verifier-refresh-verifier-refresh-verifier';
        $code      = $this->approve( $client_id, $verifier, $this->admin_id );
        $first     = OAuth::grant(
            [
                'grant_type'    => 'authorization_code',
                'code'          => $code,
                'client_id'     => $client_id,
                'redirect_uri'  => self::REDIRECT,
                'code_verifier' => $verifier,
            ]
        );

        $second = OAuth::grant(
            [
                'grant_type'    => 'refresh_token',
                'refresh_token' => $first['refresh_token'],
                'client_id'     => $client_id,
            ]
        );

        $this->assertIsArray( $second );
        $this->assertNotSame( $first['access_token'], $second['access_token'] );
        $this->assertNull( OAuth::validate_token( $first['access_token'] ) );
        $this->assertSame( $this->admin_id, (int) OAuth::validate_token( $second['access_token'] )['user_id'] );

        // A stolen refresh token replayed after rotation is dead.
        $replay = OAuth::grant(
            [
                'grant_type'    => 'refresh_token',
                'refresh_token' => $first['refresh_token'],
                'client_id'     => $client_id,
            ]
        );

        $this->assertInstanceOf( WP_Error::class, $replay );
    }

    public function test_revoking_a_client_or_a_user_kills_their_tokens() {
        $client_id = $this->register();
        $verifier  = 'revoke-verifier-revoke-verifier-revoke-verifier-x';
        $code      = $this->approve( $client_id, $verifier, $this->seller_id1 );
        $tokens    = OAuth::grant(
            [
                'grant_type'    => 'authorization_code',
                'code'          => $code,
                'client_id'     => $client_id,
                'redirect_uri'  => self::REDIRECT,
                'code_verifier' => $verifier,
            ]
        );

        $this->assertTrue( OAuth::revoke_client( $client_id ) );
        $this->assertNull( OAuth::validate_token( $tokens['access_token'] ) );
        $this->assertCount( 0, OAuth::connected_apps() );
        // The registration survives so the client can reconnect through consent.
        $this->assertNotNull( OAuth::client( $client_id ) );

        $code   = $this->approve( $client_id, $verifier, $this->seller_id1 );
        $tokens = OAuth::grant(
            [
                'grant_type'    => 'authorization_code',
                'code'          => $code,
                'client_id'     => $client_id,
                'redirect_uri'  => self::REDIRECT,
                'code_verifier' => $verifier,
            ]
        );

        $this->assertTrue( OAuth::revoke_user( $this->seller_id1 ) );
        $this->assertNull( OAuth::validate_token( $tokens['access_token'] ) );
    }

    public function test_discovery_documents_point_at_the_dokan_endpoints() {
        $resource = OAuth::protected_resource_metadata();
        $server   = OAuth::authorization_server_metadata();

        $this->assertSame( Access::endpoint(), $resource['resource'] );
        $this->assertSame( [ OAuth::issuer() ], $resource['authorization_servers'] );
        $this->assertSame( untrailingslashit( Access::endpoint() ), $server['issuer'] );
        $this->assertSame( Consent::authorize_url(), $server['authorization_endpoint'] );
        $this->assertSame( [ 'S256' ], $server['code_challenge_methods_supported'] );
        $this->assertSame( [ 'none' ], $server['token_endpoint_auth_methods_supported'] );
    }

    public function test_callback_identity_names_known_hosts_and_flags_the_rest() {
        $this->assertSame( 'Claude', OAuth::callback_identity( self::REDIRECT )['label'] );
        $this->assertFalse( OAuth::callback_identity( 'https://claude.ai.attacker.example/cb' )['known'] );
        $this->assertTrue( OAuth::callback_identity( 'http://localhost:3000/cb' )['trusted'] );
        $this->assertFalse( OAuth::callback_identity( 'http://203.0.113.9/cb' )['trusted'] );
    }
}
