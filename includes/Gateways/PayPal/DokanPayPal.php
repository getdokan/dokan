<?php

namespace WeDevs\Dokan\Gateways\PayPal;

use WC_Logger;
use WC_Payment_Gateway;

/**
 * Class DokanPayPal
 * @since DOKAN_LITE_SINCE
 *
 * @package WeDevs\Dokan\Gateways\PayPal
 *
 * @author weDevs
 */
class DokanPayPal extends WC_Payment_Gateway {

    var $notify_url;

    /**
     * Constructor for the gateway.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function __construct() {
        $this->init_fields();

        // Load the settings.
        $this->init_form_fields();
        $this->init_settings();

        // Logs
        if ( 'yes' == $this->debug ) {
            $this->log = new WC_Logger();
        }

        $this->init_hooks();

        if ( ! $this->is_valid_for_use() ) {
            $this->enabled = false;
        }
    }

    /**
     * init essential fields
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function init_fields() {
        $this->id                 = 'dokan_paypal_marketplace';
        $this->icon               = false;
        $this->has_fields         = true;
        $this->method_title       = __( 'Dokan PayPal Marketplace Payments', 'dokan-lite' );
        $this->method_description = __( 'Pay via paypal marketplace payment', 'dokan-lite' );
        $this->icon               = apply_filters( 'woocommerce_paypal_icon', DOKAN_DIR . '/assets/images/paypal-marketplace.png' );

        $title                = $this->get_option( 'title' );
        $this->title          = empty( $title ) ? __( 'PayPal Marketplace Payments', 'dokan-lite' ) : $title;
        $this->test_mode      = $this->get_option( 'test_mode' );
        $this->send_shipping  = $this->get_option( 'send_shipping' );
        $this->single_mode    = $this->get_option( 'single_mode' );
        $this->fees_payer     = $this->get_option( 'fees_payer' );
        $this->app_user        = $this->get_option( 'app_user' );
        $this->app_pass        = $this->get_option( 'app_pass' );
        $this->app_sig         = $this->get_option( 'app_sig' );
        $this->app_id          = $this->get_option( 'app_id' );
        $this->test_app_user   = $this->get_option( 'test_app_user' );
        $this->test_app_pass   = $this->get_option( 'test_app_pass' );
        $this->test_app_sig    = $this->get_option( 'test_app_sig' );
        $this->debug          = $this->get_option( 'debug' );
        $this->pa_admin_email = $this->get_option( 'pa_admin_email' );
        $this->notify_url     = str_replace( 'https:', 'http:', add_query_arg( 'wc-api', 'Dokan_PayPal', home_url( '/' ) ) );
    }

    /**
     * Initialise Gateway Settings Form Fields
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function init_form_fields() {
        $this->form_fields = [
            'enabled'        => [
                'title'   => __( 'Enable/Disable', 'dokan-lite' ),
                'type'    => 'checkbox',
                'label'   => __( 'Enable PayPal Marketplace', 'dokan-lite' ),
                'default' => 'no',
            ],
            'title'          => [
                'title'       => __( 'Title', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'This controls the title which the user sees during checkout.', 'dokan-lite' ),
                'default'     => __( 'PayPal Marketplace', 'dokan-lite' ),
                'desc_tip'    => true,
            ],
            'description'    => [
                'title'       => __( 'Description', 'dokan-lite' ),
                'type'        => 'textarea',
                'description' => __( 'This controls the description which the user sees during checkout.', 'dokan-lite' ),
                'default'     => __( 'Pay via PayPal Marketplace; you can pay with your credit card if you don\'t have a PayPal account', 'dokan-lite' ),
            ],
            'pa_admin_email' => [
                'title'       => __( 'PayPal Email', 'dokan-lite' ),
                'type'        => 'email',
                'description' => __( 'Please enter your PayPal email address; this is needed in order to take payment.', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'you@youremail.com',
            ],
            'single_mode'    => [
                'title'       => __( 'Mode', 'dokan-lite' ),
                'label'       => __( 'Single Vendor Mode (Recommended)', 'dokan-lite' ),
                'type'        => 'checkbox',
                'default'     => 'yes',
            ],
            'fees_payer'     => [
                'title'       => __( 'Fees Payer', 'dokan-lite' ),
                'type'        => 'select',
                'description' => __( 'Please choose who will pay the fee', 'dokan-lite' ),
                'desc_tip'    => true,
                'default'     => 'each',
                'options'     => [
                    'each'   => __( 'Each receiver', 'dokan-lite' ),
                    'admin'  => __( 'Admin', 'dokan-lite' ),
                    'seller' => __( 'Vendor', 'dokan-lite' ),
                ],
            ],
            'send_shipping'  => [
                'title' => __( 'Shipping details', 'dokan-lite' ),
                'label' => __( 'Send shipping details to PayPal instead of billing.', 'dokan-lite' ),
                'type'  => 'checkbox',
            ],
            'test_mode'      => [
                'title'       => __( 'PayPal sandbox', 'dokan-lite' ),
                'type'        => 'checkbox',
                'label'       => __( 'Enable PayPal sandbox', 'dokan-lite' ),
                'default'     => 'no',
                'description' => sprintf( __( 'PayPal sandbox can be used to test payments. Sign up for a developer account <a href="%s">here</a>.', 'dokan-lite' ), 'https://developer.paypal.com/' ),
            ],
            'partner_id'      => [
                'title'       => __( 'Partner ID', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this payment method your need an application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'api appID',
            ],
            'app_user'        => [
                'title'       => __( 'API Username', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this payment method your need an application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'username',
            ],
            'app_pass'        => [
                'title'       => __( 'API Password', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this payment method your need an application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'password',
            ],
            'app_sig'         => [
                'title'       => __( 'API Signature', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this payment method your need an application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'signature',
            ],
            'test_app_user'   => [
                'title'       => __( 'Sandbox App Username', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this system please sign up in developer account and get your  application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'username',
            ],
            'test_app_pass'   => [
                'title'       => __( 'Sandbox App Password', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this system please sign up in developer account and get your  application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'password',
            ],
            'test_app_sig'    => [
                'title'       => __( 'Sandbox App Signature', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'For this system please sign up in developer account and get your  application credential', 'dokan-lite' ),
                'default'     => '',
                'desc_tip'    => true,
                'placeholder' => 'signature',
            ],
            'max_error'      => [
                'title'       => __( 'Error Message', 'dokan-lite' ),
                'type'        => 'text',
                'description' => __( 'This is the error message displayed to a shopper when attempting to add too many vendor items to the cart due to PayPal limitation.', 'dokan-lite' ),
                'default'     => __( 'Cart item quantity total exceeded - item not added to cart. Please checkout to purchase the items in your cart.', 'dokan-lite' ),
                'desc_tip'    => true,
            ],
            'debug'          => [
                'title'       => __( 'Debug Log', 'dokan-lite' ),
                'type'        => 'checkbox',
                'label'       => __( 'Enable logging', 'dokan-lite' ),
                'default'     => 'no',
                'description' => sprintf( __( 'Log PayPal events, such as IPN requests, inside <code>woocommerce/logs/paypal-%s.txt</code>', 'dokan-lite' ), sanitize_file_name( wp_hash( 'paypal' ) ) ),
            ],
        ];
    }

    /**
     * initialize necessary actions
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function init_hooks() {
        // Payment listener/API hook
        add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, [ &$this, 'process_admin_options' ] );

        add_action( 'woocommerce_api_wc_dokan_paypal_ap_gateway', [ $this, 'check_ipn_response' ] );
        add_action( 'dokan-valid-paypal-marketplace-request', [ $this, 'successful_request' ] );
        add_action( 'admin_footer', [ $this, 'admin_script' ] );
    }

    /**
     * Check if this gateway is enabled and available in the user's country
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return bool
     */
    public function is_valid_for_use() {
        $supported_currencies = [
            'AUD',
            'BRL',
            'CAD',
            'MXN',
            'NZD',
            'HKD',
            'SGD',
            'USD',
            'EUR',
            'JPY',
            'TRY',
            'NOK',
            'CZK',
            'DKK',
            'HUF',
            'ILS',
            'MYR',
            'PHP',
            'PLN',
            'SEK',
            'CHF',
            'TWD',
            'THB',
            'GBP',
            'RMB',
            'RUB',
        ];

        if ( ! in_array( get_woocommerce_currency(), apply_filters( 'woocommerce_paypal_supported_currencies', $supported_currencies ) ) ) {
            return false;
        }

        return true;
    }

