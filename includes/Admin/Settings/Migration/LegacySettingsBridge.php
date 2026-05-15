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
