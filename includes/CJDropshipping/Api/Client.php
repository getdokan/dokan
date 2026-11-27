<?php

namespace WeDevs\Dokan\CJDropshipping\Api;

use WeDevs\Dokan\CJDropshipping\Status;

/**
 * Calls the CJ API with the marketplace account.
 *
 * @since DOKAN_SINCE
 */
class Client {

    public const BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1/';

    // Points per call from CJ's points table; unlisted endpoints are free.
    public const COSTS = [
        'product/listV2'                   => 50,
        'product/query'                    => 10,
        'product/variant/query'            => 10,
        'product/variant/queryByVid'       => 10,
        'product/stock/queryByVid'         => 10,
        'product/stock/queryBySku'         => 10,
        'product/stock/getInventoryByPid'  => 10,
        'logistic/freightCalculate'        => 10,
        'logistic/freightCalculateTip'     => 10,
        'webhook/product/subscribe'        => 10,
        'webhook/product/unsubscribe'      => 10,
    ];

    private const UNAUTHENTICATED = [ 'authentication/getAccessToken', 'authentication/refreshAccessToken' ];

    /**
     * GET an endpoint.
     *
     * @since DOKAN_SINCE
     *
     * @param string $path     Endpoint path, e.g. product/query.
     * @param array  $query    Query arguments.
     * @param string $priority Points priority.
     *
     * @return mixed CJ's `data`.
     * @throws ApiException When the call fails.
     */
    public function get( string $path, array $query = [], string $priority = Points::INTERACTIVE ) {
        return $this->request( 'GET', $path, $query, $priority );
    }

    /**
     * POST to an endpoint.
     *
     * @since DOKAN_SINCE
     *
     * @param string $path     Endpoint path.
     * @param array  $body     JSON body.
     * @param string $priority Points priority.
     *
     * @return mixed CJ's `data`.
     * @throws ApiException When the call fails.
     */
    public function post( string $path, array $body = [], string $priority = Points::INTERACTIVE ) {
        return $this->request( 'POST', $path, $body, $priority );
    }

    /**
     * Send a request and unwrap CJ's response envelope.
     *
     * @since DOKAN_SINCE
     *
     * @param string $method     GET or POST.
     * @param string $path       Endpoint path.
     * @param array  $params     Query or body.
     * @param string $priority   Points priority.
     * @param bool   $retry_auth Whether to refresh the token once on an auth error.
     *
     * @return mixed
     * @throws ApiException When the call fails.
     */
    public function request( string $method, string $path, array $params, string $priority, bool $retry_auth = true ) {
        $path    = ltrim( $path, '/' );
        $is_auth = in_array( $path, self::UNAUTHENTICATED, true );
        $headers = [ 'Content-Type' => 'application/json' ];

        if ( ! $is_auth ) {
            $this->assert_usable();

            $cost = self::COSTS[ $path ] ?? 0;

            if ( ! Points::can_spend( $cost, $priority ) ) {
                throw new ApiException( ApiException::POINTS_EXHAUSTED, esc_html__( 'The marketplace has used its CJ points for now.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
            }

            $headers['CJ-Access-Token'] = ( new TokenManager( $this ) )->access_token();
        }

        $url  = apply_filters( 'dokan_cj_api_base_url', self::BASE_URL ) . $path;
        $args = [
            'method'  => $method,
            'timeout' => Points::CHECKOUT === $priority ? 5 : 15,
            'headers' => $headers,
        ];

        if ( 'GET' === $method ) {
            $url = add_query_arg( rawurlencode_deep( $params ), $url );
        } else {
            $args['body'] = wp_json_encode( (object) $params );
        }

        Throttle::wait( $priority );

        $response = wp_remote_request( $url, $args );

        if ( is_wp_error( $response ) ) {
            throw new ApiException( ApiException::NETWORK, esc_html( $response->get_error_message() ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        $http = (int) wp_remote_retrieve_response_code( $response );
        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        $body = is_array( $body ) ? $body : [];

        if ( ! empty( $body['pointsInfo'] ) && is_array( $body['pointsInfo'] ) ) {
            Points::record( $body['pointsInfo'] );
        }

        $code = isset( $body['code'] ) ? (int) $body['code'] : 200;

        if ( 200 === $http && in_array( $code, [ 0, 200 ], true ) ) {
            return $body['data'] ?? null;
        }

        $exception = $this->to_exception( $http, $code, $body );

        if ( $retry_auth && ApiException::AUTH_FAILED === $exception->get_reason() && ! $is_auth ) {
            ( new TokenManager( $this ) )->refresh();

            return $this->request( $method, $path, $params, $priority, false );
        }

        if ( ApiException::SUSPENDED === $exception->get_reason() ) {
            Status::mark_suspended( $exception->getMessage() );
        }

        dokan_log( sprintf( '[CJ Dropshipping] %s %s failed: %d %s (requestId %s)', $method, $path, $code, $exception->getMessage(), $exception->get_request_id() ), 'error' );

        throw $exception;
    }

    /**
     * Throw when the account can't be used right now.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     * @throws ApiException When not connected.
     */
    private function assert_usable(): void {
        $state = Status::get_state();

        if ( Status::SUSPENDED === $state ) {
            throw new ApiException( ApiException::SUSPENDED, esc_html__( 'CJ has suspended API access for the marketplace account.', 'dokan-lite' ), 1600014 ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        if ( Status::CONNECTED !== $state ) {
            throw new ApiException( ApiException::NOT_CONNECTED, esc_html__( 'The marketplace CJ account is not connected.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }
    }

    /**
     * Map CJ's error code to an exception.
     *
     * @since DOKAN_SINCE
     *
     * @param int   $http HTTP status.
     * @param int   $code CJ code.
     * @param array $body Decoded body.
     *
     * @return ApiException
     */
    private function to_exception( int $http, int $code, array $body ): ApiException {
        $message    = (string) ( $body['message'] ?? __( 'Unknown CJ error.', 'dokan-lite' ) );
        $request_id = (string) ( $body['requestId'] ?? '' );

        if ( 1600014 === $code ) {
            $reason = ApiException::SUSPENDED;
        } elseif ( in_array( $code, [ 429, 16900500 ], true ) || ( 429 === $http && 1600200 !== $code ) ) {
            $reason = ApiException::POINTS_EXHAUSTED;
        } elseif ( in_array( $code, [ 1600200, 1600201, 1600000, 1600301 ], true ) || $http >= 500 ) {
            $reason = ApiException::RATE_LIMITED;
        } elseif ( in_array( $code, [ 1600001, 1600002, 1600003, 1600004, 1600005, 1600008, 1601000 ], true ) ) {
            $reason = ApiException::AUTH_FAILED;
        } elseif ( in_array( $code, [ 1602000, 1602001, 1602002, 1602003 ], true ) ) {
            $reason = ApiException::NOT_FOUND;
        } elseif ( in_array( $code, [ 1600100, 1600300, 1605002 ], true ) || ( $code >= 16900200 && $code < 16900500 ) ) {
            $reason = ApiException::INVALID_REQUEST;
        } else {
            $reason = ApiException::UNKNOWN;
        }

        return new ApiException( $reason, $message, $code, $request_id );
    }
}
