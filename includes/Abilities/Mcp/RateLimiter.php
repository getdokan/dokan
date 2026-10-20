<?php

namespace WeDevs\Dokan\Abilities\Mcp;

defined( 'ABSPATH' ) || exit;

/**
 * Locks out a client that keeps presenting a credential that does not work.
 *
 * Only failed authentication is counted; a request carrying no credential at all is the opening
 * move of the OAuth handshake and never reaches the counter. The window is fixed, not rolling:
 * a stranded client retrying every few minutes cannot keep re-arming its own lockout.
 *
 * @since DOKAN_SINCE
 */
class RateLimiter {

    /**
     * Transient key prefix; the hashed client IP is appended.
     *
     * @since DOKAN_SINCE
     */
    const PREFIX = 'dokan_mcp_rl_';

    /**
     * Failed attempts before a lockout.
     *
     * @since DOKAN_SINCE
     */
    const DEFAULT_MAX_FAILS = 10;

    /**
     * Lockout / window length, in seconds.
     *
     * @since DOKAN_SINCE
     */
    const DEFAULT_LOCKOUT = 900;

    /**
     * Whether the current client is locked out.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_locked(): bool {
        return self::attempts() >= self::limits()[0];
    }

    /**
     * Record a failed attempt for the current client.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function record_failure(): void {
        list( , $window ) = self::limits();

        $key   = self::key();
        $entry = get_transient( $key );

        if ( is_array( $entry ) && isset( $entry['count'], $entry['until'] ) ) {
            ++$entry['count'];

            // Keep the original window end: the TTL is only what remains of it.
            set_transient( $key, $entry, max( 1, (int) $entry['until'] - time() ) );

            return;
        }

        set_transient(
            $key,
            [
                'count' => 1,
                'until' => time() + $window,
            ],
            $window
        );
    }

    /**
     * Clear the counter for the current client, on a successful authentication.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function clear(): void {
        delete_transient( self::key() );
    }

    /**
     * Seconds until the current client's window ends.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public static function retry_after(): int {
        $entry = get_transient( self::key() );

        if ( is_array( $entry ) && isset( $entry['until'] ) ) {
            return max( 1, (int) $entry['until'] - time() );
        }

        return self::limits()[1];
    }

    /**
     * Current failed-attempt count for this client.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    private static function attempts(): int {
        $value = get_transient( self::key() );

        return is_array( $value ) && isset( $value['count'] ) ? (int) $value['count'] : 0;
    }

    /**
     * Transient key bound to the hashed client IP.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    private static function key(): string {
        return self::PREFIX . md5( self::client_ip() );
    }

    /**
     * The requesting IP, as PHP sees it.
     *
     * Proxy headers are deliberately not trusted here: a spoofable header would let an attacker
     * dodge the lockout, or lock out a victim of their choosing.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    private static function client_ip(): string {
        return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
    }

    /**
     * The configured limits.
     *
     * @since DOKAN_SINCE
     *
     * @return array{0:int,1:int} Max failures, window seconds.
     */
    private static function limits(): array {
        /**
         * Filters the MCP authentication lockout limits.
         *
         * @since DOKAN_SINCE
         *
         * @param array{max_fails:int,lockout:int} $limits Failed attempts before a lockout, and its length in seconds.
         */
        $limits = (array) apply_filters(
            'dokan_mcp_rate_limits',
            [
                'max_fails' => self::DEFAULT_MAX_FAILS,
                'lockout'   => self::DEFAULT_LOCKOUT,
            ]
        );

        return [
            max( 1, (int) ( $limits['max_fails'] ?? self::DEFAULT_MAX_FAILS ) ),
            max( 1, (int) ( $limits['lockout'] ?? self::DEFAULT_LOCKOUT ) ),
        ];
    }
}
