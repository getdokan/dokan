<?php

namespace WeDevs\Dokan\CatalogMode\Dashboard;

use WeDevs\Dokan\CatalogMode\Helper;

/**
 * Class Hooks
 *
 * This class will be responsible for admin settings of Catalog Mode feature
 *
 * @since   3.6.4
 *
 * @package WeDevs\Dokan\CatalogMode\Dashboard
 */
class Settings {
    /**
     * Class constructor
     *
     * @since 3.6.4
     *
     * @return void
     */
    public function __construct() {
        // if admin didn't enabled catalog mode, then return
        if ( ! Helper::is_enabled_by_admin() ) {
            return;
        }

        // render settings fields for Catalog Mode under vendor dashboard settings page
        add_action( 'dokan_settings_form_bottom', [ $this, 'render_settings_fields' ], 10, 2 );

        //save Catalog Mode settings fields data
        add_filter( 'dokan_store_profile_settings_args', [ $this, 'save_settings_fields' ], 10, 2 );
    }

    /**
     * This method will render settings fields for Catalog Mode
     *
     * @since 3.6.4
     *
     * @param array $store_settings
     * @param int   $user_id
     *
     * @return void
     */
    public function render_settings_fields( $user_id, $store_settings ) {
        // get default store settings
        $defaults = Helper::get_defaults();
        if ( ! isset( $store_settings['catalog_mode'] ) ) {
            $store_settings['catalog_mode'] = $defaults;
        }
        $hide_add_to_cart = ! empty( $store_settings['catalog_mode']['hide_add_to_cart_button'] )
            ? $store_settings['catalog_mode']['hide_add_to_cart_button'] : $defaults['hide_add_to_cart_button'];
        $hide_price       = ! empty( $store_settings['catalog_mode']['hide_product_price'] )
            ? $store_settings['catalog_mode']['hide_product_price'] : $defaults['hide_product_price'];
        ?>
        <?php wp_nonce_field( 'dokan_catalog_mode_settings_action', '_dokan_catalog_mode_nonce' ); ?>
        <?php if ( Helper::hide_add_to_cart_button_option_is_enabled_by_admin() ) : ?>
            <div class="dokan-form-group">
                <label class="dokan-w3 dokan-control-label"
                        for="catalog_mode_hide_add_to_cart_button"><?php esc_html_e( 'Remove Add to Cart Button', 'dokan-lite' ); ?></label>
                <div class="dokan-w5 dokan-text-left">
                    <label for="catalog_mode_hide_add_to_cart_button">
                        <input type="checkbox" id="catalog_mode_hide_add_to_cart_button" value="on" name="catalog_mode[hide_add_to_cart_button]"
                            <?php checked( $hide_add_to_cart, 'on' ); ?> />
                        <span> <?php esc_html_e( 'Check to remove Add to Cart option from your products.', 'dokan-lite' ); ?></span>
                    </label>
                </div>
            </div>
            <div class="catalog_mode_extra_section">
                <?php if ( Helper::hide_product_price_option_is_enabled_by_admin() ) : ?>
                    <div class="dokan-form-group">
                        <label class="dokan-w3 dokan-control-label" for="catalog_mode_hide_product_price"><?php esc_attr_e( 'Hide Product Price', 'dokan-lite' ); ?></label>
                        <div class="dokan-w5 dokan-text-left">
                            <label for="catalog_mode_hide_product_price">
                                <input type="checkbox" id="catalog_mode_hide_product_price" value="on" name="catalog_mode[hide_product_price]"
                                    <?php checked( $hide_price, 'on' ); ?> />
                                <span> <?php esc_html_e( 'Check to hide product price from your products.', 'dokan-lite' ); ?></span>
                            </label>
                        </div>
                    </div>
                <?php endif; ?>
                <?php do_action( 'dokan_catalog_mode_extra_settings_section', $user_id, $store_settings['catalog_mode'] ); ?>
            </div>
        <?php endif; ?>
        <?php
        if ( Helper::hide_add_to_cart_button_option_is_enabled_by_admin() ) :
            ?>
            <script type="text/javascript">
                (function ($) {
                    $(document).ready(function () {
                        $('#catalog_mode_hide_add_to_cart_button').on('change', function () {
                            if ($(this).is(':checked')) {
                                $('div.catalog_mode_extra_section').show();
                            } else {
                                $('div.catalog_mode_extra_section').hide();
                                $('#catalog_mode_hide_product_price').prop('checked', false);
                            }
                        });
                        $('#catalog_mode_hide_add_to_cart_button').trigger('change');
                    });
                })(jQuery);
            </script>
            <?php
        endif;
    }

    /**
     * This method will save settings fields for Catalog Mode
     *
     * @since 3.6.4
     *
     * @param int   $store_id
     * @param array $dokan_settings
     *
     * @return array
     */
    public function save_settings_fields( $dokan_settings, $store_id ) {
        if ( ! isset( $_POST['_dokan_catalog_mode_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_dokan_catalog_mode_nonce'] ), 'dokan_catalog_mode_settings_action' ) ) {
            return $dokan_settings;
        }

        if ( ! dokan_is_user_seller( $store_id ) ) {
            return $dokan_settings;
        }

        $dokan_settings['catalog_mode']['hide_add_to_cart_button'] = isset( $_POST['catalog_mode']['hide_add_to_cart_button'] ) ? 'on' : 'off';
        $dokan_settings['catalog_mode']['hide_product_price']      = isset( $_POST['catalog_mode']['hide_product_price'] ) ? 'on' : 'off';

        // set hide price to off if add to cart button is off
        if ( 'off' === $dokan_settings['catalog_mode']['hide_add_to_cart_button'] ) {
            $dokan_settings['catalog_mode']['hide_product_price'] = 'off';
        }

        return $dokan_settings;
    }
}
