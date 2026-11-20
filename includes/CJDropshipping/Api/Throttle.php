<?php

namespace WeDevs\Dokan\CJDropshipping\Api;

/**
 * Spaces CJ calls across all PHP processes to the account's requests per second.
 *
 * @since DOKAN_SINCE
 */
class Throttle {

    private const SLOT_OPTION = 'dokan_cj_next_slot';
    private const LOCK        = 'dokan_cj_throttle';

    /**
     * Reserve the next free call slot and wait for it.
     *
     * @since DOKAN_SINCE
     *
     * @param string $priority Points priority; checkout may wait longer.
     *
     * @return void
     * @throws ApiException When the wait would be too long.
     */
    public static function wait( string $priority ): void {
        global $wpdb;

        $interval = 1 / max( 1, (int) apply_filters( 'dokan_cj_requests_per_second', 1 ) );
        $max_wait = Points::CHECKOUT === $priority ? 3.0 : 1.0;

        if ( ! $wpdb->get_var( $wpdb->prepare( 'SELECT GET_LOCK( %s, 3 )', self::LOCK ) ) ) {
            throw new ApiException( ApiException::RATE_LIMITED, esc_html__( 'CJ is busy. Try again in a moment.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        // Read straight from the table: another process may have moved the slot.
        $next = (float) $wpdb->get_var( $wpdb->prepare( "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s", self::SLOT_OPTION ) );
        $now  = microtime( true );
        $slot = max( $now, $next );

        if ( $slot - $now > $max_wait ) {
            $wpdb->query( $wpdb->prepare( 'SELECT RELEASE_LOCK( %s )', self::LOCK ) );

            throw new ApiException( ApiException::RATE_LIMITED, esc_html__( 'CJ is busy. Try again in a moment.', 'dokan-lite' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        $wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $wpdb->prepare(
                "INSERT INTO {$wpdb->options} ( option_name, option_value, autoload ) VALUES ( %s, %s, 'no' ) ON DUPLICATE KEY UPDATE option_value = VALUES( option_value )",
                self::SLOT_OPTION,
                (string) ( $slot + $interval )
            )
        );
        $wpdb->query( $wpdb->prepare( 'SELECT RELEASE_LOCK( %s )', self::LOCK ) );

        if ( $slot > $now ) {
            usleep( (int) ( ( $slot - $now ) * 1000000 ) );
        }
    }
}
