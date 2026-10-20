<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Support\RequestContext;
use WP\MCP\Transport\HttpTransport;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * The HTTP transport of the Dokan MCP server: Bearer-token authentication on top of the shared
 * adapter's Streamable HTTP implementation.
 *
 * Order matters in {@see self::check_permission()}. The master switch answers first, so a site
 * with MCP off tells every caller the same thing whether or not their credential was any good.
 * Then TLS, then the lockout before the credential is compared at all, then the credential, and
 * only then is the user still allowed to hold a connection.
 *
 * The permission check is overridden here rather than passed as the adapter's
 * `transport_permission_callback`, which treats a `WP_Error` as "fall back to the `read`
 * capability" and would let a cookie-authenticated browser session through.
 *
 * @since DOKAN_SINCE
 */
class Transport extends HttpTransport {

    /**
     * Authenticate the request and become the user behind the credential.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request The REST request.
     *
     * @return bool|WP_Error
     */
    public function check_permission( WP_REST_Request $request ) {
        return self::authenticate( $request );
    }

    /**
     * The authentication decision behind {@see self::check_permission()}, callable without a
     * transport instance.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request The REST request.
     *
     * @return bool|WP_Error
     */
    public static function authenticate( WP_REST_Request $request ) {
        Session::reset();

        if ( ! Access::is_enabled() ) {
            return new WP_Error( 'dokan_mcp_disabled', __( 'The Dokan MCP server is switched off. Turn it on under Dokan > Settings > AI Assist.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        /**
         * Filters whether the Dokan MCP endpoint may be used over plain http.
         *
         * @since DOKAN_SINCE
         *
         * @param bool            $allowed Whether insecure transport is allowed.
         * @param WP_REST_Request $request The REST request.
         */
        if ( ! is_ssl() && ! apply_filters( 'dokan_mcp_allow_insecure_transport', Access::allows_insecure_transport(), $request ) ) {
            return new WP_Error( 'dokan_mcp_insecure_transport', __( 'HTTPS is required for MCP requests.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        $presented = self::bearer_token( $request );

        if ( '' === $presented ) {
            return self::unauthorized( __( 'Authentication required: send the connection token or OAuth access token as a Bearer token.', 'dokan-lite' ) );
        }

        if ( RateLimiter::is_locked() ) {
            return self::locked();
        }

        $grant = self::authorize( $presented );

        if ( null === $grant ) {
            RateLimiter::record_failure();

            return self::unauthorized( __( 'Invalid or expired token.', 'dokan-lite' ) );
        }

        // The credential is genuine but its user may no longer connect: a dead grant, not a missing one.
        if ( ! Access::user_can_connect( $grant['user_id'] ) ) {
            return new WP_Error( 'dokan_mcp_grant_revoked', __( 'This connection is no longer allowed for its user. Connect again from an account that may use the marketplace.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        RateLimiter::clear();
        wp_set_current_user( $grant['user_id'] );
        Session::authenticate( $grant['user_id'], $grant['read_only'] );

        // The adapter runs ability permission checks outside any execution window; flag the Ability
        // Context ourselves so the vendor scoping holds during that pre-flight.
        RequestContext::flag_mcp_request();

        return true;
    }

    /**
     * The RFC 9728 `WWW-Authenticate` challenge value.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function challenge_header(): string {
        return sprintf( 'Bearer resource_metadata="%s"', OAuth::resource_metadata_url() );
    }

    /**
     * Add the OAuth challenge to the outgoing response.
     *
     * Hooked to `rest_post_dispatch` only after a 401 was decided; points OAuth-capable clients at
     * the protected-resource metadata so they can start the flow.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $response The dispatched response.
     *
     * @return mixed
     */
    public static function add_challenge_header( $response ) {
        if ( $response instanceof WP_REST_Response ) {
            $response->header( 'WWW-Authenticate', self::challenge_header() );
        }

        return $response;
    }

    /**
     * Resolve a presented credential: a personal connection token first, then an OAuth access token.
     *
     * @since DOKAN_SINCE
     *
     * @param string $presented Credential from the request.
     *
     * @return array{user_id:int,read_only:bool}|null Null when nothing matched.
     */
    private static function authorize( string $presented ): ?array {
        $user_id = Tokens::verify( $presented );

        if ( $user_id > 0 ) {
            Tokens::touch_last_used( $user_id );

            return [
                'user_id'   => $user_id,
                'read_only' => false,
            ];
        }

        $grant = OAuth::validate_token( $presented );

        if ( is_array( $grant ) && ! empty( $grant['user_id'] ) ) {
            return [
                'user_id'   => (int) $grant['user_id'],
                'read_only' => OAuth::scope_is_read_only( isset( $grant['scope'] ) ? (string) $grant['scope'] : '' ),
            ];
        }

        return null;
    }

    /**
     * Pull the token from `Authorization: Bearer ...`.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request The REST request.
     *
     * @return string
     */
    private static function bearer_token( WP_REST_Request $request ): string {
        $header = (string) $request->get_header( 'authorization' );

        // Some FastCGI setups only expose the header under this name.
        if ( '' === $header && isset( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) ) {
            $header = (string) wp_unslash( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- a credential header, compared by digest; sanitising would corrupt it.
        }

        if ( preg_match( '/^Bearer\s+(.+)$/i', trim( $header ), $matches ) ) {
            return trim( $matches[1] );
        }

        return '';
    }

    /**
     * A 401 carrying the OAuth challenge.
     *
     * @since DOKAN_SINCE
     *
     * @param string $message Why.
     *
     * @return WP_Error
     */
    private static function unauthorized( string $message ): WP_Error {
        add_filter( 'rest_post_dispatch', [ self::class, 'add_challenge_header' ] );

        return new WP_Error( 'dokan_mcp_unauthorized', $message, [ 'status' => 401 ] );
    }

    /**
     * The 429 a locked-out client gets, keeping the challenge so it does not conclude the server
     * has no OAuth at all.
     *
     * @since DOKAN_SINCE
     *
     * @return WP_Error
     */
    private static function locked(): WP_Error {
        add_filter( 'rest_post_dispatch', [ self::class, 'add_challenge_header' ] );
        add_filter(
            'rest_post_dispatch',
            static function ( $response ) {
                if ( $response instanceof WP_REST_Response ) {
                    $response->header( 'Retry-After', (string) RateLimiter::retry_after() );
                }

                return $response;
            }
        );

        return new WP_Error( 'dokan_mcp_too_many_attempts', __( 'Too many failed attempts. Try again later.', 'dokan-lite' ), [ 'status' => 429 ] );
    }
}
