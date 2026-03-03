<?php
/**
 * Unicode cleaning helper trait.
 *
 * @since DOKAN_SINCE
 *
 * @package Dokan
 */

namespace WeDevs\Dokan\Traits;

trait UnicodeCleaner {

	/**
	 * Clean unicode related invisible characters from text.
	 *
	 * @param string $text Text to clean.
	 *
	 * @return string
	 */
	private function unicodeReplace( string $text ): string {

		// Decode HTML entities (e.g., &nbsp;).
		$text = html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );

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
