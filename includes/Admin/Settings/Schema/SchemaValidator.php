<?php

namespace WeDevs\Dokan\Admin\Settings\Schema;

/**
 * Validates the flat array admin settings schema for correctness.
 *
 * This validator ensures that every element in the schema has the correct structure,
 * valid parent references, and can trace a path back to a root page element.
 *
 * ## Validation Checks
 *
 * 1. **Required properties** — Each element type must have its mandatory keys
 *    (e.g., pages need `id`, `type`, `title`; fields need `id`, `type`, `variant`).
 * 2. **Parent reference integrity** — Every parent pointer (e.g., `page_id`, `section_id`)
 *    must reference an existing element of the correct type.
 * 3. **Parent requirement** — Non-root elements (section, fieldgroup, field, etc.) must
 *    have at least one parent pointer to connect them to the hierarchy.
 * 4. **Reachability** — Every element must trace a parent chain back to a `page` element.
 *    Detects orphaned elements and circular references.
 * 5. **Duplicate IDs** — Warns when the same type+id+parent combination appears more than once.
 * 6. **Variant validation** — Field elements must use a known variant string.
 *
 * ## Extensibility
 *
 * All validation rules are extensible via WordPress filters so that Pro, modules,
 * and third-party plugins can register custom element types, parent pointers, and variants
 * without triggering false validation errors.
 *
 * ### Filters
 *
 * - `dokan_admin_settings_schema_required_properties` — Add/modify required properties per element type.
 *   Receives `array<string, string[]>` mapping type => required property keys.
 *
 * - `dokan_admin_settings_schema_parent_pointer_map` — Add/modify parent pointer key → type mappings.
 *   Receives `array<string, string>` mapping pointer key (e.g., `page_id`) => parent element type.
 *
 * - `dokan_admin_settings_schema_types_requiring_parent` — Add/modify which element types must
 *   have at least one parent pointer. Receives `string[]` of type names.
 *
 * - `dokan_admin_settings_known_variants` — Register custom field variants.
 *   Receives `string[]` of known variant strings.
 *
 * - `dokan_admin_settings_schema_skip_validation` — Return `true` to bypass all validation.
 *   Receives `bool` and `array` of elements.
 *
 * - `dokan_admin_settings_schema_validation_result` — Modify the final validation result.
 *   Receives `array{errors: array, warnings: array}` and the elements array.
 *
 * ### Actions
 *
 * - `dokan_admin_settings_schema_before_validate` — Fired before validation starts.
 *   Receives the elements array and the `SchemaValidator` instance (use `add_error()`/`add_warning()`).
 *
 * - `dokan_admin_settings_schema_after_validate` — Fired after all checks complete.
 *   Receives the result array, elements array, and the `SchemaValidator` instance.
 *
 * ### Constants
 *
 * - `DOKAN_DISABLE_SCHEMA_VALIDATION` — Define as `true` to disable validation entirely (production kill switch).
 *
 * ## Usage
 *
 * ```php
 * $validator = new SchemaValidator();
 * $result    = $validator->validate( $schema_elements );
 *
 * if ( ! SchemaValidator::is_valid( $result ) ) {
 *     foreach ( $result['errors'] as $error ) {
 *         error_log( 'Dokan schema error: ' . $error );
 *     }
 * }
 * ```
 *
 * @since DOKAN_SINCE
 */
class SchemaValidator {

    /**
     * Default element types and their required properties.
     *
     * Each key is an element type string, and the value is an array of property
     * keys that MUST be present and non-empty on elements of that type.
     *
     * Note: For types that accept multiple possible parent pointers (e.g., `section`
     * can have `subpage_id` or `tab_id`), the parent check is handled separately
     * by `check_parent_requirements()` rather than listing a specific pointer here.
     *
     * @var array<string, string[]>
     */
    private const DEFAULT_REQUIRED_PROPERTIES = [
        'page'        => [ 'id', 'type', 'title' ],
        'subpage'     => [ 'id', 'type', 'page_id' ],
        'section'     => [ 'id', 'type' ],
        'tab'         => [ 'id', 'type' ],
        'subsection'  => [ 'id', 'type' ],
        'fieldgroup'  => [ 'id', 'type' ],
        'field'       => [ 'id', 'type', 'variant' ],
    ];

