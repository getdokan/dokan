<?php

namespace WeDevs\Dokan\Utilities;

/**
 * Utility class for cleaning and normalizing rich text content.
 *
 * @since 4.3.1
 */
class RichTextSanitizerUtil {

    /**
     * Sanitize and clean rich text content.
     *
     * Strips all HTML tags, decodes HTML entities, and removes special/invisible
     * characters such as BOMs, zero-width spaces, and control characters.
     *
     * @since 4.3.1
     *
     * @param string $text The text to sanitize and clean.
     *
     * @return string Sanitized and cleaned plain text.
     */
    public static function sanitize_richtext_content( string $text ): string {
        $text = wp_strip_all_tags( $text );
        $text = html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
        $text = self::replace_richtext_chars( $text );
        $text = trim( $text );

        /**
         * Filter for sanitizing and cleaning rich text content.
         *
         * Allows external modification of the cleaned rich text content.
         *
         * @since 4.3.1
         *
         * @param string $text The cleaned text.
         */
        return apply_filters( 'dokan_sanitize_richtext_content', $text );
    }

    /**
     * Replace rich text special characters.
     *
     * @since 4.3.1
     *
     * @see sitepress-multilingual-cms/vendor/wpml/wpml/src/Core/Component/WordsToTranslate/Domain/Calculator/PrepareContent/Rules/UnicodeTrait.php
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

        // Remove zero-width and invisible Unicode characters.
        $text = preg_replace( '/[\x{200B}\x{200C}\x{200D}\x{2060}\x{FEFF}]/u', '', $text ) ?? '';

        // Remove control characters except \t (\x09) and \n (\x0A).
        $text = preg_replace( '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text ) ?? '';

        return $text;
    }
}
