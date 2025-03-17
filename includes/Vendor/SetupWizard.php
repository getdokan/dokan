<?php

namespace WeDevs\Dokan\Vendor;

use WC_Countries;
use WeDevs\Dokan\Admin\SetupWizard as DokanSetupWizard;

/**
 * Seller setup wizard class
 */
class SetupWizard extends DokanSetupWizard {
    /**
     * @var int
     */
    public $store_id;
    /**
     * @var array
     */
    public $store_info;

    /**
     * Hook in tabs.
     */
    public function __construct() {
        add_filter( 'woocommerce_registration_redirect', [ $this, 'filter_woocommerce_registration_redirect' ], 10, 1 );
        add_action( 'init', [ $this, 'setup_wizard' ], 9999 );
        add_action( 'dokan_setup_wizard_enqueue_scripts', [ $this, 'frontend_enqueue_scripts' ] );
    }

    // define the woocommerce_registration_redirect callback
    public function filter_woocommerce_registration_redirect( $url ) {

        $user = wp_get_current_user();

        if ( in_array( 'seller', $user->roles, true ) ) {
            $url = dokan_get_navigation_url();

            if ( 'off' === dokan_get_option( 'disable_welcome_wizard', 'dokan_selling', 'off' ) ) {
                $url = apply_filters( 'dokan_seller_setup_wizard_url', site_url( '?page=dokan-seller-setup' ) );
            }
        }

        return $url;
    }

