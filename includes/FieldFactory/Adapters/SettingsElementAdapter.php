<?php
/**
 * Settings Element Adapter
 *
 * Converts FieldFactory elements to SettingsElement populate format for backward compatibility.
 *
 * @package WeDevs\Dokan\FieldFactory\Adapters
 * @since   4.0.0
 */

namespace WeDevs\Dokan\FieldFactory\Adapters;

use WeDevs\Dokan\FieldFactory\Contracts\ContainerInterface;
use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;
use WeDevs\Dokan\FieldFactory\Contracts\FieldInterface;

/**
 * Class SettingsElementAdapter
 */
class SettingsElementAdapter {
	/**
	 * Passthrough field data keys (FieldFactory -> SettingsElement).
	 *
	 * @var array<string, string>
	 */
	private const FIELD_DATA_KEY_MAP = [
		'placeholder' => 'placeholder',
		'disabled'    => 'disabled',
		'size'        => 'size',
	];

	/**
	 * Build hook_key hierarchically (matching SettingsElement pattern).
	 * Ignores default FieldFactory hook_key (dokan_field_*).
	 *
	 * @param array  $data             Element array data.
	 * @param string $id               Element id.
	 * @param string $parent_hook_key  Parent hook key.
	 *
	 * @return string
	 */
	private static function build_hook_key( array $data, string $id, string $parent_hook_key ): string {
		$existing_hook_key = $data['hook_key'] ?? '';

		$is_default_hook_key = false;
		if ( ! empty( $existing_hook_key ) && ! empty( $id ) ) {
			$is_default_hook_key = $existing_hook_key === ( 'dokan_field_' . $id );
		}

		return ( ! empty( $existing_hook_key ) && ! $is_default_hook_key )
			? $existing_hook_key
			: ( ! empty( $parent_hook_key ) ? $parent_hook_key . '_' . $id : $id );
	}

	/**
	 * Build dependency_key hierarchically using dot notation (e.g., "commission.admin_commission").
	 *
	 * @param array  $data                   Element array data.
	 * @param string $id                     Element id.
	 * @param string $parent_dependency_key  Parent dependency key.
	 *
	 * @return string
	 */
	private static function build_dependency_key( array $data, string $id, string $parent_dependency_key ): string {
		$existing_dependency_key = $data['dependency_key'] ?? '';

		return ! empty( $existing_dependency_key ) && $existing_dependency_key !== $id
			? $existing_dependency_key
			: ( ! empty( $parent_dependency_key ) ? $parent_dependency_key . '.' . $id : $id );
	}

	/**
	 * Normalize FieldFactory dependency definitions to legacy SettingsElement format.
	 *
	 * Legacy format example:
	 * [
	 *   'key' => 'commission.commission_type',
	 *   'value' => 'fixed',
	 *   'to_self' => true,
	 *   'attribute' => 'display',
	 *   'effect' => 'show',
	 *   'comparison' => '===',
	 *   'self' => 'commission.admin_commission',
	 * ]
	 *
	 * Newer/compact format (used in some FieldFactory configs):
	 * [
	 *   'field' => 'commission.commission_type',
	 *   'value' => 'fixed',
	 *   'operator' => '===',
	 * ]
	 *
	 * @param array  $dependencies   Raw dependencies from element->to_array().
	 * @param string $dependency_key Computed dependency key for this element.
	 *
	 * @return array Normalized dependencies array.
	 */
	private static function normalize_dependencies( array $dependencies, string $dependency_key ): array {
		if ( empty( $dependencies ) ) {
			return [];
		}

		$normalized = [];

		foreach ( $dependencies as $dependency ) {
			if ( ! is_array( $dependency ) ) {
				continue;
			}

			// Compact/new format: field/value/operator.
			if ( isset( $dependency['field'] ) || isset( $dependency['operator'] ) ) {
				$key      = $dependency['field'] ?? '';
				$value    = $dependency['value'] ?? '';
				$operator = $dependency['operator'] ?? '===';

				// Ensure both show/hide rules exist (matches SettingsElement usage).
				$normalized[] = [
					'key'        => $key,
					'value'      => $value,
					'to_self'    => true,
					'attribute'  => 'display',
					'effect'     => 'show',
					'comparison' => $operator,
					'self'       => $dependency_key,
				];

				// Add inverse hide rule when only one rule is provided.
				$inverse = $operator === '!==' ? '===' : '!==';
				$normalized[] = [
					'key'        => $key,
					'value'      => $value,
					'to_self'    => true,
					'attribute'  => 'display',
					'effect'     => 'hide',
					'comparison' => $inverse,
					'self'       => $dependency_key,
				];

				continue;
			}

			// Legacy format: keep as-is, but ensure `self` is present.
			if ( isset( $dependency['key'] ) ) {
				if ( empty( $dependency['self'] ) ) {
					$dependency['self'] = $dependency_key;
				}
				$normalized[] = $dependency;
			}
		}

		return $normalized;
	}

