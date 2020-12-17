<?php

namespace WeDevs\Dokan\ThemeSupport;

/**
 * Astra Theme Support
 *
 * @since 3.1
 */
class Astra {

    /**
     * The constructor
     */
    function __construct() {
        add_filter( 'astra_page_layout', [ $this, 'remove_sidebar' ] );
    }

    /**
     * Remove sidebar from store and dashboard page
     *
     * @param string $layout
     *
     * @return string
     */
    public function remove_sidebar( $layout ) {
        if ( dokan_is_store_page() || dokan_is_seller_dashboard() ) {
            return 'no-sidebar';
        }

        return $layout;
    }
}
