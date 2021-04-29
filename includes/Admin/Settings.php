<?php

namespace WeDevs\Dokan\Admin;

use Exception;
use WP_Error;
use WeDevs\Dokan\Exceptions\DokanException;
use WeDevs\Dokan\Traits\AjaxResponseError;

/**
* Admin Settings Class
*
* @package dokan
*
* @since 3.0.0
*/
class Settings {

    use AjaxResponseError;

    /**
     * Load automatically when class initiate
     *
     * @since 1.0.0
     */
    public function __construct() {
        add_filter( 'dokan_admin_localize_script', [ $this, 'settings_localize_data' ], 10 );
        add_action( 'wp_ajax_dokan_get_setting_values', [ $this, 'get_settings_value' ], 10 );
        add_action( 'wp_ajax_dokan_save_settings', [ $this, 'save_settings_value' ], 10 );
        add_filter( 'dokan_admin_localize_script', [ $this, 'add_admin_settings_nonce' ] );
        add_action( 'wp_ajax_dokan_refresh_admin_settings_field_options', [ $this, 'refresh_admin_settings_field_options' ] );
        add_filter( 'dokan_get_settings_values', [ $this, 'format_price_values' ], 12, 2 );
    }

    /**
     * Format price values for price settings
     *
     * @param $option_values
     * @param $option_name
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function format_price_values( $option_values, $option_name ) {
        if ( 'dokan_selling' === $option_name ) {
            if ( isset( $option_values['commission_type'] ) && 'flat' === $option_values['commission_type'] ) {
                $option_values['admin_percentage'] = wc_format_localized_price( $option_values['admin_percentage'] );
            } else {
                $option_values['admin_percentage'] = wc_format_decimal( $option_values['admin_percentage'] );
            }
        }

        return $option_values;
    }

    /**
     * Get settings values
     *
     * @since 2.8.2
     *
     * @return void
     */
    public function get_settings_value() {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_send_json_error( __( 'You have no permission to get settings value', 'dokan-lite' ) );
        }

        $_post_data = wp_unslash( $_POST );

        if ( ! isset( $_post_data['nonce'] ) || ! wp_verify_nonce( sanitize_key( $_post_data['nonce'] ), 'dokan_admin' ) ) {
            wp_send_json_error( __( 'Invalid nonce', 'dokan-lite' ) );
        }

        $settings = [];

