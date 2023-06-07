<?php

namespace WeDevs\Dokan\ThemeSupport;

/**
 * Enfold Theme Support
 *
 * @see https://themeforest.net/item/enfold-responsive-multipurpose-theme/4519990?ref=wedevs
 *
 * @since 2.9.30
 */
class Enfold {

    /**
     * The constructor
     */
    public function __construct() {
        add_filter( 'avia_layout_filter', [ $this, 'filter_layout_classes' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'store_listing_style' ], 100 );
        add_filter( 'avf_enqueue_wp_mediaelement', '__return_true' );
    }

    /**
     * Filter layout class
     *
     * @since  2.9.30
     *
     * @param  array $classes
     *
     * @return array
     */
    public function filter_layout_classes( $classes ) {
        if ( dokan_is_store_listing() && ! empty( $classes['current'] ) ) {
            $classes['current'] = [
				'content' => 'av-content-full alpha',
				'sidebar' => 'hidden',
				'meta' => '',
				'entry' => '',
				'main' => '',
			];
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

        add_filter( 'avf_sidebar_position', '__return_false' );

        $style = '.container .av-content-full.units {border: 0}';
        $style .= '.content .entry-content-wrapper {padding: 0}';
        $style .= '#dokan-seller-listing-wrap .store-banner a {position: unset !important}';
        $style .= '#dokan-store-listing-filter-wrap .right .item select {width: 130px; display: inline-block; color: #000; font-size: 14px; border-radius: 3px; padding: 11px 20px}';
        $style .= '#dokan-store-listing-filter-wrap .right .item form.sort-by.item {display: inline-block}';
        $style .= '#top label {font-weight: normal; font-size: 14px}';
        $style .= '.template-page .entry-content-wrapper h2 a {text-transform: capitalize !important}';
        $style .= '#dokan-seller-listing-wrap .dokan-single-seller .store-content .store-data-container .store-data {margin-top: 15px}';

        wp_add_inline_style( 'dokan-style', $style );
    }
}
