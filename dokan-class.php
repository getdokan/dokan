<?php

use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\DependencyManagement\Container;

/**
 * WeDevs_Dokan class
 *
 * @class WeDevs_Dokan The class that holds the entire WeDevs_Dokan plugin
 *
 * @property WeDevs\Dokan\Commission    $commission Instance of Commission class
 * @property WeDevs\Dokan\Fees $fees Instance of Fees class
 * @property WeDevs\Dokan\Order\Manager $order Instance of Order Manager class
 * @property WeDevs\Dokan\Product\Manager $product Instance of Order Manager class
 * @property WeDevs\Dokan\Vendor\Manager $vendor Instance of Vendor Manager Class
 * @property WeDevs\Dokan\BackgroundProcess\Manager $bg_process Instance of WeDevs\Dokan\BackgroundProcess\Manager class
 * @property WeDevs\Dokan\Withdraw\Manager $withdraw Instance of WeDevs\Dokan\Withdraw\Manager class
 * @property WeDevs\Dokan\Frontend\Frontend $frontend_manager Instance of \WeDevs\Dokan\Frontend\Frontend class
 * @property WeDevs\Dokan\Registration $registration Instance of WeDevs\Dokan\Registration class
 */
final class WeDevs_Dokan {

    /**
     * Plugin version
     *
     * @var string
     */
    public $version = '4.0.5';

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
    private $min_php = '7.4';

    /**
     * Holds various class instances
     *
     * @since 2.6.10
     *
     * @var array
     */
    private $legacy_container = [];

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
        $this->define_constants();

        register_activation_hook( DOKAN_FILE, [ $this, 'activate' ] );
        register_deactivation_hook( DOKAN_FILE, [ $this, 'deactivate' ] );

        add_action( 'before_woocommerce_init', [ $this, 'declare_woocommerce_feature_compatibility' ] );
        add_action( 'woocommerce_loaded', [ $this, 'init_plugin' ] );
        add_action( 'woocommerce_flush_rewrite_rules', [ $this, 'flush_rewrite_rules' ] );

        // Register admin notices to container and load notices
        $this->get_container()->get( 'admin_notices' );

        $this->init_appsero_tracker();