    /**
     * Display information in frontend
     * after checkout process button
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function payment_fields() {
        echo $this->get_option( 'description' );
    }

    /**
     * Process the payment and return the result
     *
     * @param int $order_id
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public function process_payment( $order_id ) {
        $receiver   = [];
        $payRequest = new \PayPal\Types\AP\PayRequest();
        $order      = new \WC_Order( $order_id );

        $sub_orders = get_children( [ 'post_parent' => $order_id, 'post_type' => 'shop_order' ] );

        if ( $sub_orders ) {
            $sum = 0;
            foreach ( $sub_orders as $key => $order_post ) {
                $seller_id        = dokan_get_seller_id_by_order( $order_post->ID );
                $seller_balance   = $this->get_seller_net_balance( $order_post->ID, $seller_id );
                $seller_pay_email = dokan_get_seller_withdraw_mail( $seller_id );

                if ( false === $seller_pay_email ) {
                    $seller_pay_email = get_user_by( 'id', $seller_id )->user_email;
                }

                $receiver[ $key ]         = new \PayPal\Types\AP\Receiver();
                $receiver[ $key ]->amount = round( $seller_balance, wc_get_price_decimals() );
                $receiver[ $key ]->email  = $seller_pay_email;

                $sum += (float) $seller_balance;
            }

            if ( $this->payment_process == 'chained' ) {
                // if single seller mode enabled then we need to exit as we have multiple orders here
                if ( $this->single_mode == 'yes' ) {
                    throw new Exception( sprintf( __( 'You have products from multiple-vendor please choose products from Single vendor only', 'dokan-lite' ) ) );
                }
                $admin_amount = (string) round( $order->get_total(), wc_get_price_decimals() );
            } else {
                $admin_amount = (string) ( round( (float) $order->get_total() - $sum, wc_get_price_decimals() ) );
            }
        } else {

            $seller_id        = dokan_get_seller_id_by_order( $order_id );
            $seller_balance   = $this->get_seller_net_balance( $order_id, $seller_id );
            $seller_pay_email = dokan_get_seller_withdraw_mail( $seller_id );

            if ( false === $seller_pay_email ) {
                $seller_pay_email = get_user_by( 'id', $seller_id )->user_email;
            }

            $receiver[0]         = new PayPal\Types\AP\Receiver();
            $receiver[0]->amount = round( $seller_balance, wc_get_price_decimals() );
            $receiver[0]->email  = $seller_pay_email;

            if ( $this->payment_process == 'chained' ) {

                if ( $this->single_mode == 'yes' ) {
                    $admin_amount        = (string) ( round( (float) $order->get_total() - (float) $seller_balance, wc_get_price_decimals() ) );
                    $receiver[0]->amount = (string) $order->get_total();
                } else {
                    $admin_amount = (string) round( $order->get_total(), wc_get_price_decimals() );
                }

            } else {
                $admin_amount = (string) ( round( (float) $order->get_total() - (float) $seller_balance, wc_get_price_decimals() ) );
            }
        }

        $count = count( $receiver );

        if ( $admin_amount > 0 ) {
            $receiver[ $count ]         = new PayPal\Types\AP\Receiver();
            $receiver[ $count ]->amount = $admin_amount;
            $receiver[ $count ]->email  = $this->pa_admin_email;
        }

        if ( $this->payment_process == 'chained' ) {

            if ( $this->single_mode == 'yes' ) {
                $receiver[0]->primary = 'true';
                if ( 'seller' == $this->fees_payer ) {
                    $payRequest->feesPayer = 'PRIMARYRECEIVER';
                } else if ( 'admin' == $this->fees_payer ) {
                    if ( $admin_amount > 0 ) {
                        $payRequest->feesPayer = 'SECONDARYONLY';
                    }
                }
            } elseif ( $admin_amount > 0 ) {
                //make admin the primary receiver
                $receiver[ $count ]->primary = 'true';
                if ( 'admin' == $this->fees_payer ) {
                    $payRequest->feesPayer = 'PRIMARYRECEIVER';
                }
                // else defaults to EACH receiver
            }
        }

        $this->add_log( 'Payment Process: ' . $this->payment_process . ' ------ Reciever list' . print_r( $receiver, true ) . '...' );

        $receiverList             = new PayPal\Types\AP\ReceiverList( $receiver );
        $payRequest->receiverList = $receiverList;

        $requestEnvelope                               = new PayPal\Types\Common\RequestEnvelope( "en_US" );
        $payRequest->requestEnvelope                   = $requestEnvelope;
        $payRequest->actionType                        = "PAY";
        $payRequest->reverseAllParallelPaymentsOnError = true;
        $payRequest->cancelUrl                         = esc_url( $order->get_cancel_order_url() );
        $payRequest->returnUrl                         = esc_url( $this->get_return_url( $order ) );
        $payRequest->currencyCode                      = get_woocommerce_currency();
        $payRequest->ipnNotificationUrl                = $this->notify_url;

        if ( 'yes' == $this->test_mode ) {
            $sdkConfig = [
                "mode"            => "sandbox",
                "acct1.UserName"  => $this->test_app_user,
                "acct1.Password"  => $this->test_app_pass,
                "acct1.Signature" => $this->test_app_sig,
                "acct1.AppId"     => "APP-80W284485P519543T",
            ];
        } else {
            $sdkConfig = [
                "mode"            => "live",
                "acct1.UserName"  => $this->app_user,
                "acct1.Password"  => $this->app_pass,
                "acct1.Signature" => $this->app_sig,
                "acct1.AppId"     => $this->app_id,
            ];
        }

        $marketplacePaymentsService = new PayPal\Service\MarketplacePaymentsService( $sdkConfig );
        $payResponse                = $marketplacePaymentsService->Pay( $payRequest );

        if ( $payResponse->payKey ) {

            $shippingAddressInfo = new PayPal\Types\AP\ShippingAddressInfo();

            $shippingAddressInfo->addresseeName = dokan_get_prop( $order, 'billing_first_name' ) . ' ' . dokan_get_prop( $order, 'billing_last_name' );
            $shippingAddressInfo->street1       = dokan_get_prop( $order, 'billing_address_1' );
            $shippingAddressInfo->street2       = dokan_get_prop( $order, 'billing_address_2' );
            $shippingAddressInfo->city          = dokan_get_prop( $order, 'billing_city' );
            $shippingAddressInfo->zip           = dokan_get_prop( $order, 'billing_postcode' );
            $shippingAddressInfo->state         = $this->get_paypal_state( dokan_get_prop( $order, 'billing_country' ), dokan_get_prop( $order, 'billing_state' ) );
            $shippingAddressInfo->country       = dokan_get_prop( $order, 'billing_country' );

            if ( 'yes' == $this->send_shipping ) {
                $shippingAddressInfo->addresseeName = dokan_get_prop( $order, 'shipping_first_name' ) . ' ' . dokan_get_prop( $order, 'shipping_last_name' );
                $shippingAddressInfo->street1       = dokan_get_prop( $order, 'shipping_address_1' );
                $shippingAddressInfo->street2       = dokan_get_prop( $order, 'shipping_address_2' );
                $shippingAddressInfo->city          = dokan_get_prop( $order, 'shipping_city' );
                $shippingAddressInfo->zip           = dokan_get_prop( $order, 'shipping_postcode' );
                $shippingAddressInfo->state         = $this->get_paypal_state( dokan_get_prop( $order, 'shipping_country' ), dokan_get_prop( $order, 'shipping_state' ) );
                $shippingAddressInfo->country       = dokan_get_prop( $order, 'shipping_country' );
            }

            $so                  = new PayPal\Types\AP\SenderOptions();
            $so->shippingAddress = $shippingAddressInfo;

            $re                                      = new PayPal\Types\Common\RequestEnvelope( 'en_US' );
            $setPaymentOptionsRequest                = new PayPal\Types\AP\SetPaymentOptionsRequest( $re, $payResponse->payKey );
            $setPaymentOptionsRequest->senderOptions = $so;
            $paymentOptionRequest                    = $marketplacePaymentsService->SetPaymentOptions( $setPaymentOptionsRequest );
        }

        $this->add_log( 'Payment Response: ' . print_r( $payResponse, true ) );

        if ( 'Failure' == $payResponse->responseEnvelope->ack ) {
            throw new Exception( sprintf( __( 'Paypal Marketplace Error : %s , Error Code : %d', 'dokan-lite' ), $payResponse->error[0]->message, $payResponse->error[0]->errorId ) );
        }
        // update paykey reference to find out
        update_post_meta( $order->id, '_dokan_pap_key', $payResponse->payKey );

        if ( 'yes' == $this->test_mode ) {
            $paypal_url = "https://www.sandbox.paypal.com/webscr?cmd=_ap-payment&paykey=" . $payResponse->payKey;
        } else {
            $paypal_url = "https://www.paypal.com/webscr?cmd=_ap-payment&paykey=" . $payResponse->payKey;
        }

        // Return thankyou redirect
        return [
            'result'   => 'success',
            'redirect' => $paypal_url,
        ];
    }

    /**
     * Get the state to send to paypal
     *
     * @param string $cc
     * @param string $state
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string
     */
    public function get_paypal_state( $cc, $state ) {
        if ( 'US' === $cc ) {
            return $state;
        }

        $states = WC()->countries->get_states( $cc );

        if ( isset( $states[ $state ] ) ) {
            return $states[ $state ];
        }

        return $state;
    }

