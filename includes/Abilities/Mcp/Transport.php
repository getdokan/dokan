<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Support\RequestContext;
use WP\MCP\Transport\HttpTransport;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * The HTTP transport of the Dokan MCP server: authorization on top of the shared adapter's
 * Streamable HTTP implementation.
 *
 * Dokan authenticates nobody. By the time this permission check runs, WordPress has resolved the
 * request's user from an Application Password (or a cookie with a REST nonce) and WooCommerce
 * from a REST API consumer key and secret, exactly as on any other REST route. This class only
 * decides whether that user may hold an MCP connection.
 *
 * Order matters in {@see self::check_permission()}. The master switch answers first, so a site
 * with MCP off tells every caller the same thing whether or not they signed in. Then TLS, then
 * whether anyone signed in at all, and only then whether that user is allowed to connect.
 *
 * The permission check is overridden here rather than passed as the adapter's
 * `transport_permission_callback`, which treats a `WP_Error` as "fall back to the `read`
 * capability" and would let any signed-in user through.
 *
 * @since DOKAN_SINCE
 */
class Transport extends HttpTransport {

    /**
     * Decide whether the signed-in user may use the server.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request The REST request.
     *
     * @return bool|WP_Error
     */
    public function check_permission( WP_REST_Request $request ) {
        return self::authorize( $request );
    }

    /**
     * The authorization decision behind {@see self::check_permission()}, callable without a
     * transport instance.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request The REST request.
     *
     * @return bool|WP_Error
     */
    public static function authorize( WP_REST_Request $request ) {
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

        $user_id = get_current_user_id();

        if ( $user_id <= 0 ) {
            return self::unauthenticated();
        }

        if ( ! Access::user_can_connect( $user_id ) ) {
            return new WP_Error( 'dokan_mcp_not_allowed', __( 'This account may not connect an AI assistant. Store admins always can; vendors and their staff only while "Allow vendors to connect" is on and their store is enabled.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        Session::authenticate( $user_id );

        // The adapter runs ability permission checks outside any execution window; flag the Ability
        // Context ourselves so the vendor scoping holds during that pre-flight.
        RequestContext::flag_mcp_request();

        return true;
    }

    /**
     * The `WWW-Authenticate` value naming the scheme a client has to use.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function challenge_header(): string {
        return 'Basic realm="Dokan MCP"';
    }

    /**
     * Add the challenge to the outgoing response.
     *
     * Hooked to `rest_post_dispatch` only after a 401 was decided.
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
     * The 401 nobody-signed-in answer.
     *
     * @since DOKAN_SINCE
     *
     * @return WP_Error
     */
    private static function unauthenticated(): WP_Error {
        add_filter( 'rest_post_dispatch', [ self::class, 'add_challenge_header' ] );

        return new WP_Error( 'dokan_mcp_unauthorized', __( 'Sign in with HTTP Basic authentication: a WordPress username and application password, or a WooCommerce REST API consumer key and secret.', 'dokan-lite' ), [ 'status' => 401 ] );
    }
}
