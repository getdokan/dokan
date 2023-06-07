<?php

namespace WeDevs\Dokan\Dashboard\Templates;

use WP_Error;

/**
 * Dokan settings Class
 *
 * @author weDves
 */
class Settings {

    public $currentuser;
    public $profile_info;

    /**
     * Loading autometically when class initiate
     *
     * @since 2.4
     *
     * @return void
     */
    public function __construct() {
        add_action( 'dokan_settings_content_inside_before', [ $this, 'show_enable_seller_message' ] );
        add_action( 'dokan_settings_content_area_header', [ $this, 'render_settings_header' ], 10 );
        add_action( 'dokan_settings_content_area_header', [ $this, 'render_settings_help' ], 15 );
        add_action( 'dokan_settings_content_area_header', [ $this, 'render_settings_load_progressbar' ], 20 );
        add_action( 'dokan_settings_content', [ $this, 'render_settings_content' ], 10 );
        add_filter( 'dokan_payment_method_title', [ $this, 'get_method_frontend_title' ], 10, 2 );
    }

    /**
     * Show Seller Enable Error Message
     *
     * @since 2.4
     *
     * @return void
     */
    public function show_enable_seller_message() {
        $user_id = get_current_user_id();

        if ( ! dokan_is_seller_enabled( $user_id ) ) {
            dokan_seller_not_enabled_notice();
        }
    }

    /**
     * Render Settings Header
     *
     * @since 2.4
     *
     * @return void
     */
    public function render_settings_header() {
        global $wp;
        $is_store_setting = false;

        if ( isset( $wp->query_vars['settings'] ) && $wp->query_vars['settings'] === 'store' ) {
            $heading          = __( 'Settings', 'dokan-lite' );
            $is_store_setting = true;
        } elseif ( isset( $wp->query_vars['settings'] ) && 'payment' === substr( $wp->query_vars['settings'], 0, 7 ) ) {
            $heading = __( 'Payment Method', 'dokan-lite' );
            $slug    = str_replace( 'payment-manage-', '', $wp->query_vars['settings'] );
            $heading = $this->get_payment_heading( $slug, $heading );
        } else {
            $heading = apply_filters( 'dokan_dashboard_settings_heading_title', __( 'Settings', 'dokan-lite' ), $wp->query_vars['settings'] );
        }

        dokan_get_template_part(
            'settings/header', '', [
                'heading'          => $heading,
                'is_store_setting' => $is_store_setting,
            ]
        );
    }

    /**
     * Render Settings help
     *
     * @since 2.4
     *
     * @return void
     */
    public function render_settings_help() {
        global $wp;

        $help_text = '';

        if ( isset( $wp->query_vars['settings'] ) && $wp->query_vars['settings'] === 'payment' ) {
            $help_text = __( 'These are the withdraw methods available for you. Please update your payment information below to submit withdraw requests and get your store payments seamlessly.', 'dokan-lite' );
        }

        if ( $help_text = apply_filters( 'dokan_dashboard_settings_helper_text', $help_text, $wp->query_vars['settings'] ) ) { // phpcs:ignore
            dokan_get_template_part(
                'global/dokan-help', '', [
                    'help_text' => $help_text,
                ]
            );
        }
    }

    /**
     * Render Settings Progressbar
     *
     * @since 2.4
     *
     * @return void
     */
    public function render_settings_load_progressbar() {
        ?>
        <div class="dokan-ajax-response">
            <?php do_action( 'dokan_settings_load_ajax_response' ); ?>
        </div>
        <?php
    }

    /**
     * Render Settings Content
     *
     * @since 2.4
     *
     * @return void
     */
    public function render_settings_content() {
        global $wp;

        // return if we are not in settings page
        if ( ! isset( $wp->query_vars['settings'] ) ) {
            return;
        }

        // check if user have permission to view settings page
        if ( ! current_user_can( 'dokan_view_store_settings_menu' ) ) {
            dokan_get_template_part(
                'global/dokan-error', '', [
                    'deleted' => false,
                    'message' => __( 'You have no permission to view this page', 'dokan-lite' ),
                ]
            );

            return;
        }

        // load store settings page content
        if ( 'store' === $wp->query_vars['settings'] ) {
            $this->load_store_content();
            // load payment settings page content
        } elseif ( 'payment' === substr( $wp->query_vars['settings'], 0, 7 ) ) {
            $this->load_payment_content( substr( $wp->query_vars['settings'], 7 ) );
        }

        do_action( 'dokan_render_settings_content', $wp->query_vars );
    }

