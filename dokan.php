<?php
/**
 * Plugin Name: Dokan
 * Plugin URI: https://wordpress.org/plugins/dokan-lite/
 * Description: An e-commerce marketplace plugin for WordPress. Powered by WooCommerce and weDevs.
 * Version: 3.2.6
 * Author: weDevs
 * Author URI: https://wedevs.com/
 * Text Domain: dokan-lite
 * WC requires at least: 3.0
 * WC tested up to: 5.2.2
 * Domain Path: /languages/
 * License: GPL2
 */

/*
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
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

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
    public $version = '3.2.6';

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
    private $container = [];

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

        register_activation_hook( __FILE__, [ $this, 'activate' ] );
        register_deactivation_hook( __FILE__, [ $this, 'deactivate' ] );

        add_action( 'woocommerce_loaded', [ $this, 'init_plugin' ] );
        add_action( 'admin_notices', [ $this, 'render_missing_woocommerce_notice' ] );
        add_action( 'admin_notices', [ $this, 'render_run_admin_setup_wizard_notice' ] );

        $this->init_appsero_tracker();

        add_action( 'plugins_loaded', [ $this, 'woocommerce_not_loaded' ], 11 );
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
     * @param string $prop
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

            /* translators: 1: Required PHP Version 2: Running php version */
            wc_print_notice( sprintf( __( 'The Minimum PHP Version Requirement for <b>Dokan</b> is %1$s. You are Running PHP %2$s', 'dokan-lite' ), $this->min_php, phpversion() ), 'error' );
            exit;
        }

        require_once __DIR__ . '/includes/functions.php';
        require_once __DIR__ . '/includes/functions-compatibility.php';

        $this->container['upgrades'] = new \WeDevs\Dokan\Upgrade\Manager();
        $installer                   = new \WeDevs\Dokan\Install\Installer();
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
        $this->define( 'DOKAN_DIR', __DIR__ );
        $this->define( 'DOKAN_INC_DIR', __DIR__ . '/includes' );
        $this->define( 'DOKAN_LIB_DIR', __DIR__ . '/lib' );
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
     * @param string      $name
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
    public function init_hooks() {
        // Localize our plugin
        add_action( 'init', [ $this, 'localization_setup' ] );

        // initialize the classes
        add_action( 'init', [ $this, 'init_classes' ], 4 );
        add_action( 'init', [ $this, 'wpdb_table_shortcuts' ] );

        add_action( 'plugins_loaded', [ $this, 'after_plugins_loaded' ] );

        add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), [ $this, 'plugin_action_links' ] );
        add_action( 'in_plugin_update_message-dokan-lite/dokan.php', [ \WeDevs\Dokan\Install\Installer::class, 'in_plugin_update_message' ] );

        add_action( 'widgets_init', [ $this, 'register_widgets' ] );
    }

    /**
     * Include all the required files
     *
     * @return void
     */
    public function includes() {
        require_once DOKAN_DIR . '/deprecated/deprecated-functions.php';
        require_once DOKAN_DIR . '/deprecated/deprecated-hooks.php';
        require_once DOKAN_INC_DIR . '/functions.php';
        require_once DOKAN_INC_DIR . '/Order/functions.php';
        require_once DOKAN_INC_DIR . '/Product/functions.php';
        require_once DOKAN_INC_DIR . '/Withdraw/functions.php';
        require_once DOKAN_INC_DIR . '/functions-compatibility.php';
        require_once DOKAN_INC_DIR . '/wc-functions.php';

        require_once DOKAN_INC_DIR . '/wc-template.php';
        require_once DOKAN_DIR . '/deprecated/deprecated-classes.php';

        if ( is_admin() ) {
            require_once DOKAN_INC_DIR . '/Admin/functions.php';
        } else {
            require_once DOKAN_INC_DIR . '/template-tags.php';
        }

        require_once DOKAN_INC_DIR . '/store-functions.php';
    }

    /**
     * Init all the classes
     *
     * @return void
     */
    public function init_classes() {
        new \WeDevs\Dokan\Withdraw\Hooks();
        new \WeDevs\Dokan\Order\Hooks();
        new \WeDevs\Dokan\Product\Hooks();
        new \WeDevs\Dokan\Upgrade\Hooks();
        new \WeDevs\Dokan\Vendor\UserSwitch();

        if ( is_admin() ) {
            new \WeDevs\Dokan\Admin\Hooks();
            new \WeDevs\Dokan\Admin\Menu();
            new \WeDevs\Dokan\Admin\AdminBar();
            new \WeDevs\Dokan\Admin\Pointers();
            new \WeDevs\Dokan\Admin\Settings();
            new \WeDevs\Dokan\Admin\UserProfile();
            new \WeDevs\Dokan\Admin\SetupWizard();
            new \WeDevs\Dokan\Admin\Promotion();
            new \WeDevs\Dokan\Admin\LimitedTimePromotion();
        } else {
            new \WeDevs\Dokan\Vendor\StoreListsFilter();
            new \WeDevs\Dokan\ThemeSupport\Manager();
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
        $this->container['order']         = new \WeDevs\Dokan\Order\Manager();
        $this->container['api']           = new \WeDevs\Dokan\REST\Manager();
        $this->container['withdraw']      = new \WeDevs\Dokan\Withdraw\Manager();
        $this->container['dashboard']     = new \WeDevs\Dokan\Dashboard\Manager();
        $this->container['rewrite']       = new \WeDevs\Dokan\Rewrites();
        $this->container['commission']    = new \WeDevs\Dokan\Commission();
        $this->container['customizer']    = new \WeDevs\Dokan\Customizer();
        $this->container['upgrades']      = new \WeDevs\Dokan\Upgrade\Manager();

        $this->container = apply_filters( 'dokan_get_class_container', $this->container );

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
        $processes = get_option( 'dokan_background_processes', [] );

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
     * @return bool
     */
    public function is_pro_exists() {
        return apply_filters( 'dokan_is_pro_exists', false );
    }

    /**
     * Plugin action links
     *
     * @param array $links
     *
     * @since  2.4
     *
     * @return array
     */
    public function plugin_action_links( $links ) {
        if ( ! $this->is_pro_exists() ) {
            $links[] = '<a href="https://wedevs.com/dokan/" style="color: #389e38;font-weight: bold;" target="_blank">' . __( 'Get Pro', 'dokan-lite' ) . '</a>';
        }

        $links[] = '<a href="' . admin_url( 'admin.php?page=dokan#/settings' ) . '">' . __( 'Settings', 'dokan-lite' ) . '</a>';
        $links[] = '<a href="https://docs.wedevs.com/docs/dokan/" target="_blank">' . __( 'Documentation', 'dokan-lite' ) . '</a>';

        return $links;
    }

    /**
     * Initialize Appsero Tracker
     *
     * @return void
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

        /* translators: %s: wc plugin url */
        $message = sprintf( __( 'Dokan requires WooCommerce to be installed and active. You can activate <a href="%s">WooCommerce</a> here.', 'dokan-lite' ), $plugin_url );

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
     * @return bool
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
 * @return WeDevs_Dokan
 */
function dokan() {
    return WeDevs_Dokan::init();
}

// Lets Go....
dokan();
