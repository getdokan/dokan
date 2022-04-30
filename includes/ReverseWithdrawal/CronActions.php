<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * @since DOKAN_SINCE
 *
 * @package WeDevs\Dokan\ReverseWithdrawal
 */
class CronActions {
    /**
     * CronActions constructor.
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        // init background process hook
        add_action( 'init', [ $this, 'schedule_action' ] );

        // check if reverse withdrawal feature is enabled
        if ( ! SettingsHelper::is_enabled() ) {
            return;
        }

        // daily check for unpaid reverse withdrawal balance
        add_action( 'dokan_reverse_withdrawal_midnight_cron', [ $this, 'add_vendors_to_queue' ] );
        // check if we need to take reverse withdrawal actions
        add_action( 'dokan_reverse_withdrawal_maybe_take_actions', [ $this, 'maybe_take_actions' ] );
    }

    /**
     * Schedule an action with the hook 'dokan_reverse_withdrawal_midnight_cron' to run at midnight each day
     * so that our callback is run then.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function schedule_action() {
        if ( false === as_next_scheduled_action( 'dokan_reverse_withdrawal_midnight_cron' ) ) {
            $timestamp = dokan_current_datetime()->modify( 'tomorrow' )->getTimestamp();
            as_schedule_recurring_action( $timestamp, DAY_IN_SECONDS, 'dokan_reverse_withdrawal_midnight_cron' );
        }
    }

    /**
     * Expire unpaid vendors
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function add_vendors_to_queue() {
        $vendors = [];
        $i       = 0;
        while ( null !== $vendors ) {
            $args = [
                'status' => 'active',
                'offset' => $i++,
                'number' => 10,
                'fields' => 'ID',
            ];

            $vendors = dokan()->vendor->all( $args );

            if ( ! empty( $vendors ) ) {
                as_enqueue_async_action( 'dokan_reverse_withdrawal_maybe_take_actions', [ $vendors ] );
            } else {
                $vendors = null;
            }
        }
    }

    /**
     * Take actions for given vendors
     *
     * @since DOKAN_SINCE
     *
     * @param array $vendors
     *
     * @return void
     */
    public function maybe_take_actions( $vendors ) {
        // validate args
        if ( empty( $vendors ) || ! is_array( $vendors ) ) {
            return;
        }

        $failed_actions = new FailedActions();
        foreach ( $vendors as $vendor_id ) {
            $failed_actions->ensure_reverse_pay_actions( $vendor_id );
        }
    }
}
