<?php

namespace WeDevs\Dokan\Gateways\PayPal;

use WeDevs\Dokan\Gateways\PayPal\PaymentMethod\DokanPayPal;
use WeDevs\Dokan\Gateways\PayPal\Utilities\Processor;
use WeDevs\Dokan\Traits\ChainableContainer;
use WeDevs\Dokan\Gateways\Manager as GatewayManager;

/**
 * Class Manager
 * @package WeDevs\Dokan\Gateways\PayPal
 *
 * @since DOKAN_LITE_SINCE
 * @author weDevs
 */
class Manager {

    use ChainableContainer;

    /**
     * PayPal Manager constructor
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        $this->register_gateway();
        $this->set_controllers();

        add_action( 'template_redirect', [ $this, 'handle_paypal_marketplace' ], 10 );

        //add ajax url for capture payment
        add_action( 'wp_ajax_dokan_paypal_capture_payment', [ $this, 'capture_payment' ] );
    }

    /**
     * Set controllers
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    private function set_controllers() {
        $this->container['vendor_withdraw_methods'] = new VendorWithdrawMethod();
        $this->container['paypal_wc_gateway']       = new DokanPayPal();
        $this->container['paypal_webhook']          = new WebhookHandler();
        $this->container['paypal_cart']             = new CartHandler();
    }

    /**
     * Register PayPal gateway
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function register_gateway() {
        GatewayManager::set_gateway( DokanPayPal::class );
    }

    /**
     * Handle paypal marketplace
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function handle_paypal_marketplace() {
        $user_id = dokan_get_current_user_id();
        if ( ! dokan_is_user_seller( $user_id ) ) {
            return;
        }

        if ( ! isset( $_GET['action'] ) && $_GET['action'] !== 'paypal-marketplace-connect' && $_GET['action'] !== 'paypal-marketplace-connect-success' ) {
            return;
        }

        $get_data = wp_unslash( $_GET );

        if ( isset( $get_data['_wpnonce'] ) && $_GET['action'] === 'paypal-marketplace-connect' && ! wp_verify_nonce( $get_data['_wpnonce'], 'paypal-marketplace-connect' ) ) {
            wp_safe_redirect( add_query_arg( [ 'message' => 'error' ], dokan_get_navigation_url( 'settings/payment' ) ) );
            exit();
        }

        if ( isset( $get_data['_wpnonce'] ) && $_GET['action'] === 'paypal-marketplace-connect-success' && ! wp_verify_nonce( $get_data['_wpnonce'], 'paypal-marketplace-connect-success' ) ) {
            wp_safe_redirect(
                add_query_arg(
                    [
                        'status'  => 'error',
                        'message' => 'paypal_connect_error',
                    ],
                    dokan_get_navigation_url( 'settings/payment' )
                )
            );
            exit();
        }

        if ( 'paypal-marketplace-connect' === $get_data['action'] ) {
            $this->handle_paypal_marketplace_connect( $get_data );
        }

        if ( 'paypal-marketplace-connect-success' === $get_data['action'] ) {
            $this->handle_paypal_marketplace_connect_success_response();
        }
    }

    /**
     * Handle paypal marketplace connect process
     *
     * @param $get_data
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function handle_paypal_marketplace_connect( $get_data ) {
        $user_id = dokan_get_current_user_id();

        if ( ! isset( $get_data['vendor_paypal_email_address'] ) ) {
            return;
        }

        $email_address = sanitize_email( $get_data['vendor_paypal_email_address'] );
        $current_user  = _wp_get_current_user();
        $tracking_id   = '_dokan_paypal_' . $current_user->user_login . '_' . $user_id;

        $processor  = Processor::init();
        $paypal_url = $processor->create_partner_referral( $email_address, $tracking_id );

        if ( is_wp_error( $paypal_url ) ) {
            wp_safe_redirect(
                add_query_arg(
                    [
                        'status'  => 'paypal-error',
                        'message' => $paypal_url['error'],
                    ],
                    dokan_get_navigation_url( 'settings/payment' )
                )
            );
            exit();
        }

        if ( isset( $paypal_url['links'][1] ) && 'action_url' === $paypal_url['links'][1]['rel'] ) {
            $paypal_action_url = $paypal_url['links'][1]['href'];
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

        wp_redirect( $paypal_action_url );
        exit();
    }

    /**
     * Handle paypal marketplace success response process
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function handle_paypal_marketplace_connect_success_response() {
        $user_id = dokan_get_current_user_id();

        $paypal_settings = get_user_meta( $user_id, '_dokan_paypal_marketplace_settings', true );

        $processor     = Processor::init();
        $merchant_data = $processor->get_merchant_id( $paypal_settings['tracking_id'] );

        if ( is_wp_error( $merchant_data ) ) {
            wp_safe_redirect(
                add_query_arg(
                    [
                        'status'  => 'paypal-merchant-error',
                        'message' => $merchant_data['error'],
                    ],
                    dokan_get_navigation_url( 'settings/payment' )
                )
            );
            exit();
        }

        //storing paypal merchant id
        $merchant_id = $merchant_data['merchant_id'];
        update_user_meta( $user_id, '_dokan_paypal_marketplace_merchant_id', $merchant_id );

        $paypal_settings['connection_status'] = 'success';

        update_user_meta(
            $user_id,
            '_dokan_paypal_marketplace_settings',
            $paypal_settings
        );

        //update paypal email in dokan profile settings
        $dokan_settings = get_user_meta( $user_id, 'dokan_profile_settings', true );

        $dokan_settings['payment']['paypal'] = [
            'email' => $paypal_settings['email'],
        ];
        update_user_meta( $user_id, 'dokan_profile_settings', $dokan_settings );

        //validate merchant status for payment receiving
        $this->validate_merchant_status( $merchant_id );
    }

    /**
     * Validate status of a merchant and store data
     *
     * @param $merchant_id
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function validate_merchant_status( $merchant_id ) {
        $processor       = Processor::init();
        $merchant_status = $processor->get_merchant_status( $merchant_id );

        if ( is_wp_error( $merchant_status ) ) {
            wp_safe_redirect(
                add_query_arg(
                    [
                        'status'  => 'paypal-merchant-error',
                        'message' => $merchant_status['error'],
                    ],
                    dokan_get_navigation_url( 'settings/payment' )
                )
            );
            exit();
        }

        $user_id = dokan_get_current_user_id();
        update_user_meta( $user_id, '_dokan_paypal_enable_for_receive_payment', false );
        update_user_meta( $user_id, '_dokan_paypal_payments_receivable', $merchant_status['payments_receivable'] );
        update_user_meta( $user_id, '_dokan_paypal_primary_email_confirmed', $merchant_status['primary_email_confirmed'] );

        //check if the user is able to receive payment
        if ( $merchant_status['payments_receivable'] && $merchant_status['primary_email_confirmed'] ) {
            $oauth_integrations = $merchant_status['oauth_integrations'];

            array_map( function ( $integration ) use ( $user_id ) {
                if ( 'OAUTH_THIRD_PARTY' === $integration['integration_type'] && count( $integration['oauth_third_party'] ) ) {
                    update_user_meta( $user_id, '_dokan_paypal_enable_for_receive_payment', true );
                }
            }, $oauth_integrations );
        }

        //check if the user is able to use UCC mode
        $products = $merchant_status['products'];

        array_map( function ( $value ) use ( $user_id ) {
            if ( 'PPCP_CUSTOM' === $value['name'] && 'SUBSCRIBED' === $value['vetting_status'] ) {
                update_user_meta( $user_id, '_dokan_paypal_enable_for_ucc', true );
            }
        }, $products );
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
            if ( ! wp_verify_nonce( $_POST['nonce'], 'dokan_paypal' ) ) {
                wp_send_json_error(
                    [
                        'type'    => 'nonce',
                        'message' => __( 'Are you cheating?', 'dokan-lite' ),
                    ]
                );
            }

            $order_id = ( isset( $_POST['order_id'] ) ) ? sanitize_key( $_POST['order_id'] ) : 0;

            if ( ! $order_id ) {
                wp_send_json_error(
                    [
                        'type'    => 'no_order_id',
                        'message' => __( 'No Order ID provided.', 'dokan-lite' ),
                    ]
                );
            }

            $paypal_order_id = get_post_meta( $order_id, '_dokan_paypal_order_id', true );

            $order           = wc_get_order( $order_id );
            $processor       = Processor::init();
            $capture_payment = $processor->capture_payment( $paypal_order_id );

            dokan_log( "[Dokan PayPal Marketplace] Capture Payment:\n" . print_r( $capture_payment, true ) );

            if ( is_wp_error( $capture_payment ) ) {
                $error_data = $capture_payment->get_error_data();
                //store paypal debug id
                update_post_meta( $order->get_id(), '_dokan_paypal_capture_payment_debug_id', $error_data['paypal_debug_id'] );

                dokan_log( "[Dokan PayPal Marketplace] Capture Payment Error:\n" . print_r( $capture_payment, true ) );

                wp_send_json_error(
                    [
                        'type'    => 'paypal_capture_payment',
                        'message' => __( 'Error in capturing payment.', 'dokan-lite' ),
                    ]
                );
            }

            $order_id = $capture_payment['purchase_units'][0]['invoice_id'];
            $order    = wc_get_order( $order_id );

            //store paypal debug id
            update_post_meta( $order->get_id(), '_dokan_paypal_capture_payment_debug_id', $capture_payment['paypal_debug_id'] );

            $order->add_order_note(
                sprintf(
                    __( 'PayPal payment completed. PayPal Order ID #%s', 'dokan-lite' ),
                    $paypal_order_id
                )
            );

            $order->payment_complete();

            $this->store_capture_payment_data( $capture_payment['purchase_units'] );

            wp_send_json_success(
                [
                    'type'    => 'paypal_capture_payment',
                    'message' => __( 'Successfully captured payment!', 'dokan-lite' ),
                    'data'    => $capture_payment,
                ]
            );

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
     * Store each order capture id
     *
     * @param array $purchase_units
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function store_capture_payment_data( $purchase_units ) {
        //add capture id to meta data
        foreach ( $purchase_units as $key => $unit ) {
            $capture_id = $unit['payments']['captures'][0]['id'];

            //this is a suborder id. if there is no suborder then it will be the main order id
            $_order_id = $unit['custom_id'];

            //may be a suborder
            $_order = wc_get_order( $_order_id );
            update_post_meta( $_order->get_id(), '_dokan_paypal_payment_capture_id', $capture_id );
        }
    }
}