    /**
     * Default element types that must have at least one parent pointer.
     *
     * These types cannot be root elements — they must be connected to the hierarchy
     * via any parent pointer key from the parent pointer map. The validator does NOT
     * restrict which specific container type is valid; any parent pointer satisfies
     * the requirement, allowing flexible nesting.
     *
     * `page` is excluded because it IS the root element.
     * `subpage` already requires `page_id` via DEFAULT_REQUIRED_PROPERTIES.
     *
     * @var string[]
     */
    private const DEFAULT_TYPES_REQUIRING_PARENT = [
        'section',
        'tab',
        'subsection',
        'fieldgroup',
        'field',
    ];

    /**
     * Default parent pointer keys and the element type they reference.
     *
     * Maps each pointer key (e.g., `page_id`) to the type of element it must
     * point to (e.g., `page`). Used for:
     * - Validating that referenced parent elements exist.
     * - Determining all valid parent pointer keys for parent requirement checks.
     * - Walking the parent chain for reachability checks.
     *
     * @var array<string, string>
     */
    private const DEFAULT_PARENT_POINTER_MAP = [
        'page_id'        => 'page',
        'subpage_id'     => 'subpage',
        'tab_id'         => 'tab',
        'section_id'     => 'section',
        'subsection_id'  => 'subsection',
        'field_group_id' => 'fieldgroup',
    ];

    /**
     * Default known field variants shipped with Dokan Lite.
     *
     * This list is used to warn about unrecognized variant strings. Pro and
     * third-party plugins should register their custom variants via the
     * `dokan_admin_settings_known_variants` filter rather than modifying this list.
     *
     * @var string[]
     */
    private const DEFAULT_KNOWN_VARIANTS = [
        'text',
        'number',
        'checkbox',
        'select',
        'refresh_select',
        'radio',
        'tel',
        'password',
        'radio_box',
        'switch',
        'multicheck',
        'currency',
        'combine_input',
        'category_based_commission',
        'radio_capsule',
        'info',
        'double_input',
        'base_field_label',
        'customize_radio',
        'html',
        'notice',
        'repeater',
        'rich_text',
        'show_hide',
        'select_color_picker',
        'copy_field',
        'file_upload',
        'vendor_info_preview',
        'single_product_preview',
        'textarea',
        'withdraw_schedule',
    ];

    /**
     * Collected validation errors (hard failures).
     *
     * @var string[]
     */
    private array $errors = [];

    /**
     * Collected validation warnings (non-blocking issues).
     *
     * @var string[]
     */
    private array $warnings = [];

