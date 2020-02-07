<?php

namespace WeDevs\Dokan\ThemeSupport;

/**
 * Rehub Theme Support
 *
 * @since 2.9.17
 */
class Rehub {
    /**
     * The constructor
     */
    public function __construct() {
        add_filter( 'dokan_load_hamburger_menu', [ $this, 'load_hamburger_menu'] );
        add_action( 'wp_enqueue_scripts', [ $this, 'set_content_type' ] );
    }

    /**
     * Remove hamburger menu
     *
     * @since 2.9.17
     *
     * @return boolean
     */
    public function load_hamburger_menu() {
        return false;
    }

    /**
     * Make store listing page full width
     *
     * @since  3.0.0
     *
     * @return void
     */
    public function set_content_type() {
        if ( ! dokan_is_store_listing() ) {
            return;
        }

        $style = '.dokan-single-seller .store-content .store-data p {margin: 0}';
        $style .= '.dokan-single-seller .store-content .store-data h2 {margin: 20px 0 15px 0}';

        wp_add_inline_style( 'dokan-style', $style );

        if ( 'full_width' !== get_post_meta( get_the_ID(), 'content_type', true ) ) {
            update_post_meta( get_the_ID(), 'content_type', 'full_width' );
        }
    }
}
