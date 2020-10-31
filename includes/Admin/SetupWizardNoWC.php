<?php

namespace WeDevs\Dokan\Admin;

use WeDevs\Dokan\Admin\SetupWizard as DokanSetupWizard;

class SetupWizardNoWC extends DokanSetupWizard {

    /**
     * Set wizard steps
     *
     * @since 2.9.27
     *
     * @return void
     */
    protected function set_steps() {
        $this->steps = [
            'introduction' => [
                'name'    => __( 'Welcome to Dokan', 'dokan-lite' ),
                'view'    => [ $this, 'step_introduction' ],
                'handler' => [ $this, 'install_woocommerce' ],
            ],
        ];
    }

    /**
     * Should show any recommended step
     *
     * @since 2.9.27
     *
     * @return bool
     */
    protected function should_show_recommended_step() {
        return false;
    }

    /**
     * Enqueue wizard scripts
     *
     * @since 2.9.27
     *
     * @return void
     */
    public function enqueue_scripts() {
        wp_register_script( 'jquery-blockui', DOKAN_PLUGIN_ASSEST . '/vendors/jquery-blockui/jquery.blockUI.min.js', [ 'jquery' ], '2.70', true );

        wp_enqueue_style( 'dokan-setup', DOKAN_PLUGIN_ASSEST . '/css/setup-no-wc.css', [ 'install' ], DOKAN_PLUGIN_VERSION );

        wp_enqueue_script( 'wc-setup', DOKAN_PLUGIN_ASSEST . '/js/dokan-setup-no-wc.js', [ 'jquery', 'jquery-blockui' ], DOKAN_PLUGIN_VERSION, true );
        wp_localize_script(
            'wc-setup',
            'wc_setup_params',
            []
        );
    }

    /**
     * Wizard templates
     *
     * @since 2.9.27
     */
    protected function set_setup_wizard_template() {
        $this->setup_wizard_header();
        $this->setup_wizard_content();
        $this->setup_wizard_footer();
    }

    /**
     * Setup wizard main content
     *
     * @since 2.9.27
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
     * @since 2.9.27
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
     * @since 2.9.27
     *
     * @return void
     */
    public function step_introduction() {
        dokan_get_template( 'admin-setup-wizard/step-no-wc-introduction.php' );
    }

    /**
     * Install WooCommerce and redirect to store setup step
     *
     * @since 2.9.27
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

        delete_transient( '_wc_activation_redirect' );

        if ( is_wp_error( $installed ) ) {
            wp_die( $installed->get_error_message(), __( 'Error installing WooCommerce plugin', 'dokan-lite' ) );
        }

        set_transient( 'dokan_setup_wizard_no_wc', true, 15 * MINUTE_IN_SECONDS );
        delete_transient( 'dokan_wc_missing_notice' );

        wp_safe_redirect( esc_url_raw( add_query_arg( 'step', 'store' ) ) );
        exit;
    }

    /**
     * Get WooCommerce Setup wizard
     *
     * @since 2.9.27
     *
     * @param array $steps
     *
     * @return \WeDevs\Dokan\Admin\SetupWizardWCAdmin
     */
    protected static function get_wc_setup_wizard( $steps = [] ) {
        static $setup_wizard = null;

        if ( is_null( $setup_wizard ) ) {
            $setup_wizard = new SetupWizardWCAdmin( $steps );
        }

        return $setup_wizard;
    }

    /**
     * Add WooCommerce steps in Dokan admin setup wizard
     *
     * @since 2.9.27
     *
     * @param array $steps
     */
    public static function add_wc_steps_to_wizard( $steps ) {
        $new_steps = [];

        foreach ( $steps as $step => $step_props ) {
            $new_steps[ $step ] = $step_props;

            if ( 'selling' === $step ) {
                $new_steps['payment'] = [
                    'name'    => __( 'Payment', 'dokan-lite' ),
                    'view'    => [ self::class, 'wc_setup_payment' ],
                    'handler' => [ self::class, 'wc_setup_payment_save' ],
                ];

                $new_steps['shipping'] = [
                    'name'    => __( 'Shipping', 'dokan-lite' ),
                    'view'    => [ self::class, 'wc_setup_shipping' ],
                    'handler' => [ self::class, 'wc_setup_shipping_save' ],
                ];
            }
        }

        return $new_steps;
    }

    /**
     * Add WC localized scripts
     *
     * @since 2.9.27
     *
     * @return void
     */
    public static function enqueue_wc_localized_scripts() {
        wp_localize_script(
            'wc-setup',
            'wc_setup_params',
            [
                'states'    => WC()->countries->get_states(),
                'postcodes' => self::get_postcodes(),
            ]
        );
    }

    /**
     * Add WC fields to Store setup form
     *
     * @since 2.9.27
     *
     * @return void
     */
    public static function add_wc_html_step_start() {
        dokan_get_template( 'admin-setup-wizard/step-store-wc-fields.php' );
    }