    /**
     * Load Store Content
     *
     * @since 2.4
     *
     * @return void
     */
    public function load_store_content() {
        $currentuser  = dokan_get_current_user_id();
        $profile_info = dokan_get_store_info( dokan_get_current_user_id() );

        dokan_get_template_part(
            'settings/store-form', '', [
                'current_user' => $currentuser,
                'profile_info' => $profile_info,
            ]
        );
    }

    /**
     * Load Payment Content
     *
     * @since 2.4
     *
     * @param string $slug_suffix
     *
     * @return void
     */
    public function load_payment_content( $slug_suffix ) {
        $payment_methods = dokan_withdraw_get_active_methods();

        // methods which are inactive in Dokan > Settings > Withdraw Options has a empty value so filter them out
        $payment_methods = array_filter(
            $payment_methods, function ( $value ) {
				return ! empty( $value );
			}
        );

        //no payment method is active, show informative message
        if ( empty( $payment_methods ) ) {
            dokan_get_template_part(
                'global/dokan-error',
                '',
                [
                    'deleted' => false,
                    'message' => __( 'No withdraw method is available. Please contact site admin.', 'dokan-lite' ),
                ]
            );

            return;
        }

        $payment_method_ids = array_keys( $payment_methods );
        $seller_id          = dokan_get_current_user_id();

        $seller_connected_payment_method_ids = array_filter(
            $payment_method_ids,
            function ( $payment_method_id ) use ( $seller_id ) {
                return $this->is_seller_connected( $payment_method_id, $seller_id );
            }
        );

        $seller_disconnected_payment_method_ids = array_diff( $payment_method_ids, $seller_connected_payment_method_ids );
        $seller_disconnected_payment_methods    = $this->get_payment_methods( $seller_disconnected_payment_method_ids );
        $seller_connected_payment_methods       = $this->get_payment_methods( $seller_connected_payment_method_ids );

        /*
         * If we are requesting a single payment method page (to edit or for first time setup)
         * then we have the corresponding payment method key in the url.
         */
        $method_key   = str_replace( '-manage-', '', $slug_suffix );
        $is_edit_mode = false;

        /*
         * If payment method key has /edit suffix then we are trying to edit the method,
         * otherwise we are doing a initial setup for that payment method.
         */
        if ( false !== stripos( $method_key, '-edit' ) ) {
            $is_edit_mode = true;
            $method_key   = str_replace( '-edit', '', $method_key ); // removing '/edit' suffix to get payment method key
        }

        $profile_info = get_user_meta( $seller_id, 'dokan_profile_settings', true );

        if ( $is_edit_mode && 'bank' === $method_key ) {
            $profile_info['is_edit_mode'] = $is_edit_mode;
        }

        // Template arguments
        $args = [
            'current_user' => $seller_id,
            'profile_info' => $profile_info,
        ];

        if ( empty( $method_key ) ) { // payment method list page arguments
            $args = array_merge(
                $args,
                [
                    'methods'        => $seller_connected_payment_methods,
                    'unused_methods' => $seller_disconnected_payment_methods,
                ]
            );

            // Show the payment method list template
            dokan_get_template_part( 'settings/payment', '', $args );

            return;
        }

        // Get the single payment method for the $method_key
        $method = dokan_withdraw_get_method( $method_key );
        $args   = array_merge(
            $args,
            [
                'method'     => $method,
                'method_key' => $method_key,
            ]
        );

        if ( ! in_array( $method_key, $payment_method_ids, true ) || empty( $method ) || ! isset( $method['callback'] ) || ! is_callable( $method['callback'] ) ) {
            dokan_get_template_part(
                'global/dokan-error',
                '',
                [
                    'deleted' => false,
                    'message' => __( 'Invalid withdraw method. Please contact site admin', 'dokan-lite' ),
                ]
            );

            return;
        }

        // todo: this connect message is coming from dokan pro, need to move this to dokan pro
        if ( isset( $_GET['status'] ) && isset( $_GET['message'] ) ) { // phpcs:ignore
            $connect_status = sanitize_text_field( wp_unslash( $_GET['status'] ) ); // phpcs:ignore
            $status_message = wp_kses_post( wp_unslash( $_GET['message'] ) ); // phpcs:ignore

            $args['connect_status'] = $connect_status;
            $args['status_message'] = $status_message;
        }

        // Show the single payment method page
        dokan_get_template_part( 'settings/payment', 'manage', $args );
    }

