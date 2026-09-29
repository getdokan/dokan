<?php

namespace WeDevs\Dokan\Admin\Settings\Migration;

use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepositoryInterface;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Legacy Mirror.
 *
 * Keeps the legacy per-section `dokan_*` rows a physical, downgrade-safe
 * copy of the mapped values in `dokan_admin_settings`, and reconciles edits
 * made while this code was absent (plugin downgraded to a version without
 * the bridge) back into the flat option on re-upgrade.
 *
 * Two responsibilities, both gated on
 * {@see LegacySettingsBridge::is_legacy_mirror_enabled()}:
 *
 * 1. Write-through: every `dokan_admin_settings_changed` fans the changed
 *    values out to the legacy rows via
 *    {@see LegacySettingsBridge::write_new_to_legacy()}, so an OLD plugin
 *    version reading raw `dokan_general` etc. sees current data.
 * 2. Direct-write adoption: a plain `update_option( 'dokan_<section>' )`
 *    from CLI, cron or third-party code is adopted into
 *    `dokan_admin_settings` as soon as it happens. Without this the overlay
 *    keeps serving the stale flat value, so the write has no effect.
 * 3. Reconciliation: a baseline snapshot of the mapped legacy values (in
 *    new-key space) is stored after every mirror write. On `admin_init`
 *    the raw rows are compared against that baseline; keys that changed
 *    while the bridge was not watching are adopted into
 *    `dokan_admin_settings` — last write wins, so settings saved on an old
 *    plugin version survive the re-upgrade instead of being shadowed by a
 *    stale flat-option snapshot. Baseline entries for fields that are not
 *    mapped right now (e.g. a deactivated module) are kept, so an edit made
 *    while the module was off is still adopted when it comes back.
 *
 * All raw row reads/writes run inside
 * {@see BridgeBootstrap::without_overlay()} — with the overlay active,
 * `update_option()`'s internal old-value read is projected from the flat
 * option, a stale row looks current, and the physical write silently
 * no-ops.
 *
 * @since DOKAN_SINCE
 */
class LegacyMirror implements Hookable {

    /**
     * Option holding the baseline snapshot of mapped legacy values, keyed
     * by new-flat field id, as of the last mirror write.
     */
    public const SNAPSHOT_KEY = 'dokan_admin_settings_legacy_snapshot';

    /**
     * Bridge collaborator. May be null on construct — auto-resolved from
     * the DI container on first use so the mirror can be registered as a
     * zero-arg service.
     *
     * @var LegacySettingsBridge|null
     */
    private ?LegacySettingsBridge $bridge;

    /**
     * Flat-option repository. Lazily resolved like the bridge.
     *
     * @var SettingsRepositoryInterface|null
     */
    private ?SettingsRepositoryInterface $settings_repo;

    /**
     * @param LegacySettingsBridge|null        $bridge        Optional bridge for testing.
     * @param SettingsRepositoryInterface|null $settings_repo Optional repo for testing.
     */
    public function __construct( ?LegacySettingsBridge $bridge = null, ?SettingsRepositoryInterface $settings_repo = null ) {
        $this->bridge        = $bridge;
        $this->settings_repo = $settings_repo;
    }

    /**
     * {@inheritDoc}
     */
    public function register_hooks(): void {
        add_action( 'dokan_admin_settings_changed', [ $this, 'mirror_changes' ] );
        // After BridgeBootstrap's overlay wiring (init@999) so the mapping is
        // complete. Direct writes in the current request are adopted by the
        // write listeners; reconciliation only has to catch edits made while
        // this code was not loaded (downgrade window), so admin-only is enough.
        add_action( 'init', [ $this, 'register_write_listeners' ], 1000 );
        add_action( 'admin_init', [ $this, 'maybe_reconcile' ], 5 );
    }

