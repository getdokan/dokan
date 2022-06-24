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
    function __construct() {
        add_action( 'dokan_settings_content_inside_before', array( $this, 'show_enable_seller_message' ) );
        add_action( 'dokan_settings_content_area_header', array( $this, 'render_settings_header' ), 10 );
        add_action( 'dokan_settings_content_area_header', array( $this, 'render_settings_help' ), 15 );
        add_action( 'dokan_settings_content_area_header', array( $this, 'render_settings_load_progressbar' ), 20 );
        add_action( 'dokan_settings_content_area_header', array( $this, 'render_settings_store_errors' ), 25 );
        add_action( 'dokan_settings_content', array( $this, 'render_settings_content' ), 10 );
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

        if ( isset( $wp->query_vars['settings'] ) && $wp->query_vars['settings'] == 'store' ) {
            $heading          = __( 'Settings', 'dokan-lite' );
            $is_store_setting = true;
        } elseif ( isset( $wp->query_vars['settings'] ) && 'payment' === substr( $wp->query_vars['settings'], 0, 7 ) ) {
            $heading = __( 'Payment Method', 'dokan-lite' );
            $slug    = str_replace( 'payment-manage-', '', $wp->query_vars['settings'] );
            $heading = $this->get_payment_heading( $slug, $heading );
        } else {
            $heading = apply_filters( 'dokan_dashboard_settings_heading_title', __( 'Settings', 'dokan-lite' ), $wp->query_vars['settings'] );
        }

        dokan_get_template_part( 'settings/header', '', array( 'heading' => $heading, 'is_store_setting' => $is_store_setting ) );
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

        if ( isset( $wp->query_vars['settings'] ) && $wp->query_vars['settings'] == 'payment' ) {
            $help_text = __( 'These are the withdraw methods available for you. Please update your payment information below to submit withdraw requests and get your store payments seamlessly.', 'dokan-lite' );
        }

        if ( $help_text = apply_filters( 'dokan_dashboard_settings_helper_text', $help_text, $wp->query_vars['settings'] ) ) {
            dokan_get_template_part( 'global/dokan-help', '', array(
                'help_text' => $help_text
            ) );
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
     * Render Settings Store Errors
     *
     * @since 2.4
     *
     * @return void
     */
    public function render_settings_store_errors() {
        $validate = $this->validate();

        if ( is_wp_error( $validate ) ) {
            $messages = $validate->get_error_messages();

            foreach ( $messages as $message ) {
                dokan_get_template_part( 'global/dokan-error', '', array(
                    'message' => $message
                ) );
            }
        }
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

        if ( isset( $wp->query_vars['settings'] ) && 'store' == $wp->query_vars['settings'] ) {
            if ( ! current_user_can( 'dokan_view_store_settings_menu' ) ) {
                dokan_get_template_part('global/dokan-error', '', array(
                    'deleted' => false,
                    'message' => __( 'You have no permission to view this page', 'dokan-lite' )
                ) );
            } else {
                $this->load_store_content();
            }
        }

        if ( isset( $wp->query_vars['settings'] ) && 'payment' === substr( $wp->query_vars['settings'], 0, 7 ) ) {
            if ( ! current_user_can( 'dokan_view_store_payment_menu' ) ) {
                dokan_get_template_part('global/dokan-error', '', array(
                    'deleted' => false,
                    'message' => __( 'You have no permission to view this page', 'dokan-lite' )
                ) );
            } else {
                $this->load_payment_content( substr( $wp->query_vars['settings'], 7 ) );
            }
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
        $validate     = $this->validate();
        $currentuser  = dokan_get_current_user_id();
        $profile_info = dokan_get_store_info( dokan_get_current_user_id() );

        dokan_get_template_part( 'settings/store-form', '', array(
            'current_user' => $currentuser,
            'profile_info' => $profile_info,
            'validate'     => $validate,
        ) );

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
        $payment_methods = array_filter( $payment_methods, function ( $value ) {
            return ! empty( $value );
        } );

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
            function ( $payment_method_id ) use( $seller_id ) {
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

        if ( empty( $method ) || ! isset( $method['callback'] ) || ! is_callable( $method['callback'] ) ) {
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
    function ajax_settings() {

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
        }

        if ( ! isset( $_POST['_wpnonce'] ) ) {
            wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
        }

        $post_data = wp_unslash( $_POST );

        $post_data['dokan_update_profile'] = '';

        switch ( $post_data['form_id'] ) { // WPCS: CSRF ok.
            case 'profile-form':
                if ( ! current_user_can( 'dokan_view_store_social_menu' ) ) {
                    wp_send_json_error( __( 'Pemission denied social', 'dokan-lite' ) );
                }

                if ( ! wp_verify_nonce( sanitize_key( $post_data['_wpnonce'] ), 'dokan_profile_settings_nonce' ) ) {
                    wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
                }

                $ajax_validate = $this->profile_validate();
                break;

            case 'store-form':
                if ( ! current_user_can( 'dokan_view_store_settings_menu' ) ) {
                    wp_send_json_error( __( 'Pemission denied', 'dokan-lite' ) );
                }

                if ( ! wp_verify_nonce( sanitize_key( $post_data['_wpnonce'] ), 'dokan_store_settings_nonce' ) ) {
                    wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
                }

                $ajax_validate = $this->store_validate();
                break;

            case 'payment-form':
                if ( ! current_user_can( 'dokan_view_store_payment_menu' ) ) {
                    wp_send_json_error( __( 'Pemission denied', 'dokan-lite' ) );
                }

                if ( ! wp_verify_nonce( sanitize_key( $post_data['_wpnonce'] ), 'dokan_payment_settings_nonce' ) ) {
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
        $save_data = $this->insert_settings_info();

        $success_msg = __( 'Your information has been saved successfully', 'dokan-lite' );

        $data = apply_filters( 'dokan_ajax_settings_response', array(
            'msg' => $success_msg,
        ) );

        wp_send_json_success( $data );
    }

    /**
     * Validate settings submission
     *
     * @return void
     */
    function validate() {

        $post_data = wp_unslash( $_POST );

        if ( ! isset( $post_data['dokan_update_profile'] ) ) {
            return false;
        }

        if ( ! isset( $post_data['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $post_data['_wpnonce'] ), 'dokan_settings_nonce' ) ) {
            wp_die( esc_attr__( 'Are you cheating?', 'dokan-lite' ) );
        }

        $error = new WP_Error();

        $dokan_name = sanitize_text_field( $post_data['dokan_store_name'] );

        if ( empty( $dokan_name ) ) {
            $error->add( 'dokan_name', __( 'Store name required', 'dokan-lite' ) );
        }

        if ( isset( $post_data['setting_category'] ) ) {

            if ( ! is_array( $post_data['setting_category'] ) || ! count( $post_data['setting_category'] ) ) {
                $error->add( 'dokan_type', __( 'Store type required', 'dokan-lite' ) );
            }
        }

        if ( ! empty( $post_data['setting_paypal_email'] ) ) {
            $email = sanitize_email( $post_data['setting_paypal_email'] );

            if ( empty( $email ) ) {
                $error->add( 'dokan_email', __( 'Invalid email', 'dokan-lite' ) );
            }
        }

        /* Address Fields Validation */
        $required_fields = array(
            'street_1',
            'city',
            'zip',
            'country',
        );

        if ( $post_data['dokan_address']['state'] != 'N/A' ) {
            $required_fields[] = 'state';
        }

        foreach ( $required_fields as $key ) {
            if ( empty( $post_data['dokan_address'][ $key ] ) ) {
                $code = 'dokan_address[' . $key . ']';
                $error->add( $code, sprintf( __( 'Address field for %s is required', 'dokan-lite' ), $key ) );
            }
        }

        if ( $error->get_error_codes() ) {
            return $error;
        }

        return true;
    }

    /**
     * Validate profile settings
     *
     * @return bool|WP_Error
     */
    function profile_validate() {

        $post_data = wp_unslash( $_POST );

        if ( ! isset( $post_data['dokan_update_profile_settings'] ) ) {
            return false;
        }

        if ( ! isset( $post_data['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $post_data['_wpnonce'] ), 'dokan_profile_settings_nonce' ) ) {
            wp_die( esc_attr__( 'Are you cheating?', 'dokan-lite' ) );
        }

        $error = new WP_Error();

        if ( isset( $post_data['setting_category'] ) ) {

            if ( ! is_array( $post_data['setting_category'] ) || ! count( $post_data['setting_category'] ) ) {
                $error->add( 'dokan_type', __( 'Store type required', 'dokan-lite' ) );
            }
        }

        if ( ! empty( $_POST['setting_paypal_email'] ) ) {
            $email = sanitize_email( $post_data['setting_paypal_email'] );

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
    function store_validate() {

        $post_data = wp_unslash( $_POST );

        if ( ! isset( $post_data['dokan_update_store_settings'] ) ) {
            return false;
        }

        if ( ! isset( $post_data['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $post_data['_wpnonce'] ), 'dokan_store_settings_nonce' ) ) {
            wp_die( esc_attr__( 'Are you cheating?', 'dokan-lite' ) );
        }

        $error = new WP_Error();

        $dokan_name = sanitize_text_field( $post_data['dokan_store_name'] );

        if ( empty( $dokan_name ) ) {
            $error->add( 'dokan_name', __( 'Store name required', 'dokan-lite' ) );
        }

        if ( isset( $_POST['setting_category'] ) ) {

            if ( ! is_array( $_POST['setting_category'] ) || ! count( $post_data['setting_category'] ) ) {
                $error->add( 'dokan_type', __( 'Store type required', 'dokan-lite' ) );
            }
        }

        if ( ! empty( $post_data['setting_paypal_email'] ) ) {
            $email = sanitize_email( $post_data['setting_paypal_email'] );

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
     * validate payment settings
     *
     * @since 2.4
     *
     * @return bool|WP_Error
     */
    function payment_validate() {

        $post_data = wp_unslash( $_POST );

        if ( ! isset( $post_data['dokan_update_payment_settings'] ) ) {
            return false;
        }

        if ( ! isset( $post_data['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $post_data['_wpnonce'] ), 'dokan_payment_settings_nonce' ) ) {
            wp_die( esc_attr__( 'Are you cheating?', 'dokan-lite' ) );
        }

        $error = new WP_Error();

        if ( ! empty( $post_data['settings']['paypal'] ) && isset( $post_data['settings']['paypal']['email'] ) ) {
            $email = sanitize_email( $post_data['settings']['paypal']['email'] );

            if ( empty( $email ) ) {
                $error->add( 'dokan_email', __( 'Invalid email', 'dokan-lite' ) );
            }
        }

        if ( ! empty( $post_data['settings']['skrill'] ) && isset( $post_data['settings']['skrill']['email'] ) ) {
            $email = sanitize_email( $post_data['settings']['skrill']['email'] );

            if ( empty( $email ) ) {
                $error->add( 'dokan_email', __( 'Invalid email', 'dokan-lite' ) );
            }
        }

        if ( ! empty( $post_data['settings']['bank'] ) ) {
            if ( empty( $post_data['settings']['bank']['ac_name'] ) ) {
                $error->add( 'dokan_bank_ac_name', __( 'Account holder name is required', 'dokan-lite' ) );
            }

            if ( empty( $post_data['settings']['bank']['ac_number'] ) ) {
                $error->add( 'dokan_bank_ac_number', __( 'Account number is required', 'dokan-lite' ) );
            }

            if ( empty( $post_data['settings']['bank']['routing_number'] ) ) {
                $error->add( 'dokan_bank_ac_routing_number', __( 'Routing number is required', 'dokan-lite' ) );
            }

            if ( empty( $post_data['settings']['bank']['ac_type'] ) ) {
                $error->add( 'dokan_bank_ac_type', __( 'Please select account type', 'dokan-lite' ) );
            } else if ( ! in_array( $post_data['settings']['bank']['ac_type'], [ 'personal', 'business' ] ) ) {
                $error->add( 'dokan_bank_ac_type', __( 'Invalid Account Type', 'dokan-lite' ) );
            }

            if ( empty( $post_data['settings']['bank']['declaration'] ) ) {
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
    function insert_settings_info() {
        $store_id                = dokan_get_current_user_id();
        $existing_dokan_settings = get_user_meta( $store_id, 'dokan_profile_settings', true );
        $prev_dokan_settings     = ! empty( $existing_dokan_settings ) ? $existing_dokan_settings : [];
        $post_data               = wp_unslash( $_POST );

        if ( ! isset( $post_data['_wpnonce'] ) ) {
            return;
        }

        if ( wp_verify_nonce( sanitize_key( $post_data['_wpnonce'] ), 'dokan_profile_settings_nonce' ) ) {

            // update profile settings info
            $social         = $post_data['settings']['social'];
            $social_fields  = dokan_get_social_profile_fields();
            $dokan_settings = [ 'social' => [] ];

            if ( is_array( $social ) ) {
                foreach ( $social as $key => $value ) {
                    if ( isset( $social_fields[ $key ] ) ) {
                        $dokan_settings['social'][ $key ] = esc_url_raw( $social[ $key ] );
                    }
                }
            }

        } elseif ( wp_verify_nonce( sanitize_key( $post_data['_wpnonce'] ), 'dokan_store_settings_nonce' ) ) {

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

                // Check & make 12 hours format data for save.
                $opening_time      = \DateTimeImmutable::createFromFormat( wc_time_format(), $opening_time, new \DateTimeZone( dokan_wp_timezone_string() ) );
                $opening_timestamp = $opening_time ? $opening_time->getTimestamp() : '';
                $opening_time      = $opening_time ? $opening_time->format( 'g:i a' ) : '';

                // Check & make 12 hours format data for save.
                $closing_time      = \DateTimeImmutable::createFromFormat( wc_time_format(), $closing_time, new \DateTimeZone( dokan_wp_timezone_string() ) );
                $closing_timestamp = $closing_time ? $closing_time->getTimestamp() : $closing_time;
                $closing_time      = $closing_time ? $closing_time->format( 'g:i a' ) : '';

                // If our opening time is less than closing time.
                if ( $opening_timestamp > $closing_timestamp ) {
                    $user_data    = get_user_meta( dokan_get_current_user_id(), 'dokan_profile_settings', true );
                    $opening_time = ! empty( $user_data['dokan_store_time'][ $day_key ]['opening_time'] ) ? $user_data['dokan_store_time'][ $day_key ]['opening_time'] : '';
                    $closing_time = ! empty( $user_data['dokan_store_time'][ $day_key ]['closing_time'] ) ? $user_data['dokan_store_time'][ $day_key ]['closing_time'] : '';
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

                // Get and set current day's data for update dokan store time. Make dokan store time data here.
                $dokan_store_time[ $day_key ] = [
                    'status'       => $store_status,
                    'opening_time' => ( array ) $opening_time,
                    'closing_time' => ( array ) $closing_time,
                ];
            }

            // Update store settings info.
            $dokan_settings = [
                'store_name'               => sanitize_text_field( $post_data['dokan_store_name'] ),
                'store_ppp'                => absint( $post_data['dokan_store_ppp'] ),
                'address'                  => isset( $post_data['dokan_address'] ) ? array_map( 'sanitize_text_field', $post_data['dokan_address'] ) : $prev_dokan_settings['address'],
                'location'                 => $location,
                'find_address'             => $find_address,
                'banner'                   => isset( $post_data['dokan_banner'] ) ? absint( $post_data['dokan_banner'] ) : 0,
                'phone'                    => isset( $post_data['setting_phone'] ) ? sanitize_text_field( $post_data['setting_phone'] ) : 'no',
                'show_email'               => isset( $post_data['setting_show_email'] ) ? sanitize_text_field( $post_data['setting_show_email'] ) :'no',
                'show_more_ptab'           => isset( $post_data['setting_show_more_ptab'] ) ? sanitize_text_field( $post_data['setting_show_more_ptab'] ) : 'no',
                'gravatar'                 => isset( $post_data['dokan_gravatar'] ) ? absint( $post_data['dokan_gravatar'] ) : 0,
                'enable_tnc'               => isset( $post_data['dokan_store_tnc_enable'] ) && 'on' == $post_data['dokan_store_tnc_enable'] ? 'on' : 'off',
                'store_tnc'                => isset( $post_data['dokan_store_tnc'] ) ? wp_kses_post( $post_data['dokan_store_tnc'] ) : '',
                'dokan_store_time'         => apply_filters( 'dokan_store_time', $dokan_store_time ),
                'dokan_store_time_enabled' => isset( $post_data['dokan_store_time_enabled'] ) && 'yes' == $post_data['dokan_store_time_enabled'] ? 'yes' : 'no',
                'dokan_store_open_notice'  => isset( $post_data['dokan_store_open_notice'] ) ? sanitize_textarea_field( $post_data['dokan_store_open_notice'] ) : '',
                'dokan_store_close_notice' => isset( $post_data['dokan_store_close_notice'] ) ? sanitize_textarea_field( $post_data['dokan_store_close_notice'] ) : '',
            ];

            update_user_meta( $store_id, 'dokan_store_name', $dokan_settings['store_name'] );

        } elseif ( wp_verify_nonce( sanitize_key( $post_data['_wpnonce'] ), 'dokan_payment_settings_nonce' ) ) {

            //update payment settings info
            $dokan_settings = array(
                'payment' => $prev_dokan_settings['payment'],
            );

            if ( isset( $post_data['settings']['bank'] ) ) {
                $bank = $post_data['settings']['bank'];

                $dokan_settings['payment']['bank'] = [
                    'ac_name'        => sanitize_text_field( $bank['ac_name'] ),
                    'ac_number'      => sanitize_text_field( $bank['ac_number'] ),
                    'bank_name'      => sanitize_text_field( $bank['bank_name'] ),
                    'bank_addr'      => sanitize_text_field( $bank['bank_addr'] ),
                    'routing_number' => sanitize_text_field( $bank['routing_number'] ),
                    'iban'           => sanitize_text_field( $bank['iban'] ),
                    'swift'          => sanitize_text_field( $bank['swift'] ),
                    'ac_type'        => sanitize_text_field( $bank['ac_type'] ),
                    'declaration'    => sanitize_text_field( $bank['declaration'] ),
                ];
            }

            if ( isset( $post_data['settings']['paypal']['email'] ) ) {
                $dokan_settings['payment']['paypal'] = [
                    'email' => sanitize_email( $post_data['settings']['paypal']['email'] ),
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
    function get_dokan_categories() {
        $dokan_category = array(
            'book'       => __( 'Book', 'dokan-lite' ),
            'dress'      => __( 'Dress', 'dokan-lite' ),
            'electronic' => __( 'Electronic', 'dokan-lite' ),
        );

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
        $heading = apply_filters( "dokan_withdraw_method_settings_title", $heading, $slug );

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
                $required_fields = [ 'ac_name', 'ac_number', 'routing_number', 'ac_type', 'declaration' ];
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
        if ( ! empty( $payment_settings ) && is_array( $payment_settings ) ) {
            $is_connected = true;

            foreach ( $payment_settings as $field => $value ) {
                if ( ! in_array( $field, $required_fields, true ) ) {
                    continue;
                }

                if ( empty( $value ) || ( 'email' === $field && ! is_email( $value ) ) ) {
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
                $methods[ $method_key ] = $cur_method;
            }
        }

        return $methods;
    }
}
