<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * OAuth 2.1 for the MCP endpoint: authorization code, mandatory PKCE, dynamic client
 * registration, rotating refresh tokens.
 *
 * This is the path a client such as Claude or ChatGPT takes when the person pastes nothing but
 * the connector URL. The client discovers the endpoints, registers itself, sends the person to
 * this site's consent screen, and comes back with a code it exchanges for tokens. Every grant is
 * bound to the user who approved it, so a vendor's grant reaches that vendor's store only.
 *
 * Load-bearing decisions:
 *
 *  - Only hashes are stored. Codes and tokens exist in the clear exactly once each: in the
 *    redirect and in the `/token` response.
 *  - The authorization code is burned BEFORE PKCE is verified, so a failed verification cannot be
 *    retried against the same code.
 *  - An unknown `client_id`, or a `redirect_uri` that does not match a registered one, never
 *    redirects: that destination is not one this site has ever trusted.
 *  - Registration is unauthenticated by design (RFC 7591), so a client's `client_name` is not
 *    identity; the consent screen names the callback host instead.
 *
 * @since DOKAN_SINCE
 */
class OAuth {

    /**
     * Option holding clients, codes and tokens. Non-autoloaded.
     *
     * @since DOKAN_SINCE
     */
    const OPTION = 'dokan_mcp_oauth';

    /**
     * Authorization-code lifetime, in seconds.
     *
     * @since DOKAN_SINCE
     */
    const CODE_TTL = 60;

    /**
     * Access-token lifetime, in seconds.
     *
     * @since DOKAN_SINCE
     */
    const ACCESS_TTL = 3600;

    /**
     * Refresh-token lifetime, in seconds.
     *
     * @since DOKAN_SINCE
     */
    const REFRESH_TTL = 2592000;

    /**
     * Scopes this server understands. `mcp` is the umbrella and includes writing.
     *
     * @since DOKAN_SINCE
     */
    const SUPPORTED_SCOPES = [ 'mcp', 'read', 'write' ];

    /**
     * Most registered clients kept before the oldest unused ones are evicted.
     *
     * @since DOKAN_SINCE
     */
    const MAX_CLIENTS = 50;

    /**
     * How long an unused registration is kept, in seconds.
     *
     * @since DOKAN_SINCE
     */
    const CLIENT_TTL = 86400;

