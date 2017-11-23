<?php
/*
Plugin Name: Dokan
Plugin URI: https://wordpress.org/plugins/dokan-lite/
Description: An e-commerce marketplace plugin for WordPress. Powered by WooCommerce and weDevs.
Version: 2.7.0
Author: weDevs
Author URI: https://wedevs.com/
Text Domain: dokan-lite
Domain Path: /languages/
License: GPL2
*/

/**
 * Copyright (c) 2015 weDevs (email: info@wedevs.com). All rights reserved.
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
 * Autoload class files on demand
 *
 * `Dokan_Installer` becomes => installer.php
 * `Dokan_Template_Report` becomes => template-report.php
 *
 * @since 1.0
 *
 * @param string  $class requested class name
 */
function dokan_autoload( $class ) {
    if ( stripos( $class, 'Dokan_' ) !== false ) {
        $class_name = str_replace( array( 'Dokan_', '_' ), array( '', '-' ), $class );
        $file_path = __DIR__ . '/classes/' . strtolower( $class_name ) . '.php';

        if ( file_exists( $file_path ) ) {
            require_once $file_path;
        }
    }
}

spl_autoload_register( 'dokan_autoload' );

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
    public $version = '2.7.0';

    /**
     * Holds various class instances
     *
     * @since 2.6.10
     *
     * @var array
     */
    private $container = array();

    /**
     * Constructor for the WeDevs_Dokan class
     *
     * Sets up all the appropriate hooks and actions
     * within our plugin.
     *
     * @uses register_activation_hook()
     * @uses register_deactivation_hook()
     * @uses is_admin()
     * @uses add_action()
     */
    public function __construct() {

        $this->define_constants();

        register_activation_hook( __FILE__, array( $this, 'activate' ) );
        register_deactivation_hook( __FILE__, array( $this, 'deactivate' ) );

        add_action( 'plugins_loaded', array( $this, 'init_plugin' ) );
    }

    /**
     * Initializes the WeDevs_Dokan() class
     *
     * Checks for an existing WeDevs_WeDevs_Dokan() instance
     * and if it doesn't find one, creates it.
     */
    public static function init() {
        static $instance = false;

        if ( ! $instance ) {
            $instance = new WeDevs_Dokan();
        }

        return $instance;
    }

    /**
     * Magic getter to bypass referencing objects
     *
     * @since 2.6.10
     *
     * @param $prop
     *
     * @return mixed
     */
    public function __get( $prop ) {
        if ( array_key_exists( $prop, $this->container ) ) {
            return $this->container[ $prop ];
        }

        return $this->{$prop};
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
        if ( ! function_exists( 'WC' ) ) {
            require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
            deactivate_plugins( plugin_basename( __FILE__ ) );

            wp_die( '<div class="error"><p>' . sprintf( __( '<b>Dokan</b> requires %sWooCommerce%s to be installed & activated!', 'dokan-lite' ), '<a target="_blank" href="https://wordpress.org/plugins/woocommerce/">', '</a>' ) . '</p></div>' );
        }

        require_once __DIR__ . '/includes/functions.php';

        $installer = new Dokan_Installer();
        $installer->do_install();
    }

    /**
     * Placeholder for deactivation function
     *
     * Nothing being called here yet.
     */
    public function deactivate() {

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
        if ( ! defined( '__DIR__' ) ) {
            define( '__DIR__', dirname( __FILE__ ) );
        }

        define( 'DOKAN_PLUGIN_VERSION', $this->version );
        define( 'DOKAN_FILE', __FILE__ );
        define( 'DOKAN_DIR', __DIR__ );
        define( 'DOKAN_INC_DIR', __DIR__ . '/includes' );
        define( 'DOKAN_LIB_DIR', __DIR__ . '/lib' );
        define( 'DOKAN_PLUGIN_ASSEST', plugins_url( 'assets', __FILE__ ) );

        // give a way to turn off loading styles and scripts from parent theme
        if ( ! defined( 'DOKAN_LOAD_STYLE' ) ) {
            define( 'DOKAN_LOAD_STYLE', true );
        }

        if ( ! defined( 'DOKAN_LOAD_SCRIPTS' ) ) {
            define( 'DOKAN_LOAD_SCRIPTS', true );
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
        add_action( 'after_setup_theme', array( $this, 'init_classes' ) );
        add_action( 'init', array( $this, 'wpdb_table_shortcuts' ) );

        add_filter( 'plugin_action_links_' . plugin_basename(__FILE__), array( $this, 'plugin_action_links' ) );
        add_action( 'in_plugin_update_message-dokan-lite/dokan.php', array( 'Dokan_Installer', 'in_plugin_update_message' ) );
    }

    /**
     * Include all the required files
     *
     * @return void
     */
    function includes() {
        $lib_dir     = __DIR__ . '/lib/';
        $inc_dir     = __DIR__ . '/includes/';
        $classes_dir = __DIR__ . '/classes/';

        require_once $inc_dir . 'functions.php';
        require_once $inc_dir . 'functions-depricated.php';
        require_once $inc_dir . 'functions-compatibility.php';
        require_once $inc_dir . 'widgets/menu-category.php';
        require_once $inc_dir . 'widgets/bestselling-product.php';
        require_once $inc_dir . 'widgets/top-rated-product.php';
        require_once $inc_dir . 'widgets/store-menu-category.php';
        require_once $inc_dir . 'widgets/store-menu.php';
        require_once $inc_dir . 'widgets/store-location.php';
        require_once $inc_dir . 'widgets/store-contact.php';
        require_once $inc_dir . 'wc-functions.php';
        require_once $lib_dir . 'class-wedevs-insights.php';
        require_once $inc_dir . '/admin/setup-wizard.php';
        require_once $classes_dir . 'seller-setup-wizard.php';

        require_once $inc_dir . 'wc-template.php';

        require_once $inc_dir . 'class-core.php';
        require_once $inc_dir . 'class-scripts.php';
        require_once $inc_dir . 'class-email.php';
        require_once $inc_dir . 'class-vendor.php';
        require_once $inc_dir . 'class-vendor-manager.php';
        require_once $inc_dir . 'class-product-manager.php';

        if ( is_admin() ) {
            require_once $inc_dir . 'admin/class-settings.php';
            require_once $inc_dir . 'admin/class-admin.php';
            require_once $inc_dir . 'admin/class-ajax.php';
            require_once $inc_dir . 'admin/class-admin-pointers.php';
            require_once $inc_dir . 'admin-functions.php';
            require_once $lib_dir . '/class-weforms-upsell.php';
        } else {
            require_once $inc_dir . 'template-tags.php';
        }

        if ( WC_VERSION > 2.7 ) {
            require_once $inc_dir . 'wc-crud-functions.php';
        } else {
            require_once $inc_dir . 'wc-legacy-functions.php';
        }
    }

    /**
     * Init all the classes
     *
     * @return void
     */
    function init_classes() {
        if ( is_admin() ) {
            new Dokan_Admin_User_Profile();
            Dokan_Admin_Ajax::init();
            new Dokan_Upgrade();
            new WeForms_Upsell( '409' );
        } else {
            new Dokan_Pageviews();
        }

        new Dokan_Rewrites();
        new Dokan_Tracker();

        $this->container['core']    = new Dokan_Core();
        $this->container['scripts'] = new Dokan_Scripts();
        $this->container['email']   = Dokan_Email::init();
        $this->container['vendor']  = new Dokan_Vendor_Manager();
        $this->container['product']  = new Dokan_Product_Manager();

        if ( is_user_logged_in() ) {
            Dokan_Template_Shortcodes::init();
            Dokan_Template_Main::init();
            Dokan_Template_Dashboard::init();
            Dokan_Template_Products::init();
            Dokan_Template_Orders::init();
            Dokan_Template_Withdraw::init();
            Dokan_Template_Settings::init();
        }

        if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
            Dokan_Ajax::init()->init_ajax();
        }
        // print_r( dokan()->vendor->get_total() );
    }

    /**
     * Scripts and styles for admin panel
     */
    function admin_enqueue_scripts( $hook ) {
        wp_enqueue_style( 'dokan-admin-css', DOKAN_PLUGIN_ASSEST.'/css/admin.css', false, time() );

        wp_enqueue_script( 'dokan-tooltip' );
        wp_enqueue_script( 'dokan_slider_admin', DOKAN_PLUGIN_ASSEST.'/js/dokan-admin.js', array( 'jquery' ) );

        if ( 'plugins.php' == $hook ) {
            wp_enqueue_style( 'dokan-plugin-list-css', DOKAN_PLUGIN_ASSEST.'/css/plugin.css', false, null );
        }

        do_action( 'dokan_enqueue_admin_scripts' );
    }

    /**
     * Load table prefix for withdraw and orders table
     *
     * @since 1.0
     *
     * @return void
     */
    function wpdb_table_shortcuts() {
        global $wpdb;

        $wpdb->dokan_withdraw     = $wpdb->prefix . 'dokan_withdraw';
        $wpdb->dokan_orders       = $wpdb->prefix . 'dokan_orders';
        $wpdb->dokan_announcement = $wpdb->prefix . 'dokan_announcement';
        $wpdb->dokan_refund       = $wpdb->prefix . 'dokan_refund';
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

        $links[] = '<a href="' . admin_url( 'admin.php?page=dokan-settings' ) . '">' . __( 'Settings', 'dokan-lite' ) . '</a>';
        $links[] = '<a href="https://docs.wedevs.com/docs/dokan/" target="_blank">' . __( 'Documentation', 'dokan-lite' ) . '</a>';

        return $links;
    }

} // WeDevs_Dokan

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

add_action( 'activated_plugin', array( 'Dokan_Installer', 'setup_page_redirect' ) );
