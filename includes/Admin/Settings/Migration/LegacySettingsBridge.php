<?php

namespace WeDevs\Dokan\Admin\Settings\Migration;

use WeDevs\Dokan\Admin\Settings\Schema\SettingsSchema;

/**
 * Legacy Settings Bridge.
 *
 * Bidirectional mapping between the new flat `dokan_settings` wp_option and
 * the legacy per-page `dokan_*` wp_options. Supports the legacy-view toggle
 * without coupling the new REST write path to legacy storage.
 *
 * See docs/superpowers/specs/2026-05-15-legacy-settings-bridge-design.md.
 *
 * @since DOKAN_SINCE
 */
class LegacySettingsBridge {

    /**
     * Cached normalized mapping, lazily built per-request.
     *
     * @var array<string,array{option:string,field:string}>|null
     */
    private ?array $map = null;

    /**
     * Cached defaults index, built alongside the mapping.
     *
     * @var array<string,mixed>|null
     */
    private ?array $defaults = null;

    /**
     * Cached reverse index keyed by legacy option name.
     *
     * @var array<string,array<string,string>>|null
     */
    private ?array $by_option = null;

    /**
     * Return the normalized mapping of new flat ids to legacy addresses.
     *
     * @return array<string,array{option:string,field:string}>
     */
    public function get_mapping(): array {
        return $this->build_map();
    }

    /**
     * Transform a sanitized legacy AJAX payload into the new-flat slice.
     *
     * Used by the legacy save handler to mirror writes into `dokan_settings`.
     * Caller is responsible for the merge + `update_option` — the bridge does
     * not write.
     *
     * @param string               $option_name    Legacy wp_option name (e.g., `dokan_appearance`).
     * @param array<string,mixed>  $legacy_payload Sanitized submission for that option.
     *
     * @return array<string,mixed> New-flat slice ready to merge into `dokan_settings`.
     */
    public function transform_legacy_payload_to_new( string $option_name, array $legacy_payload ): array {
        $this->build_map();
        $pairs = $this->by_option[ $option_name ] ?? [];
        $slice = [];
        foreach ( $pairs as $new_key => $old_field ) {
            if ( array_key_exists( $old_field, $legacy_payload ) ) {
                $slice[ $new_key ] = $legacy_payload[ $old_field ];
            }
        }
        return $slice;
    }

    /**
     * Fill missing keys in the new option from mapped legacy options.
     *
     * Never overwrites existing new-option values — new is source of truth.
     * For mapped keys missing on both sides, falls back to the schema default.
     * Legacy reads are batched per option name.
     *
     * @param array<string,mixed> $new_option Current `dokan_settings` array.
     *
     * @return array<string,mixed> Hydrated new option.
     */
    public function hydrate_new_from_legacy( array $new_option ): array {
        $this->build_map();

        $missing_by_option = [];
        foreach ( $this->map as $new_key => $address ) {
            if ( array_key_exists( $new_key, $new_option ) ) {
                continue;
            }
            $missing_by_option[ $address['option'] ][ $new_key ] = $address['field'];
        }

        foreach ( $missing_by_option as $option_name => $pairs ) {
            $legacy = get_option( $option_name, [] );
            if ( ! is_array( $legacy ) ) {
                $legacy = [];
            }
            foreach ( $pairs as $new_key => $old_field ) {
                $new_option[ $new_key ] = array_key_exists( $old_field, $legacy )
                    ? $legacy[ $old_field ]
                    : $this->get_schema_default( $new_key );
            }
        }

        return $new_option;
    }

    /**
     * Project the current new option into a legacy-shaped array.
     *
     * Asymmetric to `hydrate_new_from_legacy`: this DOES overwrite legacy
     * values when the new option has them, because the new option is source
     * of truth. Used by the legacy read path so toggling to legacy reflects
     * saves made via the new UI.
     *
     * @param string              $option_name   Legacy wp_option name.
     * @param array<string,mixed> $legacy_option Current legacy option array.
     *
     * @return array<string,mixed> Legacy-shaped array with new values projected in.
     */
    public function hydrate_legacy_from_new( string $option_name, array $legacy_option ): array {
        $this->build_map();
        $new_option = get_option( 'dokan_settings', [] );
        if ( ! is_array( $new_option ) ) {
            $new_option = [];
        }
        $pairs = $this->by_option[ $option_name ] ?? [];
        foreach ( $pairs as $new_key => $old_field ) {
            if ( array_key_exists( $new_key, $new_option ) ) {
                $legacy_option[ $old_field ] = $new_option[ $new_key ];
            }
        }
        return $legacy_option;
    }

