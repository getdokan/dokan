<?php
/**
 * Setup wizard class
 *
 * Walkthrough to the basic setup upon installation
 */

/**
 * The class
 */
class Dokan_Setup_Wizard {

    /** @var string Currenct Step */
    protected $step   = '';

    /** @var array Steps for the setup wizard */
    protected $steps  = array();

    /**
     * Actions to be executed after the HTTP response has completed
     *
     * @var array
     */
    private $deferred_actions = array();

    /**
     * Hook in tabs.
     */
    public function __construct() {
        if ( current_user_can( 'manage_options' ) ) {
            add_action( 'admin_menu', array( $this, 'admin_menus' ) );
            add_action( 'admin_init', array( $this, 'setup_wizard' ), 99 );
            add_action( 'activated_plugin', array( $this, 'activated_plugin' ) );
        }
    }

    /**
     * Enqueue scripts & styles
     *
     * @return void
     */
    public function enqueue_scripts() {
        $suffix     = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

        wp_register_script( 'jquery-tiptip', WC()->plugin_url() . '/assets/js/jquery-tiptip/jquery.tipTip' . $suffix . '.js', array( 'jquery' ), WC_VERSION, true );
        wp_register_script( 'jquery-blockui', WC()->plugin_url() . '/assets/js/jquery-blockui/jquery.blockUI' . $suffix . '.js', array( 'jquery' ), '2.70', true );
        wp_register_script( 'selectWoo', WC()->plugin_url() . '/assets/js/selectWoo/selectWoo.full' . $suffix . '.js', array( 'jquery' ), '1.0.1' );
        wp_register_script( 'wc-enhanced-select', WC()->plugin_url() . '/assets/js/admin/wc-enhanced-select' . $suffix . '.js', array( 'jquery', 'selectWoo' ), WC_VERSION );
        wp_localize_script( 'wc-enhanced-select', 'wc_enhanced_select_params', array(
            'i18n_matches_1'            => _x( 'One result is available, press enter to select it.', 'enhanced select', 'dokan-lite' ),
            'i18n_matches_n'            => _x( '%qty% results are available, use up and down arrow keys to navigate.', 'enhanced select', 'dokan-lite' ),
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
        ) );

        wp_enqueue_style( 'woocommerce_admin_styles', WC()->plugin_url() . '/assets/css/admin.css', array(), WC_VERSION );
        wp_enqueue_style( 'wc-setup', WC()->plugin_url() . '/assets/css/wc-setup.css', array( 'dashicons', 'install' ), WC_VERSION );
        wp_enqueue_style( 'dokan-setup', DOKAN_PLUGIN_ASSEST . '/css/setup.css', array( 'wc-setup' ), DOKAN_PLUGIN_VERSION );

        wp_register_script( 'jquery-tiptip', WC()->plugin_url() . '/assets/js/jquery-tiptip/jquery.tipTip.min.js', array( 'jquery' ), WC_VERSION, true );
        wp_register_script( 'wc-setup', WC()->plugin_url() . '/assets/js/admin/wc-setup.min.js', array( 'jquery', 'wc-enhanced-select', 'jquery-blockui', 'wp-util', 'jquery-tiptip' ), WC_VERSION );

        wp_localize_script( 'wc-setup', 'wc_setup_params', array() );

        /**
         * Action fires after finishing enqueuing setup wizard assets
         *
         * @since 2.8.7
         */
        do_action( 'dokan_setup_wizard_enqueue_scripts' );
    }

    /**
     * Add admin menus/screens.
     */
    public function admin_menus() {
        add_submenu_page( null, '', '', 'manage_options', 'dokan-setup', '' );
    }

