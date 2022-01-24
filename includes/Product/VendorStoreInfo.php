<?php

namespace WeDevs\Dokan\Product;

/**
 * Vendor information handler class
 */
class VendorStoreInfo {
    /**
     * Class constructor
     *
     * @since 3.3.7
     */
    public function __construct() {
        $show_vendor_info = dokan_get_option( 'show_vendor_info', 'dokan_appearance', 'do_not_show' );

        if ( 'do_not_show' !== $show_vendor_info ) {
            switch ( $show_vendor_info ) {
                case 'woocommerce_after_add_to_cart_form':
                    add_action( 'woocommerce_after_add_to_cart_form', [ $this, 'add_vendor_info_on_product_single_page' ] );
                    break;
                case 'woocommerce_product_meta_end':
                    add_action( 'woocommerce_product_meta_end', [ $this, 'add_vendor_info_on_product_single_page' ] );
                    break;
                default:
                    add_action( 'woocommerce_simple_add_to_cart', [ $this, 'add_vendor_info_on_product_single_page' ] );
            }
        }

        add_filter( 'dokan_settings_fields', array( $this, 'admin_settings_for_vendor_info' ), 10, 2 );
    }

    /**
     * Display seller info on product single page
     *
     * @since 3.3.7
     *
     * @return void
     */
    public function add_vendor_info_on_product_single_page() {
        global $product;

        $vendor       = dokan_get_vendor_by_product( $product );
        $store_info   = $vendor->get_shop_info();
        $store_rating = $vendor->get_rating();

        dokan_get_template_part(
            'vendor-store-info',
            '',
            [
                'vendor'       => $vendor,
                'store_info'   => $store_info,
                'store_rating' => $store_rating,
            ]
        );
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
    public function admin_settings_for_vendor_info( $settings_fields, $dokan_settings ) {
        $vendor_info = [
            'show_vendor_info' => [
                'name'              => 'show_vendor_info',
                'label'             => __( 'Show Vendor Info', 'dokan-lite' ),
                'desc'              => __( 'Show vendor information on product single page', 'dokan-lite' ),
                'type'              => 'select',
                'options'           => [
                    'do_not_show'                        => __( 'Don\'t show', 'dokan-lite' ),
                    'woocommerce_simple_add_to_cart'     => __( 'Below product price', 'dokan-lite' ),
                    'woocommerce_after_add_to_cart_form' => __( 'Below add to cart button', 'dokan-lite' ),
                    'woocommerce_product_meta_end'       => __( 'Below product category', 'dokan-lite' ),
                ],
                'default'           => 'do_not_show',
                'class'             => 'show_vendor_info',
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

