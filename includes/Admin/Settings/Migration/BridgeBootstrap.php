<?php

namespace WeDevs\Dokan\Admin\Settings\Migration;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Bridge Bootstrap.
 *
 * With the new flat `dokan_admin_settings` option as the canonical source
 * of truth, this bootstrap installs read-time overlay filters on every
 * mapped legacy `dokan_<section>` wp_option. Any `get_option('dokan_general')`
 * caller — Pro modules, third-party code, internal helpers — receives a
 * payload with mapped values projected in from the new flat option.
 *
 * The write side is handled at each writer (via
 * {@see LegacySettingsBridge::persist_legacy_section()}): mapped keys land
 * in `dokan_admin_settings`. When the legacy mirror is enabled (default —
 * see {@see LegacySettingsBridge::is_legacy_mirror_enabled()}) the legacy
 * row also keeps a physical copy of mapped values, maintained by
 * {@see LegacyMirror}, so plugin versions without this bridge (downgrades)
 * still read current data. With the mirror disabled the legacy row holds
 * unmapped keys only and the flat option is the single physical source.
 *
 * Reentry latch: the bridge's own internal reads (build_map, hydrate*)
 * must see raw legacy data, not the overlay; the static guard short-
 * circuits the filter while bridge work is in flight.
 *
 * @since DOKAN_SINCE
 */
class BridgeBootstrap implements Hookable {

    /**
     * Reentry latch. True while the overlay filter is itself running or
     * while the bridge is mid-reentrant work.
     *
     * @var bool
     */
    private static bool $in_overlay = false;

    /**
     * Bridge collaborator. May be null on construct — auto-resolved from
     * the DI container on first use so the bootstrap can be registered as
     * a zero-arg service.
     *
     * @var LegacySettingsBridge|null
     */
    private ?LegacySettingsBridge $bridge;

    /**
     * Sections we've already attached the `option_<name>` filter for.
     *
     * @var array<string,bool>
     */
    private array $registered_sections = [];

    /**
     * @param LegacySettingsBridge|null $bridge
     */
    public function __construct( ?LegacySettingsBridge $bridge = null ) {
        $this->bridge = $bridge;
    }

    /**
     * Run a callback with the overlay filters suppressed.
     *
     * Required by writers that must observe and persist the RAW legacy rows:
     * with the overlay active, `update_option()`'s internal old-value read is
     * projected too, so a physically-stale row can look up-to-date and the
     * write silently no-ops. The latch is saved/restored so nested calls are
     * safe.
     *
     * @since DOKAN_SINCE
     *
     * @param callable $callback Callback to run without the overlay.
     *
     * @return mixed The callback's return value.
     */
    public static function without_overlay( callable $callback ) {
        $previous         = self::$in_overlay;
        self::$in_overlay = true;
        try {
            return $callback();
        } finally {
            self::$in_overlay = $previous;
        }
    }

    /**
     * Lazily resolve the bridge.
     *
     * @return LegacySettingsBridge|null
     */
    private function resolve_bridge(): ?LegacySettingsBridge {
        if ( $this->bridge instanceof LegacySettingsBridge ) {
            return $this->bridge;
        }
        if ( function_exists( 'dokan_get_container' ) ) {
            try {
                $resolved = dokan_get_container()->get( LegacySettingsBridge::class );
                if ( $resolved instanceof LegacySettingsBridge ) {
                    $this->bridge = $resolved;
                    return $this->bridge;
                }
            } catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
                unset( $e );
            }
        }
        return null;
    }

    /**
     * {@inheritDoc}
     */
    public function register_hooks(): void {
        // Pro modules register their schema callbacks on `init` at varying
        // priorities; defer overlay-filter wiring until `init` priority 999
        // so the full mapping is harvestable when we ask for known sections.
        add_action( 'init', [ $this, 'register_overlay_filters' ], 999 );
    }

    /**
     * Register `option_<section>` filters for every legacy section the
     * bridge knows about. Safe to call more than once: previously-registered
     * sections are skipped (multiple boots in one request can happen during
     * tests).
     *
     * @return void
     */
    public function register_overlay_filters(): void {
        $bridge = $this->resolve_bridge();
        if ( ! $bridge instanceof LegacySettingsBridge ) {
            return;
        }
        foreach ( $this->known_sections( $bridge ) as $section ) {
            if ( isset( $this->registered_sections[ $section ] ) ) {
                continue;
            }
            $this->registered_sections[ $section ] = true;
            add_filter( "option_{$section}", [ $this, 'apply_overlay' ], 10, 2 );
            add_filter( "default_option_{$section}", [ $this, 'apply_overlay' ], 10, 2 );
        }
    }

    /**
     * Filter callback: project mapped values from the new flat option onto
     * the raw legacy section read.
     *
     * @param mixed  $value  Raw option value (may be `false` if option absent).
     * @param string $option Option name (provided by WordPress for the
     *                       `default_option_*` filter shape; deduced from
     *                       current_filter() otherwise).
     *
     * @return mixed
     */
    public function apply_overlay( $value, $option = '' ) {
        if ( self::$in_overlay ) {
            return $value;
        }
        if ( '' === $option ) {
            $current = current_filter();
            foreach ( [ 'option_', 'default_option_' ] as $prefix ) {
                if ( 0 === strpos( $current, $prefix ) ) {
                    $option = substr( $current, strlen( $prefix ) );
                    break;
                }
            }
        }
        if ( '' === $option ) {
            return $value;
        }
        $bridge = $this->resolve_bridge();
        if ( ! $bridge instanceof LegacySettingsBridge ) {
            return $value;
        }

        $legacy = is_array( $value ) ? $value : [];

        self::$in_overlay = true;
        try {
            $projected = $bridge->hydrate_legacy_from_new( $option, $legacy );
        } catch ( \Throwable $e ) {
            self::$in_overlay = false;
            if ( function_exists( 'dokan_log' ) ) {
                dokan_log( '[BridgeBootstrap] overlay failed for ' . $option . ': ' . $e->getMessage() );
            }
            return $value;
        }
        self::$in_overlay = false;

        // If the raw read was `false` (option missing) but overlay produced
        // entries, return the projected array so callers see the synthesized
        // view. Otherwise honor the original type contract.
        if ( false === $value && empty( $projected ) ) {
            return false;
        }
        return $projected;
    }

    /**
     * Unique legacy wp_option names that the bridge currently knows about.
     *
     * @param LegacySettingsBridge $bridge
     *
     * @return array<int,string>
     */
    private function known_sections( LegacySettingsBridge $bridge ): array {
        $map      = $bridge->get_mapping();
        $sections = [];
        foreach ( $map as $entry ) {
            if ( isset( $entry['option'] ) && is_string( $entry['option'] ) ) {
                $sections[ $entry['option'] ] = true;
                continue;
            }
            if ( is_array( $entry ) ) {
                foreach ( $entry as $slot ) {
                    if ( isset( $slot['option'] ) && is_string( $slot['option'] ) ) {
                        $sections[ $slot['option'] ] = true;
                    }
                }
            }
        }
        return array_keys( $sections );
    }
}
