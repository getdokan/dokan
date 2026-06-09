<?php

namespace WeDevs\Dokan\Admin\Settings\Migration;

use WeDevs\Dokan\Admin\Settings\Migration\Transformer\CallableTransformer;
use WeDevs\Dokan\Admin\Settings\Migration\Transformer\PassThroughTransformer;
use WeDevs\Dokan\Admin\Settings\Migration\Transformer\TransformerInterface;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepositoryInterface;
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
     * Each entry is either:
     *   - A single {@see LegacyAddress} for 1:1 mappings, or
     *   - `array<string $slot, LegacyAddress>` for 1:N mappings, where each
     *     slot name is a logical handle the transformer uses to assemble the
     *     unified new value from / split it into N legacy addresses.
     *
     * @var array<string, LegacyAddress|array<string, LegacyAddress>>|null
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
     * For each option, the inner array maps new_key → entry, where the entry
     * is either a single {@see LegacyAddress} (1:1 mapping) or
     * `array<string $slot, LegacyAddress>` containing only the slots whose
     * addresses live under that option (1:N mappings can span options).
     *
     * @var array<string, array<string, LegacyAddress|array<string, LegacyAddress>>>|null
     */
    private ?array $by_option = null;

    /**
     * Cached transformer specs keyed by new-flat id. Each value is either a
     * FQCN string (class implementing TransformerInterface) or an array shape
     * `['to_new' => callable, 'to_legacy' => callable]` for callable adapters.
     *
     * @var array<string,string|array{to_new:mixed,to_legacy:mixed}>|null
     */
    private ?array $transformers = null;

    /**
     * Cached resolved transformer instances keyed by FQCN (for class specs)
     * or by `callable:<new_key>` (for callable-pair specs).
     *
     * @var array<string,TransformerInterface>
     */
    private array $transformer_cache = [];

    /**
     * Re-entry latch for {@see build_map()}. True while a build is in flight.
     *
     * `harvest_from_schema()` applies the `dokan_get_admin_settings_schema`
     * filter; some Pro module schema callbacks call `dokan_get_option()` which
     * funnels back through the bridge. Without this guard the nested call would
     * recurse indefinitely. While building, nested callers receive the
     * partially-built map (or an empty array on the first call) — a tolerable
     * approximation, since the only callers in that path are computing their
     * own default values during schema construction.
     *
     * @var bool
     */
    private bool $building_map = false;

    /**
     * Number of callbacks attached to `dokan_get_admin_settings_schema` when
     * the cached map was last built. Used to invalidate the memo when more
     * schema providers register later in the request — Pro modules register
     * during `init` at varying priorities, so a bridge caller firing at init
     * priority 5 would otherwise freeze a half-built map before priority 10
     * registrations land.
     *
     * @var int|null
     */
    private ?int $cached_filter_count = null;

    /**
     * Settings repository — used to read the current new payload when
     * projecting it back into a legacy-shaped array.
     *
     * @var SettingsRepositoryInterface
     */
    private SettingsRepositoryInterface $settings_repo;

    /**
     * @param SettingsRepositoryInterface|null $settings_repo Optional repo for testing.
     */
    public function __construct( ?SettingsRepositoryInterface $settings_repo = null ) {
        $this->settings_repo = $settings_repo ?? new SettingsRepository();
    }

    /**
     * Flush the in-request caches held by this bridge and its collaborators.
     *
     * Drops the mapping memo, the defaults/transformers indices, and asks the
     * underlying `SettingsRepositoryInterface` to drop its snapshot. Useful in
     * tests where the DB is rolled back between cases without firing the
     * option hooks (a `delete_option` on an already-empty row is a no-op).
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function flush_cache(): void {
        $this->map                 = null;
        $this->defaults            = null;
        $this->transformers        = null;
        $this->by_option           = null;
        $this->cached_filter_count = null;
        $this->settings_repo->flush_cache();
    }

    /**
     * Return the normalized mapping of new flat ids to legacy addresses.
     *
     * Single-mapped entries surface as `['option' => ..., 'field' => ...]`.
     * Multi-mapped entries surface as `[$slot => ['option' => ..., 'field' => ...], ...]`.
     *
     * @return array<string, array{option:string,field:string}|array<string,array{option:string,field:string}>>
     */
    public function get_mapping(): array {
        $this->build_map();
        $out = [];
        foreach ( $this->map as $new_key => $entry ) {
            if ( $entry instanceof LegacyAddress ) {
                $out[ $new_key ] = [
                    'option' => $entry->option(),
                    'field'  => implode( '.', $entry->path() ),
                ];
                continue;
            }
            $multi = [];
            foreach ( $entry as $slot => $address ) {
                $multi[ $slot ] = [
                    'option' => $address->option(),
                    'field'  => implode( '.', $address->path() ),
                ];
            }
            $out[ $new_key ] = $multi;
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
        $pairs            = $this->by_option[ $option_name ] ?? [];
        $slice            = [];
        $other_opt_cache  = [];
        foreach ( $pairs as $new_key => $entry ) {
            if ( $entry instanceof LegacyAddress ) {
                // For nested paths the AJAX payload still arrives as a top-level
                // structure under the section option, so we read the path from
                // that payload directly.
                $value = $entry->read_from( $legacy_payload );
                if ( null === $value && ! $this->path_exists( $legacy_payload, $entry->path() ) ) {
                    continue;
                }
                $slice[ $new_key ] = $this->resolve_transformer( $new_key )->to_new( $value );
                continue;
            }

            // Multi-mapped: assemble all slot values into one array, then
            // hand off to the transformer. Slots in other legacy options are
            // fetched via get_option(), cached per request.
            $all_slots   = $this->map[ $new_key ];
            $values      = [];
            $any_present = false;
            foreach ( $all_slots as $slot => $address ) {
                $source = $address->option() === $option_name
                    ? $legacy_payload
                    : ( $other_opt_cache[ $address->option() ] ??= $this->read_option( $address->option() ) );
                if ( $this->path_exists( $source, $address->path() ) ) {
                    $values[ $slot ] = $address->read_from( $source );
                    $any_present     = true;
                } else {
                    $values[ $slot ] = null;
                }
            }
            if ( ! $any_present ) {
                continue;
            }
            $slice[ $new_key ] = $this->resolve_transformer( $new_key )->to_new( $values );
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

        $legacy_cache = [];

        foreach ( $this->map as $new_key => $entry ) {
            if ( array_key_exists( $new_key, $new_option ) ) {
                continue;
            }
            if ( $entry instanceof LegacyAddress ) {
                $legacy = $legacy_cache[ $entry->option() ] ??= $this->read_option( $entry->option() );
                if ( $this->path_exists( $legacy, $entry->path() ) ) {
                    $new_option[ $new_key ] = $this->resolve_transformer( $new_key )->to_new( $entry->read_from( $legacy ) );
                } else {
                    $new_option[ $new_key ] = $this->get_schema_default( $new_key );
                }
                continue;
            }

            // Multi-mapped: read every slot, then transform.
            $values      = [];
            $any_present = false;
            foreach ( $entry as $slot => $address ) {
                $legacy = $legacy_cache[ $address->option() ] ??= $this->read_option( $address->option() );
                if ( $this->path_exists( $legacy, $address->path() ) ) {
                    $values[ $slot ] = $address->read_from( $legacy );
                    $any_present     = true;
                } else {
                    $values[ $slot ] = null;
                }
            }
            $new_option[ $new_key ] = $any_present
                ? $this->resolve_transformer( $new_key )->to_new( $values )
                : $this->get_schema_default( $new_key );
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
        $new_option = $this->settings_repo->all();
        if ( ! is_array( $new_option ) ) {
            $new_option = [];
        }
        $pairs = $this->by_option[ $option_name ] ?? [];
        foreach ( $pairs as $new_key => $entry ) {
            if ( ! array_key_exists( $new_key, $new_option ) ) {
                continue;
            }
            if ( $entry instanceof LegacyAddress ) {
                $legacy_value = $this->resolve_transformer( $new_key )->to_legacy( $new_option[ $new_key ] );
                $entry->write_to( $legacy_option, $legacy_value );
                continue;
            }
            // Multi-mapped: transform once, then write only the slots whose
            // addresses live under this option ($entry is pre-filtered).
            $multi_result = $this->resolve_transformer( $new_key )->to_legacy( $new_option[ $new_key ] );
            if ( ! is_array( $multi_result ) ) {
                continue;
            }
            foreach ( $entry as $slot => $address ) {
                if ( ! array_key_exists( $slot, $multi_result ) ) {
                    continue;
                }
                $address->write_to( $legacy_option, $multi_result[ $slot ] );
            }
        }
        return $legacy_option;
    }

    /**
     * Remove mapped key paths from a legacy-shaped payload.
     *
     * Used by writers that persist a legacy section option but want the
     * mapped keys to live exclusively in the new flat option. For 1:1
     * addresses, walks the path and unsets the leaf; for 1:N multi mappings
     * unsets every slot whose address lives under this section. Empty
     * parent arrays produced by leaf removal are pruned so the section row
     * doesn't accumulate dead structure.
     *
     * @since DOKAN_SINCE
     *
     * @param string              $option_name Legacy wp_option name.
     * @param array<string,mixed> $payload     Legacy-shaped payload.
     *
     * @return array<string,mixed> Payload with mapped paths removed.
     */
    public function strip_mapped_keys( string $option_name, array $payload ): array {
        $this->build_map();
        $pairs = $this->by_option[ $option_name ] ?? [];
        if ( empty( $pairs ) ) {
            return $payload;
        }
        foreach ( $pairs as $entry ) {
            if ( $entry instanceof LegacyAddress ) {
                $this->unset_path( $payload, $entry->path() );
                continue;
            }
            // Multi-mapped slice: only the slots in this option are present here.
            foreach ( $entry as $address ) {
                $this->unset_path( $payload, $address->path() );
            }
        }
        return $payload;
    }

    /**
     * Persist a legacy section payload through the bridge:
     *   1. Mirror mapped keys into the new flat option.
     *   2. Strip those mapped keys from the payload.
     *
     * Returns the stripped payload; the caller is responsible for the
     * `update_option( $option_name, ... )` write. The split keeps callers
     * in control of side effects (do_action hooks, cache flushes, etc.)
     * while centralizing the strip + mirror logic.
     *
     * Strict mode: stripping happens unconditionally. If the new-option
     * write throws, we log and continue — the mapped values are lost from
     * this save, but the legacy row never holds mapped data. Source of
     * truth stays single.
     *
     * @since DOKAN_SINCE
     *
     * @param string              $option_name Legacy wp_option name.
     * @param array<string,mixed> $payload     Legacy-shaped payload.
     *
     * @return array<string,mixed> Stripped payload, safe to `update_option`.
     */
    public function persist_legacy_section( string $option_name, array $payload ): array {
        try {
            $new_slice = $this->transform_legacy_payload_to_new( $option_name, $payload );
            if ( ! empty( $new_slice ) ) {
                $this->settings_repo->update( $new_slice );
            }
        } catch ( \Throwable $e ) {
            if ( function_exists( 'dokan_log' ) ) {
                dokan_log( '[LegacySettingsBridge] persist_legacy_section new-write failed: ' . $e->getMessage() );
            }
        }
        return $this->strip_mapped_keys( $option_name, $payload );
    }

    /**
     * Unset a value at the given path; prune empty arrays back up the chain.
     *
     * Recursive because PHP's stacked-reference pattern (`$stack[] = &$cursor;
     * $cursor = &$cursor[$seg];`) silently rebinds the stored references when
     * `$cursor` is reassigned.
     *
     * @param array<string,mixed> $target By-reference legacy payload.
     * @param array<int,string>   $path
     * @param int                 $i      Current path index.
     *
     * @return void
     */
    private function unset_path( array &$target, array $path, int $i = 0 ): void {
        if ( empty( $path ) || ! array_key_exists( $i, $path ) ) {
            return;
        }
        $segment = $path[ $i ];
        if ( ! is_array( $target ) || ! array_key_exists( $segment, $target ) ) {
            return;
        }
        if ( $i === count( $path ) - 1 ) {
            unset( $target[ $segment ] );
            return;
        }
        if ( ! is_array( $target[ $segment ] ) ) {
            return;
        }
        $this->unset_path( $target[ $segment ], $path, $i + 1 );
        if ( empty( $target[ $segment ] ) ) {
            unset( $target[ $segment ] );
        }
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
            $entry = $this->map[ $new_key ] ?? null;
            if ( $entry instanceof LegacyAddress ) {
                $legacy_value                              = $this->resolve_transformer( $new_key )->to_legacy( $value );
                $changes_by_option[ $entry->option() ][]   = [ $entry, $legacy_value ];
                continue;
            }
            if ( ! is_array( $entry ) ) {
                continue;
            }
            // Multi-mapped: run the transformer once and fan slot values out to
            // their respective options.
            $multi_result = $this->resolve_transformer( $new_key )->to_legacy( $value );
            if ( ! is_array( $multi_result ) ) {
                continue;
            }
            foreach ( $entry as $slot => $address ) {
                if ( ! array_key_exists( $slot, $multi_result ) ) {
                    continue;
                }
                $changes_by_option[ $address->option() ][] = [ $address, $multi_result[ $slot ] ];
            }
        }
        $written = [];
        foreach ( $changes_by_option as $option_name => $entries ) {
            $legacy = $this->read_option( $option_name );
            foreach ( $entries as $pair ) {
                [ $address, $legacy_value ] = $pair;
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
        $spec = $this->transformers[ $new_key ] ?? null;
        if ( null === $spec || '' === $spec ) {
            return $this->get_pass_through();
        }

        if ( is_array( $spec ) ) {
            $cache_key = 'callable:' . $new_key;
            if ( isset( $this->transformer_cache[ $cache_key ] ) ) {
                return $this->transformer_cache[ $cache_key ];
            }
            try {
                $instance = new CallableTransformer( $spec['to_new'], $spec['to_legacy'] );
            } catch ( \Throwable $unused ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
                unset( $unused );
                $instance = $this->get_pass_through();
            }
            $this->transformer_cache[ $cache_key ] = $instance;
            return $instance;
        }

        $fqcn = $spec;
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
     * The map is memoized but keyed on the combined callback count of
     * `dokan_get_admin_settings_schema` and `dokan_intelligence_providers`
     * (the latter drives the dynamic AI api_key/model fields). Contributors
     * register at varying priorities during boot; if a bridge caller fires
     * before all are registered, the count grows on the next call and the
     * memo invalidates automatically.
     *
     * Recursion safety: see `$building_map`.
     *
     * @return array<string,LegacyAddress>
     */
    private function build_map(): array {
        if ( $this->building_map ) {
            return is_array( $this->map ) ? $this->map : [];
        }

        global $wp_filter;

        $filter_count = 0;
        foreach ( [ 'dokan_get_admin_settings_schema', 'dokan_intelligence_providers' ] as $hook ) {
            if ( isset( $wp_filter[ $hook ] ) && ! empty( $wp_filter[ $hook ]->callbacks ) ) {
                $filter_count += count( $wp_filter[ $hook ]->callbacks, COUNT_RECURSIVE );
            }
        }

        if ( $this->map !== null && $this->cached_filter_count === $filter_count ) {
            return $this->map;
        }

        $this->building_map = true;
        try {
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
            $this->cached_filter_count       = $filter_count;
        } finally {
            $this->building_map = false;
        }

        return $this->map;
    }

    /**
     * Walk the post-filter schema, collecting legacy_key attrs and defaults.
     *
     * Accepts elements that are either `type: field` OR `bridge_only: true`.
     * Bridge-only fields participate in mapping but are not emitted by the
     * new UI; they still round-trip through the bridge.
     *
     * @return array{0: array<string,string|array{option:string,field:string}>, 1: array<string,mixed>, 2: array<string,string|array{to_new:mixed,to_legacy:mixed}>}
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
            } elseif (
                is_array( $transformer )
                && array_key_exists( 'to_new', $transformer )
                && array_key_exists( 'to_legacy', $transformer )
            ) {
                $transformers[ $id ] = [
                    'to_new'    => $transformer['to_new'],
                    'to_legacy' => $transformer['to_legacy'],
                ];
            }
        }

        return [ $map, $defaults, $transformers ];
    }

    /**
     * Normalize raw addresses into value objects, dropping malformed entries.
     *
     * Two `legacy_key` shapes are accepted:
     *   - Single: dotted string ("option.field") or struct
     *     `['option' => ..., 'field' => ...]`.
     *   - Multi:  associative array of slot name => single-form address. The
     *     transformer's `to_new` receives `array<slot, mixed>`; `to_legacy`
     *     must return the same shape.
     *
     * @param array<string, mixed> $map
     *
     * @return array{0: array<string, LegacyAddress|array<string, LegacyAddress>>, 1: array<string, array<string, LegacyAddress|array<string, LegacyAddress>>>}
     */
    private function normalize( array $map ): array {
        $normalized = [];
        $by_option  = [];

        foreach ( $map as $new_key => $raw ) {
            // Try single shape first.
            $single = LegacyAddress::parse( $raw );
            if ( null !== $single ) {
                $normalized[ $new_key ]                      = $single;
                $by_option[ $single->option() ][ $new_key ]  = $single;
                continue;
            }

            // Multi shape: assoc array of slot => address-input.
            if ( is_array( $raw ) ) {
                $multi = [];
                foreach ( $raw as $slot => $address_input ) {
                    if ( ! is_string( $slot ) || '' === $slot ) {
                        continue;
                    }
                    $address = LegacyAddress::parse( $address_input );
                    if ( null === $address ) {
                        continue;
                    }
                    $multi[ $slot ] = $address;
                }
                if ( ! empty( $multi ) ) {
                    $normalized[ $new_key ] = $multi;
                    foreach ( $multi as $slot => $address ) {
                        $by_option[ $address->option() ][ $new_key ][ $slot ] = $address;
                    }
                    continue;
                }
            }

            if ( function_exists( 'dokan_log' ) ) {
                dokan_log( sprintf( '[LegacySettingsBridge] dropping malformed legacy_key for "%s"', $new_key ) );
            }
        }

        return [ $normalized, $by_option ];
    }

    /**
     * Read a wp_option and coerce non-array values to an empty array so callers
     * can safely path-walk the result.
     *
     * @param string $option_name
     *
     * @return array<string, mixed>
     */
    private function read_option( string $option_name ): array {
        $value = get_option( $option_name, [] );
        return is_array( $value ) ? $value : [];
    }
}
