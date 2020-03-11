<?php
/*
Plugin Name: Dokan
Plugin URI: https://wordpress.org/plugins/dokan-lite/
Description: An e-commerce marketplace plugin for WordPress. Powered by WooCommerce and weDevs.
Version: 3.0.1
Author: weDevs
Author URI: https://wedevs.com/
Text Domain: dokan-lite
WC requires at least: 3.0
WC tested up to: 3.9.1
Domain Path: /languages/
License: GPL2
*/

/**
 * Copyright (c) 2019 weDevs (email: info@wedevs.com). All rights reserved.
 *
 * Released under the GPL license
 * http://www.opensource.org/licenses/gpl-license.php
 *
 * This is an add-on for WordPress
 * http://wordpress.org/
 *
 * **********************************************************************
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 * **********************************************************************
 */

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * WeDevs_Dokan class
 *
 * @class WeDevs_Dokan The class that holds the entire WeDevs_Dokan plugin
 */
final class WeDevs_Dokan {

    /**
     * Plugin version
     *
     * @var string
     */
    public $version = '3.0.1';

    /**
     * Instance of self
     *
     * @var WeDevs_Dokan
     */
    private static $instance = null;

    /**
     * Minimum PHP version required
     *
     * @var string
     */
    private $min_php = '5.6.0';

    /**
     * Holds various class instances
     *
     * @since 2.6.10
     *
     * @var array
     */
    private $container = array();

    /**
     * Databse version key
     *
     * @since 3.0.0
     *
     * @var string
     */
    private $db_version_key = 'dokan_theme_version';

    /**
     * Constructor for the WeDevs_Dokan class
     *
     * Sets up all the appropriate hooks and actions
     * within our plugin.
     */
    private function __construct() {
        require_once __DIR__ . '/vendor/autoload.php';

        $this->define_constants();

        register_activation_hook( __FILE__, array( $this, 'activate' ) );
        register_deactivation_hook( __FILE__, array( $this, 'deactivate' ) );

        add_action( 'woocommerce_loaded', array( $this, 'init_plugin' ) );
        add_action( 'admin_notices', array( $this, 'render_missing_woocommerce_notice' ) );
        add_action( 'admin_notices', array( $this, 'render_run_admin_setup_wizard_notice' ) );

        $this->init_appsero_tracker();

        add_action( 'plugins_loaded', array( $this, 'woocommerce_not_loaded' ), 11 );
    }

