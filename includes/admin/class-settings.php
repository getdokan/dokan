<?php

/**
* Admin Settings Class
*
* @package dokan
*
* @since 3.0.0
*/
class Dokan_Settings {

    /**
     * Load autometically when class initiate
     *
     * @since 1.0.0
     */
    public function __construct() {
        add_filter( 'dokan_admin_localize_script', array( $this, 'settings_localize_data' ), 10 );
        add_action( 'wp_ajax_dokan_get_setting_values', array( $this, 'get_settings_value' ), 10 );
        add_action( 'wp_ajax_dokan_save_settings', array( $this, 'save_settings_value' ), 10 );
    }

    /**
     * Get settings values
     *
     * @since 2.8.2
     *
     * @return void
     */
    public function get_settings_value() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( __( 'You have no permission to get settings value', 'dokan-lite' ) );
        }

        $_post_data = wp_unslash( $_POST );

        if ( ! wp_verify_nonce( sanitize_text_field( $_post_data['nonce'] ), 'dokan_admin' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan-lite' ) );
        }

        $settings = array();

        foreach ( $this->get_settings_sections() as $key => $section ) {
            $settings[$section['id']] = get_option( $section['id'], array() );
        }

        wp_send_json_success( $settings );
    }

    /**
     * Save settings value
     *
     * @since 2.8.2
     *
     * @return void
     */
    public function save_settings_value() {
        try {
            if ( ! current_user_can( 'manage_options' ) ) {
                throw new Exception( __( 'You are not authorized to perform this action.', 'dokan-lite' ), 401 );
            }

            $_post_data = wp_unslash( $_POST );
            if ( ! wp_verify_nonce( sanitize_text_field( $_post_data['nonce'] ), 'dokan_admin' ) ) {
                throw new Exception( __( 'Invalid nonce', 'dokan-lite' ), 403 );
            }

            $option_name = $_post_data['section'];

            if ( empty( $option_name ) ) {
                throw new Exception( __( 'Setting not saved properly', 'dokan-lite' ), 400 );
            }

            $option_value = $this->sanitize_options( $_post_data['settingsData'] );
            $option_value = apply_filters( 'dokan_save_settings_value', $option_value, $option_name );

            do_action( 'dokan_before_saving_settings', $option_name, $option_value );

            update_option( $option_name, $option_value );

            do_action( 'dokan_after_saving_settings', $option_name, $option_value );

            wp_send_json_success( array(
                'settings' => array(
                    'name'  => $option_name,
                    'value' => $option_value,
                ),
                'message' => __( 'Setting has been saved successfully.', 'dokan-lite' ),
            ) );

        } catch ( Exception $e ) {
            $error_code = $e->getCode() ? $e->getCode() : 422;

            wp_send_json_error( new WP_Error( 'error_saving_dokan_settings', $e->getMessage() ), $error_code );
        }
    }

    /**
     * Sanitize callback for Settings API
     *
     * @return mixed
     */
    function sanitize_options( $options ) {
        if ( ! $options ) {
            return $options;
        }

        foreach( $options as $option_slug => $option_value ) {
            $sanitize_callback = $this->get_sanitize_callback( $option_slug );

            // If callback is set, call it
            if ( $sanitize_callback ) {
                $options[ $option_slug ] = call_user_func( $sanitize_callback, $option_value );
                continue;
            }
        }

        return $options;
    }

    /**
     * Get sanitization callback for given option slug
     *
     * @param string $slug option slug
     *
     * @return mixed string or bool false
     */
    function get_sanitize_callback( $slug = '' ) {
        if ( empty( $slug ) ) {
            return false;
        }

        // Iterate over registered fields and see if we can find proper callback
        foreach( $this->get_settings_fields() as $section => $options ) {
            foreach ( $options as $option ) {
                if ( $option['name'] != $slug ) {
                    continue;
                }

                // Return the callback name
                return isset( $option['sanitize_callback'] ) && is_callable( $option['sanitize_callback'] ) ? $option['sanitize_callback'] : false;
            }
        }

        return false;
    }

    /**
     * Load settings sections and fields
     *
     * @since 2.8.2
     *
     * @return void
     */
    public function settings_localize_data( $data ) {
        $data['settings_sections'] = $this->get_settings_sections();

        $settings_fields = array();
        foreach ( $this->get_settings_fields() as $key => $section_fields ) {
            foreach ( $section_fields as $settings_key => $value ) {
                $settings_fields[$key][$value['name']] = $value;
            }
        }

        $data['settings_fields']   = $settings_fields;

        return $data;
    }

    /**
     * Get Post Type array
     *
     * @since 1.0
     *
     * @param  string $post_type
     *
     * @return array
     */
    public function get_post_type( $post_type ) {
        $pages_array = array( '-1' => __( '- select -', 'dokan-lite' ) );
        $pages       = get_posts( array('post_type' => $post_type, 'numberposts' => -1) );

        if ( $pages ) {
            foreach ($pages as $page) {
                $pages_array[$page->ID] = $page->post_title;
            }
        }

        return $pages_array;
    }


     /**
     * Get all settings Sections
     *
     * @since 1.0
     *
     * @return array
     */

    /**
     * Get setting sections
     *
     * @since 1.0.0
     *
     * @return array
     */
    function get_settings_sections() {
        $sections = array(
            array(
                'id'    => 'dokan_general',
                'title' => __( 'General', 'dokan-lite' ),
                'icon'  => 'dashicons-admin-generic'
            ),
            array(
                'id'    => 'dokan_selling',
                'title' => __( 'Selling Options', 'dokan-lite' ),
                'icon'  => 'dashicons-cart'
            ),
            array(
                'id'    => 'dokan_withdraw',
                'title' => __( 'Withdraw Options', 'dokan-lite' ),
                'icon'  => 'dashicons-money'
            ),
            array(
                'id'    => 'dokan_pages',
                'title' => __( 'Page Settings', 'dokan-lite' ),
                'icon'  => 'dashicons-admin-page'
            ),
            array(
                'id'    => 'dokan_appearance',
                'title' => __( 'Appearance', 'dokan-lite' ),
                'icon'  => 'dashicons-admin-appearance'
            ),
            array(
                'id'    => 'dokan_privacy',
                'title' => __( 'Privacy Policy', 'dokan-lite' ),
                'icon'  => 'dashicons-admin-network'
            )
        );

        return apply_filters( 'dokan_settings_sections', $sections );
    }

    /**
     * Returns all the settings fields
     *
     * @since 1.0.0
     *
     * @return array settings fields
     */
    function get_settings_fields() {
        $pages_array  = $this->get_post_type( 'page' );
        $slider_array = $this->get_post_type( 'dokan_slider' );

        $commission_types = array(
            'flat'       => __( 'Flat', 'dokan-lite' ),
            'percentage' => __( 'Percentage', 'dokan-lite' ),
        );

        $settings_fields = array(
            'dokan_general' => array(
                'admin_access' => array(
                    'name'    => 'admin_access',
                    'label'   => __( 'Admin area access', 'dokan-lite' ),
                    'desc'    => __( 'Disable Vendors and Customers from accessing the wp-admin dashboard area', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on'
                ),
                'custom_store_url' => array(
                    'name'    => 'custom_store_url',
                    'label'   => __( 'Vendor Store URL', 'dokan-lite' ),
                    'desc'    => sprintf( __( 'Define the seller store URL (%s<strong>[this-text]</strong>/[seller-name])', 'dokan-lite' ), site_url( '/' ) ),
                    'default' => 'store',
                    'type'    => 'text',
                ),
                'seller_enable_terms_and_conditions' => array(
                    'name'    => 'seller_enable_terms_and_conditions',
                    'label'   => __( 'Terms and Conditions', 'dokan-lite' ),
                    'desc'    => __( 'Enable Terms and Conditions for vendor stores', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'off'
                 ),
                'shipping_fee_recipient' => array(
                    'name'    => 'shipping_fee_recipient',
                    'label'   => __( 'Shipping Fee Recipient', 'dokan-lite' ),
                    'desc'    => __( 'Should Shipping fees go to the Vendor or the Admin?', 'dokan-lite' ),
                    'type'    => 'select',
                    'options' => array( 'seller' => __( 'Vendor', 'dokan-lite' ), 'admin' => __( 'Admin', 'dokan-lite' ) ),
                    'default' => 'seller'
                ),
                'tax_fee_recipient' => array(
                    'name'    => 'tax_fee_recipient',
                    'label'   => __( 'Tax Fee Recipient', 'dokan-lite' ),
                    'desc'    => __( 'Should Tax fees go to the Vendor or the Admin?', 'dokan-lite' ),
                    'type'    => 'select',
                    'options' => array( 'seller' => __( 'Vendor', 'dokan-lite' ), 'admin' => __( 'Admin', 'dokan-lite' ) ),
                    'default' => 'seller'
                ),
                'store_open_close'  => array(
                    'name'    => 'store_open_close',
                    'label'   => __( 'Store Opening Closing Time Widget', 'dokan-lite' ),
                    'desc'    => __( 'Enable store opening closing time widget in the store sidebar', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on'
                ),
                'store_map' => array(
                    'name'    => 'store_map',
                    'label'   => __( 'Show Map on Store Page', 'dokan-lite' ),
                    'desc'    => __( 'Enable a Google Map of the Store Location in the store sidebar', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on'
                ),
                'gmap_api_key' => array(
                    'name'  => 'gmap_api_key',
                    'label' => __( 'Google Map API Key', 'dokan-lite' ),
                    'desc'  => __( '<a href="https://developers.google.com/maps/documentation/javascript/" target="_blank">API Key</a> is needed to display map on store page', 'dokan-lite' ),
                    'type'  => 'text',
                ),
                'contact_seller' => array(
                    'name'    => 'contact_seller',
                    'label'   => __( 'Show Contact Form on Store Page', 'dokan-lite' ),
                    'desc'    => __( 'Enable Vendor Contact Form in the store sidebar', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on'
                ),
                'enable_theme_store_sidebar' => array(
                    'name'    => 'enable_theme_store_sidebar',
                    'label'   => __( 'Enable Store Sidebar From Theme', 'dokan-lite' ),
                    'desc'    => __( 'Enable showing Store Sidebar From Your Theme.', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'off'
                ),
            ),
            'dokan_selling' => array(
                'new_seller_enable_selling' => array(
                    'name'    => 'new_seller_enable_selling',
                    'label'   => __( 'New Vendor Product Upload', 'dokan-lite' ),
                    'desc'    => __( 'Allow newly registered vendors to add products', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on'
                ),
                'commission_type' => array(
                    'name'    => 'commission_type',
                    'label'   => __( 'Commission Type ', 'dokan-lite' ),
                    'desc'    => __( 'Select the commission type', 'dokan-lite' ),
                    'type'    => 'select',
                    'options' => $commission_types,
                    'default' => 'percentage'
                ),
                'admin_percentage' => array(
                    'name'    => 'admin_percentage',
                    'label'   => __( 'Admin Commission', 'dokan-lite' ),
                    'desc'    => __( 'Amount you get from sales', 'dokan-lite' ),
                    'default' => '10',
                    'type'    => 'number',
                    'min'     => '0',
                    'step'    => 'any',
                ),
                'order_status_change' => array(
                    'name'    => 'order_status_change',
                    'label'   => __( 'Order Status Change', 'dokan-lite' ),
                    'desc'    => __( 'Vendor can update order status', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on'
                ),
                'disable_product_popup' => array(
                    'name'    => 'disable_product_popup',
                    'label'   => __( 'Disable Product Popup', 'dokan-lite' ),
                    'desc'    => __( 'Disable add new product in popup view', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'off'
                ),
                'disable_welcome_wizard' => array(
                    'name'    => 'disable_welcome_wizard',
                    'label'   => __( 'Disable Welcome Wizard', 'dokan-lite' ),
                    'desc'    => __( 'Disable welcome wizard for newly registered vendors', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'off'
                ),
            ),
            'dokan_withdraw' => array(
                'withdraw_methods' => array(
                    'name'    => 'withdraw_methods',
                    'label'   => __( 'Withdraw Methods', 'dokan-lite' ),
                    'desc'    => __( 'Withdraw methods for vendors', 'dokan-lite' ),
                    'type'    => 'multicheck',
                    'default' => array( 'paypal' => 'paypal' ),
                    'options' => dokan_withdraw_get_methods()
                ),
                'withdraw_limit' => array(
                    'name'    => 'withdraw_limit',
                    'label'   => __( 'Minimum Withdraw Limit', 'dokan-lite' ),
                    'desc'    => __( 'Minimum balance required to make a withdraw request. Leave blank to set no minimum limits.', 'dokan-lite' ),
                    'default' => '50',
                    'type'    => 'text',
                )
            ),
            'dokan_pages' => array(
                'dashboard' => array(
                    'name'    => 'dashboard',
                    'label'   => __( 'Dashboard', 'dokan-lite' ),
                    'type'    => 'select',
                    'options' => $pages_array
                ),
                'my_orders' => array(
                    'name'    => 'my_orders',
                    'label'   => __( 'My Orders', 'dokan-lite' ),
                    'type'    => 'select',
                    'options' => $pages_array
                ),
                'reg_tc_page' => array(
                    'name'    => 'reg_tc_page',
                    'label'   => __( 'Terms and Conditions Page', 'dokan-lite' ),
                    'type'    => 'select',
                    'options' => $pages_array,
                    'desc'    => sprintf( __( 'Select where you want to add Dokan pages <a target="_blank" href="%s"> Learn More </a>', 'dokan-lite' ), 'https://wedevs.com/docs/dokan/settings/page-settings-2/' )
                )
            ),
            'dokan_appearance' => array(
                'setup_wizard_logo_url' => array(
                    'name'    => 'setup_wizard_logo_url',
                    'label'   => __( 'Vendor Setup Wizard Logo', 'dokan-lite' ),
                    'type'    => 'file',
                    'desc'    => __( 'Recommended Logo size ( 270px X 90px ). If no logo is uploaded, site title is shown by default.', 'dokan-lite' ),
                ),
                'store_header_template' => array(
                    'name'    => 'store_header_template',
                    'label'   => __( 'Store Header Template', 'dokan-lite' ),
                    'type'    => 'radio_image',
                    'options' => array(
                        'default' => DOKAN_PLUGIN_ASSEST . '/images/store-header-templates/default.png',
                        'layout1' => DOKAN_PLUGIN_ASSEST . '/images/store-header-templates/layout1.png',
                        'layout2' => DOKAN_PLUGIN_ASSEST . '/images/store-header-templates/layout2.png',
                        'layout3' => DOKAN_PLUGIN_ASSEST . '/images/store-header-templates/layout3.png'
                    ),
                    'default' => 'default',
                ),
            ),
            'dokan_privacy' => array(
                'enable_privacy' => array(
                    'name'    => 'enable_privacy',
                    'label'   => __( 'Enable Privacy Policy', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'desc'    => __( 'Enable privacy policy for dokan contact form', 'dokan-lite' ),
                    'default' => 'on'
                ),
                'privacy_page' => array(
                    'name'    => 'privacy_page',
                    'label'   => __( 'Privacy Page', 'dokan-lite' ),
                    'type'    => 'select',
                    'desc'    => __( 'Choose privacy policy page', 'dokan-lite' ),
                    'options' => $pages_array
                ),
                'privacy_policy' => array(
                    'name'    => 'privacy_policy',
                    'label'   => __( 'Privacy Policy', 'dokan-lite' ),
                    'type'    => 'textarea',
                    'rows'    => 5,
                    'default' => __( 'Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our [dokan_privacy_policy]', 'dokan-lite' ),
                )
            )
        );

        return apply_filters( 'dokan_settings_fields', $settings_fields, $this );
    }

    /**
     * Add settings after specific option
     *
     * @since 2.9.11
     *
     * @param array  $settings_fields     Current settings
     * @param string $section             Name of the section
     * @param string $option              Name of the option after which we wish to add new settings
     * @param array  $additional_settings New settings/options
     */
    public function add_settings_after( $settings_fields, $section, $option, $additional_settings ) {
        $section_fields = $settings_fields[ $section ];

        $afterIndex = array_search( $option, array_keys( $section_fields ) );

        $settings_fields[ $section ] = array_merge(
            array_slice( $section_fields, 0, $afterIndex + 1 ),
            $additional_settings,
            array_slice( $section_fields, $afterIndex + 1 )
        );

        return $settings_fields;
    }
}

new Dokan_Settings();
