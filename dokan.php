<?php
/*
Plugin Name: Dokan (Lite) - Multi-vendor Marketplace
Plugin URI: https://wordpress.org/plugins/dokan-lite/
Description: An e-commerce marketplace plugin for WordPress. Powered by WooCommerce and weDevs.
Version: 2.5.5
Author: Tareq Hasan
Author URI: http://tareq.co/
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

// Backwards compatibility for older than PHP 5.3.0
if ( !defined( '__DIR__' ) ) {
    define( '__DIR__', dirname( __FILE__ ) );
}

define( 'DOKAN_PLUGIN_VERSION', '2.5.5' );
define( 'DOKAN_FILE', __FILE__ );
define( 'DOKAN_DIR', __DIR__ );
define( 'DOKAN_INC_DIR', __DIR__ . '/includes' );
define( 'DOKAN_LIB_DIR', __DIR__ . '/lib' );
define( 'DOKAN_PLUGIN_ASSEST', plugins_url( 'assets', __FILE__ ) );

// give a way to turn off loading styles and scripts from parent theme
if ( !defined( 'DOKAN_LOAD_STYLE' ) ) {
    define( 'DOKAN_LOAD_STYLE', true );
}

if ( !defined( 'DOKAN_LOAD_SCRIPTS' ) ) {
    define( 'DOKAN_LOAD_SCRIPTS', true );
}

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

        if ( ! function_exists( 'WC' ) ) {
            require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
            deactivate_plugins( plugin_basename( __FILE__ ) );

            wp_die( '<div class="error"><p>' . sprintf( __( '<b>Dokan</b> requires %sWooCommerce%s to be installed & activated!', 'dokan-lite' ), '<a target="_blank" href="https://wordpress.org/plugins/woocommerce/">', '</a>' ) . '</p></div>' );
        }

        global $wpdb;

        $wpdb->dokan_withdraw = $wpdb->prefix . 'dokan_withdraw';
        $wpdb->dokan_orders   = $wpdb->prefix . 'dokan_orders';

        //includes file
        $this->includes();

        // init actions and filter
        $this->init_filters();
        $this->init_actions();

        // initialize classes
        $this->init_classes();

        //for reviews ajax request
        $this->init_ajax();

        do_action( 'dokan_loaded' );
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
    public static function activate() {
        if ( ! function_exists( 'WC' ) ) {
            return;
        }

        global $wpdb;

        $wpdb->dokan_withdraw     = $wpdb->prefix . 'dokan_withdraw';
        $wpdb->dokan_orders       = $wpdb->prefix . 'dokan_orders';
        $wpdb->dokan_announcement = $wpdb->prefix . 'dokan_announcement';
        $wpdb->dokan_refund       = $wpdb->prefix . 'dokan_refund';

        require_once __DIR__ . '/includes/functions.php';

        $installer = new Dokan_Installer();
        $installer->do_install();
    }

    /**
     * Placeholder for deactivation function
     *
     * Nothing being called here yet.
     */
    public static function deactivate() {

    }

    /**
     * Initialize plugin for localization
     *
     * @uses load_plugin_textdomain()
     */
    public function localization_setup() {
        load_plugin_textdomain( 'dokan', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
    }

    function init_actions() {

        // Localize our plugin
        add_action( 'admin_init', array( $this, 'load_table_prifix' ) );

        add_action( 'init', array( $this, 'localization_setup' ) );
        add_action( 'init', array( $this, 'register_scripts' ) );

        add_action( 'template_redirect', array( $this, 'redirect_if_not_logged_seller' ), 11 );

        add_action( 'wp_enqueue_scripts', array( $this, 'scripts' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );

        add_filter( 'dokan_localized_args', array( $this, 'conditional_localized_args' ) );

        //add_action( 'login_enqueue_scripts', array( $this, 'login_scripts') );

        // add_action( 'admin_init', array( $this, 'install_theme' ) );
        add_action( 'admin_init', array( $this, 'block_admin_access' ) );
        add_filter( 'plugin_action_links_' . plugin_basename(__FILE__), array( $this, 'plugin_action_links' ) );
    }

    public function register_scripts() {

        $suffix   = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';
        $vendor   = DOKAN_PLUGIN_ASSEST . '/vendors';

        // Register Vendors styles
        wp_register_style( 'jquery-ui', $vendor . '/jquery-ui/jquery-ui-1.10.0.custom.css', false, null );
        wp_register_style( 'dokan-fontawesome', $vendor . '/font-awesome/font-awesome.min.css', false, null );
        wp_register_style( 'dokan-chosen-style', $vendor . '/chosen/chosen.min.css', false, null );
        wp_register_style( 'dokan-magnific-popup', $vendor . '/magnific/magnific-popup.css', false, null );
        wp_register_style( 'dokan-modalcss', $vendor . '/modal/modal.css', false, null );
        wp_register_style( 'dokan-select2-css', $vendor . '/select2/select2.css', false, null );

        // wp_register_style( 'dokan-extra', plugins_url( 'assets/css/dokan-extra.css', __FILE__ ), false, null );

        // Core styles
        wp_register_style( 'dokan-style', plugins_url( 'assets/css/style.css', __FILE__ ), false, null );

        // Register Vendors scripts
        wp_register_script( 'dokan-chart', $vendor . '/chart/Chart.min.js', false, null, true );
        wp_register_script( 'dokan-tabs', $vendor . '/easytab/jquery.easytabs.min.js', false, null, true );
        wp_register_script( 'dokan-chosen', $vendor . '/chosen/chosen.jquery.min.js', array( 'jquery' ), null, true );
        wp_register_script( 'dokan-popup', $vendor . '/magnific/jquery.magnific-popup.min.js', array( 'jquery' ), null, true );
        wp_register_script( 'dokan-modaljs', $vendor . '/modal/modal.js', array( 'jquery' ), null, true );
        wp_register_script( 'dokan-tooltip', $vendor . '/tooltips/tooltips.js', array( 'jquery' ), null, true );
        wp_register_script( 'dokan-form-validate', $vendor . '/form-validate/form-validate.js', array( 'jquery' ), null, true  );
        wp_register_script( 'dokan-select2-js', $vendor . '/select2/select2.full.min.js', array( 'jquery' ), null, true  );

        // Image cropping scripts
        wp_register_script( 'customize-base', site_url( 'wp-includes/js/customize-base.js' ), array( 'jquery', 'json2', 'underscore' ), null, true );
        wp_register_script( 'customize-model', site_url( 'wp-includes/js/customize-models.js' ), array( 'underscore', 'backbone' ), null, true );

        // Register core scripts
        wp_register_script( 'dokan-flot', plugins_url( 'assets/js/flot-all.min.js', __FILE__ ), false, null, true );
        wp_register_script( 'dokan-script', plugins_url( 'assets/js/dokan.js', __FILE__ ), array( 'imgareaselect', 'customize-base', 'customize-model'  ), null, true );

        do_action( 'dokan_register_scripts' );
    }

    /**
     * Enqueue admin scripts
     *
     * Allows plugin assets to be loaded.
     *
     * @uses wp_enqueue_script()
     * @uses wp_localize_script()
     * @uses wp_enqueue_style
     */
    public function scripts() {

        if ( ! function_exists( 'WC' ) ) {
            return;
        }

        // load dokan style on every pages. requires for shortcodes in other pages
        if ( DOKAN_LOAD_STYLE ) {
            wp_enqueue_style( 'dokan-style' );
            wp_enqueue_style( 'dokan-fontawesome' );
        }

        $default_script = array(
                'ajaxurl'     => admin_url( 'admin-ajax.php' ),
                'nonce'       => wp_create_nonce( 'dokan_reviews' ),
                'ajax_loader' => plugins_url( 'assets/images/ajax-loader.gif', __FILE__ ),
                'seller'      => array(
                    'available'    => __( 'Available', 'dokan-lite' ),
                    'notAvailable' => __( 'Not Available', 'dokan-lite' )
                ),
                'delete_confirm' => __('Are you sure?', 'dokan-lite' ),
                'wrong_message'  => __('Something went wrong. Please try again.', 'dokan-lite' ),
        );

        $localize_script = apply_filters( 'dokan_localized_args', $default_script );

        wp_localize_script( 'jquery', 'dokan', $localize_script );

        // load only in dokan dashboard and product edit page
        if ( ( dokan_is_seller_dashboard() || ( get_query_var( 'edit' ) && is_singular( 'product' ) ) ) || apply_filters( 'dokan_forced_load_scripts', false ) ) {
            $this->dokan_dashboard_scripts();
        }

        // store and my account page
        if ( dokan_is_store_page() || dokan_is_store_review_page() || is_account_page() ) {

            if ( DOKAN_LOAD_STYLE ) {
                wp_enqueue_style( 'dokan-select2-css' );
            }

            if ( DOKAN_LOAD_SCRIPTS ) {

                $this->load_form_validate_script();
                $this->load_gmap_script();

                wp_enqueue_script( 'jquery-ui-sortable' );
                wp_enqueue_script( 'jquery-ui-datepicker' );
                wp_enqueue_script( 'dokan-tooltip' );
                wp_enqueue_script( 'dokan-chosen' );
                wp_enqueue_script( 'dokan-form-validate' );
                wp_enqueue_script( 'dokan-script' );
                wp_enqueue_script( 'dokan-select2-js' );
            }
        }

        do_action( 'dokan_enqueue_scripts' );
    }

    /**
     * Filter 'dokan' localize script's arguments
     *
     * @since 2.5.3
     *
     * @param array $default_args
     *
     * @return $default_args
     */
    function conditional_localized_args( $default_args ) {

        if ( dokan_is_seller_dashboard()
                || ( get_query_var( 'edit' ) && is_singular( 'product' ) )
                || dokan_is_store_page()
                || is_account_page()
                || apply_filters( 'dokan_force_load_extra_args', false )
            ) {

            $general_settings = get_option( 'dokan_general', [] );

            $banner_width     = ! empty( $general_settings['store_banner_width'] ) ? $general_settings['store_banner_width'] : 625;
            $banner_height    = ! empty( $general_settings['store_banner_height'] ) ? $general_settings['store_banner_height'] : 300;
            $has_flex_width   = ! empty( $general_settings['store_banner_flex_width'] ) ? $general_settings['store_banner_flex_width'] : true;
            $has_flex_height  = ! empty( $general_settings['store_banner_flex_height'] ) ? $general_settings['store_banner_flex_height'] : true;

            $custom_args             = array (
                'i18n_choose_featured_img'            => __( 'Upload featured image', 'dokan-lite' ),
                'i18n_choose_file'                    => __( 'Choose a file', 'dokan-lite' ),
                'i18n_choose_gallery'                 => __( 'Add Images to Product Gallery', 'dokan-lite' ),
                'i18n_choose_featured_img_btn_text'   => __( 'Set featured image', 'dokan-lite' ),
                'i18n_choose_file_btn_text'           => __( 'Insert file URL', 'dokan-lite' ),
                'i18n_choose_gallery_btn_text'        => __( 'Add to gallery', 'dokan-lite' ),
                'duplicates_attribute_messg'          => __( 'Sorry, this attribute option already exists, Try a different one.', 'dokan-lite' ),
                'variation_unset_warning'             => __( 'Warning! This product will not have any variations if this option is not checked.', 'dokan-lite' ),
                'new_attribute_prompt'                => __( 'Enter a name for the new attribute term:', 'dokan-lite' ),
                'remove_attribute'                    => __( 'Remove this attribute?', 'dokan-lite' ),
                'dokan_placeholder_img_src'           => wc_placeholder_img_src(),
                'add_variation_nonce'                 => wp_create_nonce( 'add-variation' ),
                'link_variation_nonce'                => wp_create_nonce( 'link-variations' ),
                'delete_variations_nonce'             => wp_create_nonce( 'delete-variations' ),
                'load_variations_nonce'               => wp_create_nonce( 'load-variations' ),
                'save_variations_nonce'               => wp_create_nonce( 'save-variations' ),
                'bulk_edit_variations_nonce'          => wp_create_nonce( 'bulk-edit-variations' ),
                'i18n_link_all_variations'            => esc_js( sprintf( __( 'Are you sure you want to link all variations? This will create a new variation for each and every possible combination of variation attributes (max %d per run).', 'dokan-lite' ), defined( 'WC_MAX_LINKED_VARIATIONS' ) ? WC_MAX_LINKED_VARIATIONS : 50 ) ),
                'i18n_enter_a_value'                  => esc_js( __( 'Enter a value', 'dokan-lite' ) ),
                'i18n_enter_menu_order'               => esc_js( __( 'Variation menu order (determines position in the list of variations)', 'dokan-lite' ) ),
                'i18n_enter_a_value_fixed_or_percent' => esc_js( __( 'Enter a value (fixed or %)', 'dokan-lite' ) ),
                'i18n_delete_all_variations'          => esc_js( __( 'Are you sure you want to delete all variations? This cannot be undone.', 'dokan-lite' ) ),
                'i18n_last_warning'                   => esc_js( __( 'Last warning, are you sure?', 'dokan-lite' ) ),
                'i18n_choose_image'                   => esc_js( __( 'Choose an image', 'dokan-lite' ) ),
                'i18n_set_image'                      => esc_js( __( 'Set variation image', 'dokan-lite' ) ),
                'i18n_variation_added'                => esc_js( __( "variation added", 'dokan-lite' ) ),
                'i18n_variations_added'               => esc_js( __( "variations added", 'dokan-lite' ) ),
                'i18n_no_variations_added'            => esc_js( __( "No variations added", 'dokan-lite' ) ),
                'i18n_remove_variation'               => esc_js( __( 'Are you sure you want to remove this variation?', 'dokan-lite' ) ),
                'i18n_scheduled_sale_start'           => esc_js( __( 'Sale start date (YYYY-MM-DD format or leave blank)', 'dokan-lite' ) ),
                'i18n_scheduled_sale_end'             => esc_js( __( 'Sale end date (YYYY-MM-DD format or leave blank)', 'dokan-lite' ) ),
                'i18n_edited_variations'              => esc_js( __( 'Save changes before changing page?', 'dokan-lite' ) ),
                'i18n_variation_count_single'         => esc_js( __( '%qty% variation', 'dokan-lite' ) ),
                'i18n_variation_count_plural'         => esc_js( __( '%qty% variations', 'dokan-lite' ) ),
                'variations_per_page'                 => absint( apply_filters( 'dokan_product_variations_per_page', 10 ) ),
                'store_banner_dimension'              => [ 'width' => $banner_width, 'height' => $banner_height, 'flex-width' => $has_flex_width, 'flex-height' => $has_flex_height ],
                'selectAndCrop'                       => __( 'Select and Crop', 'dokan-lite' ),
                'chooseImage'                         => __( 'Choose Image', 'dokan-lite' )
            );

            $default_args = array_merge( $default_args, $custom_args );
        }

        return $default_args;
    }

    /**
     * Load google map script
     *
     * @since 2.5.3
     */
    function load_gmap_script() {

        $scheme  = is_ssl() ? 'https' : 'http';
        $api_key = dokan_get_option( 'gmap_api_key', 'dokan_general', false );

        if ( $api_key ) {
            wp_enqueue_script( 'google-maps', $scheme . '://maps.google.com/maps/api/js?key=' . $api_key );
        }
    }

    /**
     * Load form validate script args
     *
     * @since 2.5.3
     *
     */
    function load_form_validate_script() {

        $form_validate_messages = array(
            'required'        => __( "This field is required", 'dokan-lite' ),
            'remote'          => __( "Please fix this field.", 'dokan-lite' ),
            'email'           => __( "Please enter a valid email address.", 'dokan-lite' ),
            'url'             => __( "Please enter a valid URL.", 'dokan-lite' ),
            'date'            => __( "Please enter a valid date.", 'dokan-lite' ),
            'dateISO'         => __( "Please enter a valid date (ISO).", 'dokan-lite' ),
            'number'          => __( "Please enter a valid number.", 'dokan-lite' ),
            'digits'          => __( "Please enter only digits.", 'dokan-lite' ),
            'creditcard'      => __( "Please enter a valid credit card number.", 'dokan-lite' ),
            'equalTo'         => __( "Please enter the same value again.", 'dokan-lite' ),
            'maxlength_msg'   => __( "Please enter no more than {0} characters.", 'dokan-lite' ),
            'minlength_msg'   => __( "Please enter at least {0} characters.", 'dokan-lite' ),
            'rangelength_msg' => __( "Please enter a value between {0} and {1} characters long.", 'dokan-lite' ),
            'range_msg'       => __( "Please enter a value between {0} and {1}.", 'dokan-lite' ),
            'max_msg'         => __( "Please enter a value less than or equal to {0}.", 'dokan-lite' ),
            'min_msg'         => __( "Please enter a value greater than or equal to {0}.", 'dokan-lite' ),
        );

        wp_localize_script( 'dokan-form-validate', 'DokanValidateMsg', apply_filters( 'DokanValidateMsg_args', $form_validate_messages ) );
    }

    /**
     * Load Dokan Dashboard Scripts
     *
     * @since 2.5.3
     *
     * @global type $wp
     */
    function dokan_dashboard_scripts() {
        global $wp;

        if ( DOKAN_LOAD_STYLE ) {
            wp_enqueue_style( 'jquery-ui' );
            wp_enqueue_style( 'dokan-magnific-popup' );
            wp_enqueue_style( 'woocommerce-general' );
            wp_enqueue_style( 'dokan-modalcss' );
            wp_enqueue_style( 'dokan-select2-css' );
            wp_enqueue_style( 'dokan-chosen-style' );
        }

        if ( DOKAN_LOAD_SCRIPTS ) {
            $this->load_form_validate_script();
            $this->load_gmap_script();

            wp_enqueue_script( 'jquery' );
            wp_enqueue_script( 'jquery-ui' );
            wp_enqueue_script( 'jquery-ui-autocomplete' );
            wp_enqueue_script( 'jquery-ui-datepicker' );
            wp_enqueue_script( 'underscore' );
            wp_enqueue_script( 'post' );
            wp_enqueue_script( 'dokan-modaljs' );
            wp_enqueue_script( 'dokan-tooltip' );
            wp_enqueue_script( 'dokan-form-validate' );
            wp_enqueue_script( 'dokan-tabs' );
            wp_enqueue_script( 'dokan-chart' );
            wp_enqueue_script( 'dokan-flot' );
            wp_enqueue_script( 'dokan-chosen' );
            wp_enqueue_script( 'dokan-select2-js' );
            wp_enqueue_media();
            wp_enqueue_script( 'serializejson' );
            wp_enqueue_script( 'dokan-popup' );
            wp_enqueue_script( 'wc-password-strength-meter' );
            wp_enqueue_script( 'dokan-script' );
        }

        if ( isset( $wp->query_vars['settings'] ) == 'store' ) {
            wp_enqueue_script( 'wc-country-select' );
        }
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

        if ( is_admin() ) {
            require_once $inc_dir . 'admin/admin.php';
            require_once $inc_dir . 'admin/ajax.php';
            require_once $inc_dir . 'admin-functions.php';
        } else {
            require_once $inc_dir . 'template-tags.php';
        }
    }

    /**
     * Initialize filters
     *
     * @return void
     */
    function init_filters() {
        add_filter( 'posts_where', array( $this, 'hide_others_uploads' ) );
        add_filter( 'body_class', array( $this, 'add_dashboard_template_class' ), 99 );
        add_filter( 'wp_title', array( $this, 'wp_title' ), 20, 2 );
    }

    /**
     * Hide other users uploads for `seller` users
     *
     * Hide media uploads in page "upload.php" and "media-upload.php" for
     * sellers. They can see only thier uploads.
     *
     * FIXME: fix the upload counts
     *
     * @global string $pagenow
     * @global object $wpdb
     *
     * @param string  $where
     *
     * @return string
     */
    function hide_others_uploads( $where ) {
        global $pagenow, $wpdb;

        if ( ( $pagenow == 'upload.php' || $pagenow == 'media-upload.php' ) && current_user_can( 'dokandar' ) ) {
            $user_id = get_current_user_id();

            $where .= " AND $wpdb->posts.post_author = $user_id";
        }

        return $where;
    }

    /**
     * Init ajax classes
     *
     * @return void
     */
    function init_ajax() {
        $doing_ajax = defined( 'DOING_AJAX' ) && DOING_AJAX;

        if ( $doing_ajax ) {
            Dokan_Ajax::init()->init_ajax();
            new Dokan_Pageviews();
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
        } else {
            new Dokan_Pageviews();
        }

        new Dokan_Rewrites();
        new Dokan_Tracker();
        Dokan_Email::init();

        if ( is_user_logged_in() ) {
            Dokan_Template_Main::init();
            Dokan_Template_Dashboard::init();
            Dokan_Template_Products::init();
            Dokan_Template_Orders::init();
            Dokan_Template_Withdraw::init();
            Dokan_Template_Shortcodes::init();
            Dokan_Template_Settings::init();
        }
    }

    /**
     * Redirect if not logged Seller
     *
     * @since 2.4
     *
     * @return void [redirection]
     */
    function redirect_if_not_logged_seller() {
        global $post;

        $page_id = dokan_get_option( 'dashboard', 'dokan_pages' );

        if ( ! $page_id ) {
            return;
        }

        if ( is_page( $page_id ) ) {
            dokan_redirect_login();
            dokan_redirect_if_not_seller();
        }
    }

    /**
     * Block user access to admin panel for specific roles
     *
     * @global string $pagenow
     */
    function block_admin_access() {
        global $pagenow, $current_user;

        // bail out if we are from WP Cli
        if ( defined( 'WP_CLI' ) ) {
            return;
        }

        $no_access   = dokan_get_option( 'admin_access', 'dokan_general', 'on' );
        $valid_pages = array( 'admin-ajax.php', 'admin-post.php', 'async-upload.php', 'media-upload.php' );
        $user_role   = reset( $current_user->roles );

        if ( ( $no_access == 'on' ) && ( !in_array( $pagenow, $valid_pages ) ) && in_array( $user_role, array( 'seller', 'customer' ) ) ) {
            wp_redirect( home_url() );
            exit;
        }
    }

    /**
     * Load jquery in login page
     *
     * @since 2.4
     *
     * @return void
     */
    function login_scripts() {
        wp_enqueue_script( 'jquery' );
    }

    /**
     * Scripts and styles for admin panel
     */
    function admin_enqueue_scripts() {
        wp_enqueue_script( 'dokan_slider_admin', DOKAN_PLUGIN_ASSEST.'/js/dokan-admin.js', array( 'jquery' ) );

        do_action( 'dokan_enqueue_admin_scripts' );
    }

    /**
     * Load table prefix for withdraw and orders table
     *
     * @since 1.0
     *
     * @return void
     */
    function load_table_prifix() {
        global $wpdb;

        $wpdb->dokan_withdraw = $wpdb->prefix . 'dokan_withdraw';
        $wpdb->dokan_orders   = $wpdb->prefix . 'dokan_orders';
    }

    /**
     * Add body class for dokan-dashboard
     *
     * @param array $classes
     */
    function add_dashboard_template_class( $classes ) {
        $page_id = dokan_get_option( 'dashboard', 'dokan_pages' );

        if ( ! $page_id ) {
            return $classes;
        }

        if ( is_page( $page_id ) || ( get_query_var( 'edit' ) && is_singular( 'product' ) ) ) {
            $classes[] = 'dokan-dashboard';
        }

        if ( dokan_is_store_page () ) {
            $classes[] = 'dokan-store';
        }

        $classes[] = 'dokan-theme-' . get_option( 'template' );

        return $classes;
    }


    /**
     * Create a nicely formatted and more specific title element text for output
     * in head of document, based on current view.
     *
     * @since Dokan 1.0.4
     *
     * @param string  $title Default title text for current view.
     * @param string  $sep   Optional separator.
     *
     * @return string The filtered title.
     */
    function wp_title( $title, $sep ) {
        global $paged, $page;

        if ( is_feed() ) {
            return $title;
        }

        if ( dokan_is_store_page() ) {
            $site_title = get_bloginfo( 'name' );
            $store_user = get_userdata( get_query_var( 'author' ) );
            $store_info = dokan_get_store_info( $store_user->ID );
            $store_name = esc_html( $store_info['store_name'] );
            $title      = "$store_name $sep $site_title";

            // Add a page number if necessary.
            if ( $paged >= 2 || $page >= 2 ) {
                $title = "$title $sep " . sprintf( __( 'Page %s', 'dokan-lite' ), max( $paged, $page ) );
            }

            return $title;
        }

        return $title;
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
function dokan_load_plugin() {
    WeDevs_Dokan::init();
}

add_action( 'plugins_loaded', 'dokan_load_plugin', 5 );

register_activation_hook( __FILE__, array( 'WeDevs_Dokan', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'WeDevs_Dokan', 'deactivate' ) );
add_action( 'activated_plugin', array( 'Dokan_Installer', 'setup_page_redirect' ) );
