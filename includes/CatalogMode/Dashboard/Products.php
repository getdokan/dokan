<?php

namespace WeDevs\Dokan\CatalogMode\Dashboard;

use WeDevs\Dokan\CatalogMode\Helper;

/**
 * Class Hooks
 *
 * This class will load hooks related to frontend
 *
 * @since   3.6.4
 *
 * @package WeDevs\Dokan\CatalogMode
 */
class Products {
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
        // render catalog mode section under single product edit page
        add_action( 'dokan_product_edit_after_options', [ $this, 'render_product_section' ], 99, 1 );
        // save catalog mode section data
        add_action( 'dokan_product_updated', [ $this, 'save_catalog_mode_data' ], 13 );
    }

    /**
     * This method will render catalog mode section under single product edit page
     *
     * @since 3.6.4
     *
     * @param $product_id int
     *
     * @return void
     */
    public function render_product_section( $product_id ) {
        // check permission, don't let vendor staff view this section
        if ( ! current_user_can( 'dokandar' ) ) {
            return;
        }

        // get product data
        $product = wc_get_product( $product_id );
        // return if product type is optional
        if ( ! $product || 'auction' === $product->get_type() ) {
            return;
        }

        $defaults = Helper::get_defaults();
        // check for saved values
        $catalog_mode_data = get_post_meta( $product_id, '_dokan_catalog_mode', true );

        //load template
        dokan_get_template_part(
            'products/catalog-mode-content', '', [
                'product_id' => $product_id,
                'saved_data' => $catalog_mode_data ? $catalog_mode_data : $defaults,
            ]
        );
    }

    /**
     * This method will save catalog mode section data
     *
     * @since 3.6.4
     *
     * @param $product_id int
     *
     * @return void
     */
    public function save_catalog_mode_data( $product_id ) {
        if ( ! isset( $_POST['_dokan_catalog_mode_frontend_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_dokan_catalog_mode_frontend_nonce'] ), 'dokan_catalog_mode_frontend' ) ) {
            return;
        }

        if ( ! dokan_is_user_seller( dokan_get_current_user_id() ) ) {
            return;
        }

        $catalog_mode_data = [
            'hide_add_to_cart_button' => isset( $_POST['catalog_mode']['hide_add_to_cart_button'] ) ? 'on' : 'off',
            'hide_product_price'      => isset( $_POST['catalog_mode']['hide_product_price'] ) ? 'on' : 'off',
        ];

        // set hide price to off if add to cart button is off
        if ( 'off' === $catalog_mode_data['hide_add_to_cart_button'] ) {
            $catalog_mode_data['hide_product_price'] = 'off';
        }

        update_post_meta( $product_id, '_dokan_catalog_mode', $catalog_mode_data );
    }
}
