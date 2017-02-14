<?php
/**
 * Seller setup wizard class
 */
class Dokan_Seller_Setup_Wizard extends Dokan_Setup_Wizard {
    /** @var string Currenct Step */
    protected $step        = '';

    /** @var array Steps for the setup wizard */
    protected $steps       = array();

    /** @var string custom logo url of the theme */
    protected $custom_logo = '';

    /**
     * Hook in tabs.
     */
    public function __construct() {
        add_filter( 'woocommerce_registration_redirect', array( $this, 'filter_woocommerce_registration_redirect' ), 10, 1 );
        add_action( 'init', array( $this, 'setup_wizard' ), 99 );
    }

    // define the woocommerce_registration_redirect callback
    public function filter_woocommerce_registration_redirect( $var ) {
        $url  = $var;
        $user = wp_get_current_user();

        if ( in_array( 'seller', $user->roles ) ) {
            $url = apply_filters( 'dokan_seller_setup_wizard_url', site_url( '?page=dokan-seller-setup' ) );
        }
        return $url;
    }

    /**
     * Show the setup wizard.
     */
    public function setup_wizard() {
        if ( empty( $_GET['page'] ) || 'dokan-seller-setup' !== $_GET['page'] ) {
            return;
        }

        if ( ! is_user_logged_in() ) {
            return;
        }

        $this->custom_logo = null;
        $setup_wizard_logo_url = dokan_get_option( 'setup_wizard_logo_url', 'dokan_appearance', '' );

        if ( ! empty( $setup_wizard_logo_url ) ) {
            $this->custom_logo = $setup_wizard_logo_url;
        }

        $this->store_id   = get_current_user_id();
        $this->store_info = dokan_get_store_info( $this->store_id );

        $steps = array(
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
            'payment' => array(
                'name'    =>  __( 'Payment', 'dokan' ),
                'view'    => array( $this, 'dokan_setup_payment' ),
                'handler' => array( $this, 'dokan_setup_payment_save' ),
            ),
            'next_steps' => array(
                'name'    =>  __( 'Ready!', 'dokan' ),
                'view'    => array( $this, 'dokan_setup_ready' ),
                'handler' => ''
            )
        );

        $this->steps = apply_filters( 'dokan_seller_wizard_steps', $steps );

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
            <title><?php _e( 'Vendor &rsaquo; Setup Wizard', 'dokan' ); ?></title>
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
                .last-step{
                    text-align: center;
                }
                .last-step .wc-setup-next-steps-first.final-button ul{
                    margin: 0px;
                    padding: 0px;
                    max-width: 250px;
                    margin: 0 auto;
                }
                .last-step .wc-setup-next-steps-first.final-button{
                    width: auto;
                    float: none;
                }
                .wc-setup .wc-setup-actions .button{
                    margin-bottom: 10px;
                    margin-left: .5em;
                    margin-right: 0px;
                }
            </style>
        </head>
        <body class="wc-setup wp-core-ui">
            <?php
                if ( ! empty( $this->custom_logo ) ) {
            ?>
                <h1 id="wc-logo"><a href="<?php echo home_url() ?>"><img src="<?php echo $this->custom_logo; ?>" alt="Dokan" /></a></h1>
            <?php
                } else {
                    echo '<h1 id="wc-logo">' . get_bloginfo( 'name' ) . '</h1>';
                }
    }

    /**
     * Setup Wizard Footer.
     */
    public function setup_wizard_footer() {
        ?>
            <?php if ( 'next_steps' === $this->step ) : ?>
                <a class="wc-return-to-dashboard" href="<?php echo esc_url( site_url() ); ?>"><?php _e( 'Return to the Marketplace', 'dokan' ); ?></a>
            <?php endif; ?>
            </body>
        </html>
        <?php
    }

