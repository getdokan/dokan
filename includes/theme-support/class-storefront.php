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
     * @since  2.9.30
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

        // responsive
        $style .= '@media (max-width: 414px) { #dokan-store-listing-filter-wrap .right .item .dokan-store-list-filter-button {margin: 0}';
        $style .= '#dokan-store-listing-filter-wrap .right {margin-top: 15px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item {font-size: 15px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item #stores_orderby {padding: 8px 15px 8px 16px}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .item:not(.store-lists-category) label {width: 252px !important}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .store-ratings .stars {margin-left: -5px !important}';
        $style .= '}';

        $style .= '@media (max-width: 375px) { ';
        $style .= '#dokan-store-listing-filter-wrap .right .item {font-size: 14px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item:not(:first-child) {padding-left: 27px}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .item:not(.store-lists-category) label {width: 217px !important}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .store-ratings .stars {margin-left: -5px !important}';
        $style .= '}';

        $style .= '@media (max-width: 360px) { ';
        $style .= '#dokan-store-listing-filter-wrap .right .item:not(:first-child) {padding-left: 12px}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .item:not(.store-lists-category) label {width: 204px !important}';
        $style .= '}';

        $style .= '@media (max-width: 320px) { ';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .item:not(.store-lists-category) label {width: 168px !important}';
        $style .= '}';

        wp_add_inline_style( 'dokan-style', $style );
        wp_enqueue_style( 'woocommerce-general', WC()->plugin_url() . '/assets/css/woocommerce.css', '', WC_VERSION, 'all' );
    }
}

return new Dokan_Theme_Support_Storefront();