    /**
     * Show the setup wizard.
     */
    public function setup_wizard() {
        if ( empty( $_GET['page'] ) || 'dokan-setup' !== $_GET['page'] ) {
            return;
        }

        $this->steps = array(
            'introduction' => array(
                'name'    =>  __( 'Introduction', 'dokan-lite' ),
                'view'    => array( $this, 'dokan_setup_introduction' ),
                'handler' => ''
            ),
            'store' => array(
                'name'    =>  __( 'Store', 'dokan-lite' ),
                'view'    => array( $this, 'dokan_setup_store' ),
                'handler' => array( $this, 'dokan_setup_store_save' ),
            ),
            'selling' => array(
                'name'    =>  __( 'Selling', 'dokan-lite' ),
                'view'    => array( $this, 'dokan_setup_selling' ),
                'handler' => array( $this, 'dokan_setup_selling_save' ),
            ),
            'withdraw' => array(
                'name'    =>  __( 'Withdraw', 'dokan-lite' ),
                'view'    => array( $this, 'dokan_setup_withdraw' ),
                'handler' => array( $this, 'dokan_setup_withdraw_save' ),
            ),
            'recommended' => array(
                'name'    =>  __( 'Recommended', 'dokan-lite' ),
                'view'    => array( $this, 'dokan_setup_recommended' ),
                'handler' => array( $this, 'dokan_setup_recommended_save' ),
            ),
            'next_steps' => array(
                'name'    =>  __( 'Ready!', 'dokan-lite' ),
                'view'    => array( $this, 'dokan_setup_ready' ),
                'handler' => ''
            )
        );

        // Hide recommended step if nothing is going to be shown there.
        if ( ! $this->should_show_recommended_step() ) {
            unset( $this->steps['recommended'] );
        }

        $this->step = isset( $_GET['step'] ) ? sanitize_key( $_GET['step'] ) : current( array_keys( $this->steps ) );

        $this->enqueue_scripts();

        if ( ! empty( $_POST['save_step'] ) && isset( $this->steps[ $this->step ]['handler'] ) ) { // WPCS: CSRF ok.
            call_user_func( $this->steps[ $this->step ]['handler'] );
        }

        ob_start();
        $this->setup_wizard_header();
        $this->setup_wizard_steps();
        $this->setup_wizard_content();
        $this->setup_wizard_footer();
        exit;
    }

    public function get_next_step_link() {
        $keys = array_keys( $this->steps );

        return add_query_arg( 'step', $keys[ array_search( $this->step, array_keys( $this->steps ) ) + 1 ] );
    }

    /**
     * Setup Wizard Header.
     */
    public function setup_wizard_header() {
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>
        <head>
            <meta name="viewport" content="width=device-width" />
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title><?php esc_html_e( 'Dokan &rsaquo; Setup Wizard', 'dokan-lite' ); ?></title>
            <?php wp_print_scripts( 'wc-setup' ); ?>
            <?php do_action( 'admin_print_styles' ); ?>
            <?php do_action( 'admin_head' ); ?>
            <?php do_action( 'dokan_setup_wizard_styles' ); ?>
        </head>
        <body class="wc-setup wp-core-ui">
            <?php
                $logo_url = ( ! empty( $this->custom_logo ) ) ? $this->custom_logo : plugins_url( 'assets/images/dokan-logo.png', DOKAN_FILE );
            ?>
            <h1 id="wc-logo"><a href="https://wedevs.com/dokan/"><img src="<?php echo esc_url( $logo_url ); ?>" alt="Dokan Logo" width="135" height="auto" /></a></h1>
        <?php
    }

    /**
     * Setup Wizard Footer.
     */
    public function setup_wizard_footer() {
        ?>
            <?php if ( 'next_steps' === $this->step ) : ?>
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
                <li class="<?php
                    if ( $step_key === $this->step ) {
                        echo 'active';
                    } elseif ( array_search( $this->step, array_keys( $this->steps ) ) > array_search( $step_key, array_keys( $this->steps ) ) ) {
                        echo 'done';
                    }
                ?>"><?php echo esc_html( $step['name'] ); ?></li>
            <?php endforeach; ?>
        </ol>
        <?php
    }