    /**
     * Validate the settings schema and return any errors or warnings.
     *
     * Runs all validation checks in sequence: required properties, parent references,
     * parent requirements, reachability, duplicate IDs, and variant validation.
     *
     * Can be bypassed via the `DOKAN_DISABLE_SCHEMA_VALIDATION` constant or
     * the `dokan_admin_settings_schema_skip_validation` filter.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of settings schema elements.
     *
     * @return array{errors: string[], warnings: string[]} Validation result.
     */
    public function validate( array $elements ): array {
        // Skip validation if disabled via constant.
        if ( defined( 'DOKAN_DISABLE_SCHEMA_VALIDATION' ) && DOKAN_DISABLE_SCHEMA_VALIDATION ) {
            return [ 'errors' => [], 'warnings' => [] ];
        }

        /**
         * Allows skipping schema validation entirely.
         *
         * Return `true` to bypass all validation checks. Useful for performance
         * in production or when a plugin needs to temporarily disable validation.
         *
         * @since DOKAN_SINCE
         *
         * @param bool  $skip     Whether to skip validation. Default false.
         * @param array $elements The schema elements about to be validated.
         */
        if ( apply_filters( 'dokan_admin_settings_schema_skip_validation', false, $elements ) ) {
            return [ 'errors' => [], 'warnings' => [] ];
        }

        $this->errors   = [];
        $this->warnings = [];

        /**
         * Fired before schema validation begins.
         *
         * Use this to run custom pre-validation checks. The validator instance
         * is passed so you can call `$validator->add_error()` or `$validator->add_warning()`.
         *
         * @since DOKAN_SINCE
         *
         * @param array          $elements  The schema elements being validated.
         * @param SchemaValidator $validator The validator instance.
         */
        do_action( 'dokan_admin_settings_schema_before_validate', $elements, $this );

        $this->check_required_properties( $elements );
        $this->check_parent_references( $elements );
        $this->check_parent_requirements( $elements );
        $this->check_reachability( $elements );
        $this->check_duplicate_ids( $elements );
        $this->check_variants( $elements );
        $this->check_unique_field_ids( $elements );

        $result = [
            'errors'   => $this->errors,
            'warnings' => $this->warnings,
        ];

        /**
         * Fired after all schema validation checks complete.
         *
         * Use this to run custom post-validation logic or logging.
         *
         * @since DOKAN_SINCE
         *
         * @param array          $result    Validation result with 'errors' and 'warnings' arrays.
         * @param array          $elements  The schema elements that were validated.
         * @param SchemaValidator $validator The validator instance.
         */
        do_action( 'dokan_admin_settings_schema_after_validate', $result, $elements, $this );

        /**
         * Filters the final validation result before it is returned.
         *
         * Third parties can suppress specific errors/warnings or add their own.
         *
         * @since DOKAN_SINCE
         *
         * @param array{errors: string[], warnings: string[]} $result   The validation result.
         * @param array                                       $elements The schema elements that were validated.
         */
        return apply_filters( 'dokan_admin_settings_schema_validation_result', $result, $elements );
    }

    /**
     * Get the required properties map, filtered for extensibility.
     *
     * Third parties can add new element types or modify which properties
     * are required for existing types.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, string[]> Map of element type => required property keys.
     */
    private function get_required_properties(): array {
        /**
         * Filters the required properties per element type.
         *
         * Add custom element types or modify required properties for existing types.
         *
         * Example — adding a custom 'widget' type:
         * ```php
         * add_filter( 'dokan_admin_settings_schema_required_properties', function ( $props ) {
         *     $props['widget'] = [ 'id', 'type', 'widget_type', 'section_id' ];
         *     return $props;
         * } );
         * ```
         *
         * @since DOKAN_SINCE
         *
         * @param array<string, string[]> $properties Map of type => required property keys.
         */
        return apply_filters( 'dokan_admin_settings_schema_required_properties', self::DEFAULT_REQUIRED_PROPERTIES );
    }

    /**
     * Get the parent pointer map, filtered for extensibility.
     *
     * Defines which pointer keys (e.g., `page_id`) reference which element types (e.g., `page`).
     * This map is used across multiple validation checks.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, string> Map of pointer key => expected parent element type.
     */
    private function get_parent_pointer_map(): array {
        /**
         * Filters the parent pointer key → expected parent type map.
         *
         * Add custom parent pointer relationships for custom element types.
         *
         * Example — adding a custom container type:
         * ```php
         * add_filter( 'dokan_admin_settings_schema_parent_pointer_map', function ( $map ) {
         *     $map['widget_group_id'] = 'widget_group';
         *     return $map;
         * } );
         * ```
         *
         * @since DOKAN_SINCE
         *
         * @param array<string, string> $map Pointer key => expected parent element type.
         */
        return apply_filters( 'dokan_admin_settings_schema_parent_pointer_map', self::DEFAULT_PARENT_POINTER_MAP );
    }

