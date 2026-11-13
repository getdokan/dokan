<?php

namespace WeDevs\Dokan\CJDropshipping;

/**
 * Background jobs for CJ Dropshipping, on WooCommerce's Action Scheduler.
 *
 * @since DOKAN_SINCE
 */
class Queue {

    public const GROUP = 'dokan-cj';

    /**
     * Run a job as soon as possible, once per hook and args.
     *
     * @since DOKAN_SINCE
     *
     * @param string $hook Action hook.
     * @param array  $args Small, JSON-safe args.
     *
     * @return void
     */
    public static function enqueue( string $hook, array $args = [] ): void {
        if ( self::is_pending( $hook, $args ) ) {
            return;
        }

        WC()->queue()->add( $hook, $args, self::GROUP );
    }

    /**
     * Run a job later, once per hook and args.
     *
     * @since DOKAN_SINCE
     *
     * @param int    $delay Seconds from now.
     * @param string $hook  Action hook.
     * @param array  $args  Args.
     *
     * @return void
     */
    public static function schedule( int $delay, string $hook, array $args = [] ): void {
        if ( self::is_pending( $hook, $args ) ) {
            return;
        }

        WC()->queue()->schedule_single( time() + $delay, $hook, $args, self::GROUP );
    }

    /**
     * Make sure a recurring job exists.
     *
     * @since DOKAN_SINCE
     *
     * @param string $hook     Action hook.
     * @param int    $interval Seconds between runs.
     *
     * @return void
     */
    public static function ensure_recurring( string $hook, int $interval ): void {
        if ( self::is_pending( $hook ) ) {
            return;
        }

        WC()->queue()->schedule_recurring( time() + MINUTE_IN_SECONDS, $interval, $hook, [], self::GROUP );
    }

    /**
     * Whether a job is already waiting.
     *
     * @since DOKAN_SINCE
     *
     * @param string     $hook Action hook.
     * @param array|null $args Args, or null for any.
     *
     * @return bool
     */
    public static function is_pending( string $hook, ?array $args = null ): bool {
        // Counts a running action too, so a long batch can't get a second recurring chain.
        if ( function_exists( 'as_has_scheduled_action' ) ) {
            return as_has_scheduled_action( $hook, $args, self::GROUP );
        }

        return (bool) WC()->queue()->get_next( $hook, $args, self::GROUP );
    }

    /**
     * Cancel every pending CJ job.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function cancel_all(): void {
        if ( function_exists( 'as_unschedule_all_actions' ) ) {
            as_unschedule_all_actions( '', [], self::GROUP );
        }
    }
}
