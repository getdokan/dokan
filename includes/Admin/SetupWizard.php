<?php

namespace WeDevs\Dokan\Admin;

use stdClass;

/**
 * Setup wizard class
 *
 * Walkthrough to the basic setup upon installation
 */
class SetupWizard {

    /** @var string Current Step */
    protected string $current_step = '';

    /** @var string custom logo url of the theme */
    protected $custom_logo = '';
    /** @var array Steps for the setup wizard */
    protected $steps = [];

    /**
     * Actions to be executed after the HTTP response has completed
     *
     * @var array
     */
    private $deferred_actions = [];

    /**
     * Hook in tabs.
     */
    public function __construct() {
        if ( ! dokan()->has_woocommerce() ) {
            add_filter( 'user_has_cap', [ $this, 'set_user_cap' ] );
        }

        if ( current_user_can( 'manage_woocommerce' ) ) {
            add_action( 'admin_menu', [ $this, 'admin_menus' ] );
            add_action( 'admin_init', [ $this, 'setup_wizard' ], 99 );

            if ( get_transient( 'dokan_setup_wizard_no_wc' ) && defined( 'WC_VERSION' ) && version_compare( WC_VERSION, '4.6.0', '<' ) ) { // todo: temporary fix, will add this feature again in future release
                add_filter( 'dokan_admin_setup_wizard_steps', [ SetupWizardNoWC::class, 'add_wc_steps_to_wizard' ] );
                add_filter( 'dokan_setup_wizard_enqueue_scripts', [ SetupWizardNoWC::class, 'enqueue_wc_localized_scripts' ] );
                add_action( 'dokan_admin_setup_wizard_step_store_start', [ SetupWizardNoWC::class, 'add_wc_html_step_start' ] );
                add_action( 'dokan_admin_setup_wizard_save_step_store', [ SetupWizardNoWC::class, 'save_wc_store_setup_data' ] );
            }
        }
    }

    /**
     * Give manage_woocommerce cap to admin if not there.
     *
     * @param array $caps
     *
     * @return array
     */
    public function set_user_cap( $caps ) {
        if ( ! empty( $caps['manage_options'] ) ) {
            $caps['manage_woocommerce'] = true;
        }

        return $caps;
    }

    /**
     * Enqueue scripts & styles
     *
     * @return void
     */
    public function enqueue_scripts() {
        $suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';
        if ( ! is_admin() ) {
            wp_register_script( 'selectWoo', WC()->plugin_url() . '/assets/js/selectWoo/selectWoo.full' . $suffix . '.js', [ 'jquery' ], '1.0.1', true );
            wp_register_script( 'wc-enhanced-select', WC()->plugin_url() . '/assets/js/admin/wc-enhanced-select' . $suffix . '.js', [ 'jquery', 'selectWoo' ], WC_VERSION, true );
            wp_enqueue_style( 'woocommerce_admin_styles', WC()->plugin_url() . '/assets/css/admin.css', [], WC_VERSION );
            wp_localize_script(
                'wc-enhanced-select',
                'wc_enhanced_select_params',
                [
                    'i18n_no_matches'           => _x( 'No matches found', 'enhanced select', 'dokan-lite' ),
                    'i18n_ajax_error'           => _x( 'Loading failed', 'enhanced select', 'dokan-lite' ),
                    'i18n_input_too_short_1'    => _x( 'Please enter 1 or more characters', 'enhanced select', 'dokan-lite' ),
                    'i18n_input_too_short_n'    => _x( 'Please enter %qty% or more characters', 'enhanced select', 'dokan-lite' ),
                    'i18n_input_too_long_1'     => _x( 'Please delete 1 character', 'enhanced select', 'dokan-lite' ),
                    'i18n_input_too_long_n'     => _x( 'Please delete %qty% characters', 'enhanced select', 'dokan-lite' ),
                    'i18n_selection_too_long_1' => _x( 'You can only select 1 item', 'enhanced select', 'dokan-lite' ),
                    'i18n_selection_too_long_n' => _x( 'You can only select %qty% items', 'enhanced select', 'dokan-lite' ),
                    'i18n_load_more'            => _x( 'Loading more results&hellip;', 'enhanced select', 'dokan-lite' ),
                    'i18n_searching'            => _x( 'Searching&hellip;', 'enhanced select', 'dokan-lite' ),
                    'ajax_url'                  => admin_url( 'admin-ajax.php' ),
                ]
            );
        }

        wp_enqueue_style( 'wc-setup', WC()->plugin_url() . '/assets/css/wc-setup.css', [ 'dashicons', 'install' ], WC_VERSION );
        wp_enqueue_style( 'dokan-setup', DOKAN_PLUGIN_ASSEST . '/css/setup.css', [ 'wc-setup' ], DOKAN_PLUGIN_VERSION );

        wp_enqueue_script(
            'dokan-vue-bootstrap',
            DOKAN_PLUGIN_ASSEST . '/js/vue-bootstrap.js',
            [ 'dokan-vue-vendor', 'dokan-i18n-jed', 'wp-hooks' ],
            DOKAN_PLUGIN_VERSION,
            [ 'in_footer' => true ]
        );

        wp_localize_script(
            'dokan-vue-bootstrap',
            'dokan',
            dokan()->scripts->get_admin_localized_scripts()
        );
        wp_enqueue_script(
            'dokan-setup-wizard-commission',
            DOKAN_PLUGIN_ASSEST . '/js/dokan-setup-wizard-commission.js',
            array( 'jquery', 'dokan-vue-bootstrap', 'dokan-accounting' ),
            DOKAN_PLUGIN_VERSION,
            [ 'in_footer' => true ]
        );
        wp_enqueue_style(
            'dokan-setup-wizard-commission',
            DOKAN_PLUGIN_ASSEST . '/css/dokan-setup-wizard-commission.css',
            [ 'dokan-setup' ],
            DOKAN_PLUGIN_VERSION
        );

        wp_enqueue_style(
            'dokan-category-commission',
            DOKAN_PLUGIN_ASSEST . '/css/dokan-category-commission.css',
            [],
            DOKAN_PLUGIN_VERSION
        );

        if ( 'off' === dokan_get_option( 'disable_dokan_fontawesome', 'dokan_appearance', 'off' ) ) {
            wp_enqueue_style( 'dokan-fontawesome' );
        }

        wp_register_script( 'jquery-tiptip', WC()->plugin_url() . '/assets/js/jquery-tiptip/jquery.tipTip.min.js', [ 'jquery' ], WC_VERSION, true );
        wp_register_script( 'wc-setup', WC()->plugin_url() . '/assets/js/admin/wc-setup.min.js', [ 'jquery', 'wc-enhanced-select', 'jquery-blockui', 'wp-util', 'jquery-tiptip', 'dokan-util-helper' ], WC_VERSION, true );

        wp_localize_script(
            'wc-setup',
            'wc_setup_params',
            []
        );
        /**
         * Action fires after finishing enqueuing setup wizard assets
         *
         * @since 2.8.7
         */
        do_action( 'dokan_setup_wizard_enqueue_scripts' );
    }

