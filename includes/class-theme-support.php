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
        $this->theme = $this->format( strtolower( get_template() ) );
        $this->include_support();
    }

    /**
     * Format theme name. ( Remove `-theme` from the string )
     *
     * @since  2.9.30
     *
     * @param  string $string
     *
     * @return string
     */
    private function format( $string ) {
        if ( false !== strpos( $string, '-theme' ) ) {
            $string = substr( $string, 0, strlen( $string ) - 6 );
        }

        return $string;
    }

    /**
     * Include supported theme compatibility
     *
     * @return void
     */
    private function include_support() {
        $themes = apply_filters( 'dokan_load_theme_support_files', [
            'storefront',
            'flatsome',
            'divi',
            'rehub',
            'electro',
            'enfold'
        ] );

        return in_array( $this->theme, $themes ) ? $this->load_file( $this->theme ) : false;
    }

    /**
     * Load file classes
     *
     * @param string $file
     *
     * @since 2.9.17
     *
     * @return string|null on failure
     */
    private function load_file( $file ) {
        $file = __DIR__ . '/theme-support/class-' . $file . '.php';

        if ( ! file_exists( $file ) ) {
            return;
        }

        require_once $file;
    }
}
