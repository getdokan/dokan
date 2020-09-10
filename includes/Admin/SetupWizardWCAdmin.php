<?php

namespace WeDevs\Dokan\Admin;

add_filter( 'woocommerce_enable_setup_wizard', '__return_false' );

require_once WC_ABSPATH . '/includes/admin/class-wc-admin-setup-wizard.php';

class SetupWizardWCAdmin extends \WC_Admin_Setup_Wizard {

    /**
     * Current step
     *
     * @since 2.9.27
     *
     * @var string
     */
    private $step = '';

    /**
     * Steps for the setup wizard
     *
     * @since 2.9.27
     *
     * @var array
     */
    private $steps = array();

    /**
     * Class constuctor
     *
     * @since 2.9.27
     *
     * @param array $steps
     *
     * @return void
     */
    public function __construct( $steps = array() ) {
        if ( $steps ) {
            $this->steps = $steps;
        }
    }

    /**
     * Set current step
     *
     * @since 2.9.27
     *
     * @param string $step
     */
    public function set_step( $step ) {
        $this->step = $step;
    }

    /**
     * WooCommerce Shipping setup step
     *
     * @see WC_Admin_Setup_Wizard::wc_setup_shipping Override the input/checkbox only
     *
     * @since 2.9.27
     *
     * @return void
     */
    public function wc_setup_shipping() {
        $country_code          = WC()->countries->get_base_country();
        $country_name          = WC()->countries->countries[ $country_code ];
        $prefixed_country_name = WC()->countries->estimated_for_prefix( $country_code ) . $country_name;
        $currency_code         = get_woocommerce_currency();
        $existing_zones        = \WC_Shipping_Zones::get_zones();
        $intro_text            = '';

        if ( empty( $existing_zones ) ) {
            $intro_text = sprintf(
                /* translators: %s: country name including the 'the' prefix if needed */
                __( "We've created two Shipping Zones - for %s and for the rest of the world. Below you can set Flat Rate shipping costs for these Zones or offer Free Shipping.", 'dokan-lite' ),
                $prefixed_country_name
            );
        }

        $is_wcs_labels_supported  = $this->is_wcs_shipping_labels_supported_country( $country_code );
        $is_shipstation_supported = $this->is_shipstation_supported_country( $country_code );

        ?>
        <h1><?php esc_html_e( 'Shipping', 'dokan-lite' ); ?></h1>
        <?php if ( $intro_text ) : ?>
            <p><?php echo wp_kses_post( $intro_text ); ?></p>
        <?php endif; ?>
        <form method="post">
            <?php if ( $is_wcs_labels_supported || $is_shipstation_supported ) : ?>
                <ul class="wc-setup-shipping-recommended">
                <?php
                if ( $is_wcs_labels_supported ) :
                    $this->display_recommended_item(
                        array(
                            'type'        => 'woocommerce_services',
                            'title'       => __( 'Did you know you can print shipping labels at home?', 'dokan-lite' ),
                            'description' => __( 'Use WooCommerce Shipping (powered by WooCommerce Services & Jetpack) to save time at the post office by printing your shipping labels at home.', 'dokan-lite' ),
                            'img_url'     => WC()->plugin_url() . '/assets/images/obw-woocommerce-services-icon.png',
                            'img_alt'     => __( 'WooCommerce Services icon', 'dokan-lite' ),
                            'plugins'     => $this->get_wcs_requisite_plugins(),
                        )
                    );
                elseif ( $is_shipstation_supported ) :
                    $this->display_recommended_item(
                        array(
                            'type'        => 'shipstation',
                            'title'       => __( 'Did you know you can print shipping labels at home?', 'dokan-lite' ),
                            'description' => __( 'We recommend using ShipStation to save time at the post office by printing your shipping labels at home. Try ShipStation free for 30 days.', 'dokan-lite' ),
                            'img_url'     => WC()->plugin_url() . '/assets/images/obw-shipstation-icon.png',
                            'img_alt'     => __( 'ShipStation icon', 'dokan-lite' ),
                            'plugins'     => array(
                                array(
                                    'name' => __( 'ShipStation', 'dokan-lite' ),
                                    'slug' => 'woocommerce-shipstation-integration',
                                ),
                            ),
                        )
                    );
                endif;
                ?>
                </ul>
            <?php endif; ?>

            <?php if ( empty( $existing_zones ) ) : ?>
                <ul class="wc-wizard-services shipping">
                    <li class="wc-wizard-service-item">
                        <div class="wc-wizard-service-name">
                            <p><?php echo esc_html_e( 'Shipping Zone', 'dokan-lite' ); ?></p>
                        </div>
                        <div class="wc-wizard-service-description">
                            <p><?php echo esc_html_e( 'Shipping Method', 'dokan-lite' ); ?></p>
                        </div>
                    </li>
                    <li class="wc-wizard-service-item">
                        <div class="wc-wizard-service-name">
                            <p><?php echo esc_html( $country_name ); ?></p>
                        </div>
                        <div class="wc-wizard-service-description">
                            <?php $this->shipping_method_selection_form( $country_code, $currency_code, 'shipping_zones[domestic]' ); ?>
                        </div>
                        <div class="dokan-wc-wizard-service-enable">
                            <input
                                class="switch-input"
                                id="shipping_zones[domestic][enabled]"
                                type="checkbox"
                                name="shipping_zones[domestic][enabled]"
                                value="yes"
                                checked="checked"
                                data-plugins="true"
                            >
                            <label for="shipping_zones[domestic][enabled]" class="switch-label switch-label-in-wc"></label>
                        </div>
                    </li>
                    <li class="wc-wizard-service-item">
                        <div class="wc-wizard-service-name">
                            <p><?php echo esc_html_e( 'Locations not covered by your other zones', 'dokan-lite' ); ?></p>
                        </div>
                        <div class="wc-wizard-service-description">
                            <?php $this->shipping_method_selection_form( $country_code, $currency_code, 'shipping_zones[intl]' ); ?>
                        </div>
                        <div class="dokan-wc-wizard-service-enable">
                            <input
                                class="switch-input"
                                id="shipping_zones[intl][enabled]"
                                type="checkbox"
                                name="shipping_zones[intl][enabled]"
                                value="yes"
                                checked="checked"
                                data-plugins="true"
                            >
                            <label for="shipping_zones[intl][enabled]" class="switch-label switch-label-in-wc"></label>
                        </div>
                    </li>
                    <li class="wc-wizard-service-info">
                        <p>
                        <?php
                        printf(
                            wp_kses(
                                /* translators: %1$s: live rates tooltip text, %2$s: shipping extensions URL */
                                __( 'If you\'d like to offer <span class="help_tip" data-tip="%1$s">live rates</span> from a specific carrier (e.g. UPS) you can find a variety of extensions available for WooCommerce <a href="%2$s" target="_blank">here</a>.', 'dokan-lite' ),
                                array(
                                    'span' => array(
                                        'class'    => array(),
                                        'data-tip' => array(),
                                    ),
                                    'a'    => array(
                                        'href'   => array(),
                                        'target' => array(),
                                    ),
                                )
                            ),
                            esc_attr__( 'A live rate is the exact cost to ship an order, quoted directly from the shipping carrier.', 'dokan-lite' ),
                            'https://woocommerce.com/product-category/woocommerce-extensions/shipping-methods/shipping-carriers/'
                        );
                        ?>
                        </p>
                    </li>
                </ul>
            <?php endif; ?>

            <div class="wc-setup-shipping-units">
                <p>
                    <?php
                        echo wp_kses(
                            sprintf(
                                /* translators: %1$s: weight unit dropdown, %2$s: dimension unit dropdown */
                                esc_html__( 'We\'ll use %1$s for product weight and %2$s for product dimensions.', 'dokan-lite' ),
                                $this->get_product_weight_selection(),
                                $this->get_product_dimension_selection()
                            ),
                            array(
                                'span'   => array(
                                    'class' => array(),
                                ),
                                'select' => array(
                                    'id'    => array(),
                                    'name'  => array(),
                                    'class' => array(),
                                ),
                                'option' => array(
                                    'value'    => array(),
                                    'selected' => array(),
                                ),
                            )
                        );
                    ?>
                </p>
            </div>

            <p class="wc-setup-actions step">
                <?php $this->plugin_install_info(); ?>
                <button type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>" name="save_step"><?php esc_html_e( 'Continue', 'dokan-lite' ); ?></button>
                <?php wp_nonce_field( 'wc-setup' ); ?>
            </p>
        </form>
        <?php
    }

