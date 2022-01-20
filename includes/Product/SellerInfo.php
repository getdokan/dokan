<?php

namespace WeDevs\Dokan\Product;

/**
 * Vendor information handler class
 */
class SellerInfo {
    public function __construct() {
        $position = dokan_get_option( 'seller_info', 'dokan_appearance' );

        if ( 'below_add_to_cart_btn' === $position ) {
            add_action( 'woocommerce_after_add_to_cart_form', [ $this, 'add_seller_info_on_product_single_page' ] );
        } elseif ( 'below_category' === $position ) {
            add_action( 'woocommerce_product_meta_end', [ $this, 'add_seller_info_on_product_single_page' ] );
        } else {
            add_action( 'woocommerce_simple_add_to_cart', [ $this, 'add_seller_info_on_product_single_page' ] );
        }

        add_filter( 'dokan_settings_fields', array( $this, 'seller_info_admin_settings' ), 10, 2 );
    }

    /**
     * Display seller info on product details page
     *
     * @since 3.3.7
     *
     * @return void
     */
    public function add_seller_info_on_product_single_page() {
        dokan_get_template_part( 'seller-info' );
    }

    /**
     * Add fields for seller information
     *
     * @param array $settings_fields
     *
     * @param object $dokan_settings
     *
     * @return array
     */
    public function seller_info_admin_settings( $settings_fields, $dokan_settings ) {
        $seller_info = [
            'seller_info' => [
                'name'              => 'seller_info',
                'label'             => __( 'Show Vendor Info', 'dokan-lite' ),
                'desc'              => __( 'Show vendor information on product single page', 'dokan' ),
                'type'              => 'select',
                'options'           => [
                    'below_price'           => 'Below product price',
                    'below_add_to_cart_btn' => 'Below Add to cart button',
                    'below_category'        => 'Below product category',
                ],
                'default'           => 'below_price',
                'class'             => 'seller_info',
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ];

        return $dokan_settings->add_settings_after(
            $settings_fields,
            'dokan_appearance',
            'hide_vendor_info',
            $seller_info
        );
    }
}

