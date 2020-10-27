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
        $this->container['ajax']                    = new Ajax();
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

        $email_address  = sanitize_email( $get_data['vendor_paypal_email_address'] );
        $current_user   = _wp_get_current_user();
        $tracking_id    = '_dokan_paypal_' . $current_user->user_login . '_' . $user_id;
        $dokan_settings = get_user_meta( $user_id, 'dokan_profile_settings', true );

        //get paypal product type based on seller country
        $product_type = Helper::get_product_type( $dokan_settings['address']['country'] );

        if ( ! $product_type ) {
            wp_safe_redirect(
                add_query_arg(
                    [
                        'status'  => 'error',
                        'message' => __( 'Seller country not supported.', 'dokan-lite' ),
                    ],
                    dokan_get_navigation_url( 'settings/payment' )
                )
            );
            exit();
        }

        $processor  = Processor::init();
        $paypal_url = $processor->create_partner_referral( $email_address, $tracking_id, [ $product_type ] );

        if ( is_wp_error( $paypal_url ) ) {
            Helper::log_paypal_error( $user_id, $paypal_url, 'create_partner_referral', 'user' );

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

            array_map(
                function ( $integration ) use ( $user_id ) {
                    if ( 'OAUTH_THIRD_PARTY' === $integration['integration_type'] && count( $integration['oauth_third_party'] ) ) {
                        update_user_meta( $user_id, '_dokan_paypal_enable_for_receive_payment', true );
                    }
                }, $oauth_integrations
            );
        }

        //check if the user is able to use UCC mode
        $products = $merchant_status['products'];

        array_map(
            function ( $value ) use ( $user_id ) {
                if ( 'PPCP_CUSTOM' === $value['name'] && 'SUBSCRIBED' === $value['vetting_status'] ) {
                    update_user_meta( $user_id, '_dokan_paypal_enable_for_ucc', true );
                }
            }, $products
        );
    }

    /**
     * Insert withdraw data to vendor balance
     *
     * @param array $withdraw
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function insert_into_vendor_balance( array $withdraw ) {
        global $wpdb;

        $wpdb->insert( $wpdb->prefix . 'dokan_vendor_balance',
            [
                'vendor_id'    => $withdraw['vendor_id'],
                'trn_id'       => $withdraw['order_id'],
                'trn_type'     => 'dokan_withdraw',
                'perticulars'  => 'Paid Via PayPal',
                'debit'        => 0,
                'credit'       => $withdraw['amount'],
                'status'       => 'approved',
                'trn_date'     => current_time( 'mysql' ),
                'balance_date' => current_time( 'mysql' ),
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

        //update vendor net amount after subtracting of payment fee
        $wpdb->update(
            $wpdb->dokan_orders,
            [ 'net_amount' => (float) $withdraw['amount'] ],
            [ 'order_id' => $withdraw['order_id'] ],
            [ '%f' ],
            [ '%d' ]
        );
    }

    /**
     * Process seller withdraw
     *
     * @param array $withdraw
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function process_seller_withdraw( array $withdraw ) {
        $IP = dokan_get_client_ip();

        $data = [
            'user_id' => $withdraw['vendor_id'],
            'amount'  => $withdraw['amount'],
            'date'    => current_time( 'mysql' ),
            'status'  => 1,
            'method'  => Helper::get_gateway_id(),
            'notes'   => sprintf( __( 'Order %d payment Auto paid via PayPal', 'dokan-lite' ), $withdraw['order_id'] ),
            'ip'      => $IP,
        ];

        dokan()->withdraw->insert_withdraw( $data );
    }

    /**
     * Handle vendor balance and withdraw request
     *
     * @param array $withdraw_data
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function handle_vendor_balance( array $withdraw_data ) {
        $this->insert_into_vendor_balance( $withdraw_data );
        $this->process_seller_withdraw( $withdraw_data );
    }
}