	/**
	 * Map FieldFactory field payload to SettingsElement format (variant-specific).
	 *
	 * @param FieldInterface $field            FieldFactory field element.
	 * @param array          $field_data       Field array (from to_array()).
	 * @param array          $settings_format  SettingsElement format (mutated).
	 *
	 * @return void
	 */
	private static function map_field_payload( FieldInterface $field, array $field_data, array &$settings_format ): void {
		$variant = $field->get_variant();

		$settings_format['variant'] = $variant;

		$raw_value   = $field->get_value();
		$raw_default = $field->get_default();

		self::coerce_field_value_and_default( $variant, $raw_value, $raw_default, $field_data, $settings_format );
		self::map_field_data_passthrough( $field_data, $settings_format );
		self::map_variant_extras( $variant, $raw_value, $field_data, $settings_format );
		self::map_field_options( $field, $settings_format );
		self::map_switch_states( $variant, $field_data, $settings_format );
	}

	/**
	 * Coerce SettingsElement value/default for specific variants (switch/toggle).
	 *
	 * @param string $variant
	 * @param mixed  $raw_value
	 * @param mixed  $raw_default
	 * @param array  $field_data
	 * @param array  $settings_format
	 *
	 * @return void
	 */
	private static function coerce_field_value_and_default( string $variant, $raw_value, $raw_default, array $field_data, array &$settings_format ): void {
		$has_enable_disable_states = isset( $field_data['enable_state'] ) || isset( $field_data['disable_state'] );

		if ( in_array( $variant, [ 'switch', 'toggle' ], true ) && $has_enable_disable_states ) {
			if ( is_bool( $raw_value ) ) {
				$enable_value  = $field_data['enable_state']['value'] ?? 'on';
				$disable_value = $field_data['disable_state']['value'] ?? 'off';
				$settings_format['value'] = $raw_value ? $enable_value : $disable_value;
			} else {
				$settings_format['value'] = $raw_value;
			}

			if ( is_bool( $raw_default ) ) {
				$enable_value  = $field_data['enable_state']['value'] ?? 'on';
				$disable_value = $field_data['disable_state']['value'] ?? 'off';
				$settings_format['default'] = $raw_default ? $enable_value : $disable_value;
			} else {
				$settings_format['default'] = $raw_default;
			}

			return;
		}

		if ( in_array( $variant, [ 'switch', 'toggle' ], true ) ) {
			$settings_format['value']   = is_bool( $raw_value ) ? ( $raw_value ? 'on' : 'off' ) : $raw_value;
			$settings_format['default'] = is_bool( $raw_default ) ? ( $raw_default ? 'on' : 'off' ) : $raw_default;
			return;
		}

		$settings_format['value']   = $raw_value;
		$settings_format['default'] = $raw_default;
	}

	/**
	 * Map basic field keys (passthrough) from FieldFactory to SettingsElement.
	 *
	 * @param array $field_data
	 * @param array $settings_format
	 *
	 * @return void
	 */
	private static function map_field_data_passthrough( array $field_data, array &$settings_format ): void {
		foreach ( self::FIELD_DATA_KEY_MAP as $from => $to ) {
			if ( isset( $field_data[ $from ] ) ) {
				$settings_format[ $to ] = $field_data[ $from ];
			}
		}
	}

	/**
	 * Map variant-specific extra keys.
	 *
	 * @param string $variant
	 * @param mixed  $raw_value
	 * @param array  $field_data
	 * @param array  $settings_format
	 *
	 * @return void
	 */
	private static function map_variant_extras( string $variant, $raw_value, array $field_data, array &$settings_format ): void {
		if ( 'combine_input' === $variant && is_array( $raw_value ) ) {
			if ( isset( $raw_value['additional_fee'] ) ) {
				$settings_format['additional_fee'] = $raw_value['additional_fee'];
			}
			if ( isset( $raw_value['admin_percentage'] ) ) {
				$settings_format['admin_percentage'] = $raw_value['admin_percentage'];
			}
		}

		if ( 'currency' === $variant && isset( $field_data['prefix'] ) ) {
			$settings_format['currency_symbol'] = $field_data['prefix'];
		}

		if ( 'category_based_commission' === $variant ) {
			if ( isset( $field_data['categories'] ) ) {
				$settings_format['categories'] = $field_data['categories'];
			}
			if ( isset( $field_data['reset_subcategory'] ) ) {
				$settings_format['reset_subcategory'] = $field_data['reset_subcategory'];
			}
		}
	}

	/**
	 * Map select/radio/checkbox options (elements) into SettingsElement options format.
	 *
	 * @param FieldInterface $field
	 * @param array          $settings_format
	 *
	 * @return void
	 */
	private static function map_field_options( FieldInterface $field, array &$settings_format ): void {
		$elements = $field->get_elements();
		if ( ! empty( $elements ) ) {
			$settings_format['options'] = array_map(
				static function ( $option ) {
					return [
						'value' => $option['value'] ?? '',
						'title' => $option['label'] ?? $option['title'] ?? '',
					];
				},
				$elements
			);
			return;
		}

		$settings_format['options'] = [];
	}