    /**
     * Check if ipn request is valid or not
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return boolean true/false
     */
    public function check_ipn_response() {
        if ( 'yes' == $this->test_mode ) {
            $config = [ 'mode' => 'sandbox' ];
        } else {
            $config = [ 'mode' => 'live' ];
        }

        $ipnMessage = new PayPal\IPN\PPIPNMessage( '', $config );

        if ( $ipnMessage->validate() ) {

            $this->add_log( 'IPN Response: ' . print_r( $ipnMessage->getRawData(), true ) );

            do_action( "dokan-valid-paypal-marketplace-request" );
        } else {

            $this->add_log( 'Received invalid response from PayPal Marketplace Payment' );

            if ( is_wp_error( $ipnMessage ) ) {
                $this->add_log( 'Error response: ' . $ipnMessage->get_error_message() );
            }
        }
    }

    /**
     * Do successful request...
     *
     * @return void
     */
    public function successful_request() {
        $posted = $_POST;
        $paykey = isset( $posted['pay_key'] ) ? $posted['pay_key'] : '';

        if ( ! $paykey ) {
            $this->add_log( __( 'No pay key found, abort.', 'dokan-lite' ) );
            exit;
        }

        $order_id = $this->get_order_by_paykey( $paykey );

        if ( ! $order_id ) {
            $this->add_log( sprintf( __( 'No order id found by pay key: %s', 'dokan-lite' ), $paykey ) );
            exit;
        }

        $order = new WC_Order( $order_id );

        // yet another check to make sure
        if ( ! isset( $order->id ) || empty( $order->id ) || absint( $order->id ) <= 0 ) {
            $this->add_log( sprintf( __( 'No order found by pay key: %s', 'dokan-lite' ), $paykey ) );
            exit;
        }

        $this->add_log( "Payment post data: \n" . print_r( $posted, true ) . "\n-----------\n" );

        $status = strtolower( $posted['status'] );

        switch ( $status ) {
            case 'completed' :

                // Check order not already completed
                if ( $order->status == 'completed' ) {
                    $this->add_log( 'Aborting, Order #' . $order->id . ' is already complete.' );
                    exit;
                }

                $order->add_order_note( __( 'IPN payment completed', 'dokan-lite' ) );
                $order->payment_complete();

                if ( ! empty( $posted['sender_email'] ) ) {
                    update_post_meta( $order_id, "Payer's PayPal address", $posted['sender_email'] );
                }

                if ( ! empty( $posted['fees_payer'] ) ) {
                    update_post_meta( $order_id, 'Fee Payer', $posted['fees_payer'] );
                }

                if ( ! empty( $posted['payment_request_date'] ) ) {
                    update_post_meta( $order_id, "PayPal's Date Stamp", $posted['payment_request_date'] );
                }

                break;

            case 'error' :
            case 'reversalerror':
            case 'denied' :
            case 'expired' :
            case 'failed' :
            case 'voided' :
                // Order failed
                $order->update_status( 'failed', sprintf( __( 'Payment %s via IPN.', 'dokan-lite' ), strtolower( $posted['status'] ) ) );

                break;

            case 'incomplete':
            case 'processing':
            case 'pending':
            case 'created' :
                // order pending
                $order->update_status( 'on-hold', sprintf( __( 'Payment %s via IPN. Order is pending completion. PayPal will notify this site of further status updates. Or check your PayPal account for further information', 'dokan-lite' ), strtolower( $_POST['status'] ) ) );

                break;

            case "refunded" :

                // Handle full refunds, not partial refunds
                if ( $order->get_total() == ( $posted['mc_gross'] * - 1 ) ) {

                    // Mark order as refunded
                    $order->update_status( 'refunded', sprintf( __( 'Payment %s via IPN.', 'dokan-lite' ), strtolower( $posted['status'] ) ) );

                    $mailer  = WC()->mailer();
                    $message = $mailer->wrap_message( __( 'Order refunded/reversed', 'dokan-lite' ), sprintf( __( 'Order %s has been marked as refunded - PayPal reason code: %s', 'dokan-lite' ), $order->get_order_number(), $posted['reason_code'] ) );

                    $mailer->send( get_option( 'admin_email' ), sprintf( __( 'Payment for order %s refunded/reversed', 'dokan-lite' ), $order->get_order_number() ), $message );
                }

                break;

            case "reversed" :
            case "chargeback" :

                // Mark order as refunded
                $order->update_status( 'refunded', sprintf( __( 'Payment %s via IPN.', 'dokan-lite' ), strtolower( $posted['status'] ) ) );

                $mailer  = WC()->mailer();
                $message = $mailer->wrap_message( __( 'Order refunded/reversed', 'dokan-lite' ), sprintf( __( 'Order %s has been marked as refunded - PayPal reason code: %s', 'dokan-lite' ), $order->get_order_number(), $posted['reason_code'] ) );
                $mailer->send( get_option( 'admin_email' ), sprintf( __( 'Payment for order %s refunded/reversed', 'dokan-lite' ), $order->get_order_number() ), $message );

                break;

            default :
                // No action
                break;
        }
    }

