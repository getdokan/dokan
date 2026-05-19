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
}