    /**
     * Get the element types that require at least one parent pointer.
     *
     * Any key from the parent pointer map satisfies the requirement.
     * The validator does NOT restrict which specific container type is valid
     * for which child type — allowing flexible nesting.
     *
     * @since DOKAN_SINCE
     *
     * @return string[] Element type strings that must have a parent pointer.
     */
    private function get_types_requiring_parent(): array {
        /**
         * Filters which element types must have at least one parent pointer.
         *
         * Example — adding a custom type that requires a parent:
         * ```php
         * add_filter( 'dokan_admin_settings_schema_types_requiring_parent', function ( $types ) {
         *     $types[] = 'widget';
         *     return $types;
         * } );
         * ```
         *
         * @since DOKAN_SINCE
         *
         * @param string[] $types Element type names that require at least one parent pointer.
         */
        return apply_filters( 'dokan_admin_settings_schema_types_requiring_parent', self::DEFAULT_TYPES_REQUIRING_PARENT );
    }

    /**
     * Check that each element has all required properties for its type.
     *
     * Iterates every element and verifies that all properties listed in the
     * required properties map are present and non-empty. Elements with an
     * unrecognized type generate a warning suggesting filter registration.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     */
    private function check_required_properties( array $elements ): void {
        $required_properties = $this->get_required_properties();

        foreach ( $elements as $index => $element ) {
            if ( ! isset( $element['type'] ) ) {
                $this->errors[] = sprintf(
                    'Element at index %d is missing required "type" property.',
                    $index
                );
                continue;
            }

            $type = $element['type'];

            if ( ! isset( $required_properties[ $type ] ) ) {
                $this->warnings[] = sprintf(
                    'Element "%s" has unknown type "%s". Register it via dokan_admin_settings_schema_required_properties filter.',
                    $element['id'] ?? "(index {$index})",
                    $type
                );
                continue;
            }

            foreach ( $required_properties[ $type ] as $prop ) {
                if ( ! isset( $element[ $prop ] ) || ( is_string( $element[ $prop ] ) && '' === $element[ $prop ] ) ) {
                    $this->errors[] = sprintf(
                        'Element "%s" (type: %s) is missing required property "%s".',
                        $element['id'] ?? "(index {$index})",
                        $type,
                        $prop
                    );
                }
            }
        }
    }

    /**
     * Check that all parent pointer values reference existing elements of the correct type.
     *
     * For every parent pointer key found on an element (e.g., `page_id`, `section_id`),
     * verifies that an element of the expected type exists with that ID.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     */
    private function check_parent_references( array $elements ): void {
        $parent_pointer_map = $this->get_parent_pointer_map();

        // Build index: type => { id => true }.
        $ids_by_type = [];
        foreach ( $elements as $element ) {
            if ( isset( $element['id'], $element['type'] ) ) {
                $ids_by_type[ $element['type'] ][ $element['id'] ] = true;
            }
        }

        foreach ( $elements as $element ) {
            foreach ( $parent_pointer_map as $pointer_key => $expected_parent_type ) {
                if ( ! isset( $element[ $pointer_key ] ) ) {
                    continue;
                }

                $parent_id = $element[ $pointer_key ];

                if ( ! isset( $ids_by_type[ $expected_parent_type ][ $parent_id ] ) ) {
                    $this->errors[] = sprintf(
                        'Element "%s" references %s="%s" but no %s with that ID exists.',
                        $element['id'] ?? '(unknown)',
                        $pointer_key,
                        $parent_id,
                        $expected_parent_type
                    );
                }
            }
        }
    }

    /**
     * Check that non-root elements have at least one parent pointer.
     *
     * Uses all keys from the parent pointer map as valid parent pointers.
     * Does not restrict which container type is valid for which child type,
     * allowing flexible nesting (e.g., a section inside a subpage, tab, or any container).
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     */
    private function check_parent_requirements( array $elements ): void {
        $types_requiring_parent = $this->get_types_requiring_parent();
        $all_parent_keys        = array_keys( $this->get_parent_pointer_map() );

        foreach ( $elements as $element ) {
            $type = $element['type'] ?? '';

            if ( ! in_array( $type, $types_requiring_parent, true ) ) {
                continue;
            }

            $has_parent = false;

            foreach ( $all_parent_keys as $key ) {
                if ( ! empty( $element[ $key ] ) ) {
                    $has_parent = true;
                    break;
                }
            }

            if ( ! $has_parent ) {
                $this->errors[] = sprintf(
                    '%s "%s" has no parent pointer. Requires at least one of: %s.',
                    ucfirst( $type ),
                    $element['id'] ?? '(unknown)',
                    implode( ', ', $all_parent_keys )
                );
            }
        }
    }