    /**
     * Initializes the WeDevs_Dokan() class
     *
     * Checks for an existing WeDevs_WeDevs_Dokan() instance
     * and if it doesn't find one, creates it.
     */
    public static function init() {
        if ( self::$instance === null ) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Magic getter to bypass referencing objects
     *
     * @since 2.6.10
     *
     * @param $prop
     *
     * @return Class Instance
     */
    public function __get( $prop ) {
        if ( array_key_exists( $prop, $this->container ) ) {
            return $this->container[ $prop ];
        }
    }

    /**
     * Check if the PHP version is supported
     *
     * @return bool
     */
    public function is_supported_php() {
        if ( version_compare( PHP_VERSION, $this->min_php, '<=' ) ) {
            return false;
        }

        return true;
    }

    /**
     * Get the plugin path.
     *
     * @return string
     */
    public function plugin_path() {
        return untrailingslashit( plugin_dir_path( __FILE__ ) );
    }

    /**
     * Get the template path.
     *
     * @return string
     */
    public function template_path() {
        return apply_filters( 'dokan_template_path', 'dokan/' );
    }

    /**
     * Placeholder for activation function
     *
     * Nothing being called here yet.
     */
    public function activate() {
        if ( ! $this->has_woocommerce() ) {
            set_transient( 'dokan_wc_missing_notice', true );
        }

        if ( ! $this->is_supported_php() ) {
            require_once WC_ABSPATH . 'includes/wc-notice-functions.php';

            wc_print_notice( sprintf( __( 'The Minimum PHP Version Requirement for <b>Dokan</b> is %s. You are Running PHP %s', 'dokan' ), $this->min_php, phpversion(), 'error' ) );
            exit;
        }

        require_once dirname( __FILE__ ) . '/includes/functions.php';
        require_once dirname( __FILE__ ) . '/includes/functions-compatibility.php';

        $this->container['upgrades'] = new \WeDevs\Dokan\Upgrade\Manager();
        $installer = new \WeDevs\Dokan\Install\Installer();
        $installer->do_install();
    }

    /**
     * Placeholder for deactivation function
     *
     * Nothing being called here yet.
     */
    public function deactivate() {
        delete_transient( 'dokan_wc_missing_notice', true );
    }

    /**
     * Initialize plugin for localization
     *
     * @uses load_plugin_textdomain()
     */
    public function localization_setup() {
        load_plugin_textdomain( 'dokan-lite', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
    }

    /**
     * Define all constants
     *
     * @return void
     */
    public function define_constants() {
        $this->define( 'DOKAN_PLUGIN_VERSION', $this->version );
        $this->define( 'DOKAN_FILE', __FILE__ );
        $this->define( 'DOKAN_DIR', dirname( __FILE__ ) );
        $this->define( 'DOKAN_INC_DIR', dirname( __FILE__ ) . '/includes' );
        $this->define( 'DOKAN_LIB_DIR', dirname( __FILE__ ) . '/lib' );
        $this->define( 'DOKAN_PLUGIN_ASSEST', plugins_url( 'assets', __FILE__ ) );

        // give a way to turn off loading styles and scripts from parent theme
        $this->define( 'DOKAN_LOAD_STYLE', true );
        $this->define( 'DOKAN_LOAD_SCRIPTS', true );
    }

    /**
     * Define constant if not already defined
     *
     * @since 2.9.16
     *
     * @param string $name
     * @param string|bool $value
     *
     * @return void
     */
    private function define( $name, $value ) {
        if ( ! defined( $name ) ) {
            define( $name, $value );
        }
    }

    /**
     * Load the plugin after WP User Frontend is loaded
     *
     * @return void
     */
    public function init_plugin() {
        $this->includes();
        $this->init_hooks();

        do_action( 'dokan_loaded' );
    }

    /**
     * Initialize the actions
     *
     * @return void
     */
    function init_hooks() {
        // Localize our plugin
        add_action( 'init', array( $this, 'localization_setup' ) );

        // initialize the classes
        add_action( 'init', array( $this, 'init_classes' ), 4 );
        add_action( 'init', array( $this, 'wpdb_table_shortcuts' ) );

        add_action( 'plugins_loaded', array( $this, 'after_plugins_loaded' ) );

        add_filter( 'plugin_action_links_' . plugin_basename(__FILE__), array( $this, 'plugin_action_links' ) );
        add_action( 'in_plugin_update_message-dokan-lite/dokan.php', array( \WeDevs\Dokan\Install\Installer::class, 'in_plugin_update_message' ) );

        add_action( 'widgets_init', array( $this, 'register_widgets' ) );
    }

    /**
     * Include all the required files
     *
     * @return void
     */
    function includes() {
        require_once DOKAN_DIR . '/depricated/depricated-functions.php';
        require_once DOKAN_DIR . '/depricated/depricated-hooks.php';
        require_once DOKAN_INC_DIR . '/functions.php';
        require_once DOKAN_INC_DIR . '/Order/functions.php';
        require_once DOKAN_INC_DIR . '/Product/functions.php';
        require_once DOKAN_INC_DIR . '/Withdraw/functions.php';
        require_once DOKAN_INC_DIR . '/functions-compatibility.php';
        require_once DOKAN_INC_DIR . '/wc-functions.php';

        require_once DOKAN_INC_DIR . '/wc-template.php';
        require_once DOKAN_DIR . '/depricated/depricated-classes.php';

        if ( is_admin() ) {
            require_once DOKAN_INC_DIR . '/Admin/functions.php';
        } else {
            require_once DOKAN_INC_DIR . '/template-tags.php';
        }
    }

    /**
     * Init all the classes
     *
     * @return void
     */
    function init_classes() {
        new \WeDevs\Dokan\Withdraw\Hooks();
        new \WeDevs\Dokan\Order\Hooks();
        new \WeDevs\Dokan\Product\Hooks();
        new \WeDevs\Dokan\Upgrade\Hooks();

        if ( is_admin() ) {
            new \WeDevs\Dokan\Admin\Hooks();
            new \WeDevs\Dokan\Admin\Menu();
            new \WeDevs\Dokan\Admin\AdminBar();
            new \WeDevs\Dokan\Admin\Pointers();
            new \WeDevs\Dokan\Admin\Settings();
            new \WeDevs\Dokan\Admin\UserProfile();
            new \WeDevs\Dokan\Admin\SetupWizard();
            new \WeDevs\Dokan\Admin\Promotion();
        }

        $this->container['pageview']      = new \WeDevs\Dokan\PageViews();
        $this->container['seller_wizard'] = new \WeDevs\Dokan\Vendor\SetupWizard();
        $this->container['core']          = new \WeDevs\Dokan\Core();
        $this->container['scripts']       = new \WeDevs\Dokan\Assets();
        $this->container['email']         = new \WeDevs\Dokan\Emails\Manager();
        $this->container['vendor']        = new \WeDevs\Dokan\Vendor\Manager();
        $this->container['product']       = new \WeDevs\Dokan\Product\Manager();
        $this->container['shortcodes']    = new \WeDevs\Dokan\Shortcodes\Shortcodes();
        $this->container['registration']  = new \WeDevs\Dokan\Registration();
        $this->container['order']        = new \WeDevs\Dokan\Order\Manager();
        $this->container['api']           = new \WeDevs\Dokan\REST\Manager();
        $this->container['withdraw']      = new \WeDevs\Dokan\Withdraw\Manager();
        $this->container['dashboard']     = new \WeDevs\Dokan\Dashboard\Manager();
        $this->container['rewrite']       = new \WeDevs\Dokan\Rewrites();
        $this->container['commission']    = new \WeDevs\Dokan\Commission();
        $this->container['upgrades']      = new \WeDevs\Dokan\Upgrade\Manager();

        $this->container = apply_filters( 'dokan_get_class_container', $this->container );

        if ( ! is_admin() ) {
            new \WeDevs\Dokan\Vendor\StoreListsFilter();
            new \WeDevs\Dokan\ThemeSupport\Manager();
        }

        if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
            new \WeDevs\Dokan\Ajax();
        }

        new \WeDevs\Dokan\Privacy();
    }

    /**
     * Load table prefix for withdraw and orders table
     *
     * @since 1.0
     *
     * @return void
     */
    public function wpdb_table_shortcuts() {
        global $wpdb;

        $wpdb->dokan_withdraw       = $wpdb->prefix . 'dokan_withdraw';
        $wpdb->dokan_orders         = $wpdb->prefix . 'dokan_orders';
        $wpdb->dokan_announcement   = $wpdb->prefix . 'dokan_announcement';
        $wpdb->dokan_refund         = $wpdb->prefix . 'dokan_refund';
        $wpdb->dokan_vendor_balance = $wpdb->prefix . 'dokan_vendor_balance';
    }

    /**
     * Executed after all plugins are loaded
     *
     * At this point Dokan Pro is loaded
     *
     * @since 2.8.7
     *
     * @return void
     */
    public function after_plugins_loaded() {
        // Initiate background processes
        $processes = get_option( 'dokan_background_processes', array() );

        if ( ! empty( $processes ) ) {
            foreach ( $processes as $processor => $file ) {
                if ( file_exists( $file ) ) {
                    include_once $file;
                    new $processor();
                }
            }
        }
    }

    /**
     * Register widgets
     *
     * @since 2.8
     *
     * @return void
     */
    public function register_widgets() {
        $this->container['widgets'] = new \WeDevs\Dokan\Widgets\Manager();
    }

    /**
     * Returns if the plugin is in PRO version
     *
     * @since 2.4
     *
     * @return boolean
     */
    public function is_pro_exists() {
        return apply_filters( 'dokan_is_pro_exists' , false );
    }

    /**
     * Plugin action links
     *
     * @param  array  $links
     *
     * @since  2.4
     *
     * @return array
     */
    function plugin_action_links( $links ) {
        if ( !$this->is_pro_exists() ) {
            $links[] = '<a href="https://wedevs.com/dokan/" style="color: #389e38;font-weight: bold;" target="_blank">' . __( 'Get Pro', 'dokan-lite' ) . '</a>';
        }

        $links[] = '<a href="' . admin_url( 'admin.php?page=dokan#/settings' ) . '">' . __( 'Settings', 'dokan-lite' ) . '</a>';
        $links[] = '<a href="https://docs.wedevs.com/docs/dokan/" target="_blank">' . __( 'Documentation', 'dokan-lite' ) . '</a>';

        return $links;
    }

    /**
     * Initialize Appsero Tracker
     *
     * @return  void
     */
    public function init_appsero_tracker() {
        $this->container['tracker'] = new \WeDevs\Dokan\Tracker();
    }

    /**
     * Missing woocomerce notice
     *
     * @since 2.9.16
     *
     * @return void
     */
    public function render_missing_woocommerce_notice() {
        if ( ! get_transient( 'dokan_wc_missing_notice' ) ) {
            return;
        }

        if ( $this->has_woocommerce() ) {
            return delete_transient( 'dokan_wc_missing_notice' );
        }

        $plugin_url = self_admin_url( 'plugin-install.php?s=woocommerce&tab=search&type=term' );
        $message    = sprintf( esc_html__( 'Dokan requires WooCommerce to be installed and active. You can activate %s here.', 'dokan-lite' ), '<a href="' . $plugin_url . '">WooCommerce</a>' );

        echo wp_kses_post( sprintf( '<div class="error"><p><strong>%1$s</strong></p></div>', $message ) );
    }

    /**
     * Render run admin setup wizard notice
     *
     * @since 2.9.27
     *
     * @return void
     */
    public function render_run_admin_setup_wizard_notice() {
        $ran_wizard = get_option( 'dokan_admin_setup_wizard_ready', false );

        if ( $ran_wizard ) {
            return;
        }

        // If vendor found, don't show the setup wizard as admin already ran the `setup wizard`
        // without the `dokan_admin_setup_wizard_ready` option.
        $vendor_count = dokan_get_seller_status_count();

        if ( ! empty( $vendor_count['active'] ) ) {
            return update_option( 'dokan_admin_setup_wizard_ready', true );
        }

        require_once DOKAN_INC_DIR . '/functions.php';

        dokan_get_template( 'admin-setup-wizard/run-wizard-notice.php' );
    }

    /**
     * Check whether woocommerce is installed or not
     *
     * @since 2.9.16
     *
     * @return boolean
     */
    public function has_woocommerce() {
        return class_exists( 'WooCommerce' );
    }

    /**
     * Handles scenerios when WooCommerce is not active
     *
     * @since 2.9.27
     *
     * @return void
     */
    public function woocommerce_not_loaded() {
        if ( did_action( 'woocommerce_loaded' ) || ! is_admin() ) {
            return;
        }

        require_once DOKAN_INC_DIR . '/functions.php';

        if ( get_transient( '_dokan_setup_page_redirect' ) ) {
            dokan_redirect_to_admin_setup_wizard();
        }

        new \WeDevs\Dokan\Admin\SetupWizardNoWC();
    }

    /**
     * Get Dokan db version key
     *
     * @since 3.0.0
     *
     * @return string
     */
    public function get_db_version_key() {
        return $this->db_version_key;
    }
}

/**
 * Load Dokan Plugin when all plugins loaded
 *
 * @return void
 */
function dokan() {
    return WeDevs_Dokan::init();
}

// Lets Go....
dokan();
