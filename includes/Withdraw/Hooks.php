<?php

namespace WeDevs\Dokan\Withdraw;

use Automattic\WooCommerce\Utilities\NumberUtil;

class Hooks {

    /**
     * Class constructor
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function __construct() {
        add_action( 'dokan_withdraw_request_approved', [ $this, 'update_vendor_balance' ], 11 );
        // change custom withdraw method title
        add_filter( 'dokan_get_withdraw_method_title', [ $this, 'dokan_withdraw_dokan_custom_method_title' ], 10, 3 );

        // Init Withdraw Cache Class
        new WithdrawCache();

        if ( wp_doing_ajax() ) {
            add_action( 'wp_ajax_dokan_handle_withdraw_request', [ $this, 'ajax_handle_withdraw_request' ] );
            add_action( 'wp_ajax_dokan_withdraw_handle_make_default_method', [ $this, 'ajax_handle_make_default_method' ] );
        }
    }

    /**
     * Dokan Custom Withdraw Method Title
     *
     * @since 3.3.7
     *
     * @param string      $title
     * @param string      $method_key
     * @param object|null $request
     *
     * @return string
     */
    public function dokan_withdraw_dokan_custom_method_title( $title, $method_key, $request ) {
        if ( 'dokan_custom' === $method_key ) {
            $title = dokan_get_option( 'withdraw_method_name', 'dokan_withdraw', '' );
            // set default title
            if ( empty( $title ) ) {
                $title = __( 'Custom', 'dokan-lite' );
            }
            if ( null !== $request ) {
                $details = maybe_unserialize( $request->details );
                if ( isset( $details['value'] ) ) {
                    $title .= ' - ' . $details['value'];
                }
            }
        }

        return $title;
    }

    /**
     * Update vendor balance after approve a request.
     *
     * @since 3.0.0
     *
     * @param \WeDevs\Dokan\Withdraw\Withdraw $withdraw
     *
     * @return void
     */
    public function update_vendor_balance( $withdraw ) {
        global $wpdb;

        if ( NumberUtil::round( dokan_get_seller_balance( $withdraw->get_user_id(), false ), 2 ) < NumberUtil::round( $withdraw->get_amount(), 2 ) ) {
            return;
        }

        $balance_result = $wpdb->get_row(
            $wpdb->prepare(
                "select * from {$wpdb->dokan_vendor_balance} where trn_id = %d and trn_type = %s",
                $withdraw->get_id(),
                'dokan_withdraw'
            )
        );

        if ( empty( $balance_result ) ) {
            $wpdb->insert(
                $wpdb->dokan_vendor_balance,
                [
                    'vendor_id'    => $withdraw->get_user_id(),
                    'trn_id'       => $withdraw->get_id(),
                    'trn_type'     => 'dokan_withdraw',
                    'perticulars'  => 'Approve withdraw request',
                    'debit'        => 0,
                    'credit'       => $withdraw->get_amount(),
                    'status'       => 'approved',
                    'trn_date'     => $withdraw->get_date(),
                    'balance_date' => dokan_current_datetime()->format( 'Y-m-d H:i:s' ),
                ],
                [
                    '%d',
                    '%d',
                    '%s',
                    '%s',
                    '%f',
                    '%f',
                    '%s',
                    '%s',
                    '%s',
                ]
            );
        }
    }

    /**
     * Handle withdraw request ajax.
     *
     * @since 3.3.7
     *
     * @return void
     */
    public function ajax_handle_withdraw_request() {
        if ( ! isset( $_POST['_handle_withdraw_request'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_handle_withdraw_request'] ), 'dokan_withdraw' ) ) {
            wp_send_json_error( esc_html__( 'Are you cheating?', 'dokan-lite' ) );
        }

        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            wp_send_json_error( esc_html__( 'You have no permission to do this action', 'dokan-lite' ) );
        }

        $user_id = dokan_get_current_user_id();

        if ( dokan()->withdraw->has_pending_request( $user_id ) ) {
            wp_send_json_error( esc_html__( 'You already have a pending withdraw request.', 'dokan-lite' ) );
        }

        if ( ! isset( $_POST['method'] ) ) {
            wp_send_json_error( esc_html__( 'Withdraw method is required', 'dokan-lite' ) );
        }

        if ( empty( $_POST['amount'] ) ) {
            wp_send_json_error( esc_html__( 'Withdraw amount is required', 'dokan-lite' ) );
        }

        $amount = (float) wc_format_decimal( sanitize_text_field( wp_unslash( $_POST['amount'] ) ) );
        $method = sanitize_text_field( wp_unslash( $_POST['method'] ) );

        if ( ! in_array( $method, dokan_get_seller_active_withdraw_methods( $user_id ), true ) ) {
            wp_send_json_error( esc_html__( 'Withdraw method is not activated.', 'dokan-lite' ) );
        }

        if ( $amount < 0 ) {
            wp_send_json_error( esc_html__( 'Negative withdraw amount is not permitted.', 'dokan-lite' ) );
        }

        $args = [
            'user_id' => $user_id,
            'amount'  => $amount,
            'method'  => $method,
        ];

        $validate_request = dokan()->withdraw->is_valid_approval_request( $args );

        if ( is_wp_error( $validate_request ) ) {
            wp_send_json_error( $validate_request->get_error_message(), $validate_request->get_error_code() );
        }

        $data = [
            'user_id' => $user_id,
            'amount'  => $amount,
            'status'  => dokan()->withdraw->get_status_code( 'pending' ),
            'method'  => $method,
            'ip'      => dokan_get_client_ip(),
            'note'    => '',
        ];

        $withdraw = dokan()->withdraw->create( $data );

        if ( is_wp_error( $withdraw ) ) {
            wp_send_json_error( $withdraw->get_error_message(), $withdraw->get_error_code() );
        }

        do_action( 'dokan_after_withdraw_request', $user_id, $amount, $method );

        wp_send_json_success( __( 'Withdraw request successful.', 'dokan-lite' ) );
    }

    /**
     * Handle default with method change.
     *
     * @since 3.3.7
     *
     * @return void
     */
    public function ajax_handle_make_default_method() {
        if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['nonce'] ), 'dokan_withdraw_make_default' ) ) {
            wp_send_json_error( esc_html__( 'Are you cheating?', 'dokan-lite' ) );
        }

        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            wp_send_json_error( esc_html__( 'You have no permission to do this action', 'dokan-lite' ) );
        }

        $method = isset( $_POST['method'] ) ? sanitize_key( wp_unslash( $_POST['method'] ) ) : '';
        if ( empty( $method ) ) {
            wp_send_json_error( esc_html__( 'Please provide Withdrew method.', 'dokan-lite' ) );
        }

        if ( ! in_array( $method, dokan_withdraw_get_active_methods(), true ) ) {
            wp_send_json_error( esc_html__( 'Method not active.', 'dokan-lite' ) );
        }

        $user_id = dokan_get_current_user_id();
        update_user_meta( $user_id, 'dokan_withdraw_default_method', $method );

        wp_send_json_success( esc_html__( 'Default method update successful.', 'dokan-lite' ) );
    }
}