    /**
     * Check that every non-page element can trace a parent chain back to a page.
     *
     * Walks up the parent pointer chain for each element, following pointer keys
     * to their parent elements, until it either reaches a `page` element (success)
     * or runs out of parents (warning). Also detects circular reference chains.
     *
     * This ensures no element is "orphaned" — every element is reachable from
     * a root page and will appear in the rendered settings UI.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     */
    private function check_reachability( array $elements ): void {
        $parent_pointer_map = $this->get_parent_pointer_map();

        // Build lookup: "type:id" => element array.
        $lookup = [];
        foreach ( $elements as $element ) {
            if ( isset( $element['id'], $element['type'] ) ) {
                $lookup[ $element['type'] . ':' . $element['id'] ] = $element;
            }
        }

        foreach ( $elements as $element ) {
            $type = $element['type'] ?? '';

            // Pages are root elements — no reachability check needed.
            if ( 'page' === $type ) {
                continue;
            }

            // Walk up the parent chain toward a page.
            $current   = $element;
            $visited   = [];
            $reachable = false;
            $max_depth = 10; // Safety limit to prevent infinite loops.

            for ( $i = 0; $i < $max_depth; $i++ ) {
                $found_parent = false;

                foreach ( $parent_pointer_map as $pointer_key => $parent_type ) {
                    if ( empty( $current[ $pointer_key ] ) ) {
                        continue;
                    }

                    $parent_id  = $current[ $pointer_key ];
                    $parent_key = $parent_type . ':' . $parent_id;

                    // Detect circular references.
                    if ( isset( $visited[ $parent_key ] ) ) {
                        $this->errors[] = sprintf(
                            '%s "%s" has a circular parent reference chain.',
                            ucfirst( $element['type'] ?? 'element' ),
                            $element['id'] ?? '(unknown)'
                        );
                        $found_parent = true;
                        $reachable    = true; // Stop checking; error already reported.
                        break;
                    }

                    $visited[ $parent_key ] = true;

                    // Reached a page — chain is valid.
                    if ( 'page' === $parent_type ) {
                        $reachable    = true;
                        $found_parent = true;
                        break;
                    }

                    // Continue walking up if parent element exists.
                    if ( isset( $lookup[ $parent_key ] ) ) {
                        $current      = $lookup[ $parent_key ];
                        $found_parent = true;
                        break;
                    }

                    // Parent element doesn't exist — already reported by check_parent_references.
                    $found_parent = true;
                    $reachable    = true; // Don't double-report.
                    break;
                }

                if ( $reachable || ! $found_parent ) {
                    break;
                }
            }

            if ( ! $reachable && ! empty( $element['id'] ) ) {
                $this->warnings[] = sprintf(
                    '%s "%s" cannot trace a parent chain back to a page element.',
                    ucfirst( $type ),
                    $element['id']
                );
            }
        }
    }

    /**
     * Check for duplicate element IDs within the same scope.
     *
     * Scope is determined by type + id for structural elements, and
     * type + id + parent pointer for fields (since the same field ID
     * can legitimately exist in different sections, e.g., "enabled"
     * in both reverse_withdrawal and email-verification).
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     */
    private function check_duplicate_ids( array $elements ): void {
        $seen = [];

        foreach ( $elements as $element ) {
            if ( ! isset( $element['id'], $element['type'] ) ) {
                continue;
            }

            $key = $element['type'] . ':' . $element['id'];

            // For fields, include parent pointer to scope the uniqueness check.
            if ( 'field' === $element['type'] ) {
                $parent = $element['section_id']
                    ?? $element['subsection_id']
                    ?? $element['field_group_id']
                    ?? $element['subpage_id']
                    ?? 'root';
                $key .= ':' . $parent;
            }

            if ( isset( $seen[ $key ] ) ) {
                $this->warnings[] = sprintf(
                    'Duplicate ID detected: "%s" (type: %s) appears more than once in the same scope.',
                    $element['id'],
                    $element['type']
                );
            }

            $seen[ $key ] = true;
        }
    }

