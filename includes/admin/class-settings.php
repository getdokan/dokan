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
     * Holds settings API
     *
     * @var array
     */
    private $settings_api;

    /**
     * Load autometically when class initiate
     *
     * @since 1.0.0
     */
    public function __construct() {
        if ( ! class_exists( 'Dokan_Settings_API' ) ) {
            require_once DOKAN_LIB_DIR . '/class.dokan-settings-api.php';
        }

        $this->settings_api = new Dokan_Settings_API();

        add_action( 'admin_init', array( $this, 'admin_init' ), 99 );
    }

    /**
     * Get settings API
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function get_settings_api() {
        return $this->settings_api;
    }

    /**
     * Initialize Settings tab and sections content
     *
     * @since 1.0
     *
     * @return void
     */
    function admin_init() {
        //set the settings
        $this->get_settings_api()->set_sections( $this->get_settings_sections() );
        $this->get_settings_api()->set_fields( $this->get_settings_fields() );

        //initialize settings
        $this->get_settings_api()->admin_init();
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
        $pages = get_posts( array('post_type' => $post_type, 'numberposts' => -1) );

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
    function get_settings_sections() {
        $sections = array(
            array(
                'id'    => 'dokan_general',
                'title' => __( 'General', 'dokan-lite' ),
                'icon' => 'dashicons-admin-generic'
            ),
            array(
                'id'    => 'dokan_selling',
                'title' => __( 'Selling Options', 'dokan-lite' ),
                'icon' => 'dashicons-cart'
            ),
            array(
                'id'    => 'dokan_withdraw',
                'title' => __( 'Withdraw Options', 'dokan-lite' ),
                'icon' => 'dashicons-money'
            ),
            array(
                'id'    => 'dokan_pages',
                'title' => __( 'Page Settings', 'dokan-lite' ),
                'icon' => 'dashicons-admin-page'
            ),
            array(
                'id'    => 'dokan_appearance',
                'title' => __( 'Appearance', 'dokan-lite' ),
                'icon'  => 'dashicons-admin-appearance'
            )
        );

        return apply_filters( 'dokan_settings_sections', $sections );
    }

    /**
     * Returns all the settings fields
     *
     * @since 1.0
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
                'extra_fee_recipient' => array(
                    'name'    => 'extra_fee_recipient',
                    'label'   => __( 'Extra Fee Recipient', 'dokan-lite' ),
                    'desc'    => __( 'Should extra fees, such as Shipping and Tax, go to the Vendor or the Admin?', 'dokan-lite' ),
                    'type'    => 'select',
                    'options' => array( 'seller' => __( 'Vendor', 'dokan-lite' ), 'admin' => __( 'Admin', 'dokan-lite' ) ),
                    'default' => 'seller'
                ),
                'store_map'                  => array(
                    'name'    => 'store_map',
                    'label'   => __( 'Show Map on Store Page', 'dokan-lite' ),
                    'desc'    => __( 'Enable a Google Map of the Store Location in the store sidebar', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on'
                ),
                'gmap_api_key'               => array(
                    'name'  => 'gmap_api_key',
                    'label' => __( 'Google Map API Key', 'dokan-lite' ),
                    'desc'  => __( '<a href="https://developers.google.com/maps/documentation/javascript/" target="_blank">API Key</a> is needed to display map on store page', 'dokan-lite' ),
                    'type'  => 'text',
                ),
                'contact_seller'             => array(
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
                ),
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
        );

        return apply_filters( 'dokan_settings_fields', $settings_fields );
    }
}
