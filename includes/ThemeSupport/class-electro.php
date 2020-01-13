<?php

/**
 * Electro Theme Support
 *
 * @see https://themeforest.net/item/electro-electronics-store-woocommerce-theme/15720624?ref=wedevs
 *
 * @since 2.9.30
 */
class Dokan_Theme_Support_Electro {

    /**
     * The constructor
     */
    function __construct() {
        add_action( 'wp_enqueue_scripts', [ $this, 'store_listing_style' ], 100 );
    }

    /**
     * Reset store listing style
     *
     * @since 2.9.30
     *
     * @return void
     */
    public function store_listing_style() {
        if ( ! dokan_is_store_listing() ) {
            return;
        }

        $style = '#dokan-seller-listing-wrap .store-content .store-data-container .store-data h2 a {text-decoration: none}';
        $style .= '#dokan-store-listing-filter-wrap .left .store-count {margin-bottom: 0}';
        $style .= '#dokan-seller-listing-wrap .dokan-btn-theme.dokan-follow-store-button {border: 1px solid; padding: 7px 12px 7px 12px}';

        // responsive
        $style .= '@media (max-width: 414px) { #dokan-store-listing-filter-wrap .right .item .dokan-store-list-filter-button {margin: 0}';
        $style .= '#dokan-store-listing-filter-wrap .right {margin-top: 15px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item {font-size: 15px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item #stores_orderby {padding: 8px 9px 8px 9px}';
        $style .= '#dokan-store-listing-filter-form-wrap .apply-filter #cancel-filter-btn {border: 1px solid #ccc !important}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .store-ratings .stars a {padding: 0 !important}';
        $style .= '}';

        $style .= '@media (max-width: 375px) { ';
        $style .= '#dokan-store-listing-filter-wrap .right .item:not(:first-child) { padding-left: 6px}';
        $style .= '}';

        wp_add_inline_style( 'dokan-style', $style );
        wp_enqueue_style( 'woocommerce-general', WC()->plugin_url() . '/assets/css/woocommerce.css', '', WC_VERSION, 'all' );
    }
}

return new Dokan_Theme_Support_Electro();
