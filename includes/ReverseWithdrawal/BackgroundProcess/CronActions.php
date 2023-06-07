<?php
namespace WeDevs\Dokan\ReverseWithdrawal\BackgroundProcess;

use WeDevs\Dokan\ReverseWithdrawal\SettingsHelper;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * @since 3.5.1
 *
 * @package WeDevs\Dokan\ReverseWithdrawal\BackgroundProcess
 */
class CronActions {
    /**
     * CronActions constructor.
     *
     * @since 3.5.1
     */
    public function __construct() {
        // init background process hook
        add_action( 'init', [ $this, 'schedule_action' ] );

        // schedule monthly billing reminder cron
        add_action( 'dokan_after_saving_settings', [ $this, 'after_save_settings' ], 10, 3 );

        // daily check for unpaid reverse withdrawal balance
        add_action( 'dokan_reverse_withdrawal_midnight_cron', [ $this, 'maybe_take_action' ] );

        //send billing invoice to vendor
        if ( 'by_month' === SettingsHelper::get_billing_type() ) {
            add_action( 'dokan_reverse_withdrawal_monthly_cron', [ $this, 'send_billing_invoice_email' ] );
        }
    }

    /**
     * Schedule an action with the hook 'dokan_reverse_withdrawal_midnight_cron' to run at midnight each day
     * so that our callback is run then.
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function schedule_action() {
        $hook = 'dokan_reverse_withdrawal_midnight_cron';

        // check if reverse withdrawal feature is enabled
        if ( ! SettingsHelper::is_enabled() ) {
            as_unschedule_all_actions( $hook );
            return;
        }

        // schedule recurring cron action
        if ( false === as_next_scheduled_action( $hook ) ) {
            // remove previous actions, this will eliminate else condition
            as_unschedule_all_actions( $hook );
            $timestamp = dokan_current_datetime()->modify( 'tomorrow' )->getTimestamp();
            as_schedule_recurring_action( $timestamp, DAY_IN_SECONDS, $hook );
        }
    }

    /**
     * This method will schedule/unscheduled monthly billing reminder cron
     *
     * @since 3.5.1
     *
     * @param string $option_name
     * @param array $new_value
     * @param array $old_value
     *
     * @return void
     */
    public function after_save_settings( $option_name, $new_value, $old_value ) {
        if ( 'dokan_reverse_withdrawal' !== $option_name ) {
            return;
        }

        // define hook name beforehand
        $hook = 'dokan_reverse_withdrawal_monthly_cron';

        // check if reverse withdrawal is enabled
        if ( 'off' === $new_value['enabled'] ) {
            as_unschedule_all_actions( $hook );
            return;
        }

        // check if we've defined the cron hook
        $cron_schedule = as_next_scheduled_action( $hook ); // this method will return false if the hook is not scheduled

        // check for previous billing type value
        // if previous value is by_month and new value is not
        // and if we've scheduled a cron, we need to remove it
        if ( isset( $old_value['billing_type'] ) && 'by_month' === $old_value['billing_type'] && 'by_month' !== $new_value['billing_type'] && $cron_schedule ) {
            as_unschedule_all_actions( $hook );
            return;
        }

        // return if billing type is not by_month
        if ( 'by_month' !== $new_value['billing_type'] ) {
            return;
        }

        // check if monthly billing day is similar to previous one, in that case, we don't need to schedule cron
        if ( isset( $old_value['monthly_billing_day'] ) && intval( $new_value['monthly_billing_day'] ) === intval( $old_value['monthly_billing_day'] ) && $cron_schedule ) {
            return;
        }

        // remove previous actions, this will eliminate else condition
        as_unschedule_all_actions( $hook );

        // now schedule monthly billing reminder cron
        $timestamp     = dokan_current_datetime()->modify( 'yesterday' )->getTimestamp();
        $cron_schedule = sprintf( '0 8 %1$d * *', intval( $new_value['monthly_billing_day'] ) ); // 9:00 AM on $new_value['monthly_billing_day']th of the month
        as_schedule_cron_action( $timestamp, $cron_schedule, $hook );
    }

    /**
     * Take actions for unpaid vendors or revert taken actions
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function maybe_take_action() {
        $vendors = [];
        $i       = 1;
        // there might be thousands of vendors, so we are paginating vendors
        while ( null !== $vendors ) {
            $args = [
                'status' => 'all',
                'paged'  => $i++,
                'number' => 50,
                'fields' => 'ID',
            ];

            $vendors = dokan()->vendor->all( $args );

            if ( ! empty( $vendors ) ) {
                $args = [
                    'task' => 'maybe_take_action',
                    'data' => $vendors,
                ];
                as_enqueue_async_action( 'dokan_reverse_withdrawal_async_actions', [ $args ] );
            } else {
                $vendors = null;
            }
        }
    }

    /**
     * Send monthly billing reminder email to vendors
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function send_billing_invoice_email() {
        if ( 'by_month' !== SettingsHelper::get_billing_type() ) {
            return;
        }

        $vendors = [];
        $i       = 1;
        // there might be thousands of vendors, so we are paginating vendors
        while ( null !== $vendors ) {
            $args = [
                'status' => 'all',
                'paged'  => $i++,
                'number' => 5,
                'fields' => 'ID',
            ];

            $vendors = dokan()->vendor->all( $args );

            if ( ! empty( $vendors ) ) {
                $args = [
                    'task' => 'send_billing_invoice_email',
                    'data' => $vendors,
                ];
                as_enqueue_async_action( 'dokan_reverse_withdrawal_async_actions', [ $args ] );
            } else {
                $vendors = null;
            }
        }
    }
}
