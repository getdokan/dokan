<?php

/**
 * Enfold Theme Support
 *
 * @see https://themeforest.net/item/enfold-responsive-multipurpose-theme/4519990?ref=wedevs
 *
 * @since 2.9.30
 */
class Dokan_Theme_Support_Enfold {

    /**
     * The constructor
     */
    function __construct() {
        add_filter( 'avf_sidebar_position', '__return_false' );
        add_filter( 'avia_layout_filter', [ $this, 'filter_layout_classes' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'store_listing_style' ], 100 );
        add_filter( 'avf_enqueue_wp_mediaelement', '__return_true' );
    }

    public function filter_layout_classes( $classes ) {
        if ( ! empty( $classes['current'] ) ) {
            $classes['current'] = [ 'content' => 'av-content-full alpha', 'sidebar' => 'hidden', 'meta' => '','entry' => '', 'main' => '' ];
        }

        return $classes;
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

        $style = '.container .av-content-full.units {border: 0}';
        $style .= '.content .entry-content-wrapper {padding: 0}';
        $style .= '#dokan-seller-listing-wrap .store-banner a {position: unset !important}';
        $style .= '#dokan-store-listing-filter-wrap .right .item select {width: 130px; display: inline-block; color: #000; font-size: 14px; border-radius: 3px; padding: 11px 20px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item form.sort-by.item {display: inline-block}';
        $style .= '#top form {margin-bottom: -15px}';
        $style .= '#top label {font-weight: normal; font-size: 14px}';
        $style .= '.template-page .entry-content-wrapper h2 a {text-transform: capitalize !important}';

        // responsive
        $style .= '@media (max-width: 414px) { #dokan-store-listing-filter-wrap .right .item .dokan-store-list-filter-button {margin: 0}';
        $style .= '#dokan-store-listing-filter-wrap .right {margin-top: 15px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item {font-size: 15px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item .dokan-icons{top: 20%}';
        $style .= '#dokan-store-listing-filter-wrap .right .item:not(:first-child) {padding-left: 30px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item #stores_orderby {padding: 11px 15px 10px 16px}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .item:not(.store-lists-category) label {width: 238px !important}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .store-ratings .stars {margin-left: -25px !important}';
        $style .= '#dokan-store-listing-filter-wrap .right .item #stores_orderby {width: 133px}';
        $style .= '}';

        $style .= '@media (max-width: 375px) { ';
        $style .= '#dokan-store-listing-filter-wrap .right .item {font-size: 14px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item:not(:first-child) {padding-left: 27px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item #stores_orderby {font-size: 13px; padding: 11px; width: 104px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item .sort-by.item label {font-size: 13px !important}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .item:not(.store-lists-category) label {width: 208px !important}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .store-ratings .stars {margin-left: -19px !important}';
        $style .= '}';

        $style .= '@media (max-width: 360px) { ';
        $style .= '#dokan-store-listing-filter-wrap .right .item:not(:first-child) {padding-left: 12px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item #stores_orderby {font-size: 13px; padding: 11px; width: 105px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item .sort-by.item label {font-size: 13px !important}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .item:not(.store-lists-category) label {width: 198px !important}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .store-ratings .stars {margin-left: -15px !important}';
        $style .= '}';

        $style .= '@media (max-width: 320px) { ';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .item:not(.store-lists-category) label {width: 166px !important}';
        $style .= '#dokan-store-listing-filter-form-wrap .store-lists-other-filter-wrap .store-ratings .stars {margin-left: -8px !important}';
        $style .= '}';

        wp_add_inline_style( 'dokan-style', $style );
        wp_dequeue_style( 'avia-woocommerce-css' );
        wp_enqueue_style( 'woocommerce-general', WC()->plugin_url() . '/assets/css/woocommerce.css', '', WC_VERSION, 'all' );
    }
}

return new Dokan_Theme_Support_Enfold();
