<?php

namespace WeDevs\Dokan\Gateways\PayPal;

/**
 * Class Processor
 * @since DOKAN_LITE_SINCE
 *
 * @package WeDevs\Dokan\Gateways\PayPal
 *
 * @author weDevs
 */
class Processor {

    private $test_mode = false;
    private $api_base_url = '';

    /**
     * Processor constructor.
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        if ( $this->get_option( 'test_mode' ) === 'yes' ) {
            $this->test_mode    = true;
            $this->api_base_url = 'https://api.sandbox.paypal.com/';
        }
    }

    /**
     * create partner referral
     *
     * @param $vendor_email_address
     *
     * @return array|\WP_Error
     */
    public function create_partner_referral( $vendor_email_address ) {
        $partner_referral_data = [
//            "individual_owners"       => [
//                [
//                    "names"         => [
//                        [
//                            "prefix"      => "Mr.",
//                            "given_name"  => "John",
//                            "surname"     => "Doe",
//                            "middle_name" => "Middle",
//                            "suffix"      => "Jr.",
//                            "full_name"   => "John Middle Doe Jr.",
//                            "type"        => "LEGAL",
//                        ],
//                    ],
//                    "citizenship"   => "US",
//                    "addresses"     => [
//                        [
//                            "address_line_1" => "One Washington Square",
//                            "address_line_2" => "Apt 123",
//                            "admin_area_2"   => "San Jose",
//                            "admin_area_1"   => "CA",
//                            "postal_code"    => "95112",
//                            "country_code"   => "US",
//                            "type"           => "HOME",
//                        ],
//                    ],
//                    "phones"        => [
//                        [
//                            "country_code"     => "1",
//                            "national_number"  => "6692468839",
//                            "extension_number" => "1234",
//                            "type"             => "MOBILE",
//                        ],
//                    ],
//                    "birth_details" => [
//                        "date_of_birth" => "1955-12-29",
//                    ],
//                    "type"          => "PRIMARY",
//                ],
//            ],
            "email"                   => $vendor_email_address,
            "preferred_language_code" => "en-US",
            "tracking_id"             => "hello-dokan-test-ent01",
            "partner_config_override" => [
                "partner_logo_url"       => "https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg",
                "return_url"             => dokan_get_navigation_url( 'settings/payment' ),
                "return_url_description" => "the url to return the merchant after the paypal onboarding process.",
                "action_renewal_url"     => "https://testenterprises.com/renew-exprired-url",
            ],
            "legal_consents"          => [
                [
                    "type"    => "SHARE_DATA_CONSENT",
                    "granted" => true,
                ],
            ],
            "operations"              => [
                [
                    "operation"                  => "API_INTEGRATION",
                    "api_integration_preference" => [
                        "rest_api_integration" => [
                            "integration_method"  => "PAYPAL",
                            "integration_type"    => "THIRD_PARTY",
                            "third_party_details" => [
                                "features" => [
                                    "PAYMENT",
                                    "REFUND",
                                    "DELAY_FUNDS_DISBURSEMENT",
                                    "PARTNER_FEE",
                                    "READ_SELLER_DISPUTE",
                                    "UPDATE_SELLER_DISPUTE",
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            "products"                => [
                "PPCP",
            ],
        ];

        $url      = $this->make_paypal_url( 'v2/customer/partner-referrals/' );
        $response = $this->make_request( $url, json_encode( $partner_referral_data ) );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        return $response['links'][1]['href'];
    }

    /**
     * get access token
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string|\WP_Error
     */
    public function get_access_token() {
        if ( $access_token = get_transient( '_dokan_paypal_marketplace_access_token' ) ) {
            return $access_token;
        }

        $access_token = $this->create_access_token();

        if ( is_wp_error( $access_token ) ) {
            return $access_token;
        }

        return $access_token;
    }

    /**
     * create access token
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
     * make paypal full url
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
     * make request
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
        $args = [
            'body'        => $data,
            'timeout'     => '30',
            'redirection' => '30',
            'httpversion' => '1.0',
            'blocking'    => true,
            'headers'     => $header ? $this->get_header( $content_type_json, $request_with_token ) : [],
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
     * @return array
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

        $headers['Authorization'] = 'Bearer ' . $this->get_access_token();

        return $headers;
    }

    /**
     * get base64 encoded authorization data
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
        return dokan()->payment_gateway->paypal_marketplace->dokan_paypal_wc_gateway->get_option( $key );
    }
}
