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
        $supported_themes = apply_filters(
            'dokan_load_theme_support_files', [
				'storefront'   => Storefront::class,
				'flatsome'     => Flatsome::class,
				'divi'         => Divi::class,
				'rehub'        => Rehub::class,
				'electro'      => Electro::class,
				'enfold'       => Enfold::class,
				'twentytwenty' => TwentyTwenty::class,
				'astra'        => Astra::class,
			]
        );

        $theme = $this->format( strtolower( get_template() ) );

        if ( array_key_exists( $theme, $supported_themes ) && class_exists( $supported_themes[ $theme ] ) ) {
            new $supported_themes[ $theme ]();
        }
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
}
