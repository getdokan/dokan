<?php

namespace WeDevs\Dokan\CatalogMode;

/**
 * Class Hooks
 *
 * This class will be responsible to include all the helper methods required for Catalog Mode feature.
 *
 * @since   3.6.4
 *
 * @package WeDevs\Dokan\CatalogMode
 */
class Helper {
    /**
     * Check if admin settings is enabled for catalog mode
     *
     * @since 3.6.4
     *
     * @return bool
     */
    public static function is_enabled_by_admin() {
        return static::hide_add_to_cart_button_option_is_enabled_by_admin();
    }

    /**
     * Check if hide price settings is enabled for admin
     *
     * @since 3.6.4
     *
     * @return bool
     */
    public static function hide_product_price_option_is_enabled_by_admin() {
        return 'on' === dokan_get_option( 'catalog_mode_hide_product_price', 'dokan_selling', 'off' );
    }

    /**
     * Check if hide add to cart settings is enabled for admin
     *
     * @since 3.6.4
     *
     * @return bool
     */
    public static function hide_add_to_cart_button_option_is_enabled_by_admin() {
        return 'on' === dokan_get_option( 'catalog_mode_hide_add_to_cart_button', 'dokan_selling', 'off' );
    }

    /**
     * Check if admin settings is enabled for catalog mode
     *
     * @since 3.6.4
     *
     * @return bool
     */
    public static function is_enabled_by_vendor( $vendor_id = 0 ) {
        if ( ! $vendor_id ) {
            $vendor_id = dokan_get_current_user_id();
        }

        return static::hide_add_to_cart_button_option_is_enabled_by_vendor( $vendor_id );
    }

    /**
     * Check if hide price settings is enabled for admin
     *
     * @since 3.6.4
     *
     * @return bool
     */
    public static function hide_product_price_option_is_enabled_by_vendor( $vendor_id = 0 ) {
        if ( ! $vendor_id ) {
            $vendor_id = dokan_get_current_user_id();
        }
        // get catalog mode settings for vendor
        $catalog_mode_data = static::get_vendor_catalog_mode_settings( $vendor_id );

        return 'on' === $catalog_mode_data['hide_product_price'];
    }

    /**
     * Check if hide add to cart settings is enabled for admin
     *
     * @since 3.6.4
     *
     * @return bool
     */
    public static function hide_add_to_cart_button_option_is_enabled_by_vendor( $vendor_id = 0 ) {
        if ( ! $vendor_id ) {
            $vendor_id = dokan_get_current_user_id();
        }
        // get catalog mode settings for vendor
        $catalog_mode_data = static::get_vendor_catalog_mode_settings( $vendor_id );

        return 'on' === $catalog_mode_data['hide_add_to_cart_button'];
    }

    /**
     * This method will return catalog mode saved settings data for a vendor
     *
     * @since 3.6.4
     *
     * @param int $vendor_id
     *
     * @return array
     */
    public static function get_vendor_catalog_mode_settings( $vendor_id = 0 ) {
        if ( ! $vendor_id ) {
            $vendor_id = dokan_get_current_user_id();
        }

        $defaults = static::get_defaults();

        $store_info = dokan_get_store_info( $vendor_id );

        return apply_filters(
            'dokan_catalog_mode_vendor_settings',
            isset( $store_info['catalog_mode'] ) ? $store_info['catalog_mode'] : $defaults,
            $vendor_id
        );
    }

    /**
     * This method will return default settings for catalog mode
     *
     * @since 3.6.4
     *
     * @return string[]
     */
    public static function get_defaults() {
        return apply_filters(
            'dokan_catalog_mode_default_vendor_settings', [
                'hide_add_to_cart_button' => 'off',
                'hide_product_price'      => 'off',
            ]
        );
    }

    /**
     * This method will check if catalog mode data is set for a product.
     *
     * @since 3.6.4
     *
     * @param $product int|\WC_Product
     *
     * @return bool
     */
    public static function is_enabled_for_product( $product ) {
        // get catalog mode data for product
        $catalog_mode_data = static::get_catalog_mode_data_by_product( $product );

        return 'on' === $catalog_mode_data['hide_add_to_cart_button'];
    }

    /**
     * This method will return catalog mode data for a product.
     *
     * @since 3.6.4
     *
     * @param $product int|\WC_Product
     *
     * @return string[]
     */
    public static function get_catalog_mode_data_by_product( $product ) {
        if ( ! is_a( $product, 'WC_Product' ) ) {
            $product = wc_get_product( $product );
        }

        // get default data
        $defaults = static::get_defaults();
        // return if no product is passed
        if ( ! is_a( $product, 'WC_Product' ) ) {
            return $defaults;
        }

        // get product id
        if ( 'variation' === $product->get_type() ) {
            $product_id = $product->get_parent_id();
        } else {
            $product_id = $product->get_id();
        }

        // check for saved values
        $catalog_mode_data = get_post_meta( $product_id, '_dokan_catalog_mode', true );
        $catalog_mode_data = is_array( $catalog_mode_data ) && ! empty( $catalog_mode_data ) ? $catalog_mode_data : $defaults;

        return $catalog_mode_data;
    }
}