    /**
     * Display service item in list.
     *
     * @see WC_Admin_Setup_Wizard::display_service_item Override input/checkbox only
     *
     * @param int   $item_id Item ID.
     * @param array $item_info Item info array.
     *
     * @return void
     */
    public function display_service_item( $item_id, $item_info ) {
        $item_class = 'wc-wizard-service-item';
        if ( isset( $item_info['class'] ) ) {
            $item_class .= ' ' . $item_info['class'];
        }

        $previously_saved_settings = get_option( 'woocommerce_' . $item_id . '_settings' );

        // Show the user-saved state if it was previously saved.
        // Otherwise, rely on the item info.
        if ( is_array( $previously_saved_settings ) ) {
            $should_enable_toggle = ( isset( $previously_saved_settings['enabled'] ) && 'yes' === $previously_saved_settings['enabled'] ) ? true : ( isset( $item_info['enabled'] ) && $item_info['enabled'] );
        } else {
            $should_enable_toggle = isset( $item_info['enabled'] ) && $item_info['enabled'];
        }

        $plugins = null;
        if ( isset( $item_info['repo-slug'] ) ) {
            $plugin  = array(
                'slug' => $item_info['repo-slug'],
                'name' => $item_info['name'],
            );
            $plugins = array( $plugin );
        }

        ?>
        <li class="<?php echo esc_attr( $item_class ); ?>">
            <div class="wc-wizard-service-name">
                <?php if ( ! empty( $item_info['image'] ) ) : ?>
                    <img src="<?php echo esc_attr( $item_info['image'] ); ?>" alt="<?php echo esc_attr( $item_info['name'] ); ?>" />
                <?php else : ?>
                    <p><?php echo esc_html( $item_info['name'] ); ?></p>
                <?php endif; ?>
            </div>
            <div class="wc-wizard-service-enable">
                <input
                    class="switch-input"
                    id="wc-wizard-service-<?php echo esc_attr( $item_id ); ?>"
                    type="checkbox"
                    name="wc-wizard-service-<?php echo esc_attr( $item_id ); ?>-enabled"
                    value="yes" <?php checked( $should_enable_toggle ); ?>
                    data-plugins="<?php echo wc_esc_json( wp_json_encode( $plugins ) ); ?>"
                >
                <label for="wc-wizard-service-<?php echo esc_attr( $item_id ); ?>-enabled" class="switch-label"></label>

            </div>
            <div class="wc-wizard-service-description">
                <?php echo wp_kses_post( wpautop( $item_info['description'] ) ); ?>
                <?php if ( ! empty( $item_info['settings'] ) ) : ?>
                    <div class="wc-wizard-service-settings <?php echo $should_enable_toggle ? '' : 'hide'; ?>">
                        <?php foreach ( $item_info['settings'] as $setting_id => $setting ) : ?>
                            <?php
                            $is_checkbox = 'checkbox' === $setting['type'];

                            if ( $is_checkbox ) {
                                $checked = false;
                                if ( isset( $previously_saved_settings[ $setting_id ] ) ) {
                                    $checked = 'yes' === $previously_saved_settings[ $setting_id ];
                                } elseif ( false === $previously_saved_settings && isset( $setting['default'] ) ) {
                                    $checked = 'yes' === $setting['default'];
                                }
                            }
                            if ( 'email' === $setting['type'] ) {
                                $value = empty( $previously_saved_settings[ $setting_id ] )
                                    ? $setting['value']
                                    : $previously_saved_settings[ $setting_id ];
                            }
                            ?>
                            <?php $input_id = $item_id . '_' . $setting_id; ?>
                            <div class="<?php echo esc_attr( 'wc-wizard-service-setting-' . $input_id ); ?>">
                                <label
                                    for="<?php echo esc_attr( $input_id ); ?>"
                                    class="<?php echo esc_attr( $input_id ); ?>"
                                >
                                    <?php echo esc_html( $setting['label'] ); ?>
                                </label>
                                <input
                                    type="<?php echo esc_attr( $setting['type'] ); ?>"
                                    id="<?php echo esc_attr( $input_id ); ?>"
                                    class="<?php echo esc_attr( 'payment-' . $setting['type'] . '-input' ); ?>"
                                    name="<?php echo esc_attr( $input_id ); ?>"
                                    value="<?php echo esc_attr( isset( $value ) ? $value : $setting['value'] ); ?>"
                                    placeholder="<?php echo esc_attr( $setting['placeholder'] ); ?>"
                                    <?php echo ( $setting['required'] ) ? 'required' : ''; ?>
                                    <?php echo $is_checkbox ? checked( isset( $checked ) && $checked, true, false ) : ''; ?>
                                    data-plugins="<?php echo wc_esc_json( wp_json_encode( isset( $setting['plugins'] ) ? $setting['plugins'] : null ) ); ?>"
                                />
                                <?php if ( ! empty( $setting['description'] ) ) : ?>
                                    <span class="wc-wizard-service-settings-description"><?php echo esc_html( $setting['description'] ); ?></span>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </li>
        <?php
    }

    /**
     * Get the URL for the next step's screen.
     *
     * @see WC_Admin_Setup_Wizard::get_next_step_link Without the override, $this in parent class
     *                                                will refer to parent class object
     *
     * @since 2.9.27
     *
     * @param string $step  slug (default: current step).
     * @return string       URL for next step if a next step exists.
     *                      Admin URL if it's the last step.
     *                      Empty string on failure.
     *
     * @return void
     */
    public function get_next_step_link( $step = '' ) {
        if ( ! $step ) {
            $step = $this->step;
        }

        $keys = array_keys( $this->steps );
        if ( end( $keys ) === $step ) {
            return admin_url();
        }

        $step_index = array_search( $step, $keys, true );
        if ( false === $step_index ) {
            return '';
        }

        return add_query_arg( 'step', $keys[ $step_index + 1 ], remove_query_arg( 'activate_error' ) );
    }
}