    /**
     * Check that all field elements use a recognized variant string.
     *
     * Unknown variants generate a warning (not an error) since they may be
     * registered by Pro or third-party plugins that load after Lite.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     */
    private function check_variants( array $elements ): void {
        /**
         * Filters the list of recognized field variant strings.
         *
         * Pro and third-party plugins should add their custom variants
         * to avoid validation warnings.
         *
         * Example:
         * ```php
         * add_filter( 'dokan_admin_settings_known_variants', function ( $variants ) {
         *     $variants[] = 'menu_manager';
         *     $variants[] = 'delivery_days';
         *     $variants[] = 'color_customizer';
         *     $variants[] = 'verification_methods';
         *     return $variants;
         * } );
         * ```
         *
         * @since DOKAN_SINCE
         *
         * @param string[] $variants List of known variant strings.
         */
        $known = apply_filters( 'dokan_admin_settings_known_variants', self::DEFAULT_KNOWN_VARIANTS );

        foreach ( $elements as $element ) {
            if ( 'field' !== ( $element['type'] ?? '' ) ) {
                continue;
            }

            if ( ! isset( $element['variant'] ) ) {
                continue; // Already caught by required properties check.
            }

            if ( ! in_array( $element['variant'], $known, true ) ) {
                $this->warnings[] = sprintf(
                    'Field "%s" uses unknown variant "%s". Register it via dokan_admin_settings_known_variants filter.',
                    $element['id'] ?? '(unknown)',
                    $element['variant']
                );
            }
        }
    }

    /**
     * Check that every field-type element has a globally unique id.
     *
     * Unlike `check_duplicate_ids()` (which scopes uniqueness to a field's parent
     * and produces warnings), this rule enforces uniqueness across the ENTIRE
     * merged schema and produces ERRORS. Required because settings are stored
     * in a single `dokan_settings` option keyed by field id — a duplicate id
     * means one field's value would silently overwrite another's.
     *
     * Non-field elements (page, subpage, section, etc.) are exempt: they have
     * no storage slot, so an id collision between a fieldgroup and a field is
     * harmless (and used intentionally in the schema, e.g., `google_map_api_key`).
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     */
    private function check_unique_field_ids( array $elements ): void {
        $seen = [];

        foreach ( $elements as $element ) {
            if ( 'field' !== ( $element['type'] ?? '' ) ) {
                continue;
            }
            $id = $element['id'] ?? '';
            if ( '' === $id ) {
                continue;
            }

            if ( isset( $seen[ $id ] ) ) {
                $this->errors[] = sprintf(
                    'Duplicate field id "%s" — every field must declare a globally unique id (required by single-option storage).',
                    $id
                );
                continue;
            }

            $seen[ $id ] = true;
        }
    }

    /**
     * Add a validation error programmatically.
     *
     * Useful in the `dokan_admin_settings_schema_before_validate` action hook
     * for adding custom validation errors from external code.
     *
     * @since DOKAN_SINCE
     *
     * @param string $message Human-readable error message.
     */
    public function add_error( string $message ): void {
        $this->errors[] = $message;
    }

    /**
     * Add a validation warning programmatically.
     *
     * Useful in the `dokan_admin_settings_schema_before_validate` action hook
     * for adding custom validation warnings from external code.
     *
     * @since DOKAN_SINCE
     *
     * @param string $message Human-readable warning message.
     */
    public function add_warning( string $message ): void {
        $this->warnings[] = $message;
    }

    /**
     * Check whether a validation result indicates success (no errors).
     *
     * Warnings are non-blocking and do not cause this to return false.
     *
     * @since DOKAN_SINCE
     *
     * @param array{errors: string[], warnings: string[]} $result Validation result from `validate()`.
     *
     * @return bool True if no errors were found.
     */
    public static function is_valid( array $result ): bool {
        return empty( $result['errors'] );
    }
}
