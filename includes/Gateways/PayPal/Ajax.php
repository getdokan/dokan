<?php

namespace WeDevs\Dokan\Gateways\PayPal;

use WeDevs\Dokan\Gateways\PayPal\PaymentMethod\DokanPayPal;
use WeDevs\Dokan\Gateways\PayPal\Utilities\Processor;

/**
 * Class Ajax
 * @package WeDevs\Dokan\Gateways\PayPal
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
class Ajax {

    /**
     * Ajax constructor.
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        add_action( 'wp_ajax_dokan_paypal_marketplace_connect', [ $this, 'handle_paypal_marketplace_connect' ] );
        add_action( 'wp_ajax_dokan_paypal_create_order', [ $this, 'create_order' ] );
        add_action( 'wp_ajax_dokan_paypal_capture_payment', [ $this, 'capture_payment' ] );
    }

    /**
     * Handle paypal marketplace connect process
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function handle_paypal_marketplace_connect() {
        $post_data = wp_unslash( $_POST );

        $nonce = wp_verify_nonce( sanitize_text_field( $post_data['nonce'] ), 'paypal-marketplace-connect' );

        if ( isset( $post_data['nonce'] ) && ! $nonce ) {
            wp_send_json_error(
                [
                    'type'    => 'nonce',
                    'message' => __( 'Are you cheating?', 'dokan-lite' ),
                ]
            );
        }

        $user_id       = dokan_get_current_user_id();
        $email_address = sanitize_email( $post_data['vendor_paypal_email_address'] );

        if ( ! $email_address ) {
            wp_send_json_error(
                [
                    'type'    => 'error',
                    'message' => __( 'Email address required', 'dokan-lite' ),
                ]
            );
        }

        $current_user   = _wp_get_current_user();
        $tracking_id    = '_dokan_paypal_' . $current_user->user_login . '_' . $user_id;
        $dokan_settings = get_user_meta( $user_id, 'dokan_profile_settings', true );

        //get paypal product type based on seller country
        $product_type = Helper::get_product_type( $dokan_settings['address']['country'] );

        if ( ! $product_type ) {
            wp_send_json_error(
                [
                    'type'    => 'error',
                    'message' => __( 'Vendor\'s country is not supported by PayPal.', 'dokan-lite' ),
                    'reload'  => true,
                    'url'     => add_query_arg(
                        [
                            'status'  => 'seller_error',
                            'message' => __( 'Vendor\'s country is not supported by PayPal.', 'dokan-lite' ),
                        ],
                        dokan_get_navigation_url( 'settings/payment' )
                    ),
                ]
            );
        }

        $processor  = Processor::init();
        $paypal_url = $processor->create_partner_referral( $email_address, $tracking_id, [ $product_type ] );

        if ( is_wp_error( $paypal_url ) ) {
            Helper::log_paypal_error( $user_id, $paypal_url, 'create_partner_referral', 'user' );

            wc_add_wp_error_notices( $paypal_url );

            wp_send_json_error(
                [
                    'type'    => 'error',
                    'reload'  => true,
                    'message' => __( 'Connect PayPal error', 'dokan-lite' ),
                    'url'     => dokan_get_navigation_url( 'settings/payment' ),
                ]
            );
        }

        if ( isset( $paypal_url['links'][1] ) && 'action_url' === $paypal_url['links'][1]['rel'] ) {
            $paypal_action_url = $paypal_url['links'][1]['href'] . '&displayMode=minibrowser';
        }

        //keeping email and partner id for later use
        update_user_meta(
            $user_id,
            '_dokan_paypal_marketplace_settings',
            [
                'connect_process_started' => true,
                'connection_status'       => 'pending',
                'email'                   => $email_address,
                'tracking_id'             => $tracking_id,
            ]
        );

        wp_send_json_success(
            [
                'type'   => 'success',
                'url'    => $paypal_action_url,
            ]
        );
    }

    /**
     * Create order on paypal
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function create_order() {
        try {
            $post_data = wp_unslash( $_POST ); //phpcs:ignore WordPress.Security.NonceVerification.Missing
            $order_id  = $this->do_validation( $post_data );

            $dokan_paypal    = dokan()->payment_gateway->paypal_marketplace->paypal_wc_gateway;
            $process_payment = $dokan_paypal->process_payment( $order_id );

            if ( is_wp_error( $process_payment ) ) {
                wp_send_json_error(
                    [
                        'type'    => 'error',
                        'message' => __( 'Error in create order!', 'dokan-lite' ),
                    ]
                );
            }

            wp_send_json_success(
                [
                    'type'    => 'paypal_create_order',
                    'message' => __( 'Successfully created order!', 'dokan-lite' ),
                    'data'    => $process_payment,
                ]
            );
        } catch ( \Exception $e ) {
            wp_send_json_error(
                [
                    'type'    => 'paypal_create_order',
                    'message' => __( 'Error in creating order.', 'dokan-lite' ),
                ]
            );
        }
    }

    /**
     * Do the necessary validation
     *
     * @param $post_data
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return int|string
     */
    public function do_validation( $post_data ) {
        $nonce = wp_verify_nonce( sanitize_text_field( $post_data['nonce'] ), 'dokan_paypal' );

        if ( isset( $post_data['nonce'] ) && ! $nonce ) {
            wp_send_json_error(
                [
                    'type'    => 'nonce',
                    'message' => __( 'Are you cheating?', 'dokan-lite' ),
                ]
            );
        }

        $order_id = ( isset( $post_data['order_id'] ) ) ? sanitize_key( $post_data['order_id'] ) : 0;

        if ( ! $order_id ) {
            wp_send_json_error(
                [
                    'type'    => 'no_order_id',
                    'message' => __( 'No Order ID provided.', 'dokan-lite' ),
                ]
            );
        }

        return $order_id;
    }

    /**
     * Capture Payment
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function capture_payment() {
        try {
            $post_data = wp_unslash( $_POST ); //phpcs:ignore WordPress.Security.NonceVerification.Missing
            $order_id  = $this->do_validation( $post_data );

            $paypal_order_id = get_post_meta( $order_id, '_dokan_paypal_order_id', true );

            if ( ! $paypal_order_id ) {
                wp_send_json_error(
                    [
                        'type'    => 'no_order_id',
                        'message' => __( 'No PayPal order id found.', 'dokan-lite' ),
                    ]
                );
            }

            $this->handle_capture_payment_validation( $order_id, $paypal_order_id );
        } catch ( \Exception $e ) {
            wp_send_json_error(
                [
                    'type'    => 'paypal_capture_payment',
                    'message' => __( 'Error in capturing payment.', 'dokan-lite' ),
                ]
            );
        }
    }

    /**
     * Handle capture payment/store data
     *
     * @param $order_id
     * @param $paypal_order_id
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function handle_capture_payment_validation( $order_id, $paypal_order_id ) {
        $order     = wc_get_order( $order_id );
        $processor = Processor::init();

        //first fetch the order details
        $paypal_order = $processor->get_order( $paypal_order_id );

        if ( is_wp_error( $paypal_order ) ) {
            wp_send_json_error(
                [
                    'type'    => 'paypal_capture_payment',
                    'message' => __( 'Error in getting paypal order.', 'dokan-lite' ),
                ]
            );
        }

        if ( ! $processor->continue_transaction( $paypal_order ) ) {
            wp_send_json_error(
                [
                    'type'    => 'paypal_capture_payment',
                    'message' => __( 'Authorization not supported.', 'dokan-lite' ),
                ]
            );
        }

        $capture_payment = $processor->capture_payment( $paypal_order_id );

        if ( is_wp_error( $capture_payment ) ) {
            Helper::log_paypal_error( $order->get_id(), $capture_payment, 'capture_payment' );

            wp_send_json_error(
                [
                    'type'    => 'paypal_capture_payment',
                    'message' => __( 'Error in capturing payment.', 'dokan-lite' ),
                    'data'    => $capture_payment->get_error_messages(),
                ]
            );
        }

        dokan_log( "[Dokan PayPal Marketplace] Capture Payment:\n" . print_r( $capture_payment, true ) );

        $order_id = $capture_payment['purchase_units'][0]['invoice_id'];
        $order    = wc_get_order( $order_id );

        //store paypal debug id
        update_post_meta(
            $order->get_id(),
            '_dokan_paypal_capture_payment_debug_id',
            $capture_payment['paypal_debug_id']
        );

        $order->add_order_note(
            /* translators: %s: paypal order id */
            sprintf( __( 'PayPal payment completed. PayPal Order ID #%s', 'dokan-lite' ), $paypal_order_id )
        );

        $order->payment_complete();

        dokan()->payment_gateway->paypal_marketplace->store_capture_payment_data( $capture_payment['purchase_units'], $order );

        do_action( 'dokan_paypal_capture_payment_completed', $order, $capture_payment );

        wp_send_json_success(
            [
                'type'    => 'paypal_capture_payment',
                'message' => __( 'Successfully captured payment!', 'dokan-lite' ),
                'data'    => $capture_payment,
            ]
        );
    }
}
