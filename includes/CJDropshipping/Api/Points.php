<?php

namespace WeDevs\Dokan\CJDropshipping\Api;

/**
 * Tracks the marketplace's shared CJ points budget and who may spend it.
 *
 * @since DOKAN_SINCE
 */
class Points {

    public const OPTION = 'dokan_cj_points';

    // Checkout first, then stock, then import/search, then the price check (F2, H3).
    public const CHECKOUT    = 'checkout';
    public const STOCK       = 'stock';
    public const INTERACTIVE = 'interactive';
    public const BACKGROUND  = 'background';

    /**
     * Save the pointsInfo CJ returned.
     *
     * @since DOKAN_SINCE
     *
     * @param array $info CJ's pointsInfo: usedToday, remaining, total.
     *
     * @return void
     */
    public static function record( array $info ): void {
        if ( ! isset( $info['remaining'], $info['total'] ) ) {
            return;
        }

        update_option(
            self::OPTION,
            [
                'used_today'  => (int) ( $info['usedToday'] ?? 0 ),
                'remaining'   => (int) $info['remaining'],
                'total'       => (int) $info['total'],
                'recorded_at' => time(),
            ],
            false
        );
    }

    /**
     * Last recorded points info.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function get(): array {
        $stored = get_option( self::OPTION, [] );

        return is_array( $stored ) ? $stored : [];
    }

    /**
     * Daily total, or CJ's base 50,000 before the first call.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public static function total(): int {
        return (int) ( self::get()['total'] ?? 50000 );
    }

    /**
     * Remaining points now, adding CJ's per-minute top-up since the last call.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public static function estimated_remaining(): int {
        $info = self::get();

        if ( ! isset( $info['remaining'] ) ) {
            return self::total();
        }

        $minutes = max( 0, (int) floor( ( time() - (int) $info['recorded_at'] ) / MINUTE_IN_SECONDS ) );
        $topup   = (int) floor( $minutes * self::total() / 1440 );

        return min( self::total(), (int) $info['remaining'] + $topup );
    }

    /**
     * Whether a call of this cost may run at this priority.
     *
     * @since DOKAN_SINCE
     *
     * @param int    $cost     Points the call costs.
     * @param string $priority One of the priority constants.
     *
     * @return bool
     */
    public static function can_spend( int $cost, string $priority ): bool {
        if ( 0 === $cost ) {
            return true;
        }

        $reserve = (int) floor( self::total() * self::reserve_ratio( $priority ) );

        return self::estimated_remaining() - $cost >= $reserve;
    }

    /**
     * Share of the daily total a priority must leave for higher priorities.
     *
     * @since DOKAN_SINCE
     *
     * @param string $priority Priority constant.
     *
     * @return float
     */
    public static function reserve_ratio( string $priority ): float {
        $ratios = apply_filters(
            'dokan_cj_points_reserve_ratios',
            [
                self::CHECKOUT    => 0,
                self::STOCK       => 0.2,
                self::INTERACTIVE => 0.3,
                self::BACKGROUND  => 0.5,
            ]
        );

        return (float) ( $ratios[ $priority ] ?? 0.5 );
    }

    /**
     * Whether remaining points are below 10% of the daily total.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_low(): bool {
        return self::estimated_remaining() < self::total() * 0.1;
    }
}
