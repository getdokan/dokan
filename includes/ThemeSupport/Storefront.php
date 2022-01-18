<?php

namespace WeDevs\Dokan\ThemeSupport;

/**
 * Storefront Theme Support
 *
 * @see https://woocommerce.com/storefront/
 *
 * @since 3.0
 */
class Storefront {

    /**
     * The constructor
     */
    function __construct() {
        add_action( 'woocommerce_after_main_content', [ $this, 'remove_sidebar' ], 5 );
        add_filter( 'body_class', [ $this, 'full_width_page' ] );
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
        $style = '';

        // Check if the current page is dokan vendor dashboard page
        if ( dokan_is_seller_dashboard() ) {
            // Styles to fix date range picker js broken layout issue
            $style .= '.daterangepicker .calendar-table td, .daterangepicker .calendar-table th { padding: 5px 10px; } .daterangepicker td.in-range { background-color: #ebf4f8 !important; } .daterangepicker td.active, .daterangepicker td.active:hover { background-color: #357ebd !important; }';
        }

        // Check if the current page is dokan store listing page.
        if ( dokan_is_store_listing() ) {
            $style .= '#dokan-seller-listing-wrap .store-content .store-data-container .store-data h2 a {text-decoration: none}';
            $style .= '#dokan-seller-listing-wrap .store-content .store-data-container .store-data h2 {font-size: 24px; margin: 20px 0 10px 0}';
        }

        $style .= '.woocommerce-noreviews::before, .woocommerce-info::before, .woocommerce-error::before {font-weight: 900;}';

        wp_add_inline_style( 'dokan-style', $style );
    }
}
