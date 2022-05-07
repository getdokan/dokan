<?php
namespace WeDevs\Dokan\ReverseWithdrawal\BackgroundProcess;

use WeDevs\Dokan\ReverseWithdrawal\FailedActions;
use WeDevs\Dokan\ReverseWithdrawal\Helper;
use WeDevs\Dokan\ReverseWithdrawal\SettingsHelper;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Async Requests
 *
 * @since DOKAN_SINCE
 *
 * @package WeDevs\Dokan\ReverseWithdrawal\BackgroundProcess
 */
class AsyncRequests {
    /**
     * Class Constructor
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        // check if we need to take reverse withdrawal actions
        add_action( 'dokan_reverse_withdrawal_async_actions', [ $this, 'maybe_take_actions' ] );

        // send emails
        add_action( 'dokan_reverse_withdrawal_async_actions', [ $this, 'send_billing_invoice_email' ] );
    }

    /**
     * Take actions for given vendors
     *
     * @since DOKAN_SINCE
     *
     * @param array $args
     *
     * @return void
     */
    public function maybe_take_actions( $args = [] ) {
        // validate args
        if ( ! isset( $args['task'] ) || 'maybe_take_action' !== $args['task'] ) {
            return;
        }

        $vendors = isset( $args['vendors'] ) ? $args['vendors'] : [];
        if ( empty( $vendors ) || ! is_array( $vendors ) ) {
            return;
        }

        $failed_actions = new FailedActions();
        foreach ( $vendors as $vendor_id ) {
            $failed_actions->ensure_reverse_pay_actions( $vendor_id );
        }
    }

    /**
     * Send billing invoice email
     *
     * @since DOKAN_SINCE
     *
     * @param array $args
     *
     * @return void
     */
    /**
     * Take actions for given vendors
     *
     * @since DOKAN_SINCE
     *
     * @param array $args
     *
     * @return void
     */
    public function send_billing_invoice_email( $args = [] ) {
        // validate args
        if ( ! isset( $args['task'] ) || 'send_billing_invoice_email' !== $args['task'] ) {
            return;
        }

        $vendors = isset( $args['vendors'] ) ? $args['vendors'] : [];
        if ( empty( $vendors ) || ! is_array( $vendors ) ) {
            return;
        }

        $invoice_email = new \WeDevs\Dokan\Emails\ReverseWithdrawalInvoice();
        foreach ( $vendors as $vendor_id ) {
            // check if we need to send invoice email
            $due_status = Helper::get_vendor_due_status( $vendor_id );

            if ( false === $due_status['status'] ) {
                // no need to send invoice email, coz vendor has no due
                continue;
            }

            $invoice_email->trigger( $vendor_id, $due_status );
            dokan_log( sprintf( '[Reverse Withdrawal] Invoice Mail send to %d', $vendor_id ) );

            do_action( 'dokan_reverse_withdrawal_invoice_email_sent', $vendor_id, $due_status, dokan_current_datetime()->format( 'Y-m-d' ) );
        }
    }
}
