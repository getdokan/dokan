<?php

namespace WeDevs\Dokan\Admin\Notices;

use WeDevs\Dokan\Traits\ChainableContainer;

/**
 * Dokan Admin notices handler class
 */
class Manager {
    use ChainableContainer;

    /**
     * Class constructor
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
        $this->container['setup_wizard'] = new SetupWizard();
        $this->container['whats_new'] = new WhatsNew();
        $this->container['plugin_review'] = new PluginReview();
    }

    /**
     * Handle notices that has no ajax action
     *
     *  @since 3.3.3
     *
     * @return void
     */
    private function init_hooks() {
        add_action( 'admin_notices', [ $this, 'render_missing_woocommerce_notice' ] );
        add_filter( 'dokan_admin_notices', [ $this, 'show_permalink_setting_notice' ] );
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
        $structure = get_option( 'permalink_structure' );

        if ( empty( $structure ) || '/archives/%post_id%' === $structure ) {
            /* translators: %s permalink settings url */
            $notices[] = [
                'type'        => 'alert',
                'description' => sprintf( __( 'The <strong>Plain and Numeric</strong> permalink structure is not working for the Dokan plugin. Please change your permalink structure from <a href="%s">Settings > Permalinks</a>', 'dokan-lite' ), admin_url( 'options-permalink.php' ) ),
                'priority'    => 1,
            ];
        }

        return $notices;
    }
}