    /**
     * The issuer identifier: the MCP endpoint itself, so path-suffixed discovery stays specific to
     * Dokan even when another plugin runs its own OAuth server at the same site root.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function issuer(): string {
        return untrailingslashit( Access::endpoint() );
    }

    /**
     * The protected resource identifier.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function resource(): string {
        return Access::endpoint();
    }

    /**
     * The token endpoint.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function token_url(): string {
        return rest_url( 'dokan/v1/mcp/oauth/token' );
    }

    /**
     * The dynamic client registration endpoint.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function register_url(): string {
        return rest_url( 'dokan/v1/mcp/oauth/register' );
    }

    /**
     * Where the 401 challenge points for protected-resource metadata.
     *
     * The REST alias rather than `/.well-known/`, because hosts and security plugins routinely
     * intercept `/.well-known/` for ACME. Both forms are served; this one is advertised.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function resource_metadata_url(): string {
        /**
         * Filters the protected-resource metadata URL advertised in the `WWW-Authenticate` challenge.
         *
         * @since DOKAN_SINCE
         *
         * @param string $url The advertised URL.
         */
        return (string) apply_filters( 'dokan_mcp_resource_metadata_url', rest_url( 'dokan/v1/mcp/oauth/protected-resource' ) );
    }

    /**
     * RFC 9728 protected-resource metadata.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function protected_resource_metadata(): array {
        return [
            'resource'                 => self::resource(),
            'authorization_servers'    => [ self::issuer() ],
            'scopes_supported'         => self::SUPPORTED_SCOPES,
            'bearer_methods_supported' => [ 'header' ],
        ];
    }

    /**
     * RFC 8414 authorization-server metadata, listing only what is implemented.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function authorization_server_metadata(): array {
        return [
            'issuer'                                => self::issuer(),
            'authorization_endpoint'                => Consent::authorize_url(),
            'token_endpoint'                        => self::token_url(),
            'registration_endpoint'                 => self::register_url(),
            'scopes_supported'                      => self::SUPPORTED_SCOPES,
            'response_types_supported'              => [ 'code' ],
            'grant_types_supported'                 => [ 'authorization_code', 'refresh_token' ],
            'code_challenge_methods_supported'      => [ 'S256' ],
            'token_endpoint_auth_methods_supported' => [ 'none' ],
        ];
    }

    /**
     * Register a public client (RFC 7591).
     *
     * No client secret is issued: PKCE binds the code to the client. Everything in the request is
     * attacker-controlled and gets persisted, so the record is bounded on every axis.
     *
     * @since DOKAN_SINCE
     *
     * @param array $body Parsed JSON registration request.
     *
     * @return array|WP_Error The RFC 7591 registration response.
     */
    public static function register_client( array $body ) {
        $redirect_uris = isset( $body['redirect_uris'] ) && is_array( $body['redirect_uris'] )
            ? array_filter( array_map( 'strval', $body['redirect_uris'] ), [ self::class, 'is_valid_redirect_uri' ] )
            : [];

        $redirect_uris = array_filter(
            array_unique( $redirect_uris ),
            static function ( string $uri ): bool {
                return strlen( $uri ) <= 2048;
            }
        );

        $redirect_uris = array_slice( array_values( $redirect_uris ), 0, 5 );

        if ( empty( $redirect_uris ) ) {
            return new WP_Error( 'invalid_redirect_uri', __( 'At least one valid redirect_uri is required.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        $name = isset( $body['client_name'] ) ? sanitize_text_field( (string) $body['client_name'] ) : __( 'MCP Client', 'dokan-lite' );
        $name = mb_substr( $name, 0, 128 );

        $client_id = 'dk_' . bin2hex( random_bytes( 16 ) );

        $state                          = self::state();
        $state['clients'][ $client_id ] = [
            'redirect_uris' => $redirect_uris,
            'name'          => $name,
            'created'       => time(),
            'last_used'     => 0,
        ];
        $state['clients']               = self::prune_clients( $state );

        self::save( $state );

        return [
            'client_id'                  => $client_id,
            'client_id_issued_at'        => time(),
            'redirect_uris'              => $redirect_uris,
            'client_name'                => $name,
            'token_endpoint_auth_method' => 'none',
            'grant_types'                => [ 'authorization_code', 'refresh_token' ],
            'response_types'             => [ 'code' ],
        ];
    }

    /**
     * Check an `/authorize` request without issuing anything.
     *
     * Whether an error may be reported back by redirect is in the error's `redirectable` data: a
     * bad `redirect_uri` or an unknown client must NOT redirect.
     *
     * @since DOKAN_SINCE
     *
     * @param array $params Query parameters.
     *
     * @return array|WP_Error
     */
    public static function validate_authorize_request( array $params ) {
        $client_id     = isset( $params['client_id'] ) ? (string) $params['client_id'] : '';
        $redirect_uri  = isset( $params['redirect_uri'] ) ? (string) $params['redirect_uri'] : '';
        $response_type = isset( $params['response_type'] ) ? (string) $params['response_type'] : '';
        $challenge     = isset( $params['code_challenge'] ) ? (string) $params['code_challenge'] : '';
        $method        = isset( $params['code_challenge_method'] ) ? (string) $params['code_challenge_method'] : '';
        $scope         = isset( $params['scope'] ) ? (string) $params['scope'] : 'mcp';
        $client_state  = isset( $params['state'] ) ? (string) $params['state'] : '';

        $client = self::client( $client_id );

        if ( null === $client ) {
            return new WP_Error( 'invalid_client', __( 'Unknown client_id.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        if ( ! in_array( $redirect_uri, $client['redirect_uris'], true ) ) {
            return new WP_Error( 'invalid_redirect_uri', __( 'redirect_uri does not match a registered value.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        if ( 'code' !== $response_type ) {
            return new WP_Error(
                'unsupported_response_type',
                __( 'Only response_type=code is supported.', 'dokan-lite' ),
                [
                    'status'       => 400,
                    'redirectable' => true,
                ]
            );
        }

        // OAuth 2.1: PKCE with S256 is mandatory for public clients; `plain` protects nothing.
        if ( 'S256' !== $method || '' === $challenge ) {
            return new WP_Error(
                'invalid_request',
                __( 'PKCE with code_challenge_method=S256 is required.', 'dokan-lite' ),
                [
                    'status'       => 400,
                    'redirectable' => true,
                ]
            );
        }

        return [
            'client_id'      => $client_id,
            'client_name'    => $client['name'],
            'redirect_uri'   => $redirect_uri,
            'code_challenge' => $challenge,
            'scope'          => self::normalize_scope( $scope ),
            'state'          => $client_state,
        ];
    }

    /**
     * Issue an authorization code once a person has consented.
     *
     * Bound to the client, the redirect URI, the PKCE challenge, the granted scope and the
     * approving user. Single-use, 60 seconds, stored by digest only.
     *
     * @since DOKAN_SINCE
     *
     * @param array $request Output of {@see self::validate_authorize_request()}.
     * @param int   $user_id The user who approved.
     *
     * @return string The authorization code.
     */
    public static function issue_code( array $request, int $user_id ): string {
        $code  = bin2hex( random_bytes( 32 ) );
        $state = self::state();

        $state['codes'][ self::hash( $code ) ] = [
            'client_id'    => (string) $request['client_id'],
            'redirect_uri' => (string) $request['redirect_uri'],
            'challenge'    => (string) $request['code_challenge'],
            'scope'        => (string) $request['scope'],
            'user_id'      => $user_id,
            'expires'      => time() + self::CODE_TTL,
        ];

        self::save( $state );

        return $code;
    }

    /**
     * The `/token` endpoint's two grants.
     *
     * @since DOKAN_SINCE
     *
     * @param array $body POST body.
     *
     * @return array|WP_Error
     */
    public static function grant( array $body ) {
        $type = isset( $body['grant_type'] ) ? (string) $body['grant_type'] : '';

        switch ( $type ) {
            case 'authorization_code':
                return self::grant_authorization_code( $body );

            case 'refresh_token':
                return self::grant_refresh_token( $body );

            default:
                return self::oauth_error( 'unsupported_grant_type', __( 'Unsupported grant_type.', 'dokan-lite' ) );
        }
    }

    /**
     * Validate a presented access token.
     *
     * @since DOKAN_SINCE
     *
     * @param string $token Presented access token.
     *
     * @return array|null The grant record, or null when it is not valid.
     */
    public static function validate_token( string $token ): ?array {
        if ( '' === $token ) {
            return null;
        }

        $state = self::state();
        $hash  = self::hash( $token );

        if ( ! isset( $state['tokens'][ $hash ] ) ) {
            return null;
        }

        $entry = $state['tokens'][ $hash ];

        if ( ! is_array( $entry ) || ( isset( $entry['expires'] ) && (int) $entry['expires'] < time() ) ) {
            return null;
        }

        self::touch_client( (string) $entry['client_id'] );

        return $entry;
    }

    /**
     * Whether a granted scope is read-only: neither `write` nor the umbrella `mcp`.
     *
     * @since DOKAN_SINCE
     *
     * @param string $scope Granted scope string.
     *
     * @return bool
     */
    public static function scope_is_read_only( string $scope ): bool {
        $parts = self::scope_parts( $scope );

        return ! in_array( 'write', $parts, true ) && ! in_array( 'mcp', $parts, true );
    }

    /**
     * Drop every OAuth grant and registration on this site.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function revoke_all(): void {
        delete_option( self::OPTION );
    }

    /**
     * Revoke one app's access.
     *
     * The registration itself is kept: clients cache their `client_id` and reuse it when they
     * reconnect; deleting it would answer "unknown client" instead of sending them through consent.
     *
     * @since DOKAN_SINCE
     *
     * @param string $client_id Client to cut off.
     *
     * @return bool Whether anything was revoked.
     */
    public static function revoke_client( string $client_id ): bool {
        return self::revoke_where(
            static function ( array $entry ) use ( $client_id ): bool {
                return isset( $entry['client_id'] ) && (string) $entry['client_id'] === $client_id;
            }
        );
    }

    /**
     * Revoke every grant approved by one user.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User whose grants go.
     *
     * @return bool Whether anything was revoked.
     */
    public static function revoke_user( int $user_id ): bool {
        return self::revoke_where(
            static function ( array $entry ) use ( $user_id ): bool {
                return isset( $entry['user_id'] ) && (int) $entry['user_id'] === $user_id;
            }
        );
    }

    /**
     * The apps currently holding a grant, for the settings screen. Never returns a hash or token.
     *
     * @since DOKAN_SINCE
     *
     * @return array[]
     */
    public static function connected_apps(): array {
        $state  = self::state();
        $active = [];

        foreach ( [ 'refresh', 'tokens' ] as $bucket ) {
            foreach ( $state[ $bucket ] as $entry ) {
                if ( ! is_array( $entry ) || empty( $entry['client_id'] ) ) {
                    continue;
                }

                $cid     = (string) $entry['client_id'];
                $expires = isset( $entry['expires'] ) ? (int) $entry['expires'] : 0;

                if ( ! isset( $active[ $cid ] ) ) {
                    $active[ $cid ] = [
                        'scope'   => isset( $entry['scope'] ) ? (string) $entry['scope'] : 'mcp',
                        'user_id' => isset( $entry['user_id'] ) ? (int) $entry['user_id'] : 0,
                        'expires' => $expires,
                    ];

                    continue;
                }

                $active[ $cid ]['expires'] = max( $active[ $cid ]['expires'], $expires );
            }
        }

        $apps = [];

        foreach ( $active as $cid => $info ) {
            $client = isset( $state['clients'][ $cid ] ) && is_array( $state['clients'][ $cid ] ) ? $state['clients'][ $cid ] : [];
            $user   = $info['user_id'] > 0 ? get_userdata( $info['user_id'] ) : false;

            $apps[] = [
                'client_id'     => $cid,
                'name'          => isset( $client['name'] ) ? (string) $client['name'] : __( 'MCP Client', 'dokan-lite' ),
                'scope'         => $info['scope'],
                'read_only'     => self::scope_is_read_only( $info['scope'] ),
                'user_id'       => $info['user_id'],
                'user_name'     => $user ? (string) $user->display_name : '',
                'user_role'     => $info['user_id'] > 0 ? Access::role_of( $info['user_id'] ) : 'none',
                // The callback host is the one field a registrant cannot fake.
                'redirect_uris' => isset( $client['redirect_uris'] ) && is_array( $client['redirect_uris'] ) ? array_values( array_map( 'strval', $client['redirect_uris'] ) ) : [],
                'created'       => isset( $client['created'] ) ? (int) $client['created'] : 0,
                'last_used'     => isset( $client['last_used'] ) ? (int) $client['last_used'] : 0,
                'expires'       => $info['expires'],
            ];
        }

        usort(
            $apps,
            static function ( array $a, array $b ): int {
                return $b['created'] <=> $a['created'];
            }
        );

        return $apps;
    }

    /**
     * BASE64URL(SHA256(verifier)), the PKCE S256 transformation (RFC 7636).
     *
     * @since DOKAN_SINCE
     *
     * @param string $verifier PKCE code verifier.
     *
     * @return string
     */
    public static function s256( string $verifier ): string {
        // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- base64url is the encoding RFC 7636 defines.
        return rtrim( strtr( base64_encode( hash( 'sha256', $verifier, true ) ), '+/', '-_' ), '=' );
    }

    /**
     * One registered client, or null.
     *
     * @since DOKAN_SINCE
     *
     * @param string $client_id Client id.
     *
     * @return array|null
     */
    public static function client( string $client_id ): ?array {
        if ( '' === $client_id ) {
            return null;
        }

        $state = self::state();

        if ( ! isset( $state['clients'][ $client_id ] ) || ! is_array( $state['clients'][ $client_id ] ) ) {
            return null;
        }

        $client = $state['clients'][ $client_id ];

        return [
            'name'          => isset( $client['name'] ) ? (string) $client['name'] : __( 'MCP Client', 'dokan-lite' ),
            'redirect_uris' => isset( $client['redirect_uris'] ) && is_array( $client['redirect_uris'] ) ? array_values( array_map( 'strval', $client['redirect_uris'] ) ) : [],
            'created'       => isset( $client['created'] ) ? (int) $client['created'] : 0,
        ];
    }

    /**
     * What to show the person approving a connection, derived from the callback host rather
     * than from the name the client registered: registration is open, so anyone can register a
     * client called "Claude".
     *
     * @since DOKAN_SINCE
     *
     * @param string $redirect_uri The validated callback URI.
     *
     * @return array{host:string,label:string,known:bool,trusted:bool}
     */
    public static function callback_identity( string $redirect_uri ): array {
        $host = strtolower( (string) wp_parse_url( $redirect_uri, PHP_URL_HOST ) );

        $known = [
            'claude.ai'     => 'Claude',
            'anthropic.com' => 'Claude',
            'chatgpt.com'   => 'ChatGPT',
            'openai.com'    => 'ChatGPT',
            'cursor.sh'     => 'Cursor',
            'cursor.com'    => 'Cursor',
        ];

        foreach ( $known as $candidate => $label ) {
            if ( self::host_matches( $host, $candidate ) ) {
                return [
                    'host'    => $host,
                    'label'   => $label,
                    'known'   => true,
                    'trusted' => true,
                ];
            }
        }

        $loopback = in_array( $host, [ 'localhost', '127.0.0.1', '::1', '[::1]' ], true );
        $scheme   = strtolower( (string) wp_parse_url( $redirect_uri, PHP_URL_SCHEME ) );

        return [
            'host'    => $host,
            'label'   => '' !== $host ? $host : __( 'an unknown application', 'dokan-lite' ),
            'known'   => false,
            // A local client is normal; anything else reaching for a grant over plain http is worth flagging.
            'trusted' => $loopback || 'https' === $scheme,
        ];
    }

    /**
     * Whether a host is, or sits under, a candidate domain (matched on a dot boundary).
     *
     * @since DOKAN_SINCE
     *
     * @param string $host      Host from the callback URI.
     * @param string $candidate Domain to test against.
     *
     * @return bool
     */
    private static function host_matches( string $host, string $candidate ): bool {
        if ( '' === $host ) {
            return false;
        }

        return $host === $candidate || substr( $host, -( strlen( $candidate ) + 1 ) ) === '.' . $candidate;
    }

    /**
     * The authorization_code grant: verify the code and PKCE, mint tokens.
     *
     * @since DOKAN_SINCE
     *
     * @param array $body POST body.
     *
     * @return array|WP_Error
     */
    private static function grant_authorization_code( array $body ) {
        $code         = isset( $body['code'] ) ? (string) $body['code'] : '';
        $client_id    = isset( $body['client_id'] ) ? (string) $body['client_id'] : '';
        $redirect_uri = isset( $body['redirect_uri'] ) ? (string) $body['redirect_uri'] : '';
        $verifier     = isset( $body['code_verifier'] ) ? (string) $body['code_verifier'] : '';

        $state = self::state();
        $chash = self::hash( $code );

        if ( '' === $code || ! isset( $state['codes'][ $chash ] ) ) {
            return self::oauth_error( 'invalid_grant', __( 'Unknown or expired authorization code.', 'dokan-lite' ) );
        }

        $entry = $state['codes'][ $chash ];

        // Single-use, and burned BEFORE verification: a code that failed PKCE gets no second attempt.
        unset( $state['codes'][ $chash ] );
        self::save( $state );

        if ( (int) $entry['expires'] < time() ) {
            return self::oauth_error( 'invalid_grant', __( 'Authorization code expired.', 'dokan-lite' ) );
        }

        if ( ! hash_equals( (string) $entry['client_id'], $client_id ) ) {
            return self::oauth_error( 'invalid_grant', __( 'client_id mismatch.', 'dokan-lite' ) );
        }

        if ( ! hash_equals( (string) $entry['redirect_uri'], $redirect_uri ) ) {
            return self::oauth_error( 'invalid_grant', __( 'redirect_uri mismatch.', 'dokan-lite' ) );
        }

        if ( '' === $verifier || ! hash_equals( (string) $entry['challenge'], self::s256( $verifier ) ) ) {
            return self::oauth_error( 'invalid_grant', __( 'PKCE verification failed.', 'dokan-lite' ) );
        }

        return self::mint_tokens( (string) $entry['client_id'], (string) $entry['scope'], (int) $entry['user_id'] );
    }

    /**
     * The refresh_token grant: rotate the refresh token, issue a fresh access token, revoke both
     * old ones. Dropping the old access token is what makes a stolen refresh token detectable.
     *
     * @since DOKAN_SINCE
     *
     * @param array $body POST body.
     *
     * @return array|WP_Error
     */
    private static function grant_refresh_token( array $body ) {
        $refresh   = isset( $body['refresh_token'] ) ? (string) $body['refresh_token'] : '';
        $client_id = isset( $body['client_id'] ) ? (string) $body['client_id'] : '';

        $state = self::state();
        $rhash = self::hash( $refresh );

        if ( '' === $refresh || ! isset( $state['refresh'][ $rhash ] ) ) {
            return self::oauth_error( 'invalid_grant', __( 'Unknown refresh token.', 'dokan-lite' ) );
        }

        $entry = $state['refresh'][ $rhash ];

        if ( '' !== $client_id && ! hash_equals( (string) $entry['client_id'], $client_id ) ) {
            return self::oauth_error( 'invalid_grant', __( 'client_id mismatch.', 'dokan-lite' ) );
        }

        unset( $state['refresh'][ $rhash ] );

        if ( isset( $entry['access_hash'] ) ) {
            unset( $state['tokens'][ $entry['access_hash'] ] );
        }

        self::save( $state );

        if ( isset( $entry['expires'] ) && (int) $entry['expires'] < time() ) {
            return self::oauth_error( 'invalid_grant', __( 'Refresh token expired.', 'dokan-lite' ) );
        }

        return self::mint_tokens( (string) $entry['client_id'], (string) $entry['scope'], (int) $entry['user_id'] );
    }

    /**
     * Mint an access + refresh pair, store the hashes, return the raw values.
     *
     * @since DOKAN_SINCE
     *
     * @param string $client_id Client id.
     * @param string $scope     Granted scope.
     * @param int    $user_id   Resource owner.
     *
     * @return array
     */
    private static function mint_tokens( string $client_id, string $scope, int $user_id ): array {
        $access  = bin2hex( random_bytes( 32 ) );
        $refresh = bin2hex( random_bytes( 32 ) );
        $ahash   = self::hash( $access );
        $rhash   = self::hash( $refresh );

        $state = self::state();

        $state['tokens'][ $ahash ] = [
            'client_id' => $client_id,
            'scope'     => $scope,
            'user_id'   => $user_id,
            'expires'   => time() + self::ACCESS_TTL,
            'refresh'   => $rhash,
        ];

        $state['refresh'][ $rhash ] = [
            'access_hash' => $ahash,
            'client_id'   => $client_id,
            'scope'       => $scope,
            'user_id'     => $user_id,
            'expires'     => time() + self::REFRESH_TTL,
        ];

        self::save( $state );

        return [
            'access_token'  => $access,
            'token_type'    => 'Bearer',
            'expires_in'    => self::ACCESS_TTL,
            'refresh_token' => $refresh,
            'scope'         => $scope,
        ];
    }

    /**
     * Note that a client just used its grant, at most once a minute.
     *
     * @since DOKAN_SINCE
     *
     * @param string $client_id Client id.
     *
     * @return void
     */
    private static function touch_client( string $client_id ): void {
        $state = self::state();

        if ( ! isset( $state['clients'][ $client_id ] ) ) {
            return;
        }

        $now  = time();
        $last = isset( $state['clients'][ $client_id ]['last_used'] ) ? (int) $state['clients'][ $client_id ]['last_used'] : 0;

        if ( $now - $last < 60 ) {
            return;
        }

        $state['clients'][ $client_id ]['last_used'] = $now;

        self::save( $state );
    }

    /**
     * Remove every code, token and refresh grant matching a predicate.
     *
     * @since DOKAN_SINCE
     *
     * @param callable $matches Receives one record, returns whether to drop it.
     *
     * @return bool Whether anything was removed.
     */
    private static function revoke_where( callable $matches ): bool {
        $state   = self::state();
        $removed = false;

        foreach ( [ 'tokens', 'refresh', 'codes' ] as $bucket ) {
            foreach ( $state[ $bucket ] as $key => $entry ) {
                if ( is_array( $entry ) && $matches( $entry ) ) {
                    unset( $state[ $bucket ][ $key ] );
                    $removed = true;
                }
            }
        }

        if ( $removed ) {
            self::save( $state );
        }

        return $removed;
    }

    /**
     * Load state with defaults, pruning anything expired so the option cannot grow without bound.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    private static function state(): array {
        $stored = get_option( self::OPTION, [] );
        $stored = is_array( $stored ) ? $stored : [];
        $state  = [];

        foreach ( [ 'clients', 'codes', 'tokens', 'refresh' ] as $bucket ) {
            $state[ $bucket ] = isset( $stored[ $bucket ] ) && is_array( $stored[ $bucket ] ) ? $stored[ $bucket ] : [];
        }

        $now = time();

        foreach ( [ 'codes', 'tokens', 'refresh' ] as $bucket ) {
            foreach ( $state[ $bucket ] as $key => $entry ) {
                if ( ! is_array( $entry ) || ! isset( $entry['expires'] ) || (int) $entry['expires'] < $now ) {
                    unset( $state[ $bucket ][ $key ] );
                }
            }
        }

        return $state;
    }

    /**
     * Persist state, never autoloaded.
     *
     * @since DOKAN_SINCE
     *
     * @param array $state State to write.
     *
     * @return void
     */
    private static function save( array $state ): void {
        update_option( self::OPTION, $state, false );
    }

    /**
     * Drop unused registrations past their lifetime, then oldest-first down to the cap. A client
     * referenced by any live grant is never evicted.
     *
     * @since DOKAN_SINCE
     *
     * @param array $state Current state.
     *
     * @return array The pruned clients map.
     */
    private static function prune_clients( array $state ): array {
        $clients = $state['clients'];
        $now     = time();
        $in_use  = [];

        foreach ( [ 'codes', 'tokens', 'refresh' ] as $bucket ) {
            foreach ( $state[ $bucket ] as $entry ) {
                if ( is_array( $entry ) && ! empty( $entry['client_id'] ) ) {
                    $in_use[ (string) $entry['client_id'] ] = true;
                }
            }
        }

        foreach ( $clients as $id => $client ) {
            if ( isset( $in_use[ $id ] ) ) {
                continue;
            }

            $created   = isset( $client['created'] ) ? (int) $client['created'] : 0;
            $last_used = isset( $client['last_used'] ) ? (int) $client['last_used'] : 0;

            if ( 0 === $last_used && $now - $created > self::CLIENT_TTL ) {
                unset( $clients[ $id ] );
            }
        }

        if ( count( $clients ) <= self::MAX_CLIENTS ) {
            return $clients;
        }

        $evictable = array_filter(
            $clients,
            static function ( $id ) use ( $in_use ): bool {
                return ! isset( $in_use[ $id ] );
            },
            ARRAY_FILTER_USE_KEY
        );

        uasort(
            $evictable,
            static function ( array $a, array $b ): int {
                return ( (int) ( $a['created'] ?? 0 ) ) <=> ( (int) ( $b['created'] ?? 0 ) );
            }
        );

        foreach ( array_keys( $evictable ) as $id ) {
            if ( count( $clients ) <= self::MAX_CLIENTS ) {
                break;
            }

            unset( $clients[ $id ] );
        }

        return $clients;
    }

    /**
     * SHA-256, the form every secret is stored in.
     *
     * @since DOKAN_SINCE
     *
     * @param string $value Raw secret.
     *
     * @return string
     */
    private static function hash( string $value ): string {
        return hash( 'sha256', $value );
    }

    /**
     * Split a scope string into its parts.
     *
     * @since DOKAN_SINCE
     *
     * @param string $scope Space-separated scopes.
     *
     * @return string[]
     */
    private static function scope_parts( string $scope ): array {
        $parts = preg_split( '/\s+/', trim( $scope ) );

        return is_array( $parts ) ? $parts : [];
    }

    /**
     * Constrain a requested scope to what is supported. Defaults to `mcp`.
     *
     * @since DOKAN_SINCE
     *
     * @param string $requested Requested scope string.
     *
     * @return string
     */
    private static function normalize_scope( string $requested ): string {
        $parts = array_values( array_intersect( self::scope_parts( $requested ), self::SUPPORTED_SCOPES ) );

        return empty( $parts ) ? 'mcp' : implode( ' ', $parts );
    }

    /**
     * Whether a redirect URI is structurally acceptable: http(s), or a native client's custom scheme.
     *
     * Registration is unauthenticated, so the scheme is attacker-chosen and is later handed to
     * `wp_redirect()`; script-capable schemes are refused outright.
     *
     * @since DOKAN_SINCE
     *
     * @param string $uri Candidate redirect URI.
     *
     * @return bool
     */
    public static function is_valid_redirect_uri( string $uri ): bool {
        $uri = trim( $uri );

        if ( '' === $uri || ! preg_match( '#^([a-zA-Z][a-zA-Z0-9+.\-]*)://#', $uri, $matches ) ) {
            return false;
        }

        return ! in_array( strtolower( $matches[1] ), [ 'javascript', 'data', 'vbscript', 'file' ], true );
    }

    /**
     * A `WP_Error` whose data carries an RFC 6749 error code, so the token route can render the
     * OAuth error body verbatim.
     *
     * @since DOKAN_SINCE
     *
     * @param string $code    OAuth error code.
     * @param string $message Human-readable description.
     *
     * @return WP_Error
     */
    private static function oauth_error( string $code, string $message ): WP_Error {
        return new WP_Error(
            $code,
            $message,
            [
                'status'            => 400,
                'error'             => $code,
                'error_description' => $message,
            ]
        );
    }
}
