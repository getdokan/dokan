<?php

namespace WeDevs\Dokan\CJDropshipping;

/**
 * Connection state of the marketplace CJ account.
 *
 * @since DOKAN_SINCE
 */
class Status {

    public const OPTION = 'dokan_cj_status';

    public const DISCONNECTED    = 'disconnected';
    public const CONNECTED       = 'connected';
    public const SUSPENDED       = 'suspended';
    public const NEEDS_RECONNECT = 'needs_reconnect';

    // CJ suspends after 30 days without a transaction; warn this many days in (F3).
    public const SUSPENSION_DAYS = 30;
    public const WARNING_DAYS    = 25;

    /**
     * Current state.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function get_state(): string {
        return (string) ( self::raw()['state'] ?? self::DISCONNECTED );
    }

    /**
     * Whether CJ calls can be made right now.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_connected(): bool {
        return self::CONNECTED === self::get_state();
    }

    /**
     * Full stored status.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function raw(): array {
        $stored = get_option( self::OPTION, [] );

        return is_array( $stored ) ? $stored : [];
    }

    /**
     * Mark the account connected, restarting the suspension clock.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function mark_connected(): void {
        $previous = self::get_state();

        self::update(
            [
                'state'        => self::CONNECTED,
                'active_since' => time(),
                'error'        => '',
            ]
        );

        if ( self::CONNECTED !== $previous ) {
            do_action( 'dokan_cj_connected', $previous );
        }
    }

    /**
     * Mark the account suspended by CJ (1600014).
     *
     * @since DOKAN_SINCE
     *
     * @param string $message CJ's message.
     *
     * @return void
     */
    public static function mark_suspended( string $message = '' ): void {
        if ( self::SUSPENDED === self::get_state() ) {
            return;
        }

        $last = (int) ( self::raw()['suspended_at'] ?? 0 );

        self::update(
            [
                'state'        => self::SUSPENDED,
                'suspended_at' => time(),
                'error'        => $message,
            ]
        );

        // A failed "I reactivated it" recheck shouldn't email the admin again the same day.
        if ( time() - $last > DAY_IN_SECONDS ) {
            do_action( 'dokan_cj_suspended' );
        }
    }

    /**
     * Mark that stored credentials no longer work and the admin must reconnect.
     *
     * @since DOKAN_SINCE
     *
     * @param string $message Why.
     *
     * @return void
     */
    public static function mark_needs_reconnect( string $message = '' ): void {
        if ( self::NEEDS_RECONNECT === self::get_state() ) {
            return;
        }

        self::update(
            [
                'state' => self::NEEDS_RECONNECT,
                'error' => $message,
            ]
        );

        do_action( 'dokan_cj_needs_reconnect' );
    }

    /**
     * Mark the account disconnected.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function mark_disconnected(): void {
        update_option( self::OPTION, [ 'state' => self::DISCONNECTED ], false );
    }

    /**
     * Days since the account was connected or reactivated.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public static function days_active(): int {
        $since = (int) ( self::raw()['active_since'] ?? 0 );

        return $since ? (int) floor( ( time() - $since ) / DAY_IN_SECONDS ) : 0;
    }

    /**
     * Whether to warn the admin that suspension is close (F3).
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_suspension_near(): bool {
        return self::is_connected() && self::days_active() >= self::WARNING_DAYS;
    }

    /**
     * Merge fields into the stored status.
     *
     * @since DOKAN_SINCE
     *
     * @param array $fields Fields to set.
     *
     * @return void
     */
    private static function update( array $fields ): void {
        update_option( self::OPTION, array_merge( self::raw(), $fields ), false );
    }
}
