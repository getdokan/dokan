<?php
namespace WeDevs\Dokan\ReverseWithdrawal\BackgroundProcess;

use WeDevs\Dokan\Emails\ReverseWithdrawalInvoice;
use WeDevs\Dokan\ReverseWithdrawal\FailedActions;
use WeDevs\Dokan\ReverseWithdrawal\Helper;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Async Requests
 *
 * @since 3.5.1
 *
 * @package WeDevs\Dokan\ReverseWithdrawal\BackgroundProcess
 */
class AsyncRequests {
    /**
     * Class Constructor
     *
     * @since 3.5.1
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
     * @since 3.5.1
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

        $vendors = isset( $args['data'] ) ? $args['data'] : [];
        if ( empty( $vendors ) || ! is_array( $vendors ) ) {
            return;
        }

        $failed_actions = new FailedActions();
        foreach ( $vendors as $vendor_id ) {
            // maybe take action
            $failed_actions->ensure_reverse_pay_actions( $vendor_id );
            // maybe revert taken action
            $failed_actions->revert_reverse_pay_actions( $vendor_id );
        }
    }

    /**
     * Send billing invoice email
     *
     * @since 3.5.1
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

        $vendors = isset( $args['data'] ) ? $args['data'] : [];
        if ( empty( $vendors ) || ! is_array( $vendors ) ) {
            return;
        }

        $failed_actions = new FailedActions();
        $invoice_email  = new ReverseWithdrawalInvoice();
        foreach ( $vendors as $vendor_id ) {
            // maybe take action
            $failed_actions->ensure_reverse_pay_actions( $vendor_id );
            // maybe revert taken action
            $failed_actions->revert_reverse_pay_actions( $vendor_id );

            // check if we need to send invoice email
            $due_status = Helper::get_vendor_due_status( $vendor_id );

            if ( is_wp_error( $due_status ) || false === $due_status['status'] ) {
                // no need to send invoice email, coz vendor has no due
                continue;
            }

            $invoice_email->trigger( $vendor_id, $due_status );

            do_action( 'dokan_reverse_withdrawal_invoice_email_sent', $vendor_id, $due_status, dokan_current_datetime()->format( 'Y-m-d' ) );
        }
    }
}
