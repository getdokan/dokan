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

        // Dokan's `.dokan-btn` outranks Astra's global button preset, so store and store listing pages ignore the theme's button styling.
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
     * Bridge Astra's global button presets onto Dokan store and store listing page buttons.
     *
     * Astra emits its Global > Buttons preset on `button` / `.button` / `input[type="submit"]`,
     * all of which Dokan's `.dokan-btn` rules outrank, so vendor store and store listing pages
     * silently ignore the theme's button geometry while every other page on the site honours it.
     *
     * @since 5.0.11
     *
     * @return void
     */
    public function inherit_theme_button_presets() {
        if ( ! dokan_is_store_page() && ! dokan_is_store_listing() ) {
            return;
        }

        if ( ! $this->has_astra_button_helpers() ) {
            return;
        }

        // Registered before the CSS bail-out so the admin's first-ever preset change already refreshes the preview.
        if ( is_customize_preview() ) {
            $this->sync_customizer_preview();
        }

        $css = $this->build_button_preset_css();

        if ( '' === $css ) {
            return;
        }

        wp_add_inline_style( 'dokan-style', $css );
    }

    /**
     * Check that every Astra helper the button bridge reads through is loaded.
     *
     * @since 5.0.11
     *
     * @return bool
     */
    protected function has_astra_button_helpers() {
        $helpers = [
            'astra_get_option',
            'astra_parse_css',
            'astra_responsive_spacing',
            'astra_responsive_font',
            'astra_get_font_extras',
            'astra_get_tablet_breakpoint',
            'astra_get_mobile_breakpoint',
        ];

        foreach ( $helpers as $helper ) {
            if ( ! function_exists( $helper ) ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Build the button preset CSS for every breakpoint Astra exposes.
     *
     * @since 5.0.11
     *
     * @return string
     */
    protected function build_button_preset_css() {
        $preset = [
            'padding'     => astra_get_option( 'theme-button-padding' ),
            'radius'      => astra_get_option( 'button-radius-fields' ),
            'font_size'   => astra_get_option( 'font-size-button' ),
            'font_extras' => astra_get_option( 'font-extras-button' ),
        ];

        // Desktop is the unscoped baseline; Astra gates the smaller devices behind a max-width.
        $breakpoints = [
            'desktop' => '',
            'tablet'  => absint( astra_get_tablet_breakpoint() ),
            'mobile'  => absint( astra_get_mobile_breakpoint() ),
        ];

        $selector = $this->get_button_selector();
        $css      = '';

        foreach ( $breakpoints as $device => $max_width ) {
            $css .= astra_parse_css( [ $selector => $this->get_button_properties( $preset, $device ) ], '', $max_width );
        }

        return $css;
    }

    /**
     * Map the CSS properties the bridge emits for a single device.
     *
     * Empty values are left in place for Astra to drop, so a preset the admin never
     * configured keeps falling through to Dokan's own styling instead of blanking it.
     *
     * @since 5.0.11
     *
     * @param array  $preset Astra button options keyed by the role they play here.
     * @param string $device One of `desktop`, `tablet` or `mobile`.
     *
     * @return array
     */
    protected function get_button_properties( array $preset, $device ) {
        // Astra's radius "sides" double as corners, clockwise from top-left.
        $box_model = [
            'padding-top'                => [ $preset['padding'], 'top' ],
            'padding-right'              => [ $preset['padding'], 'right' ],
            'padding-bottom'             => [ $preset['padding'], 'bottom' ],
            'padding-left'               => [ $preset['padding'], 'left' ],
            'border-top-left-radius'     => [ $preset['radius'], 'top' ],
            'border-top-right-radius'    => [ $preset['radius'], 'right' ],
            'border-bottom-right-radius' => [ $preset['radius'], 'bottom' ],
            'border-bottom-left-radius'  => [ $preset['radius'], 'left' ],
        ];

        $properties = [];

        foreach ( $box_model as $property => $source ) {
            $properties[ $property ] = $this->sanitize_css_length( astra_responsive_spacing( $source[0], $source[1], $device ) );
        }

        $properties['font-size'] = $this->sanitize_css_length( astra_responsive_font( $preset['font_size'], $device ), true );

        // Astra exposes a single, non-responsive line height for buttons.
        if ( 'desktop' === $device ) {
            $properties['line-height'] = $this->sanitize_css_length(
                astra_get_font_extras( $preset['font_extras'], 'line-height', 'line-height-unit' )
            );
        }

        return $properties;
    }

    /**
     * Selector list that carries the preset onto Dokan's buttons.
     *
     * @since 5.0.11
     *
     * @return string
     */
    protected function get_button_selector() {
        return implode(
            ',',
            [
                // `html body` assumes no wrapper markup, so modals iziModal moves to <body> and Elementor store canvases stay covered.
                'html body .dokan-btn:not(.dokan-btn-round)',
                // Listing cards pin their padding behind an ID rule, and half a preset reads worse than none.
                'html body #dokan-seller-listing-wrap .dokan-btn:not(.dokan-btn-round)',
            ]
        );
    }

    /**
     * Refresh the customizer preview whenever a bridged button setting changes.
     *
     * Astra live-previews its own buttons over postMessage, which never reloads the preview
     * frame, so the server-built bridge CSS would stay stale inside the customizer and store
     * page buttons would look out of sync exactly where the admin is configuring them.
     *
     * @since 5.0.11
     *
     * @return void
     */
    protected function sync_customizer_preview() {
        $settings = [
            'theme-button-padding',
            'button-radius-fields',
            'font-size-button',
            'font-extras-button',
        ];

        // A transport switch to 'refresh' would break Astra's instant preview everywhere else, so only this preview asks the pane to reload.
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
     * @since 5.0.11
     *
     * @param mixed $value              Raw value returned by an Astra helper.
     * @param bool  $allow_rem_fallback Astra folds a rem fallback into pixel font sizes (`16px;font-size:1.0666rem`).
     *
     * @return string
     */
    protected function sanitize_css_length( $value, bool $allow_rem_fallback = false ) {
        if ( ! is_scalar( $value ) ) {
            return '';
        }

        $value   = trim( (string) $value );
        $length  = '-?\d*\.?\d+(px|em|rem|%|vh|vw|pt)?';
        $pattern = '/^' . $length . ( $allow_rem_fallback ? '(;font-size:-?\d*\.?\d+rem)?' : '' ) . '$/';

        return preg_match( $pattern, $value ) ? $value : '';
    }
}