    /**
     * Introduction step.
     */
    public function dokan_setup_introduction() {
        $dashboard_url = dokan_get_navigation_url();
        ?>
        <h1><?php _e( 'Welcome to the Marketplace!', 'dokan' ); ?></h1>
        <p><?php _e( 'Thank you for choosing The Marketplace to power your online store! This quick setup wizard will help you configure the basic settings. <strong>It’s completely optional and shouldn’t take longer than two minutes.</strong>', 'dokan' ); ?></p>
        <p><?php _e( 'No time right now? If you don’t want to go through the wizard, you can skip and return to the Store!', 'dokan' ); ?></p>
        <p class="wc-setup-actions step">
            <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button-primary button button-large button-next"><?php _e( 'Let\'s Go!', 'dokan' ); ?></a>
            <a href="<?php echo esc_url( $dashboard_url ); ?>" class="button button-large"><?php _e( 'Not right now', 'dokan' ); ?></a>
        </p>
        <?php
    }

    /**
     * Store step.
     */
    public function dokan_setup_store() {
        $store_info      = $this->store_info;

        $store_ppp       = isset( $store_info['store_ppp'] ) ? esc_attr( $store_info['store_ppp'] ) : 10;
        $show_email      = isset( $store_info['show_email'] ) ? esc_attr( $store_info['show_email'] ) : 'no';
        $address_street1 = isset( $store_info['address']['street_1'] ) ? $store_info['address']['street_1'] : '';
        $address_street2 = isset( $store_info['address']['street_2'] ) ? $store_info['address']['street_2'] : '';
        $address_city    = isset( $store_info['address']['city'] ) ? $store_info['address']['city'] : '';
        $address_zip     = isset( $store_info['address']['zip'] ) ? $store_info['address']['zip'] : '';
        $address_country = isset( $store_info['address']['country'] ) ? $store_info['address']['country'] : '';
        $address_state   = isset( $store_info['address']['state'] ) ? $store_info['address']['state'] : '';

        $country_obj   = new WC_Countries();
        $countries     = $country_obj->countries;
        $states        = $country_obj->states;
        ?>
        <h1><?php _e( 'Store Setup', 'dokan' ); ?></h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="store_ppp"><?php _e( 'Store Product Per Page', 'dokan' ); ?></label></th>
                    <td>
                        <input type="text" id="store_ppp" name="store_ppp" value="<?php echo $store_ppp; ?>" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="address[street_1]"><?php _e( 'Street', 'dokan' ); ?></label></th>
                    <td>
                        <input type="text" id="address[street_1]" name="address[street_1]" value="<?php echo $address_street1; ?>" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="address[street_2]"><?php _e( 'Street 2', 'dokan' ); ?></label></th>
                    <td>
                        <input type="text" id="address[street_2]" name="address[street_2]" value="<?php echo $address_street2; ?>" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="address[city]"><?php _e( 'City', 'dokan' ); ?></label></th>
                    <td>
                        <input type="text" id="address[city]" name="address[city]" value="<?php echo $address_city; ?>" />
                    </td>
                </tr>
                    <th scope="row"><label for="address[zip]"><?php _e( 'Post/Zip Code', 'dokan' ); ?></label></th>
                    <td>
                        <input type="text" id="address[zip]" name="address[zip]" value="<?php echo $address_zip; ?>" />
                    </td>
                <tr>
                    <th scope="row"><label for="address[country]"><?php _e( 'Country', 'dokan' ); ?></label></th>
                    <td>
                        <select name="address[country]" class="wc-enhanced-select" id="address[country]">
                            <?php dokan_country_dropdown( $countries, $address_country, false ); ?>
                        </select>
                    </td>
                </tr>
                    <th scope="row"><label for="address[state]"><?php _e( 'State', 'dokan' ); ?></label></th>
                    <td>
                        <input type="text" id="address[state]" name="address[state]" value="<?php echo $address_state; ?>" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="show_email"><?php _e( 'Email', 'dokan' ); ?></label></th>
                    <td>
                        <input type="checkbox" name="show_email" id="show_email" class="input-checkbox" value="1" <?php echo ( $show_email == 'yes' ) ? 'checked="checked"' : ''; ?>/>
                        <label for="show_email"><?php _e( 'Show email address in store', 'dokan' ); ?></label>
                    </td>
                </tr>

            </table>
            <p class="wc-setup-actions step">
                <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan' ); ?>" name="save_step" />
                <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button button-large button-next"><?php _e( 'Skip this step', 'dokan' ); ?></a>
                <?php wp_nonce_field( 'dokan-seller-setup' ); ?>
            </p>
        </form>
        <?php
    }

