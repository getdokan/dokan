<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Helper class for reverse withdrawal
 *
 * @since DOKAN_SINCE
 */
class Helper {
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
    public static function get_reverse_balance_limit() {
        $limit = dokan_get_option( 'reverse_balance_limit', 'dokan_reverse_withdrawal', '150' );

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
     * This method will return option key for reverse withdrawal base product
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function get_base_product_option_key() {
        return 'dokan_reverse_withdrawal_product_id';
    }

    /**
     * This method will check if cart contain reverse withdrawal product
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function has_reverse_withdrawal_payment_in_order( $order ) {
        // check if we get order object or order id
        if ( ! $order instanceof \WC_Abstract_Order && is_numeric( $order ) ) {
            // get order object from order_id
            $order = wc_get_order( $order );
        }

        if ( ! $order instanceof \WC_Abstract_Order ) {
            return false;
        }

        foreach ( $order->get_items() as $item ) {
            if ( $item->get_meta( '_dokan_reverse_withdrawal_balance' ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * This method will return reverse withdrawal payment amount
     *
     * @param \WC_Abstract_Order $order
     *
     * @since DOKAN_SINCE
     *
     * @return float|bool false if meta key not found
     */
    public static function get_balance_from_order( \WC_Abstract_Order $order ) {
        $balance = false;

        foreach ( $order->get_items() as $item ) {
            if ( $item->get_meta( '_dokan_reverse_withdrawal_balance' ) ) {
                $balance = floatval( wc_format_decimal( $item->get_meta( '_dokan_reverse_withdrawal_balance' ) ) );
                break;
            }
        }

        return $balance;
    }

    /**
     * Create advertisement product
     *
     * @since 3.5.0
     *
     * @return int
     */
    public static function get_reverse_withdrawal_base_product() {
        // get advertisement product id from option table
        return (int) get_option( static::get_base_product_option_key(), 0 );
    }

    /**
     * This method will check if cart contain reverse withdrawal payment product
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function has_reverse_withdrawal_payment_in_cart() {
        if ( ! WC()->cart ) {
            return false;
        }

        foreach ( WC()->cart->get_cart() as $item ) {
            if ( isset( $item['dokan_reverse_withdrawal_balance'] ) ) {
                return true;
            }
        }

        return false;
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
            'status_inactive'     => __( 'Make Vendor Status Inactive', 'dokan-lite' ),
            'enable_catalog_mode' => __( 'Enable Catalog Mode', 'dokan-lite' ),
            'hide_withdraw_menu'  => __( 'Hide Withdraw Menu', 'dokan-lite' ),
        ];
        return apply_filters( 'dokan_reverse_withdrawal_failed_payment_actions', $actions );
    }

    /**
     * Get reverse withdrawal failed payment actions
     *
     * @since DOKAN_SINCE
     *
     * @return array|string return associated array of transaction types if no argument is provided. If $transaction_type is provided and if data exists then return the label otherwise return empty string
     */
    public static function get_transaction_types( $transaction_type = null ) {
        /**
         * ! do not change the keys, it will break the query
         * ! also do not use any filter here, if new transaction type is needed add it to the array and also add it under database table
         */
        $transaction_types = [
            'order_commission'          => esc_html__( 'Commission', 'dokan-lite' ),
            'vendor_payment'            => esc_html__( 'Payment', 'dokan-lite' ),
            'failed_transfer_reversal'  => esc_html__( 'Failed Transfer Reversal', 'dokan-lite' ),
            'order_refund'              => esc_html__( 'Refund', 'dokan-lite' ),
            'product_advertisement'     => esc_html__( 'Product Advertisement', 'dokan-lite' ),
            'manual_order_commission'   => esc_html__( 'Manual Order Commission', 'dokan-lite' ),
        ];

        if ( $transaction_type ) {
            return isset( $transaction_types[ $transaction_type ] ) ? $transaction_types[ $transaction_type ] : '';
        }

        return $transaction_types;
    }

    public static function get_formatted_transaction_id( $transaction_id, $transaction_type, $contex = 'admin' ) {
        switch ( $transaction_type ) {
            case 'product_advertisement':
                // get product edit link
                $url = $contex === 'admin'
                    ? get_admin_url( null, 'post.php?post=' . $transaction_id . '&action=edit' )
                    : dokan_edit_product_url( $transaction_id );
                break;

            default:
                // get order edit link
                $url = $contex === 'admin'
                    ? get_admin_url( null, 'post.php?post=' . $transaction_id . '&action=edit' )
                    : wp_nonce_url( add_query_arg( [ 'order_id' => $transaction_id ], dokan_get_navigation_url( 'orders' ) ), 'dokan_view_order' );
        }

        return esc_url_raw( $url );
    }

    /**
     * This method will return formatted transaction data
     *
     * @since DOKAN_SINCE
     *
     * @param array $item
     * @param float $current_balance
     * @param string $context
     *
     * @return array
     */
    public static function get_formated_transaction_data( $item, &$current_balance, $context = 'admin' ) {
        $current_balance = ( $current_balance + $item['debit'] ) - $item['credit'];
        return [
            'id'            => absint( $item['id'] ),
            'trn_id'        => absint( $item['trn_id'] ),
            'trn_url'       => self::get_formatted_transaction_id( absint( $item['trn_id'] ), sanitize_text_field( $item['trn_type'] ), $context ),
            'trn_date'      => dokan_format_date( $item['trn_date'] ),
            'trn_type'      => self::get_transaction_types( $item['trn_type'] ),
            'vendor_id'     => absint( $item['vendor_id'] ),
            'note'          => esc_html( $item['note'] ),
            'debit'         => $item['debit'],
            'credit'        => $item['credit'],
            'balance'       => $current_balance,
        ];
    }

    /**
     * This method will return payable balance of a vendor
     *
     * @since DOKAN_SINCE
     *
     * @param int|null $vendor_id
     *
     * @return array|WP_Error
     */
    public static function get_vendor_balance( $vendor_id = null ) {
        // check for valid vendor id
        if ( ! is_numeric( $vendor_id ) ) {
            $vendor_id = dokan_get_current_user_id();
        }

        $manager = new Manager();
        // get balance
        $balance = $manager->get_store_balance(
            [
				'vendor_id' => dokan_get_current_user_id(),
			]
        );

        if ( is_wp_error( $balance ) ) {
            return $balance;
        }
        // get required settings
        $args = [
            'balance'      => $balance,
            'billing_type' => self::get_billing_type(),
            'billing_day'  => self::get_billing_day(),
            'due_period'   => self::get_due_period(),
        ];

        // check settings for billing type
        switch ( $args['billing_type'] ) {
            case 'by_month':
                // get previous month payable balance
                $previous_month_balance = $manager->get_store_balance(
                    [
						'vendor_id' => dokan_get_current_user_id(),
						'trn_date'  => [
							'from' => dokan_current_datetime()->modify( 'first day of previous month' )->format( 'Y-m-d H:i:s' ),
							'to'   => dokan_current_datetime()->modify( 'last day of previous month' )->format( 'Y-m-d H:i:s' ),
						],
					]
                );

                // is user paid for previous month
                $paid_balance = $manager->get_payments_by_vendor();

                if ( is_wp_error( $paid_balance ) ) {
                    return $paid_balance;
                }
                // subtract paid balance from previous month balance
                $args['min_payable_amount'] = $previous_month_balance - $paid_balance;
                break;

            case 'by_amount':
                $args['min_payable_amount'] = self::get_reverse_balance_limit();
                break;
        }

        return $args;
    }
}
