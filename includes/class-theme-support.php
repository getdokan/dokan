<?php

/**
 * Dokan Theme Support
 *
 * @since 3.0
 *
 * @package Dokan
 */
class Dokan_Theme_Support {

    /**
     * The currently active theme
     *
     * @var string
     */
    private $theme;

    /**
     * Constructor
     */
    public function __construct() {
        $this->theme = strtolower( get_template() );

        $this->include_support();
    }

    /**
     * Include supported theme compatibility
     *
     * @return void
     */
    private function include_support() {
        switch ( $this->theme ) {
            case 'storefront':
                require_once __DIR__ . '/theme-support/class-' . $this->theme . '.php';
                break;

            case 'flatsome':
                require_once __DIR__ . '/theme-support/class-' . $this->theme . '.php';
                break;

            case 'divi':
                require_once __DIR__ . '/theme-support/class-' . $this->theme . '.php';
                break;
        }
    }

}
