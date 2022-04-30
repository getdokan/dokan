<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

class Settings {
    /**
     * Check if reverse withdrawal feature is enabled
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_enabled() {
        return 'on' === dokan_get_option( 'enabled', 'dokan_reverse_withdrawal', 'off' );
    }

    /**
     * Get enabled payment gateways for reverse withdrawal
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function get_enabled_payment_gateways() {
        $payment_methods = dokan_get_option( 'payment_gateways', 'dokan_reverse_withdrawal', [] );

        return array_keys( $payment_methods );
    }

    /**
     * Check if gateway is enabled for reverse withdrawal
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_gateway_enabled_for_reverse_withdrawal( $gateway ) {
        $payment_methods = dokan_get_option( 'payment_gateways', 'dokan_reverse_withdrawal', [] );

        return isset( $payment_methods[ $gateway ] );
    }

    /**
     * Get reverse withdrawal billing type
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function get_billing_type() {
        $billing_type = dokan_get_option( 'billing_type', 'dokan_reverse_withdrawal', 'by_amount' );

        return $billing_type;
    }

    /**
     * Get reverse withdrawal threshold limit
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public static function get_reverse_balance_threshold() {
        $limit = dokan_get_option( 'reverse_balance_threshold', 'dokan_reverse_withdrawal', '150' );

        return (float) wc_format_decimal( $limit, 2 );
    }

    /**
     * Get reverse withdrawal billing day
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public static function get_billing_day() {
        $billing_day = dokan_get_option( 'billing_day', 'dokan_reverse_withdrawal', '1' );

        return $billing_day;
    }

    /**
     * Get reverse withdrawal billing day
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public static function get_due_period() {
        $due_period = dokan_get_option( 'due_period', 'dokan_reverse_withdrawal', '7' );

        return absint( $due_period );
    }

    /**
     * Get reverse withdrawal failed payment actions
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function get_failed_actions() {
        $failed_actions = dokan_get_option( 'failed_actions', 'dokan_reverse_withdrawal', [] );

        return array_keys( $failed_actions );
    }

    /**
     * Check if action is enabled for reverse withdrawal
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_failed_action_enabled( $action ) {
        $failed_actions = dokan_get_option( 'failed_actions', 'dokan_reverse_withdrawal', [] );

        return isset( $failed_actions[ $action ] );
    }

    /**
     * Check if display notification is enabled during due period for reverse withdrawal
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_display_notice_enabled() {
        return 'on' === dokan_get_option( 'display_notice', 'dokan_reverse_withdrawal', 'off' );
    }

    /**
     * Check if sending announcement is enabled during due period for reverse withdrawal
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_announcement_enabled() {
        return 'on' === dokan_get_option( 'send_announcement', 'dokan_reverse_withdrawal', 'off' );
    }

    /**
     * Get reverse withdrawal payment gateways
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function get_reverse_withrawal_payment_gateways() {
        $gateways = [
            'cod'    => __( 'Cash on delivery', 'dokan-lite' ),
            'cheque' => __( 'Cheque Payments', 'dokan-lite' ),
        ];
        return apply_filters( 'dokan_reverse_withdrawal_payment_gateways', $gateways );
    }

    /**
     * Get reverse withdrawal billing type
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function get_billing_type_options() {
        $options = [
            'by_amount' => __( 'By Amount Limit', 'dokan-lite' ),
            'by_month'  => __( 'By Monthly', 'dokan-lite' ),
        ];
        return apply_filters( 'dokan_reverse_withdrawal_billing_type_options', $options );
    }

    /**
     * Get reverse withdrawal failed payment actions
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function get_failed_payment_actions() {
        $actions = [
            'enable_catalog_mode' => __( 'Enable Catalog Mode', 'dokan-lite' ),
            'hide_withdraw_menu'  => __( 'Hide Withdraw Menu', 'dokan-lite' ),
            'status_inactive'     => __( 'Make Vendor Status Inactive', 'dokan-lite' ),
        ];
        return apply_filters( 'dokan_reverse_withdrawal_failed_payment_actions', $actions );
    }
}
