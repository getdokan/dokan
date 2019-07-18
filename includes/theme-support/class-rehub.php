<?php

/**
 * Rehub Theme Support
 *
 * @since 2.9.17
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
     * @since 2.9.17
     *
     * @return boolean
     */
    public function load_hamburger_menu() {
        return false;
    }
}

return new Dokan_Theme_Support_Rehub();