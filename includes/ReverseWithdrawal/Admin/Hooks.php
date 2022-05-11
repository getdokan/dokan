<?php
namespace WeDevs\Dokan\ReverseWithdrawal\Admin;

use WeDevs\Dokan\ReverseWithdrawal\Helper;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

class Hooks {
    /**
     * Admin constructor.
     */
    public function __construct() {
        // fix admin report log list
        add_filter( 'dokan_log_exclude_commission', [ $this, 'report_log_exclude_commission' ], 10, 2 );

        // maybe take action after settings has been saved
        add_action( 'dokan_after_saving_settings', [ $this, 'maybe_take_action' ], 11, 3 );
    }

    /**
     * Exclude commission from report log if order contains advertisement product
     *
     * @since DOKAN_SINCE
     *
     * @param bool $exclude
     * @param object $order
     *
     * @return bool
     */
    public function report_log_exclude_commission( $exclude, $order ) {
        if ( Helper::has_reverse_withdrawal_payment_in_order( $order->order_id ) ) {
            return true;
        }

        return $exclude;
    }

    /**
     * Maybe take action after settings has been saved
     *
     * @since DOKAN_SINCE
     *
     * @param string $option_name
     * @param array $new_value
     * @param array $old_value
     *
     * @return void
     */
    public function maybe_take_action( $option_name, $new_value, $old_value ) {
        if ( 'dokan_reverse_withdrawal' !== $option_name ) {
            return;
        }

        // check if reverse withdrawal is enabled
        if ( 'off' === $new_value['enabled'] ) {
            return;
        }

        dokan()->reverse_withdrawal->cron_actions->maybe_take_action();
    }
}
