<?php

namespace WeDevs\Dokan\Admin\Settings\Schema;

/**
 * Settings Registry — collects, processes, and serves the admin settings schema.
 *
 * Responsibilities:
 * 1. Collect the flat array schema from SettingsSchema::get_schema().
 * 2. Auto-generate hook_key and dependency_key for elements that omit them.
 * 3. Fire hook_key filters on structural nodes so Pro/extensions can inject children.
 * 4. Populate field values from wp_options (falling back to defaults).
 * 5. Fill default properties (display, dependencies, validations, etc.).
 * 6. Run SchemaValidator in debug/dev mode.
 *
 * @since DOKAN_SINCE
 */
class SettingsRegistry {

    /**
     * Cached processed schema. Null means not yet built.
     *
     * @var array|null
     */
    private ?array $cache = null;

    /**
     * Cached option values per storage key to avoid repeated get_option calls.
     *
     * @var array<string, array>
     */
    private array $options_cache = [];

    /**
     * Get the fully processed settings schema.
     *
     * Returns the flat array with all values populated, defaults filled,
     * hook_key filters fired, and validation run (in debug mode).
     *
     * @since DOKAN_SINCE
     *
     * @param bool $force_refresh Force rebuild even if cached.
     *
     * @return array Flat array of processed settings elements.
     */
    public function get_schema( bool $force_refresh = false ): array {
        if ( null !== $this->cache && ! $force_refresh ) {
            return $this->cache;
        }

        // 1. Collect base schema.
        $elements = SettingsSchema::get_schema();

        // 2. Auto-generate hook_key and dependency_key.
        $elements = $this->generate_keys( $elements );

        // 3. Fire hook_key filters on structural nodes.
        $elements = $this->fire_hook_key_filters( $elements );

        // 4. Fill default properties.
        $elements = $this->fill_defaults( $elements );

        // 5. Populate field values from storage.
        $elements = $this->populate_values( $elements );

        // 6. Validate in debug mode.
        $this->maybe_validate( $elements );

        $this->cache = $elements;

        return $this->cache;
    }

    /**
     * Clear the cached schema.
     *
     * @since DOKAN_SINCE
     */
    public function clear_cache(): void {
        $this->cache         = null;
        $this->options_cache = [];
    }

    /**
     * Auto-generate hook_key and dependency_key for elements that don't have them.
     *
     * hook_key format: `dokan_settings_{page}_{subpage}_{section}_{field}_children`
     * dependency_key format: `{subpage}.{section}.{field}` (relative to page)
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     *
     * @return array Elements with hook_key and dependency_key populated.
     */
    private function generate_keys( array $elements ): array {
        // Build a lookup for resolving parent chains.
        $lookup = [];
        foreach ( $elements as $element ) {
            if ( isset( $element['id'], $element['type'] ) ) {
                $lookup[ $element['type'] . ':' . $element['id'] ] = $element;
            }
        }

        $parent_pointer_keys = [ 'page_id', 'subpage_id', 'tab_id', 'section_id', 'subsection_id', 'field_group_id' ];
        $parent_pointer_types = [
            'page_id'        => 'page',
            'subpage_id'     => 'subpage',
            'tab_id'         => 'tab',
            'section_id'     => 'section',
            'subsection_id'  => 'subsection',
            'field_group_id' => 'fieldgroup',
        ];

        foreach ( $elements as &$element ) {
            // Skip if already set.
            if ( ! empty( $element['hook_key'] ) && ! empty( $element['dependency_key'] ) ) {
                continue;
            }

            // Build the path by walking up the parent chain.
            $path    = [ $element['id'] ];
            $current = $element;

            for ( $i = 0; $i < 10; $i++ ) {
                $found_parent = false;

                foreach ( $parent_pointer_keys as $pointer_key ) {
                    if ( empty( $current[ $pointer_key ] ) ) {
                        continue;
                    }

                    $parent_type = $parent_pointer_types[ $pointer_key ];
                    $parent_id   = $current[ $pointer_key ];
                    $parent_key  = $parent_type . ':' . $parent_id;

                    if ( isset( $lookup[ $parent_key ] ) ) {
                        array_unshift( $path, $parent_id );
                        $current      = $lookup[ $parent_key ];
                        $found_parent = true;
                        break;
                    }

                    // Parent not in lookup — just add the ID.
                    array_unshift( $path, $parent_id );
                    $found_parent = true;
                    break;
                }

                if ( ! $found_parent || 'page' === ( $current['type'] ?? '' ) ) {
                    break;
                }
            }

            // hook_key: dokan_settings_{full_path}_children
            if ( empty( $element['hook_key'] ) ) {
                $element['hook_key'] = 'dokan_settings_' . implode( '_', $path ) . '_children';
            }

            // dependency_key: path without the page prefix (relative to page).
            if ( empty( $element['dependency_key'] ) && count( $path ) > 1 ) {
                $element['dependency_key'] = implode( '.', array_slice( $path, 1 ) );
            }
        }
        unset( $element );

        return $elements;
    }

