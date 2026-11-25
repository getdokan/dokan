<?php

namespace WeDevs\Dokan\Admin\Settings\Migration;

use Exception;
use WeDevs\Dokan\Admin\Settings as AdminSettings;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepositoryInterface;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepositoryInterface;
use WeDevs\Dokan\Contracts\Hookable;
use WP_Error;

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
 * @since 5.2.0
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
     * Legacy-section repository. Lazily resolved like the bridge.
     *
     * @var LegacySettingsRepositoryInterface|null
     */
    private ?LegacySettingsRepositoryInterface $legacy_repo;

    /**
     * In-flight direct writes, keyed by legacy option name: `old` (overlay-projected) and `value`.
     *
     * @var array<string,array{old:array,value:array}>
     */
    private array $pending_writes = [];


    /**
     * @param LegacySettingsBridge|null              $bridge        Optional bridge for testing.
     * @param SettingsRepositoryInterface|null       $settings_repo Optional repo for testing.
     * @param LegacySettingsRepositoryInterface|null $legacy_repo   Optional legacy repo for testing.
     */
    public function __construct( ?LegacySettingsBridge $bridge = null, ?SettingsRepositoryInterface $settings_repo = null, ?LegacySettingsRepositoryInterface $legacy_repo = null ) {
        $this->bridge        = $bridge;
        $this->settings_repo = $settings_repo;
        $this->legacy_repo   = $legacy_repo;
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
     * Attach the direct-write listeners for every mapped legacy row.
     *
     * `pre_update_option_{section}` records the write; adoption runs on the `update_option`
     * / `add_option` actions. Both fire after WordPress picks update vs insert and
     * before the row is written, so the pick is unaffected (adopting earlier made
     * update_option() return false on a missing row), a zero-row update is still
     * adopted, and `update_option_{section}` listeners already see the new value.
     * A plain `add_option()` is not adopted: it has no previous value to diff, and
     * an installer's default payload would otherwise overwrite the flat option.
     *
     * @since 5.2.0
     *
     * @return void
     */
    public function register_write_listeners(): void {
        $bridge = $this->resolve_bridge();
        if ( ! $bridge instanceof LegacySettingsBridge ) {
            return;
        }
        foreach ( $bridge->known_sections() as $section ) {
            if ( ! has_filter( "pre_update_option_{$section}", [ $this, 'capture_direct_write' ] ) ) {
                add_filter( "pre_update_option_{$section}", [ $this, 'capture_direct_write' ], PHP_INT_MAX, 3 );
            }
        }
        if ( ! has_action( 'update_option', [ $this, 'adopt_before_update' ] ) ) {
            add_action( 'update_option', [ $this, 'adopt_before_update' ], PHP_INT_MIN, 3 );
            add_action( 'add_option', [ $this, 'adopt_before_add' ], PHP_INT_MIN, 2 );
        }
    }

    /**
     * Record a direct write to a legacy row: its overlay-projected old value and new value.
     *
     * @since 5.2.0
     *
     * @param mixed  $value     Value being written.
     * @param mixed  $old_value Previous (overlay-projected) value.
     * @param string $option    Legacy option name.
     *
     * @return mixed Unchanged value.
     */
    public function capture_direct_write( $value, $old_value, $option ) {
        unset( $this->pending_writes[ $option ] );
        // The bridge's own mirror writes run with the overlay suppressed.
        if ( BridgeBootstrap::is_overlay_suppressed() || ! is_array( $value ) ) {
            return $value;
        }
        $this->pending_writes[ $option ] = [
            'old'   => is_array( $old_value ) ? $old_value : [],
            'value' => $value,
        ];

        return $value;
    }

    /**
     * Adopt a direct write just before WordPress updates the existing row.
     *
     * @since 5.2.0
     *
     * @param string $option    Option name.
     * @param mixed  $old_value Previous value.
     * @param mixed  $value     Value being written.
     *
     * @return void
     */
    public function adopt_before_update( $option, $old_value, $value ): void {
        $this->adopt_direct_write( (string) $option, $value );
    }

    /**
     * Adopt a direct write just before WordPress inserts the missing row.
     *
     * @since 5.2.0
     *
     * @param string $option Option name.
     * @param mixed  $value  Value being written.
     *
     * @return void
     */
    public function adopt_before_add( $option, $value ): void {
        $this->adopt_direct_write( (string) $option, $value );
    }

    /**
     * Adopt the changed fields of a recorded direct write into `dokan_admin_settings`.
     *
     * Only fields whose value differs from the recorded old value are adopted,
     * so untouched (possibly stale) fields never overwrite the flat option.
     *
     * @since 5.2.0
     *
     * @param string $option Legacy option name.
     * @param mixed  $value  Value being written to the row.
     *
     * @return void
     */
    private function adopt_direct_write( string $option, $value ): void {
        if ( ! isset( $this->pending_writes[ $option ] ) ) {
            return;
        }
        $pending = $this->pending_writes[ $option ];
        unset( $this->pending_writes[ $option ] );
        // Only the write that was recorded: a later plain add_option() never matches a stale entry.
        if ( BridgeBootstrap::is_overlay_suppressed() || $pending['value'] !== $value ) {
            return;
        }
        $bridge = $this->resolve_bridge();
        $repo   = $this->resolve_settings_repo();
        if ( ! $bridge instanceof LegacySettingsBridge || null === $repo ) {
            return;
        }

        try {
            $before = $bridge->transform_legacy_payload_to_new( $option, $pending['old'] );
            $after  = $bridge->transform_legacy_payload_to_new( $option, $value );
            $adopt  = [];
            foreach ( $after as $key => $new_value ) {
                if ( ! array_key_exists( $key, $before ) || $before[ $key ] !== $new_value ) {
                    $adopt[ $key ] = $new_value;
                }
            }
            if ( ! empty( $adopt ) ) {
                // No write-through: the caller's own write stores the row right after.
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
     * @since 5.2.0
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
     * @since 5.2.0
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
     * @since 5.2.0
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

        // Read only in wp-admin (reconcile) and on settings saves, so keep it out of alloptions.
        update_option( self::SNAPSHOT_KEY, $snapshot, false );
        // update_option() skips the autoload change when the value is unchanged; fix rows stamped before.
        if ( function_exists( 'wp_set_option_autoload' ) ) {
            wp_set_option_autoload( self::SNAPSHOT_KEY, false );
        }
    }

    /**
     * Project the RAW legacy rows into new-key space.
     *
     * Reads every mapped section with the overlay suppressed and transforms
     * the mapped values through the bridge, producing a deterministic
     * `field_id => value` map suitable for baseline comparison and adoption.
     *
     * @since 5.2.0
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
     * Fire `dokan_before_saving_settings` for every legacy section a new-settings save maps to.
     *
     * @since 5.2.0
     *
     * @param array<string,mixed> $new_slice New-option keys and values about to be saved.
     *
     * @return array<string,array>|WP_Error Legacy rows before the save keyed by option name,
     *                                      or a validation error when a listener stopped the save.
     */
    public function before_save( array $new_slice ) {
        $bridge = $this->resolve_bridge();
        if ( ! $bridge instanceof LegacySettingsBridge ) {
            return [];
        }

        $before = [];
        foreach ( $bridge->legacy_options_for( $new_slice ) as $section ) {
            $before[ $section ] = $this->resolve_legacy_repo()->all( $section );
        }
        $new_values = $bridge->apply_new_to_legacy( $new_slice, $before );

        // Admin\Settings hooks the legacy save listeners but only loads in wp-admin; REST saves need it too.
        dokan_get_container()->get( AdminSettings::class );

        try {
            foreach ( $before as $section => $old_value ) {
                do_action( 'dokan_before_saving_settings', $section, $new_values[ $section ], $old_value );
            }
        } catch ( Exception $e ) {
            return new WP_Error(
                'dokan_rest_validation_failed',
                __( 'Validation failed for one or more fields.', 'dokan-lite' ),
                [ 'status' => 400 ]
            );
        }

        return $before;
    }

    /**
     * Fire `dokan_after_saving_settings` per legacy section once a new-settings save is stored.
     *
     * @since 5.2.0
     *
     * @param array<string,array> $before Result of {@see before_save()}.
     *
     * @return void
     */
    public function after_save( array $before ): void {
        foreach ( $before as $section => $old_value ) {
            $this->resolve_legacy_repo()->flush_cache( $section );
            do_action( 'dokan_after_saving_settings', $section, $this->resolve_legacy_repo()->all( $section ), $old_value );
        }
    }

    /**
     * Lazily resolve the legacy-section repository.
     *
     * @return LegacySettingsRepositoryInterface
     */
    private function resolve_legacy_repo(): LegacySettingsRepositoryInterface {
        $this->legacy_repo ??= dokan_get_container()->get( LegacySettingsRepository::class );

        return $this->legacy_repo;
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
