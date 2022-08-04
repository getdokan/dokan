<?php

namespace WeDevs\Dokan\CatalogMode;

/**
 * Class Hooks
 *
 * This class will load hooks related to frontend
 *
 * @since   DOKAN_SINCE
 *
 * @package WeDevs\Dokan\CatalogMode
 */
class Hooks {
    /**
     * Class constructor
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function __construct() {
        // check if enabled by admin
        if ( ! Helper::is_enabled_by_admin() ) {
            return;
        }

        add_filter( 'woocommerce_is_purchasable', [ $this, 'hide_add_to_cart_button' ], 20, 2 );
        add_filter( 'woocommerce_get_price_html', [ $this, 'hide_product_price' ], 9, 2 );
    }

    /**
     * This method will hide add to cart button for products if enabled by vendor
     *
     * @since DOKAN_SINCE
     *
     * @param $purchasable bool
     * @param $product     \WC_Product
     *
     * @return bool
     */
    public function hide_add_to_cart_button( $purchasable, $product ) {
        // check if we already got false from other filters
        if ( false === $purchasable ) {
            return $purchasable;
        }

        // filter to use from other plugins
        $purchasable = apply_filters( 'dokan_catalog_mode_hide_add_to_cart_button', $purchasable, $product );
        if ( false === $purchasable ) {
            return $purchasable;
        }

        // check if enabled by product
        if ( Helper::is_enabled_for_product( $product ) ) {
            return false; // per product settings to hide add to cart button is enabled
        }

        // check if enabled by vendor global settings
        $vendor_id = dokan_get_vendor_by_product( $product, true );
        if ( Helper::is_enabled_by_vendor( $vendor_id ) ) {
            return false; // vendor global settings to hide add to cart button is enabled
        }

        // return provided value
        return $purchasable;
    }

    /**
     * This method will hide product price if enabled by vendor
     *
     * @since DOKAN_SINCE
     *
     * @param $price
     * @param $product
     *
     * @return string
     */
    public function hide_product_price( $price, $product ) {
        // for admin panel, we don't need to hide add to cart button
        if ( is_admin() ) {
            return $price;
        }

        // check if admin enabled this option
        if ( ! Helper::hide_product_price_option_is_enabled_by_admin() ) {
            return $price;
        }

        // filter to use from other plugins
        $price = apply_filters( 'dokan_catalog_mode_hide_product_price', $price, $product );
        if ( empty( $price ) ) {
            return $price;
        }

        // check if hide add to cart button is enabled by product
        $product_data = Helper::get_catalog_mode_data_by_product( $product );
        if ( 'on' === $product_data['hide_product_price'] ) {
            return ''; // per product settings to hide product price is enabled
        }

        // check if enabled by vendor global settings
        $vendor_id = dokan_get_vendor_by_product( $product, true );
        if ( Helper::hide_product_price_option_is_enabled_by_vendor( $vendor_id ) ) {
            return ''; // vendor global settings to hide product price is enabled
        }

        return $price;
    }
}