    /**
     * Save WC data in store setup step
     *
     * @since 2.9.27
     *
     * @return void
     */
    public static function save_wc_store_setup_data() {
        $address        = isset( $_POST['store_address'] ) ? wc_clean( wp_unslash( $_POST['store_address'] ) ) : '';
        $address_2      = isset( $_POST['store_address_2'] ) ? wc_clean( wp_unslash( $_POST['store_address_2'] ) ) : '';
        $city           = isset( $_POST['store_city'] ) ? wc_clean( wp_unslash( $_POST['store_city'] ) ) : '';
        $country        = isset( $_POST['store_country'] ) ? wc_clean( wp_unslash( $_POST['store_country'] ) ) : '';
        $state          = isset( $_POST['store_state'] ) ? wc_clean( wp_unslash( $_POST['store_state'] ) ) : '*';
        $postcode       = isset( $_POST['store_postcode'] ) ? wc_clean( wp_unslash( $_POST['store_postcode'] ) ) : '';
        $currency_code  = isset( $_POST['currency_code'] ) ? wc_clean( wp_unslash( $_POST['currency_code'] ) ) : '';
        $product_type   = isset( $_POST['product_type'] ) ? wc_clean( wp_unslash( $_POST['product_type'] ) ) : '';
        $sell_in_person = isset( $_POST['sell_in_person'] ) && ( 'on' === wc_clean( wp_unslash( $_POST['sell_in_person'] ) ) );

        update_option( 'woocommerce_store_address', $address );
        update_option( 'woocommerce_store_address_2', $address_2 );
        update_option( 'woocommerce_store_city', $city );
        update_option( 'woocommerce_default_country', $country . ':' . $state );
        update_option( 'woocommerce_store_postcode', $postcode );
        update_option( 'woocommerce_currency', $currency_code );
        update_option( 'woocommerce_product_type', $product_type );
        update_option( 'woocommerce_sell_in_person', $sell_in_person );

        $locale_info = include WC()->plugin_path() . '/i18n/locale-info.php';

        if ( isset( $locale_info[ $country ] ) ) {
            update_option( 'woocommerce_weight_unit', $locale_info[ $country ]['weight_unit'] );
            update_option( 'woocommerce_dimension_unit', $locale_info[ $country ]['dimension_unit'] );

            // Set currency formatting options based on chosen location and currency.
            if ( $locale_info[ $country ]['currency_code'] === $currency_code ) {
                update_option( 'woocommerce_currency_pos', $locale_info[ $country ]['currency_pos'] );
                update_option( 'woocommerce_price_decimal_sep', $locale_info[ $country ]['decimal_sep'] );
                update_option( 'woocommerce_price_num_decimals', $locale_info[ $country ]['num_decimals'] );
                update_option( 'woocommerce_price_thousand_sep', $locale_info[ $country ]['thousand_sep'] );
            }
        }

        \WC_Install::create_pages();
    }

    /**
     * WC payment setup step form
     *
     * @since 2.9.27
     *
     * @return void
     */
    public static function wc_setup_payment() {
        $wc_setup_wizard = self::get_wc_setup_wizard();

        echo '<div class="form-table">';
        $wc_setup_wizard->wc_setup_payment();
        echo '</div>';
    }

    /**
     * WC payment step post data handler
     *
     * @since 2.9.27
     *
     * @param \Dokan_Setup_Wizard $dokan_admin_setup_wizard
     *
     * @return void
     */
    public static function wc_setup_payment_save( $dokan_admin_setup_wizard ) {
        $wc_setup_wizard = self::get_wc_setup_wizard( $dokan_admin_setup_wizard->get_steps() );

        $wc_setup_wizard->set_step( 'payment' );
        $wc_setup_wizard->wc_setup_payment_save();
    }

    /**
     * WC shipping setup step form
     *
     * @since 2.9.27
     *
     * @return void
     */
    public static function wc_setup_shipping() {
        $wc_setup_wizard = self::get_wc_setup_wizard();

        echo '<div class="form-table">';
        $wc_setup_wizard->wc_setup_shipping();
        echo '</div>';
    }

    /**
     * WC shipping step post data handler
     *
     * @since 2.9.27
     *
     * @param \Dokan_Setup_Wizard $dokan_admin_setup_wizard
     *
     * @return void
     */
    public static function wc_setup_shipping_save( $dokan_admin_setup_wizard ) {
        $wc_setup_wizard = self::get_wc_setup_wizard( $dokan_admin_setup_wizard->get_steps() );

        \WC_Admin_Notices::remove_notice( 'install' );

        $wc_setup_wizard->set_step( 'shipping' );
        $wc_setup_wizard->wc_setup_shipping_save();
    }
}
