<?php
/**
 * Status Element Adapter
 *
 * Converts FieldFactory elements to StatusElement render format for backward compatibility.
 *
 * @package WeDevs\Dokan\FieldFactory\Adapters
 * @since   4.0.0
 */

namespace WeDevs\Dokan\FieldFactory\Adapters;

use WeDevs\Dokan\FieldFactory\Contracts\ContainerInterface;
use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;
use WeDevs\Dokan\FieldFactory\Elements\Fields\Paragraph;
use WeDevs\Dokan\FieldFactory\Elements\Tables\Table;

/**
 * Class StatusElementAdapter
 */
class StatusElementAdapter {

	/**
	 * Convert FieldFactory element to StatusElement render format.
	 *
	 * @param ElementInterface $element FieldFactory element.
	 * @param string           $parent_hook_key Parent hook key for hierarchical building.
	 *
	 * @return array StatusElement render format.
	 */
	public static function to_status_format( ElementInterface $element, string $parent_hook_key = 'dokan_status' ): array {
		$data = $element->to_array();
		$id   = $data['id'] ?? '';

		// Build hook_key hierarchically (matching StatusElement pattern)
		// Ignore default FieldFactory hook_key (dokan_field_*) and build hierarchically
		$existing_hook_key = $data['hook_key'] ?? '';

		// Check if it's a default FieldFactory hook_key pattern
		$is_default_hook_key = false;
		if ( ! empty( $existing_hook_key ) && ! empty( $id ) ) {
			$default_hook_key_pattern = 'dokan_field_' . $id;
			$is_default_hook_key = $existing_hook_key === $default_hook_key_pattern;
		}

		// Use existing hook_key only if it's not a default, otherwise build hierarchically
		$hook_key = ( ! empty( $existing_hook_key ) && ! $is_default_hook_key )
			? $existing_hook_key
			: ( $parent_hook_key . ( ! empty( $id ) ? '_' . $id : '' ) );

		// For paragraph elements, content goes in title, not data
		$title = $data['title'] ?? '';
		$paragraph_data = '';

		if ( $element instanceof Paragraph ) {
			// Paragraph: content goes in title (frontend uses RawHTML, so use raw content)
			$content = $element->get_content();
			if ( ! empty( $content ) ) {
				// Use content if available, otherwise fall back to title
				$title = $content;
			}
			$paragraph_data = '';
		} else {
			// Non-paragraph: data is empty (StatusElement default)
			$paragraph_data = '';
		}

		// Base structure matching StatusElement::render()
		$status_format = [
			'id'          => $id,
			'title'       => $title,
			'description' => $data['description'] ?? '',
			'icon'        => $data['icon'] ?? '',
			'type'        => $data['type'] ?? '',
			'data'        => $paragraph_data,
			'hook_key'    => $hook_key,
			'children'    => [],
		];

		// Handle children recursively with hierarchical hook_key
		if ( $element instanceof ContainerInterface ) {
			$status_format['children'] = array_map(
				function ( $child ) use ( $hook_key ) {
					return self::to_status_format( $child, $hook_key );
				},
				$element->get_children()
			);
		}

		// Add type-specific properties (headers for tables)
		if ( $element instanceof Table ) {
			$status_format['headers'] = $element->get_headers();
		}

		// Apply filter for backward compatibility
		return apply_filters(
			'dokan_status_element_render_' . $hook_key,
			$status_format,
			$element
		);
	}


	/**
	 * Convert array of FieldFactory elements to StatusElement format.
	 *
	 * @param ElementInterface[] $elements FieldFactory elements.
	 *
	 * @return array Array of StatusElement format.
	 */
	public static function to_status_format_array( array $elements ): array {
		return array_map(
			[ self::class, 'to_status_format' ],
			$elements
		);
	}
}