        foreach ( $this->get_settings_sections() as $key => $section ) {
            $settings[ $section['id'] ] = apply_filters( 'dokan_get_settings_values', $this->sanitize_options( get_option( $section['id'], [] ), 'read' ), $section['id'] );
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
            if ( ! current_user_can( 'manage_woocommerce' ) ) {
                throw new DokanException( 'dokan_settings_unauthorized_operation', __( 'You are not authorized to perform this action.', 'dokan-lite' ), 401 );
            }

            $_post_data = wp_unslash( $_POST );

            if ( ! isset( $_post_data['nonce'] ) || ! wp_verify_nonce( sanitize_key( $_post_data['nonce'] ), 'dokan_admin' ) ) {
                throw new DokanException( 'dokan_settings_invalid_nonce', __( 'Invalid nonce', 'dokan-lite' ), 403 );
            }

            if ( empty( $_post_data['section'] ) ) {
                throw new DokanException( 'dokan_settings_error_saving', __( '`section` parameter is required.', 'dokan-lite' ), 400 );
            }

            $option_name  = $_post_data['section'];
            $option_value = $this->sanitize_options( $_post_data['settingsData'], 'edit' );
            $option_value = apply_filters( 'dokan_save_settings_value', $option_value, $option_name );

            do_action( 'dokan_before_saving_settings', $option_name, $option_value );

            update_option( $option_name, $option_value );

            do_action( 'dokan_after_saving_settings', $option_name, $option_value );

            wp_send_json_success(
                [
                    'settings' => [
                        'name'  => $option_name,
                        'value' => apply_filters( 'dokan_get_settings_values', $this->sanitize_options( $option_value, 'read' ), $option_name ),
                    ],
                    'message'  => __( 'Setting has been saved successfully.', 'dokan-lite' ),
                ]
            );
        } catch ( Exception $e ) {
            $error_code = $e->getCode() ? $e->getCode() : 422;

            wp_send_json_error( new WP_Error( 'dokan_settings_error', $e->getMessage() ), $error_code );
        }
    }

    /**
     * Sanitize callback for Settings API
     *
     * @param $options
     * @param string $context
     *
     * @return mixed
     */
    public function sanitize_options( $options, $context = 'read' ) {
        if ( ! $options ) {
            return $options;
        }

        foreach ( $options as $option_slug => $option_value ) {
            $sanitize_callback = $this->get_sanitize_callback( $option_slug, $context );

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
     * @param string $context
     *
     * @return mixed string or bool false
     */
    public function get_sanitize_callback( $slug = '', $context = 'read' ) {
        if ( empty( $slug ) ) {
            return false;
        }

        //settings fields are called every time. so we kept it in cache for a small amount of time. to avoid error and better performance.
        $settings_fields = get_transient( 'get_dokan_settings_fields' );

        if ( ! $settings_fields ) {
            $settings_fields = $this->get_settings_fields();
            set_transient( 'get_dokan_settings_fields', $settings_fields, 90 );
        }

        // Iterate over registered fields and see if we can find proper callback
        foreach ( $settings_fields as $section => $options ) {
            foreach ( $options as $option ) {
                if ( $option['name'] !== $slug ) {
                    continue;
                }

                // Return the callback name
                if ( 'read' === $context ) {
                    return isset( $option['response_sanitize_callback'] ) && is_callable( $option['response_sanitize_callback'] ) ? $option['response_sanitize_callback'] : false;
                }

                if ( 'edit' === $context ) {
                    return isset( $option['sanitize_callback'] ) && is_callable( $option['sanitize_callback'] ) ? $option['sanitize_callback'] : false;
                }
            }
        }

        return false;
    }

    /**
     * Load settings sections and fields
     *
     * @param $data
     *
     * @since 2.8.2
     *
     * @return void
     */
    public function settings_localize_data( $data ) {
        $data['settings_sections'] = $this->get_settings_sections();

        $settings_fields = [];
        foreach ( $this->get_settings_fields() as $key => $section_fields ) {
            foreach ( $section_fields as $settings_key => $value ) {
                $settings_fields[ $key ][ $value['name'] ] = $value;
            }
        }

        $data['settings_fields'] = $settings_fields;

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
        $pages_array = [];
        $pages       = get_posts(
            [
                'post_type'   => $post_type,
                'numberposts' => - 1,
            ]
        );

        if ( $pages ) {
            foreach ( $pages as $page ) {
                $pages_array[ $page->ID ] = $page->post_title;
            }
        }

        return $pages_array;
    }

    /**
     * Get all settings Sections
     *
     * @since 1.0.0
     *
     * @return array
     */
    public function get_settings_sections() {
        $sections = [
            [
                'id'    => 'dokan_general',
                'title' => __( 'General', 'dokan-lite' ),
                'icon'  => 'dashicons-admin-generic',
            ],
            [
                'id'    => 'dokan_selling',
                'title' => __( 'Selling Options', 'dokan-lite' ),
                'icon'  => 'dashicons-cart',
            ],
            [
                'id'    => 'dokan_withdraw',
                'title' => __( 'Withdraw Options', 'dokan-lite' ),
                'icon'  => 'dashicons-money',
            ],
            [
                'id'    => 'dokan_pages',
                'title' => __( 'Page Settings', 'dokan-lite' ),
                'icon'  => 'dashicons-admin-page',
            ],
            [
                'id'    => 'dokan_appearance',
                'title' => __( 'Appearance', 'dokan-lite' ),
                'icon'  => 'dashicons-admin-appearance',
            ],
            [
                'id'    => 'dokan_privacy',
                'title' => __( 'Privacy Policy', 'dokan-lite' ),
                'icon'  => 'dashicons-admin-network',
            ],
        ];

        return apply_filters( 'dokan_settings_sections', $sections );
    }

    /**
     * Returns all the settings fields
     *
     * @since 1.0.0
     *
     * @return array settings fields
     */
    public function get_settings_fields() {
        $pages_array = $this->get_post_type( 'page' );

        $commission_types = dokan_commission_types();

        $general_site_options = apply_filters(
            'dokan_settings_general_site_options', [
                'site_options'           => [
                    'name'  => 'site_options',
                    'label' => __( 'Site Options', 'dokan-lite' ),
                    'type'  => 'sub_section',
                ],
                'admin_access'           => [
                    'name'    => 'admin_access',
                    'label'   => __( 'Admin area access', 'dokan-lite' ),
                    'desc'    => __( 'Disallow Vendors and Customers from accessing the wp-admin dashboard area', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on',
                ],
                'custom_store_url'       => [
                    'name'    => 'custom_store_url',
                    'label'   => __( 'Vendor Store URL', 'dokan-lite' ),
                    /* translators: %s: store url */
                    'desc'    => sprintf( __( 'Define the Vendor store URL (%s<strong>[this-text]</strong>/[vendor-name])', 'dokan-lite' ), site_url( '/' ) ),
                    'default' => 'store',
                    'type'    => 'text',
                ],
                'setup_wizard_logo_url'  => [
                    'name'  => 'setup_wizard_logo_url',
                    'label' => __( 'Vendor Setup Wizard Logo', 'dokan-lite' ),
                    'type'  => 'file',
                    'desc'  => __( 'Recommended Logo size ( 270px X 90px ). If no logo is uploaded, site title is shown by default.', 'dokan-lite' ),
                ],
                'disable_welcome_wizard' => [
                    'name'    => 'disable_welcome_wizard',
                    'label'   => __( 'Disable Welcome Wizard', 'dokan-lite' ),
                    'desc'    => __( 'Disable welcome wizard for newly registered vendors', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'off',
                ],
            ]
        );

        $general_vendor_store_options = apply_filters(
            'dokan_settings_general_vendor_store_options', [
                'vendor_store_options'               => [
                    'name'  => 'vendor_store_options',
                    'label' => __( 'Vendor Store Options', 'dokan-lite' ),
                    'type'  => 'sub_section',
                ],
                'seller_enable_terms_and_conditions' => [
                    'name'    => 'seller_enable_terms_and_conditions',
                    'label'   => __( 'Store Terms and Conditions', 'dokan-lite' ),
                    'desc'    => __( 'Enable Terms and Conditions for vendor stores', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'off',
                ],
                'store_products_per_page' => [
                    'name'    => 'store_products_per_page',
                    'label'   => __( 'Store Products Per Page', 'dokan-lite' ),
                    'desc'    => __( 'Set how many products to display per page on the vendor store page. It will affect only if the vendor isn\'t set this value on their vendor setting page.', 'dokan-lite' ),
                    'type'    => 'number',
                    'default' => '12',
                ],
            ]
        );

        $selling_option_commission = apply_filters(
            'dokan_settings_selling_option_commission', [
                'commission'             => [
                    'name'  => 'commission',
                    'label' => __( 'Commission', 'dokan-lite' ),
                    'type'  => 'sub_section',
                ],
                'commission_type'        => [
                    'name'    => 'commission_type',
                    'label'   => __( 'Commission Type ', 'dokan-lite' ),
                    'desc'    => __( 'Select a commission type for Vendor', 'dokan-lite' ),
                    'type'    => 'select',
                    'options' => $commission_types,
                    'default' => 'percentage',
                ],
                'admin_percentage'       => [
                    'name'              => 'admin_percentage',
                    'label'             => __( 'Admin Commission', 'dokan-lite' ),
                    'desc'              => __( 'Amount you get from each sale', 'dokan-lite' ),
                    'default'           => '10',
                    'type'              => 'price',
                    'sanitize_callback' => 'wc_format_decimal',
                    // @codingStandardsIgnoreStart
                    // 'response_sanitize_callback' => 'wc_format_localized_price',
                    // @codingStandardsIgnoreEnd
                ],
                'shipping_fee_recipient' => [
                    'name'    => 'shipping_fee_recipient',
                    'label'   => __( 'Shipping Fee Recipient', 'dokan-lite' ),
                    'desc'    => __( 'Who will be receiving the Shipping fees', 'dokan-lite' ),
                    'type'    => 'select',
                    'options' => [
                        'seller' => __( 'Vendor', 'dokan-lite' ),
                        'admin'  => __( 'Admin', 'dokan-lite' ),
                    ],
                    'default' => 'seller',
                ],
                'tax_fee_recipient'      => [
                    'name'    => 'tax_fee_recipient',
                    'label'   => __( 'Tax Fee Recipient', 'dokan-lite' ),
                    'desc'    => __( 'Who will be receiving the Tax fees', 'dokan-lite' ),
                    'type'    => 'select',
                    'options' => [
                        'seller' => __( 'Vendor', 'dokan-lite' ),
                        'admin'  => __( 'Admin', 'dokan-lite' ),
                    ],
                    'default' => 'seller',
                ],
            ]
        );

        $selling_option_vendor_capability = apply_filters(
            'dokan_settings_selling_option_vendor_capability', [
                'vendor_capability'         => [
                    'name'  => 'vendor_capability',
                    'label' => __( 'Vendor Capability', 'dokan-lite' ),
                    'type'  => 'sub_section',
                ],
                'new_seller_enable_selling' => [
                    'name'    => 'new_seller_enable_selling',
                    'label'   => __( 'New Vendor Product Upload', 'dokan-lite' ),
                    'desc'    => __( 'Allow newly registered vendors to add products', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on',
                ],
                'disable_product_popup'     => [
                    'name'    => 'disable_product_popup',
                    'label'   => __( 'Disable Product Popup', 'dokan-lite' ),
                    'desc'    => __( 'Disable add new product in popup view', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'off',
                ],
                'order_status_change'       => [
                    'name'    => 'order_status_change',
                    'label'   => __( 'Order Status Change', 'dokan-lite' ),
                    'desc'    => __( 'Allow vendor to update order status', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on',
                ],
            ]
        );

        $settings_fields = [
            'dokan_general'    => array_merge(
                $general_site_options,
                $general_vendor_store_options
            ),
            'dokan_selling'    => array_merge(
                $selling_option_commission,
                $selling_option_vendor_capability
            ),
            'dokan_withdraw'   => [
                'withdraw_methods'    => [
                    'name'    => 'withdraw_methods',
                    'label'   => __( 'Withdraw Methods', 'dokan-lite' ),
                    'desc'    => __( 'Select suitable Withdraw methods for Vendors', 'dokan-lite' ),
                    'type'    => 'multicheck',
                    'default' => [ 'paypal' => 'paypal' ],
                    'options' => dokan_withdraw_get_methods(),
                ],
                'withdraw_limit'      => [
                    'name'                       => 'withdraw_limit',
                    'label'                      => __( 'Minimum Withdraw Limit', 'dokan-lite' ),
                    'desc'                       => __( 'Minimum balance required to make a withdraw request. Leave blank to set no minimum limits.', 'dokan-lite' ),
                    'default'                    => '50',
                    'type'                       => 'text',
                    'class'                      => 'wc_input_price',
                    'sanitize_callback'          => 'wc_format_decimal',
                    'response_sanitize_callback' => 'wc_format_localized_price',
                ],
                'withdraw_order_status' => [
                    'name'    => 'withdraw_order_status',
                    'label'   => __( 'Order Status for Withdraw', 'dokan-lite' ),
                    'desc'    => __( 'Order status for which vendor can make a withdraw request.', 'dokan-lite' ),
                    'type'    => 'multicheck',
                    'default' => array(
                        'wc-completed'  => 'wc-completed',
                    ),
                    'options' => array(
                        'wc-completed'  => __( 'Completed', 'dokan-lite' ),
                        'wc-processing' => __( 'Processing', 'dokan-lite' ),
                        'wc-on-hold'    => __( 'On-hold', 'dokan-lite' ),
                    ),
                ],
                'exclude_cod_payment' => [
                    'name'    => 'exclude_cod_payment',
                    'label'   => __( 'Exclude COD Payments', 'dokan-lite' ),
                    'desc'    => __( 'If an order is paid with Cash on Delivery (COD), then exclude that payment from vendor balance.', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'off',
                ],
            ],
            'dokan_pages'      => [
                'dashboard'     => [
                    'name'        => 'dashboard',
                    'label'       => __( 'Dashboard', 'dokan-lite' ),
                    'desc'        => __( 'Select a page to show Vendor Dashboard', 'dokan-lite' ),
                    'type'        => 'select',
                    'placeholder' => __( 'Select page', 'dokan-lite' ),
                    'options'     => $pages_array,
                ],
                'my_orders'     => [
                    'name'        => 'my_orders',
                    'label'       => __( 'My Orders', 'dokan-lite' ),
                    'desc'        => __( 'Select a page to show My Orders', 'dokan-lite' ),
                    'type'        => 'select',
                    'placeholder' => __( 'Select page', 'dokan-lite' ),
                    'options'     => $pages_array,
                ],
                'store_listing' => [
                    'name'        => 'store_listing',
                    'label'       => __( 'Store Listing', 'dokan-lite' ),
                    'desc'        => __( 'Select a page to show all Stores', 'dokan-lite' ),
                    'type'        => 'select',
                    'placeholder' => __( 'Select page', 'dokan-lite' ),
                    'options'     => $pages_array,
                ],
                'reg_tc_page'   => [
                    'name'        => 'reg_tc_page',
                    'label'       => __( 'Terms and Conditions Page', 'dokan-lite' ),
                    'type'        => 'select',
                    'placeholder' => __( 'Select page', 'dokan-lite' ),
                    'options'     => $pages_array,
                    /* translators: %s: dokan pages  */
                    'desc'        => sprintf( __( 'Select where you want to add Dokan pages <a target="_blank" href="%s"> Learn More </a>', 'dokan-lite' ), 'https://wedevs.com/docs/dokan/settings/page-settings-2/' ),
                ],
            ],
            'dokan_appearance' => [
                'store_map'                  => [
                    'name'    => 'store_map',
                    'label'   => __( 'Show Map on Store Page', 'dokan-lite' ),
                    'desc'    => __( 'Enable Map of the Store Location in the store sidebar', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on',
                ],
                'map_api_source'             => [
                    'name'               => 'map_api_source',
                    'label'              => __( 'Map API Source', 'dokan-lite' ),
                    'desc'               => __( 'Which Map API source you want to use in your site?', 'dokan-lite' ),
                    'refresh_after_save' => true,
                    'type'               => 'radio',
                    'default'            => 'google_maps',
                    'options'            => [
                        'google_maps' => __( 'Google Maps', 'dokan-lite' ),
                        'mapbox'      => __( 'Mapbox', 'dokan-lite' ),
                    ],
                ],
                'gmap_api_key'               => [
                    'name'    => 'gmap_api_key',
                    'show_if' => [
                        'map_api_source' => [
                            'equal' => 'google_maps',
                        ],
                    ],
                    'label'   => __( 'Google Map API Key', 'dokan-lite' ),
                    'desc'    => __( '<a href="https://developers.google.com/maps/documentation/javascript/" target="_blank" rel="noopener noreferrer">API Key</a> is needed to display map on store page', 'dokan-lite' ),
                    'type'    => 'text',
                ],
                'mapbox_access_token'        => [
                    'name'    => 'mapbox_access_token',
                    'show_if' => [
                        'map_api_source' => [
                            'equal' => 'mapbox',
                        ],
                    ],
                    'label'   => __( 'Mapbox Access Token', 'dokan-lite' ),
                    'desc'    => __( '<a href="https://docs.mapbox.com/help/how-mapbox-works/access-tokens/" target="_blank" rel="noopener noreferrer">Access Token</a> is needed to display map on store page', 'dokan-lite' ),
                    'type'    => 'text',
                ],
                'contact_seller'             => [
                    'name'    => 'contact_seller',
                    'label'   => __( 'Show Contact Form on Store Page', 'dokan-lite' ),
                    'desc'    => __( 'Display a vendor contact form in the store sidebar', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on',
                ],
                'store_header_template'      => [
                    'name'    => 'store_header_template',
                    'label'   => __( 'Store Header Template', 'dokan-lite' ),
                    'type'    => 'radio_image',
                    'options' => [
                        'default' => DOKAN_PLUGIN_ASSEST . '/images/store-header-templates/default.png',
                        'layout1' => DOKAN_PLUGIN_ASSEST . '/images/store-header-templates/layout1.png',
                        'layout2' => DOKAN_PLUGIN_ASSEST . '/images/store-header-templates/layout2.png',
                        'layout3' => DOKAN_PLUGIN_ASSEST . '/images/store-header-templates/layout3.png',
                    ],
                    'default' => 'default',
                ],
                'store_open_close'           => [
                    'name'    => 'store_open_close',
                    'label'   => __( 'Store Opening Closing Time Widget', 'dokan-lite' ),
                    'desc'    => __( 'Enable store opening & closing time widget in the store sidebar', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on',
                ],
                'enable_theme_store_sidebar' => [
                    'name'    => 'enable_theme_store_sidebar',
                    'label'   => __( 'Enable Store Sidebar From Theme', 'dokan-lite' ),
                    'desc'    => __( 'Enable showing Store Sidebar From Your Theme.', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'off',
                ],
                'hide_vendor_info'           => [
                    'name'    => 'hide_vendor_info',
                    'label'   => __( 'Hide Vendor Info', 'dokan-lite' ),
                    'type'    => 'multicheck',
                    'default' => [
                        'email'   => '',
                        'phone'   => '',
                        'address' => '',
                    ],
                    'options' => [
                        'email'   => __( 'Email Address', 'dokan-lite' ),
                        'phone'   => __( 'Phone Number', 'dokan-lite' ),
                        'address' => __( 'Store Address', 'dokan-lite' ),
                    ],
                ],
            ],
            'dokan_privacy'    => [
                'enable_privacy' => [
                    'name'    => 'enable_privacy',
                    'label'   => __( 'Enable Privacy Policy', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'desc'    => __( 'Enable privacy policy for Vendor store contact form', 'dokan-lite' ),
                    'default' => 'on',
                ],
                'privacy_page'   => [
                    'name'        => 'privacy_page',
                    'label'       => __( 'Privacy Page', 'dokan-lite' ),
                    'type'        => 'select',
                    'desc'        => __( 'Select a page to show your privacy policy', 'dokan-lite' ),
                    'placeholder' => __( 'Select page', 'dokan-lite' ),
                    'options'     => $pages_array,
                ],
                'privacy_policy' => [
                    'name'    => 'privacy_policy',
                    'label'   => __( 'Privacy Policy', 'dokan-lite' ),
                    'type'    => 'textarea',
                    'rows'    => 5,
                    'default' => __( 'Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our [dokan_privacy_policy]', 'dokan-lite' ),
                ],
            ],
        ];

        return apply_filters( 'dokan_settings_fields', $settings_fields, $this );
    }

    /**
     * Add settings after specific option
     *
     * @param array $settings_fields Current settings
     * @param string $section Name of the section
     * @param string $option Name of the option after which we wish to add new settings
     * @param array $additional_settings New settings/options
     *
     * @since 2.9.11
     *
     * @return array
     */
    public function add_settings_after( $settings_fields, $section, $option, $additional_settings ) {
        $section_fields = $settings_fields[ $section ];

        $after_index = array_search( $option, array_keys( $section_fields ), true );

        $settings_fields[ $section ] = array_merge(
            array_slice( $section_fields, 0, $after_index + 1 ),
            $additional_settings,
            array_slice( $section_fields, $after_index + 1 )
        );

        return $settings_fields;
    }

    /**
     * Add settings nonce to localized vars
     *
     * @since DOKNA_LITE_SINCE
     *
     * @param array $vars
     *
     * @return array
     */
    public function add_admin_settings_nonce( $vars ) {
        $vars['admin_settings_nonce'] = wp_create_nonce( 'dokan_admin_settings' );

        return $vars;
    }

    /**
     * Get refreshed options for a admin setting
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function refresh_admin_settings_field_options() {
        try {
            if ( ! check_ajax_referer( 'dokan_admin_settings', false, false ) ) {
                throw new DokanException(
                    'dokan_ajax_unauthorized_operation',
                    __( 'You are not authorized to perform this action.', 'dokan-lite' ),
                    403
                );
            }

            $post_data = wp_unslash( $_POST );
            $section   = ! empty( $post_data['section'] ) ? sanitize_text_field( $post_data['section'] ) : null;
            $field     = ! empty( $post_data['field'] ) ? sanitize_text_field( $post_data['field'] ) : null;

            if ( ! $section || ! $field ) {
                throw new DokanException(
                    'dokan_ajax_missing_params',
                    __( 'Both section and field params are required.', 'dokan-lite' )
                );
            }

            $tag = "dokan_settings_refresh_option_{$section}_{$field}";

            if ( ! has_filter( $tag ) ) {
                throw new DokanException(
                    'dokan_ajax_no_filter',
                    __( 'No filter found to refresh the setting options', 'dokan-lite' )
                );
            }

            $options = apply_filters( $tag, [] );

            wp_send_json_success( $options );
        } catch ( Exception $e ) {
            $this->send_response_error( $e );
        }
    }
}
