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
}

return new Dokan_Theme_Support_Storefront();
