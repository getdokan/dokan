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

        foreach ( $this->known_sections() as $section ) {
            add_action( "update_option_{$section}", [ $this, 'on_section_changed' ] );
            add_action( "add_option_{$section}", [ $this, 'on_section_changed' ] );
        }

        // The new flat option participates in every overlay — its writes invalidate
        // every snapshot. Use named callbacks so the same listener isn't bound twice
        // if the repository is instantiated more than once in a request.
        $new_option = SettingsRepository::OPTION_KEY;
        add_action( "update_option_{$new_option}", [ $this, 'flush_all_snapshots' ] );
        add_action( "add_option_{$new_option}", [ $this, 'flush_all_snapshots' ] );
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
        return [];
    }

    public function replace( string $section, array $payload ): array {
        return [];
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
}