    /**
     * Helper method to get postcode configurations from `WC()->countries->get_country_locale()`.
     * We don't use `wp_list_pluck` because it will throw notices when postcode configuration is not defined for a country.
     *
     * @return array
     */
    protected static function get_postcodes() {
        $locales   = WC()->countries->get_country_locale();
        $postcodes = [];
        foreach ( $locales as $country_code => $locale ) {
            if ( isset( $locale['postcode'] ) ) {
                $postcodes[ $country_code ] = $locale['postcode'];
            }
        }

        return $postcodes;
    }

    /**
     * Add admin menus/screens.
     */
    public function admin_menus() {
        add_submenu_page( '', '', '', 'manage_woocommerce', 'dokan-setup', '' );
    }

    /**
     * Set wizard steps
     *
     * @since 2.9.27
     *
     * @return void
     */
    protected function set_steps() {
        $this->steps = apply_filters(
            'dokan_admin_setup_wizard_steps', [
                'introduction' => [
                    'name' => __( 'Introduction', 'dokan-lite' ),
                    'view' => [ $this, 'dokan_setup_introduction' ],
                ],
                'store'        => [
                    'name'    => __( 'Store', 'dokan-lite' ),
                    'view'    => [ $this, 'dokan_setup_store' ],
                    'handler' => [ $this, 'dokan_setup_store_save' ],
                ],
                'selling'     => [
                    'name'    => __( 'Selling', 'dokan-lite' ),
                    'view'    => [ $this, 'dokan_setup_selling' ],
                    'handler' => [ $this, 'dokan_setup_selling_save' ],
                ],
                'commission'  => [
                    'name'    => __( 'Commission', 'dokan-lite' ),
                    'view'    => [ $this, 'dokan_setup_commission' ],
                    'handler' => [ $this, 'dokan_setup_commission_save' ],
                ],
                'withdraw'     => [
                    'name'    => __( 'Withdraw', 'dokan-lite' ),
                    'view'    => [ $this, 'dokan_setup_withdraw' ],
                    'handler' => [ $this, 'dokan_setup_withdraw_save' ],
                ],
                'recommended'  => [
                    'name'    => __( 'Recommended', 'dokan-lite' ),
                    'view'    => [ $this, 'dokan_setup_recommended' ],
                    'handler' => [ $this, 'dokan_setup_recommended_save' ],
                ],
                'next_steps'   => [
                    'name'    => __( 'Ready!', 'dokan-lite' ),
                    'view'    => [ $this, 'dokan_setup_ready' ],
                    'handler' => '',
                ],
            ]
        );
    }

    /**
     * Get wizard steps
     *
     * @since 2.9.27
     *
     * @return array
     */
    public function get_steps() {
        return $this->steps;
    }

    /**
     * Wizard templates
     *
     * @since 2.9.27
     *
     * @return void
     */
    protected function set_setup_wizard_template() {
        $this->setup_wizard_header();
        $this->setup_wizard_steps();
        $this->setup_wizard_content();
        $this->setup_wizard_footer();
    }

