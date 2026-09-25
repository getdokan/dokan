<?php

namespace WeDevs\Dokan\Admin\Settings\Repository;

/**
 * Legacy Settings Repository contract.
 *
 * Single sanctioned read/write surface for the legacy per-section `dokan_*`
 * wp_options (`dokan_general`, `dokan_selling`, `dokan_appearance`,
 * `dokan_pages`, `dokan_privacy`, `dokan_withdraw`, …).
 *
 * Reads apply the new-flat overlay via {@see \WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge}.
 * Writes persist to the legacy section option AND mirror mapped keys to the
 * new flat option via {@see SettingsRepositoryInterface}.
 *
 * @since DOKAN_SINCE
 */
interface LegacySettingsRepositoryInterface {

    /**
     * Full overlay-applied view of one legacy section.
     *
     * @param string $section Legacy wp_option name (e.g. `dokan_general`).
     *
     * @return array<string,mixed>
     */
    public function all( string $section ): array;

    /**
     * Single-key overlay-applied read.
     *
     * @param string $section       Legacy wp_option name.
     * @param string $key           Field id inside that section.
     * @param mixed  $default_value Returned when the key is absent.
     *
     * @return mixed
     */
    public function get( string $section, string $key, $default_value = null );

    /**
     * Batch upsert: merges `$slice` into the legacy section option and
     * mirrors mapped keys to `dokan_admin_settings`.
     *
     * Fires:
     *  - `dokan_legacy_settings_pre_save` filter — subscribers may mutate `$slice`.
     *  - `dokan_legacy_settings_changed` action — fires on non-empty diff.
     *
     * @param string              $section Legacy wp_option name.
     * @param array<string,mixed> $slice
     *
     * @return array<string,mixed> Added/changed entries actually written.
     */
    public function update( string $section, array $slice ): array;

    /**
     * Full replacement of one section's payload. Returns a deletion-aware
     * diff (removed keys appear as `null`). Mirrors mapped keys to the new
     * flat option.
     *
     * @param string              $section Legacy wp_option name.
     * @param array<string,mixed> $payload
     *
     * @return array<string,mixed>
     */
    public function replace( string $section, array $payload ): array;

    /**
     * Drop the in-request snapshot. Pass null to flush every section.
     *
     * @param string|null $section
     *
     * @return void
     */
    public function flush_cache( ?string $section = null ): void;
}