    /**
     * Attach the direct-write filter to every mapped legacy row.
     *
     * `pre_update_option_{section}` runs for every `update_option()` call,
     * before WordPress decides to update or add the row. A plain
     * `add_option()` is not adopted: it has no previous value to diff, and an
     * installer's default payload would otherwise overwrite the flat option.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_write_listeners(): void {
        $bridge = $this->resolve_bridge();
        if ( ! $bridge instanceof LegacySettingsBridge ) {
            return;
        }
        foreach ( $bridge->known_sections() as $section ) {
            if ( ! has_filter( "pre_update_option_{$section}", [ $this, 'adopt_direct_write' ] ) ) {
                add_filter( "pre_update_option_{$section}", [ $this, 'adopt_direct_write' ], PHP_INT_MAX, 3 );
            }
        }
    }

    /**
     * Adopt a direct write to a legacy row into `dokan_admin_settings`.
     *
     * The old value is the overlay-projected view the writer read and edited.
     * Both values are transformed into new-key space and only fields whose
     * value changed are adopted, so untouched (possibly stale) fields never
     * overwrite the flat option. The write-through is switched off for this
     * adoption: the caller's own `update_option()` writes the row right after.
     * The bridge's own mirror writes run with the overlay suppressed and are
     * ignored. Filter callback; returns the value unchanged.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed  $value     New value being written to the row.
     * @param mixed  $old_value Previous (overlay-projected) value.
     * @param string $option    Legacy option name.
     *
     * @return mixed
     */
    public function adopt_direct_write( $value, $old_value, $option ) {
        if ( BridgeBootstrap::is_overlay_suppressed() || ! is_array( $value ) ) {
            return $value;
        }
        $bridge = $this->resolve_bridge();
        $repo   = $this->resolve_settings_repo();
        if ( ! $bridge instanceof LegacySettingsBridge || null === $repo ) {
            return $value;
        }

        try {
            $before = $bridge->transform_legacy_payload_to_new( (string) $option, is_array( $old_value ) ? $old_value : [] );
            $after  = $bridge->transform_legacy_payload_to_new( (string) $option, $value );
            $adopt  = [];
            foreach ( $after as $key => $new_value ) {
                if ( ! array_key_exists( $key, $before ) || $before[ $key ] !== $new_value ) {
                    $adopt[ $key ] = $new_value;
                }
            }
            if ( ! empty( $adopt ) ) {
                // Own closure, so a site's `__return_false` on this filter is never removed.
                $no_mirror = static function () {
                    return false;
                };
                add_filter( 'dokan_admin_settings_legacy_mirror', $no_mirror, PHP_INT_MAX );
                try {
                    $repo->update( $adopt );
                } finally {
                    remove_filter( 'dokan_admin_settings_legacy_mirror', $no_mirror, PHP_INT_MAX );
                }
            }
        } catch ( \Throwable $e ) {
            if ( function_exists( 'dokan_log' ) ) {
                dokan_log( '[LegacyMirror] direct-write adoption failed for ' . $option . ': ' . $e->getMessage() );
            }
        }

        return $value;
    }

    /**
     * Write-through: mirror a changed flat-option slice into the legacy rows.
     *
     * Listens on `dokan_admin_settings_changed`, so every internal save path
     * (REST controller, legacy section saves, reconciliation) keeps the rows
     * current. `null` entries (key removals reported by `replace()`) are
     * skipped — the stale legacy leaf is harmless because reads stay
     * overlay-projected.
     *
     * @since DOKAN_SINCE
     *
     * @param array<string,mixed> $changed Added/modified flat-option entries.
     *
     * @return void
     */
    public function mirror_changes( array $changed ): void {
        if ( ! LegacySettingsBridge::is_legacy_mirror_enabled() ) {
            return;
        }
        $bridge = $this->resolve_bridge();
        if ( ! $bridge instanceof LegacySettingsBridge ) {
            return;
        }
        $slice = array_filter(
            $changed,
            static function ( $value ) {
                return null !== $value;
            }
        );
        try {
            if ( ! empty( $slice ) ) {
                BridgeBootstrap::without_overlay(
                    static function () use ( $bridge, $slice ) {
                        return $bridge->write_new_to_legacy( $slice );
                    }
                );
            }
            $this->stamp();
        } catch ( \Throwable $e ) {
            if ( function_exists( 'dokan_log' ) ) {
                dokan_log( '[LegacyMirror] write-through failed: ' . $e->getMessage() );
            }
        }
    }

