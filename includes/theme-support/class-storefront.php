<?php

/**
 * Storefront Theme Support
 *
 * @see https://woocommerce.com/storefront/
 *
 * @since 3.0
 */
class Dokan_Theme_Support_Storefront {

    /**
     * The constructor
     */
    function __construct() {
        add_action( 'storefront_page_after', [ $this, 'remove_sidebar'], 5 );
        add_filter( 'body_class', [ $this, 'full_width_page'] );
        add_action( 'wp_enqueue_scripts', [ $this, 'reset_style' ] );
    }

    /**
     * Remove sidebar from store and dashboard page
     *
     * @return void
     */
    public function remove_sidebar() {
        if ( dokan_is_store_page() || dokan_is_seller_dashboard() ) {
            remove_action( 'storefront_sidebar', 'storefront_get_sidebar', 10 );
        }
    }

    /**
     * Makes the store and dashboard page full width
     *
     * @param  array $classes
     *
     * @return array
     */
    public function full_width_page( $classes ) {

        if ( dokan_is_store_page() || dokan_is_seller_dashboard() ) {

            if ( ! in_array( 'page-template-template-fullwidth-php', $classes ) ) {
                $classes[] = 'page-template-template-fullwidth-php';
            }
        }

        return $classes;
    }

    /**
     * Reset style
     *
     * @since  DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function reset_style() {
        if ( ! dokan_is_store_listing() ) {
            return;
        }

        $style = '#dokan-seller-listing-wrap .store-content .store-data-container .store-data h2 a {text-decoration: none}';
        $style .= '#dokan-seller-listing-wrap .store-content .store-data-container .store-data h2 {font-size: 24px; margin: 20px 0 10px 0}';
        $style .= '#dokan-store-listing-filter-form-wrap:before {top: -74px; height: 0}';
        $style .= 'form.sort-by.item {margin-bottom: 0}';
        $style .= '#dokan-store-listing-filter-wrap .left .store-count {margin-bottom: 0}';
        $style .= '#dokan-seller-listing-wrap.list-view .dokan-seller-wrap .dokan-single-seller .store-wrapper .store-content .store-data-container .store-data .dokan-seller-rating[class] {font-size: 14px}';

        wp_add_inline_style( 'dokan-style', $style );
        wp_enqueue_style( 'woocommerce-general', WC()->plugin_url() . '/assets/css/woocommerce.css', array( '' ), false, 'all' );
    }
}

return new Dokan_Theme_Support_Storefront();
