<?php

namespace WeDevs\Dokan\Admin\Settings\Repository;

/**
 * Default settings repository backed by the `dokan_admin_settings` wp_option.
 *
 * @since DOKAN_SINCE
 */
final class SettingsRepository implements SettingsRepositoryInterface {

    /**
     * Canonical storage key for the new flat admin settings payload.
     */
    public const OPTION_KEY = 'dokan_admin_settings';

    /**
     * In-request snapshot of the payload. Null means "not yet loaded".
     *
     * @var array<string,mixed>|null
     */
    private ?array $snapshot = null;

    /**
     * Subscribes a cache-invalidation listener to WordPress's option hooks
     * for {@see self::OPTION_KEY}. Foreign writers (raw `update_option`
     * calls, migrations, third-party code) bypass `update()` but still fire
     * the WP hook — without this listener the repository's in-request
     * snapshot would go stale until {@see flush_cache()} is called.
     */
    public function __construct() {
        add_action( 'update_option_' . self::OPTION_KEY, [ $this, 'flush_cache' ] );
        add_action( 'add_option_' . self::OPTION_KEY, [ $this, 'flush_cache' ] );
        add_action( 'delete_option_' . self::OPTION_KEY, [ $this, 'flush_cache' ] );
    }

    /**
     * {@inheritDoc}
     */
    public function all(): array {
        if ( null === $this->snapshot ) {
            $stored         = get_option( self::OPTION_KEY, [] );
            $this->snapshot = is_array( $stored ) ? $stored : [];
        }
        return $this->snapshot;
    }

    /**
     * {@inheritDoc}
     */
    public function get( string $key, $default_value = null ) {
        $all = $this->all();
        return array_key_exists( $key, $all ) ? $all[ $key ] : $default_value;
    }

    /**
     * {@inheritDoc}
     */
    public function update( array $slice ): array {
        $current = $this->all();

        /**
         * Filter the slice about to be merged into `dokan_admin_settings`.
         *
         * Subscribers may add, remove, or normalize keys. Returning an
         * empty array effectively blocks the write (the diff becomes
         * empty and the option is not touched).
         *
         * @since DOKAN_SINCE
         *
         * @param array<string,mixed> $slice   Incoming change set.
         * @param array<string,mixed> $current Payload currently in storage.
         */
        $slice = (array) apply_filters( 'dokan_admin_settings_pre_save', $slice, $current );

        $changed = self::diff( $current, $slice );
        if ( empty( $changed ) ) {
            return [];
        }

        $merged = array_merge( $current, $slice );

        update_option( self::OPTION_KEY, $merged, true );

        $this->snapshot = $merged;

        /**
         * Fired after a successful write to `dokan_admin_settings`.
         *
         * Internal subscribers (e.g. {@see \WeDevs\Dokan\Admin\Settings\Migration\BridgeBootstrap})
         * listen here instead of WordPress's `update_option_*` hooks so
         * that foreign writes that bypass the repository are handled by
         * the backstop path explicitly.
         *
         * @since DOKAN_SINCE
         *
         * @param array<string,mixed> $changed Added/modified entries.
         * @param array<string,mixed> $current Payload before the write.
         * @param array<string,mixed> $merged  Payload after the write.
         */
        do_action( 'dokan_admin_settings_changed', $changed, $current, $merged );

        return $changed;
    }

    /**
     * {@inheritDoc}
     */
    public function replace( array $payload ): array {
        $current = $this->all();

        /** This filter is documented in includes/Admin/Settings/Repository/SettingsRepository.php */
        $payload = (array) apply_filters( 'dokan_admin_settings_pre_save', $payload, $current );

        $diff = self::diff( $current, $payload );
        foreach ( $current as $k => $_ ) {
            if ( ! array_key_exists( $k, $payload ) ) {
                $diff[ $k ] = null;
            }
        }

        update_option( self::OPTION_KEY, $payload, true );

        $this->snapshot = $payload;

        if ( ! empty( $diff ) ) {
            /** This action is documented in includes/Admin/Settings/Repository/SettingsRepository.php */
            do_action( 'dokan_admin_settings_changed', $diff, $current, $payload );
        }

        return $diff;
    }

    /**
     * {@inheritDoc}
     */
    public function flush_cache(): void {
        $this->snapshot = null;
    }

    /**
     * Added/changed entries only. Strict equality so `false` vs `0` and
     * similar near-misses count as changes.
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
