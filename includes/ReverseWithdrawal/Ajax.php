<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Class Ajax
 *
 * @since 3.5.1
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
        $price = isset( $_POST['price'] ) ? (float) wc_format_decimal( sanitize_text_field( wp_unslash( $_POST['price'] ) ) ) : 0;

        // now check for data validation
        if ( $price <= 0 ) {
            wp_send_json_error( [ 'message' => esc_html__( 'Payment can not be less than or equal to zero.', 'dokan-lite' ) ], 400 );
        }

        // get reverse withdrawal product id
        $reverse_pay_product_id = Helper::get_reverse_withdrawal_base_product();
        if ( ! is_numeric( $reverse_pay_product_id ) ) {
            wp_send_json_error( [ 'message' => esc_html__( 'Invalid base payment product id. Please contact with site admin.', 'dokan-lite' ) ], 400 );
        }

        $product = wc_get_product( $reverse_pay_product_id );
        if ( ! $product ) {
            wp_send_json_error( [ 'message' => esc_html__( 'Invalid base payment product found. Please contact with site admin.', 'dokan-lite' ) ], 400 );
        }

        if ( 'publish' !== $product->get_status() ) {
            wp_send_json_error( [ 'message' => esc_html__( 'Base payment product status is not published. Please contact with site admin.', 'dokan-lite' ) ], 400 );
        }

        // add  product to cart
        WC()->cart->empty_cart();
        $cart_item_data = [
            'dokan_reverse_withdrawal_balance' => $price,
        ];

        // try catch block used just to get rid of phpcs error
        try {
            $added = WC()->cart->add_to_cart( $product->get_id(), 1, '', '', $cart_item_data ); // phpcs:ignore
        } catch ( \Exception $exception ) {
            wp_send_json_error( [ 'message' => esc_html__( 'Something went wrong while adding product to cart.', 'dokan-lite' ) ], 400 );
        }

        if ( $added ) {
            wp_send_json_success( [ 'message' => esc_html__( 'Product has been added to your cart.', 'dokan-lite' ) ] );
        }

        wp_send_json_error( [ 'message' => esc_html__( 'Something Went Wrong.', 'dokan-lite' ) ], 400 );
    }
}
