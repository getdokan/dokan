<?php

namespace WeDevs\Dokan\Withdraw;

class Hooks {

    /**
     * Class constructor
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function __construct() {
        add_action( 'dokan_withdraw_status_updated', [ $this, 'delete_seller_balance_cache' ], 10, 3 );
        add_action( 'dokan_withdraw_request_approved', [ $this, 'update_vendor_balance' ], 11 );

        if ( wp_doing_ajax() ) {
            $this->ajax();
        }
    }

    /**
     * All the withdrawal related ajax hooks.
     *
     * @since 3.3.1
     *
     * @return void
     */
    private function ajax() {
        add_action( 'wp_ajax_dokan_handle_withdraw_request', [ $this, 'handle_withdraw_request' ] );
        add_action( 'wp_ajax_dokan_withdraw_handle_make_default_method', [ $this, 'handle_make_default_method' ] );
    }

    /**
     * Delete seller balance cache after a withdraw update
     *
     * @since 3.0.0
     *
     * @param string $status
     * @param int    $user_id
     * @param int    $id
     *
     * @return void
     */
    public static function delete_seller_balance_cache( $status, $user_id, $id ) {
        $cache_group = 'dokan_seller_data_' . $user_id;
        $cache_key = 'dokan_seller_balance_' . $user_id;
        wp_cache_delete( $cache_key, $cache_group );
    }

    /**
     * Update vendor balance after approve a request
     *
     * @since 3.0.0
     *
     * @param \WeDevs\Dokan\Withdraw\Withdraw $withdraw
     *
     * @return void
     */
    public static function update_vendor_balance( $withdraw ) {
        global $wpdb;

        if ( round( dokan_get_seller_balance( $withdraw->get_user_id(), false ), 2 ) < round( $withdraw->get_amount(), 2 ) ) {
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
                array(
                    'vendor_id'     => $withdraw->get_user_id(),
                    'trn_id'        => $withdraw->get_id(),
                    'trn_type'      => 'dokan_withdraw',
                    'perticulars'   => 'Approve withdraw request',
                    'debit'         => 0,
                    'credit'        => $withdraw->get_amount(),
                    'status'        => 'approved',
                    'trn_date'      => $withdraw->get_date(),
                    'balance_date'  => current_time( 'mysql' ),
                ),
                array(
                    '%d',
                    '%d',
                    '%s',
                    '%s',
                    '%f',
                    '%f',
                    '%s',
                    '%s',
                    '%s',
                )
            );
        }

        self::delete_seller_balance_cache( $withdraw->get_status(), $withdraw->get_user_id(), $withdraw->get_id() );
    }

    /**
     * Handle withdraw request ajax.
     *
     * @since 3.3.1
     *
     * @return void
     */
    public function handle_withdraw_request() {
        if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['nonce'] ), 'dokan_withdraw' ) ) {
            wp_send_json_error( esc_html__( 'Are you cheating?', 'dokan-lite' ) );
        }

        $user_id = dokan_get_current_user_id();

        if ( dokan()->withdraw->has_pending_request( $user_id ) ) {
            wp_send_json_error( esc_html__( 'You already have a pending withdraw request.', 'dokan-lite' ) );
        }

        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            wp_send_json_error( esc_html__( 'You have no permission to do this action', 'dokan-lite' ) );
        }

        if ( ! isset( $_POST['method'] ) ) {
            wp_send_json_error( esc_html__( 'Withdraw method is required', 'dokan-lite' ) );
        }

        if ( empty( $_POST['amount'] ) ) {
            wp_send_json_error( esc_html__( 'Withdraw amount is required', 'dokan-lite' ) );
        }

        $amount = (float) wc_format_decimal( wp_unslash( $_POST['amount'] ) );
        $method = wc_clean( wp_unslash( $_POST['method'] ) );

        if ( ! in_array( $method, dokan_get_seller_active_withdraw_methods( $user_id ), true ) ) {
            wp_send_json_error( esc_html__( 'Withdraw method is not activated.', 'dokan-lite' ) );
        }

        if ( $amount < 0 ) {
            wp_send_json_error( esc_html__( 'Negative withdraw amount is not permitted.', 'dokan-lite' ) );
        }

        $args = array(
            'user_id' => $user_id,
            'amount'  => $amount,
            'method'  => $method,
        );

        $validate_request = dokan()->withdraw->is_valid_approval_request( $args );

        if ( is_wp_error( $validate_request )  ) {
            wp_send_json_error( $validate_request->get_error_message(), $validate_request->get_error_code() );
        }

        $data = array(
            'user_id' => $user_id,
            'amount'  => $amount,
            'status'  => dokan()->withdraw->get_status_code( 'pending' ),
            'method'  => $method,
            'ip'      => dokan_get_client_ip(),
            'note'    => '',
        );

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
     * @since 3.3.1
     *
     * @return void
     */
    public function handle_make_default_method() {
        $user_id = dokan_get_current_user_id();

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

        update_user_meta( $user_id, 'dokan_withdraw_default_method', $method );

        wp_send_json_success( esc_html__( 'Default method update successful.', 'dokan-lite' ) );
    }
}
