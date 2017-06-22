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

        if ( !$instance ) {
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
            echo dokan_seller_not_enabled_notice();
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
        $help_text ='';

        if ( isset( $wp->query_vars['settings'] ) && $wp->query_vars['settings'] == 'payment' ) {
            $help_text = __( 'These are the withdraw methods available for you. Please update your payment information below to submit withdraw requests and get your store payments seamlessly.', 'dokan-lite' );
        }

        if ( $help_text = apply_filters( 'dokan_dashboard_settings_helper_text', $help_text, $wp->query_vars['settings'] ) ) {

            dokan_get_template_part( 'global/dokan-help', '', array(
                'help_text' => $help_text
            ));
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
                <?php do_action( 'dokan_settings_load_ajax_response') ?>
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

            foreach( $messages as $message ) {
                dokan_get_template_part( 'global/dokan-error', '', array( 'message' => $message ) );
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

        if ( isset( $wp->query_vars['settings'] ) && $wp->query_vars['settings'] == 'store' ) {
            $this->load_store_content();
        }

        if ( isset( $wp->query_vars['settings'] ) && $wp->query_vars['settings'] == 'payment' ) {
            $this->load_payment_content();
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
        $validate = $this->validate();
        $currentuser = get_current_user_id();
        $profile_info = dokan_get_store_info( get_current_user_id() );

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
        $methods = dokan_withdraw_get_active_methods();
        $currentuser = get_current_user_id();
        $profile_info = dokan_get_store_info( get_current_user_id() );

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

        $_POST['dokan_update_profile'] = '';

        switch( $_POST['form_id'] ) {
            case 'profile-form':
                if ( !wp_verify_nonce( $_POST['_wpnonce'], 'dokan_profile_settings_nonce' ) ) {
                    wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
                }
                $ajax_validate =  $this->profile_validate();
                break;
            case 'store-form':
                if ( !wp_verify_nonce( $_POST['_wpnonce'], 'dokan_store_settings_nonce' ) ) {
                    wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
                }
                $ajax_validate =  $this->store_validate();
                break;
            case 'payment-form':
                if ( !wp_verify_nonce( $_POST['_wpnonce'], 'dokan_payment_settings_nonce' ) ) {
                    wp_send_json_error( __( 'Are you cheating?', 'dokan-lite' ) );
                }
                $ajax_validate =  $this->payment_validate();
                break;
        }

        if ( is_wp_error( $ajax_validate ) ) {
            wp_send_json_error( $ajax_validate->errors );
        }

        // we are good to go
        $save_data = $this->insert_settings_info();

        $success_msg = __( 'Your information has been saved successfully', 'dokan-lite' ) ;

        $data = apply_filters( 'dokan_ajax_settings_response', array(
            'msg'      => $success_msg,
        ) );

        wp_send_json_success( $data );
    }

    /**
     * Validate settings submission
     *
     * @return void
     */
    function validate() {

        if ( !isset( $_POST['dokan_update_profile'] ) ) {
            return false;
        }

        if ( !wp_verify_nonce( $_POST['_wpnonce'], 'dokan_settings_nonce' ) ) {
            wp_die( __( 'Are you cheating?', 'dokan-lite' ) );
        }

        $error = new WP_Error();

        $dokan_name = sanitize_text_field( $_POST['dokan_store_name'] );

        if ( empty( $dokan_name ) ) {
            $error->add( 'dokan_name', __( 'Store name required', 'dokan-lite' ) );
        }

        if ( isset( $_POST['setting_category'] ) ) {

            if ( !is_array( $_POST['setting_category'] ) || !count( $_POST['setting_category'] ) ) {
                $error->add( 'dokan_type', __( 'Store type required', 'dokan-lite' ) );
            }
        }

        if ( !empty( $_POST['setting_paypal_email'] ) ) {
            $email = filter_var( $_POST['setting_paypal_email'], FILTER_VALIDATE_EMAIL );
            if ( empty( $email ) ) {
                $error->add( 'dokan_email', __( 'Invalid email', 'dokan-lite' ) );
            }
        }

        /* Address Fields Validation */
        $required_fields  = array(
            'street_1',
            'city',
            'zip',
            'country',
        );
        if ( $_POST['dokan_address']['state'] != 'N/A' ) {
            $required_fields[] = 'state';
        }
        foreach ( $required_fields as $key ) {
            if ( empty( $_POST['dokan_address'][$key] ) ) {
                $code = 'dokan_address['.$key.']';
                $error->add( $code, sprintf( __('Address field for %s is required', 'dokan-lite'), $key ) );
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

        if ( !isset( $_POST['dokan_update_profile_settings'] ) ) {
            return false;
        }

        if ( !wp_verify_nonce( $_POST['_wpnonce'], 'dokan_profile_settings_nonce' ) ) {
            wp_die( __( 'Are you cheating?', 'dokan-lite' ) );
        }

        $error = new WP_Error();

        if ( isset( $_POST['setting_category'] ) ) {

            if ( !is_array( $_POST['setting_category'] ) || !count( $_POST['setting_category'] ) ) {
                $error->add( 'dokan_type', __( 'Store type required', 'dokan-lite' ) );
            }
        }

        if ( !empty( $_POST['setting_paypal_email'] ) ) {
            $email = filter_var( $_POST['setting_paypal_email'], FILTER_VALIDATE_EMAIL );

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

        if ( !isset( $_POST['dokan_update_store_settings'] ) ) {
            return false;
        }

        if ( !wp_verify_nonce( $_POST['_wpnonce'], 'dokan_store_settings_nonce' ) ) {
            wp_die( __( 'Are you cheating?', 'dokan-lite' ) );
        }

        $error = new WP_Error();

        $dokan_name = sanitize_text_field( $_POST['dokan_store_name'] );

        if ( empty( $dokan_name ) ) {
            $error->add( 'dokan_name', __( 'Store name required', 'dokan-lite' ) );
        }

        if ( isset( $_POST['setting_category'] ) ) {

            if ( !is_array( $_POST['setting_category'] ) || !count( $_POST['setting_category'] ) ) {
                $error->add( 'dokan_type', __( 'Store type required', 'dokan-lite' ) );
            }
        }

        if ( !empty( $_POST['setting_paypal_email'] ) ) {
            $email = filter_var( $_POST['setting_paypal_email'], FILTER_VALIDATE_EMAIL );
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

        if ( !isset( $_POST['dokan_update_payment_settings'] ) ) {
            return false;
        }

        if ( !wp_verify_nonce( $_POST['_wpnonce'], 'dokan_payment_settings_nonce' ) ) {
            wp_die( __( 'Are you cheating?', 'dokan-lite' ) );
        }

        $error = new WP_Error();


        if ( !empty( $_POST['setting_paypal_email'] ) ) {
            $email = filter_var( $_POST['setting_paypal_email'], FILTER_VALIDATE_EMAIL );
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

        $store_id                = get_current_user_id();
        $existing_dokan_settings = get_user_meta( $store_id, 'dokan_profile_settings', true );
        $prev_dokan_settings     = ! empty( $existing_dokan_settings ) ? $existing_dokan_settings : array();

        if ( wp_verify_nonce( $_POST['_wpnonce'], 'dokan_profile_settings_nonce' ) ) {

            // update profile settings info
            $social         = $_POST['settings']['social'];
            $social_fields  = dokan_get_social_profile_fields();
            $dokan_settings = array( 'social' => array() );

            if ( is_array( $social ) ) {
                foreach ($social as $key => $value) {
                    if ( isset( $social_fields[ $key ] ) ) {
                        $dokan_settings['social'][ $key ] = filter_var( $social[ $key ], FILTER_VALIDATE_URL );
                    }
                }
            }

        } elseif ( wp_verify_nonce( $_POST['_wpnonce'], 'dokan_store_settings_nonce' ) ) {

            //update store setttings info
            $dokan_settings = array(
                'store_name'                   => sanitize_text_field( $_POST['dokan_store_name'] ),
                'store_ppp'                    => absint( $_POST['dokan_store_ppp'] ),
                'address'                      => isset( $_POST['dokan_address'] ) ? $_POST['dokan_address'] : $prev_dokan_settings['address'],
                'location'                     => sanitize_text_field( $_POST['location'] ),
                'find_address'                 => sanitize_text_field( $_POST['find_address'] ),
                'banner'                       => isset( $_POST['dokan_banner'] ) ? absint( $_POST['dokan_banner'] ) : null,
                'phone'                        => sanitize_text_field( $_POST['setting_phone'] ),
                'show_email'                   => sanitize_text_field( $_POST['setting_show_email'] ),
                'show_more_ptab'               => sanitize_text_field( $_POST['setting_show_more_ptab'] ),
                'gravatar'                     => absint( $_POST['dokan_gravatar'] ),
                'enable_tnc'                   => isset( $_POST['dokan_store_tnc_enable'] ) ? $_POST['dokan_store_tnc_enable'] : '',
                'store_tnc'                    => isset( $_POST['dokan_store_tnc'] ) ? $_POST['dokan_store_tnc'] : ''
            );

        } elseif ( wp_verify_nonce( $_POST['_wpnonce'], 'dokan_payment_settings_nonce' ) ) {

            //update payment settings info
            $dokan_settings = array(
                'payment'      => array(),
            );

            if ( isset( $_POST['settings']['bank'] ) ) {
                $bank = $_POST['settings']['bank'];

                $dokan_settings['payment']['bank'] = array(
                    'ac_name'   => sanitize_text_field( $bank['ac_name'] ),
                    'ac_number' => sanitize_text_field( $bank['ac_number'] ),
                    'bank_name' => sanitize_text_field( $bank['bank_name'] ),
                    'bank_addr' => sanitize_text_field( $bank['bank_addr'] ),
                    'swift'     => sanitize_text_field( $bank['swift'] ),
                );
            }

            if ( isset( $_POST['settings']['paypal'] ) ) {
                $dokan_settings['payment']['paypal'] = array(
                    'email' => filter_var( $_POST['settings']['paypal']['email'], FILTER_VALIDATE_EMAIL )
                );
            }

            if ( isset( $_POST['settings']['skrill'] ) ) {
                $dokan_settings['payment']['skrill'] = array(
                    'email' => filter_var( $_POST['settings']['skrill']['email'], FILTER_VALIDATE_EMAIL )
                );
            }

        }

        $dokan_settings = array_merge( $prev_dokan_settings,$dokan_settings );

        $profile_completeness = $this->calculate_profile_completeness_value( $dokan_settings );
        $dokan_settings['profile_completion'] = $profile_completeness;

        update_user_meta( $store_id, 'dokan_profile_settings', $dokan_settings );
        update_user_meta( $store_id, 'dokan_store_name', $dokan_settings['store_name'] );

        do_action( 'dokan_store_profile_saved', $store_id, $dokan_settings );

        if ( ! defined( 'DOING_AJAX' ) ) {
            $_GET['message'] = 'profile_saved';
        }
    }

    /**
     * Calculate Profile Completeness meta value
     *
     * @since 2.1
     *
     * @param  array  $dokan_settings
     *
     * @return array
     */
    function calculate_profile_completeness_value( $dokan_settings ) {

        $profile_val = 0;
        $next_add    = '';
        $track_val   = array();

        $progress_values = array(
           'banner_val'          => 15,
           'profile_picture_val' => 15,
           'store_name_val'      => 10,
           'social_val'          => array(
               'fb'       => 2,
               'gplus'    => 2,
               'twitter'  => 2,
               'youtube'  => 2,
               'linkedin' => 2,
           ),
           'payment_method_val'  => 15,
           'phone_val'           => 10,
           'address_val'         => 10,
           'map_val'             => 15,
        );

        // setting values for completion
        $progress_values = apply_filters('dokan_profile_completion_values', $progress_values);

        extract( $progress_values );

        //settings wise completeness section
        if ( isset( $profile_picture_val ) && isset( $dokan_settings['gravatar'] ) ):
            if ( $dokan_settings['gravatar'] != 0 ) {
                $profile_val           = $profile_val + $profile_picture_val;
                $track_val['gravatar'] = $profile_picture_val;
            } else {
                if ( strlen( $next_add ) == 0 ) {
                    $next_add = sprintf(__( 'Add Profile Picture to gain %s%% progress', 'dokan-lite' ), $profile_picture_val);
                }
            }
        endif;

        // Calculate Social profiles
        if ( isset( $social_val ) && isset( $dokan_settings['social'] ) ):

            foreach ( $dokan_settings['social'] as $key => $value ) {

                if ( isset( $social_val[$key] ) && $value != false ) {
                    $profile_val     = $profile_val + $social_val[$key];
                    $track_val[$key] = $social_val[$key];
                }

                if ( isset( $social_val[$key] ) && $value == false ) {

                    if ( strlen( $next_add ) == 0 ) {
                        //replace keys to nice name
                        $nice_name = ( $key === 'fb' ) ? __( 'Facebook', 'dokan-lite' ) : ( ( $key === 'gplus' ) ? __( 'Google+', 'dokan-lite' ) : $key);
                        $next_add = sprintf( __( 'Add %s profile link to gain %s%% progress', 'dokan-lite' ), $nice_name, $social_val[$key] );
                    }
                }
            }
        endif;

        //calculate completeness for phone
        if ( isset( $phone_val ) && isset( $dokan_settings['phone'] ) ):

            if ( strlen( trim( $dokan_settings['phone'] ) ) != 0 ) {
                $profile_val        = $profile_val + $phone_val;
                $track_val['phone'] = $phone_val;
            } else {
                if ( strlen( $next_add ) == 0 ) {
                    $next_add = sprintf( __( 'Add Phone to gain %s%% progress', 'dokan-lite' ), $phone_val );
                }
            }

        endif;

        //calculate completeness for banner
        if ( isset( $banner_val ) && isset( $dokan_settings['banner'] ) ):

            if ( $dokan_settings['banner'] != 0 ) {
                $profile_val         = $profile_val + $banner_val;
                $track_val['banner'] = $banner_val;
            } else {
                $next_add = sprintf(__( 'Add Banner to gain %s%% progress', 'dokan-lite' ), $banner_val);
            }

        endif;

        //calculate completeness for store name
        if ( isset( $store_name_val ) && isset( $dokan_settings['store_name'] ) ):
            if ( isset( $dokan_settings['store_name'] ) ) {
                $profile_val             = $profile_val + $store_name_val;
                $track_val['store_name'] = $store_name_val;
            } else {
                if ( strlen( $next_add ) == 0 ) {
                    $next_add = sprintf( __( 'Add Store Name to gain %s%% progress', 'dokan-lite' ), $store_name_val );
                }
            }
        endif;

        //calculate completeness for address
        if ( isset( $address_val ) && isset( $dokan_settings['address'] ) ):
            if ( !empty($dokan_settings['address']['street_1']) ) {
                $profile_val          = $profile_val + $address_val;
                $track_val['address'] = $address_val;
            } else {
                if ( strlen( $next_add ) == 0 ) {
                    $next_add = sprintf(__( 'Add address to gain %s%% progress', 'dokan-lite' ),$address_val);
                }
            }
        endif;

        // Calculate Payment method val for Bank
        if ( isset( $dokan_settings['payment'] ) && isset( $dokan_settings['payment']['bank'] ) ) {
            $count_bank = true;

            // if any of the values for bank details are blank, check_bank will be set as false
            foreach ( $dokan_settings['payment']['bank'] as $value ) {
                if ( strlen( trim( $value )) == 0)   {
                    $count_bank = false;
                }
            }

            if ( $count_bank ) {
                $profile_val        = $profile_val + $payment_method_val;
                $track_val['Bank']  = $payment_method_val;
                $payment_method_val = 0;
                $payment_added      = 'true';
            }
        }

        // Calculate Payment method val for Paypal
        if ( isset( $dokan_settings['payment'] ) && isset( $dokan_settings['payment']['paypal'] ) ) {
            $p_email = isset($dokan_settings['payment']['paypal']['email']) ? $dokan_settings['payment']['paypal']['email'] : false;
            if ( $p_email != false ) {

                $profile_val         = $profile_val + $payment_method_val;
                $track_val['paypal'] = $payment_method_val;
                $payment_method_val  = 0;
            }
        }

        // Calculate Payment method val for skrill
        if ( isset( $dokan_settings['payment'] ) && isset( $dokan_settings['payment']['skrill'] ) ) {

            $s_email = isset( $dokan_settings['payment']['skrill']['email'] ) ? $dokan_settings['payment']['skrill']['email'] : false;
            if ( $s_email != false ) {
                $profile_val         = $profile_val + $payment_method_val;
                $track_val['skrill'] = $payment_method_val;
                $payment_method_val  = 0;
            }
        }

        // set message if no payment method found
        if ( strlen( $next_add ) == 0 && $payment_method_val !=0 ) {
            $next_add = sprintf( __( 'Add a Payment method to gain %s%% progress', 'dokan-lite' ), $payment_method_val );
        }

        if ( isset( $dokan_settings['location'] ) && strlen(trim($dokan_settings['location'])) != 0 ) {
            $profile_val           = $profile_val + $map_val;
            $track_val['location'] = $map_val;
        } else {
            if ( strlen( $next_add ) == 0 ) {
                $next_add = sprintf( __( 'Add Map location to gain %s%% progress', 'dokan-lite' ), $map_val );
            }
        }

        $track_val['next_todo'] = $next_add;
        $track_val['progress'] = $profile_val;
        
        return apply_filters( 'dokan_profile_completion_progress_value', $track_val ) ;
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
