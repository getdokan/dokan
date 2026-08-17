<?php

namespace WeDevs\Dokan\Admin\Settings\Repository;

/**
 * Settings Repository contract.
 *
 * Single sanctioned read/write surface for the new flat admin settings
 * payload (`dokan_admin_settings`). All internal save paths must flow
 * through an implementation so that custom events fire consistently and
 * the in-request snapshot stays coherent.
 *
 * @since DOKAN_SINCE
 */
interface SettingsRepositoryInterface {

    /**
     * Return the full settings payload. Empty array when the option does
     * not exist or stores a non-array value; never null.
     *
     * @return array<string,mixed>
     */
    public function all(): array;

    /**
     * Single-key read with default. Reads the in-request snapshot so repeat
     * calls within one write/read cycle stay consistent.
     *
     * @param string $key
     * @param mixed  $default_value
     *
     * @return mixed
     */
    public function get( string $key, $default_value = null );

    /**
     * Batch upsert. Only the supplied keys are written; everything else in
     * storage is preserved (`array_merge` semantics). Returns the computed
     * diff (added/changed keys with their new values).
     *
     * Fires:
     *   - `dokan_admin_settings_pre_save` filter — subscribers may mutate `$slice`.
     *   - `dokan_admin_settings_changed` action — fired only when the diff is
     *     non-empty after the write succeeds.
     *
     * @param array<string,mixed> $slice
     *
     * @return array<string,mixed> The change set actually written.
     */
    public function update( array $slice ): array;

    /**
     * Replace the entire payload. Used for migrations / imports only.
     * Internal save paths should prefer `update()`.
     *
     * @param array<string,mixed> $payload
     *
     * @return array<string,mixed> Diff including removed keys as `null`.
     */
    public function replace( array $payload ): array;

    /**
     * Drop the in-request snapshot. Used by tests and by subscribers that
     * must re-read after foreign writes (e.g. raw `update_option` calls
     * from third-party code).
     *
     * @return void
     */
    public function flush_cache(): void;
}
