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
    public function __construct() {
        add_filter( 'astra_page_layout', [ $this, 'remove_sidebar' ] );

        // Payment request button conflict issue fix
        add_action( 'wp_enqueue_scripts', [ $this, 'payment_request_button_style' ], 100 );

        // Dokan's `.dokan-btn` outranks Astra's global button preset, so store pages ignore the theme's button styling.
        add_action( 'wp_enqueue_scripts', [ $this, 'inherit_theme_button_presets' ], 100 );
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

    public function payment_request_button_style() {

        /*
         * For payment request button conflict with Astra theme
         * for simple and variable products in single product page.
         */
        if (
            dokan()->is_pro_exists()
            && dokan_pro()->module->is_active( 'stripe_express' )
            && defined( 'ASTRA_THEME_VERSION' )
            && is_checkout()
        ) {
            $style = '.woocommerce div.product.product-type-simple form.cart,
            .woocommerce div.product .woocommerce-variation-add-to-cart {
            display: unset !important;
            }';

            wp_add_inline_style( 'dokan-style', $style );
        }
    }

    /**
     * Bridge Astra's global button presets onto Dokan store page buttons.
     *
     * Astra emits its Global > Buttons preset on `button` / `.button` / `input[type="submit"]`,
     * all of which Dokan's `.dokan-btn` rules outrank, so vendor store pages silently ignore the
     * theme's button geometry while every other page on the site honours it.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function inherit_theme_button_presets() {
        if ( ! dokan_is_store_page() ) {
            return;
        }

        if (
            ! function_exists( 'astra_get_option' )
            || ! function_exists( 'astra_responsive_spacing' )
            || ! function_exists( 'astra_responsive_font' )
            || ! function_exists( 'astra_get_font_extras' )
            || ! function_exists( 'astra_get_tablet_breakpoint' )
            || ! function_exists( 'astra_get_mobile_breakpoint' )
        ) {
            return;
        }

        $padding   = astra_get_option( 'theme-button-padding' );
        $radius    = astra_get_option( 'button-radius-fields' );
        $font_size = astra_get_option( 'font-size-button' );

        // `html body` outranks every Dokan button rule without assuming wrapper markup, so modals iziModal moves to <body> and Elementor store canvases stay covered.
        $selector = 'html body .dokan-btn:not(.dokan-btn-round)';

        // Property table mirrors Astra's own emission: the radius "sides" double as corners, clockwise from top-left.
        $box_model = [
            'padding-top'                => [ $padding, 'top' ],
            'padding-right'              => [ $padding, 'right' ],
            'padding-bottom'             => [ $padding, 'bottom' ],
            'padding-left'               => [ $padding, 'left' ],
            'border-top-left-radius'     => [ $radius, 'top' ],
            'border-top-right-radius'    => [ $radius, 'right' ],
            'border-bottom-right-radius' => [ $radius, 'bottom' ],
            'border-bottom-left-radius'  => [ $radius, 'left' ],
        ];

        $breakpoints = [
            'desktop' => null,
            'tablet'  => absint( astra_get_tablet_breakpoint() ),
            'mobile'  => absint( astra_get_mobile_breakpoint() ),
        ];

        $css = '';

        foreach ( $breakpoints as $device => $max_width ) {
            $rules = '';

            foreach ( $box_model as $property => $source ) {
                $value = $this->sanitize_css_length( astra_responsive_spacing( $source[0], $source[1], $device ) );

                if ( '' !== $value ) {
                    $rules .= sprintf( '%s:%s;', $property, $value );
                }
            }

            $size = $this->sanitize_css_length( astra_responsive_font( $font_size, $device ), true );

            if ( '' !== $size ) {
                $rules .= sprintf( 'font-size:%s;', $size );
            }

            // Astra exposes a single, non-responsive line height for buttons.
            if ( 'desktop' === $device ) {
                $line_height = $this->sanitize_css_length(
                    astra_get_font_extras( astra_get_option( 'font-extras-button' ), 'line-height', 'line-height-unit' )
                );

                if ( '' !== $line_height ) {
                    $rules .= sprintf( 'line-height:%s;', $line_height );
                }
            }

            if ( '' === $rules ) {
                continue;
            }

            $rule = sprintf( '%s{%s}', $selector, $rules );
            $css .= null === $max_width ? $rule : sprintf( '@media (max-width:%dpx){%s}', $max_width, $rule );
        }

        if ( '' === $css ) {
            return;
        }

        wp_add_inline_style( 'dokan-style', $css );

        if ( is_customize_preview() ) {
            $this->sync_customizer_preview();
        }
    }

    /**
     * Refresh the customizer preview whenever a bridged button setting changes.
     *
     * Astra live-previews its own buttons over postMessage, which never reloads the preview
     * frame, so the server-built bridge CSS would stay stale inside the customizer and store
     * page buttons would look out of sync exactly where the admin is configuring them.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    private function sync_customizer_preview() {
        $settings = [
            'theme-button-padding',
            'button-radius-fields',
            'font-size-button',
            'font-extras-button',
        ];

        // A transport switch to 'refresh' would break Astra's instant preview on every other page, so only this store-page preview asks the pane to reload.
        $script = sprintf(
            "( function ( api ) {
                var timeout;

                var queueRefresh = function () {
                    clearTimeout( timeout );
                    timeout = setTimeout( function () {
                        api.preview.send( 'refresh' );
                    }, 400 );
                };

                api.bind( 'preview-ready', function () {
                    %s.forEach( function ( key ) {
                        api( 'astra-settings[' + key + ']', function ( setting ) {
                            setting.bind( queueRefresh );
                        } );
                    } );
                } );
            }( wp.customize ) );",
            wp_json_encode( $settings )
        );

        wp_add_inline_script( 'customize-preview', $script );
    }

    /**
     * Whitelist a CSS length value.
     *
     * Astra returns theme option data verbatim when it is not a well formed responsive array,
     * so nothing from the customizer is trusted before it reaches the style block.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $value              Raw value returned by an Astra helper.
     * @param bool  $allow_rem_fallback Astra folds a rem fallback into pixel font sizes (`16px;font-size:1.0666rem`).
     *
     * @return string
     */
    private function sanitize_css_length( $value, bool $allow_rem_fallback = false ) {
        if ( ! is_scalar( $value ) ) {
            return '';
        }

        $value   = trim( (string) $value );
        $length  = '-?\d*\.?\d+(px|em|rem|%|vh|vw|pt)?';
        $pattern = '/^' . $length . ( $allow_rem_fallback ? '(;font-size:-?\d*\.?\d+rem)?' : '' ) . '$/';

        return preg_match( $pattern, $value ) ? $value : '';
    }

}