	/**
	 * Map switch/toggle enable_state/disable_state with label/title normalization.
	 *
	 * @param string $variant
	 * @param array  $field_data
	 * @param array  $settings_format
	 *
	 * @return void
	 */
	private static function map_switch_states( string $variant, array $field_data, array &$settings_format ): void {
		if ( ! in_array( $variant, [ 'switch', 'toggle' ], true ) ) {
			return;
		}

		if ( isset( $field_data['enable_state'] ) ) {
			$enable_state = $field_data['enable_state'];
			if ( is_array( $enable_state ) ) {
				if ( empty( $enable_state['label'] ) && isset( $enable_state['title'] ) ) {
					$enable_state['label'] = $enable_state['title'];
				}
				if ( empty( $enable_state['title'] ) && isset( $enable_state['label'] ) ) {
					$enable_state['title'] = $enable_state['label'];
				}
			}
			$settings_format['enable_state'] = $enable_state;
		}

		if ( isset( $field_data['disable_state'] ) ) {
			$disable_state = $field_data['disable_state'];
			if ( is_array( $disable_state ) ) {
				if ( empty( $disable_state['label'] ) && isset( $disable_state['title'] ) ) {
					$disable_state['label'] = $disable_state['title'];
				}
				if ( empty( $disable_state['title'] ) && isset( $disable_state['label'] ) ) {
					$disable_state['title'] = $disable_state['label'];
				}
			}
			$settings_format['disable_state'] = $disable_state;
		}
	}

	/**
	 * Map children recursively with hierarchical hook_key and dependency_key.
	 *
	 * @param ContainerInterface $container
	 * @param string             $hook_key
	 * @param string             $dependency_key
	 *
	 * @return array
	 */
	private static function map_children( ContainerInterface $container, string $hook_key, string $dependency_key ): array {
		return array_map(
			static function ( $child ) use ( $hook_key, $dependency_key ) {
				return self::to_settings_format( $child, $hook_key, $dependency_key );
			},
			$container->get_children()
		);
	}

	/**
	 * Convert FieldFactory element to SettingsElement populate format.
	 *
	 * @param ElementInterface $element FieldFactory element.
	 * @param string           $parent_hook_key Parent hook key for hierarchical building.
	 * @param string           $parent_dependency_key Parent dependency key for hierarchical building (dot notation).
	 *
	 * @return array SettingsElement populate format.
	 */
	public static function to_settings_format( ElementInterface $element, string $parent_hook_key = '', string $parent_dependency_key = '' ): array {
		$data = $element->to_array();
		$id   = $data['id'] ?? '';

		$hook_key       = self::build_hook_key( $data, $id, $parent_hook_key );
		$dependency_key = self::build_dependency_key( $data, $id, $parent_dependency_key );

		// Base structure matching SettingsElement::populate()
		$settings_format = [
			'id'             => $id,
			'type'           => $data['type'] ?? '',
			'title'          => $data['title'] ?? '',
			'icon'           => $data['icon'] ?? '',
			'tooltip'        => $data['tooltip'] ?? '',
			'display'        => true, // SettingsElement always sets display to true
			'hook_key'       => $hook_key,
			'children'       => [],
			'description'    => $data['description'] ?? '',
			'dependency_key' => $dependency_key,
			'dependencies'   => self::normalize_dependencies( $data['dependencies'] ?? [], $dependency_key ),
			'validations'    => $data['validations'] ?? [],
		];

		if ( $element instanceof FieldInterface ) {
			$field_data = $element->to_array();
			self::map_field_payload( $element, $field_data, $settings_format );
		}

		// Handle children recursively with hierarchical hook_key and dependency_key
		if ( $element instanceof ContainerInterface ) {
			$settings_format['children'] = self::map_children( $element, $hook_key, $dependency_key );
		}

		// Apply filter for backward compatibility
		return apply_filters(
			'dokan_settings_element_populate_' . $hook_key,
			$settings_format,
			$element
		);
	}

	/**
	 * Convert array of FieldFactory elements to SettingsElement format.
	 *
	 * @param ElementInterface[] $elements FieldFactory elements.
	 * @param string             $parent_hook_key Parent hook key for hierarchical building.
	 * @param string             $parent_dependency_key Parent dependency key for hierarchical building (dot notation).
	 *
	 * @return array Array of SettingsElement format.
	 */
	public static function to_settings_format_array( array $elements, string $parent_hook_key = '', string $parent_dependency_key = '' ): array {
		return array_map(
			static function ( $element ) use ( $parent_hook_key, $parent_dependency_key ) {
				return self::to_settings_format( $element, $parent_hook_key, $parent_dependency_key );
			},
			$elements
		);
	}
}
