<?php

namespace WeDevs\Dokan\Admin\Settings\Repository;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;

/**
 * Default legacy settings repository.
 *
 * Reads/writes legacy per-section `dokan_*` wp_options with overlay + mirror.
 *
 * @since DOKAN_SINCE
 */
final class LegacySettingsRepository implements LegacySettingsRepositoryInterface {

    private SettingsRepositoryInterface $new_repo;

    private LegacySettingsBridge $bridge;

    /**
     * Per-section in-request snapshot cache.
     *
     * @var array<string, array<string, mixed>>
     */
    private array $snapshots = [];

    public function __construct(
        ?SettingsRepositoryInterface $new_repo = null,
        ?LegacySettingsBridge $bridge = null
    ) {
        $this->new_repo = $new_repo ?? new SettingsRepository();
        $this->bridge   = $bridge ?? new LegacySettingsBridge();
        add_action( 'init', [ $this, 'init' ] );
    }
    public function init(): void {

        foreach ( $this->known_sections() as $section ) {
            add_action( "update_option_{$section}", [ $this, 'on_section_changed' ] );
            add_action( "add_option_{$section}", [ $this, 'on_section_changed' ] );
            add_action( "delete_option_{$section}", [ $this, 'on_section_changed' ] );
        }

        // The new flat option participates in every overlay — its writes invalidate
        // every snapshot. Use named callbacks so the same listener isn't bound twice
        // if the repository is instantiated more than once in a request.
        $new_option = SettingsRepository::OPTION_KEY;
        add_action( "update_option_{$new_option}", [ $this, 'flush_all_snapshots' ] );
        add_action( "add_option_{$new_option}", [ $this, 'flush_all_snapshots' ] );
        add_action( "delete_option_{$new_option}", [ $this, 'flush_all_snapshots' ] );
    }

    public function all( string $section ): array {
        if ( ! array_key_exists( $section, $this->snapshots ) ) {
            $raw = get_option( $section, [] );
            $raw = is_array( $raw ) ? $raw : [];

            $this->snapshots[ $section ] = $this->bridge->hydrate_legacy_from_new( $section, $raw );
        }
        return $this->snapshots[ $section ];
    }

    public function get( string $section, string $key, $default_value = null ) {
        $all = $this->all( $section );
        return array_key_exists( $key, $all ) ? $all[ $key ] : $default_value;
    }

    public function update( string $section, array $slice ): array {
        $current = $this->all( $section );

        /**
         * Filter the slice about to be merged into a legacy section option.
         *
         * Subscribers may add, remove, or normalize keys. Returning an empty
         * array effectively blocks the write (the diff becomes empty and
         * neither the legacy option nor the new-flat mirror is touched).
         *
         * @since DOKAN_SINCE
         *
         * @param array<string,mixed> $slice   Incoming change set.
         * @param string              $section Legacy wp_option name.
         * @param array<string,mixed> $current Overlay-applied view before the write.
         */
        $slice = (array) apply_filters( 'dokan_legacy_settings_pre_save', $slice, $section, $current );

        $changed = self::diff( $current, $slice );
        if ( empty( $changed ) ) {
            return [];
        }

        // Route the incoming slice through the bridge: mapped keys go to the
        // new flat option only; the legacy row holds unmapped keys only.
        $stripped_slice = $this->bridge->persist_legacy_section( $section, $slice );

        $raw    = get_option( $section, [] );
        $raw    = is_array( $raw ) ? $raw : [];
        // Defensive: a previously-stored legacy row may still hold mapped keys
        // (lazy migration policy — we never backfill on read). Strip them on
        // every write so the saved row converges on the invariant.
        $raw    = $this->bridge->strip_mapped_keys( $section, $raw );
        $merged = array_merge( $raw, $stripped_slice );

        update_option( $section, $merged, true );
        // Refresh our snapshot now — the WP hook already flushed it, but we want
        // the next read in *this* request to skip a get_option round-trip.
        $this->snapshots[ $section ] = $this->bridge->hydrate_legacy_from_new( $section, $merged );

        /**
         * Fired after a successful write to a legacy section option.
         *
         * @since DOKAN_SINCE
         *
         * @param string              $section Legacy wp_option name.
         * @param array<string,mixed> $changed Added/changed entries.
         * @param array<string,mixed> $current Overlay-applied view before the write.
         * @param array<string,mixed> $merged  Raw section payload after the write.
         */
        do_action( 'dokan_legacy_settings_changed', $section, $changed, $current, $merged );

        return $changed;
    }

    public function replace( string $section, array $payload ): array {
        $current = $this->all( $section );

        /** This filter is documented in includes/Admin/Settings/Repository/LegacySettingsRepository.php */
        $payload = (array) apply_filters( 'dokan_legacy_settings_pre_save', $payload, $section, $current );

        $diff = self::diff( $current, $payload );
        foreach ( $current as $k => $_ ) {
            if ( ! array_key_exists( $k, $payload ) ) {
                $diff[ $k ] = null;
            }
        }

        // `replace` is a full-row write, so mapped keys must be peeled off
        // before we land the legacy option. The bridge mirrors them into the
        // new flat option as a side effect.
        $stripped_payload = $this->bridge->persist_legacy_section( $section, $payload );

        update_option( $section, $stripped_payload, true );
        $this->snapshots[ $section ] = $this->bridge->hydrate_legacy_from_new( $section, $stripped_payload );

        if ( ! empty( $diff ) ) {
            /** This action is documented in includes/Admin/Settings/Repository/LegacySettingsRepository.php */
            do_action( 'dokan_legacy_settings_changed', $section, $diff, $current, $payload );
        }

        return $diff;
    }

    public function flush_cache( ?string $section = null ): void {
        if ( null === $section ) {
            $this->snapshots = [];
            return;
        }
        unset( $this->snapshots[ $section ] );
    }

    /**
     * WP hook listener — receives `($option, …)` from add_option / `($old, $new, $option)` from update_option.
     * We only need the option name, which we derive from the current filter name.
     *
     * @return void
     */
    public function on_section_changed(): void {
        $option = current_action();
        foreach ( [ 'update_option_', 'add_option_' ] as $prefix ) {
            if ( 0 === strpos( $option, $prefix ) ) {
                $section = substr( $option, strlen( $prefix ) );
                $this->flush_cache( $section );
                return;
            }
        }
    }

    /**
     * Listener for the new flat option — every section snapshot must be flushed
     * because the overlay source changed.
     *
     * @return void
     */
    public function flush_all_snapshots(): void {
        $this->flush_cache( null );
    }

    /**
     * Unique legacy wp_option names that the bridge currently knows about.
     *
     * @return array<int,string>
     */
    private function known_sections(): array {
        $map      = $this->bridge->get_mapping();
        $sections = [];
        foreach ( $map as $entry ) {
            if ( is_array( $entry ) && isset( $entry['option'] ) && is_string( $entry['option'] ) ) {
                $sections[ $entry['option'] ] = true;
            }
        }
        return array_keys( $sections );
    }

    /**
     * Strict-equality diff: returns added or modified entries only.
     *
     * @param array<string,mixed> $old
     * @param array<string,mixed> $new_payload
     *
     * @return array<string,mixed>
     */
    private static function diff( array $old, array $new_payload ): array {
        $out = [];
        foreach ( $new_payload as $k => $v ) {
            if ( ! array_key_exists( $k, $old ) || $old[ $k ] !== $v ) {
                $out[ $k ] = $v;
            }
        }
        return $out;
    }
}