    /**
     * Show the setup wizard.
     */
    public function setup_wizard() {
        if ( empty( $_GET['page'] ) || 'dokan-seller-setup' !== $_GET['page'] ) { // phpcs:ignore
            return;
        }

        if ( ! is_user_logged_in() ) {
            return;
        }

        $this->custom_logo     = null;
        $setup_wizard_logo_url = dokan_get_option( 'setup_wizard_logo_url', 'dokan_general', '' );

        if ( ! empty( $setup_wizard_logo_url ) ) {
            $this->custom_logo = $setup_wizard_logo_url;
        }

        $this->store_id   = dokan_get_current_user_id();
        $this->store_info = dokan_get_store_info( $this->store_id );

        // Setup wizard steps
        $this->set_steps();

        // If payment step is accessed but no active methods exist, redirect to next step
        if ( isset( $_GET['step'] ) && 'payment' === $_GET['step'] ) {
            $active_methods = dokan_withdraw_get_active_methods();
            if ( empty( $active_methods ) ) {
                wp_safe_redirect( esc_url_raw( $this->get_next_step_link() ) );
                exit;
            }
        }

        // get step from url
        if ( isset( $_GET['_admin_sw_nonce'], $_GET['step'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_admin_sw_nonce'] ) ), 'dokan_admin_setup_wizard_nonce' ) ) {
            $this->current_step = sanitize_key( wp_unslash( $_GET['step'] ) ) ?? current( array_keys( $this->steps ) );
        }

        if ( ! empty( $_POST['save_step'] ) && isset( $this->steps[ $this->current_step ]['handler'] ) ) { // WPCS: CSRF ok.
            call_user_func( $this->steps[ $this->current_step ]['handler'] );
        }

        $this->enqueue_scripts();
        ob_start();
        $this->set_setup_wizard_template();
        exit;
    }

    /**
     * Enqueue vendor setup wizard scripts
     *
     * @since 3.7.0
     *
     * @return void
     */
    public function frontend_enqueue_scripts() {
        wp_enqueue_style( 'jquery-ui' );
        wp_enqueue_emoji_styles();
        wp_enqueue_script( 'jquery' );
        wp_enqueue_script( 'jquery-tiptip' );
        wp_enqueue_script( 'jquery-blockui' );
        wp_enqueue_script( 'jquery-ui-autocomplete' );
        wp_enqueue_script( 'wc-enhanced-select' );

        // Load map scripts.
        dokan()->scripts->load_gmap_script();
    }

    /**
     * Setup Wizard Header.
     */
	public function setup_wizard_header() {
		?>
    <!DOCTYPE html>
    <html <?php language_attributes(); ?>>
    <head>
        <meta name="viewport" content="width=device-width"/>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <title><?php esc_attr_e( 'Vendor &rsaquo; Setup Wizard', 'dokan-lite' ); ?></title>
        <?php wp_print_scripts(); ?>
        <?php wp_print_styles(); ?>
        <?php do_action( 'dokan_setup_wizard_styles' ); ?>
    </head>
    <body class="wc-setup wp-core-ui dokan-vendor-setup-wizard">
		<?php if ( ! empty( $this->custom_logo ) ) { ?>
        <h1 id="wc-logo">
            <a href="<?php echo esc_url( home_url() ); ?>">
                <img src="<?php echo esc_url( $this->custom_logo ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>"/>
            </a>
        </h1>
			<?php
		} else {
			echo '<h1 id="wc-logo">' . esc_attr( get_bloginfo( 'name' ) ) . '</h1>';
		}
    }

    /**
     * Setup Wizard Footer.
     */
    public function setup_wizard_footer() {
		?>
		<?php if ( 'next_steps' === $this->current_step ) : ?>
        <a class="wc-return-to-dashboard" href="<?php echo esc_url( site_url() ); ?>"><?php esc_attr_e( 'Return to the Marketplace', 'dokan-lite' ); ?></a>
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
        // translators: %1$s and %2$s are HTML tags for bold text
        $default_message      = wp_kses_post( sprintf( __( 'Thank you for choosing The Marketplace to power your online store! This quick setup wizard will help you configure the basic settings. %1$sIt’s completely optional and shouldn’t take longer than two minutes.%2$s', 'dokan-lite' ), '<strong>', '</strong>' ) );
        $setup_wizard_message = dokan_get_option( 'setup_wizard_message', 'dokan_general', $default_message );
        ?>
        <h1><?php esc_attr_e( 'Welcome to the Marketplace!', 'dokan-lite' ); ?></h1>
        <?php if ( ! empty( $setup_wizard_message ) ) : ?>
            <div><?php printf( '%s', $setup_wizard_message ); ?></div>
        <?php endif; ?>
        <p><?php esc_attr_e( 'No time right now? If you don’t want to go through the wizard, you can skip and return to the Store!', 'dokan-lite' ); ?></p>
        <p class="wc-setup-actions step">
            <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button-primary button button-large button-next lets-go-btn dokan-btn-theme"><?php esc_attr_e( 'Let\'s Go!', 'dokan-lite' ); ?></a>
            <a href="<?php echo esc_url( $dashboard_url ); ?>" class="button button-large not-right-now-btn dokan-btn-theme"><?php esc_attr_e( 'Not right now', 'dokan-lite' ); ?></a>
        </p>
        <?php
        do_action( 'dokan_seller_wizard_introduction', $this );
    }

    /**
     * Store step.
     */
    public function dokan_setup_store() {
        $store_info = $this->store_info;

        $show_email      = isset( $store_info['show_email'] ) ? esc_attr( $store_info['show_email'] ) : 'no';
        $address_street1 = isset( $store_info['address']['street_1'] ) ? $store_info['address']['street_1'] : '';
        $address_street2 = isset( $store_info['address']['street_2'] ) ? $store_info['address']['street_2'] : '';
        $address_city    = isset( $store_info['address']['city'] ) ? $store_info['address']['city'] : '';
        $address_zip     = isset( $store_info['address']['zip'] ) ? $store_info['address']['zip'] : '';
        $address_country = isset( $store_info['address']['country'] ) ? $store_info['address']['country'] : '';
        $address_state   = isset( $store_info['address']['state'] ) ? $store_info['address']['state'] : '';
        $map_location    = isset( $store_info['location'] ) ? $store_info['location'] : '';
        $map_address     = isset( $store_info['find_address'] ) ? $store_info['find_address'] : '';

        $country_obj = new WC_Countries();
        $countries   = $country_obj->get_allowed_countries();
        $states      = $country_obj->states;

        $request_data = wc_clean( wp_unslash( $_POST ) ); // phpcs:ignore

        ?>
        <h1><?php esc_attr_e( 'Store Setup', 'dokan-lite' ); ?></h1>
        <form method="post" class="dokan-seller-setup-form">
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="address[street_1]">
                            <?php esc_html_e( 'Street', 'dokan-lite' ); ?>
                            <span class='required'>*</span></label></th>
                    </label>
                    </th>

                    <td>
                        <input type="text" id="address[street_1]" name="address[street_1]" value="<?php echo esc_attr( $address_street1 ); ?>"/>
                        <span class="error-container">
                            <?php
                            if ( ! empty( $request_data['error_address[street_1]'] ) ) {
                                echo '<span class="required">' . __( 'This is required', 'dokan-lite' ) . '</span>';
                            }
                            ?>
                        </span>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="address[street_2]">
                            <?php esc_html_e( 'Street 2', 'dokan-lite' ); ?>
                        </label>
                    </th>
                    <td>
                        <input type="text" id="address[street_2]" name="address[street_2]" value="<?php echo esc_attr( $address_street2 ); ?>"/>
                        <span class="error-container">
                            <?php
                            if ( ! empty( $request_data['error_address[street_2]'] ) ) {
                                echo '<span class="required">' . __( 'This is required', 'dokan-lite' ) . '</span>';
                            }
                            ?>
                        </span>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="address[city]">
                            <?php esc_html_e( 'City', 'dokan-lite' ); ?>
                            <span class='required'>*</span></label></th>
                    </label>
                    </th>
                    <td>
                        <input type="text" id="address[city]" name="address[city]" value="<?php echo esc_attr( $address_city ); ?>"/>
                        <span class="error-container">
                            <?php
                            if ( ! empty( $request_data['error_address[city]'] ) ) {
                                echo '<span class="required">' . __( 'This is required', 'dokan-lite' ) . '</span>';
                            }
                            ?>
                        </span>
                    </td>
                </tr>
                <th scope="row">
                    <label for="address[zip]">
                        <?php esc_html_e( 'Post/Zip Code', 'dokan-lite' ); ?>
                        <span class='required'>*</span></label></th>
                </label>
                </th>
                <td>
                    <input type="text" id="address[zip]" name="address[zip]" value="<?php echo esc_attr( $address_zip ); ?>"/>
                    <span class="error-container">
                        <?php
                        if ( ! empty( $request_data['error_address[zip]'] ) ) {
                            echo '<span class="required">' . __( 'This is required', 'dokan-lite' ) . '</span>';
                        }
                        ?>
                    </span>
                </td>
                <tr>
                    <th scope="row">
                        <label for="address[country]">
                            <?php esc_html_e( 'Country', 'dokan-lite' ); ?>
                            <span class='required'>*</span></label></th>
                    </label>
                    </th>
                    <td>
                        <select name="address[country]" class="wc-enhanced-select country_to_state" id="address[country]" style="width: 100%;">
                            <?php dokan_country_dropdown( $countries, $address_country, false ); ?>
                        </select>
                        <span class="error-container">
                            <?php
                            if ( ! empty( $request_data['error_address[country]'] ) ) {
                                echo '<span class="required">' . __( 'This is required', 'dokan-lite' ) . '</span>';
                            }
                            ?>
                        </span>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="calc_shipping_state">
                            <?php esc_html_e( 'State', 'dokan-lite' ); ?>
                            <span class='required'>*</span></label></th>
                    </label>
                    </th>
                    <td>
                        <input type="text" id="calc_shipping_state" name="address[state]" value="<?php echo esc_attr( $address_state ); ?>" / placeholder="<?php esc_attr_e( 'State Name', 'dokan-lite' ); ?>">
                        <span class="error-container">
                            <?php
                            if ( ! empty( $request_data['error_address[state]'] ) ) {
                                echo '<span class="required">' . __( 'This is required', 'dokan-lite' ) . '</span>';
                            }
                            ?>
                        </span>
                    </td>
                </tr>

                <?php do_action( 'dokan_seller_wizard_store_setup_after_address_field', $this ); ?>

                <?php do_action( 'dokan_seller_wizard_store_setup_before_map_field', $this ); ?>

                <?php if ( dokan_has_map_api_key() ) : ?>
                    <tr>
                        <th><label for="setting_map"><?php esc_html_e( 'Map', 'dokan-lite' ); ?></label></th>
                        <td>
                            <?php
                            dokan_get_template(
                                'maps/dokan-maps-with-search.php', [
                                    'map_location' => $map_location,
                                    'map_address'  => $map_address,
                                ]
                            );
                            ?>
                        </td>
                    </tr>
                <?php endif; ?>

                <?php do_action( 'dokan_seller_wizard_store_setup_after_map_field', $this ); ?>

                <?php if ( empty( dokan_is_vendor_info_hidden( 'email' ) ) ) : ?>
                    <tr>
                        <th scope="row"><label for="show_email"><?php esc_html_e( 'Email', 'dokan-lite' ); ?></label></th>
                        <td class="checkbox">
                            <input type="checkbox" name="show_email" id="show_email" class="switch-input" value="1" <?php echo ( $show_email === 'yes' ) ? 'checked="true"' : ''; ?>>
                            <label for="show_email">
                                <?php esc_html_e( 'Show email address in store', 'dokan-lite' ); ?>
                            </label>
                        </td>
                    </tr>
                <?php endif; ?>

                <?php do_action( 'dokan_seller_wizard_store_setup_field', $this ); ?>

            </table>
            <p class="wc-setup-actions step">
                <input type="button" class="button-primary button button-large button-next store-step-continue dokan-btn-theme" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>"/>
                <input type="submit" id="save_step_submit" style='display: none' value="submit" name="save_step"/>
                <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button button-large button-next store-step-skip-btn dokan-btn-theme"><?php esc_html_e( 'Skip this step', 'dokan-lite' ); ?></a>
                <?php wp_nonce_field( 'dokan-seller-setup' ); ?>
            </p>
        </form>
        <script>
            (function ($) {
                var states = <?php echo wp_json_encode( $states ); ?>;
                var requiredMsg = <?php echo wp_json_encode( __( 'This is required', 'dokan-lite' ) ); ?>;

                $('body').on('change', 'select.country_to_state, input.country_to_state', function () {
                    // Grab wrapping element to target only stateboxes in same 'group'
                    var $wrapper = $(this).closest('form.dokan-seller-setup-form');

                    var country = $(this).val(),
                        $statebox = $wrapper.find('#calc_shipping_state'),
                        $parent = $statebox.closest('tr'),
                        input_name = $statebox.attr('name'),
                        input_id = $statebox.attr('id'),
                        value = $statebox.val(),
                        placeholder = $statebox.attr('placeholder') || $statebox.attr('data-placeholder') || '',
                        state_option_text = '<?php echo esc_attr__( 'Select an option&hellip;', 'dokan-lite' ); ?>';

                    if (states[country]) {
                        if ($.isEmptyObject(states[country])) {
                            $statebox.closest('tr').hide().find('.select2-container').remove();
                            $statebox.replaceWith('<input type="hidden" class="hidden" name="' + input_name + '" id="' + input_id + '" value="" placeholder="' + placeholder + '" />');

                            $(document.body).trigger('country_to_state_changed', [country, $wrapper]);

                        } else {

                            var options = '',
                                state = states[country];

                            for (var index in state) {
                                if (state.hasOwnProperty(index)) {
                                    options = options + '<option value="' + index + '">' + state[index] + '</option>';
                                }
                            }

                            $statebox.closest('tr').show();

                            if ($statebox.is('input')) {
                                // Change for select
                                $statebox.replaceWith('<select name="' + input_name + '" id="' + input_id + '" class="wc-enhanced-select state_select" data-placeholder="' + placeholder + '"></select>');
                                $statebox = $wrapper.find('#calc_shipping_state');
                            }

                            $statebox.html('<option value="">' + state_option_text + '</option>' + options);
                            $statebox.val(value).trigger('change');

                            $(document.body).trigger('country_to_state_changed', [country, $wrapper]);

                        }
                    } else {
                        if ($statebox.is('select')) {

                            $parent.show().find('.select2-container').remove();
                            $statebox.replaceWith('<input type="text" class="input-text" name="' + input_name + '" id="' + input_id + '" placeholder="' + placeholder + '" />');

                            $(document.body).trigger('country_to_state_changed', [country, $wrapper]);

                        } else if ($statebox.is('input[type="hidden"]')) {

                            $parent.show().find('.select2-container').remove();
                            $statebox.replaceWith('<input type="text" class="input-text" name="' + input_name + '" id="' + input_id + '" placeholder="' + placeholder + '" />');

                            $(document.body).trigger('country_to_state_changed', [country, $wrapper]);

                        }
                    }

                    $(document.body).trigger('country_to_state_changing', [country, $wrapper]);
                    $('.wc-enhanced-select').select2();
                });

                $(':input.country_to_state').trigger('change');

                $('.store-step-continue').on('click', function(e) {
                    let data = $('.dokan-seller-setup-form').serializeArray().reduce(function(obj, item) {
                        obj[item.name] = item.value;
                        return obj;
                    }, {});

                    let requiredFields = [ 'address[street_1]', 'address[city]', 'address[zip]', 'address[country]' ];

                    requiredFields.map( item => {
                        if ( ! $( `*[name='${item}']` ).val() ) {
                            $( `*[name='${item}']` ).closest('td').children(`span.error-container`).html(`<span class="required">${requiredMsg}</span>`);
                        } else {
                            $( `*[name='${item}']` ).closest('td').children(`span.error-container`).html('');
                        }
                    } );

                    if ( ( 'object' === typeof states[ data['address[country]'] ] && Object.keys( states[ data['address[country]'] ] ).length && ! data['address[state]'] ) || ( 'undefined' === typeof states[ data['address[country]'] ] && ! data['address[state]'] ) ) {
                        if ( ! $( `*[name='address[state]']` ).val() ) {
                            $( `*[name='address[state]']` ).closest('td').children(`span.error-container`).html(`<span class="required">${requiredMsg}</span>`);
                        } else {
                            $( `*[name='address[state]']` ).closest('td').children(`span.error-container`).html('');
                        }

                        return;
                    }

                    $('#save_step_submit').trigger("click");
                });
            })(jQuery);

        </script>
        <style>
            .select2-container--open .select2-dropdown {
                left: 20px;
            }
        </style>
        <?php

        do_action( 'dokan_seller_wizard_after_store_setup_form', $this );
    }

    /**
     * Save store options.
     */
    public function dokan_setup_store_save() {
        if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan-seller-setup' ) ) {
            return;
        }

        $dokan_settings = $this->store_info;
        $country_obj    = new WC_Countries();
        $states         = $country_obj->states;

        $dokan_settings['address']      = isset( $_POST['address'] ) ? array_map( 'sanitize_text_field', wp_unslash( $_POST['address'] ) ) : [];
        $dokan_settings['location']     = isset( $_POST['location'] ) ? sanitize_text_field( wp_unslash( $_POST['location'] ) ) : '';
        $dokan_settings['find_address'] = isset( $_POST['find_address'] ) ? sanitize_text_field( wp_unslash( $_POST['find_address'] ) ) : '';
        $dokan_settings['show_email']   = isset( $_POST['show_email'] ) ? 'yes' : 'no';
        $country = $dokan_settings['address']['country'] ?? '';
        $state = $dokan_settings['address']['state'] ?? '';
        $country_has_states = isset( $states[ $country ] );
        $state_is_empty = empty( $state );        // Validating filed.
        // Validating filed.
        $is_valid_form = true;
        if ( empty( $dokan_settings['address']['street_1'] ) ) {
            $is_valid_form = false;
            $_POST['error_address[street_1]'] = 'error';
        }
        if ( empty( $dokan_settings['address']['city'] ) ) {
            $is_valid_form = false;
            $_POST['error_address[city]'] = 'error';
        }
        if ( empty( $dokan_settings['address']['zip'] ) ) {
            $is_valid_form = false;
            $_POST['error_address[zip]'] = 'error';
        }
        if ( empty( $dokan_settings['address']['country'] ) ) {
            $is_valid_form = false;
            $_POST['error_address[country]'] = 'error';
        } elseif ( ( $country_has_states && count( $states[ $country ] ) > 0 && $state_is_empty ) ) {
            $is_valid_form = false;
            $_POST['error_address[state]'] = 'error';
        } elseif ( ! $country_has_states && $state_is_empty ) {
            $is_valid_form = false;
            $_POST['error_address[state]'] = 'error';
        }
        if ( ! $is_valid_form ) {
            return;
        }

        $profile_settings = get_user_meta( $this->store_id, 'dokan_profile_settings', true );
        $dokan_settings = dokan()->registration->check_and_set_address_profile_completion( $this->store_id, $dokan_settings, $profile_settings );

        update_user_meta( $this->store_id, 'dokan_profile_settings', $dokan_settings );
        do_action( 'dokan_store_profile_saved', $this->store_id, $dokan_settings );
        do_action( 'dokan_seller_wizard_store_field_save', $this );

        wp_safe_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Payment step.
     */
    public function dokan_setup_payment() {
        $methods    = dokan_withdraw_get_active_methods();
        $store_info = $this->store_info;
        ?>
        <h1><?php esc_html_e( 'Payment Setup', 'dokan-lite' ); ?></h1>
        <form method="post" id='dokan-seller-payment-setup-form' novalidate>
            <table class="form-table">
                <?php
                foreach ( $methods as $method_key ) {
                    $method = dokan_withdraw_get_method( $method_key );
                    if ( isset( $method['callback'] ) && is_callable( $method['callback'] ) ) {
                        ?>
                        <tr>
                            <th scope="row"><label><?php echo esc_html( dokan_withdraw_get_method_title( $method_key ) ); ?></label></th>
                            <td>
                                <?php call_user_func( $method['callback'], $store_info ); ?>
                            </td>
                        </tr>
                        <?php
                    }
                }

                do_action( 'dokan_seller_wizard_payment_setup_field', $this );
                ?>
            </table>
            <p class="wc-setup-actions step">
                <input type="submit" class="button-primary button button-large button-next payment-continue-btn dokan-btn-theme" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>" name="save_step"/>

                <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button button-large button-next payment-step-skip-btn dokan-btn-theme"><?php esc_html_e( 'Skip this step', 'dokan-lite' ); ?></a>
                <?php wp_nonce_field( 'dokan-seller-setup' ); ?>
            </p>
        </form>
        <?php

        do_action( 'dokan_seller_wizard_after_payment_setup_form', $this );
    }

    /**
     * Save payment options.
     */
    public function dokan_setup_payment_save() {
        if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan-seller-setup' ) ) {
            return;
        }

        $dokan_settings = $this->store_info;

        if ( isset( $_POST['settings']['bank'] ) ) {
            $bank = array_map( 'sanitize_text_field', (array) wp_unslash( $_POST['settings']['bank'] ) );

            $dokan_settings['payment']['bank'] = [
                'ac_name'        => $bank['ac_name'],
                'ac_type'        => $bank['ac_type'],
                'ac_number'      => $bank['ac_number'],
                'bank_name'      => $bank['bank_name'],
                'bank_addr'      => $bank['bank_addr'],
                'routing_number' => $bank['routing_number'],
                'iban'           => $bank['iban'],
                'swift'          => $bank['swift'],
            ];

            $user_bank_data = array_filter(
                $dokan_settings['payment']['bank'], function ( $item ) {
					return ! empty( $item );
				}
            );
            $require_fields = array_keys( dokan_bank_payment_required_fields() );

            $has_bank_information = true;
            foreach ( $require_fields as $require_field ) {
                if ( empty( $user_bank_data[ $require_field ] ) ) {
                    $_POST[ 'error_' . $require_field ] = 'error';
                    $has_bank_information = false;
                }
            }

            if ( $has_bank_information && ! empty( $dokan_settings['profile_completion']['progress_vals']['payment_method_val'] ) ) {
                $dokan_settings['profile_completion']['bank'] = $dokan_settings['profile_completion']['progress_vals']['payment_method_val'];
                $dokan_settings['profile_completion']['paypal'] = 0;
            }
        }

        if ( ! empty( $_POST['settings']['paypal']['email'] ) && ! empty( $dokan_settings['profile_completion']['progress_vals']['payment_method_val'] ) ) {
            $dokan_settings['payment']['paypal']            = [
                'email' => sanitize_email( wp_unslash( $_POST['settings']['paypal']['email'] ) ),
            ];
            $dokan_settings['profile_completion']['paypal'] = $dokan_settings['profile_completion']['progress_vals']['payment_method_val'];
            $dokan_settings['profile_completion']['bank'] = 0;
        }

        // Check any payment methods setups and add manually value on Profile Completion also increase progress value
        if ( ! empty( $dokan_settings['profile_completion']['paypal'] ) || ! empty( $dokan_settings['profile_completion']['bank'] ) ) {
            $profile_settings = get_user_meta( $this->store_id, 'dokan_profile_settings', true );
            if ( ! empty( $profile_settings['profile_completion']['progress'] ) && ! empty( $dokan_settings['profile_completion']['progress_vals']['payment_method_val'] ) ) {
                $dokan_settings['profile_completion']['progress'] = $profile_settings['profile_completion']['progress'] + $dokan_settings['profile_completion']['progress_vals']['payment_method_val'];
            }
        }

        update_user_meta( $this->store_id, 'dokan_profile_settings', $dokan_settings );

        do_action( 'dokan_seller_wizard_payment_field_save', $this );

        wp_safe_redirect( apply_filters( 'dokan_ww_payment_redirect', esc_url_raw( $this->get_next_step_link() ) ) );
        exit;
    }

    /**
     * Final step.
     */
    public function dokan_setup_ready() {
        $dashboard_url = dokan_get_navigation_url();
        ?>
        <div class="dokan-setup-done">
            <img src="<?php echo esc_url( plugins_url( 'assets/images/dokan-checked.png', DOKAN_FILE ) ); ?>" alt="dokan setup">
            <h1><?php esc_html_e( 'Your Store is Ready!', 'dokan-lite' ); ?></h1>
        </div>

        <div class="dokan-setup-done-content">
            <p class="wc-setup-actions step">
                <a class="button button-primary dokan-btn-theme" href="<?php echo esc_url( $dashboard_url ); ?>"><?php esc_html_e( 'Go to your Store Dashboard!', 'dokan-lite' ); ?></a>
            </p>
        </div>
        <?php
    }

    /**
     * Gets the URL for the next step in the wizard
     *
     * Handles special logic to skip the payment step if no withdrawal methods
     * are active, preventing users from accessing an empty payment step
     *
     * @since 2.9.27
     *
     * @return string The URL for the next step
     */
    public function get_next_step_link(): string {
        $keys = array_keys( $this->steps );
        $step = array_search( $this->current_step, $keys, true );
        ++$step;

        // If next step is payment but there are no active methods, skip to the following step
        if ( 'payment' === $keys[ $step ] && empty( dokan_withdraw_get_active_methods() ) ) {
            ++$step;
        }
        $next_step = $keys[ $step ] ?? '';
        return add_query_arg(
            [
                'step' => apply_filters( 'dokan_seller_wizard_next_step', $next_step, $this->current_step, $this->steps ),
                '_admin_sw_nonce' => wp_create_nonce( 'dokan_admin_setup_wizard_nonce' ),
            ]
        );
    }

    /**
     * Sets up the wizard steps
     *
     * Defines the steps for the setup wizard, conditionally including
     * the payment step only if active withdrawal methods exist
     *
     * @since 2.9.27
     *
     * @return void
     */
    protected function set_steps() {
        $steps = [
            'introduction' => [
                'name'    => __( 'Introduction', 'dokan-lite' ),
                'view'    => [ $this, 'dokan_setup_introduction' ],
                'handler' => '',
            ],
            'store'        => [
                'name'    => __( 'Store', 'dokan-lite' ),
                'view'    => [ $this, 'dokan_setup_store' ],
                'handler' => [ $this, 'dokan_setup_store_save' ],
            ],
        ];

        // Only add payment step if there are active withdrawal methods
        $active_methods = dokan_withdraw_get_active_methods();
        if ( ! empty( $active_methods ) ) {
            $steps['payment'] = [
                'name'    => __( 'Payment', 'dokan-lite' ),
                'view'    => [ $this, 'dokan_setup_payment' ],
                'handler' => [ $this, 'dokan_setup_payment_save' ],
            ];
        }

        $steps['next_steps'] = [
            'name'    => __( 'Ready!', 'dokan-lite' ),
            'view'    => [ $this, 'dokan_setup_ready' ],
            'handler' => '',
        ];

        /**
         * Filter the seller wizard steps
         *
         * @since 2.9.27
         *
         * @param array $steps Array of wizard steps
         */
        $this->steps = apply_filters( 'dokan_seller_wizard_steps', $steps );
        $this->current_step  = current( array_keys( $this->steps ) );
    }
}
