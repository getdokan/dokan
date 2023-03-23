<?php

namespace WeDevs\Dokan\Admin;

use Exception;
use WP_Error;
use WeDevs\Dokan\Exceptions\DokanException;
use WeDevs\Dokan\Traits\AjaxResponseError;

/**
 * Admin Settings Class
 *
 * @since   3.0.0
 *
 * @package dokan
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
        add_action( 'dokan_before_saving_settings', [ $this, 'set_withdraw_limit_value_validation' ], 10, 2 );
        add_filter( 'dokan_admin_localize_script', [ $this, 'add_admin_settings_nonce' ] );
        add_action( 'wp_ajax_dokan_refresh_admin_settings_field_options', [ $this, 'refresh_admin_settings_field_options' ] );
        add_filter( 'dokan_get_settings_values', [ $this, 'format_price_values' ], 12, 2 );
        add_filter( 'dokan_get_settings_values', [ $this, 'set_withdraw_limit_gateways' ], 20, 2 );
        add_filter( 'dokan_settings_general_site_options', [ $this, 'add_dokan_data_clear_setting' ], 310 );
    }

    /**
     * Set unselected Withdraw Methods
     *
     * @since 3.6.0
     *
     * @param mixed $option_name
     * @param mixed $option_value
     *
     * @return void|mixed $option_value
     */
    public function set_withdraw_limit_gateways( $option_value, $option_name ) {
        if ( 'dokan_withdraw' !== $option_name ) {
            return $option_value;
        }

        if ( empty( $option_value ) ) { // for fresh installation
            $option_value['withdraw_methods'] = apply_filters( 'dokan_settings_withdraw_methods_default', [ 'paypal' => 'paypal' ] );
        }

        $all_withdraw_methods             = array_fill_keys( array_keys( dokan_withdraw_get_methods() ), '' );
        $option_value['withdraw_methods'] = wp_parse_args( $option_value['withdraw_methods'], $all_withdraw_methods );

        return $option_value;
    }

    /**
     * Format price values for price settings
     *
     * @since 1.0.0
     *
     * @param $option_name
     * @param $option_values
     *
     * @return void
     */
    public function format_price_values( $option_values, $option_name ) {
        if ( 'dokan_selling' === $option_name ) {
            if ( isset( $option_values['commission_type'] ) && 'flat' === $option_values['commission_type'] ) {
                $option_values['admin_percentage'] = isset( $option_values['admin_percentage'] ) ? wc_format_localized_price( $option_values['admin_percentage'] ) : 0;
            } else {
                $option_values['admin_percentage'] = isset( $option_values['admin_percentage'] ) ? wc_format_localized_decimal( $option_values['admin_percentage'] ) : 0;
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

        if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['nonce'] ) ), 'dokan_admin' ) ) {
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

            if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['nonce'] ) ), 'dokan_admin' ) ) {
                throw new DokanException( 'dokan_settings_invalid_nonce', __( 'Invalid nonce', 'dokan-lite' ), 403 );
            }

            if ( empty( $_POST['section'] ) ) {
                throw new DokanException( 'dokan_settings_error_saving', __( '`section` parameter is required.', 'dokan-lite' ), 400 );
            }

            $option_name  = sanitize_text_field( wp_unslash( $_POST['section'] ) );
            $option_value = $this->sanitize_options( wp_unslash( $_POST['settingsData'] ), 'edit' ); // phpcs:ignore
            $option_value = apply_filters( 'dokan_save_settings_value', $option_value, $option_name );
            $old_options  = get_option( $option_name, [] );

            /**
             * @since 3.5.1 added $old_options parameter
             */
            do_action( 'dokan_before_saving_settings', $option_name, $option_value, $old_options );

            update_option( $option_name, $option_value );

            /**
             * @since 3.5.1 added $old_options parameter
             */
            do_action( 'dokan_after_saving_settings', $option_name, $option_value, $old_options );

            // only flush rewrite rules if store url has been changed
            if ( 'dokan_general' === $option_name && isset( $old_options['custom_store_url'] ) && $old_options['custom_store_url'] !== $option_value['custom_store_url'] ) {
                dokan()->rewrite->register_rule();
                flush_rewrite_rules();
            }

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
     * @param        $options
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
     * @since 2.8.2
     *
     * @param $data
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
     * @param string $post_type
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
                'id'                   => 'dokan_general',
                'title'                => __( 'General', 'dokan-lite' ),
                'icon_url'             => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/general.svg',
                'description'          => __( 'Site Settings and Store Options', 'dokan-lite' ),
                'document_link'        => 'https://wedevs.com/docs/dokan/settings/general/',
                'settings_title'       => __( 'General Settings', 'dokan-lite' ),
                'settings_description' => __( 'You can configure your general site settings and vendor store options from this settings menu. Dokan offers countless custom options when setting up your store to provide you with the ultimate flexibility.', 'dokan-lite' ),
            ],
            [
                'id'                   => 'dokan_selling',
                'title'                => __( 'Selling Options', 'dokan-lite' ),
                'icon_url'             => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/selling.svg',
                'description'          => __( 'Store Settings, Commissions', 'dokan-lite' ),
                'document_link'        => 'https://wedevs.com/docs/dokan/settings/selling-options/',
                'settings_title'       => __( 'Selling Option Settings', 'dokan-lite' ),
                'settings_description' => __( 'You can configure commissions scales and vendor capabilities from this menu.', 'dokan-lite' ),
            ],
            [
                'id'                   => 'dokan_withdraw',
                'title'                => __( 'Withdraw Options', 'dokan-lite' ),
                'icon_url'             => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/withdraw.svg',
                'description'          => __( 'Withdraw Settings, Threshold', 'dokan-lite' ),
                'document_link'        => 'https://wedevs.com/docs/dokan/settings/withdraw-options/',
                'settings_title'       => __( 'Withdraw Settings', 'dokan-lite' ),
                'settings_description' => __( 'You can configure your store\'s withdrawal methods, limits, order status and more.', 'dokan-lite' ),
            ],
            [
                'id'                   => 'dokan_reverse_withdrawal',
                'title'                => __( 'Reverse Withdrawal', 'dokan-lite' ),
                'icon_url'             => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/reverse-witdrawal.svg',
                'description'          => __( 'Admin commission config (on COD)', 'dokan-lite' ),
                'document_link'        => 'https://wedevs.com/docs/dokan/withdraw/dokan-reverse-withdrawal/',
                'settings_title'       => __( 'Reverse Withdrawal Settings', 'dokan-lite' ),
                'settings_description' => __( 'Configure commission from vendors on Cash on Delivery orders, method and threshold for reverse balance, restrictive actions on vendors and more.', 'dokan-lite' ),
            ],
            [
                'id'                   => 'dokan_pages',
                'title'                => __( 'Page Settings', 'dokan-lite' ),
                'icon_url'             => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/page.svg',
                'description'          => __( 'Store Page Settings Manage', 'dokan-lite' ),
                'document_link'        => 'https://wedevs.com/docs/dokan/settings/page-settings-2/',
                'settings_title'       => __( 'Site and Store Page Settings', 'dokan-lite' ),
                'settings_description' => __( 'You can configure and setup your necessary page settings from this menu.', 'dokan-lite' ),
            ],
            [
                'id'                   => 'dokan_appearance',
                'title'                => __( 'Appearance', 'dokan-lite' ),
                'icon_url'             => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/appearance.svg',
                'description'          => __( 'Custom Store Appearance', 'dokan-lite' ),
                'document_link'        => 'https://wedevs.com/docs/dokan/settings/appearance/',
                'settings_title'       => __( 'Appearance Settings', 'dokan-lite' ),
                'settings_description' => __( 'You can configure your store appearance settings, configure map API, Google reCaptcha and more. Dokan offers various store header templates to choose from.', 'dokan-lite' ),
            ],
            [
                'id'                   => 'dokan_privacy',
                'title'                => __( 'Privacy Policy', 'dokan-lite' ),
                'icon_url'             => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/privacy.svg',
                'description'          => __( 'Update Store Privacy Policies', 'dokan-lite' ),
                'settings_title'       => __( 'Privacy Settings', 'dokan-lite' ),
                'settings_description' => __( 'You can configure your site\'s privacy settings and policy.', 'dokan-lite' ),
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

        $commission_types              = dokan_commission_types();
        $withdraw_order_status_options = apply_filters(
            'dokan_settings_withdraw_order_status_options',
            [
                'wc-completed'  => __( 'Completed', 'dokan-lite' ),
                'wc-processing' => __( 'Processing', 'dokan-lite' ),
                'wc-on-hold'    => __( 'On-hold', 'dokan-lite' ),
            ]
        );

        $general_site_options = apply_filters(
            'dokan_settings_general_site_options', [
                'site_options'           => [
                    'name'        => 'site_options',
                    'type'        => 'sub_section',
                    'label'       => __( 'Site Settings', 'dokan-lite' ),
                    'description' => __( 'Configure your site settings and control access to your site.', 'dokan-lite' ),
                ],
                'admin_access'           => [
                    'name'    => 'admin_access',
                    'label'   => __( 'Admin Area Access', 'dokan-lite' ),
                    'desc'    => __( 'Disallow vendors and customers from accessing the wp-admin dashboard area', 'dokan-lite' ),
                    'type'    => 'switcher',
                    'default' => 'on',
                ],
                'custom_store_url'       => [
                    'name'    => 'custom_store_url',
                    'label'   => __( 'Vendor Store URL', 'dokan-lite' ),
                    /* translators: %s: store url */
                    'desc'    => sprintf( __( 'Define the vendor store URL (%s<strong>[this-text]</strong>/[vendor-name])', 'dokan-lite' ), site_url( '/' ) ),
                    'default' => 'store',
                    'type'    => 'text',
                ],
                'setup_wizard_logo_url'  => [
                    'name'  => 'setup_wizard_logo_url',
                    'label' => __( 'Vendor Setup Wizard Logo', 'dokan-lite' ),
                    'type'  => 'file',
                    'desc'  => __( 'Recommended logo size ( 270px X 90px ). If no logo is uploaded, site title is shown by default.', 'dokan-lite' ),
                ],
                'setup_wizard_message'   => [
                    'name'    => 'setup_wizard_message',
                    'label'   => __( 'Vendor Setup Wizard Message', 'dokan-lite' ),
                    'type'    => 'wpeditor',
                    'default' => __( 'Thank you for choosing The Marketplace to power your online store! This quick setup wizard will help you configure the basic settings. <strong>It’s completely optional and shouldn’t take longer than two minutes.</strong>', 'dokan-lite' ),
                ],
                'disable_welcome_wizard' => [
                    'name'    => 'disable_welcome_wizard',
                    'label'   => __( 'Disable Welcome Wizard', 'dokan-lite' ),
                    'desc'    => __( 'Disable welcome wizard for newly registered vendors', 'dokan-lite' ),
                    'type'    => 'switcher',
                    'default' => 'off',
                    'tooltip' => __( 'If checked, vendors will not be prompted through a guided setup process but redirected straight to the vendor dashboard.', 'dokan-lite' ),
                ],
            ]
        );

        $general_vendor_store_options = apply_filters(
            'dokan_settings_general_vendor_store_options', [
                'vendor_store_options'               => [
                    'name'          => 'vendor_store_options',
                    'type'          => 'sub_section',
                    'label'         => __( 'Vendor Store Settings', 'dokan-lite' ),
                    'description'   => __( 'Configure your vendor store settings and setup your store policy for vendor.', 'dokan-lite' ),
                    'content_class' => 'sub-section-styles',
                ],
                'seller_enable_terms_and_conditions' => [
                    'name'    => 'seller_enable_terms_and_conditions',
                    'label'   => __( 'Store Terms and Conditions', 'dokan-lite' ),
                    'desc'    => __( 'Enable terms and conditions for vendor stores', 'dokan-lite' ),
                    'type'    => 'switcher',
                    'default' => 'off',
                    'tooltip' => __( 'Prompt terms and condition check for vendors when creating store on your site', 'dokan-lite' ),
                ],
                'store_products_per_page'            => [
                    'name'    => 'store_products_per_page',
                    'label'   => __( 'Store Products Per Page', 'dokan-lite' ),
                    'desc'    => __( 'Set how many products to display per page on the vendor store page. It will affect only if the vendor isn\'t set this value on their vendor setting page.', 'dokan-lite' ),
                    'type'    => 'number',
                    'default' => '12',
                    'tooltip' => __( 'It will affect the vendor only if they havent set a value on their settings page.', 'dokan-lite' ),
                ],
                'enabled_address_on_reg'             => [
                    'name'    => 'enabled_address_on_reg',
                    'label'   => __( 'Enable Address Fields', 'dokan-lite' ),
                    'desc'    => __( 'Add Address Fields on the Vendor Registration form', 'dokan-lite' ),
                    'type'    => 'switcher',
                    'default' => 'off',
                ],
            ]
        );

        $selling_option_commission = apply_filters(
            'dokan_settings_selling_option_commission', [
                'commission'             => [
                    'name'        => 'commission',
                    'label'       => __( 'Commission', 'dokan-lite' ),
                    'type'        => 'sub_section',
                    'description' => __( 'Define commission types, admin commissions, shipping and tax recipients, and more.', 'dokan-lite' ),
                ],
                'commission_type'        => [
                    'name'    => 'commission_type',
                    'label'   => __( 'Commission Type ', 'dokan-lite' ),
                    'desc'    => __( 'Select a commission type for vendor', 'dokan-lite' ),
                    'type'    => 'select',
                    'options' => $commission_types,
                    'default' => 'percentage',
                    'tooltip' => __( 'Select a commission type', 'dokan-lite' ),
                ],
                'admin_percentage'       => [
                    'name'              => 'admin_percentage',
                    'label'             => __( 'Admin Commission', 'dokan-lite' ),
                    'desc'              => __( 'Amount you get from each sale', 'dokan-lite' ),
                    'default'           => '10',
                    'type'              => 'price',
                    'sanitize_callback' => 'wc_format_decimal',
                ],
                'shipping_fee_recipient' => [
                    'name'    => 'shipping_fee_recipient',
                    'label'   => __( 'Shipping Fee Recipient', 'dokan-lite' ),
                    'desc'    => __( 'Who will be receiving the shipping fees', 'dokan-lite' ),
                    'type'    => 'radio',
                    'options' => [
                        'seller' => __( 'Vendor', 'dokan-lite' ),
                        'admin'  => __( 'Admin', 'dokan-lite' ),
                    ],
                    'default' => 'seller',
                ],
                'tax_fee_recipient'      => [
                    'name'    => 'tax_fee_recipient',
                    'label'   => __( 'Tax Fee Recipient', 'dokan-lite' ),
                    'desc'    => __( 'Who will be receiving the tax fees', 'dokan-lite' ),
                    'type'    => 'radio',
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
                'selling_capabilities'      => [
                    'name'          => 'selling_capabilities',
                    'label'         => __( 'Vendor Capabilities', 'dokan-lite' ),
                    'type'          => 'sub_section',
                    'description'   => __( 'Configure your multivendor site settings and vendor selling capabilities.', 'dokan-lite' ),
                    'content_class' => 'sub-section-styles',
                ],
                'new_seller_enable_selling' => [
                    'name'    => 'new_seller_enable_selling',
                    'label'   => __( 'Enable Selling', 'dokan-lite' ),
                    'desc'    => __( 'Immediately enable selling for newly registered vendors', 'dokan-lite' ),
                    'type'    => 'switcher',
                    'default' => 'on',
                    'tooltip' => __( 'If checked, vendors will have permission to sell immediately after registration. If unchecked, newly registered vendors cannot add products until selling capability is activated manually from admin dashboard.', 'dokan-lite' ),
                ],
                'disable_product_popup'     => [
                    'name'    => 'disable_product_popup',
                    'label'   => __( 'Disable Product Popup', 'dokan-lite' ),
                    'desc'    => __( 'Disable add new product in popup view', 'dokan-lite' ),
                    'type'    => 'switcher',
                    'default' => 'off',
                    'tooltip' => __( 'If disabled, instead of a pop up window vendor will redirect to product page when adding new product.', 'dokan-lite' ),
                ],
                'order_status_change'       => [
                    'name'    => 'order_status_change',
                    'label'   => __( 'Order Status Change', 'dokan-lite' ),
                    'desc'    => __( 'Allow vendor to update order status', 'dokan-lite' ),
                    'type'    => 'switcher',
                    'default' => 'on',
                    'tooltip' => __( 'Checking this will enable sellers to change the order status. If unchecked, only admin can change the order status.', 'dokan-lite' ),
                ],
                'dokan_any_category_selection'       => [
                    'name'    => 'dokan_any_category_selection',
                    'label'   => __( 'Select any category', 'dokan-lite' ),
                    'desc'    => __( 'Allow vendors to select any category while creating/editing products.', 'dokan-lite' ),
                    'type'    => 'switcher',
                    'default' => 'off',
                ],
            ]
        );

        $settings_fields = [
            'dokan_general'    => array_merge(
                $general_site_options,
                $general_vendor_store_options
            ),
            'dokan_selling'    => apply_filters(
                'dokan_settings_selling_options',
                array_merge(
                    $selling_option_commission,
                    $selling_option_vendor_capability
                )
            ),
            'dokan_withdraw'   => [
                'withdraw_methods'      => [
                    'name'    => 'withdraw_methods',
                    'label'   => __( 'Withdraw Methods', 'dokan-lite' ),
                    'desc'    => __( 'Select suitable withdraw methods for vendors', 'dokan-lite' ),
                    'type'    => 'multicheck',
                    'default' => apply_filters( 'dokan_settings_withdraw_methods_default', [ 'paypal' => 'paypal' ] ),
                    'options' => dokan_withdraw_get_methods(),
                    'tooltip' => __( 'Check to add available payment methods for vendors to withdraw money.', 'dokan-lite' ),
                ],
                'withdraw_limit'        => [
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
                    'default' => [
                        'wc-completed' => 'wc-completed',
                    ],
                    'options' => $withdraw_order_status_options,
                    'tooltip' => __( 'Select the order status that will allow vendors to make withdraw request. We prefer you select "completed", "processing".', 'dokan-lite' ),
                ],
                'exclude_cod_payment'   => [
                    'name'    => 'exclude_cod_payment',
                    'label'   => __( 'Exclude COD Payments', 'dokan-lite' ),
                    'desc'    => __( 'If an order is paid with Cash on Delivery (COD), then exclude that payment from vendor balance.', 'dokan-lite' ),
                    'type'    => 'switcher',
                    'default' => 'off',
                ],
            ],
            'dokan_pages'      => [
                'dashboard'     => [
                    'name'        => 'dashboard',
                    'label'       => __( 'Dashboard', 'dokan-lite' ),
                    'desc'        => __( 'Select a page to show vendor dashboard', 'dokan-lite' ),
                    'type'        => 'select',
                    'options'     => $pages_array,
                    'placeholder' => __( 'Select page', 'dokan-lite' ),
                ],
                'my_orders'     => [
                    'name'        => 'my_orders',
                    'label'       => __( 'My Orders', 'dokan-lite' ),
                    'desc'        => __( 'Select a page to show my orders', 'dokan-lite' ),
                    'type'        => 'select',
                    'placeholder' => __( 'Select page', 'dokan-lite' ),
                    'options'     => $pages_array,
                ],
                'store_listing' => [
                    'name'        => 'store_listing',
                    'label'       => __( 'Store Listing', 'dokan-lite' ),
                    'desc'        => __( 'Select a page to show all stores', 'dokan-lite' ),
                    'type'        => 'select',
                    'placeholder' => __( 'Select page', 'dokan-lite' ),
                    'options'     => $pages_array,
                ],
                'reg_tc_page'   => [
                    'name'        => 'reg_tc_page',
                    'type'        => 'select',
                    'desc'        => __( 'Select where you want to add Dokan pages.', 'dokan-lite' ),
                    'label'       => __( 'Terms and Conditions Page', 'dokan-lite' ),
                    'options'     => $pages_array,
                    'tooltip'     => __( 'Select a page to display the Terms and Conditions of your store for Vendors.', 'dokan-lite' ),
                    'placeholder' => __( 'Select page', 'dokan-lite' ),
                ],
            ],
            'dokan_appearance' => [
                'appearance_options'         => [
                    'name'        => 'appearance_options',
                    'type'        => 'sub_section',
                    'label'       => __( 'Store Appearance', 'dokan-lite' ),
                    'description' => __( 'Configure your site appearances.', 'dokan-lite' ),
                ],
                'store_map'                  => [
                    'name'    => 'store_map',
                    'label'   => __( 'Show map on Store Page', 'dokan-lite' ),
                    'desc'    => __( 'Enable map of the store location in the store sidebar', 'dokan-lite' ),
                    'type'    => 'switcher',
                    'default' => 'on',
                ],
                'map_api_source'             => [
                    'name'               => 'map_api_source',
                    'label'              => __( 'Map API Source', 'dokan-lite' ),
                    'desc'               => __( 'Which map API source you want to use in your site?', 'dokan-lite' ),
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
                    'label'   => __( 'Google Map API Key', 'dokan-lite' ),
                    'desc'    => __( '<a href="https://developers.google.com/maps/documentation/javascript/" target="_blank" rel="noopener noreferrer">API Key</a> is needed to display map on store page', 'dokan-lite' ),
                    'type'    => 'text',
                    'tooltip' => __( 'Insert Google API Key (with hyperlink) to display store map.', 'dokan-lite' ),
                ],
                'mapbox_access_token'        => [
                    'name'    => 'mapbox_access_token',
                    'label'   => __( 'Mapbox Access Token', 'dokan-lite' ),
                    'desc'    => __( '<a href="https://docs.mapbox.com/help/how-mapbox-works/access-tokens/" target="_blank" rel="noopener noreferrer">Access Token</a> is needed to display map on store page', 'dokan-lite' ),
                    'type'    => 'text',
                    'tooltip' => __( 'Insert Mapbox Access Token (with hyperlink) to display store map.', 'dokan-lite' ),
                ],
                'recaptcha_validation_label' => [
                    'name'                 => 'recaptcha_validation_label',
                    'type'                 => 'social',
                    'desc'                 => sprintf(
                    /* translators: 1) Opening anchor tag, 2) Closing anchor tag, 3) Opening anchor tag, 4) Closing anchor tag */
                        __( '%1$sreCAPTCHA%2$s credentials required to enable invisible captcha for contact forms. %3$sGet Help%4$s', 'dokan-lite' ),
                        '<a href="https://developers.google.com/recaptcha/docs/v3" target="_blank" rel="noopener noreferrer">',
                        '</a>',
                        '<a href="https://wedevs.com/docs/dokan/settings/dokan-recaptacha-v3-integration" target="_blank" rel="noopener noreferrer">',
                        '</a>'
                    ),
                    'label'                => __( 'Google reCAPTCHA Validation', 'dokan-lite' ),
                    'icon_url'             => DOKAN_PLUGIN_ASSEST . '/images/google.svg',
                    'social_desc'          => __( 'You can successfully connect to your Google reCaptcha account from here.', 'dokan-lite' ),
                    'recaptcha_site_key'   => [
                        'name'         => 'recaptcha_site_key',
                        'type'         => 'text',
                        'label'        => __( 'Site Key', 'dokan-lite' ),
                        'tooltip'      => __( 'Insert Google reCAPTCHA v3 site key.', 'dokan-lite' ),
                        'social_field' => true,
                    ],
                    'recaptcha_secret_key' => [
                        'name'         => 'recaptcha_secret_key',
                        'label'        => __( 'Secret Key', 'dokan-lite' ),
                        'type'         => 'text',
                        'tooltip'      => __( 'Insert Google reCAPTCHA v3 secret key.', 'dokan-lite' ),
                        'social_field' => true,
                    ],
                ],
                'contact_seller'             => [
                    'name'    => 'contact_seller',
                    'label'   => __( 'Show Contact Form on Store Page', 'dokan-lite' ),
                    'desc'    => __( 'Display a vendor contact form in the store sidebar', 'dokan-lite' ),
                    'type'    => 'switcher',
                    'default' => 'on',
                ],
                'store_header_template'      => [
                    'name'    => 'store_header_template',
                    'type'    => 'radio_image',
                    'desc'    => __( 'Select a store header for your store.', 'dokan-lite' ),
                    'label'   => __( 'Store Header Template', 'dokan-lite' ),
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
                    'type'    => 'switcher',
                    'default' => 'on',
                ],
                'enable_theme_store_sidebar' => [
                    'name'    => 'enable_theme_store_sidebar',
                    'label'   => __( 'Enable Store Sidebar From Theme', 'dokan-lite' ),
                    'desc'    => __( 'Enable showing store sidebar from your theme.', 'dokan-lite' ),
                    'type'    => 'switcher',
                    'default' => 'off',
                ],
                'hide_vendor_info'           => [
                    'name'    => 'hide_vendor_info',
                    'label'   => __( 'Hide Vendor Info', 'dokan-lite' ),
                    'desc'    => __( 'Hide vendor contact info from single store page.', 'dokan-lite' ),
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
                    'type'    => 'switcher',
                    'desc'    => __( 'Enable privacy policy for vendor store contact form', 'dokan-lite' ),
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
                    'type'    => 'wpeditor',
                    'default' => __( 'Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our [dokan_privacy_policy]', 'dokan-lite' ),
                    'tooltip' => __( 'Customize the Privacy Policy text that will be displayed on your store.', 'dokan-lite' ),
                ],
            ],
        ];

        return apply_filters( 'dokan_settings_fields', $settings_fields, $this );
    }

    /**
     * Add settings after specific option
     *
     * @since 2.9.11
     *
     * @param string $section             Name of the section
     * @param string $option              Name of the option after which we wish to add new settings
     * @param array  $additional_settings New settings/options
     * @param array  $settings_fields     Current settings
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

            $section   = ! empty( $_POST['section'] ) ? sanitize_text_field( wp_unslash( $_POST['section'] ) ) : null;
            $field     = ! empty( $_POST['field'] ) ? sanitize_text_field( wp_unslash( $_POST['field'] ) ) : null;

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

    /**
     * Validates admin withdraw limit settings
     *
     * @since 3.2.15
     *
     * @param mixed $option_name
     * @param mixed $option_value
     *
     * @return void|mixed $option_value
     */
    public function set_withdraw_limit_value_validation( $option_name, $option_value ) {
        if ( 'dokan_withdraw' !== $option_name ) {
            return;
        }

        $errors = [];

        if ( ! empty( $option_value['withdraw_limit'] && $option_value['withdraw_limit'] < 0 ) ) {
            $errors[] = [
                'name'  => 'withdraw_limit',
                'error' => __( 'Minimum Withdraw Limit can\'t be negative value.', 'dokan-lite' ),
            ];
        }

        if ( ! empty( $errors ) ) {
            wp_send_json_error(
                [
                    'settings' => [
                        'name'  => $option_name,
                        'value' => $option_value,
                    ],
                    'message'  => __( 'Validation error', 'dokan-lite' ),
                    'errors'   => $errors,
                ],
                400
            );
        }
    }

    /**
     * Dokan data clear setting
     *
     * @since 3.2.15
     *
     * @return array $settings_fields
     */
    public function add_dokan_data_clear_setting( $settings_fields ) {
        $settings_fields['data_clear_on_uninstall'] = [
            'name'          => 'data_clear_on_uninstall',
            'label'         => __( 'Data Clear', 'dokan-lite' ),
            'desc'          => __( 'Delete all data and tables related to Dokan and Dokan Pro plugin while deleting the Dokan plugin.', 'dokan-lite' ),
            'type'          => 'switcher',
            'default'       => 'off',
            'field_icon'    => __( 'Check this to remove Dokan related data and table from the database upon deleting the plugin. When you delete the Dokan lite version, it will also delete all the data related to Dokan Pro as well. This won\'t happen when the plugins are deactivated..', 'dokan-lite' ),
            'content_class' => 'data_clear',
        ];

        return $settings_fields;
    }
}
