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
        //add ajax url for capture payment
        add_action( 'wp_ajax_dokan_paypal_create_order', [ $this, 'create_order' ] );
        add_action( 'wp_ajax_dokan_paypal_capture_payment', [ $this, 'capture_payment' ] );
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
            $post_data = wp_unslash( $_POST );
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
            $post_data = wp_unslash( $_POST );
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
            sprintf(
                __( 'PayPal payment completed. PayPal Order ID #%s', 'dokan-lite' ),
                $paypal_order_id
            )
        );

        $order->payment_complete();

        $this->store_capture_payment_data( $capture_payment['purchase_units'], $order );

        do_action( 'dokan_paypal_capture_payment_completed', $order, $capture_payment );

        wp_send_json_success(
            [
                'type'    => 'paypal_capture_payment',
                'message' => __( 'Successfully captured payment!', 'dokan-lite' ),
                'data'    => $capture_payment,
            ]
        );
    }

    /**
     * Store each order capture id
     *
     * @param array $purchase_units
     * @param \WC_Order $order
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function store_capture_payment_data( $purchase_units, \WC_Order $order ) {
        //add capture id to meta data
        $meta_key_prefix = '_dokan_paypal_payment_';

        foreach ( $purchase_units as $key => $unit ) {
            $capture_id = $unit['payments']['captures'][0]['id'];

            $seller_receivable              = $unit['payments']['captures'][0]['seller_receivable_breakdown'];
            $paypal_fee_data                = $seller_receivable['paypal_fee'];
            $paypal_processing_fee_currency = $paypal_fee_data['currency_code'];
            $paypal_processing_fee          = $paypal_fee_data['value'];

            //this is a suborder id. if there is no suborder then it will be the main order id
            $_order_id = $unit['custom_id'];

            $invoice_id = $unit['invoice_id'];

            //may be a suborder
            $_order = wc_get_order( $_order_id );

            $_order->add_order_note(
                sprintf(
                    __( 'PayPal processing fee is %s', 'dokan-lite' ),
                    $paypal_processing_fee
                )
            );

            //add order note to parent order
            if ( $_order_id !== $invoice_id ) {
                $order_url = $_order->get_edit_order_url();
                $order->add_order_note(
                    sprintf(
                        __( 'PayPal processing for sub order %s is %s', 'dokan-lite' ),
                        "<a href='{$order_url}'>{$_order_id}</a>",
                        $paypal_processing_fee
                    )
                );
            }

            update_post_meta( $_order->get_id(), $meta_key_prefix . 'capture_id', $capture_id );
            update_post_meta( $_order->get_id(), 'dokan_gateway_fee', $paypal_processing_fee );
            update_post_meta( $_order->get_id(), 'dokan_gateway_fee_paid_by', 'seller' );
            update_post_meta( $_order->get_id(), $meta_key_prefix . 'processing_fee', $paypal_processing_fee );
            update_post_meta( $_order->get_id(), $meta_key_prefix . 'processing_currency', $paypal_processing_fee_currency );

            $seller_id = dokan_get_seller_id_by_order( $_order->get_id() );
            $withdraw_data = [
                'vendor_id' => $seller_id,
                'order_id'  => $_order->get_id(),
                'amount'    => $seller_receivable['net_amount']['value'],
            ];

            dokan()->payment_gateway->paypal_marketplace->handle_vendor_balance( $withdraw_data );
        }
    }
}
