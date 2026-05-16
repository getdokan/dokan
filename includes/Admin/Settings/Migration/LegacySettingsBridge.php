<?php

namespace WeDevs\Dokan\Admin\Settings\Migration;

use WeDevs\Dokan\Admin\Settings\Migration\Transformer\PassThroughTransformer;
use WeDevs\Dokan\Admin\Settings\Migration\Transformer\TransformerInterface;
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
     * @var array<string,LegacyAddress>|null
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
     * @var array<string,array<string,LegacyAddress>>|null
     */
    private ?array $by_option = null;

    /**
     * Cached transformer FQCNs keyed by new-flat id.
     *
     * @var array<string,string>|null
     */
    private ?array $transformers = null;

    /**
     * Cached resolved transformer instances keyed by FQCN.
     *
     * @var array<string,TransformerInterface>
     */
    private array $transformer_cache = [];

    /**
     * Return the normalized mapping of new flat ids to legacy addresses.
     *
     * @return array<string,array{option:string,field:string}>
     */
    public function get_mapping(): array {
        $this->build_map();
        $out = [];
        foreach ( $this->map as $new_key => $address ) {
            $out[ $new_key ] = [
                'option' => $address->option(),
                'field'  => implode( '.', $address->path() ),
            ];
        }
        return $out;
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
        foreach ( $pairs as $new_key => $address ) {
            // For nested paths the AJAX payload still arrives as a top-level
            // structure under the section option, so we read the path from
            // that payload directly.
            $value = $address->read_from( $legacy_payload );
            if ( null === $value && ! $this->path_exists( $legacy_payload, $address->path() ) ) {
                continue;
            }
            $slice[ $new_key ] = $this->resolve_transformer( $new_key )->to_new( $value );
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
            $missing_by_option[ $address->option() ][ $new_key ] = $address;
        }

        foreach ( $missing_by_option as $option_name => $pairs ) {
            $legacy = get_option( $option_name, [] );
            if ( ! is_array( $legacy ) ) {
                $legacy = [];
            }
            foreach ( $pairs as $new_key => $address ) {
                if ( $this->path_exists( $legacy, $address->path() ) ) {
                    $value                  = $address->read_from( $legacy );
                    $new_option[ $new_key ] = $this->resolve_transformer( $new_key )->to_new( $value );
                } else {
                    $new_option[ $new_key ] = $this->get_schema_default( $new_key );
                }
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
        foreach ( $pairs as $new_key => $address ) {
            if ( ! array_key_exists( $new_key, $new_option ) ) {
                continue;
            }
            $legacy_value = $this->resolve_transformer( $new_key )->to_legacy( $new_option[ $new_key ] );
            $address->write_to( $legacy_option, $legacy_value );
        }
        return $legacy_option;
    }

    /**
     * Mirror a new-option slice back into the relevant legacy wp_options.
     *
     * Used when the new UI writes `dokan_settings`. The bridge groups changes
     * by legacy option name, reads each legacy option, writes the mapped
     * sub-paths in-place, and persists with `update_option`. Returns the list
     * of legacy option names that were written.
     *
     * @param array<string,mixed> $new_slice Subset of `dokan_settings` keys to mirror.
     *
     * @return array<int,string> Legacy option names that were updated.
     */
    public function write_new_to_legacy( array $new_slice ): array {
        $this->build_map();
        $changes_by_option = [];
        foreach ( $new_slice as $new_key => $value ) {
            $address = $this->map[ $new_key ] ?? null;
            if ( ! $address instanceof LegacyAddress ) {
                continue;
            }
            $legacy_value                                = $this->resolve_transformer( $new_key )->to_legacy( $value );
            $changes_by_option[ $address->option() ][]   = [ $address, $legacy_value ];
        }
        $written = [];
        foreach ( $changes_by_option as $option_name => $entries ) {
            $legacy = get_option( $option_name, [] );
            if ( ! is_array( $legacy ) ) {
                $legacy = [];
            }
            foreach ( $entries as $entry ) {
                [ $address, $legacy_value ] = $entry;
                $address->write_to( $legacy, $legacy_value );
            }
            update_option( $option_name, $legacy );
            $written[] = $option_name;
        }
        return $written;
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
     * Check whether every path segment exists in the legacy array.
     *
     * @param array<string,mixed> $legacy
     * @param array<int,string>   $path
     *
     * @return bool
     */
    private function path_exists( array $legacy, array $path ): bool {
        $cursor = $legacy;
        foreach ( $path as $segment ) {
            if ( ! is_array( $cursor ) || ! array_key_exists( $segment, $cursor ) ) {
                return false;
            }
            $cursor = $cursor[ $segment ];
        }
        return true;
    }

    /**
     * Resolve the transformer for a new-flat id (pass-through by default).
     *
     * Resolution order: DI container (so tests/addons can swap fakes), then
     * plain `new` instantiation. On any failure the pass-through transformer
     * is returned so the bridge stays best-effort.
     *
     * @param string $new_key
     *
     * @return TransformerInterface
     */
    private function resolve_transformer( string $new_key ): TransformerInterface {
        $fqcn = $this->transformers[ $new_key ] ?? null;
        if ( null === $fqcn || '' === $fqcn ) {
            return $this->get_pass_through();
        }
        if ( isset( $this->transformer_cache[ $fqcn ] ) ) {
            return $this->transformer_cache[ $fqcn ];
        }
        $instance = null;
        if ( function_exists( 'dokan_get_container' ) ) {
            try {
                $candidate = dokan_get_container()->get( $fqcn );
                if ( $candidate instanceof TransformerInterface ) {
                    $instance = $candidate;
                }
            } catch ( \Throwable $unused ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
                unset( $unused );
                // Container miss — fall through to direct instantiation.
            }
        }
        if ( null === $instance && class_exists( $fqcn ) ) {
            try {
                $candidate = new $fqcn();
                if ( $candidate instanceof TransformerInterface ) {
                    $instance = $candidate;
                }
            } catch ( \Throwable $unused ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
                unset( $unused );
                $instance = null;
            }
        }
        if ( null === $instance ) {
            $instance = $this->get_pass_through();
        }
        $this->transformer_cache[ $fqcn ] = $instance;
        return $instance;
    }

    /**
     * Shared pass-through transformer instance.
     *
     * @return TransformerInterface
     */
    private function get_pass_through(): TransformerInterface {
        if ( ! isset( $this->transformer_cache[ PassThroughTransformer::class ] ) ) {
            $this->transformer_cache[ PassThroughTransformer::class ] = new PassThroughTransformer();
        }
        return $this->transformer_cache[ PassThroughTransformer::class ];
    }

    /**
     * Build (and cache) the mapping, defaults index, and reverse-by-option index.
     *
     * @return array<string,LegacyAddress>
     */
    private function build_map(): array {
        if ( $this->map !== null ) {
            return $this->map;
        }

        [ $map, $defaults, $transformers ] = $this->harvest_from_schema();

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
        $this->transformers              = $transformers;

        return $this->map;
    }

    /**
     * Walk the post-filter schema, collecting legacy_key attrs and defaults.
     *
     * Accepts elements that are either `type: field` OR `bridge_only: true`.
     * Bridge-only fields participate in mapping but are not emitted by the
     * new UI; they still round-trip through the bridge.
     *
     * @return array{0: array<string,string|array{option:string,field:string}>, 1: array<string,mixed>, 2: array<string,string>}
     */
    private function harvest_from_schema(): array {
        $map          = [];
        $defaults     = [];
        $transformers = [];

        foreach ( SettingsSchema::get_schema() as $element ) {
            $is_field       = ( $element['type'] ?? '' ) === 'field';
            $is_bridge_only = ! empty( $element['bridge_only'] );
            if ( ! $is_field && ! $is_bridge_only ) {
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

            $transformer = $element['legacy_transformer'] ?? null;
            if ( is_string( $transformer ) && '' !== $transformer ) {
                $transformers[ $id ] = $transformer;
            }
        }

        return [ $map, $defaults, $transformers ];
    }

    /**
     * Normalize raw addresses into value objects, dropping malformed entries.
     *
     * @param array<string,string|array{option:string,field:string}> $map
     *
     * @return array{0: array<string,LegacyAddress>, 1: array<string,array<string,LegacyAddress>>}
     */
    private function normalize( array $map ): array {
        $normalized = [];
        $by_option  = [];

        foreach ( $map as $new_key => $address ) {
            $object = LegacyAddress::parse( $address );
            if ( null === $object ) {
                if ( function_exists( 'dokan_log' ) ) {
                    dokan_log( sprintf( '[LegacySettingsBridge] dropping malformed legacy_key for "%s"', $new_key ) );
                }
                continue;
            }
            $normalized[ $new_key ]                      = $object;
            $by_option[ $object->option() ][ $new_key ]  = $object;
        }

        return [ $normalized, $by_option ];
    }
}
