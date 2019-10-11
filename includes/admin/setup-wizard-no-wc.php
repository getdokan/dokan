<?php

class Dokan_Admin_Setup_Wizard_No_WC extends Dokan_Setup_Wizard {

    /**
     * Set wizard steps
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    protected function set_steps() {
        $this->steps = array(
            'introduction' => array(
                'name'    =>  __( 'Welcome to Dokan', 'dokan-lite' ),
                'view'    => array( $this, 'step_introduction' ),
                'handler' => array( $this, 'install_woocommerce' ),
            ),
        );
    }

    /**
     * Should show any recommended step
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return bool
     */
    protected function should_show_recommended_step() {
        return false;
    }

    /**
     * Enqueue wizard scripts
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function enqueue_scripts() {
        wp_enqueue_style( 'dokan-setup', DOKAN_PLUGIN_ASSEST . '/css/setup-no-wc.css', array( 'install' ), DOKAN_PLUGIN_VERSION );
    }

    /**
     * Wizard templates
     *
     * @since DOKAN_LITE_SINCE
     */
    protected function set_setup_wizard_template() {
        $this->setup_wizard_header();
        $this->setup_wizard_content();
        $this->setup_wizard_footer();
    }

    /**
     * Setup wizard main content
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function setup_wizard_content() {
        if ( empty( $this->steps[ $this->step ]['view'] ) ) {
            wp_redirect( esc_url_raw( add_query_arg( 'step', 'install_woocommerce' ) ) );
            exit;
        }

        echo '<div class="wc-setup-content">';
        call_user_func( $this->steps[ $this->step ]['view'] );
        echo '</div>';
    }

    /**
     * Setup wizard footer
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function setup_wizard_footer() {
        ?>
                <a class="wc-return-to-dashboard" href="<?php echo esc_url( admin_url() ); ?>"><?php esc_html_e( 'Return to the WordPress Dashboard', 'dokan-lite' ); ?></a>
            </body>
        </html>
        <?php
    }

    /**
     * Introduction page
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function step_introduction() {
        ?>
            <form method="post">
                <h1><?php esc_html_e( 'Welcome to the world of Dokan!', 'dokan-lite' ); ?></h1>
                <p><?php echo wp_kses( __( 'Thank you for choosing Dokan to power your online marketplace! This quick setup wizard will help you configure the basic settings. <strong>It’s completely optional and shouldn’t take longer than three minutes.</strong>', 'dokan-lite' ), [ 'strong' => [] ] ); ?></p>
                <p>
                    <?php
                        printf(
                            esc_html__( 'In order to use Dokan you need to install %s. THIS TEXT SHOULD BE UPDATED', 'dokan-lite' ),
                            '<a href="https://wordpress.org/plugins/woocommerce" target="_blank" rel="noopener">WooCommerce</a>'
                        );
                    ?>
                </p>
                <p class="wc-setup-actions step">
                    <button type="submit" class="button-primary button button-large">
                        <?php esc_html_e( "Let's Go!", 'dokan-lite' ); ?>
                    </button>
                    <input type="hidden" name="save_step" value="true">
                    <?php wp_nonce_field( 'dokan-setup' ); ?>
                </p>
            </form>
        <?php
    }

    /**
     * Install WooCommerce and redirect to store setup step
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function install_woocommerce() {
        check_admin_referer( 'dokan-setup' );

        require_once DOKAN_INC_DIR . '/functions.php';

        // Using output buffer to prevent outputting `trigger_error` in `plugins_api` function
        ob_start();
        $installed = dokan_install_wp_org_plugin( 'woocommerce' );
        ob_get_clean();

        if ( is_wp_error( $installed ) ) {
            wp_die( $installed->get_error_message(), __( 'Error installing WooCommerce plugin', 'dokan-lite' ) );
        }

        wp_safe_redirect( esc_url_raw( add_query_arg( 'step', 'store' ) ) );
        exit;
    }
}
