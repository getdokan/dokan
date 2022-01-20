<?php

namespace WeDevs\Dokan\Product;

/**
 * Vendor information handler class
 */
class VendorInfo {
    /**
     * Class constructor
     *
     * @since 3.3.7
     */
    public function __construct() {
        $position = dokan_get_option( 'vendor_info', 'dokan_appearance' );

        if ( 'do_not_show' !== $position ) {
            if ( 'below_add_to_cart_btn' === $position ) {
                add_action( 'woocommerce_after_add_to_cart_form', [ $this, 'add_vendor_info_on_product_single_page' ] );
            } elseif ( 'below_category' === $position ) {
                add_action( 'woocommerce_product_meta_end', [ $this, 'add_vendor_info_on_product_single_page' ] );
            } else {
                add_action( 'woocommerce_simple_add_to_cart', [ $this, 'add_vendor_info_on_product_single_page' ] );
            }
        }

        add_filter( 'dokan_settings_fields', array( $this, 'vendor_info_admin_settings' ), 10, 2 );
    }

    /**
     * Display seller info on product single page
     *
     * @since 3.3.7
     *
     * @return void
     */
    public function add_vendor_info_on_product_single_page() {
        dokan_get_template_part( 'vendor-info' );
    }

    /**
     * Add setting fields for seller information
     *
     * @param array $settings_fields
     *
     * @param object $dokan_settings
     *
     * @return array
     */
    public function vendor_info_admin_settings( $settings_fields, $dokan_settings ) {
        $vendor_info = [
            'vendor_info' => [
                'name'              => 'vendor_info',
                'label'             => __( 'Show Vendor Info', 'dokan-lite' ),
                'desc'              => __( 'Show vendor information on product single page', 'dokan' ),
                'type'              => 'select',
                'options'           => [
                    'do_not_show'           => 'Don\'t show',
                    'below_price'           => 'Below product price',
                    'below_add_to_cart_btn' => 'Below add to cart button',
                    'below_category'        => 'Below product category',
                ],
                'default'           => 'do_not_show',
                'class'             => 'vendor_info',
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ];

        return $dokan_settings->add_settings_after(
            $settings_fields,
            'dokan_appearance',
            'hide_vendor_info',
            $vendor_info
        );
    }
}

