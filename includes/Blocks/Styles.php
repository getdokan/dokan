<?php

namespace WeDevs\Dokan\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Sanitizers for the free-form style values store blocks accept from the editor.
 *
 * Block attributes are client-supplied, so an icon class or a colour typed into
 * the inspector is untrusted until it has been through here.
 *
 * @since DOKAN_SINCE
 */
class Styles {

    /**
     * Resolve an icon attribute to a class list.
     *
     * An empty value keeps today's icon, `none` removes it, and anything else is
     * a Font Awesome class list reduced to the characters a class name can hold.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed  $value         Attribute value.
     * @param string $default_class Class list rendered when the attribute is empty.
     *
     * @return string Class list, or an empty string for no icon.
     */
    public static function icon_class( $value, string $default_class ): string {
        // Hand-edited markup can hold arrays; anything but a scalar counts as unset.
        $value = is_scalar( $value ) ? trim( (string) $value ) : '';

        if ( '' === $value ) {
            return $default_class;
        }

        if ( 'none' === $value ) {
            return '';
        }

        $value = preg_replace( '/[^a-z0-9 _-]/i', '', $value );

        return trim( preg_replace( '/\s+/', ' ', (string) $value ) );
    }

    /**
     * Render an icon attribute as an `<i>` element.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed  $value         Attribute value.
     * @param string $default_class Class list rendered when the attribute is empty.
     * @param string $extra_class   Classes appended to whichever icon renders.
     *
     * @return string Escaped markup, or an empty string for no icon.
     */
    public static function icon( $value, string $default_class, string $extra_class = '' ): string {
        $class = self::icon_class( $value, $default_class );

        if ( '' === $class ) {
            return '';
        }

        return sprintf( '<i class="%s" aria-hidden="true"></i>', esc_attr( trim( $class . ' ' . $extra_class ) ) );
    }

    /**
     * Sanitize a CSS colour value.
     *
     * Accepts any colour syntax a picker or theme palette can produce, using only
     * characters that cannot leave the CSS declaration.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $value Attribute value.
     *
     * @return string The colour, or an empty string when it is not one.
     */
    public static function color( $value ): string {
        // Hand-edited markup can hold arrays; anything but a scalar counts as unset.
        $value = is_scalar( $value ) ? trim( (string) $value ) : '';

        if ( '' === $value ) {
            return '';
        }

        // Named colours, hex, colour functions and var(); no `;`, `:`, braces or quotes.
        if ( strlen( $value ) > 200 || ! preg_match( '/^[a-z0-9#%.,\s\/()+-]+$/i', $value ) ) {
            return '';
        }

        // Functions that load or run something are never a colour.
        if ( preg_match( '/url\(|image|expression/i', $value ) ) {
            return '';
        }

        return $value;
    }

    /**
     * Sanitize a CSS font size: a length, a theme preset variable or a fluid clamp().
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $value Attribute value.
     *
     * @return string The size, or an empty string when it is not one.
     */
    public static function font_size( $value ): string {
        // Hand-edited markup can hold arrays; anything but a scalar counts as unset.
        $value = is_scalar( $value ) ? trim( (string) $value ) : '';

        if ( preg_match( '/^\d+(\.\d+)?(px|em|rem|%|vw|vh|ch)$/i', $value ) ) {
            return $value;
        }

        // Presets and fluid sizes; same character rules as colours, minus `#`.
        if ( preg_match( '/^(var|clamp|min|max|calc)\([a-z0-9%.,\s\/()+*-]+\)$/i', $value ) && ! preg_match( '/url\(|image|expression/i', $value ) ) {
            return $value;
        }

        return '';
    }

    /**
     * Build an inline style string from CSS custom properties.
     *
     * Empty values are dropped so a setting left alone writes nothing.
     *
     * @since DOKAN_SINCE
     *
     * @param array<string, string> $properties Map of custom property name => value.
     *
     * @return string
     */
    public static function custom_properties( array $properties ): string {
        $style = '';

        foreach ( $properties as $name => $value ) {
            if ( '' === (string) $value ) {
                continue;
            }

            $style .= sprintf( '%s:%s;', $name, $value );
        }

        return $style;
    }


    /**
     * Pick a text override, falling back to the default when it is empty.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed  $value        Attribute value.
     * @param string $default_text Text rendered when the attribute is empty.
     *
     * @return string
     */
    public static function text( $value, string $default_text ): string {
        // Hand-edited markup can hold arrays; anything but a scalar counts as unset.
        $value = is_scalar( $value ) ? trim( (string) $value ) : '';

        return '' === $value ? $default_text : $value;
    }
}
