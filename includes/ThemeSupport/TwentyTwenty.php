<?php

namespace WeDevs\Dokan\ThemeSupport;

/**
 * Twenty Twenty Theme Support
 *
 * @since 3.1
 */
class TwentyTwenty {

    /**
     * The constructor
     */
    function __construct() {
        add_filter( 'body_class', [ $this, 'add_wc_class' ] );
    }

    /**
     * Makes the store page full width
     *
     * @param  array $classes
     *
     * @return array
     */
    public function add_wc_class( $classes ) {
        if ( dokan_is_store_page() ) {
            if ( ! in_array( 'woocommerce', $classes ) ) {
                $classes[] = 'woocommerce';
            }
        }

        return $classes;
    }
}
