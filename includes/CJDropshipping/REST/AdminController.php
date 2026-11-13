<?php

namespace WeDevs\Dokan\CJDropshipping\REST;

use WeDevs\Dokan\CJDropshipping\Api\ApiException;
use WeDevs\Dokan\CJDropshipping\Connection;
use WeDevs\Dokan\REST\DokanBaseAdminController;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Admin endpoints for the marketplace CJ account.
 *
 * @since DOKAN_SINCE
 */
class AdminController extends DokanBaseAdminController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'cj-dropshipping';

    /**
     * Register routes.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/connection', [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_connection' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'connect' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'api_key' => [
                            'description'       => __( 'API key from the CJ account.', 'dokan-lite' ),
                            'type'              => 'string',
                            'required'          => true,
                            'sanitize_callback' => 'sanitize_text_field',
                        ],
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => [ $this, 'disconnect' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace, '/' . $this->rest_base . '/connection/check', [
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'check' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
    }

    /**
     * Current connection.
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response
     */
    public function get_connection() {
        return rest_ensure_response( ( new Connection() )->summary() );
    }

    /**
     * Connect the marketplace CJ account.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function connect( $request ) {
        try {
            return rest_ensure_response( ( new Connection() )->connect( (string) $request['api_key'] ) );
        } catch ( ApiException $e ) {
            return self::to_error( $e );
        }
    }

    /**
     * Check the account again, e.g. after reactivating it on CJ.
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response|WP_Error
     */
    public function check() {
        try {
            return rest_ensure_response( ( new Connection() )->check() );
        } catch ( ApiException $e ) {
            return self::to_error( $e );
        }
    }

    /**
     * Disconnect the account; CJ products move to Draft.
     *
     * @since DOKAN_SINCE
     *
     * @return WP_REST_Response
     */
    public function disconnect() {
        $connection = new Connection();
        $connection->disconnect();

        return rest_ensure_response( $connection->summary() );
    }

    /**
     * Turn a CJ failure into a REST error with a message people can act on.
     *
     * @since DOKAN_SINCE
     *
     * @param ApiException $e Failure.
     *
     * @return WP_Error
     */
    public static function to_error( ApiException $e ): WP_Error {
        $messages = [
            ApiException::AUTH_FAILED      => __( 'CJ didn\'t accept this API key. Copy it again from CJ\'s API page.', 'dokan-lite' ),
            ApiException::SUSPENDED        => __( 'CJ has paused API access for this account. Reactivate it on CJ, then check again.', 'dokan-lite' ),
            ApiException::RATE_LIMITED     => __( 'CJ is busy. Try again in a moment.', 'dokan-lite' ),
            ApiException::POINTS_EXHAUSTED => __( 'The marketplace has used its CJ points for now. Try again later.', 'dokan-lite' ),
            ApiException::NETWORK          => __( 'CJ couldn\'t be reached. Try again in a moment.', 'dokan-lite' ),
            ApiException::NOT_CONNECTED    => __( 'The marketplace CJ account is not connected.', 'dokan-lite' ),
            ApiException::NOT_FOUND        => __( 'CJ no longer sells this product.', 'dokan-lite' ),
        ];
        $statuses = [
            ApiException::AUTH_FAILED      => 400,
            ApiException::INVALID_REQUEST  => 400,
            ApiException::NOT_FOUND        => 404,
            ApiException::NOT_CONNECTED    => 409,
            ApiException::SUSPENDED        => 409,
            ApiException::RATE_LIMITED     => 429,
            ApiException::POINTS_EXHAUSTED => 429,
        ];

        return new WP_Error(
            'dokan_cj_' . $e->get_reason(),
            $messages[ $e->get_reason() ] ?? $e->getMessage(),
            [ 'status' => $statuses[ $e->get_reason() ] ?? 502 ]
        );
    }
}
