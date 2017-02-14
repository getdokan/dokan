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
     * Hook in tabs.
     */
    public function __construct() {
        if ( current_user_can( 'manage_options' ) ) {
            add_action( 'admin_menu', array( $this, 'admin_menus' ) );
            add_action( 'admin_init', array( $this, 'setup_wizard' ), 99 );
        }
    }

    /**
     * Enqueue scripts & styles from woocommerce plugin.
     *
     * @return void
     */
    public function enqueue_scripts() {
        $suffix     = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

        wp_register_script( 'jquery-blockui', WC()->plugin_url() . '/assets/js/jquery-blockui/jquery.blockUI' . $suffix . '.js', array( 'jquery' ), '2.70', true );
        wp_register_script( 'select2', WC()->plugin_url() . '/assets/js/select2/select2' . $suffix . '.js', array( 'jquery' ), '3.5.2' );
        wp_register_script( 'wc-enhanced-select', WC()->plugin_url() . '/assets/js/admin/wc-enhanced-select' . $suffix . '.js', array( 'jquery', 'select2' ), WC_VERSION );
        wp_localize_script( 'wc-enhanced-select', 'wc_enhanced_select_params', array(
            'i18n_matches_1'            => _x( 'One result is available, press enter to select it.', 'enhanced select', 'dokan' ),
            'i18n_matches_n'            => _x( '%qty% results are available, use up and down arrow keys to navigate.', 'enhanced select', 'dokan' ),
            'i18n_no_matches'           => _x( 'No matches found', 'enhanced select', 'dokan' ),
            'i18n_ajax_error'           => _x( 'Loading failed', 'enhanced select', 'dokan' ),
            'i18n_input_too_short_1'    => _x( 'Please enter 1 or more characters', 'enhanced select', 'dokan' ),
            'i18n_input_too_short_n'    => _x( 'Please enter %qty% or more characters', 'enhanced select', 'dokan' ),
            'i18n_input_too_long_1'     => _x( 'Please delete 1 character', 'enhanced select', 'dokan' ),
            'i18n_input_too_long_n'     => _x( 'Please delete %qty% characters', 'enhanced select', 'dokan' ),
            'i18n_selection_too_long_1' => _x( 'You can only select 1 item', 'enhanced select', 'dokan' ),
            'i18n_selection_too_long_n' => _x( 'You can only select %qty% items', 'enhanced select', 'dokan' ),
            'i18n_load_more'            => _x( 'Loading more results&hellip;', 'enhanced select', 'dokan' ),
            'i18n_searching'            => _x( 'Searching&hellip;', 'enhanced select', 'dokan' ),
            'ajax_url'                  => admin_url( 'admin-ajax.php' ),
        ) );

        wp_enqueue_style( 'woocommerce_admin_styles', WC()->plugin_url() . '/assets/css/admin.css', array(), WC_VERSION );
        wp_enqueue_style( 'wc-setup', WC()->plugin_url() . '/assets/css/wc-setup.css', array( 'dashicons', 'install' ), WC_VERSION );

        wp_register_script( 'wc-setup', WC()->plugin_url() . '/assets/js/admin/wc-setup.min.js', array( 'jquery', 'wc-enhanced-select', 'jquery-blockui' ), WC_VERSION );
        wp_localize_script( 'wc-setup', 'wc_setup_params', array() );
    }

    /**
     * Add admin menus/screens.
     */
    public function admin_menus() {
        add_dashboard_page( '', '', 'manage_options', 'dokan-setup', '' );
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
                'name'    =>  __( 'Introduction', 'dokan' ),
                'view'    => array( $this, 'dokan_setup_introduction' ),
                'handler' => ''
            ),
            'store' => array(
                'name'    =>  __( 'Store', 'dokan' ),
                'view'    => array( $this, 'dokan_setup_store' ),
                'handler' => array( $this, 'dokan_setup_store_save' ),
            ),
            'selling' => array(
                'name'    =>  __( 'Selling', 'dokan' ),
                'view'    => array( $this, 'dokan_setup_selling' ),
                'handler' => array( $this, 'dokan_setup_selling_save' ),
            ),
            'withdraw' => array(
                'name'    =>  __( 'Withdraw', 'dokan' ),
                'view'    => array( $this, 'dokan_setup_withdraw' ),
                'handler' => array( $this, 'dokan_setup_withdraw_save' ),
            ),
            'next_steps' => array(
                'name'    =>  __( 'Ready!', 'dokan' ),
                'view'    => array( $this, 'dokan_setup_ready' ),
                'handler' => ''
            )
        );
        $this->step = isset( $_GET['step'] ) ? sanitize_key( $_GET['step'] ) : current( array_keys( $this->steps ) );

        $this->enqueue_scripts();

        if ( ! empty( $_POST['save_step'] ) && isset( $this->steps[ $this->step ]['handler'] ) ) {
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
            <title><?php _e( 'Dokan &rsaquo; Setup Wizard', 'dokan' ); ?></title>
            <?php wp_print_scripts( 'wc-setup' ); ?>
            <?php do_action( 'admin_print_styles' ); ?>
            <?php do_action( 'admin_head' ); ?>
            <style type="text/css">
                .wc-setup-steps {
                    justify-content: center;
                }
                .wc-setup-content a {
                    color: #f39132;
                }
                .wc-setup-steps li.active:before {
                    border-color: #f39132;
                }
                .wc-setup-steps li.active {
                    border-color: #f39132;
                    color: #f39132;
                }
                .wc-setup-steps li.done:before {
                    border-color: #f39132;
                }
                .wc-setup-steps li.done {
                    border-color: #f39132;
                    color: #f39132;
                }
                .wc-setup .wc-setup-actions .button-primary, .wc-setup .wc-setup-actions .button-primary, .wc-setup .wc-setup-actions .button-primary {
                    background: #f39132 !important;
                }
                .wc-setup .wc-setup-actions .button-primary:active, .wc-setup .wc-setup-actions .button-primary:focus, .wc-setup .wc-setup-actions .button-primary:hover {
                    background: #ff6b00 !important;
                    border-color: #ff6b00 !important;
                }
                .wc-setup-content .wc-setup-next-steps ul .setup-product a, .wc-setup-content .wc-setup-next-steps ul .setup-product a, .wc-setup-content .wc-setup-next-steps ul .setup-product a {
                    background: #f39132 !important;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,.25),0 1px 0 #f39132;
                }
                .wc-setup-content .wc-setup-next-steps ul .setup-product a:active, .wc-setup-content .wc-setup-next-steps ul .setup-product a:focus, .wc-setup-content .wc-setup-next-steps ul .setup-product a:hover {
                    background: #ff6b00 !important;
                    border-color: #ff6b00 !important;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,.25),0 1px 0 #ff6b00;
                }
                .wc-setup .wc-setup-actions .button-primary {
                    border-color: #f39132 !important;
                }
                .wc-setup-content .wc-setup-next-steps ul .setup-product a {
                    border-color: #f39132 !important;
                }
                ul.wc-wizard-payment-gateways li.wc-wizard-gateway .wc-wizard-gateway-enable input:checked+label:before {
                    background: #f39132 !important;
                    border-color: #f39132 !important;
                }
            </style>
        </head>
        <body class="wc-setup wp-core-ui">
            <?php
                $logo_url = ( ! empty( $this->custom_logo ) ) ? $this->custom_logo : plugins_url( 'assets/images/dokan-logo.png', DOKAN_FILE );
            ?>
            <h1 id="wc-logo"><a href="https://wedevs.com/products/plugins/dokan/"><img src="<?php echo $logo_url; ?>" alt="Dokan" /></a></h1>
        <?php
    }

    /**
     * Setup Wizard Footer.
     */
    public function setup_wizard_footer() {
        ?>
            <?php if ( 'next_steps' === $this->step ) : ?>
                <a class="wc-return-to-dashboard" href="<?php echo esc_url( admin_url() ); ?>"><?php _e( 'Return to the WordPress Dashboard', 'dokan' ); ?></a>
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
        echo '<div class="wc-setup-content">';
        call_user_func( $this->steps[ $this->step ]['view'] );
        echo '</div>';
    }

    /**
     * Introduction step.
     */
    public function dokan_setup_introduction() {
        ?>
        <h1><?php _e( 'Welcome to the world of Dokan!', 'dokan' ); ?></h1>
        <p><?php _e( 'Thank you for choosing Dokan to power your online marketplace! This quick setup wizard will help you configure the basic settings. <strong>It’s completely optional and shouldn’t take longer than three minutes.</strong>', 'dokan' ); ?></p>
        <p><?php _e( 'No time right now? If you don’t want to go through the wizard, you can skip and return to the WordPress dashboard. Come back anytime if you change your mind!', 'dokan' ); ?></p>
        <p class="wc-setup-actions step">
            <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button-primary button button-large button-next"><?php _e( 'Let\'s Go!', 'dokan' ); ?></a>
            <a href="<?php echo esc_url( admin_url() ); ?>" class="button button-large"><?php _e( 'Not right now', 'dokan' ); ?></a>
        </p>
        <?php
    }

    /**
     * Store step.
     */
    public function dokan_setup_store() {
        $options             = get_option( 'dokan_general', [] );
        $custom_store_url    = ! empty( $options['custom_store_url'] ) ? $options['custom_store_url'] : 'store';
        $extra_fee_recipient = ! empty( $options['extra_fee_recipient'] ) ? $options['extra_fee_recipient'] : 'seller';

        $recipients = array(
            'seller' => __( 'Vendor', 'dokan' ),
            'admin'  => __( 'Admin', 'dokan' ),
        );
        ?>
        <h1><?php _e( 'Store Setup', 'dokan' ); ?></h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="custom_store_url"><?php _e( 'Vendor Store URL', 'dokan' ); ?></label></th>
                    <td>
                        <input type="text" id="custom_store_url" name="custom_store_url" value="<?php echo $custom_store_url; ?>" />
                        <p class="description"><?php _e( 'Define vendor store URL', 'dokan' ); ?> (<?php echo site_url(); ?>/[this-text]/[seller-name])</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="extra_fee_recipient"><?php _e( 'Extra Fee Recipient', 'dokan' ); ?></label></th>
                    <td>
                        <select class="wc-enhanced-select" id="extra_fee_recipient" name="extra_fee_recipient">
                            <?php
                                foreach ( $recipients as $key => $value ) {
                                    $selected = ( $extra_fee_recipient == $key ) ? ' selected="true"' : '';
                                    echo '<option value="' . $key . '" ' . $selected . '>' . $value . '</option>';
                                }
                            ?>
                        </select>
                        <p class="description"><?php _e( 'Extra fees like shipping and tax will go to', 'dokan' ); ?></p>
                    </td>
                </tr>
            </table>
            <p class="wc-setup-actions step">
                <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan' ); ?>" name="save_step" />
                <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button button-large button-next"><?php _e( 'Skip this step', 'dokan' ); ?></a>
                <?php wp_nonce_field( 'dokan-setup' ); ?>
            </p>
        </form>
        <?php
    }

    /**
     * Save store options.
     */
    public function dokan_setup_store_save() {
        check_admin_referer( 'dokan-setup' );

        $options = get_option( 'dokan_general', [] );

        $options['custom_store_url']    = ! empty( $_POST['custom_store_url'] ) ? sanitize_text_field( $_POST['custom_store_url'] ) : '';
        $options['extra_fee_recipient'] = ! empty( $_POST['extra_fee_recipient'] ) ? sanitize_text_field( $_POST['extra_fee_recipient'] ) : '';

        update_option( 'dokan_general', $options );

        wp_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Selling step.
     */
    public function dokan_setup_selling() {
        $options = get_option( 'dokan_selling', [] );
        $new_seller_enable_selling = ! empty( $options['new_seller_enable_selling'] ) ? $options['new_seller_enable_selling'] : '';
        $seller_percentage         = ! empty( $options['seller_percentage'] ) ? $options['seller_percentage'] : '';
        $order_status_change       = ! empty( $options['order_status_change'] ) ? $options['order_status_change'] : '';
        $product_style             = ! empty( $options['product_style'] ) ? $options['product_style'] : '';
        $product_styles_list       = array(
            'old' => __( 'Tab View', 'dokan' ),
            'new' => __( 'Flat View', 'dokan' ),
        );

        ?>
        <h1><?php _e( 'Selling Setup', 'dokan' ); ?></h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="new_seller_enable_selling"><?php _e( 'New Vendor Enable Selling', 'dokan' ); ?></label></th>
                    <td>
                        <input type="checkbox" name="new_seller_enable_selling" id="new_seller_enable_selling" class="input-checkbox" value="1" <?php echo ( $new_seller_enable_selling == 'on' ) ? 'checked="checked"' : ''; ?>/>
                        <label for="new_seller_enable_selling"><?php _e( 'Make selling status enable for new registred vendor', 'dokan' ); ?></label>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="seller_percentage"><?php _e( 'Vendor Commission %', 'dokan' ); ?></label></th>
                    <td>
                        <input type="text" id="seller_percentage" name="seller_percentage" value="<?php echo $seller_percentage; ?>" />
                        <p class="description"><?php _e( 'How much amount (%) a vendor will get from each order', 'dokan' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="order_status_change"><?php _e( 'Order Status Change', 'dokan' ); ?></label></th>
                    <td>
                        <input type="checkbox" name="order_status_change" id="order_status_change" class="input-checkbox" value="1" <?php echo ( $order_status_change == 'on' ) ? 'checked="checked"' : ''; ?>/>
                        <label for="order_status_change"><?php _e( 'Vendor can change order status', 'dokan' ); ?></label>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="product_style"><?php _e( 'Add/Edit Product Style', 'dokan' ); ?></label></th>
                    <td>
                        <select class="wc-enhanced-select" id="product_style" name="product_style">
                            <?php
                                foreach ( $product_styles_list as $key => $value ) {
                                    $selected = ( $product_style == $key ) ? ' selected="true"' : '';
                                    echo '<option value="' . $key . '" ' . $selected . '>' . $value . '</option>';
                                }
                            ?>
                        </select>
                        <p class="description"><?php _e( 'The style you prefer for vendor to add or edit products.', 'dokan' ); ?></p>
                    </td>
                </tr>
            </table>
            <p class="wc-setup-actions step">
                <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan' ); ?>" name="save_step" />
                <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button button-large button-next"><?php _e( 'Skip this step', 'dokan' ); ?></a>
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

        $options = get_option( 'dokan_selling', [] );
        $options['new_seller_enable_selling'] = isset( $_POST['new_seller_enable_selling'] ) ? 'on' : 'off';
        $options['seller_percentage']         = intval( $_POST['seller_percentage'] );
        $options['order_status_change']       = isset( $_POST['order_status_change'] ) ? 'on' : 'off';
        $options['product_style']             = sanitize_text_field( $_POST['product_style'] );

        update_option( 'dokan_selling', $options );

        wp_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Withdraw Step.
     */
    public function dokan_setup_withdraw() {
        $options = get_option( 'dokan_withdraw', [] );

        $withdraw_methods      = ! empty( $options['withdraw_methods'] ) ? $options['withdraw_methods'] : [];
        $withdraw_limit        = ! empty( $options['withdraw_limit'] ) ? $options['withdraw_limit'] : 0;
        $withdraw_order_status = ! empty( $options['withdraw_order_status'] ) ? $options['withdraw_order_status'] : [];

        ?>
        <h1><?php _e( 'Withdraw Setup', 'dokan' ); ?></h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="withdraw_methods"><?php _e( 'Withdraw Methods', 'dokan' ); ?></label></th>
                </tr>
                <tr>
                    <td colspan="2">
                        <ul class="wc-wizard-payment-gateways">
                            <li class="wc-wizard-gateway">
                                <div class="wc-wizard-gateway-enable">
                                    <input type="checkbox" name="withdraw_methods[paypal]" class="input-checkbox" value="paypal" <?php echo ( array_key_exists( 'paypal', $withdraw_methods ) ) ? 'checked="true"' : ''; ?>/>
                                    <label>Paypal</label>
                                </div>
                            </li>
                            <li class="wc-wizard-gateway">
                                <div class="wc-wizard-gateway-enable">
                                    <input type="checkbox" name="withdraw_methods[bank]" class="input-checkbox" value="bank" <?php echo ( array_key_exists( 'bank', $withdraw_methods ) ) ? 'checked="true"' : ''; ?>/>
                                    <label>Bank Transfer</label>
                                </div>
                            </li>
                            <li class="wc-wizard-gateway">
                                <div class="wc-wizard-gateway-enable">
                                    <input type="checkbox" name="withdraw_methods[skrill]" class="input-checkbox" value="skrill" <?php echo ( array_key_exists( 'skrill', $withdraw_methods ) ) ? 'checked="true"' : ''; ?>/>
                                    <label>Skrill</label>
                                </div>
                            </li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="withdraw_limit"><?php _e( 'Minimum Withdraw Limit', 'dokan' ); ?></label></th>
                    <td>
                        <input type="text" id="withdraw_limit" name="withdraw_limit" value="<?php echo $withdraw_limit; ?>" />
                        <p class="description"><?php _e( 'Minimum balance required to make a withdraw request', 'dokan' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="withdraw_order_status"><?php _e( 'Order Status for Withdraw', 'dokan' ); ?></label></th>
                    <td>
                        <input type="checkbox" class="input-checkbox" id="withdraw_order_status[wc-completed]" name="withdraw_order_status[wc-completed]" value="wc-completed" <?php echo ( array_key_exists( 'wc-completed', $withdraw_order_status ) ) ? 'checked="true"' : ''; ?>><label> <?php _e( 'Completed', 'dokan' ); ?></label><br />
                        <input type="checkbox" class="input-checkbox" id="withdraw_order_status[wc-processing]" name="withdraw_order_status[wc-processing]" value="wc-processing" <?php echo ( array_key_exists( 'wc-processing', $withdraw_order_status ) ) ? 'checked="true"' : ''; ?>><label> <?php _e( 'Processing', 'dokan' ); ?></label><br />
                        <input type="checkbox" class="input-checkbox" id="withdraw_order_status[wc-on-hold]" name="withdraw_order_status[wc-on-hold]" value="wc-on-hold" <?php echo ( array_key_exists( 'wc-on-hold', $withdraw_order_status ) ) ? 'checked="true"' : ''; ?>><label> <?php _e( 'On-hold', 'dokan' ); ?></label>

                        <p class="description"><?php _e( 'Order status for which vendor can make a withdraw request.', 'dokan' ); ?></p>
                    </td>
                </tr>
            </table>
            <p class="wc-setup-actions step">
                <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan' ); ?>" name="save_step" />
                <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button button-large button-next"><?php _e( 'Skip this step', 'dokan' ); ?></a>
                <?php wp_nonce_field( 'dokan-setup' ); ?>
            </p>
        </form>
        <?php
    }

    /**
     * Save withdraw options.
     */
    public function dokan_setup_withdraw_save() {
        check_admin_referer( 'dokan-setup' );

        $options = get_option( 'dokan_withdraw', [] );

        $options['withdraw_methods']      = ! empty( $_POST['withdraw_methods'] ) ? $_POST['withdraw_methods'] : [];
        $options['withdraw_limit']        = ! empty( $_POST['withdraw_limit'] ) ? sanitize_text_field( $_POST['withdraw_limit'] ) : 0;
        $options['withdraw_order_status'] = ! empty( $_POST['withdraw_order_status'] ) ? $_POST['withdraw_order_status'] : [];

        update_option( 'dokan_withdraw', $options );

        wp_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Final step.
     */
    public function dokan_setup_ready() {
        ?>
        <h1><?php _e( 'Your Marketplace is Ready!', 'dokan' ); ?></h1>

        <div class="wc-setup-next-steps">
            <div class="wc-setup-next-steps-first">
                <h2><?php _e( 'Next Steps', 'dokan' ); ?></h2>
                <ul>
                    <li class="setup-product"><a class="button button-primary button-large" href="<?php echo esc_url( admin_url( 'admin.php?page=dokan-settings' ) ); ?>"><?php _e( 'Setup your dokan!', 'dokan' ); ?></a></li>
                </ul>
            </div>
            <div class="wc-setup-next-steps-last">
                <h2><a href="<?php echo esc_url( admin_url( 'admin.php?page=dokan-help' ) ); ?>"><?php _e( 'Learn More', 'dokan' ); ?></a></h2>
            </div>
        </div>
        <?php
    }
}

new Dokan_Setup_Wizard();
