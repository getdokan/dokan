<?php

namespace WeDevs\Dokan\ThemeSupport;

/**
 * Electro Theme Support
 *
 * @see https://themeforest.net/item/electro-electronics-store-woocommerce-theme/15720624?ref=wedevs
 *
 * @since 2.9.30
 */
class Electro {

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

        $style = '#dokan-seller-listing-wrap .store-content .store-data-container .store-data {margin-top: 10px}';
        $style .= '#dokan-seller-listing-wrap .dokan-btn-theme.dokan-follow-store-button {border: 1px solid; padding: 7px 12px 7px 12px}';

        wp_add_inline_style( 'dokan-style', $style );
    }
}