        add_action( 'plugins_loaded', [ $this, 'woocommerce_not_loaded' ], 11 );
    }

    /**
     * Initializes the WeDevs_Dokan() class
     *
     * Checks for an existing WeDevs_WeDevs_Dokan() instance
     * and if it doesn't find one, create it.
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
     * @return object Class Instance
     */
    public function __get( $prop ) {
        if ( array_key_exists( $prop, $this->legacy_container ) ) {
            return $this->legacy_container[ $prop ];
        }

        if ( $this->get_container()->has( $prop ) ) {
            return $this->get_container()->get( $prop );
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
        return untrailingslashit( plugin_dir_path( DOKAN_FILE ) );
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

        $this->get_container()->get( 'upgrades' );
        $installer = new \WeDevs\Dokan\Install\Installer();
        $installer->do_install();

        // rewrite rules during dokan activation
        if ( $this->has_woocommerce() ) {
            $this->flush_rewrite_rules();
        }
    }

    /**
     * Flush rewrite rules after dokan is activated or woocommerce is activated
     *
     * @since 3.2.8
     */
    public function flush_rewrite_rules() {
        // fix rewrite rules
        $this->get_container()->get( 'rewrite' )->register_rule();
        flush_rewrite_rules();
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
        load_plugin_textdomain( 'dokan-lite', false, dirname( plugin_basename( DOKAN_FILE ) ) . '/languages/' );
    }

    /**
     * Define all constants
     *
     * @return void
     */
    public function define_constants() {
        defined( 'DOKAN_PLUGIN_VERSION' ) || define( 'DOKAN_PLUGIN_VERSION', $this->version );
        defined( 'DOKAN_DIR' ) || define( 'DOKAN_DIR', __DIR__ );
        defined( 'DOKAN_INC_DIR' ) || define( 'DOKAN_INC_DIR', __DIR__ . '/includes' );
        defined( 'DOKAN_LIB_DIR' ) || define( 'DOKAN_LIB_DIR', __DIR__ . '/lib' );
        defined( 'DOKAN_PLUGIN_ASSEST' ) || define( 'DOKAN_PLUGIN_ASSEST', plugins_url( 'assets', DOKAN_FILE ) );

        // give a way to turn off loading styles and scripts from parent theme
        defined( 'DOKAN_LOAD_STYLE' ) || define( 'DOKAN_LOAD_STYLE', true );
        defined( 'DOKAN_LOAD_SCRIPTS' ) || define( 'DOKAN_LOAD_SCRIPTS', true );
    }

    /**
     * Add High Performance Order Storage Support
     *
     * @since 3.8.0
     *
     * @return void
     */
    public function declare_woocommerce_feature_compatibility() {
        if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', DOKAN_FILE, true );
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', DOKAN_FILE, true );
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
        add_action( 'init', [ $this, 'wpdb_table_shortcuts' ], 1 );

        add_action( 'plugins_loaded', [ $this, 'after_plugins_loaded' ] );

        add_filter( 'plugin_action_links_' . plugin_basename( DOKAN_FILE ), [ $this, 'plugin_action_links' ] );
        add_action( 'in_plugin_update_message-dokan-lite/dokan.php', [ \WeDevs\Dokan\Install\Installer::class, 'in_plugin_update_message' ] );

        add_action( 'widgets_init', [ $this, 'register_widgets' ] );

        $hooks = $this->get_container()->get( Hookable::class );
        foreach ( $hooks as $hook ) {
            $hook->register_hooks();
        }
    }

    /**
     * Include all the required files
     *
     * @return void
     */
    public function includes() {
        require_once DOKAN_INC_DIR . '/functions.php';

        if ( ! function_exists( 'dokan_pro' ) ) {
            require_once DOKAN_INC_DIR . '/reports.php';
        }

        require_once DOKAN_INC_DIR . '/Order/functions.php';
        require_once DOKAN_INC_DIR . '/Product/functions.php';
        require_once DOKAN_INC_DIR . '/Withdraw/functions.php';
        require_once DOKAN_INC_DIR . '/functions-compatibility.php';
        require_once DOKAN_INC_DIR . '/wc-functions.php';

        require_once DOKAN_INC_DIR . '/wc-template.php';

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
        $common_services = $this->get_container()->get( 'common-service' );

        if ( is_admin() ) {
            $admin_services = $this->get_container()->get( 'admin-service' );
        } else {
            $frontend_services = $this->get_container()->get( 'frontend-service' );
        }

        $container_services = $this->get_container()->get( 'container-service' );

        $this->legacy_container = apply_filters( 'dokan_get_class_container', $this->legacy_container );

        if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
            $ajax_services = $this->get_container()->get( 'ajax-service' );
        }
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
            $update = false;
            foreach ( $processes as $processor => $file ) {
                if ( file_exists( $file ) ) {
                    include_once $file;
                    new $processor();
                } else {
                    $update = true;
                    unset( $processes[ $processor ] );
                }
            }
            if ( $update ) {
                update_option( 'dokan_background_processes', $processes );
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
        $this->get_container()->get( 'widgets' );
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
            $links[] = '<a href="https://dokan.co/wordpress/" style="color: #389e38;font-weight: bold;" target="_blank">' . __( 'Get Pro', 'dokan-lite' ) . '</a>';
        }

        $links[] = '<a href="' . admin_url( 'admin.php?page=dokan#/settings' ) . '">' . __( 'Settings', 'dokan-lite' ) . '</a>';
        $links[] = '<a href="https://dokan.co/docs/wordpress/" target="_blank">' . __( 'Documentation', 'dokan-lite' ) . '</a>';

        return $links;
    }

    /**
     * Initialize Appsero Tracker
     *
     * @return void
     */
    public function init_appsero_tracker() {
        $this->get_container()->get( 'tracker' );
    }

    /**
     * Check whether woocommerce is installed and active
     *
     * @since 2.9.16
     *
     * @return bool
     */
    public function has_woocommerce() {
        return class_exists( 'WooCommerce' );
    }

    /**
     * Check whether woocommerce is installed
     *
     * @since 3.2.8
     *
     * @return bool
     */
    public function is_woocommerce_installed() {
        return in_array( 'woocommerce/woocommerce.php', array_keys( get_plugins() ), true );
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

    /**
     * Retrieve the container instance.
     *
     * @since 3.13.0
     *
     * @return Container
     */
    public function get_container(): Container {
		return dokan_get_container();
    }
}