    /**
     * Show the setup wizard.
     */
    public function setup_wizard() {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        // check if we are in dokan-setup page
        if ( empty( $_GET['page'] ) || 'dokan-setup' !== $_GET['page'] ) { // phpcs:ignore
            return;
        }

        //setup wizard steps
        $this->set_steps();

        // Hide recommended step if nothing is going to be shown there.
        if ( ! $this->should_show_recommended_step() ) {
            unset( $this->steps['recommended'] );
        }

        $this->current_step = current( array_keys( $this->steps ) );
        // get step from url
        if ( isset( $_GET['_admin_sw_nonce'], $_GET['step'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_admin_sw_nonce'] ) ), 'dokan_admin_setup_wizard_nonce' ) ) {
            $this->current_step = sanitize_key( wp_unslash( $_GET['step'] ) );
        }

        $this->enqueue_scripts();

        if (
            isset( $_POST['_wpnonce'], $_POST['save_step'] )
            && wp_verify_nonce( sanitize_key( wp_unslash( $_POST['_wpnonce'] ) ), 'dokan-setup' )
            && ! empty( $_POST['save_step'] )
            && isset( $this->steps[ $this->current_step ]['handler'] ) ) {
            call_user_func_array( $this->steps[ $this->current_step ]['handler'], [ $this ] );
        }

        ob_start();
        $this->set_setup_wizard_template();
        exit;
    }

    public function get_next_step_link() {
        $keys = array_keys( $this->steps );

        return add_query_arg(
            [
                'step' => $keys[ array_search( $this->current_step, array_keys( $this->steps ), true ) + 1 ],
                '_admin_sw_nonce' => wp_create_nonce( 'dokan_admin_setup_wizard_nonce' ),
            ]
        );
    }

    /**
     * Setup Wizard Header.
     */
    public function setup_wizard_header() {
        set_current_screen();
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>
        <head>
            <meta name="viewport" content="width=device-width"/>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
            <title><?php esc_html_e( 'Dokan &rsaquo; Setup Wizard', 'dokan-lite' ); ?></title>
            <?php
            wp_print_scripts();
            wp_enqueue_emoji_styles();
            do_action( 'admin_print_styles' );
            wp_enqueue_admin_bar_header_styles();
            do_action( 'admin_head' );
            do_action( 'dokan_setup_wizard_styles' );
            ?>
        </head>
        <body class="wc-setup dokan-admin-setup-wizard wp-core-ui<?php echo get_transient( 'dokan_setup_wizard_no_wc' ) ? ' dokan-setup-wizard-activated-wc' : ''; ?>">
        <?php
        $logo_url = ( ! empty( $this->custom_logo ) ) ? $this->custom_logo : plugins_url( 'assets/images/dokan-logo.png', DOKAN_FILE );
        ?>
        <h1 id="wc-logo"><a href="https://dokan.co/wordpress/"><img src="<?php echo esc_url( $logo_url ); ?>" alt="Dokan Logo" width="135" height="auto"/></a></h1>
        <?php
    }

    /**
     * Setup Wizard Footer.
     */
    public function setup_wizard_footer() {
        ?>
        <?php if ( 'next_steps' === $this->current_step ) : ?>
            <a class="wc-return-to-dashboard" href="<?php echo esc_url( admin_url() ); ?>"><?php esc_html_e( 'Return to the WordPress Dashboard', 'dokan-lite' ); ?></a>
        <?php endif; ?>
        </body>
        </html>
        <?php
    }

    /**
     * Output the steps.
     */
    public function setup_wizard_steps() {
        $ouput_steps = $this->steps;
        array_shift( $ouput_steps );
        ?>
        <ol class="wc-setup-steps">
            <?php foreach ( $ouput_steps as $step_key => $step ) : ?>
                <li class="
                <?php
                if ( $step_key === $this->current_step ) {
                    echo 'active';
                } elseif ( array_search( $this->current_step, array_keys( $this->steps ), true ) > array_search( $step_key, array_keys( $this->steps ), true ) ) {
                    echo 'done';
                }
                ?>
                "><?php echo esc_html( $step['name'] ); ?></li>
            <?php endforeach; ?>
        </ol>
        <?php
    }

    /**
     * Output the content for the current step.
     */
    public function setup_wizard_content() {
        if ( empty( $this->steps[ $this->current_step ]['view'] ) ) {
            wp_safe_redirect( esc_url_raw( add_query_arg( 'step', 'introduction' ) ) );
            exit;
        }

        echo '<div class="wc-setup-content">';
        call_user_func( $this->steps[ $this->current_step ]['view'] );
        echo '</div>';
    }

    /**
     * Introduction step.
     */
    public function dokan_setup_introduction() {
        ?>
        <h1><?php esc_html_e( 'Welcome to the world of Dokan!', 'dokan-lite' ); ?></h1>
        <p><?php echo wp_kses( __( 'Thank you for choosing Dokan to power your online marketplace! This quick setup wizard will help you configure the basic settings. <strong>It’s completely optional and shouldn’t take longer than three minutes.</strong>', 'dokan-lite' ), [ 'strong' => [] ] ); ?></p>
        <p><?php esc_html_e( 'No time right now? If you don’t want to go through the wizard, you can skip and return to the WordPress dashboard. Come back anytime if you change your mind!', 'dokan-lite' ); ?></p>
        <p class="wc-setup-actions step">
            <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button-primary button button-large button-next"><?php esc_html_e( 'Let\'s Go!', 'dokan-lite' ); ?></a>
            <a href="<?php echo esc_url( admin_url() ); ?>" class="button button-large"><?php esc_html_e( 'Not right now', 'dokan-lite' ); ?></a>
        </p>
        <?php
    }

    /**
     * Store step.
     */
    public function dokan_setup_store() {
        $general_options  = get_option( 'dokan_general', [] );
        $custom_store_url = ! empty( $general_options['custom_store_url'] ) ? $general_options['custom_store_url'] : 'store';

        $selling_options            = get_option( 'dokan_selling', [] );
        $shipping_fee_recipient     = ! empty( $selling_options['shipping_fee_recipient'] ) ? $selling_options['shipping_fee_recipient'] : 'seller';
        $tax_fee_recipient          = ! empty( $selling_options['tax_fee_recipient'] ) ? $selling_options['tax_fee_recipient'] : 'seller';
        $shipping_tax_fee_recipient = ! empty( $selling_options['shipping_tax_fee_recipient'] ) ? $selling_options['shipping_tax_fee_recipient'] : 'seller';
        $map_api_source             = dokan_get_option( 'map_api_source', 'dokan_appearance', 'google_maps' );
        $gmap_api_key               = dokan_get_option( 'gmap_api_key', 'dokan_appearance', '' );
        $mapbox_access_token        = dokan_get_option( 'mapbox_access_token', 'dokan_appearance', '' );

        $recipients = [
            'seller' => __( 'Vendor', 'dokan-lite' ),
            'admin'  => __( 'Admin', 'dokan-lite' ),
        ];

        $args = apply_filters(
            'dokan_admin_setup_wizard_step_setup_store_template_args', [
                'custom_store_url'           => $custom_store_url,
                'recipients'                 => $recipients,
                'shipping_fee_recipient'     => $shipping_fee_recipient,
                'tax_fee_recipient'          => $tax_fee_recipient,
                'shipping_tax_fee_recipient' => $shipping_tax_fee_recipient,
                'map_api_source'             => $map_api_source,
                'gmap_api_key'               => $gmap_api_key,
                'mapbox_access_token'        => $mapbox_access_token,
                'map_api_source_options'     => [
                    'google_maps' => __( 'Google Maps', 'dokan-lite' ),
                    'mapbox'      => __( 'Mapbox', 'dokan-lite' ),
                ],
                'setup_wizard'               => $this,
            ]
        );

        dokan_get_template( 'admin-setup-wizard/step-store.php', $args );
    }

    /**
     * Save store options.
     */
    public function dokan_setup_store_save() {
        check_admin_referer( 'dokan-setup' );

        $general_options = get_option( 'dokan_general', [] );
        $selling_options = get_option( 'dokan_selling', [] );
        $appearance      = get_option( 'dokan_appearance', [] );

        $general_options['custom_store_url']           = ! empty( $_POST['custom_store_url'] ) ? sanitize_text_field( wp_unslash( $_POST['custom_store_url'] ) ) : '';
        $selling_options['shipping_fee_recipient']     = ! empty( $_POST['shipping_fee_recipient'] ) ? sanitize_text_field( wp_unslash( $_POST['shipping_fee_recipient'] ) ) : '';
        $selling_options['tax_fee_recipient']          = ! empty( $_POST['tax_fee_recipient'] ) ? sanitize_text_field( wp_unslash( $_POST['tax_fee_recipient'] ) ) : '';
        $selling_options['shipping_tax_fee_recipient'] = ! empty( $_POST['shipping_tax_fee_recipient'] ) ? sanitize_text_field( wp_unslash( $_POST['shipping_tax_fee_recipient'] ) ) : '';
        $appearance['map_api_source']                  = ! empty( $_POST['map_api_source'] ) ? sanitize_text_field( wp_unslash( $_POST['map_api_source'] ) ) : '';
        $appearance['gmap_api_key']                    = ! empty( $_POST['gmap_api_key'] ) ? sanitize_text_field( wp_unslash( $_POST['gmap_api_key'] ) ) : '';
        $appearance['mapbox_access_token']             = ! empty( $_POST['mapbox_access_token'] ) ? sanitize_text_field( wp_unslash( $_POST['mapbox_access_token'] ) ) : '';

        $share_essentials = isset( $_POST['share_essentials'] );

        if ( $share_essentials ) {
            dokan()->tracker->insights->optin();
        } else {
            dokan()->tracker->insights->optout();
        }

        // store this value for later use
        update_option( 'dokan_share_essentials', $share_essentials );

        // call a hook for other plugins to do their thing
        do_action( 'dokan_share_essentials_updated', $share_essentials );

        update_option( 'dokan_general', $general_options );
        update_option( 'dokan_selling', $selling_options );
        update_option( 'dokan_appearance', $appearance );

        do_action( 'dokan_admin_setup_wizard_save_step_store' );

        wp_safe_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Selling step.
     */
    public function dokan_setup_selling() {
        $options          = get_option( 'dokan_selling', [ 'admin_percentage' => 10 ] );
        $admin_percentage = isset( $options['admin_percentage'] ) ? $options['admin_percentage'] : 10;

        $new_seller_enable_selling = ! empty( $options['new_seller_enable_selling'] ) ? $options['new_seller_enable_selling'] : '';
        $commission_type           = ! empty( $options['commission_type'] ) ? $options['commission_type'] : 'percentage';
        $order_status_change       = ! empty( $options['order_status_change'] ) ? $options['order_status_change'] : '';
        $dokan_commission_types    = dokan_commission_types();

        $args = apply_filters(
            'dokan_admin_setup_wizard_step_setup_selling_template_args', [
                'new_seller_enable_selling' => $new_seller_enable_selling,
                'commission_type'           => $commission_type,
                'admin_percentage'          => $admin_percentage,
                'order_status_change'       => $order_status_change,
                'dokan_commission_types'    => $dokan_commission_types,
                'setup_wizard'              => $this,
            ]
        );

        dokan_get_template( 'admin-setup-wizard/step-selling.php', $args );
    }

    /**
     * Commission step.
     *
     * @since 3.14.5
     *
     * @return void
     */
    public function dokan_setup_commission() {
        $options = get_option( 'dokan_selling', [ 'admin_percentage' => 10 ] );

        $admin_percentage                 = isset( $options['admin_percentage'] ) ? $options['admin_percentage'] : 10;
        $additional_fee                   = isset( $options['additional_fee'] ) ? $options['additional_fee'] : 0;
        $commission_category_based_values = isset( $options['commission_category_based_values'] ) ? $options['commission_category_based_values'] : new stdClass();
        $commission_type                  = ! empty( $options['commission_type'] ) ? $options['commission_type'] : 'fixed';

        $args = apply_filters(
            'dokan_admin_setup_wizard_step_setup_selling_template_args', [
                'commission_type'                  => $commission_type,
                'admin_percentage'                 => $admin_percentage,
                'additional_fee'                   => $additional_fee,
                'commission_category_based_values' => $commission_category_based_values,
                'dokanCommission'                  => dokan_commission_types(),
                'setup_wizard'                     => $this,
            ]
        );

        dokan_get_template( 'admin-setup-wizard/step-commission.php', $args );
    }

    /**
     * Save selling options.
     */
    public function dokan_setup_selling_save() {
        check_admin_referer( 'dokan-setup' );

        $options                              = get_option( 'dokan_selling', [] );
        $options['new_seller_enable_selling'] = isset( $_POST['new_seller_enable_selling'] ) ? 'on' : 'off';
        $options['order_status_change']       = isset( $_POST['order_status_change'] ) ? 'on' : 'off';

        update_option( 'dokan_selling', $options );

        do_action( 'dokan_admin_setup_wizard_save_step_setup_selling', $options, [] );

        wp_safe_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Save commission options.
     *
     * @since 3.14.5
     *
     * @return void
     */
    public function dokan_setup_commission_save() {
        check_admin_referer( 'dokan-setup' );

        $dokan_commission_percentage = isset( $_POST['dokan_commission_percentage'] ) ? (float) wc_format_decimal( sanitize_text_field( wp_unslash( $_POST['dokan_commission_percentage'] ) ) ) : 0;
        if ( $dokan_commission_percentage < 0 || $dokan_commission_percentage > 100 ) {
            $dokan_commission_percentage = 0;
        }

        $options                                     = get_option( 'dokan_selling', [] );
        $options['commission_type']                  = isset( $_POST['dokan_commission_type'] ) ? sanitize_text_field( wp_unslash( $_POST['dokan_commission_type'] ) ) : 'fixed';
        $options['admin_percentage']                 = $dokan_commission_percentage;
        $options['additional_fee']                   = isset( $_POST['dokan_commission_flat'] ) ? sanitize_text_field( wp_unslash( $_POST['dokan_commission_flat'] ) ) : 0;
        $options['commission_category_based_values'] = isset( $_POST['dokan_commission_category_based'] ) ? wc_clean( json_decode( sanitize_text_field( wp_unslash( $_POST['dokan_commission_category_based'] ) ), true ) ) : [];

        update_option( 'dokan_selling', $options );

        do_action( 'dokan_admin_setup_wizard_save_step_setup_commission', $options, [] );

        wp_safe_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Withdraw Step.
     */
    public function dokan_setup_withdraw() {
        $options = get_option(
            'dokan_withdraw', [
                'withdraw_methods'      => [ 'paypal' => 'paypal' ],
                'withdraw_limit'        => 50,
                'withdraw_order_status' => [ 'wc-completed' => 'wc-completed' ],
            ]
        );

        $withdraw_methods      = ! empty( $options['withdraw_methods'] ) ? $options['withdraw_methods'] : [];
        $withdraw_limit        = ! empty( $options['withdraw_limit'] ) ? $options['withdraw_limit'] : 0;
        $withdraw_order_status = ! empty( $options['withdraw_order_status'] ) ? $options['withdraw_order_status'] : [];
        $hide_custom_method    = empty( $options['withdraw_method_name'] ) || empty( $options['withdraw_method_type'] );
        ?>
        <h1><?php esc_html_e( 'Withdraw Setup', 'dokan-lite' ); ?></h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="withdraw_methods"><?php esc_html_e( 'Withdraw Methods', 'dokan-lite' ); ?></label></th>
                </tr>
                <tr>
                    <td colspan="2">
                        <ul class="wc-wizard-payment-gateways wc-wizard-services">
                            <?php
                            foreach ( dokan_withdraw_register_methods() as $key => $method ) :
                                if ( 'dokan_custom' === $key && $hide_custom_method ) {
                                    continue;
                                }
                                ?>
                                <li class="wc-wizard-service-item <?php echo ( in_array( $key, array_values( $withdraw_methods ), true ) ) ? 'checked="checked"' : ''; ?>">
                                    <div class="wc-wizard-service-name">
                                        <p><?php echo esc_html( dokan_withdraw_get_method_title( $key ) ); ?></p>
                                    </div>
                                    <div class="wc-wizard-service-description">
                                        <?php
                                        // translators: %s: withdraw method name
                                        printf( esc_html__( 'Enable %s for your vendor as a withdraw method', 'dokan-lite' ), esc_html( dokan_withdraw_get_method_title( $key ) ) );
                                        ?>
                                    </div>
                                    <div class="dokan-wizard-service-enable">
                                        <input type="checkbox" name="withdraw_methods[<?php echo esc_attr( $key ); ?>]" id="withdraw_methods[<?php echo esc_attr( $key ); ?>]" class="switch-input"
                                                value="<?php echo esc_attr( $key ); ?>" <?php echo ( in_array( $key, array_values( $withdraw_methods ), true ) ) ? 'checked="checked"' : ''; ?>>
                                        <label for="withdraw_methods[<?php echo esc_attr( $key ); ?>]" class="switch-label"></label>
                                    </div>
                                </li>
                            <?php endforeach ?>

                            <?php
                            /**
                             * Hook to include more withdraw options during setup
                             *
                             * @since 2.8.7
                             *
                             * @param array $options dokan_withdraw settings
                             */
                            do_action( 'dokan_setup_wizard_view_withdraw_methods', $options );
                            ?>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="withdraw_limit"><?php esc_html_e( 'Minimum Withdraw Limit', 'dokan-lite' ); ?></label></th>
                    <td>
                        <input type="text" id="withdraw_limit" name="withdraw_limit" value="<?php echo esc_attr( $withdraw_limit ); ?>"/>
                        <p class="description"><?php esc_html_e( 'Minimum balance required to make a withdraw request ( Leave it blank to set no limits )', 'dokan-lite' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="withdraw_order_status"><?php esc_html_e( 'Order Status for Withdraw', 'dokan-lite' ); ?></label></th>
                    <td>
                        <ul class="list-unstyled">
                            <li class="checkbox">
                                <input type="checkbox" name="withdraw_order_status[wc-completed]" id="withdraw_order_status[wc-completed]" class="switch-input"
                                        value="wc-completed" <?php echo ( array_key_exists( 'wc-completed', $withdraw_order_status ) ) ? 'checked="true"' : ''; ?>>
                                <label for="withdraw_order_status[wc-completed]">
                                    <?php esc_html_e( 'Completed', 'dokan-lite' ); ?>
                                </label>
                            </li>
                            <li class="checkbox">
                                <input type="checkbox" name="withdraw_order_status[wc-processing]" id="withdraw_order_status[wc-processing]" class="switch-input"
                                        value="wc-processing" <?php echo ( array_key_exists( 'wc-processing', $withdraw_order_status ) ) ? 'checked="true"' : ''; ?>>
                                <label for="withdraw_order_status[wc-processing]">
                                    <?php esc_html_e( 'Processing', 'dokan-lite' ); ?>
                                </label>
                            </li>
                        </ul>

                        <p class="description"><?php esc_html_e( 'Order status for which vendor can make a withdraw request.', 'dokan-lite' ); ?></p>
                    </td>
                </tr>
            </table>
            <p class="wc-setup-actions step">
                <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>" name="save_step"/>
                <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button button-large button-next"><?php esc_html_e( 'Skip this step', 'dokan-lite' ); ?></a>
                <?php wp_nonce_field( 'dokan-setup' ); ?>
            </p>
        </form>
        <?php
    }

    /**
     * Recommended Step
     *
     * @since 2.8.7
     *
     * @return void
     */
    public function dokan_setup_recommended() {
        ?>
        <h1><?php esc_html_e( 'Recommended for All Dokan Marketplaces', 'dokan-lite' ); ?></h1>

        <p><?php esc_html_e( 'Enhance your store with these recommended features.', 'dokan-lite' ); ?></p>

        <form method="post">
            <ul class="recommended-step">
                <?php
                if ( $this->user_can_install_plugin() ) {
                    if ( ! $this->is_wc_conversion_tracking_active() ) {
                        $this->display_recommended_item(
                            [
                                'type'        => 'wc_conversion_tracking',
                                'title'       => __( 'WooCommerce Conversion Tracking', 'dokan-lite' ),
                                'description' => __( 'Track conversions on your WooCommerce store like a pro!', 'dokan-lite' ),
                                'img_url'     => DOKAN_PLUGIN_ASSEST . '/images/wc-conversion-tracking-logo.png',
                                'img_alt'     => __( 'WooCommerce Conversion Tracking logo', 'dokan-lite' ),
                                'plugins'     => [
                                    [
                                        'name' => __( 'WooCommerce Conversion Tracking', 'dokan-lite' ),
                                        'slug' => 'woocommerce-conversion-tracking',
                                    ],
                                ],
                            ]
                        );
                    }

                    if ( ! $this->is_wemail_active() ) {
                        $this->display_recommended_item(
                            [
                                'type'        => 'wemail',
                                'title'       => __( 'weMail', 'dokan-lite' ),
                                'description' => __( 'Simplified Email  Marketing Solution for WordPress!', 'dokan-lite' ),
                                'img_url'     => DOKAN_PLUGIN_ASSEST . '/images/wemail-logo.png',
                                'img_alt'     => __( 'weMail logo', 'dokan-lite' ),
                                'plugins'     => [
                                    [
                                        'name' => __( 'weMail', 'dokan-lite' ),
                                        'slug' => 'wemail',
                                    ],
                                ],
                            ]
                        );
                    }

                    if ( ! $this->is_texty_active() ) {
                        $this->display_recommended_item(
                            [
                                'type'        => 'texty',
                                'title'       => __( 'Texty', 'dokan-lite' ),
                                'description' => __( 'SMS Notification for WordPress, WooCommerce, Dokan and more', 'dokan-lite' ),
                                'img_url'     => DOKAN_PLUGIN_ASSEST . '/images/texty-logo.png',
                                'img_alt'     => __( 'Texty logo', 'dokan-lite' ),
                                'plugins'     => [
                                    [
                                        'name' => __( 'Texty', 'dokan-lite' ),
                                        'slug' => 'texty',
                                    ],
                                ],
                            ]
                        );
                    }
                }
                ?>
            </ul>
            <p class="wc-setup-actions step">
                <?php $this->plugin_install_info(); ?>
                <button type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>" name="save_step"><?php esc_html_e( 'Continue', 'dokan-lite' ); ?></button>
                <?php wp_nonce_field( 'dokan-setup' ); ?>
            </p>
        </form>
        <?php
    }

    /**
     * Save data from recommended step
     *
     * @since 2.8.7
     *
     * @return void
     */
    public function dokan_setup_recommended_save() {
        check_admin_referer( 'dokan-setup' );

        $setup_wc_conversion_tracking = isset( $_POST['setup_wc_conversion_tracking'] ) && 'yes' === sanitize_text_field( wp_unslash( $_POST['setup_wc_conversion_tracking'] ) );
        $setup_wemail                 = isset( $_POST['setup_wemail'] ) && 'yes' === sanitize_text_field( wp_unslash( $_POST['setup_wemail'] ) );
        $setup_texty                  = isset( $_POST['setup_texty'] ) && 'yes' === sanitize_text_field( wp_unslash( $_POST['setup_texty'] ) );

        if ( $setup_wc_conversion_tracking && ! $this->is_wc_conversion_tracking_active() ) {
            $this->install_plugin(
                'woocommerce-conversion-tracking',
                [
                    'name'      => __( 'WooCommerce Conversion Tracking', 'dokan-lite' ),
                    'repo-slug' => 'woocommerce-conversion-tracking',
                    'file'      => 'conversion-tracking.php',
                ]
            );
        }

        if ( $setup_wemail && ! $this->is_wemail_active() ) {
            $this->install_plugin(
                'wemail',
                [
                    'name'      => __( 'weMail', 'dokan-lite' ),
                    'repo-slug' => 'wemail',
                    'file'      => 'wemail.php',
                ]
            );
        }

        if ( $setup_texty && ! $this->is_texty_active() ) {
            $this->install_plugin(
                'texty',
                [
                    'name'      => __( 'Texty', 'dokan-lite' ),
                    'repo-slug' => 'texty',
                    'file'      => 'texty.php',
                ]
            );
        }

        /**
         * WooCoomerce settings manipulation
         */
        // Enable registration by default
        update_option( 'woocommerce_enable_myaccount_registration', 'yes' );

        // Generate usename by default
        update_option( 'woocommerce_registration_generate_username', 'yes' );

        // Let vendors/customers set their own password
        update_option( 'woocommerce_registration_generate_password', 'no' );

        wp_safe_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Save withdraw options.
     */
    public function dokan_setup_withdraw_save() {
        check_admin_referer( 'dokan-setup' );

        $options                          = get_option( 'dokan_withdraw', [] );
        $options['withdraw_methods']      = ! empty( $_POST['withdraw_methods'] ) ? wc_clean( wp_unslash( $_POST['withdraw_methods'] ) ) : [];
        $options['withdraw_order_status'] = ! empty( $_POST['withdraw_order_status'] ) ? wc_clean( wp_unslash( $_POST['withdraw_order_status'] ) ) : [];

        if ( ! empty( $_POST['withdraw_limit'] ) ) {
            $input_limit                = sanitize_text_field( wp_unslash( $_POST['withdraw_limit'] ) );
            $options['withdraw_limit']  = is_numeric( $input_limit ) && $input_limit >= 0 ? wc_format_decimal( $input_limit ) : 0;
        } else {
            $options['withdraw_limit'] = 0;
        }

        /**
         * Filter dokan_withdraw options before saving in setup wizard
         *
         * @since 2.8.7
         *
         * @param array $options
         */
        $options = apply_filters( 'dokan_setup_wizard_save_withdraw_options', $options, [] );

        update_option( 'dokan_withdraw', $options );

        wp_safe_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Final step.
     */
    public function dokan_setup_ready() {
        update_option( 'dokan_admin_setup_wizard_ready', true );
        ?>
        <div class="dokan-setup-done">
            <img src="<?php echo esc_url( plugins_url( 'assets/images/dokan-checked.png', DOKAN_FILE ) ); ?>" alt="dokan setup">
            <h1><?php esc_html_e( 'Your Marketplace is Ready!', 'dokan-lite' ); ?></h1>
        </div>

        <div class="dokan-setup-done-content">
            <p class="wc-setup-actions step">
                <a class="button button-primary" href="<?php echo esc_url( admin_url( 'admin.php?page=dokan' ) ); ?>"><?php esc_html_e( 'Visit Dokan Dashboard', 'dokan-lite' ); ?></a>
                <a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=dokan#/settings' ) ); ?>"><?php esc_html_e( 'More Settings', 'dokan-lite' ); ?></a>
            </p>
        </div>
        <?php
    }

    /**
     * Should we display the 'Recommended' step?
     *
     * True if at least one of the recommendations will be displayed.
     *
     * @return boolean
     */
    protected function should_show_recommended_step() {
        if ( ! $this->user_can_install_plugin() ) {
            return false;
        }

        if ( $this->is_wc_conversion_tracking_active() ) {
            return false;
        }

        if ( $this->is_wemail_active() ) {
            return false;
        }

        if ( $this->is_texty_active() ) {
            return false;
        }

        return true;
    }

    /**
     * Check if WC Conversion Tracking is active or not
     *
     * @since 2.8.7
     *
     * @return bool
     */
    protected function is_wc_conversion_tracking_active() {
        return is_plugin_active( 'woocommerce-conversion-tracking/conversion-tracking.php' );
    }

    /**
     * Check if weMail is active or not
     *
     * @since 3.0.0
     *
     * @return bool
     */
    protected function is_wemail_active() {
        return is_plugin_active( 'wemail/wemail.php' );
    }

    /**
     * Check if texty is active or not
     *
     * @since 3.2.11
     *
     * @return bool
     */
    protected function is_texty_active() {
        return is_plugin_active( 'texty/texty.php' );
    }

    /**
     * Should we show the WooCommerce Conversion Tracking install option?
     *
     * True only if the user can install plugins.
     *
     * @return boolean
     */
    protected function user_can_install_plugin() {
        return current_user_can( 'install_plugins' );
    }

    protected function display_recommended_item( $item_info ) {
        $type        = $item_info['type'];
        $title       = $item_info['title'];
        $description = $item_info['description'];
        $img_url     = $item_info['img_url'];
        $img_alt     = $item_info['img_alt'];
        ?>
        <li class="recommended-item checkbox">
            <input
                id="<?php echo esc_attr( 'dokan_recommended_' . $type ); ?>"
                type="checkbox"
                name="<?php echo esc_attr( 'setup_' . $type ); ?>"
                value="yes"
                checked
                data-plugins="<?php echo esc_attr( wp_json_encode( isset( $item_info['plugins'] ) ? $item_info['plugins'] : null ) ); ?>"
            />
            <label for="<?php echo esc_attr( 'dokan_recommended_' . $type ); ?>">
                <img
                    src="<?php echo esc_url( $img_url ); ?>"
                    class="<?php echo esc_attr( 'recommended-item-icon-' . $type ); ?> recommended-item-icon"
                    alt="<?php echo esc_attr( $img_alt ); ?>"/>
                <div class="recommended-item-description-container">
                    <h3><?php echo esc_html( $title ); ?></h3>
                    <p>
                        <?php
                        echo wp_kses(
                            $description, [
                                'a'  => [
                                    'href'   => [],
                                    'target' => [],
                                    'rel'    => [],
                                ],
                                'em' => [],
                            ]
                        );
                        ?>
                    </p>
                </div>
            </label>
        </li>
        <?php
    }

    /**
     * Plugin install info message markup with heading.
     */
    public function plugin_install_info() {
        ?>
        <span class="plugin-install-info">
            <span class="plugin-install-info-label"><?php esc_html_e( 'The following plugins will be installed and activated for you:', 'dokan-lite' ); ?></span>
            <span class="plugin-install-info-list"></span>
        </span>
        <?php
    }

    /**
     * Helper method to queue the background install of a plugin.
     *
     * @param string $plugin_id   Plugin id used for background install.
     * @param array  $plugin_info Plugin info array containing name and repo-slug, and optionally file if different from [repo-slug].php.
     */
    protected function install_plugin( $plugin_id, $plugin_info ) {
        // Make sure we don't trigger multiple simultaneous installs.
        if ( get_option( 'woocommerce_setup_background_installing_' . $plugin_id ) ) {
            return;
        }

        $plugin_file = isset( $plugin_info['file'] ) ? $plugin_info['file'] : $plugin_info['repo-slug'] . '.php';
        if ( is_plugin_active( $plugin_info['repo-slug'] . '/' . $plugin_file ) ) {
            return;
        }

        if ( empty( $this->deferred_actions ) ) {
            add_action( 'shutdown', [ $this, 'run_deferred_actions' ] );
        }

        $this->deferred_actions[] = [
            'func' => [ 'WC_Install', 'background_installer' ],
            'args' => [ $plugin_id, $plugin_info ],
        ];

        // Set the background installation flag for this plugin.
        update_option( 'woocommerce_setup_background_installing_' . $plugin_id, true );
    }

    /**
     * Function called after the HTTP request is finished, so it's executed without the client having to wait for it.
     *
     * @see WC_Admin_Setup_Wizard::install_plugin
     * @see WC_Admin_Setup_Wizard::install_theme
     */
    public function run_deferred_actions() {
        $this->close_http_connection();
        foreach ( $this->deferred_actions as $action ) {
            call_user_func_array( $action['func'], $action['args'] );

            // Clear the background installation flag if this is a plugin.
            if (
                isset( $action['func'][1] ) &&
                'background_installer' === $action['func'][1] &&
                isset( $action['args'][0] )
            ) {
                delete_option( 'woocommerce_setup_background_installing_' . $action['args'][0] );
            }
        }
    }

    /**
     * Finishes replying to the client, but keeps the process running for further (async) code execution.
     *
     * @see https://core.trac.wordpress.org/ticket/41358 .
     */
    protected function close_http_connection() {
        // Only 1 PHP process can access a session object at a time, close this so the next request isn't kept waiting.
        // @codingStandardsIgnoreStart
        if ( session_id() ) {
            session_write_close();
        }
        // @codingStandardsIgnoreEnd

        wc_set_time_limit( 0 );

        // fastcgi_finish_request is the cleanest way to send the response and keep the script running, but not every server has it.
        if ( is_callable( 'fastcgi_finish_request' ) ) {
            fastcgi_finish_request();
        } else {
            // Fallback: send headers and flush buffers.
            if ( ! headers_sent() ) {
                header( 'Connection: close' );
            }
            @ob_end_flush(); // @codingStandardsIgnoreLine.
            flush();
        }
    }
}
