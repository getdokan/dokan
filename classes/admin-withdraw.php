<?php

/**
*  Dokan Admin withdraw class
*
*  Manupulate all withdraw functionality
*  in admin backend
*
*  @author weDevs <info@wedevs>
*
*  @since 2.4
*
*  @package dokan
*/
class Dokan_Admin_Withdraw extends Dokan_Withdraw {

    /**
     * Initializes the Dokan_Admin_Withdraw class
     *
     * Checks for an existing Dokan_Admin_Withdraw instance
     * and if it doesn't find one, creates it.
     */
    public static function init() {
        static $instance = false;

        if ( ! $instance ) {
            $instance = new Dokan_Admin_Withdraw();
        }

        return $instance;
    }

    /**
     * Generate CSV file from ajax request (Vue)
     *
     * @return void
     */
    public function withdraw_ajax() {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_send_json_error( __( 'You have no permission to do this action', 'dokan' ) );
        }

        if ( ! isset( $_POST['nonce'] ) ) {
            return;
        }

        $nonce = sanitize_text_field( wp_unslash( $_POST['nonce'] ) );

        if ( ! wp_verify_nonce( $nonce, 'dokan_admin' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan' ) );
        }

        header( 'Content-type: html/csv' );
        header( 'Content-Disposition: attachment; filename="withdraw-' . date( 'd-m-y' ) . '.csv"' );

        $ids = isset( $_POST['id'] ) ? sanitize_text_field( wp_unslash( $_POST['id'] ) ) : '';

        $this->generate_csv( $ids );
    }

    /**
     * Export withdraws as CSV format
     *
     * @param string  $withdraw_ids
     *
     * @return void admin
     */
    function generate_csv( $withdraw_ids ) {
        global $wpdb;

        $result = $wpdb->get_results(
            $wpdb->prepare( "SELECT * FROM {$wpdb->dokan_withdraw} WHERE id in ($withdraw_ids) and status = %d", 0 )
        );

        if ( ! $result ) {
            return;
        }

        $currency = get_option( 'woocommerce_currency' );

        foreach ( $result as $key => $obj ) {

            if ( $obj->method != 'paypal' ) {
                continue;
            }

            $data[] = array(
                'email'    => dokan_get_seller_withdraw_mail( $obj->user_id ),
                'amount'   => $obj->amount,
                'currency' => $currency,
            );

        }

        if ( $data ) {

            header( 'Content-type: html/csv' );
            header( 'Content-Disposition: attachment; filename="withdraw-' . date( 'd-m-y' ) . '.csv"' );

            foreach ( $data as $fields ) {
                echo esc_html( $fields['email'] ) . ',';
                echo esc_html( $fields['amount'] ) . ',';
                echo esc_html( $fields['currency'] ) . "\n";
            }

            die();
        }
    }
}
