<?php

namespace WeDevs\Dokan\Admin\Settings;

/**
 * Settings key Mapper.
 *
 * Maps legacy settings keys (section.field) to the new settings keys
 * (PageId.SubPageId.SectionId.FieldId) and vice-versa.
 *
 * Example mapping item:
 *   'dokan_general.custom_store_url' => 'general.marketplace.marketplace_settings.vendor_store_url'
 *
 * Notes
 * - We intentionally do not load mappings from CSV or legacy files.
 * - Use the `dokan_settings_mapper_map` filter to inject/extend mappings at runtime.
 */
class SettingsMapper {
    /**
     * Map array [ old_key => new_key ].
     *
     * Old key format:    sectionKey.fieldKey
     * New key format:    PageId.SubPageId.SectionId.FieldId
     *
     * @var array<string,string>
     */
    protected array $map = [
        // Example mapping (keep here as reference; real mappings should be provided via filter)
        // 'dokan_general.custom_store_url' => 'general.marketplace.marketplace_settings.vendor_store_url',
    ];

    /**
     * Reverse map array [ new_key => old_key ].
     *
     * @var array<string,string>
     */
    protected array $reverse_map = [];

    public function __construct( array $map = [] ) {
        if ( ! empty( $map ) ) {
            $this->set_map( $map );
        }

        // Allow 3rd parties to override/extend the map.
        $filtered = apply_filters( 'dokan_settings_mapper_map', $this->map );
        if ( is_array( $filtered ) ) {
            $this->map = $filtered;
        }

        $this->build_reverse_map();
    }

    /**
     * Set/replace the mapping array.
     */
    public function set_map( array $map ): self {
        $this->map = $map;
        $this->build_reverse_map();
        return $this;
    }

    /**
     * Get the active mapping array.
     */
    public function get_map(): array {
        return $this->map;
    }

    /**
     * Map a legacy key (section.field) to the new key path.
     *
     * @return string|null The new key or null if not mapped.
     */
    public function to_new_key( string $old_key ): ?string {
        return $this->map[ $old_key ] ?? null;
    }

    /**
     * Map a new key path (Page.SubPage.Section.Field) to a legacy key.
     *
     * @return string|null The legacy key or null if not mapped.
     */
    public function to_old_key( string $new_key ): ?string {
        return $this->reverse_map[ $new_key ] ?? null;
    }

    /**
     * Build reverse map from the forward map.
     */
    protected function build_reverse_map(): void {
        $this->reverse_map = [];
        foreach ( $this->map as $old => $new ) {
            $this->reverse_map[ $new ] = $old;
        }
    }

    /**
     * Helper: set a value into a nested array using dot notation.
     *
     * @param array  $array The array to modify (passed by reference).
     * @param string $path  Dot-notated path (e.g. foo.bar.baz).
     * @param mixed  $value Value to set.
     */
    public static function set_value_by_path( array &$array, string $path, $value ): void {
        if ( '' === $path ) {
            return;
        }
        $keys = explode( '.', $path );
        $ref  = &$array;
        foreach ( $keys as $key ) {
            if ( ! is_array( $ref ) ) {
                $ref = [];
            }
            if ( ! array_key_exists( $key, $ref ) || ! is_array( $ref[ $key ] ) ) {
                $ref[ $key ] = [];
            }
            $ref = &$ref[ $key ];
        }
        $ref = $value;
    }

    /**
     * Helper: get a value from a nested array using dot notation.
     * Returns $default if any key is missing.
     */
    public static function get_value_by_path( array $array, string $path, $default = null ) {
        if ( '' === $path ) {
            return $default;
        }
        $keys = explode( '.', $path );
        $ref  = $array;
        foreach ( $keys as $key ) {
            if ( ! is_array( $ref ) || ! array_key_exists( $key, $ref ) ) {
                return $default;
            }
            $ref = $ref[ $key ];
        }
        return $ref;
    }
}
