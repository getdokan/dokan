<?php

namespace WeDevs\Dokan\ThemeSupport;

/**
 * Divi Theme Support
 *
 * @see https://www.elegantthemes.com/gallery/divi/
 *
 * @since 3.0
 */
class Divi {

    /**
     * The constructor
     */
    function __construct() {
        add_action( 'template_redirect', [ $this, 'remove_sidebar'] );
        add_filter( 'body_class', [ $this, 'full_width_page'] );
        add_action( 'wp_enqueue_scripts', [ $this, 'style_reset' ] );
    }

    /**
     * Remove sidebar from store and dashboard page
     *
     * @return void
     */
    public function remove_sidebar() {
        if ( dokan_is_store_page() || dokan_is_seller_dashboard() ) {
            unregister_sidebar( 'sidebar-1' );
        }
    }

    /**
     * Reset style
     *
     * @return void
     */
    public function style_reset() {
        if ( ! dokan_is_store_page() && ! dokan_is_seller_dashboard() ) {
            return;
        }

        $style = '#left-area ul { padding: 0 !important;}';
        $style .= '.media-button-select { font-size: 15px !important; padding-top: 0 !important}';

        wp_add_inline_style( 'woocommerce-layout', $style );
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

            if ( ! in_array( 'et_full_width_page', $classes ) ) {
                $classes[] = 'et_full_width_page';
                $classes[] = 'et_no_sidebar';
            }
        }

        return $classes;
    }
}