    /**
     * Fire hook_key filters on structural nodes.
     *
     * For each structural element (page, subpage, section, tab, subsection, fieldgroup),
     * fires `apply_filters( $hook_key, $children, $node )` where $children are the
     * elements that have this node as their parent. This allows Pro and extensions
     * to inject additional elements at specific tree positions.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     *
     * @return array Elements with any hook-injected children merged in.
     */
    private function fire_hook_key_filters( array $elements ): array {
        $structural_types = [ 'page', 'subpage', 'section', 'tab', 'subsection', 'fieldgroup' ];
        $parent_pointer_types = [
            'page'       => 'page_id',
            'subpage'    => 'subpage_id',
            'tab'        => 'tab_id',
            'section'    => 'section_id',
            'subsection' => 'subsection_id',
            'fieldgroup' => 'field_group_id',
        ];

        foreach ( $elements as $element ) {
            $type = $element['type'] ?? '';

            if ( ! in_array( $type, $structural_types, true ) ) {
                continue;
            }

            if ( empty( $element['hook_key'] ) ) {
                continue;
            }

            // Gather current children of this node.
            $pointer_key = $parent_pointer_types[ $type ] ?? null;
            if ( ! $pointer_key ) {
                continue;
            }

            $children = array_filter(
                $elements,
                fn( $el ) => ( $el[ $pointer_key ] ?? '' ) === $element['id']
            );

            /**
             * Filter to inject children into a structural settings node.
             *
             * The hook name is dynamic, built from the element's position in the tree.
             * For example: `dokan_settings_general_marketplace_marketplace_settings_children`
             *
             * @since DOKAN_SINCE
             *
             * @param array $children Current child elements of this node.
             * @param array $node     The structural node element.
             */
            $filtered_children = apply_filters( $element['hook_key'], array_values( $children ), $element );

            // Merge any new elements that were added by the filter.
            if ( is_array( $filtered_children ) && count( $filtered_children ) > count( $children ) ) {
                $existing_ids = array_column( $children, 'id' );
                foreach ( $filtered_children as $child ) {
                    // Skip non-array elements (e.g. OOP objects from legacy filters).
                    if ( ! is_array( $child ) ) {
                        continue;
                    }
                    if ( isset( $child['id'] ) && ! in_array( $child['id'], $existing_ids, true ) ) {
                        $elements[] = $child;
                    }
                }
            }
        }

        return $elements;
    }

    /**
     * Fill default properties on elements that omit them.
     *
     * Ensures every element has consistent properties for the frontend,
     * even if they weren't explicitly set in the schema definition.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     *
     * @return array Elements with defaults filled.
     */
    private function fill_defaults( array $elements ): array {
        $field_defaults = [
            'display'      => true,
            'dependencies' => [],
            'validations'  => [],
            'readonly'     => false,
            'disabled'     => false,
        ];

        $structural_defaults = [
            'display'      => true,
            'dependencies' => [],
        ];

        foreach ( $elements as &$element ) {
            $type     = $element['type'] ?? '';
            $defaults = 'field' === $type ? $field_defaults : $structural_defaults;

            foreach ( $defaults as $key => $default_value ) {
                if ( ! array_key_exists( $key, $element ) ) {
                    $element[ $key ] = $default_value;
                }
            }
        }
        unset( $element );

        return $elements;
    }

