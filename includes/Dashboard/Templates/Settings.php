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
        add_filter( 'dokan_vendor_rest_settings', array( $this, 'add_vendor_store_settings' ), 10 );
        add_filter( 'dokan_vendor_rest_payment_settings', array( $this, 'add_paypal_payment_settings' ), 10 );
        add_filter( 'dokan_vendor_rest_payment_settings', array( $this, 'add_bank_payment_settings' ), 10 );
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
        } elseif ( isset( $wp->query_vars['settings'] ) && $wp->query_vars['settings'] == 'payment' ) {
            $heading = __( 'Payment Settings', 'dokan-lite' );
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

        if ( isset( $wp->query_vars['settings'] ) && 'payment' == $wp->query_vars['settings'] ) {
            if ( ! current_user_can( 'dokan_view_store_payment_menu' ) ) {
                dokan_get_template_part('global/dokan-error', '', array(
                    'deleted' => false,
                    'message' => __( 'You have no permission to view this page', 'dokan-lite' )
                ) );
            } else {
                $this->load_payment_content();
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
     * @return void
     */
    public function load_payment_content() {
        $methods      = dokan_withdraw_get_active_methods();
        $currentuser  = dokan_get_current_user_id();
        $profile_info = dokan_get_store_info( dokan_get_current_user_id() );

        dokan_get_template_part( 'settings/payment', '', array(
            'methods'      => $methods,
            'current_user' => $currentuser,
            'profile_info' => $profile_info,
        ) );
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

                $ajax_validate = $this->payment_validate();
                break;
        }

        if ( is_wp_error( $ajax_validate ) ) {
            wp_send_json_error( $ajax_validate->get_error_message() );
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
                'phone'                    => sanitize_text_field( $post_data['setting_phone'] ),
                'show_email'               => sanitize_text_field( $post_data['setting_show_email'] ),
                'show_more_ptab'           => sanitize_text_field( $post_data['setting_show_more_ptab'] ),
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
            $dokan_settings = [
                'payment' => [],
            ];

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
                ];
            }

            if ( isset( $post_data['settings']['paypal'] ) ) {
                $dokan_settings['payment']['paypal'] = [
                    'email' => sanitize_email( $post_data['settings']['paypal']['email'] ),
                ];
            }

            if ( isset( $post_data['settings']['skrill'] ) ) {
                $dokan_settings['payment']['skrill'] = [
                    'email' => sanitize_email( $post_data['settings']['skrill']['email'] ),
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
     * Add Store Settings for Dokan Seller
     *
     * @param array $settings
     *
     * @return array
     */
    public function add_vendor_store_settings( $settings ) {
        $settings[] = array(
            'id'     => 'general',
            'title'  => __( 'General', 'dokan-lite' ),
            'desc'   => __( 'The general store settings.', 'dokan-lite' ),
            'icon'   => '<i class="fa fa-shopping-cart"></i>',
            'info'   => [],
            'type'   => 'tab',
            'parent_id' => 'store',
        );
        $settings[] = array(
            'id'     => 'branding',
            'title'  => __( 'Branding', 'dokan-lite' ),
            'desc'   => __( 'Branding your store.', 'dokan-lite' ),
            'info'   => [],
            'icon'   => '<i class="fa fa-shopping-cart"></i>',
            'type'   => 'card',
            'parent_id' => 'store',
            'tab'    => 'general',
            'editable' => false,
        );
        $settings[] = array(
            'id'      => 'banner',
            'title'   => __( 'Store Banner', 'dokan-lite' ),
            'desc'    => __( 'Upload a banner for your store. Ideal size is 1000x180px', 'dokan-lite' ),
            'icon'    => '<i class="fa fa-picture-o"></i>',
            'type'    => 'image',
            'parent_id'  => 'store',
            'tab'     => 'general',
            'card'    => 'branding',
        );
        $settings[]   = array(
            'id'      => 'gravatar',
            'title'   => __( 'Store Gravatar', 'dokan-lite' ),
            'desc'    => __( 'Upload a profile image for your store', 'dokan-lite' ),
            'icon'    => '<i class="fa fa-picture-o"></i>',
            'type'    => 'image',
            'parent_id'  => 'store',
            'tab'     => 'general',
            'card'    => 'branding',
        );
        $settings[]         = array(
            'id'      => 'banner_id',
            'title'   => __( 'Banner Image', 'dokan-lite' ),
            'desc'    => __( 'Store Banner Image ID', 'dokan-lite' ),
            'icon'    => '',
            'type'    => 'image',
            'parent_id'  => 'store',
            'tab'     => 'general',
            'card'    => 'branding',
        );
        $settings[]         = array(
            'id'      => 'gravatar_id',
            'title'   => __( 'Profile Image', 'dokan-lite' ),
            'desc'    => __( 'Store Profile Image ID', 'dokan-lite' ),
            'icon'    => '',
            'type'    => 'image',
            'parent_id'  => 'store',
            'tab'     => 'general',
            'card'    => 'branding',
        );

        $settings[] = array(
            'id'     => 'business_info',
            'title'  => __( 'Business Info', 'dokan-lite' ),
            'desc'   => __( 'Lorem Ipsum is simply dummy text', 'dokan-lite' ),
            'info'   => [
                [
                    'text' => __( 'Docs', 'dokan-lite' ),
                    'url'  => '#',
                    'icon' => '<i class="fa fa-external-link"></i>',
                ],
                [
                    'text' => __( 'Video Guide', 'dokan-lite' ),
                    'url'  => '#',
                    'icon' => '<i class="fa fa-video"></i>',
                ],
            ],
            'icon'   => '<i class="fa fa-shopping-cart"></i>',
            'type'   => 'card',
            'parent_id' => 'store',
            'tab'    => 'general',
        );
        $settings[] = array(
            'id'     => 'store_name',
            'title'  => __( 'Store Name', 'dokan-lite' ),
            'desc'   => __( 'The name of your store.', 'dokan-lite' ),
            'icon'   => '<i class="fa fa-shopping-cart"></i>',
            'type'   => 'text',
            'parent_id' => 'store',
            'tab'    => 'general',
            'card'   => 'business_info',
        );
        $settings[] = array(
            'id'     => 'store_details',
            'title'  => __( 'Store Details', 'dokan-lite' ),
            'desc'   => __( 'The store details settings.', 'dokan-lite' ),
            'icon'   => '<i class="fa fa-shopping-cart"></i>',
            'info'   => [],
            'type'   => 'tab',
            'parent_id' => 'store',
        );
        $settings[] = array(
            'id'     => 'location_contact',
            'title'  => __( 'Location and Contact details', 'dokan-lite' ),
            'desc'   => __( 'Put Company name & ID/EUID', 'dokan-lite' ),
            'info'   => [],
            'icon'   => '<i class="fa fa-shopping-cart"></i>',
            'type'   => 'card',
            'parent_id' => 'store',
            'tab'    => 'store_details',
            'editable' => false,
        );
        $settings[]      = array(
            'id'     => 'phone',
            'title'  => __( 'Phone', 'dokan-lite' ),
            'desc'   => __( 'Enter your store phone', 'dokan-lite' ),
            'icon'   => '<i class="fa fa-mobile"></i>',
            'type'   => 'text',
            'parent_id' => 'store',
            'tab'    => 'store_details',
            'card'   => 'location_contact',
        );
        $settings[]    = array(
            'id'     => 'address',
            'title'  => __( 'Address', 'dokan-lite' ),
            'desc'   => __( 'Your store address', 'dokan-lite' ),
            'icon'   => '<i class="fa fa-map-marker"></i>',
            'type'   => 'section',
            'parent_id' => 'store',
            'tab'    => 'store_details',
            'card'   => 'location_contact',
            'editable' => true,
            'fields' => array(
                array(
                    'id'     => 'street_1',
                    'title'  => __( 'Street', 'dokan-lite' ),
                    'desc'   => __( 'Street address', 'dokan-lite' ),
                    'icon'   => '',
                    'type'   => 'text',
                    'parent_id' => 'address',
                ),
                array(
                    'id'     => 'street_2',
                    'title'  => __( 'Street Line 2', 'dokan-lite' ),
                    'desc'   => __( 'Street address continued', 'dokan-lite' ),
                    'icon'   => '',
                    'type'   => 'text',
                    'parent_id' => 'address',
                ),
                array(
                    'id'     => 'city',
                    'title'  => __( 'City', 'dokan-lite' ),
                    'desc'   => __( 'City name', 'dokan-lite' ),
                    'icon'   => '',
                    'type'   => 'text',
                    'parent_id' => 'address',
                ),
                array(
                    'id'     => 'zip',
                    'title'  => __( 'Zip Code', 'dokan-lite' ),
                    'desc'   => __( 'Zip code', 'dokan-lite' ),
                    'icon'   => '',
                    'type'   => 'text',
                    'parent_id' => 'address',
                ),
                array(
                    'id'      => 'country',
                    'title'   => __( 'Country', 'dokan-lite' ),
                    'desc'    => __( 'Select your country', 'dokan-lite' ),
                    'icon'    => '',
                    'type'    => 'select',
                    'options' => array( '' => __( 'Select a country&hellip;', 'dokan-lite' ) ) + WC()->countries->get_allowed_countries(),
                    'parent_id'  => 'address',
                ),
                array(
                    'id'      => 'state',
                    'title'   => __( 'State', 'dokan-lite' ),
                    'desc'    => __( 'State or state code', 'dokan-lite' ),
                    'icon'    => '',
                    'type'    => 'select', // TODO: Add correct dropdown options for states
                    'options' => array( '' => __( 'Select a state&hellip;', 'dokan-lite' ) ) + WC()->countries->get_allowed_country_states(),
                    'parent_id'  => 'address',
                ),
            ),
        );
        $settings[]      = array(
            'id'      => 'location',
            'title'   => __( 'Store Location', 'dokan-lite' ),
            'desc'    => __( 'Store Location GPS coordinate.', 'dokan-lite' ),
            'icon'    => '<i class="fa fa-map-marked"></i>',
            'type'    => 'text',
            'parent_id'  => 'store',
            'tab'    => 'store_details',
            'card'   => 'location_contact',
        );
        $settings[]         = array(
            'id'      => 'find_address',
            'title'   => __( 'Store Address', 'dokan-lite' ),
            'desc'    => __( 'Store Address', 'dokan-lite' ),
            'icon'    => '<i class="fa fa-map"></i>',
            'type'    => 'text',
            'parent_id'  => 'store',
            'tab'    => 'store_details',
            'card'   => 'location_contact',
        );

        $settings[] = array(
            'id'     => 'store_weekly_timing',
            'title'  => __( 'Store Weekly Timing', 'dokan-lite' ),
            'desc'   => __( 'Set your convenient time according to business needs.', 'dokan-lite' ),
            'info'   => [],
            'icon'   => '<i class="fa fa-shopping-cart"></i>',
            'type'   => 'card',
            'parent_id' => 'store',
            'tab'    => 'store_details',
            'editable' => false,
        );

        $settings[]         = array(
            'id'      => 'dokan_store_time_enabled',
            'title'   => __( 'Enable Store Time', 'dokan-lite' ),
            'desc'    => __( 'Enable Store Time', 'dokan-lite' ),
            'icon'    => '',
            'type'    => 'checkbox',
            'default' => 'yes',
            'options' => array(
                'yes' => __( 'Yes', 'dokan-lite' ),
                'no'  => __( 'No', 'dokan-lite' ),
            ),
            'parent_id'  => 'store',
            'tab'    => 'store_details',
            'card'   => 'store_weekly_timing',
        );
        $settings[]    = array(
            'id'     => 'dokan_store_time',
            'title'  => __( 'Store Operation Time', 'dokan-lite' ),
            'desc'   => __( 'Your store operation time', 'dokan-lite' ),
            'icon'   => '',
            'type'   => 'section',
            'parent_id' => 'store',
            'tab'    => 'store_details',
            'card'   => 'store_weekly_timing',
            'fields' => array(
                array(
                    'id'     => 'monday',
                    'title'  => __( 'Monday', 'dokan-lite' ),
                    'desc'   => __( 'Monday Schedule', 'dokan-lite' ),
                    'icon'   => '',
                    'type'   => 'custom',
                    'parent_id' => 'dokan_store_time',
                ),
                array(
                    'id'     => 'tuesday',
                    'title'  => __( 'Tuesday', 'dokan-lite' ),
                    'desc'   => __( 'Tuesday Schedule', 'dokan-lite' ),
                    'icon'   => '',
                    'type'   => 'custom',
                    'parent_id' => 'dokan_store_time',
                ),
                array(
                    'id'     => 'wednesday',
                    'title'  => __( 'Wednesday', 'dokan-lite' ),
                    'desc'   => __( 'Wednesday Schedule', 'dokan-lite' ),
                    'icon'   => '',
                    'type'   => 'custom',
                    'parent_id' => 'dokan_store_time',
                ),
                array(
                    'id'     => 'thursday',
                    'title'  => __( 'Thursday', 'dokan-lite' ),
                    'desc'   => __( 'Thursday Schedule', 'dokan-lite' ),
                    'icon'   => '',
                    'type'   => 'custom',
                    'parent_id' => 'dokan_store_time',
                ),
                array(
                    'id'     => 'friday',
                    'title'  => __( 'Friday', 'dokan-lite' ),
                    'desc'   => __( 'Friday Schedule', 'dokan-lite' ),
                    'icon'   => '',
                    'type'   => 'custom',
                    'parent_id' => 'dokan_store_time',
                ),
                array(
                    'id'     => 'saturday',
                    'title'  => __( 'Saturday', 'dokan-lite' ),
                    'desc'   => __( 'Saturday Schedule', 'dokan-lite' ),
                    'icon'   => '',
                    'type'   => 'custom',
                    'parent_id' => 'dokan_store_time',
                ),
                array(
                    'id'     => 'sunday',
                    'title'  => __( 'Sunday', 'dokan-lite' ),
                    'desc'   => __( 'Sunday Schedule', 'dokan-lite' ),
                    'icon'   => '',
                    'type'   => 'custom',
                    'parent_id' => 'dokan_store_time',
                ),
            ),
        );
        $settings[]         = array(
            'id'      => 'dokan_store_open_notice',
            'title'   => __( 'Store Open Notice', 'dokan-lite' ),
            'desc'    => __( 'Store Open Notice Message', 'dokan-lite' ),
            'icon'    => '',
            'type'    => 'text',
            'parent_id'  => 'store',
            'tab'    => 'store_details',
            'card'   => 'store_weekly_timing',
        );
        $settings[]         = array(
            'id'      => 'dokan_store_close_notice',
            'title'   => __( 'Store Close Notice', 'dokan-lite' ),
            'desc'    => __( 'Store Close Notice Message', 'dokan-lite' ),
            'icon'    => '',
            'type'    => 'text',
            'parent_id'  => 'store',
            'tab'    => 'store_details',
            'card'   => 'store_weekly_timing',
        );


        $settings[] = array(
            'id'     => 'advanced',
            'title'  => __( 'Advanced', 'dokan-lite' ),
            'desc'   => __( 'The advanced store settings.', 'dokan-lite' ),
            'icon'   => '<i class="fa fa-shopping-cart"></i>',
            'info'   => [],
            'type'   => 'tab',
            'parent_id' => 'store',
        );
        $settings[] = array(
            'id'     => 'product_display',
            'title'  => __( 'Product Display', 'dokan-lite' ),
            'desc'   => __( 'Put Company name & ID/EUID', 'dokan-lite' ),
            'info'   => [],
            'icon'   => '<i class="fa fa-shopping-cart"></i>',
            'type'   => 'card',
            'parent_id' => 'store',
            'tab'    => 'advanced',
            'editable' => false,
        );
        $settings[]         = array(
            'id'      => 'show_more_ptab',
            'title'   => __( 'Show More Product tab', 'dokan-lite' ),
            'desc'    => __( 'Show More Product tab', 'dokan-lite' ),
            'icon'    => '',
            'type'    => 'checkbox',
            'default' => 'yes',
            'options' => array(
                'yes' => __( 'Yes', 'dokan-lite' ),
                'no'  => __( 'No', 'dokan-lite' ),
            ),
            'parent_id'  => 'store',
            'tab'    => 'advanced',
            'card'   => 'product_display',
        );
        $settings[] = array(
            'id'      => 'show_email',
            'title'   => __( 'Show Email', 'dokan-lite' ),
            'desc'    => __( 'Do you want to display the store email publicly?', 'dokan-lite' ),
            'icon'    => '<i class="fa fa-envelope-o"></i>',
            'type'    => 'checkbox',
            'default' => 'no',
            'options' => array(
                'yes' => __( 'Yes', 'dokan-lite' ),
                'no'  => __( 'No', 'dokan-lite' ),
            ),
            'parent_id'  => 'store',
            'tab'    => 'advanced',
            'card'   => 'product_display',
        );
        $settings[]         = array(
            'id'      => 'store_ppp',
            'title'   => __( 'Product Per Page', 'dokan-lite' ),
            'desc'    => __( 'Store Product Per Page', 'dokan-lite' ),
            'icon'    => '',
            'type'    => 'number',
            'default' => 20,
            'parent_id'  => 'store',
            'tab'    => 'advanced',
            'card'   => 'product_display',
        );
        $settings[] = array(
            'id'     => 'terms_and_conditions',
            'title'  => __( 'Terms and Conditions', 'dokan-lite' ),
            'desc'   => __( 'Seller can close his store by giving a message to customer. ', 'dokan-lite' ),
            'info'   => [],
            'icon'   => '<i class="fa fa-shopping-cart"></i>',
            'type'   => 'card',
            'parent_id' => 'store',
            'tab'    => 'advanced',
            'editable' => true,
        );
        $settings[]         = array(
            'id'      => 'enable_tnc',
            'title'   => __( 'Display Terms & Condition', 'dokan-lite' ),
            'desc'    => __( 'Enable Store Terms & Condition', 'dokan-lite' ),
            'icon'    => '',
            'type'    => 'checkbox',
            'default' => 'yes',
            'options' => array(
                'on' => __( 'On', 'dokan-lite' ),
                'off'  => __( 'Off', 'dokan-lite' ),
            ),
            'parent_id'  => 'store',
            'tab'    => 'advanced',
            'card'   => 'terms_and_conditions',
        );

        return $settings;
    }

    /**
     * Add paypal Settings for Dokan Seller
     *
     * @param array $settings
     *
     * @return array
     */
    public function add_paypal_payment_settings( $settings ) {
        $settings[] = array(
            'id'     => 'paypal_card',
            'title'  => __( 'Paypal', 'dokan-lite' ),
            'desc'   => __( 'Paypal settings.', 'dokan-lite' ),
            'info'   => [],
            'icon'   => '<i class="fa fa-paypal"></i>',
            'type'   => 'card',
            'parent_id' => 'payment',
            'tab'    => 'general',
            'editable' => true,
        );
        $settings[] = array(
            'id' => 'paypal',
            'title' => __( 'PayPal', 'dokan-lite' ),
            'desc' => __( 'Paypal settings', 'dokan-lite' ),
            'icon'  => '<i class="fa fa-paypal"></i>',
            'type' => 'section',
            'parent_id' => 'payment',
            'tab' => 'general',
            'editable' => true,
            'card' => 'paypal_card',
            'fields' => array(
                array(
                    'id' => 'email',
                    'title' => __( 'Email', 'dokan-lite' ),
                    'desc' => __( 'Enter your paypal email address', 'dokan-lite' ),
                    'icon'  => '<i class="fa fa-email"></i>',
                    'type' => 'email',
                    'parent_id' => 'paypal',
                ),
            ),
        );

        return $settings;
    }

    /**
     * Add bank Settings for Dokan Seller
     *
     * @param array $settings
     *
     * @return array
     */
    public function add_bank_payment_settings( $settings ) {
        $settings[] = array(
            'id'     => 'bank_card',
            'title'  => __( 'Bank', 'dokan-lite' ),
            'desc'   => __( 'Bank settings.', 'dokan-lite' ),
            'info'   => [],
            'icon'   => '<i class="fa fa-paypal"></i>',
            'type'   => 'card',
            'parent_id' => 'payment',
            'tab'    => 'general',
            'editable' => true,
        );
        $settings[] = array(
            'id'        => 'bank',
            'title'     => __( 'Bank', 'dokan-lite' ),
            'desc'      => __( 'Bank settings', 'dokan-lite' ),
            'icon'      => '<i class="fa fa-bank"></i>',
            'type'      => 'section',
            'parent_id' => 'payment',
            'tab'       => 'general',
            'editable'  => true,
            'card'      => 'bank_card',
            'fields'    => array(
                array(
                    'id'        => 'ac_name',
                    'title'     => __( 'Account Name', 'dokan-lite' ),
                    'desc'      => __( 'Enter your bank account name.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'bank',
                ),
                array(
                    'id'        => 'ac_number',
                    'title'     => __( 'Account Number', 'dokan-lite' ),
                    'desc'      => __( 'Enter your bank account number.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'bank',
                ),
                array(
                    'id'        => 'bank_name',
                    'title'     => __( 'Bank Name', 'dokan-lite' ),
                    'desc'      => __( 'Enter your bank name.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'bank',
                ),
                array(
                    'id'        => 'bank_addr',
                    'title'     => __( 'Bank Address', 'dokan-lite' ),
                    'desc'      => __( 'Enter your bank address.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'textarea',
                    'parent_id' => 'bank',
                ),
                array(
                    'id'        => 'routing_number',
                    'title'     => __( 'Routing Number', 'dokan-lite' ),
                    'desc'      => __( 'Enter your bank routing number.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'bank',
                ),
                array(
                    'id'        => 'iban',
                    'title'     => __( 'IBAN', 'dokan-lite' ),
                    'desc'      => __( 'Enter your IBAN number.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'bank',
                ),
                array(
                    'id'        => 'swift',
                    'title'     => __( 'Swift Code', 'dokan-lite' ),
                    'desc'      => __( 'Enter your banks Swift Code.', 'dokan-lite' ),
                    'icon'      => '',
                    'type'      => 'text',
                    'parent_id' => 'bank',
                ),
            ),
        );

        return $settings;
    }
}
