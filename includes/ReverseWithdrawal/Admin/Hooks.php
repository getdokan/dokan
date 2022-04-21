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

}
