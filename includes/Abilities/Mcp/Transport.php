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
 * decides whether that user may hold an MCP connection; ADR-0009 explains why it overrides
 * `check_permission()` instead of passing the adapter a callback.
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
        return self::authorize();
    }

    /**
     * The authorization decision: the switch first, so a site with MCP off answers everyone the
     * same way; then whether anyone signed in; then whether that user may connect.
     *
     * @since DOKAN_SINCE
     *
     * @return bool|WP_Error
     */
    public static function authorize() {
        if ( ! Access::is_enabled() ) {
            return new WP_Error( 'dokan_mcp_disabled', __( 'The Dokan MCP server is switched off. Turn it on under Dokan > Settings > AI Assist.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        $user_id = get_current_user_id();

        if ( $user_id <= 0 ) {
            add_filter( 'rest_post_dispatch', [ self::class, 'add_challenge_header' ] );

            return new WP_Error( 'dokan_mcp_unauthorized', __( 'Sign in with HTTP Basic authentication: a WordPress username and application password, or a WooCommerce REST API consumer key and secret.', 'dokan-lite' ), [ 'status' => 401 ] );
        }

        if ( ! Access::user_can_connect( $user_id ) ) {
            return new WP_Error( 'dokan_mcp_not_allowed', __( 'This account may not connect an AI assistant. Store admins always can; vendors and their staff only while "Allow vendors to connect" is on and their store is enabled.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        // The adapter's permission pre-flight runs outside any execution window, so flag the Ability Context here.
        RequestContext::flag_mcp_request();

        return true;
    }

    /**
     * Name the scheme on a 401, so a client knows to send HTTP Basic credentials.
     *
     * Hooked to `rest_post_dispatch` only after a 401 was decided; neither core nor WooCommerce
     * sends a challenge when no credential was presented at all.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $response The dispatched response.
     *
     * @return mixed
     */
    public static function add_challenge_header( $response ) {
        if ( $response instanceof WP_REST_Response ) {
            $response->header( 'WWW-Authenticate', 'Basic realm="Dokan MCP"' );
        }

        return $response;
    }
}