    /**
     * Schema default for a mapped new key, or `null` if unknown.
     *
     * @param string $new_key
     *
     * @return mixed
     */
    private function get_schema_default( string $new_key ) {
        return $this->defaults[ $new_key ] ?? null;
    }

    /**
     * Build (and cache) the mapping, defaults index, and reverse-by-option index.
     *
     * @return array<string,array{option:string,field:string}>
     */
    private function build_map(): array {
        if ( $this->map !== null ) {
            return $this->map;
        }

        [ $map, $defaults ] = $this->harvest_from_schema();

        /**
         * Filter the legacy-to-new key mapping.
         *
         * Allows addons to register mappings the per-field `legacy_key`
         * attribute cannot express (legacy-only fields, bulk additions,
         * non-`dokan_*` source options).
         *
         * @since DOKAN_SINCE
         *
         * @param array<string,string|array{option:string,field:string}> $map
         */
        $map = apply_filters( 'dokan_legacy_settings_key_mapping', $map );

        [ $this->map, $this->by_option ] = $this->normalize( $map );
        $this->defaults                  = $defaults;

        return $this->map;
    }

    /**
     * Walk the post-filter schema, collecting legacy_key attrs and defaults.
     *
     * @return array{0: array<string,string|array{option:string,field:string}>, 1: array<string,mixed>}
     */
    private function harvest_from_schema(): array {
        $map      = [];
        $defaults = [];

        foreach ( SettingsSchema::get_schema() as $element ) {
            if ( ( $element['type'] ?? '' ) !== 'field' ) {
                continue;
            }
            $id = $element['id'] ?? '';
            if ( '' === $id ) {
                continue;
            }
            $defaults[ $id ] = $element['default'] ?? null;

            $legacy = $element['legacy_key'] ?? null;
            if ( null === $legacy || '' === $legacy ) {
                continue;
            }
            $map[ $id ] = $legacy;
        }

        return [ $map, $defaults ];
    }

    /**
     * Normalize raw addresses into structs, dropping malformed entries.
     *
     * @param array<string,string|array{option:string,field:string}> $map
     *
     * @return array{0: array<string,array{option:string,field:string}>, 1: array<string,array<string,string>>}
     */
    private function normalize( array $map ): array {
        $normalized = [];
        $by_option  = [];

        foreach ( $map as $new_key => $address ) {
            $struct = $this->parse_address( $address );
            if ( null === $struct ) {
                if ( function_exists( 'dokan_log' ) ) {
                    dokan_log( sprintf( '[LegacySettingsBridge] dropping malformed legacy_key for "%s"', $new_key ) );
                }
                continue;
            }
            $normalized[ $new_key ]                     = $struct;
            $by_option[ $struct['option'] ][ $new_key ] = $struct['field'];
        }

        return [ $normalized, $by_option ];
    }

    /**
     * Parse a legacy address from either dotted-string or struct form.
     *
     * @param mixed $address
     *
     * @return array{option:string,field:string}|null
     */
    private function parse_address( $address ): ?array {
        if ( is_array( $address ) && isset( $address['option'], $address['field'] ) ) {
            $option = (string) $address['option'];
            $field  = (string) $address['field'];
            return ( '' !== $option && '' !== $field ) ? [ 'option' => $option, 'field' => $field ] : null;
        }
        if ( is_string( $address ) && strpos( $address, '.' ) !== false ) {
            [ $option, $field ] = explode( '.', $address, 2 );
            return ( '' !== $option && '' !== $field ) ? [ 'option' => $option, 'field' => $field ] : null;
        }
        return null;
    }
}
