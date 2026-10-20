<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Abilities\Mcp\Access;
use WeDevs\Dokan\Abilities\Mcp\OAuth;
use WeDevs\Dokan\Abilities\Mcp\RateLimiter;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

/**
 * The OAuth routes of the Dokan MCP server: RFC 7591 client registration, the RFC 6749 token
 * endpoint and the RFC 8414 / RFC 9728 discovery documents.
 *
 * All public by design; every one answers 404 while the server is switched off. The MCP endpoint
 * itself is registered by the adapter, and the settings screens act through `admin-post.php`.
 *
 * @since DOKAN_SINCE
 */
class McpController extends DokanBaseController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'mcp';

    /**
     * Register routes.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/oauth/register',
            [
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'oauth_register' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/oauth/token',
            [
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'oauth_token' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/oauth/(?P<document>protected-resource|authorization-server)',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'oauth_discovery' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        // The path-suffix discovery forms some clients try against the issuer (the MCP endpoint).
        register_rest_route(
            Access::ROUTE_NAMESPACE,
            '/' . Access::ROUTE . '/\.well-known/(?P<document>oauth-protected-resource|oauth-authorization-server|openid-configuration)',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'oauth_discovery' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );
    }

    /**
     * RFC 7591 dynamic client registration.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Incoming request.
     *
     * @return WP_REST_Response
     */
    public function oauth_register( WP_REST_Request $request ): WP_REST_Response {
        if ( ! Access::is_enabled() ) {
            return $this->no_store( new WP_REST_Response( [ 'error' => 'invalid_request' ], 404 ) );
        }

        if ( RateLimiter::is_locked() ) {
            return $this->too_many_requests();
        }

        $body = $request->get_json_params();

        if ( empty( $body ) ) {
            $body = $request->get_body_params();
        }

        $registered = OAuth::register_client( is_array( $body ) ? $body : [] );

        if ( is_wp_error( $registered ) ) {
            // Unauthenticated and persisted, so a refused attempt counts towards the same lockout a bad token does.
            RateLimiter::record_failure();

            return $this->no_store(
                new WP_REST_Response(
                    [
                        'error'             => $registered->get_error_code(),
                        'error_description' => $registered->get_error_message(),
                    ],
                    400
                )
            );
        }

        return $this->no_store( new WP_REST_Response( $registered, 201 ) );
    }

    /**
     * The OAuth token endpoint. Errors follow RFC 6749, not WordPress' REST error shape.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Incoming request.
     *
     * @return WP_REST_Response
     */
    public function oauth_token( WP_REST_Request $request ): WP_REST_Response {
        if ( ! Access::is_enabled() ) {
            return $this->no_store( new WP_REST_Response( [ 'error' => 'invalid_request' ], 404 ) );
        }

        if ( RateLimiter::is_locked() ) {
            return $this->too_many_requests();
        }

        $body = $request->get_body_params();

        if ( empty( $body ) ) {
            $decoded = json_decode( (string) $request->get_body(), true );
            $body    = is_array( $decoded ) ? $decoded : [];
        }

        $tokens = OAuth::grant( $body );

        if ( is_wp_error( $tokens ) ) {
            // A failed grant is a guess at a code or refresh token; count it like a failed bearer token.
            RateLimiter::record_failure();

            $data = (array) $tokens->get_error_data();

            return $this->no_store(
                new WP_REST_Response(
                    [
                        'error'             => isset( $data['error'] ) ? (string) $data['error'] : 'invalid_grant',
                        'error_description' => $tokens->get_error_message(),
                    ],
                    isset( $data['status'] ) ? (int) $data['status'] : 400
                )
            );
        }

        return $this->no_store( new WP_REST_Response( $tokens, 200 ) );
    }

    /**
     * The discovery documents, over their REST aliases.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Incoming request.
     *
     * @return WP_REST_Response
     */
    public function oauth_discovery( WP_REST_Request $request ): WP_REST_Response {
        if ( ! Access::is_enabled() ) {
            return new WP_REST_Response( [ 'error' => 'not_found' ], 404 );
        }

        $document = (string) $request->get_param( 'document' );
        $body     = in_array( $document, [ 'protected-resource', 'oauth-protected-resource' ], true )
            ? OAuth::protected_resource_metadata()
            : OAuth::authorization_server_metadata();

        $response = new WP_REST_Response( $body, 200 );
        $response->header( 'Cache-Control', 'public, max-age=3600' );

        return $response;
    }

    /**
     * The 429 a locked-out client gets from the OAuth endpoints.
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response
     */
    private function too_many_requests(): WP_REST_Response {
        $response = $this->no_store(
            new WP_REST_Response(
                [
                    'error'             => 'temporarily_unavailable',
                    'error_description' => __( 'Too many failed attempts. Try again later.', 'dokan-lite' ),
                ],
                429
            )
        );

        $response->header( 'Retry-After', (string) RateLimiter::retry_after() );

        return $response;
    }

    /**
     * Mark a response carrying credentials as uncacheable.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Response $response Response to mark.
     *
     * @return WP_REST_Response
     */
    private function no_store( WP_REST_Response $response ): WP_REST_Response {
        $response->header( 'Cache-Control', 'no-store' );
        $response->header( 'Pragma', 'no-cache' );

        return $response;
    }
}
