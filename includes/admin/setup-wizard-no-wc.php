<?php

class Dokan_Admin_Setup_Wizard_No_WC extends Dokan_Setup_Wizard {

    /**
     * Show setup wizard
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function setup_wizard() {
        if ( empty( $_GET['page'] ) || 'dokan-setup' !== $_GET['page'] ) {
            return;
        }

        $this->steps = array(
            'install_woocommerce' => array(
                'name'    =>  __( 'Install Woocommerce', 'dokan-lite' ),
                'view'    => array( $this, 'step_install_woocommerce' ),
                'handler' => ''
            ),
        );

        $this->step = isset( $_GET['step'] ) ? sanitize_key( $_GET['step'] ) : current( array_keys( $this->steps ) );

        if ( ! empty( $_POST['save_step'] ) && isset( $this->steps[ $this->step ]['handler'] ) ) { // WPCS: CSRF ok.
            call_user_func( $this->steps[ $this->step ]['handler'] );
        }

        wp_enqueue_style( 'dokan-setup', DOKAN_PLUGIN_ASSEST . '/css/setup-no-wc.css', array( 'install' ), DOKAN_PLUGIN_VERSION );

        ob_start();
        $this->setup_wizard_header();
        $this->setup_wizard_content();
        $this->setup_wizard_footer();
        exit;
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
     * Install WooCommerce step
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function step_install_woocommerce() {
        ?>
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
                <a href="#" class="button-primary button button-large"><?php esc_html_e( 'Let\'s Go!', 'dokan-lite' ); ?></a>
            </p>
        <?php
    }
}