    /**
     * Get seller net Balance from dokan_order_table
     *
     * @param integer $order_id
     * @param integer $seller_id
     *
     * @return array $results
     * @global $wpdb
     */
    public function get_seller_net_balance( $order_id, $seller_id ) {
        global $wpdb;

        $table  = $wpdb->prefix . "dokan_orders";
        $result = $wpdb->get_var( $wpdb->prepare( "SELECT `net_amount` FROM $table WHERE `order_id` = %d AND `seller_id` = %d", $order_id, $seller_id ) );

        return $result;
    }

    /**
     * Get order by PayPal marketplace pay key
     *
     * @param string $paykey
     *
     * @return boolean|int
     * @global $wpdb $wpdb
     */
    public function get_order_by_paykey( $paykey ) {
        global $wpdb;

        $sql      = $wpdb->prepare( "SELECT post_id FROM $wpdb->postmeta WHERE meta_key = '_dokan_pap_key' AND meta_value = %s", $paykey );
        $order_id = $wpdb->get_var( $sql );

        if ( ! $order_id ) {
            return false;
        }

        return $order_id;
    }

    /**
     * Add to log file if debug enabled
     *
     * @param string $message
     *
     * @since DOKAN_LITE_SINCE
     *
     */
    public function add_log( $message ) {
        if ( 'yes' == $this->debug ) {
            $this->log->add( 'dokan-paypalap', $message );
        }
    }

    /**
     * admin script
     *
     * @since DOKAN_SINCE_LITE
     *
     * @param $script
     *
     * @return void
     */
    public function admin_script( $script ) {
        ?>
        <script type="text/javascript">
            ;(function($) {
                var inputToggle = function (val) {
                    let payment_id_prefix = 'woocommerce_<?php echo $this->id; ?>_';

                    let settings_input_ids = [
                        'app_user',
                        'app_pass',
                        'app_sig'
                    ];

                    if (val) {
                        settings_input_ids.map(function (id) {
                            $('#' + payment_id_prefix + 'test_' + id).closest('tr').show();
                            $('#' + payment_id_prefix + id).closest('tr').hide();
                        });
                    } else {
                        settings_input_ids.map(function (id) {
                            $('#' + payment_id_prefix + id).closest('tr').show();
                            $('#' + payment_id_prefix + 'test_' + id).closest('tr').hide();
                        });
                    }
                };

                let payment_id_prefix = 'woocommerce_<?php echo $this->id; ?>_';
                let test_mode = $(`#${payment_id_prefix}test_mode`);

                inputToggle(test_mode.val());

                test_mode.on('change', function() {
                    inputToggle(this.checked);
                });

            })(jQuery);
        </script>
        <?php
    }

}

