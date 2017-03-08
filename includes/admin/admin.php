<?php

if ( !class_exists( 'Dokan_Settings_API' ) ) {
    require_once DOKAN_LIB_DIR . '/class.dokan-settings-api.php';
}

/**
 * WordPress settings API For Dokan Admin Settings class
 *
 * @author Tareq Hasan
 */
class Dokan_Admin_Settings {

    private $settings_api;

    /**
     * Constructor for the Dokan_Admin_Settings class
     *
     * Sets up all the appropriate hooks and actions
     * within our plugin.
     *
     * @return void
     */
    function __construct() {
        $this->settings_api = new Dokan_Settings_API();

        add_action( 'admin_init', array($this, 'do_updates') );
        add_action( 'admin_init', array($this, 'admin_init') );

        add_action( 'admin_menu', array($this, 'admin_menu') );

        add_action( 'admin_head', array( $this, 'welcome_page_remove' ) );

        add_action( 'admin_notices', array($this, 'update_notice' ) );
        add_action( 'wp_before_admin_bar_render', array( $this, 'dokan_admin_toolbar' ) );
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
    public static function get_post_type( $post_type ) {
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
     * Dashboard scripts and styles
     *
     * @since 1.0
     *
     * @return void
     */
    function dashboard_script() {
        wp_enqueue_style( 'dokan-admin-dash', DOKAN_PLUGIN_ASSEST . '/css/admin.css' );

        wp_enqueue_style( 'dokan-admin-report', DOKAN_PLUGIN_ASSEST . '/css/admin.css' );
        wp_enqueue_style( 'jquery-ui' );
        wp_enqueue_style( 'dokan-chosen-style' );

        wp_enqueue_script( 'jquery-ui-datepicker' );
        wp_enqueue_script( 'dokan-flot' );
        wp_enqueue_script( 'dokan-chart' );
        wp_enqueue_script( 'dokan-chosen' );

        do_action( 'dokan_enqueue_admin_dashboard_script' );
    }

    /**
     * Initialize Settings tab and sections content
     *
     * @since 1.0
     *
     * @return void
     */
    function admin_init() {
        Dokan_Admin_Withdraw::init()->bulk_action_handler();

        //set the settings
        $this->settings_api->set_sections( $this->get_settings_sections() );
        $this->settings_api->set_fields( $this->get_settings_fields() );

        //initialize settings
        $this->settings_api->admin_init();
    }

    /**
     * Load admin Menu
     *
     * @since 1.0
     *
     * @return void
     */
    function admin_menu() {
        $menu_position = apply_filters( 'dokan_menu_position', 17 );
        $capability    = apply_filters( 'dokan_menu_capability', 'manage_options' );
        $withdraw      = dokan_get_withdraw_count();
        $withdraw_text = __( 'Withdraw', 'dokan-lite' );

        if ( $withdraw['pending'] ) {
            $withdraw_text = sprintf( __( 'Withdraw %s', 'dokan-lite' ), '<span class="awaiting-mod count-1"><span class="pending-count">' . $withdraw['pending'] . '</span></span>' );
        }

        $dashboard = add_menu_page( __( 'Dokan', 'dokan-lite' ), __( 'Dokan', 'dokan-lite' ), $capability, 'dokan', array( $this, 'dashboard'), 'dashicons-vault', $menu_position );
        add_submenu_page( 'dokan', __( 'Dokan Dashboard', 'dokan-lite' ), __( 'Dashboard', 'dokan-lite' ), $capability, 'dokan', array( $this, 'dashboard' ) );
        add_submenu_page( 'dokan', __( 'Withdraw', 'dokan-lite' ), $withdraw_text, $capability, 'dokan-withdraw', array( $this, 'withdraw_page' ) );
        add_submenu_page( 'dokan', __( 'PRO Features', 'dokan-lite' ), __( 'PRO Features', 'dokan-lite' ), $capability, 'dokan-pro-features', array( $this, 'pro_features' ) );

        do_action( 'dokan_admin_menu', $capability, $menu_position );

        $settings = add_submenu_page( 'dokan', __( 'Settings', 'dokan-lite' ), __( 'Settings', 'dokan-lite' ), $capability, 'dokan-settings', array( $this, 'settings_page' ) );
        add_submenu_page( 'dokan', __( 'Add Ons', 'dokan-lite' ), __( 'Add-ons', 'dokan-lite' ), $capability, 'dokan-addons', array($this, 'addon_page' ) );

        /**
         * Welcome page
         *
         * @since 2.4.3
         */
        add_dashboard_page( __( 'Welcome to Dokan', 'dokan-lite' ), __( 'Welcome to Dokan', 'dokan-lite' ), $capability, 'dokan-welcome', array( $this, 'welcome_page' ) );

        add_action( $dashboard, array($this, 'dashboard_script' ) );
        add_action( $settings, array($this, 'dashboard_script' ) );
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
                'title' => __( 'General', 'dokan-lite' )
            ),
            array(
                'id'    => 'dokan_selling',
                'title' => __( 'Selling Options', 'dokan-lite' )
            ),
            array(
                'id'    => 'dokan_withdraw',
                'title' => __( 'Withdraw Options', 'dokan-lite' )
            ),
            array(
                'id'    => 'dokan_pages',
                'title' => __( 'Page Settings', 'dokan-lite' )
            ),
            array(
                'id'    => 'dokan_appearance',
                'title' => __( 'Appearance', 'dokan-lite' )
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
        $pages_array = self::get_post_type( 'page' );
        $slider_array = self::get_post_type( 'dokan_slider' );

        $settings_fields = array(
            'dokan_general' => array(
                'admin_access' => array(
                    'name'    => 'admin_access',
                    'label'   => __( 'Admin area access', 'dokan-lite' ),
                    'desc'    => __( 'Disable vendors and customers from accessing wp-admin area', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on'
                ),
                'custom_store_url' => array(
                    'name'    => 'custom_store_url',
                    'label'   => __( 'Vendor Store URL', 'dokan-lite' ),
                    'desc'    => sprintf( __( 'Define seller store URL (%s<strong>[this-text]</strong>/[seller-name])', 'dokan-lite' ), site_url( '/' ) ),
                    'default' => 'store',
                    'type'    => 'text',
                ),
                'seller_enable_terms_and_conditions' => array(
                    'name'    => 'seller_enable_terms_and_conditions',
                    'label'   => __( 'Terms and Conditions', 'dokan-lite' ),
                    'desc'    => __( 'Enable terms and conditions for vendor store', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'off'
                 ),
                'extra_fee_recipient' => array(
                    'name'    => 'extra_fee_recipient',
                    'label'   => __( 'Extra Fee Recipient', 'dokan-lite' ),
                    'desc'    => __( 'Extra fees like shipping and tax will go to', 'dokan-lite' ),
                    'type'    => 'select',
                    'options' => array( 'seller' => __( 'Vendor', 'dokan-lite' ), 'admin' => __( 'Admin', 'dokan-lite' ) ),
                    'default' => 'seller'
                ),
                'store_map'                  => array(
                    'name'    => 'store_map',
                    'label'   => __( 'Show Map on Store Page', 'dokan-lite' ),
                    'desc'    => __( 'Enable showing Store location map on store left sidebar', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on'
                ),
                'gmap_api_key'               => array(
                    'name'  => 'gmap_api_key',
                    'label' => __( 'Google Map API key', 'dokan-lite' ),
                    'desc'  => __( '<a href="https://developers.google.com/maps/documentation/javascript/" target="_blank">API Key</a> is needed to display map on store page', 'dokan-lite' ),
                    'type'  => 'text',
                ),
                'contact_seller'             => array(
                    'name'    => 'contact_seller',
                    'label'   => __( 'Show Contact Form on Store Page', 'dokan-lite' ),
                    'desc'    => __( 'Enable showing contact vendor form on store left sidebar', 'dokan-lite' ),
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
                    'desc'    => __( 'Allow newly registered vendors to upload products', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on'
                ),
                'seller_percentage' => array(
                    'name'    => 'seller_percentage',
                    'label'   => __( 'Vendor Commission %', 'dokan-lite' ),
                    'desc'    => __( 'How much amount (%) a vendor will get from each order', 'dokan-lite' ),
                    'default' => '90',
                    'type'    => 'text',
                ),
                'order_status_change' => array(
                    'name'    => 'order_status_change',
                    'label'   => __( 'Order Status Change', 'dokan-lite' ),
                    'desc'    => __( 'Vendor can change order status', 'dokan-lite' ),
                    'type'    => 'checkbox',
                    'default' => 'on'
                ),
                'disable_product_popup' => array(
                    'name'    => 'disable_product_popup',
                    'label'   => __( 'Disable Product Popup', 'dokan-lite' ),
                    'desc'    => __( 'Disable add new product popup view', 'dokan-lite' ),
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
                    'desc'    => __( 'Minimum balance required to make a withdraw request', 'dokan-lite' ),
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
                    'options' => $pages_array
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

    /**
     * Render Settings Page
     *
     * @since 1.0
     *
     * @return void
     */
    function settings_page() {
        echo '<div class="wrap">';
        settings_errors();

        $this->settings_api->show_navigation();
        $this->settings_api->show_forms();

        echo '</div>';
    }

    /**
     * Load Dashboard Template
     *
     * @since 1.0
     *
     * @return void
     */
    function dashboard() {
        include dirname(__FILE__) . '/dashboard.php';
    }

    /**
     * Load withdraw template
     *
     * @since 1.0
     *
     * @return void
     */
    function withdraw_page() {
        include dirname(__FILE__) . '/withdraw.php';
    }

    /**
     * Pro listing page
     *
     * @since 2.5.3
     *
     * @return void
     */
    function pro_features() {
        include dirname(__FILE__) . '/pro-features.php';
    }


    /**
     * Laad Addon template
     *
     * @since 1.0
     *
     * @return void
     */
    function addon_page() {
        include dirname(__FILE__) . '/add-on.php';
    }

    /**
     * Include welcome page template
     *
     * @since 2.4.3
     *
     * @return void
     */
    function welcome_page() {
        include_once DOKAN_INC_DIR . '/admin/welcome.php';
    }

    /**
     * Remove the welcome page dashboard menu
     *
     * @since 2.4.3
     *
     * @return void
     */
    function welcome_page_remove() {
        remove_submenu_page( 'index.php', 'dokan-welcome' );
    }

    /**
     * Add Menu in Dashboard Top bar
     * @return array [top menu bar]
     */
    function dokan_admin_toolbar() {
        global $wp_admin_bar;

        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        $args = array(
            'id'     => 'dokan',
            'title'  => __( 'Dokan', 'admin' ),
            'href'   => admin_url( 'admin.php?page=dokan' )
        );

        $wp_admin_bar->add_menu( $args );

        $wp_admin_bar->add_menu( array(
            'id'     => 'dokan-dashboard',
            'parent' => 'dokan',
            'title'  => __( 'Dokan Dashboard', 'dokan-lite' ),
            'href'   => admin_url( 'admin.php?page=dokan' )
        ) );

        $wp_admin_bar->add_menu( array(
            'id'     => 'dokan-withdraw',
            'parent' => 'dokan',
            'title'  => __( 'Withdraw', 'dokan-lite' ),
            'href'   => admin_url( 'admin.php?page=dokan-withdraw' )
        ) );

        $wp_admin_bar->add_menu( array(
            'id'     => 'dokan-pro-features',
            'parent' => 'dokan',
            'title'  => __( 'PRO Features', 'dokan-lite' ),
            'href'   => admin_url( 'admin.php?page=dokan-pro-features' )
        ) );

        $wp_admin_bar->add_menu( array(
            'id'     => 'dokan-settings',
            'parent' => 'dokan',
            'title'  => __( 'Settings', 'dokan-lite' ),
            'href'   => admin_url( 'admin.php?page=dokan-settings' )
        ) );

        /**
         * Add new or remove toolbar
         *
         * @since 2.5.3
         */
        do_action( 'dokan_render_admin_toolbar', $wp_admin_bar );
    }

    /**
     * Doing Updates and upgrade
     *
     * @since 1.0
     *
     * @return void
     */
    public function do_updates() {
        if ( isset( $_GET['dokan_do_update'] ) && $_GET['dokan_do_update'] == 'true' ) {
            $installer = new Dokan_Installer();
            $installer->do_upgrades();
        }
    }

    /**
     * Check is dokan need any update
     *
     * @since 1.0
     *
     * @return boolean
     */
    public function is_dokan_needs_update() {
        $installed_version = get_option( 'dokan_theme_version' );

        // may be it's the first install
        if ( ! $installed_version ) {
            return false;
        }

        if ( version_compare( $installed_version, '1.2', '<' ) ) {
            return true;
        }

        return false;
    }

    /**
     * Show update notice in dokan dashboard
     *
     * @since 1.0
     *
     * @return void
     */
    public function update_notice() {
        if ( ! $this->is_dokan_needs_update() ) {
            return;
        }
        ?>
        <div id="message" class="updated">
            <p><?php _e( '<strong>Dokan Data Update Required</strong> &#8211; We need to update your install to the latest version', 'dokan-lite' ); ?></p>
            <p class="submit"><a href="<?php echo add_query_arg( 'dokan_do_update', 'true', admin_url( 'admin.php?page=dokan' ) ); ?>" class="dokan-update-btn button-primary"><?php _e( 'Run the updater', 'dokan-lite' ); ?></a></p>
        </div>

        <script type="text/javascript">
            jQuery('.dokan-update-btn').click('click', function(){
                return confirm( '<?php _e( 'It is strongly recommended that you backup your database before proceeding. Are you sure you wish to run the updater now?', 'dokan-lite' ); ?>' );
            });
        </script>
    <?php
    }
}

$settings = new Dokan_Admin_Settings();
