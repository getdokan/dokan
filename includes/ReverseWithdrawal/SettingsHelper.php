<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * @class SettingsHelper
 *
 * @since 3.5.1
 *
 * @package WeDevs\Dokan\ReverseWithdrawal
 */
class SettingsHelper {
    /**
     * Check if reverse withdrawal feature is enabled
     *
     * @since 3.5.1
     *
     * @return bool
     */
    public static function is_enabled() {
        return 'on' === dokan_get_option( 'enabled', 'dokan_reverse_withdrawal', 'off' );
    }

    /**
     * Get enabled payment gateways for reverse withdrawal
     *
     * @since 3.5.1
     *
     * @return array
     */
    public static function get_enabled_payment_gateways() {
        $payment_methods = dokan_get_option( 'payment_gateways', 'dokan_reverse_withdrawal', [] );

        return array_filter( $payment_methods );
    }

    /**
     * Check if gateway is enabled for reverse withdrawal
     *
     * @since 3.5.1
     *
     * @return bool
     */
    public static function is_gateway_enabled_for_reverse_withdrawal( $gateway ) {
        $payment_methods = static::get_enabled_payment_gateways();

        return in_array( $gateway, $payment_methods, true );
    }

    /**
     * Get reverse withdrawal billing type
     *
     * @since 3.5.1
     *
     * @return string
     */
    public static function get_billing_type() {
        return dokan_get_option( 'billing_type', 'dokan_reverse_withdrawal', 'by_amount' );
    }

    /**
     * Get reverse withdrawal threshold limit
     *
     * @since 3.5.1
     *
     * @return float
     */
    public static function get_reverse_balance_threshold() {
        $limit = dokan_get_option( 'reverse_balance_threshold', 'dokan_reverse_withdrawal', '150' );

        return (float) abs( wc_format_decimal( $limit, 2 ) );
    }

    /**
     * Get reverse withdrawal billing day
     *
     * @since 3.5.1
     *
     * @return float
     */
    public static function get_billing_day() {
        $billing_day = dokan_get_option( 'monthly_billing_day', 'dokan_reverse_withdrawal', '1' );

        return absint( $billing_day );
    }

    /**
     * Get reverse withdrawal billing day
     *
     * @since 3.5.1
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
     * @since 3.5.1
     *
     * @return array
     */
    public static function get_failed_actions() {
        $failed_actions = dokan_get_option( 'failed_actions', 'dokan_reverse_withdrawal', [] );

        return array_filter( $failed_actions );
    }

    /**
     * Check if action is enabled for reverse withdrawal
     *
     * @since 3.5.1
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
     * @since 3.5.1
     *
     * @return bool
     */
    public static function display_payment_notice_on_vendor_dashboard() {
        return 'on' === dokan_get_option( 'display_notice', 'dokan_reverse_withdrawal', 'on' );
    }

    /**
     * Check if sending announcement is enabled during due period for reverse withdrawal
     *
     * @since 3.5.1
     *
     * @return bool
     */
    public static function send_balance_exceeded_announcement() {
        return 'on' === dokan_get_option( 'send_announcement', 'dokan_reverse_withdrawal', 'off' );
    }

    /**
     * Get reverse withdrawal payment gateways
     *
     * @since 3.5.1
     *
     * @return array
     */
    public static function get_reverse_withrawal_payment_gateways() {
        $gateways = [
            'cod' => esc_html__( 'Cash on delivery', 'dokan-lite' ),
        ];
        return apply_filters( 'dokan_reverse_withdrawal_payment_gateways', $gateways );
    }

    /**
     * Get reverse withdrawal billing type
     *
     * @since 3.5.1
     *
     * @return array
     */
    public static function get_billing_type_options() {
        $options = [
            'by_amount' => esc_html__( 'By Amount Limit', 'dokan-lite' ),
            'by_month'  => esc_html__( 'Monthly', 'dokan-lite' ),
        ];
        return apply_filters( 'dokan_reverse_withdrawal_billing_type_options', $options );
    }

    /**
     * Get reverse withdrawal failed payment actions
     *
     * @since 3.5.1
     *
     * @return array
     */
    public static function get_failed_payment_actions() {
        $actions = [
            'enable_catalog_mode' => esc_html__( 'Disable Add to Cart Button', 'dokan-lite' ),
            'hide_withdraw_menu'  => esc_html__( 'Hide Withdraw Menu', 'dokan-lite' ),
            'status_inactive'     => esc_html__( 'Make Vendor Status Inactive', 'dokan-lite' ),
        ];
        return apply_filters( 'dokan_reverse_withdrawal_failed_payment_actions', $actions );
    }
}