    /**
     * Save store options.
     */
    public function dokan_setup_store_save() {
        if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( $_POST['_wpnonce'], 'dokan-seller-setup' ) ) {
            return;
        }

        $dokan_settings = $this->store_info;

        $dokan_settings['store_ppp']  = absint( $_POST['store_ppp'] );
        $dokan_settings['address']    = isset( $_POST['address'] ) ? $_POST['address'] : [];
        $dokan_settings['show_email'] = isset( $_POST['show_email'] ) ? 'yes' : 'no';

        update_user_meta( $this->store_id, 'dokan_profile_settings', $dokan_settings );

        wp_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * payment step.
     */
    public function dokan_setup_payment() {
        $methods    = dokan_withdraw_get_active_methods();
        $store_info = $this->store_info;
        ?>
        <h1><?php _e( 'Payment Setup', 'dokan' ); ?></h1>
        <form method="post">
            <table class="form-table">
                <?php
                    foreach ( $methods as $method_key ) {
                        $method = dokan_withdraw_get_method( $method_key );
                ?>
                    <tr>
                        <th scope="row"><label><?php echo $method['title']; ?></label></th>
                        <td>
                            <?php
                                if ( is_callable( $method['callback'] ) ) {
                                    call_user_func( $method['callback'], $store_info );
                                }
                            ?>
                        </td>
                    </tr>
                <?php
                    }
                ?>
            </table>
            <p class="wc-setup-actions step">
                <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan' ); ?>" name="save_step" />
                <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button button-large button-next"><?php _e( 'Skip this step', 'dokan' ); ?></a>
                <?php wp_nonce_field( 'dokan-seller-setup' ); ?>
            </p>
        </form>
        <?php
    }

    /**
     * Save payment options.
     */
    public function dokan_setup_payment_save() {
        if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( $_POST['_wpnonce'], 'dokan-seller-setup' ) ) {
            return;
        }

        $dokan_settings = $this->store_info;

        if ( isset( $_POST['settings']['bank'] ) ) {
            $bank = $_POST['settings']['bank'];

            $dokan_settings['payment']['bank'] = array(
                'ac_name'   => sanitize_text_field( $bank['ac_name'] ),
                'ac_number' => sanitize_text_field( $bank['ac_number'] ),
                'bank_name' => sanitize_text_field( $bank['bank_name'] ),
                'bank_addr' => sanitize_text_field( $bank['bank_addr'] ),
                'swift'     => sanitize_text_field( $bank['swift'] ),
            );
        }

        if ( isset( $_POST['settings']['paypal'] ) ) {
            $dokan_settings['payment']['paypal'] = array(
                'email' => filter_var( $_POST['settings']['paypal']['email'], FILTER_VALIDATE_EMAIL )
            );
        }

        if ( isset( $_POST['settings']['skrill'] ) ) {
            $dokan_settings['payment']['skrill'] = array(
                'email' => filter_var( $_POST['settings']['skrill']['email'], FILTER_VALIDATE_EMAIL )
            );
        }

        update_user_meta( $this->store_id, 'dokan_profile_settings', $dokan_settings );

        wp_redirect( apply_filters( 'dokan_ww_payment_redirect',esc_url_raw( $this->get_next_step_link() ) ) );
        exit;
    }

    /**
     * Final step.
     */
    public function dokan_setup_ready() {
        $dashboard_url = dokan_get_navigation_url();
        ?>
        <div class="last-step">
            <h1><?php _e( 'Your Store is Ready!', 'dokan' ); ?></h1>

            <div class="wc-setup-next-steps">
                <div class="wc-setup-next-steps-first final-button">
                    <ul>
                        <li class="setup-product"><a class="button button-primary button-large" href="<?php echo esc_url( $dashboard_url ); ?>"><?php _e( 'Go to your Store Dashboard!', 'dokan' ); ?></a></li>
                    </ul>
                </div>
            </div>
        </div>
        <?php
    }
}

new Dokan_Seller_Setup_Wizard();
