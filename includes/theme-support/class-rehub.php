<?php

/**
 * Rehub Theme Support
 *
 * @since DOKAN_LITE_SINCE
 */
class Dokan_Theme_Support_Rehub {
    /**
     * The constructor
     */
    public function __construct() {
        add_filter( 'dokan_load_hamburger_menu', [ $this, 'load_hamburger_menu'] );
    }

    /**
     * Remove hamburger menu
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return boolean
     */
    public function load_hamburger_menu() {
        return false;
    }
}

return new Dokan_Theme_Support_Rehub();