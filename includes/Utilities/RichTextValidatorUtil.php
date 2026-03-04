<?php

namespace WeDevs\Dokan\Utilities;

class RichTextValidatorUtil {
    
    /**
     * Validate and clean rich text content.
     *
     * @since DOKAN_SINCE
     *
     * @param string $text The text to validate and clean.
     *
     * @return string Validated and cleaned text.
     */
    public static function validate_richtext_content( string $text ): string {
        $text = wp_strip_all_tags( $text );
        $text = html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
        $text = self::replace_richtext_chars( $text );
        
        /**
         * Filter for validating and cleaning rich text content.
         *
         * Allows external modification of the cleaned rich text content.
         *
         * @since DOKAN_SINCE
         *
         * @param string $text The cleaned text.
         */
        return apply_filters( 'dokan_validate_richtext_content', $text );
    }
    
    /**
     * Replace rich text special characters.
     *
     * @since DOKAN_SINCE
     *
     * @see Inspired by WPML's approach to Unicode and BOM character handling for rich text validation.
     *
     * @param string $text The text containing special characters.
     *
     * @return string Text with special characters replaced or removed.
     */
    protected static function replace_richtext_chars( string $text ): string {
        // Remove UTF-8 BOM.
		$text = preg_replace( '/^\xEF\xBB\xBF/', '', $text ) ?? '';

		// Remove UTF-16 BOM.
		$text = preg_replace( '/^(?:\xFE\xFF|\xFF\xFE)/', '', $text ) ?? '';

		// Replace non-breaking space with normal space.
		$text = str_replace( "\xC2\xA0", ' ', $text );

		// Remove control characters except \n and \t.
		$text = preg_replace( '/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/u', '', $text ) ?? '';

		return $text;
    }
}