<?php

namespace WeDevs\Dokan\Admin\Notices;

use WeDevs\Dokan\Traits\ChainableContainer;

/**
 * Dokan Admin notices handler class
 *
 * @since 3.3.3
 */
class Manager {
    use ChainableContainer;

    /**
     * Class constructor
     *
     * @since 3.3.3
     */
    public function __construct() {
        $this->init_classes();
        $this->init_hooks();
    }

    /**
     * Register all notices classes to chainable container
     *
     * @since 3.3.3
     *
     * @return void
     */
    private function init_classes() {
        $this->container['whats_new']              = new WhatsNew();
        $this->container['setup_wizard']           = new SetupWizard();
        $this->container['plugin_review']          = new PluginReview();
        $this->container['limited_time_promotion'] = new LimitedTimePromotion();
    }

    /**
     * Handle notices that has no ajax action
     *
     *  @since 3.3.3
     *
     * @return void
     */
    private function init_hooks() {
        add_action( 'admin_enqueue_scripts', [ $this, 'load_dokan_admin_notices_styles' ] );
        add_action( 'admin_notices', [ $this, 'render_missing_woocommerce_notice' ] );
        add_action( 'admin_notices', [ $this, 'render_global_admin_notices_html' ] );
        add_filter( 'dokan_admin_notices', [ $this, 'show_permalink_setting_notice' ] );
    }

    /**
     * Load admin notices style and styles
     *
     * @since 3.3.6
     *
     * @return void
     */
    public function load_dokan_admin_notices_styles() {
        wp_enqueue_style( 'dokan-global-admin-css', DOKAN_PLUGIN_ASSEST . '/css/global-admin.css', [], filemtime( DOKAN_DIR . '/assets/css/global-admin.css' ) );
    }

    /**
     * Render dokan global admin notices via Vue.js
     *
     * @since 3.3.3
     *
     * @return void
     */
    public function render_global_admin_notices_html() {
        echo '<div id="dokan-admin-notices"></div>';
    }

    /**
     * Missing WooCommerce notice
     *
     * @since 2.9.16
     *
     * @return void
     */
    public function render_missing_woocommerce_notice() {
        // check wooCommerce is available and active
        $has_woocommerce = dokan()->has_woocommerce();

        // check if woocommerce installed
        $woocommerce_installed = dokan()->is_woocommerce_installed();

        if ( ( ! $has_woocommerce || ! $woocommerce_installed ) && current_user_can( 'activate_plugins' ) ) {
            dokan_get_template(
                'admin-notice-dependencies.php', [
                    'has_woocommerce' => $has_woocommerce,
                    'woocommerce_installed' => $woocommerce_installed,
                ]
            );
        }
    }

    /**
     * Display permalink format not working for Dokan notice
     *
     * @since 3.3.3
     *
     * @param array $notices
     *
     * @return array
     */
    public function show_permalink_setting_notice( $notices ) {
        if ( empty( get_option( 'permalink_structure' ) ) ) {
            $notices[] = [
                'type'        => 'alert',
                /* translators: %s permalink settings url */
                'description' => sprintf( __( 'The <strong>Plain</strong> permalink structure is not working for the Dokan plugin. Please change your permalink structure from <a href="%s">Settings > Permalinks</a>', 'dokan-lite' ), admin_url( 'options-permalink.php' ) ),
                'priority'    => 1,
                'actions'     => [
                    [
                        'type'   => 'primary',
                        'text'   => __( 'Go to Settings', 'dokan-lite' ),
                        'action' => admin_url( 'options-permalink.php' ),
                    ],
                ],
            ];
        }

        return $notices;
    }
}
