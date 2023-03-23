<?php

namespace WeDevs\Dokan\ReverseWithdrawal;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Class Ajax
 *
 * @since   3.5.1
 *
 * @package WeDevs\Dokan\ReverseWithdrawal
 */
class Ajax {
    /**
     * Ajax constructor.
     *
     * @since 3.5.1
     */
    public function __construct() {
        // ajax product add to cart
        add_action( 'wp_ajax_dokan_reverse_withdrawal_payment_to_cart', [ $this, 'reverse_withdrawal_payment' ] );
    }

    /**
     * This method will add a product to cart from product edit page
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function reverse_withdrawal_payment() {
        // nonce check
        if ( ! isset( $_POST['_reverse_withdrawal_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['_reverse_withdrawal_nonce'] ) ), 'dokan_reverse_withdrawal_payment' ) ) {
            wp_send_json_error( [ 'message' => esc_html__( 'Invalid nonce', 'dokan-lite' ) ], 400 );
        }

        // check permission, don't let vendor staff view this section
        if ( ! current_user_can( 'dokandar' ) ) {
            wp_send_json_error( [ 'message' => esc_html__( 'You do not have permission to use this action.', 'dokan-lite' ) ], 400 );
        }

        // now get required data from
        $price         = isset( $_POST['price'] ) ? sanitize_text_field( wp_unslash( $_POST['price'] ) ) : 0;
        $added_to_cart = Helper::add_payment_to_cart( $price );
        if ( is_wp_error( $added_to_cart ) ) {
            wp_send_json_error( [ 'message' => $added_to_cart->get_error_message() ], 400 );
        }

        wp_send_json_success( [ 'message' => esc_html__( 'Product has been added to your cart.', 'dokan-lite' ) ] );
    }
}