    /**
     * Save settings via ajax
     *
     * @since 2.4
     *
     * @return void
     */
    public function ajax_settings() {
        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
        }

        if ( ! isset( $_POST['_wpnonce'] ) ) {
            // there can be multiple nonce action, so we are validating nonce later on
            wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
        }

        switch ( sanitize_text_field( wp_unslash( $_POST['form_id'] ) ) ) { // phpcs:ignore
            case 'profile-form':
                if ( ! current_user_can( 'dokan_view_store_social_menu' ) ) {
                    wp_send_json_error( __( 'Pemission denied social', 'dokan-lite' ) );
                }

                if ( ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan_profile_settings_nonce' ) ) {
                    wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
                }

                $ajax_validate = $this->profile_validate();
                break;

            case 'store-form':
                if ( ! current_user_can( 'dokan_view_store_settings_menu' ) ) {
                    wp_send_json_error( __( 'Pemission denied', 'dokan-lite' ) );
                }

                if ( ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan_store_settings_nonce' ) ) {
                    wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
                }

                $ajax_validate = $this->store_validate();
                break;

            case 'payment-form':
                if ( ! current_user_can( 'dokan_view_store_payment_menu' ) ) {
                    wp_send_json_error( __( 'Pemission denied', 'dokan-lite' ) );
                }

                if ( ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan_payment_settings_nonce' ) ) {
                    wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
                }

                $ajax_validate = apply_filters( 'dokan_bank_payment_validation_error', $this->payment_validate() );
                break;
            default:
                $ajax_validate = new WP_Error( 'form_id_not_matched', __( 'Failed to process data, invalid submission', 'dokan-lite' ) );
        }

        if ( is_wp_error( $ajax_validate ) ) {
            wp_send_json_error( $ajax_validate->get_error_messages() );
        }

        // we are good to go
        $this->insert_settings_info();

        $success_msg = __( 'Your information has been saved successfully', 'dokan-lite' );

        $data = apply_filters(
            'dokan_ajax_settings_response', [
                'msg' => $success_msg,
            ]
        );

