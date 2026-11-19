<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders\Stats;

use Automattic\WooCommerce\Admin\ReportsSync;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Admin notice shown while the dokan_order_stats backfill is running.
 *
 * @since DOKAN_SINCE
 */
class BackfillNotice implements Hookable {
    /**
     * Option holding the timestamp the backfill was scheduled at.
     */
    public const OPTION = 'dokan_order_stats_backfill_started';

    /**
     * Seconds after which a marker is treated as stale, e.g. when Action Scheduler is stalled.
     */
    public const MAX_AGE = 3 * DAY_IN_SECONDS;

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_admin_notices', [ $this, 'add_notice' ] );
    }

    /**
     * Record that a backfill was scheduled.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function mark_started(): void {
        update_option( self::OPTION, time(), false );
    }

    /**
     * Whether the backfill is still running; clears the marker once WC's import ends or it goes stale.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_running(): bool {
        $started = (int) get_option( self::OPTION, 0 );

        if ( ! $started ) {
            return false;
        }

        if ( time() - $started < self::MAX_AGE && class_exists( ReportsSync::class ) && ReportsSync::is_importing() ) {
            return true;
        }

        delete_option( self::OPTION );

        return false;
    }

    /**
     * Add the "rebuilding analytics data" notice.
     *
     * @since DOKAN_SINCE
     *
     * @param array $notices Existing notices.
     *
     * @return array
     */
    public function add_notice( $notices ) {
        if ( ! current_user_can( dokan_admin_menu_capability() ) || ! self::is_running() ) {
            return $notices;
        }

        $notices[] = [
            'type'        => 'info',
            'scope'       => 'global',
            'title'       => __( 'Dokan is rebuilding its analytics data', 'dokan-lite' ),
            'description' => esc_html__( 'Your existing orders are being imported into Dokan reports in the background. Until it finishes, WooCommerce Analytics and Dokan reports show partial numbers. On stores with many orders this can take a while.', 'dokan-lite' ),
            'priority'    => 2,
            'actions'     => [
                [
                    'type'   => 'secondary',
                    'text'   => __( 'View import progress', 'dokan-lite' ),
                    'action' => esc_url_raw( wc_admin_url( '&path=/analytics/settings' ) ),
                ],
            ],
        ];

        return $notices;
    }
}
