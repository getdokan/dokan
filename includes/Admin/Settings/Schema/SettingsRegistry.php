<?php

namespace WeDevs\Dokan\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepositoryInterface;

/**
 * Settings Registry — collects, processes, and serves the admin settings schema.
 *
 * Responsibilities:
 * 1. Collect the flat array schema from SettingsSchema::get_schema().
 * 2. Auto-generate hook_key for elements that omit it.
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
     * Lazy id-keyed index of field elements. Null until first {@see find_field()} call.
     *
     * @var array<string,array>|null
     */
    private ?array $field_index = null;

    /**
     * Lazy set of ids that are present in storage (flat option or via the
     * legacy bridge overlay). Null until first {@see is_stored()} call.
     *
     * Keys are flat schema ids; values are unused (the array is used as a set).
     *
     * @var array<string,bool>|null
     */
    private ?array $stored_keys = null;

    /**
     * Settings repository — single read surface for the stored payload.
     *
     * @var SettingsRepositoryInterface
     */
    private SettingsRepositoryInterface $settings_repo;

    /**
     * Constructor.
     *
     * @param SettingsRepositoryInterface|null $settings_repo Optional repository for testing.
     */
    public function __construct( ?SettingsRepositoryInterface $settings_repo = null ) {
        $this->settings_repo = $settings_repo ?? new SettingsRepository();
        $this->register_cache_invalidation_hooks();
    }

    /**
     * Invalidate the processed schema cache whenever its underlying storage
     * changes. Without this, consumers like {@see SettingsAccessor::get()}
     * return stale values after any in-request option write.
     *
     * Listens to:
     *   - The new flat option ({@see SettingsRepository::OPTION_KEY}) where
     *     all admin writes land. Wired immediately — the option name is a
     *     constant and needs no schema introspection.
     *   - Every legacy `dokan_*` section that the bridge knows about — Pro
     *     and third-party `update_option()` writes against those sections
     *     would otherwise leave the registry overlay stale. **Deferred to
     *     `init`** because enumerating the sections requires building the
     *     bridge map, which harvests {@see SettingsSchema::get_schema()},
     *     which runs `get_posts()`, which fires `pre_get_posts` hooks that
     *     in turn read `dokan()->settings`. Doing that from the constructor
     *     re-enters DI resolution and fatals the request.
     *
     * @return void
     */
    private function register_cache_invalidation_hooks(): void {
        $new_option = SettingsRepository::OPTION_KEY;
        add_action( "update_option_{$new_option}", [ $this, 'clear_cache' ] );
        add_action( "add_option_{$new_option}", [ $this, 'clear_cache' ] );

        if ( ! function_exists( 'did_action' ) ) {
            return;
        }
        if ( did_action( 'init' ) ) {
            $this->register_legacy_section_hooks();
            return;
        }
        add_action( 'init', [ $this, 'register_legacy_section_hooks' ], 0 );
    }

    /**
     * Register `update_option_{section}` / `add_option_{section}` listeners
     * for every legacy section the bridge knows about. Must run on or after
     * `init` — see {@see register_cache_invalidation_hooks()} for why.
     *
     * Public so it can be invoked as a WP action callback.
     *
     * @return void
     */
    public function register_legacy_section_hooks(): void {
        if ( ! function_exists( 'dokan_get_container' ) ) {
            return;
        }
        try {
            $bridge = dokan_get_container()->get( LegacySettingsBridge::class );
            if ( ! $bridge instanceof LegacySettingsBridge ) {
                return;
            }
        } catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
            // Bridge not booted yet — fall back to new-flat-option-only invalidation.
            return;
        }

        foreach ( $this->known_legacy_sections( $bridge ) as $section ) {
            add_action( "update_option_{$section}", [ $this, 'clear_cache' ] );
            add_action( "add_option_{$section}", [ $this, 'clear_cache' ] );
        }
    }

    /**
     * Unique legacy section option names mentioned in the bridge mapping.
     *
     * @param LegacySettingsBridge $bridge
     *
     * @return array<int,string>
     */
    private function known_legacy_sections( LegacySettingsBridge $bridge ): array {
        $sections = [];
        foreach ( $bridge->get_mapping() as $entry ) {
            if ( is_array( $entry ) && isset( $entry['option'] ) && is_string( $entry['option'] ) ) {
                $sections[ $entry['option'] ] = true;
            }
        }
        return array_keys( $sections );
    }

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

        // 2. Auto-generate hook_key.
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
     * Retained for backward compatibility — callers (e.g. AdminSettingsController)
     * invoke this after a save. WordPress's get_option() caches within a request,
     * so no separate options cache is needed here.
     *
     * @since DOKAN_SINCE
     */
    public function clear_cache(): void {
        $this->cache       = null;
        $this->field_index = null;
        $this->stored_keys = null;
    }

    /**
     * Find a registered field element by its flat schema id.
     *
     * Returns the element array as it appears in {@see get_schema()} — i.e.
     * with `value` populated via the bridge overlay and `default` filled.
     * Returns null for unknown ids or for non-`field` elements (structural
     * nodes share the id-space but are intentionally excluded).
     *
     * @since DOKAN_SINCE
     *
     * @param string $id Flat schema id.
     *
     * @return array|null
     */
    public function find_field( string $id ): ?array {
        if ( null === $this->field_index ) {
            $this->build_field_index();
        }
        return $this->field_index[ $id ] ?? null;
    }

    /**
     * Build the id-keyed field index from the processed schema.
     *
     * Structural elements (pages, sections, tabs, etc.) are excluded — only
     * elements with `type: field` participate.
     *
     * @return void
     */
    private function build_field_index(): void {
        $this->field_index = [];
        foreach ( $this->get_schema() as $element ) {
            if ( ( $element['type'] ?? '' ) !== 'field' ) {
                continue;
            }
            $id = $element['id'] ?? '';
            if ( '' === $id ) {
                continue;
            }
            $this->field_index[ $id ] = $element;
        }
    }

    /**
     * Whether `$id` has a value present in storage (the flat option or, via
     * the legacy bridge, a mapped per-section legacy option).
     *
     * Returns false for unregistered ids, and false when the only "value" the
     * accessor would return is the schema default. Use this to distinguish a
     * user-set value from a defaulted one — e.g. when preserving a runtime
     * fallback that depends on another setting.
     *
     * @since DOKAN_SINCE
     *
     * @param string $id Flat schema id.
     *
     * @return bool
     */
    public function is_stored( string $id ): bool {
        if ( null === $this->stored_keys ) {
            $this->build_stored_keys();
        }
        return isset( $this->stored_keys[ $id ] );
    }

    /**
     * Build the set of ids present in storage, applying the same bridge
     * overlay {@see populate_values()} uses so legacy-only values count
     * as "stored".
     *
     * @return void
     */
    private function build_stored_keys(): void {
        $stored = $this->settings_repo->all();

        if ( function_exists( 'dokan_get_container' ) ) {
            try {
                $bridge = dokan_get_container()->get( \WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge::class );
                $stored = $bridge->hydrate_new_from_legacy( $stored );
            } catch ( \Throwable $unused ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
                unset( $unused );
                // Container not booted — fall back to flat-only view.
            }
        }

        $this->stored_keys = [];
        foreach ( array_keys( $stored ) as $id ) {
            if ( is_string( $id ) && '' !== $id ) {
                $this->stored_keys[ $id ] = true;
            }
        }
    }

    /**
     * Auto-generate hook_key for elements that don't have one.
     *
     * Hook_key format: `dokan_settings_{page}_{subpage}_{section}_{field}_children`.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     *
     * @return array Elements with hook_key populated.
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
            // Skip if hook_key already set.
            if ( ! empty( $element['hook_key'] ) ) {
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
            $element['hook_key'] = 'dokan_settings_' . implode( '_', $path ) . '_children';
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
     * Populate field values from the single dokan_settings wp_option.
     *
     * Reads `dokan_settings` once and looks up each field's value by its id.
     * Falls back to the field's `default` when the id is absent from storage.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Flat array of schema elements.
     *
     * @return array Elements with field `value` populated.
     */
    private function populate_values( array $elements ): array {
        $stored = $this->settings_repo->all();

        // Fill missing keys from legacy options where mapped (legacy view → new UI bridge).
        if ( function_exists( 'dokan_get_container' ) ) {
            try {
                $bridge = dokan_get_container()->get( \WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge::class );
                $stored = $bridge->hydrate_new_from_legacy( $stored );
            } catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
                // Container not booted (very early load path) — fall back to raw stored values.
            }
        }

        foreach ( $elements as &$element ) {
            if ( 'field' !== ( $element['type'] ?? '' ) ) {
                continue;
            }
            if ( array_key_exists( 'value', $element ) ) {
                continue;
            }
            $id = $element['id'] ?? '';
            if ( '' === $id ) {
                continue;
            }
            $element['value'] = $stored[ $id ] ?? ( $element['default'] ?? '' );
        }
        unset( $element );

        return $elements;
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