        wp_send_json_success( $data );
    }

    /**
     * Validate profile settings
     *
     * @return bool|WP_Error
     */
    private function profile_validate() {
        if ( ! isset( $_POST['dokan_update_profile_settings'] ) ) {
            return false;
        }

        if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan_profile_settings_nonce' ) ) {
            wp_die( esc_attr__( 'Are you cheating?', 'dokan-lite' ) );
        }

        $error = new WP_Error();

        if ( isset( $_POST['setting_category'] ) ) {
            if ( ! is_array( $_POST['setting_category'] ) || ! count( $_POST['setting_category'] ) ) {
                $error->add( 'dokan_type', __( 'Store type required', 'dokan-lite' ) );
            }
        }

        if ( ! empty( $_POST['setting_paypal_email'] ) ) {
            $email = sanitize_email( wp_unslash( $_POST['setting_paypal_email'] ) );

            if ( empty( $email ) ) {
                $error->add( 'dokan_email', __( 'Invalid email', 'dokan-lite' ) );
            }
        }

        if ( $error->get_error_codes() ) {
            return $error;
        }

        return true;
    }

    /**
     * Validate store settings
     *
     * @return bool|WP_Error
     */
    private function store_validate() {
        if ( ! isset( $_POST['dokan_update_store_settings'] ) ) {
            return false;
        }

        if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan_store_settings_nonce' ) ) {
            wp_die( esc_attr__( 'Are you cheating?', 'dokan-lite' ) );
        }

        $error = new WP_Error();

        $dokan_name = isset( $_POST['dokan_store_name'] ) ? sanitize_text_field( wp_unslash( $_POST['dokan_store_name'] ) ) : '';

        if ( empty( $dokan_name ) ) {
            $error->add( 'dokan_name', __( 'Store name required', 'dokan-lite' ) );
        }

        if ( isset( $_POST['setting_category'] ) ) {
            if ( ! is_array( $_POST['setting_category'] ) || ! count( $_POST['setting_category'] ) ) {
                $error->add( 'dokan_type', __( 'Store type required', 'dokan-lite' ) );
            }
        }

        if ( ! empty( $_POST['setting_paypal_email'] ) ) {
            $email = sanitize_email( wp_unslash( $_POST['setting_paypal_email'] ) );

            if ( empty( $email ) ) {
                $error->add( 'dokan_email', __( 'Invalid email', 'dokan-lite' ) );
            }
        }

        if ( $error->get_error_codes() ) {
            return $error;
        }

        return true;
    }

    /**
     * Validate payment settings
     *
     * @since 2.4
     *
     * @return bool|WP_Error
     */
    private function payment_validate() {
        if ( ! isset( $_POST['dokan_update_payment_settings'] ) ) {
            return false;
        }

        if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan_payment_settings_nonce' ) ) {
            wp_die( esc_attr__( 'Are you cheating?', 'dokan-lite' ) );
        }

        $error = new WP_Error();

        if ( ! empty( $_POST['settings']['paypal'] ) && isset( $_POST['settings']['paypal']['email'] ) ) {
            $email = sanitize_email( wp_unslash( $_POST['settings']['paypal']['email'] ) );

            if ( isset( $_POST['settings']['paypal']['disconnect'] ) ) {
                $_POST['settings']['paypal']['email'] = '';
            } elseif ( empty( $email ) ) {
                $error->add( 'dokan_email', __( 'Invalid email', 'dokan-lite' ) );
            }
        }

        if ( ! empty( $_POST['settings']['skrill'] ) && isset( $_POST['settings']['skrill']['email'] ) ) {
            $email = sanitize_email( wp_unslash( $_POST['settings']['skrill']['email'] ) );

            if ( isset( $_POST['settings']['skrill']['disconnect'] ) ) {
                $_POST['settings']['skrill']['email'] = '';
            } elseif ( empty( $email ) ) {
                $error->add( 'dokan_email', __( 'Invalid email', 'dokan-lite' ) );
            }
        }

        $is_disconnect = isset( $_POST['settings']['bank']['disconnect'] );
        if ( ! empty( $_POST['settings']['bank'] ) && ! $is_disconnect ) {
            $payment_fields = dokan_bank_payment_required_fields();
            /**
             * Here we are validating the bank payment required fields,
             * if the payment field is required and the payment field from post data is given.
             * And if the filed in account type and the given value is personal or business.
             */
            foreach ( $payment_fields as $key => $payment_field ) {
                if ( ! empty( $payment_field ) && empty( $_POST['settings']['bank'][ $key ] ) ) {
                    $error->add( 'dokan_bank_' . $key, $payment_field );
                } elseif ( ! empty( $payment_field ) && $key === 'ac_type' && ! in_array( $_POST['settings']['bank'][ $key ], [ 'personal', 'business' ], true ) ) {
                    $error->add( 'dokan_bank_ac_type', __( 'Invalid Account Type', 'dokan-lite' ) );
                }
            }

            if ( empty( $_POST['settings']['bank']['declaration'] ) ) {
                $error->add( 'dokan_bank_declaration', __( 'You must attest that the bank account is yours.', 'dokan-lite' ) );
            }
        }

        if ( $error->get_error_codes() ) {
            return $error;
        }

        return true;
    }

    /**
     * Save store settings
     *
     * @return void
     */
    public function insert_settings_info() {
        $store_id                = dokan_get_current_user_id();
        $existing_dokan_settings = get_user_meta( $store_id, 'dokan_profile_settings', true );
        $prev_dokan_settings     = ! empty( $existing_dokan_settings ) ? $existing_dokan_settings : [];

        if ( ! isset( $_POST['_wpnonce'] ) ) {
            return;
        }

        if ( wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan_profile_settings_nonce' ) ) {
            // update profile settings info
            $social         = isset( $_POST['settings']['social'] ) ? array_map( 'esc_url_raw', (array) wp_unslash( $_POST['settings']['social'] ) ) : [];
            $social_fields  = dokan_get_social_profile_fields();
            $dokan_settings = [ 'social' => [] ];

            foreach ( $social as $key => $value ) {
                if ( isset( $social_fields[ $key ] ) ) {
                    $dokan_settings['social'][ $key ] = $social[ $key ];
                }
            }
        } elseif ( wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan_store_settings_nonce' ) ) {
            $default_locations = dokan_get_option( 'location', 'dokan_geolocation' );

            if ( ! is_array( $default_locations ) || empty( $default_locations ) ) {
                $default_locations = [
                    'latitude'  => '',
                    'longitude' => '',
                    'address'   => '',
                ];
            }

            $find_address     = ! empty( $_POST['find_address'] ) ? sanitize_text_field( wp_unslash( $_POST['find_address'] ) ) : $default_locations['address'];
            $default_location = $default_locations['latitude'] . ',' . $default_locations['longitude'];
            $location         = ! empty( $_POST['location'] ) ? sanitize_text_field( wp_unslash( $_POST['location'] ) ) : $default_location;
            $dokan_days       = dokan_get_translated_days();
            $dokan_store_time = [];

            // Get & set 7 days opening & closing time for update dokan store time.
            foreach ( $dokan_days as $day_key => $day ) {
                $opening_time = isset( $_POST['opening_time'][ $day_key ] ) ? wc_clean( wp_unslash( $_POST['opening_time'][ $day_key ] ) ) : '';
                $closing_time = isset( $_POST['closing_time'][ $day_key ] ) ? wc_clean( wp_unslash( $_POST['closing_time'][ $day_key ] ) ) : '';
                $store_status = ! empty( $_POST[ $day_key ]['working_status'] ) ? sanitize_text_field( wp_unslash( $_POST[ $day_key ]['working_status'] ) ) : 'close';

                // If open or closing time is array then return from here.
                if ( is_array( $opening_time ) || is_array( $closing_time ) ) {
                    continue;
                }

                // If pass null value or our store is not open then our store will be close.
                if ( empty( $opening_time ) || empty( $closing_time ) || 'open' !== $store_status ) {
                    $dokan_store_time[ $day_key ] = [
                        'status'       => 'close',
                        'opening_time' => [],
                        'closing_time' => [],
                    ];

                    continue;
                }

                // Check & make 12 hours format data for save.
                $opening_timestamp = dokan_get_timestamp( $opening_time );
                $opening_time      = dokan_convert_date_format( $opening_time, wc_time_format(), 'g:i a' );

                // Check & make 12 hours format data for save.
                $closing_timestamp = dokan_get_timestamp( $closing_time );
                $closing_time      = dokan_convert_date_format( $closing_time, wc_time_format(), 'g:i a' );

                // If our opening time is less than closing time.
                if ( $opening_timestamp > $closing_timestamp ) {
                    $user_data    = get_user_meta( dokan_get_current_user_id(), 'dokan_profile_settings', true );
                    $opening_time = ! empty( $user_data['dokan_store_time'][ $day_key ]['opening_time'] ) ? $user_data['dokan_store_time'][ $day_key ]['opening_time'] : '';
                    $closing_time = ! empty( $user_data['dokan_store_time'][ $day_key ]['closing_time'] ) ? $user_data['dokan_store_time'][ $day_key ]['closing_time'] : '';
                }

                // Get and set current day's data for update dokan store time. Make dokan store time data here.
                $dokan_store_time[ $day_key ] = [
                    'status'       => $store_status,
                    'opening_time' => (array) $opening_time,
                    'closing_time' => (array) $closing_time,
                ];
            }

            // Update store settings info.
            $dokan_settings = [
                'store_name'               => isset( $_POST['dokan_store_name'] ) ? sanitize_text_field( wp_unslash( $_POST['dokan_store_name'] ) ) : '',
                'store_ppp'                => isset( $_POST['dokan_store_ppp'] ) ? absint( $_POST['dokan_store_ppp'] ) : 10,
                'address'                  => isset( $_POST['dokan_address'] ) ? wc_clean( wp_unslash( $_POST['dokan_address'] ) ) : $prev_dokan_settings['address'],
                'location'                 => $location,
                'find_address'             => $find_address,
                'banner'                   => isset( $_POST['dokan_banner'] ) ? absint( $_POST['dokan_banner'] ) : 0,
                'phone'                    => isset( $_POST['setting_phone'] ) ? sanitize_text_field( wp_unslash( $_POST['setting_phone'] ) ) : 'no',
                'show_email'               => isset( $_POST['setting_show_email'] ) ? sanitize_text_field( wp_unslash( $_POST['setting_show_email'] ) ) : 'no',
                'show_more_ptab'           => isset( $_POST['setting_show_more_ptab'] ) ? sanitize_text_field( wp_unslash( $_POST['setting_show_more_ptab'] ) ) : 'no',
                'gravatar'                 => isset( $_POST['dokan_gravatar'] ) ? absint( $_POST['dokan_gravatar'] ) : 0,
                'enable_tnc'               => isset( $_POST['dokan_store_tnc_enable'] ) && 'on' === sanitize_text_field( wp_unslash( $_POST['dokan_store_tnc_enable'] ) ) ? 'on' : 'off',
                'store_tnc'                => isset( $_POST['dokan_store_tnc'] ) ? wp_kses_post( wp_unslash( $_POST['dokan_store_tnc'] ) ) : '',
                'dokan_store_time'         => apply_filters( 'dokan_store_time', $dokan_store_time ),
                'dokan_store_time_enabled' => isset( $_POST['dokan_store_time_enabled'] ) && 'yes' === sanitize_text_field( wp_unslash( $_POST['dokan_store_time_enabled'] ) ) ? 'yes' : 'no',
                'dokan_store_open_notice'  => isset( $_POST['dokan_store_open_notice'] ) ? sanitize_textarea_field( wp_unslash( $_POST['dokan_store_open_notice'] ) ) : '',
                'dokan_store_close_notice' => isset( $_POST['dokan_store_close_notice'] ) ? sanitize_textarea_field( wp_unslash( $_POST['dokan_store_close_notice'] ) ) : '',
            ];

            update_user_meta( $store_id, 'dokan_store_name', $dokan_settings['store_name'] );
        } elseif ( wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan_payment_settings_nonce' ) ) {

            //update payment settings info
            $dokan_settings = [
                'payment' => $prev_dokan_settings['payment'],
            ];

            if ( isset( $_POST['settings']['bank'] ) ) {
                $bank = wc_clean( wp_unslash( $_POST['settings']['bank'] ) );

                $dokan_settings['payment']['bank'] = [
                    'ac_name'        => $bank['ac_name'],
                    'ac_number'      => $bank['ac_number'],
                    'bank_name'      => $bank['bank_name'],
                    'bank_addr'      => $bank['bank_addr'],
                    'routing_number' => $bank['routing_number'],
                    'iban'           => $bank['iban'],
                    'swift'          => $bank['swift'],
                    'ac_type'        => $bank['ac_type'],
                    'declaration'    => isset( $bank['declaration'] ) ? $bank['declaration'] : '',
                ];
            }

            if ( isset( $_POST['settings']['paypal']['email'] ) ) {
                $dokan_settings['payment']['paypal'] = [
                    'email' => sanitize_email( wp_unslash( $_POST['settings']['paypal']['email'] ) ),
                ];
            }
        }

        $dokan_settings = array_merge( $prev_dokan_settings, $dokan_settings );

        $dokan_settings = apply_filters( 'dokan_store_profile_settings_args', $dokan_settings, $store_id );

        update_user_meta( $store_id, 'dokan_profile_settings', $dokan_settings );

        do_action( 'dokan_store_profile_saved', $store_id, $dokan_settings );

        if ( ! defined( 'DOING_AJAX' ) ) {
            $_GET['message'] = 'profile_saved';
        }
    }

    /**
     * Dokan Get Category Format
     *
     * @since 1.0
     *
     * @return array
     */
    public function get_dokan_categories() {
        $dokan_category = [
            'book'       => __( 'Book', 'dokan-lite' ),
            'dress'      => __( 'Dress', 'dokan-lite' ),
            'electronic' => __( 'Electronic', 'dokan-lite' ),
        ];

        return apply_filters( 'dokan_category', $dokan_category );
    }

    /**
     * Get proper heading for payments of vendor dashboard payment settings
     *
     * @since 3.4.3
     *
     * @param string $slug
     * @param string $heading
     *
     * @return string
     */
    private function get_payment_heading( $slug, $heading ) {
        switch ( $slug ) {
            case 'bank':
            case 'bank-edit':
                $heading = __( 'Bank Account Settings', 'dokan-lite' );
                break;

            case 'paypal':
            case 'paypal-edit':
                $heading = __( 'Paypal Settings', 'dokan-lite' );
                break;
        }

        /**
         * To allow new payment extension give their own heading
         *
         * @since 3.4.3
         *
         * @param string $heading previous heading
         */
        $heading = apply_filters( 'dokan_withdraw_method_settings_title', $heading, $slug );

        return $heading;
    }

    /**
     * Check if a seller is connected to a payment method
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param $payment_method_id
     * @param $seller_id
     *
     * @return bool
     */
    public function is_seller_connected( $payment_method_id, $seller_id ) {
        $is_connected     = false;
        $store_settings   = get_user_meta( $seller_id, 'dokan_profile_settings', true );
        $payment_settings = ! isset( $store_settings['payment'] ) || ! isset( $store_settings['payment'][ $payment_method_id ] ) ? [] : $store_settings['payment'][ $payment_method_id ];
        $required_fields  = []; // Holds the required fields that should be empty for connection

        switch ( $payment_method_id ) {
            case 'bank':
                $required_fields = array_keys( dokan_bank_payment_required_fields() );
                break;

            case 'paypal':
                $required_fields = [ 'email' ];
                break;
        }

        /**
         * To allow modifying the required fields for a payment method.
         *
         * @since 3.5.1
         *
         * @param array  $required_fields
         * @param string $payment_method_id
         * @param int    $seller_id
         */
        $required_fields = apply_filters( 'dokan_payment_settings_required_fields', $required_fields, $payment_method_id, $seller_id );

        // Check all the required fields have values
        if ( ! empty( $payment_settings ) && is_array( $payment_settings ) && ! empty( $required_fields ) ) {
            $is_connected = true;

            foreach ( $required_fields as $required_field ) {
                if ( empty( $payment_settings[ $required_field ] ) ) {
                    $is_connected = false;
                    break;
                } elseif ( 'email' === $required_field && ! is_email( $payment_settings[ $required_field ] ) ) {
                    $is_connected = false;
                    break;
                }
            }
        }

        /**
         * Get if user with id $seller_id is connected to the payment method having $payment_method_id
         *
         * @since DOKAN_PRO_SINCE
         *
         * @param bool   $is_connected
         * @param string $payment_method_id
         * @param int    $seller_id
         */
        return apply_filters( 'dokan_is_seller_connected_to_payment_method', $is_connected, $payment_method_id, $seller_id );
    }

    /**
     * Get payment method details from the method keys
     *
     * @since 3.4.3
     *
     * @param $method_keys
     *
     * @return array
     */
    private function get_payment_methods( $method_keys ) {
        $methods = [];

        foreach ( $method_keys as $method_key ) {
            $cur_method = dokan_withdraw_get_method( $method_key );

            if ( ! empty( $cur_method ) ) {
                //remove the 'Dokan' prefix from method title
                $method_title = $cur_method['title'];
                if ( 0 === stripos( $method_title, 'Dokan ' ) ) {
                    $method_title        = substr( $method_title, 6 );
                    $cur_method['title'] = $method_title;
                }

                $methods[ $method_key ] = $cur_method;
            }
        }

        return $methods;
    }

    /**
     * Get Method title to show in frontend
     *
     * @since 3.6.1
     *
     * @return string
     */
    public function get_method_frontend_title( $title, $method ) {
        if ( 0 === stripos( $title, 'Dokan ' ) ) {
            return substr( $title, 6 );
        }

        return $title;
    }
}