    /**
     * Output the content for the current step.
     */
    public function setup_wizard_content() {
        if ( empty( $this->steps[ $this->step ]['view'] ) ) {
            wp_redirect( esc_url_raw( add_query_arg( 'step', 'introduction' ) ) );
            exit;
        }

        echo '<div class="wc-setup-content">';
        call_user_func( $this->steps[ $this->step ]['view'] );
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
        $options                = get_option( 'dokan_general', array() );
        $custom_store_url       = ! empty( $options['custom_store_url'] ) ? $options['custom_store_url'] : 'store';
        $shipping_fee_recipient = ! empty( $options['shipping_fee_recipient'] ) ? $options['shipping_fee_recipient'] : 'seller';
        $tax_fee_recipient      = ! empty( $options['tax_fee_recipient'] ) ? $options['tax_fee_recipient'] : 'seller';

        $recipients = array(
            'seller' => __( 'Vendor', 'dokan-lite' ),
            'admin'  => __( 'Admin', 'dokan-lite' ),
        );
        ?>
        <h1><?php esc_html_e( 'Store Setup', 'dokan-lite' ); ?></h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="custom_store_url"><?php esc_html_e( 'Vendor Store URL', 'dokan-lite' ); ?></label></th>
                    <td>
                        <input type="text" id="custom_store_url" name="custom_store_url" value="<?php echo esc_attr( $custom_store_url ); ?>" />
                        <p class="description"><?php esc_html_e( 'Define vendor store URL', 'dokan-lite' ); ?> (<?php echo esc_url( site_url() ); ?>/[this-text]/[seller-name])</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="shipping_fee_recipient"><?php esc_html_e( 'Shipping Fee Recipient', 'dokan-lite' ); ?></label></th>
                    <td>
                        <select class="wc-enhanced-select" id="shipping_fee_recipient" name="shipping_fee_recipient">
                            <?php
                                foreach ( $recipients as $key => $value ) {
                                    $selected = ( $shipping_fee_recipient == $key ) ? ' selected="true"' : '';
                                    echo '<option value="' . esc_attr( $key ) . '" ' . esc_attr( $selected ) . '>' . esc_html( $value ) . '</option>';
                                }
                            ?>
                        </select>
                        <p class="description"><?php esc_html_e( 'Shipping fees will go to', 'dokan-lite' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="tax_fee_recipient"><?php esc_html_e( 'Tax Fee Recipient', 'dokan-lite' ); ?></label></th>
                    <td>
                        <select class="wc-enhanced-select" id="tax_fee_recipient" name="tax_fee_recipient">
                            <?php
                                foreach ( $recipients as $key => $value ) {
                                    $selected = ( $tax_fee_recipient == $key ) ? ' selected="true"' : '';
                                    echo '<option value="' . esc_attr( $key ) . '" ' . esc_attr( $selected ) . '>' . esc_html( $value ) . '</option>';
                                }
                            ?>
                        </select>
                        <p class="description"><?php esc_html_e( 'Tax fees will go to', 'dokan-lite' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="share_essentials"><?php esc_html_e( 'Share Essentials', 'dokan-lite' ); ?></label></th>

                    <td>
                        <input type="checkbox" name="share_essentials" id="share_essentials" class="switch-input" checked>
                        <label for="share_essentials" class="switch-label">
                            <span class="toggle--on"><?php esc_html_e( 'On', 'dokan-lite' ); ?></span>
                            <span class="toggle--off"><?php esc_html_e( 'Off', 'dokan-lite' ); ?></span>
                        </label>
                        <span class="description">
                            <?php esc_html_e( 'Want to help make Dokan even more awesome? Allow weDevs to collect non-sensitive diagnostic data and usage information.', 'dokan-lite' ); ?>
                            <?php printf( '<a class="insights-data-we-collect" href="#">%s</a>', esc_html__( 'What we collect', 'dokan-lite' ) ); ?>
                        </span>
                        <p id="collection-info" class="description" style="display:none;">
                            <?php esc_html_e( 'Server environment details (php, mysql, server, WordPress versions), Number of users in your site, Site language, Number of active and inactive plugins, Site name and url, Your name and email address. No sensitive data is tracked.', 'dokan-lite' ); ?>
                        </p>
                    </td>
                </tr>
            </table>
            <p class="wc-setup-actions step">
                <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>" name="save_step" />
                <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button button-large button-next"><?php esc_html_e( 'Skip this step', 'dokan-lite' ); ?></a>
                <?php wp_nonce_field( 'dokan-setup' ); ?>
            </p>
        </form>

        <script type="text/javascript">
            jQuery('.insights-data-we-collect').on('click', function(e) {
                e.preventDefault();
                jQuery('#collection-info').slideToggle('fast');
            });
        </script>
        <?php
    }

    /**
     * Save store options.
     */
    public function dokan_setup_store_save() {
        check_admin_referer( 'dokan-setup' );

        $options = get_option( 'dokan_general', array() );
        $_post_data = wp_unslash($_POST);

        $options['custom_store_url']       = ! empty( $_post_data['custom_store_url'] ) ? sanitize_text_field( $_post_data['custom_store_url'] ) : '';
        $options['tax_fee_recipient']      = ! empty( $_post_data['tax_fee_recipient'] ) ? sanitize_text_field( $_post_data['tax_fee_recipient'] ) : '';
        $options['shipping_fee_recipient'] = ! empty( $_post_data['shipping_fee_recipient'] ) ? sanitize_text_field( $_post_data['shipping_fee_recipient'] ) : '';

        $share_essentials = sanitize_text_field( isset( $_post_data['share_essentials'] ) );

        if ( $share_essentials ) {
            dokan()->tracker->insights->optin();
        } else {
            dokan()->tracker->insights->optout();
        }

        update_option( 'dokan_general', $options );

        wp_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Selling step.
     */
    public function dokan_setup_selling() {
        $options = get_option( 'dokan_selling', array() );
        $new_seller_enable_selling = ! empty( $options['new_seller_enable_selling'] ) ? $options['new_seller_enable_selling'] : '';
        $commission_type           = ! empty( $options['commission_type'] ) ? $options['commission_type'] : 'percentage';
        $admin_percentage          = ! empty( $options['admin_percentage'] ) ? $options['admin_percentage'] : '';
        $order_status_change       = ! empty( $options['order_status_change'] ) ? $options['order_status_change'] : '';

        ?>
        <h1><?php esc_html_e( 'Selling Setup', 'dokan-lite' ); ?></h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="new_seller_enable_selling"><?php esc_html_e( 'New Vendor Enable Selling', 'dokan-lite' ); ?></label></th>
                    <td>
                        <input type="checkbox" name="new_seller_enable_selling" id="new_seller_enable_selling" class="switch-input" <?php echo ( $new_seller_enable_selling == 'on' ) ? 'checked="checked"' : ''; ?>>
                        <label for="new_seller_enable_selling" class="switch-label">
                            <span class="toggle--on"><?php esc_html_e( 'On', 'dokan-lite' ); ?></span>
                            <span class="toggle--off"><?php esc_html_e( 'Off', 'dokan-lite' ); ?></span>
                        </label>
                        <span class="description">
                            <?php esc_html_e( 'Make selling status enable for new registred vendor', 'dokan-lite' ); ?>
                        </span>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="admin_percentage"><?php esc_html_e( 'Commission Type', 'dokan-lite' ); ?></label></th>
                    <td>
                        <select class="commission_type wc-enhanced-select" name="commission_type">
                            <option value="percentage">Percentage(%)</option>
                            <option value="flat">Flat</option>
                        </select>
                        <p class="description"><?php esc_html_e( 'Set your commission type', 'dokan-lite' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="admin_percentage"><?php esc_html_e( 'Admin Commission %', 'dokan-lite' ); ?></label></th>
                    <td>
                        <input type="text" id="admin_percentage" name="admin_percentage" value="<?php echo esc_attr( $admin_percentage ); ?>" />
                        <p class="description"><?php esc_html_e( 'How much amount (%) you will get from each order', 'dokan-lite' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="order_status_change"><?php esc_html_e( 'Order Status Change', 'dokan-lite' ); ?></label></th>
                    <td>
                        <input type="checkbox" name="order_status_change" id="order_status_change" class="switch-input" <?php echo ( $order_status_change == 'on' ) ? 'checked="checked"' : ''; ?>>
                        <label for="order_status_change" class="switch-label">
                            <span class="toggle--on"><?php esc_html_e( 'On', 'dokan-lite' ); ?></span>
                            <span class="toggle--off"><?php esc_html_e( 'Off', 'dokan-lite' ); ?></span>
                        </label>
                        <span class="description">
                            <?php esc_html_e( 'Vendor can change order status', 'dokan-lite' ); ?>
                        </span>
                    </td>
                </tr>
            </table>
            <p class="wc-setup-actions step">
                <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>" name="save_step" />
                <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button button-large button-next"><?php esc_html_e( 'Skip this step', 'dokan-lite' ); ?></a>
                <?php wp_nonce_field( 'dokan-setup' ); ?>
            </p>
        </form>
        <?php
    }

    /**
     * Save selling options.
     */
    public function dokan_setup_selling_save() {
        check_admin_referer( 'dokan-setup' );

        $_post_data = wp_unslash( $_POST );

        $options = get_option( 'dokan_selling', array() );
        $options['new_seller_enable_selling'] = isset( $_post_data['new_seller_enable_selling'] ) ? 'on' : 'off';
        $options['commission_type']           = sanitize_text_field( $_post_data['commission_type'] );
        $options['admin_percentage']          = is_int( $_post_data['admin_percentage'] ) ? intval( $_post_data['admin_percentage'] ) : floatval( $_post_data['admin_percentage'] );
        $options['order_status_change']       = isset( $_post_data['order_status_change'] ) ? 'on' : 'off';

        update_option( 'dokan_selling', $options );

        wp_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Withdraw Step.
     */
    public function dokan_setup_withdraw() {
        $options = get_option( 'dokan_withdraw', array() );

        $withdraw_methods      = ! empty( $options['withdraw_methods'] ) ? $options['withdraw_methods'] : array();
        $withdraw_limit        = ! empty( $options['withdraw_limit'] ) ? $options['withdraw_limit'] : 0;
        $withdraw_order_status = ! empty( $options['withdraw_order_status'] ) ? $options['withdraw_order_status'] : array();
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
                            <li class="wc-wizard-service-item">
                                <div class="wc-wizard-service-name">
                                    <p><?php esc_html_e( 'PayPal', 'dokan-lite' ); ?></p>
                                </div>
                                <div class="wc-wizard-service-description">
                                    <?php esc_html_e( 'Enable PayPal for your vendor as a withdraw method', 'dokan-lite' ); ?>
                                </div>
                                <div class="dokan-wizard-service-enable">
                                    <input type="checkbox" name="withdraw_methods[paypal]" id="withdraw_methods[paypal]" class="switch-input" value="paypal" checked>
                                    <label for="withdraw_methods[paypal]" class="switch-label"></label>
                                </div>
                            </li>

                            <li class="wc-wizard-service-item <?php echo ( array_key_exists( 'paypal', $withdraw_methods ) ) ? 'checked="checked"' : ''; ?>">
                                <div class="wc-wizard-service-name">
                                    <p><?php esc_html_e( 'Bank', 'dokan-lite' ); ?></p>
                                </div>
                                <div class="wc-wizard-service-description">
                                    <?php esc_html_e( 'Enable bank transfer for your vendor as a withdraw method', 'dokan-lite' ); ?>
                                </div>
                                <div class="dokan-wizard-service-enable">
                                    <input type="checkbox" name="withdraw_methods[bank]" id="withdraw_methods[bank]" value="bank" class="switch-input" checked>
                                    <label for="withdraw_methods[bank]" class="switch-label"></label>
                                </div>
                            </li>

                            <li class="wc-wizard-service-item <?php echo ( array_key_exists( 'paypal', $withdraw_methods ) ) ? 'checked="checked"' : ''; ?>">
                                <div class="wc-wizard-service-name">
                                    <p><?php esc_html_e( 'Skrill', 'dokan-lite' ); ?></p>
                                </div>
                                <div class="wc-wizard-service-description">
                                    <?php esc_html_e( 'Enable skrill for your vendor as a withdraw method', 'dokan-lite' ); ?>
                                </div>
                                <div class="dokan-wizard-service-enable">
                                    <input type="checkbox" name="withdraw_methods[skrill]" id="withdraw_methods[skrill]" value="skrill" class="switch-input" checked>
                                    <label for="withdraw_methods[skrill]" class="switch-label"></label>
                                </div>
                            </li>

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
                        <input type="text" id="withdraw_limit" name="withdraw_limit" value="<?php echo esc_attr( $withdraw_limit ); ?>" />
                        <p class="description"><?php esc_html_e( 'Minimum balance required to make a withdraw request ( Leave it blank to set no limits )', 'dokan-lite' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="withdraw_order_status"><?php esc_html_e( 'Order Status for Withdraw', 'dokan-lite' ); ?></label></th>
                    <td>
                        <ul class="list-unstyled">
                            <li class="checkbox">
                                <input type="checkbox" name="withdraw_order_status[wc-completed]" id="withdraw_order_status[wc-completed]" class="switch-input" value="wc-completed" <?php echo ( array_key_exists( 'wc-completed', $withdraw_order_status ) ) ? 'checked="true"' : ''; ?>>
                                <label for="withdraw_order_status[wc-completed]">
                                    <?php esc_html_e( 'Completed', 'dokan-lite' ); ?>
                                </label>
                            </li>
                            <li class="checkbox">
                                <input type="checkbox" name="withdraw_order_status[wc-processing]" id="withdraw_order_status[wc-processing]" class="switch-input" value="wc-processing" <?php echo ( array_key_exists( 'wc-processing', $withdraw_order_status ) ) ? 'checked="true"' : ''; ?>>
                                <label for="withdraw_order_status[wc-processing]">
                                    <?php esc_html_e( 'Processing', 'dokan-lite' ); ?>
                                </label>
                            </li>
                            <li class="checkbox">
                                <input type="checkbox" name="withdraw_order_status[wc-on-hold]" id="withdraw_order_status[wc-on-hold]" class="switch-input" value="wc-on-hold" <?php echo ( array_key_exists( 'wc-on-hold', $withdraw_order_status ) ) ? 'checked="true"' : ''; ?>>
                                <label for="withdraw_order_status[wc-on-hold]">
                                    <?php esc_html_e( 'On-hold', 'dokan-lite' ); ?>
                                </label>
                            </li>
                        </ul>

                        <p class="description"><?php esc_html_e( 'Order status for which vendor can make a withdraw request.', 'dokan-lite' ); ?></p>
                    </td>
                </tr>
            </table>
            <p class="wc-setup-actions step">
                <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>" name="save_step" />
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
                                $this->display_recommended_item( array(
                                    'type'        => 'wc_conversion_tracking',
                                    'title'       => __( 'WooCommerce Conversion Tracking', 'dokan-lite' ),
                                    'description' => __( 'Track conversions on your WooCommerce store like a pro!', 'dokan-lite' ),
                                    'img_url'     => DOKAN_PLUGIN_ASSEST . '/images/wc-conversion-tracking-logo.png',
                                    'img_alt'     => __( 'WooCommerce Conversion Tracking logo', 'dokan-lite' ),
                                    'plugins'     => array( array( 'name' => __( 'WooCommerce Conversion Tracking', 'dokan-lite' ), 'slug' => 'woocommerce-conversion-tracking' ) ),
                                ) );
                            }

                            if ( ! $this->is_weforms_active() ) {
                                $this->display_recommended_item( array(
                                    'type'        => 'weforms',
                                    'title'       => __( 'weForms', 'dokan-lite' ),
                                    'description' => __( 'Best Contact Form Plugin for WordPress.', 'dokan-lite' ),
                                    'img_url'     => DOKAN_PLUGIN_ASSEST . '/images/weforms-logo.png',
                                    'img_alt'     => __( 'weForms logo', 'dokan-lite' ),
                                    'plugins'     => array( array( 'name' => __( 'weForms', 'dokan-lite' ), 'slug' => 'weforms' ) ),
                                ) );
                            }
                        };
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

        $setup_wc_conversion_tracking  = isset( $_POST['setup_wc_conversion_tracking'] ) && 'yes' === $_POST['setup_wc_conversion_tracking'];
        $setup_weforms                 = isset( $_POST['setup_weforms'] ) && 'yes' === $_POST['setup_weforms'];

        if ( $setup_wc_conversion_tracking && ! $this->is_wc_conversion_tracking_active() ) {
            $this->install_plugin(
                'woocommerce-conversion-tracking',
                array(
                    'name'      => __( 'WooCommerce Conversion Tracking', 'dokan-lite' ),
                    'repo-slug' => 'woocommerce-conversion-tracking',
                    'file'      => 'conversion-tracking.php',
                )
            );
        }

        if ( $setup_weforms && ! $this->is_weforms_active() ) {
            $this->install_plugin(
                'weforms',
                array(
                    'name'      => __( 'weForms', 'dokan-lite' ),
                    'repo-slug' => 'weforms',
                    'file'      => 'weforms.php',
                )
            );
        }

        wp_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Save withdraw options.
     */
    public function dokan_setup_withdraw_save() {
        check_admin_referer( 'dokan-setup' );

        $_post_data = wp_unslash( $_POST );
        $options = array();

        $options['withdraw_methods']      = ! empty( $_post_data['withdraw_methods'] ) ? $_post_data['withdraw_methods'] : array();
        $options['withdraw_limit']        = ! empty( $_post_data['withdraw_limit'] ) ? sanitize_text_field( $_post_data['withdraw_limit'] ) : 0;
        $options['withdraw_order_status'] = ! empty( $_post_data['withdraw_order_status'] ) ? $_post_data['withdraw_order_status'] : array();

        /**
         * Filter dokan_withdraw options before saving in setup wizard
         *
         * @since 2.8.7
         *
         * @param array $options
         * @param array $_POST
         */
        $options = apply_filters( 'dokan_setup_wizard_save_withdraw_options', $options, $_post_data );

        update_option( 'dokan_withdraw', $options );

        wp_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Final step.
     */
    public function dokan_setup_ready() {
        $this->after_weforms_activate();
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

        if ( $this->is_wc_conversion_tracking_active() && $this->is_weforms_active() ) {
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
     * Check if weForms is active or not
     *
     * @since 2.8.7
     *
     * @return bool
     */
    protected function is_weforms_active() {
        return is_plugin_active( 'weforms/weforms.php' );
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
                    alt="<?php echo esc_attr( $img_alt ); ?>" />
                <div class="recommended-item-description-container">
                    <h3><?php echo esc_html( $title ); ?></h3>
                    <p><?php echo wp_kses( $description, array(
                        'a' => array(
                            'href'   => array(),
                            'target' => array(),
                            'rel'    => array(),
                        ),
                        'em' => array(),
                    ) ); ?></p>
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
            <span class="plugin-install-info-label"><?php esc_html_e( 'The following plugins will be installed and activated for you:', 'woocommerce' ); ?></span>
            <span class="plugin-install-info-list"></span>
        </span>
        <?php
    }

    /**
     * Helper method to queue the background install of a plugin.
     *
     * @param string $plugin_id  Plugin id used for background install.
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
            add_action( 'shutdown', array( $this, 'run_deferred_actions' ) );
        }

        array_push(
            $this->deferred_actions,
            array(
                'func' => array( 'WC_Install', 'background_installer' ),
                'args' => array( $plugin_id, $plugin_info ),
            )
        );

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

    /**
     * activate_plugin hook
     *
     * @since 2.8.7
     *
     * @param string $plugin
     *
     * @return void
     */
    public function activated_plugin( $plugin ) {
        if ( 'weforms/weforms.php' === $plugin ) {
            update_option( 'dokan_setup_wizard_activated_weforms', true );
        }
    }

    /**
     * Action after weForms activate
     *
     * @since 2.8.7
     *
     * @return void
     */
    private function after_weforms_activate() {
        $did_activate = get_option( 'dokan_setup_wizard_activated_weforms', false );

        if ( ! $did_activate ) {
            return;
        }

        add_action( 'shutdown', 'flush_rewrite_rules' );

        $forms_data = weforms()->form->all();

        $forms = $forms_data['forms'];

        if ( empty( $forms_data['forms'][0] ) ) {
            return;
        }

        $form = $forms_data['forms'][0];

        $settings = array(
            'allow_vendor_contact_form'    => 'on',
            'vendor_contact_section_label' => __( 'Contact Admin', 'dokan-lite' ),
            'vendor_contact_form'          => $form->id,
        );

        update_option( 'weforms_integration', $settings );

        delete_option( 'dokan_setup_wizard_activated_weforms' );
    }
}