    /**
     * Populate field values from wp_options storage.
     *
     * For each field element, determines the storage key (from the parent page's storage_key)
     * and reads the stored value using the dependency_key path. Falls back to the field's
     * default value if no stored value exists.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     *
     * @return array Elements with field 'value' populated.
     */
    private function populate_values( array $elements ): array {
        // Build page lookup: page_id => storage_key.
        $page_storage_keys = [];
        foreach ( $elements as $element ) {
            if ( 'page' === ( $element['type'] ?? '' ) && ! empty( $element['storage_key'] ) ) {
                $page_storage_keys[ $element['id'] ] = $element['storage_key'];
            }
        }

        // Build element lookup for parent chain walking.
        $lookup = [];
        foreach ( $elements as $element ) {
            if ( isset( $element['id'], $element['type'] ) ) {
                $lookup[ $element['type'] . ':' . $element['id'] ] = $element;
            }
        }

        $parent_pointer_types = [
            'page_id'        => 'page',
            'subpage_id'     => 'subpage',
            'tab_id'         => 'tab',
            'section_id'     => 'section',
            'subsection_id'  => 'subsection',
            'field_group_id' => 'fieldgroup',
        ];

        foreach ( $elements as &$element ) {
            if ( 'field' !== ( $element['type'] ?? '' ) ) {
                continue;
            }

            // Already has a value set (e.g., by the schema itself).
            if ( array_key_exists( 'value', $element ) ) {
                continue;
            }

            // Find the page this field belongs to by walking up the parent chain.
            $page_id = $this->find_page_id( $element, $lookup, $parent_pointer_types );

            if ( ! $page_id || ! isset( $page_storage_keys[ $page_id ] ) ) {
                $element['value'] = $element['default'] ?? '';
                continue;
            }

            $storage_key = $page_storage_keys[ $page_id ];
            $stored_data = $this->get_stored_option( $storage_key );

            // Use dependency_key to navigate the nested stored data.
            $dep_key = $element['dependency_key'] ?? '';

            if ( ! empty( $dep_key ) && is_array( $stored_data ) ) {
                $value = $this->get_nested_value( $stored_data, $dep_key );

                if ( null !== $value ) {
                    $element['value'] = $value;
                } else {
                    $element['value'] = $element['default'] ?? '';
                }
            } else {
                $element['value'] = $element['default'] ?? '';
            }
        }
        unset( $element );

        return $elements;
    }

    /**
     * Find the page ID that an element belongs to by walking up the parent chain.
     *
     * @since DOKAN_SINCE
     *
     * @param array $element              The element to find the page for.
     * @param array $lookup               Element lookup (type:id => element).
     * @param array $parent_pointer_types Pointer key => parent type map.
     *
     * @return string|null The page ID or null if not found.
     */
    private function find_page_id( array $element, array $lookup, array $parent_pointer_types ): ?string {
        $current = $element;

        for ( $i = 0; $i < 10; $i++ ) {
            foreach ( $parent_pointer_types as $pointer_key => $parent_type ) {
                if ( empty( $current[ $pointer_key ] ) ) {
                    continue;
                }

                $parent_id  = $current[ $pointer_key ];
                $parent_key = $parent_type . ':' . $parent_id;

                // Reached a page.
                if ( 'page' === $parent_type ) {
                    return $parent_id;
                }

                // Continue walking up.
                if ( isset( $lookup[ $parent_key ] ) ) {
                    $current = $lookup[ $parent_key ];
                    break;
                }

                return null;
            }
        }

        return null;
    }

    /**
     * Get a stored option value with caching.
     *
     * @since DOKAN_SINCE
     *
     * @param string $storage_key The wp_options key.
     *
     * @return array The stored option data.
     */
    private function get_stored_option( string $storage_key ): array {
        if ( ! isset( $this->options_cache[ $storage_key ] ) ) {
            $data = get_option( $storage_key, [] );
            $this->options_cache[ $storage_key ] = is_array( $data ) ? $data : [];
        }

        return $this->options_cache[ $storage_key ];
    }

    /**
     * Get a nested value from an array using dot-notation path.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $data The nested array.
     * @param string $path Dot-separated path (e.g., "marketplace.marketplace_settings.vendor_store_url").
     *
     * @return mixed|null The value or null if not found.
     */
    private function get_nested_value( array $data, string $path ) {
        $keys    = explode( '.', $path );
        $current = $data;

        foreach ( $keys as $key ) {
            if ( ! is_array( $current ) || ! array_key_exists( $key, $current ) ) {
                return null;
            }
            $current = $current[ $key ];
        }

        return $current;
    }

    /**
     * Run schema validation in debug/dev mode.
     *
     * Only runs when WP_DEBUG is true and DOKAN_DISABLE_SCHEMA_VALIDATION is not set.
     * Logs errors and warnings to the PHP error log.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements The processed schema elements.
     */
    private function maybe_validate( array $elements ): void {
        if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
            return;
        }

        $validator = new SchemaValidator();
        $result    = $validator->validate( $elements );

        if ( ! empty( $result['errors'] ) ) {
            foreach ( $result['errors'] as $error ) {
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log( 'Dokan Settings Schema Error: ' . $error );
            }
        }

        if ( ! empty( $result['warnings'] ) ) {
            foreach ( $result['warnings'] as $warning ) {
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log( 'Dokan Settings Schema Warning: ' . $warning );
            }
        }
    }
}
