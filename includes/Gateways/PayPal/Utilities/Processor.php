<?php

namespace WeDevs\Dokan\Gateways\PayPal\Utilities;

/**
 * Class Processor
 * @since DOKAN_LITE_SINCE
 *
 * @package WeDevs\Dokan\Gateways\PayPal\Utilities
 *
 * @author weDevs
 */
class Processor {
    /**
     * @var bool
     */
    private $test_mode = false;

    /**
     * @var string
     */
    private $api_base_url = '';

    /**
     * @var array
     */
    private $additional_request_header = [];

    /**
     * Processor constructor.
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        if ( 'yes' === $this->get_option( 'test_mode' ) ) {
            $this->test_mode    = true;
            $this->api_base_url = 'https://api.sandbox.paypal.com/';
        }
    }

    /**
     * Create partner referral
     *
     * @param $vendor_email_address
     * @param $tracking_id
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string|\WP_Error
     */
    public function create_partner_referral( $vendor_email_address, $tracking_id ) {
        $partner_referral_data = [
            'email'                   => $vendor_email_address,
            'preferred_language_code' => 'en-US',
            'tracking_id'             => $tracking_id,
            'partner_config_override' => [
                'partner_logo_url'       => 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg',
                'return_url'             => add_query_arg(
                    [
                        'action'   => 'paypal-marketplace-connect-success',
                        'status'   => 'success',
                        '_wpnonce' => wp_create_nonce( 'paypal-marketplace-connect-success' ),
                    ],
                    dokan_get_navigation_url( 'settings/payment' )
                ),
                'return_url_description' => 'the url to return the merchant after the paypal onboarding process.',
                'action_renewal_url'     => 'https://testenterprises.com/renew-exprired-url',
            ],
            'legal_consents'          => [
                [
                    'type'    => 'SHARE_DATA_CONSENT',
                    'granted' => true,
                ],
            ],
            'operations'              => [
                [
                    'operation'                  => 'API_INTEGRATION',
                    'api_integration_preference' => [
                        'rest_api_integration' => [
                            'integration_method'  => 'PAYPAL',
                            'integration_type'    => 'THIRD_PARTY',
                            'third_party_details' => [
                                'features' => [
                                    'PAYMENT',
                                    'REFUND',
                                    'DELAY_FUNDS_DISBURSEMENT',
                                    'PARTNER_FEE',
                                    'READ_SELLER_DISPUTE',
                                    'UPDATE_SELLER_DISPUTE',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            'products'                => [
                'PPCP',
            ],
        ];

        $url      = $this->make_paypal_url( 'v2/customer/partner-referrals/' );
        $response = $this->make_request( $url, wp_json_encode( $partner_referral_data ) );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        if ( isset( $response['links'][1] ) && 'action_url' === $response['links'][1]['rel'] ) {
            return $response['links'][1]['href'];
        }

        return new \WP_Error( 'dokan_paypal_create_partner_referral_error', $response );
    }

    /**
     * Get merchant ID from tracking id
     *
     * @param $tracking_id
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string|\WP_Error
     */
    public function get_merchant_id( $tracking_id ) {
        $partner_id = $this->get_option( 'partner_id' );
        $url        = $this->make_paypal_url( "v1/customer/partners/{$partner_id}/merchant-integrations/?tracking_id={$tracking_id}" );

        $response = $this->get_request( $url );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        if ( isset( $response['merchant_id'] ) ) {
            return $response['merchant_id'];
        }

        return new \WP_Error( 'dokan_paypal_get_merchant_id_error', $response );
    }

    /**
     * Get merchant id
     *
     * @param $merchant_id
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array|\WP_Error
     */
    public function get_merchant_status( $merchant_id ) {
        $partner_id = $this->get_option( 'partner_id' );
        $url        = $this->make_paypal_url( "v1/customer/partners/{$partner_id}/merchant-integrations/{$merchant_id}" );

        $response = $this->get_request( $url );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        return $response;
    }

    /**
     * Create order with details in PayPal
     *
     * @param $order_data
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string|\WP_Error
     */
    public function create_order( $order_data ) {
        $url      = $this->make_paypal_url( 'v2/checkout/orders' );
        $this->additional_request_header = [
            'Prefer'                        => 'return=representation',
            'PayPal-Partner-Attribution-Id' => 'weDevs_SP_Dokan',
        ];

        $response = $this->make_request( $url, wp_json_encode( $order_data ) );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        if (
            isset( $response['status'] ) &&
            'CREATED' === $response['status'] &&
            isset( $response['links'][1] ) &&
            'approve' === $response['links'][1]['rel']
        ) {
            return $response['links'][1]['href'];
        }

        return new \WP_Error( 'dokan_paypal_create_order_error', $response );
    }

    /**
     * Capture payment
     *
     * @param $order_id
     *
     * @return array|bool|\WP_Error
     */
    public function capture_payment( $order_id ) {
        $url = $this->make_paypal_url( "v2/checkout/orders/{$order_id}/capture" );
        $this->additional_request_header = [
            'Prefer'                        => 'return=representation',
            'PayPal-Partner-Attribution-Id' => 'weDevs_SP_Dokan',
        ];

        $response = $this->make_request( $url, [] );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        if (
            isset( $response['intent'] ) &&
            isset( $response['status'] ) &&
            'CAPTURE' === $response['intent'] &&
            'COMPLETED' === $response['status']
        ) {
            return true;
        }

        return new \WP_Error( 'dokan_paypal_capture_order_error', $response );
    }

    /**
     * Get access token
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string|\WP_Error
     */
    public function get_access_token() {
        if ( get_transient( '_dokan_paypal_marketplace_access_token' ) ) {
            return get_transient( '_dokan_paypal_marketplace_access_token' );
        }

        $access_token = $this->create_access_token();

        if ( is_wp_error( $access_token ) ) {
            return $access_token;
        }

        return $access_token;
    }

    /**
     * Create access token
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string|\WP_Error
     */
    public function create_access_token() {
        $url      = $this->make_paypal_url( 'v1/oauth2/token/' );
        $response = $this->make_request( $url, [ 'grant_type' => 'client_credentials' ], true, false, false );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        if ( isset( $response['access_token'] ) && isset( $response['expires_in'] ) ) {
            set_transient( '_dokan_paypal_marketplace_access_token', $response['access_token'], $response['expires_in'] );
            return $response['access_token'];
        }
    }

    /**
     * Make paypal full url
     *
     * @param $path
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string
     */
    public function make_paypal_url( $path ) {
        return $this->api_base_url . $path;
    }

    /**
     * Send get request
     *
     * @param $url
     *
     * @return array|mixed|\WP_Error
     */
    public function get_request( $url ) {
        $args = [
            'timeout'     => '30',
            'redirection' => '30',
            'httpversion' => '1.0',
            'blocking'    => true,
            'headers'     => $this->get_header(),
            'cookies'     => [],
        ];

        $response = wp_remote_get( $url, $args );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $body = wp_remote_retrieve_body( $response );

        if ( 200 !== wp_remote_retrieve_response_code( $response ) ) {
            return new \WP_Error( 'dokan_paypal_request_error', $body );
        }

        return json_decode( $body, true );
    }

    /**
     * Make request
     *
     * @param $url
     * @param $data
     * @param bool $header
     * @param bool $content_type_json
     * @param bool $request_with_token
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array|\WP_Error
     */
    public function make_request( $url, $data, $header = true, $content_type_json = true, $request_with_token = true ) {
        $header = $header ? $this->get_header( $content_type_json, $request_with_token ) : [];

        $args = [
            'body'        => $data,
            'timeout'     => '30',
            'redirection' => '30',
            'httpversion' => '1.0',
            'blocking'    => true,
            'headers'     => $header,
            'cookies'     => [],
        ];

        $response = wp_remote_post( esc_url_raw( $url ), $args );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $body = wp_remote_retrieve_body( $response );

        if ( 200 !== wp_remote_retrieve_response_code( $response ) && 201 !== wp_remote_retrieve_response_code( $response ) ) {
            return new \WP_Error( 'dokan_paypal_request_error', $body );
        }

        return json_decode( $body, true );
    }

    /**
     * Headers data for curl request
     *
     * @param bool $content_type_json
     * @param bool $request_with_token
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array|\WP_Error
     */
    public function get_header( $content_type_json = true, $request_with_token = true ) {
        $content_type = $content_type_json ? 'json' : 'x-www-form-urlencoded';

        $headers = [
            'Content-Type'  => 'application/' . $content_type,
        ];

        if ( ! $request_with_token ) {
            $headers['Authorization'] = 'Basic ' . $this->get_authorization_data();
            $headers['Ignorecache'] = true;

            return $headers;
        }

        $access_token = $this->get_access_token();

        if ( is_wp_error( $access_token ) ) {
            return $access_token;
        }

        $headers['Authorization'] = 'Bearer ' . $access_token;

        //merge array if there is any additional data
        $headers = array_merge( $headers, $this->additional_request_header );

        return $headers;
    }

    /**
     * Get base64 encoded authorization data
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string
     */
    public function get_authorization_data() {
        $client_id     = $this->get_option( 'test_app_user' );
        $client_secret = $this->get_option( 'test_app_pass' );

        return base64_encode( $client_id . ':' . $client_secret );
    }

    /**
     * Get PayPal settings option data from db
     *
     * @param $key
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return mixed
     */
    public function get_option( $key ) {
        return dokan()->payment_gateway->paypal_marketplace->paypal_wc_gateway->get_option( $key );
    }
}
