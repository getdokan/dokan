<?php

namespace WeDevs\Dokan\CJDropshipping;

use WeDevs\Dokan\CJDropshipping\Api\ApiException;
use WeDevs\Dokan\CJDropshipping\Api\Catalog;
use WeDevs\Dokan\CJDropshipping\Api\TokenManager;
use WeDevs\Dokan\CJDropshipping\Security\Credentials;

/**
 * Connects, checks and disconnects the marketplace CJ account.
 *
 * @since DOKAN_SINCE
 */
class Connection {

    public const REACTIVATE_URL = 'https://www.cjdropshipping.com/my.html#/authorize/APIStores';

    /**
     * Connect with an API key and confirm the account works.
     *
     * @since DOKAN_SINCE
     *
     * @param string $api_key Key from CJ's API page.
     *
     * @return array Account summary.
     * @throws ApiException When CJ rejects the key or the account is suspended.
     */
    public function connect( string $api_key ): array {
        $api_key = trim( $api_key );

        if ( '' === $api_key ) {
            throw new ApiException( ApiException::INVALID_REQUEST, esc_html__( 'Paste the API key from your CJ account.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        ( new TokenManager() )->connect( $api_key );

        return $this->check();
    }

    /**
     * Check the account with a free call; restarts the suspension clock when it works.
     *
     * @since DOKAN_SINCE
     *
     * @return array Account summary.
     * @throws ApiException When the account can't be used.
     */
    public function check(): array {
        if ( ! Credentials::has_key() ) {
            throw new ApiException( ApiException::NOT_CONNECTED, esc_html__( 'The marketplace CJ account is not connected.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        // A suspended account is retried once the admin says it was reactivated.
        if ( Status::SUSPENDED === Status::get_state() ) {
            Status::mark_connected();
        }

        $account = ( new Catalog() )->account();

        Status::mark_connected();
        Credentials::save(
            [
                'account_name'  => (string) ( $account['openName'] ?? '' ),
                'account_email' => (string) ( $account['openEmail'] ?? '' ),
                'checked_at'    => time(),
            ]
        );

        return $this->summary();
    }

    /**
     * Forget the account and tell other parts to take CJ products off sale (B9).
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function disconnect(): void {
        // Last chance to call CJ with this account, e.g. to stop webhooks.
        do_action( 'dokan_cj_before_disconnect' );

        // No CJ logout: it would also kill tokens other tools share on this account.
        Credentials::clear();
        Status::mark_disconnected();
        Queue::cancel_all();

        do_action( 'dokan_cj_disconnected' );
    }

    /**
     * What the admin settings screen shows about the connection.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function summary(): array {
        $raw     = Status::raw();
        $api_key = Credentials::has_key() ? (string) Credentials::get( 'api_key' ) : '';

        return [
            'state'          => Status::get_state(),
            'masked_key'     => $api_key ? self::mask( $api_key ) : '',
            'account_name'   => (string) Credentials::get( 'account_name' ),
            'account_email'  => (string) Credentials::get( 'account_email' ),
            'active_since'   => (int) ( $raw['active_since'] ?? 0 ),
            'days_active'    => Status::days_active(),
            'suspended_at'   => (int) ( $raw['suspended_at'] ?? 0 ),
            'error'          => (string) ( $raw['error'] ?? '' ),
            'reactivate_url' => self::REACTIVATE_URL,
            'points'         => Api\Points::get(),
            'points_left'    => Api\Points::estimated_remaining(),
            'webhooks'       => get_option( Sync\Webhooks::OPTION, null ),
            'webhook_url'    => Sync\Webhooks::url(),
        ];
    }

    /**
     * Show only the start and end of a key.
     *
     * @since DOKAN_SINCE
     *
     * @param string $key API key.
     *
     * @return string
     */
    public static function mask( string $key ): string {
        if ( strlen( $key ) <= 8 ) {
            return str_repeat( '•', strlen( $key ) );
        }

        return substr( $key, 0, 4 ) . str_repeat( '•', 8 ) . substr( $key, -4 );
    }
}