    /**
     * Reconcile edits made while the bridge was absent (downgrade window).
     *
     * Compares the raw legacy rows against the stored baseline snapshot.
     * A key whose raw legacy value changed since the baseline was written
     * by something without the bridge — an older plugin version — so its
     * value is adopted into `dokan_admin_settings` (last write wins).
     *
     * First run (no baseline yet): materializes the full mirror into the
     * legacy rows, healing rows stripped under the old strict model, then
     * stamps the baseline.
     *
     * Keys absent from the baseline are never adopted: they are either
     * newly-mapped schema fields (where the flat option may hold the newer
     * value) or rows the lazy read-time hydration already serves live.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function maybe_reconcile(): void {
        if ( ! LegacySettingsBridge::is_legacy_mirror_enabled() ) {
            return;
        }
        $bridge = $this->resolve_bridge();
        $repo   = $this->resolve_settings_repo();
        if ( ! $bridge instanceof LegacySettingsBridge || null === $repo ) {
            return;
        }

        try {
            $current = $this->snapshot_legacy_as_new();
            $stored  = get_option( self::SNAPSHOT_KEY, null );

            if ( ! is_array( $stored ) ) {
                // First run: make the rows a full physical mirror, then baseline.
                $payload = $repo->all();
                if ( ! empty( $payload ) ) {
                    BridgeBootstrap::without_overlay(
                        static function () use ( $bridge, $payload ) {
                            return $bridge->write_new_to_legacy( $payload );
                        }
                    );
                }
                $this->stamp();
                return;
            }

            // Retained entries for currently-unmapped fields stay out of the comparison.
            if ( array_intersect_key( $stored, $current ) === $current ) {
                return;
            }

            $flat  = $repo->all();
            $adopt = [];
            foreach ( $current as $key => $value ) {
                if ( ! array_key_exists( $key, $stored ) || $stored[ $key ] === $value ) {
                    continue;
                }
                if ( array_key_exists( $key, $flat ) && $flat[ $key ] === $value ) {
                    continue;
                }
                $adopt[ $key ] = $value;
            }

            if ( ! empty( $adopt ) ) {
                // Fires dokan_admin_settings_changed → mirror_changes() → stamp().
                $repo->update( $adopt );
            }
            $this->stamp( $current );
        } catch ( \Throwable $e ) {
            if ( function_exists( 'dokan_log' ) ) {
                dokan_log( '[LegacyMirror] reconciliation failed: ' . $e->getMessage() );
            }
        }
    }

    /**
     * Store the baseline snapshot of the mapped legacy values.
     *
     * Entries of the previous baseline whose field is not mapped right now
     * are carried over. A deactivated module drops its fields from the
     * schema; without this, the next save would erase their baseline, and an
     * edit made to its legacy row while it was off would never be adopted on
     * reactivation. Entries for fields removed for good stay behind as inert
     * data — reconciliation only walks currently-mapped fields.
     *
     * @since DOKAN_SINCE
     *
     * @param array<string,mixed>|null $snapshot Precomputed snapshot, or null to recompute.
     *
     * @return void
     */
    public function stamp( ?array $snapshot = null ): void {
        $snapshot = $snapshot ?? $this->snapshot_legacy_as_new();
        $previous = get_option( self::SNAPSHOT_KEY, null );
        $bridge   = $this->resolve_bridge();

        if ( is_array( $previous ) && $bridge instanceof LegacySettingsBridge ) {
            $snapshot += array_diff_key( $previous, $bridge->get_mapping() );
            ksort( $snapshot );
        }

        update_option( self::SNAPSHOT_KEY, $snapshot, true );
    }

    /**
     * Project the RAW legacy rows into new-key space.
     *
     * Reads every mapped section with the overlay suppressed and transforms
     * the mapped values through the bridge, producing a deterministic
     * `field_id => value` map suitable for baseline comparison and adoption.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string,mixed>
     */
    public function snapshot_legacy_as_new(): array {
        $bridge = $this->resolve_bridge();
        if ( ! $bridge instanceof LegacySettingsBridge ) {
            return [];
        }
        $snapshot = BridgeBootstrap::without_overlay(
            static function () use ( $bridge ) {
                $result = [];
                foreach ( $bridge->known_sections() as $section ) {
                    $raw = get_option( $section, [] );
                    if ( ! is_array( $raw ) || empty( $raw ) ) {
                        continue;
                    }
                    $result += $bridge->transform_legacy_payload_to_new( $section, $raw );
                }
                return $result;
            }
        );
        ksort( $snapshot );
        return $snapshot;
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
     * Lazily resolve the flat-option repository.
     *
     * @return SettingsRepositoryInterface|null
     */
    private function resolve_settings_repo(): ?SettingsRepositoryInterface {
        if ( $this->settings_repo instanceof SettingsRepositoryInterface ) {
            return $this->settings_repo;
        }
        if ( function_exists( 'dokan_get_container' ) ) {
            try {
                $resolved = dokan_get_container()->get( SettingsRepository::class );
                if ( $resolved instanceof SettingsRepositoryInterface ) {
                    $this->settings_repo = $resolved;
                    return $this->settings_repo;
                }
            } catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
                unset( $e );
            }
        }
        return null;
    }
}
