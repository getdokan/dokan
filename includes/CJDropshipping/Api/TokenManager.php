<?php

namespace WeDevs\Dokan\CJDropshipping\Api;

use WeDevs\Dokan\CJDropshipping\Security\Credentials;
use WeDevs\Dokan\CJDropshipping\Status;

/**
 * Gets, stores and refreshes the marketplace account's CJ tokens.
 *
 * @since DOKAN_SINCE
 */
class TokenManager {

    // Refresh this long before the 180-day access token expires.
    private const REFRESH_MARGIN = 15 * DAY_IN_SECONDS;

    protected Client $client;

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param Client|null $client API client.
     */
    public function __construct( ?Client $client = null ) {
        $this->client = $client ?? new Client();
    }

    /**
     * Connect the marketplace CJ account with an API key.
     *
     * @since DOKAN_SINCE
     *
     * @param string $api_key Key from CJ's API page.
     *
     * @return void
     * @throws ApiException When CJ rejects the key.
     */
    public function connect( string $api_key ): void {
        $data = $this->client->request( 'POST', 'authentication/getAccessToken', [ 'apiKey' => $api_key ], Points::CHECKOUT, false );

        if ( empty( $data['accessToken'] ) ) {
            throw new ApiException( ApiException::AUTH_FAILED, esc_html__( 'CJ did not return an access token for this API key.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        Credentials::clear();
        Credentials::save(
            array_merge(
                [
                    'api_key'      => $api_key,
                    'open_id'      => (string) ( $data['openId'] ?? '' ),
                    'connected_at' => time(),
                ],
                $this->token_fields( $data )
            )
        );

        Status::mark_connected();
    }

    /**
     * Current access token, refreshing it when it is close to expiry.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     * @throws ApiException When no usable token exists.
     */
    public function access_token(): string {
        $token = Credentials::get( 'access_token' );

        if ( null === $token ) {
            Status::mark_needs_reconnect( __( 'The saved CJ key can no longer be read. Reconnect the CJ account.', 'dokan-lite' ) );

            throw new ApiException( ApiException::AUTH_FAILED, esc_html__( 'The saved CJ credentials can no longer be read.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        if ( '' === $token ) {
            throw new ApiException( ApiException::NOT_CONNECTED, esc_html__( 'The marketplace CJ account is not connected.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        if ( (int) Credentials::get( 'access_expires' ) - time() < self::REFRESH_MARGIN ) {
            $this->refresh();
            $token = (string) Credentials::get( 'access_token' );
        }

        return $token;
    }

    /**
     * Refresh the tokens, falling back to the API key when the refresh token fails.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     * @throws ApiException When neither works; the admin must reconnect.
     */
    public function refresh(): void {
        global $wpdb;

        $expires_before = (int) Credentials::get( 'access_expires' );

        // Concurrent auth failures must not stampede CJ's 1 call/second auth endpoint.
        if ( ! $wpdb->get_var( $wpdb->prepare( 'SELECT GET_LOCK( %s, 10 )', 'dokan_cj_token' ) ) ) {
            throw new ApiException( ApiException::RATE_LIMITED, esc_html__( 'The CJ token is being refreshed. Try again in a moment.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        try {
            wp_cache_delete( Credentials::OPTION, 'options' );

            // Another process refreshed while we waited.
            if ( (int) Credentials::get( 'access_expires' ) > $expires_before + MINUTE_IN_SECONDS ) {
                return;
            }

            $this->request_new_tokens();
        } finally {
            $wpdb->query( $wpdb->prepare( 'SELECT RELEASE_LOCK( %s )', 'dokan_cj_token' ) );
        }
    }

    /**
     * Ask CJ for new tokens with the refresh token, then the API key.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     * @throws ApiException When neither works.
     */
    private function request_new_tokens(): void {
        $refresh_token = Credentials::get( 'refresh_token' );
        $api_key       = Credentials::get( 'api_key' );

        if ( null === $refresh_token || null === $api_key ) {
            Status::mark_needs_reconnect( __( 'The saved CJ key can no longer be read. Reconnect the CJ account.', 'dokan-lite' ) );

            throw new ApiException( ApiException::AUTH_FAILED, esc_html__( 'The saved CJ credentials can no longer be read.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        try {
            $data = $this->client->request( 'POST', 'authentication/refreshAccessToken', [ 'refreshToken' => $refresh_token ], Points::CHECKOUT, false );
        } catch ( ApiException $e ) {
            if ( ApiException::AUTH_FAILED !== $e->get_reason() ) {
                throw $e;
            }

            try {
                $data = $this->client->request( 'POST', 'authentication/getAccessToken', [ 'apiKey' => $api_key ], Points::CHECKOUT, false );
            } catch ( ApiException $retry ) {
                if ( ApiException::AUTH_FAILED === $retry->get_reason() ) {
                    Status::mark_needs_reconnect( $retry->getMessage() );
                }

                throw $retry;
            }
        }

        if ( empty( $data['accessToken'] ) ) {
            throw new ApiException( ApiException::AUTH_FAILED, esc_html__( 'CJ did not return an access token.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        Credentials::save( $this->token_fields( $data ) );
    }

    /**
     * Token fields to store from a CJ auth response.
     *
     * @since DOKAN_SINCE
     *
     * @param array $data CJ `data`.
     *
     * @return array
     */
    private function token_fields( array $data ): array {
        return [
            'access_token'    => (string) $data['accessToken'],
            'refresh_token'   => (string) ( $data['refreshToken'] ?? '' ),
            'access_expires'  => $this->to_timestamp( $data['accessTokenExpiryDate'] ?? '', 180 ),
            'refresh_expires' => $this->to_timestamp( $data['refreshTokenExpiryDate'] ?? '', 180 ),
        ];
    }

    /**
     * Parse CJ's expiry date, defaulting to N days from now.
     *
     * @since DOKAN_SINCE
     *
     * @param string $date CJ date string.
     * @param int    $days Fallback lifetime in days.
     *
     * @return int
     */
    private function to_timestamp( string $date, int $days ): int {
        $time = $date ? strtotime( $date ) : false;

        return $time ? (int) $time : time() + $days * DAY_IN_SECONDS;
    }
}
