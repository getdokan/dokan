<?php
/**
 * Dokan settings Class
 *
 * @author weDves
 */
class Dokan_Template_Settings {

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
     * Initializes the Dokan_Template_Settings() class
     *
     * Checks for an existing WeDevs_Dokan_Template_Settings() instance
     * and if it doesn't find one, creates it.
     */
    public static function init() {
        static $instance = false;

        if ( ! $instance ) {
            $instance = new Dokan_Template_Settings();
        }

        return $instance;
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

        if ( isset( $wp->query_vars['settings'] ) && $wp->query_vars['settings'] == 'store' ) {
            $heading = __( 'Settings', 'dokan-lite' );
        } elseif ( isset( $wp->query_vars['settings'] ) && $wp->query_vars['settings'] == 'payment' ) {
            $heading = __( 'Payment Settings', 'dokan-lite' );
        } else {
            $heading = apply_filters( 'dokan_dashboard_settings_heading_title', __( 'Settings', 'dokan-lite' ), $wp->query_vars['settings'] );
        }

        dokan_get_template_part( 'settings/header', '', array( 'heading' => $heading ) );
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

        $post_data = wp_unslash( $_POST );

        $post_data['dokan_update_profile'] = '';

        switch ( $post_data['form_id'] ) { // WPCS: CSRF ok.
            case 'profile-form':
                if ( ! current_user_can( 'dokan_view_store_social_menu' ) ) {
                    wp_send_json_error( __( 'Pemission denied social', 'dokan-lite' ) );
                }

                if ( ! wp_verify_nonce( $post_data['_wpnonce'], 'dokan_profile_settings_nonce' ) ) {
                    wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
                }

                $ajax_validate = $this->profile_validate();
                break;

            case 'store-form':
                if ( ! current_user_can( 'dokan_view_store_settings_menu' ) ) {
                    wp_send_json_error( __( 'Pemission denied', 'dokan-lite' ) );
                }

                if ( ! wp_verify_nonce( $post_data['_wpnonce'], 'dokan_store_settings_nonce' ) ) {
                    wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
                }

                $ajax_validate = $this->store_validate();
                break;

            case 'payment-form':
                if ( ! current_user_can( 'dokan_view_store_payment_menu' ) ) {
                    wp_send_json_error( __( 'Pemission denied', 'dokan-lite' ) );
                }

                if ( ! wp_verify_nonce( $post_data['_wpnonce'], 'dokan_payment_settings_nonce' ) ) {
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

        if ( ! wp_verify_nonce( $post_data['_wpnonce'], 'dokan_settings_nonce' ) ) {
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

        if ( ! wp_verify_nonce( $post_data['_wpnonce'], 'dokan_profile_settings_nonce' ) ) {
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

        if ( ! wp_verify_nonce( $post_data['_wpnonce'], 'dokan_store_settings_nonce' ) ) {
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

        if ( ! wp_verify_nonce( $post_data['_wpnonce'], 'dokan_payment_settings_nonce' ) ) {
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
        $prev_dokan_settings     = ! empty( $existing_dokan_settings ) ? $existing_dokan_settings : array();
        $post_data               = wp_unslash( $_POST );

        if ( wp_verify_nonce( $post_data['_wpnonce'], 'dokan_profile_settings_nonce' ) ) {

            // update profile settings info
            $social         = $post_data['settings']['social'];
            $social_fields  = dokan_get_social_profile_fields();
            $dokan_settings = array( 'social' => array() );

            if ( is_array( $social ) ) {
                foreach ( $social as $key => $value ) {
                    if ( isset( $social_fields[ $key ] ) ) {
                        $dokan_settings['social'][ $key ] = esc_url_raw( $social[ $key ] );
                    }
                }
            }

        } elseif ( wp_verify_nonce( $post_data['_wpnonce'], 'dokan_store_settings_nonce' ) ) {

            // update store setttings info
            $dokan_settings = array(
                'store_name'               => sanitize_text_field( $post_data['dokan_store_name'] ),
                'store_ppp'                => absint( $post_data['dokan_store_ppp'] ),
                'address'                  => isset( $post_data['dokan_address'] ) ? array_map( 'sanitize_text_field', $post_data['dokan_address'] ) : $prev_dokan_settings['address'],
                'location'                 => sanitize_text_field( $post_data['location'] ),
                'find_address'             => sanitize_text_field( $post_data['find_address'] ),
                'banner_id'                => isset( $post_data['dokan_banner'] ) ? absint( $post_data['dokan_banner'] ) : 0,
                'phone'                    => sanitize_text_field( $post_data['setting_phone'] ),
                'show_email'               => sanitize_text_field( $post_data['setting_show_email'] ),
                'show_more_ptab'           => sanitize_text_field( $post_data['setting_show_more_ptab'] ),
                'gravatar_id'              => isset( $post_data['dokan_gravatar'] ) ? absint( $post_data['dokan_gravatar'] ) : 0,
                'enable_tnc'               => isset( $post_data['dokan_store_tnc_enable'] ) && 'on' == $post_data['dokan_store_tnc_enable'] ? 'on' : 'off',
                'store_tnc'                => isset( $post_data['dokan_store_tnc'] ) ? wp_kses_post( $post_data['dokan_store_tnc'] ) : '',
                'dokan_store_time'         => array(
                    'sunday'               => array(
                        'status'           => isset( $post_data['sunday_on_off'] ) && 'open' == $post_data['sunday_on_off'] ? 'open' : 'close',
                        'opening_time'     => isset( $post_data['sunday_opening_time'] ) ? sanitize_text_field( $post_data['sunday_opening_time'] ) : '',
                        'closing_time'     => isset( $post_data['sunday_closing_time'] ) ? sanitize_text_field( $post_data['sunday_closing_time'] ) : '',
                    ),
                    'monday'               => array(
                        'status'           => isset( $post_data['monday_on_off'] ) && 'open' == $post_data['monday_on_off'] ? 'open' : 'close',
                        'opening_time'     => isset( $post_data['monday_opening_time'] ) ? sanitize_text_field( $post_data['monday_opening_time'] ) : '',
                        'closing_time'     => isset( $post_data['monday_closing_time'] ) ? sanitize_text_field( $post_data['monday_closing_time'] ) : '',
                    ),
                    'tuesday'              => array(
                        'status'           => isset( $post_data['tuesday_on_off'] ) && 'open' == $post_data['tuesday_on_off'] ? 'open' : 'close',
                        'opening_time'     => isset( $post_data['tuesday_opening_time'] ) ? sanitize_text_field( $post_data['tuesday_opening_time'] ) : '',
                        'closing_time'     => isset( $post_data['tuesday_closing_time'] ) ? sanitize_text_field( $post_data['tuesday_closing_time'] ) : '',
                    ),
                    'wednesday'            => array(
                        'status'           => isset( $post_data['wednesday_on_off'] ) && 'open' == $post_data['wednesday_on_off'] ? 'open' : 'close',
                        'opening_time'     => isset( $post_data['wednesday_opening_time'] ) ? sanitize_text_field( $post_data['wednesday_opening_time'] ) : '',
                        'closing_time'     => isset( $post_data['wednesday_closing_time'] ) ? sanitize_text_field( $post_data['wednesday_closing_time'] ) : '',
                    ),
                    'thursday'             => array(
                        'status'           => isset( $post_data['thursday_on_off'] ) && 'open' == $post_data['thursday_on_off'] ? 'open' : 'close',
                        'opening_time'     => isset( $post_data['thursday_opening_time'] ) ? sanitize_text_field( $post_data['thursday_opening_time'] ) : '',
                        'closing_time'     => isset( $post_data['thursday_closing_time'] ) ? sanitize_text_field( $post_data['thursday_closing_time'] ) : '',
                    ),
                    'friday'               => array(
                        'status'           => isset( $post_data['friday_on_off'] ) && 'open' == $post_data['friday_on_off'] ? 'open' : 'close',
                        'opening_time'     => isset( $post_data['friday_opening_time'] ) ? sanitize_text_field( $post_data['friday_opening_time'] ) : '',
                        'closing_time'     => isset( $post_data['friday_closing_time'] ) ? sanitize_text_field( $post_data['friday_closing_time'] ) : '',
                    ),
                    'saturday'             => array(
                        'status'           => isset( $post_data['saturday_on_off'] ) && 'open' == $post_data['saturday_on_off'] ? 'open' : 'close',
                        'opening_time'     => isset( $post_data['saturday_opening_time'] ) ? sanitize_text_field( $post_data['saturday_opening_time'] ) : '',
                        'closing_time'     => isset( $post_data['saturday_closing_time'] ) ? sanitize_text_field( $post_data['saturday_closing_time'] ) : '',
                    ),
                ),
                'dokan_store_time_enabled' => isset( $post_data['dokan_store_time_enabled'] ) && 'yes' == $post_data['dokan_store_time_enabled'] ? 'yes' : 'no',
                'dokan_store_open_notice'  => isset( $post_data['dokan_store_open_notice'] ) ? sanitize_textarea_field( $post_data['dokan_store_open_notice'] ) : '',
                'dokan_store_close_notice' => isset( $post_data['dokan_store_close_notice'] ) ? sanitize_textarea_field( $post_data['dokan_store_close_notice'] ) : '',
            );

            update_user_meta( $store_id, 'dokan_store_name', $dokan_settings['store_name'] );

        } elseif ( wp_verify_nonce( $post_data['_wpnonce'], 'dokan_payment_settings_nonce' ) ) {

            //update payment settings info
            $dokan_settings = array(
                'payment' => array(),
            );

            if ( isset( $post_data['settings']['bank'] ) ) {
                $bank = $post_data['settings']['bank'];

                $dokan_settings['payment']['bank'] = array(
                    'ac_name'        => sanitize_text_field( $bank['ac_name'] ),
                    'ac_number'      => sanitize_text_field( $bank['ac_number'] ),
                    'bank_name'      => sanitize_text_field( $bank['bank_name'] ),
                    'bank_addr'      => sanitize_text_field( $bank['bank_addr'] ),
                    'routing_number' => sanitize_text_field( $bank['routing_number'] ),
                    'iban'           => sanitize_text_field( $bank['iban'] ),
                    'swift'          => sanitize_text_field( $bank['swift'] ),
                );
            }

            if ( isset( $post_data['settings']['paypal'] ) ) {
                $dokan_settings['payment']['paypal'] = array(
                    'email' => sanitize_email( $post_data['settings']['paypal']['email'] ),
                );
            }

            if ( isset( $post_data['settings']['skrill'] ) ) {
                $dokan_settings['payment']['skrill'] = array(
                    'email' => sanitize_email( $post_data['settings']['skrill']['email'] ),
                );
            }
        }

        $dokan_settings = array_merge( $prev_dokan_settings, $dokan_settings );

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
}
