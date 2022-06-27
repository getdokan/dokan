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
        $show_vendor_info = dokan_get_option( 'show_vendor_info', 'dokan_appearance', 'off' );

        if ( 'on' === $show_vendor_info ) {
            add_action( 'woocommerce_product_meta_end', [ $this, 'add_vendor_info_on_product_single_page' ] );
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
                'desc'              => __( 'Show vendor information on single product page', 'dokan-lite' ),
                'type'              => 'switcher',
                'default'           => 'off',
                'class'             => 'show_vendor_info',
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ];

        return $dokan_settings->add_settings_after(
            $settings_fields,
            'dokan_appearance',
            'enable_theme_store_sidebar',
            $vendor_info
        );
    }
}

