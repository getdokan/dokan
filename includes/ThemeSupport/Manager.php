<?php

namespace WeDevs\Dokan\ThemeSupport;

/**
 * Dokan Theme Support
 *
 * @since 3.0
 *
 * @package Dokan
 */
class Manager {

    /**
     * Constructor
     */
    public function __construct() {
        $this->include_support();
    }

    /**
     * Include supported theme compatibility
     *
     * @return void
     */
    private function include_support() {
        $supported_themes = apply_filters( 'dokan_load_theme_support_files', [
            'storefront' => [
                'file'       => DOKAN_INC_DIR . '/ThemeSupport/Storefront.php',
                'class_name' => '\WeDevs\Dokan\ThemeSupport\Storefront',
            ],
            'flatsome'   => [
                'file'       => DOKAN_INC_DIR . '/ThemeSupport/Flatsome.php',
                'class_name' => '\WeDevs\Dokan\ThemeSupport\Flatsome',
            ],
            'divi'       => [
                'file'       => DOKAN_INC_DIR . '/ThemeSupport/Divi.php',
                'class_name' => '\WeDevs\Dokan\ThemeSupport\Divi',
            ],
            'rehub'      => [
                'file'       => DOKAN_INC_DIR . '/ThemeSupport/Rehub.php',
                'class_name' => '\WeDevs\Dokan\ThemeSupport\Rehub',
            ],
        ] );

        $theme = strtolower( get_template() );

        if ( array_key_exists( $theme , $supported_themes ) && file_exists( $supported_themes[ $theme ]['file'] ) ) {
            require_once $supported_themes[ $theme ]['file'];
            new $supported_themes[ $theme ]['class_name']();
        }
    }
}
