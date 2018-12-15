<?php

/**
 * REST API Settings controller
 *
 * Handles requests to the /settings endpoint.
 *
 * @author   Dokan
 * @category API
 * @package  Dokan/API
 * @since    2.8
 */
if ( !defined( 'ABSPATH' ) ) {
    exit;
}

class Dokan_REST_Settings_Controller extends WP_REST_Controller {

    /**
     * Endpoint namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route name
     *
     * @var string
     */
    protected $base = 'settings';

    /**
     * Register all routes related with settings
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route( $this->namespace, $this->base, array(
            array(
                'methods'  => WP_REST_Server::READABLE,
                'callback' => array( $this, 'get_settings' )
            ),
            array(
                'methods'  => WP_REST_Server::EDITABLE,
                'callback' => array( $this, 'update_settings' )
            ),
        ) );
    }

    /**
     * Get single settings
     *
     * @return void
     */
    public function get_settings( $request ) {

        $seller_id = dokan_get_current_user_id();

        if ( !dokan_is_user_seller( $seller_id ) ) {
            return new WP_Error( 'invalid_seller', 'Invalid Seller ID', array( 'status' => 404 ) );
        }

        $data = dokan_get_store_info( $seller_id );

        $response = rest_ensure_response( $data );
        return $response;
    }

    /**
     * Update Settings
     *
     * @param type $request
     */
    public function update_settings( $request ) {

        $seller_id = dokan_get_current_user_id();
        $prev_dokan_settings = dokan_get_store_info( $seller_id );
        //update store setttings info
        $dokan_settings = array(
            'store_name'                   => sanitize_text_field( $request['store_name'] ),
            'store_ppp'                    => absint( $request['store_ppp'] ),
            'address'                      => isset( $request['address'] ) ? sanitize_textarea_field( $request['address'] ) : $prev_dokan_settings['address'],
            'location'                     => sanitize_text_field( $request['location'] ),
            'find_address'                 => sanitize_text_field( $request['find_address'] ),
            'banner'                       => isset( $request['banner'] ) ? absint( $request['banner'] ) : null,
            'phone'                        => sanitize_text_field( $request['phone'] ),
            'show_email'                   => sanitize_text_field( $request['show_email'] ),
            'show_more_ptab'               => sanitize_text_field( $request['show_more_ptab'] ),
            'gravatar'                     => absint( $request['gravatar'] ),
            'enable_tnc'                   => isset( $request['enable_tnc'] ) ? sanitize_text_field( $request['enable_tnc'] ) : '',
            'store_tnc'                    => isset( $request['store_tnc'] ) ? sanitize_textarea_field( $request['store_tnc'] ) : ''
        );

        if ( isset( $request['social'] ) ) {
            $dokan_settings['social'] = array();
            $social                   = $request['social'];
            $social_fields            = dokan_get_social_profile_fields();

            if ( is_array( $social ) ) {
                foreach ( $social as $key => $value ) {
                    if ( isset( $social_fields[$key] ) ) {
                        $dokan_settings['social'][$key] = filter_var( $social[$key], FILTER_VALIDATE_URL );
                    }
                }
            }

            $dokan_settings['social'] = wp_parse_args( $dokan_settings['social'], $prev_dokan_settings['social'] );
        }

        //update payment settings info
        if ( isset( $request['payment'] ) ) {
            $dokan_settings['payment'] = array();

            if ( isset( $request['payment']['bank'] ) ) {
            $bank = $request['payment']['bank'];

            $dokan_settings['payment']['bank'] = array(
                    'ac_name'        => isset( $bank['ac_name'] ) ? sanitize_text_field( $bank['ac_name'] ) : '',
                    'ac_number'      => isset( $bank['ac_number'] ) ? sanitize_text_field( $bank['ac_number'] ) : '',
                    'bank_name'      => isset( $bank['bank_name'] ) ? sanitize_text_field( $bank['bank_name'] ) : '',
                    'bank_addr'      => isset( $bank['bank_addr'] ) ? sanitize_text_field( $bank['bank_addr'] ) : '',
                    'routing_number' => isset( $bank['routing_number'] ) ? sanitize_text_field( $bank['routing_number'] ) : '',
                    'iban'           => isset( $bank['iban'] ) ? sanitize_text_field( $bank['iban'] ) : '',
                    'swift'          => isset( $bank['swift'] ) ? sanitize_text_field( $bank['swift'] ) : '',
                );
            }

            if ( isset( $request['payment']['paypal'] ) ) {
                $paypal                              = $request['payment']['paypal'];
                $dokan_settings['payment']['paypal'] = array(
                    'email' => filter_var( $paypal['email'], FILTER_VALIDATE_EMAIL )
                );
            }

            if ( isset( $request['payment']['skrill'] ) ) {
                $skrill                              = $request['payment']['skrill'];
                $dokan_settings['payment']['skrill'] = array(
                    'email' => filter_var( $skrill['email'], FILTER_VALIDATE_EMAIL )
                );
            }

            $dokan_settings['payment'] = wp_parse_args( $dokan_settings['payment'] , $prev_dokan_settings['payment'] );
        }

        $dokan_settings = wp_parse_args( $dokan_settings, $prev_dokan_settings );

        $profile_completeness = Dokan_Template_Settings::init()->calculate_profile_completeness_value( $dokan_settings );
        $dokan_settings['profile_completion'] = $profile_completeness;

        update_user_meta( $seller_id, 'dokan_profile_settings', $dokan_settings );

        do_action( 'dokan_store_profile_saved_via_rest', $seller_id, $dokan_settings, $request );

        $dokan_settings = dokan_get_store_info( $seller_id );

        $response = rest_ensure_response( $dokan_settings );
        return $response;
    }
}
