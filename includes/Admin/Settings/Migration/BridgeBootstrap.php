<?php

namespace WeDevs\Dokan\Admin\Settings\Migration;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Bridge Bootstrap.
 *
 * Subscribes to the repository's `dokan_admin_settings_changed` action so that
 * every save of the new flat option mirrors changed keys back into the
 * relevant legacy `dokan_<section>` wp_options. Direct-`get_option()`
 * readers (Pro modules, third-party code) keep seeing fresh values
 * without going through the new option.
 *
 * Reentry guard prevents infinite recursion if `write_new_to_legacy()`
 * triggers a downstream listener that re-emits a repository update.
 *
 * @since DOKAN_SINCE
 */
class BridgeBootstrap implements Hookable {

    /**
     * Reentry latch. True while a reverse-write is in flight.
     *
     * @var bool
     */
    private static bool $in_reverse_write = false;

    /**
     * Bridge collaborator. May be null on construct — auto-resolved from the
     * DI container on first use so the bootstrap can be registered as a
     * zero-arg service.
     *
     * @var LegacySettingsBridge|null
     */
    private ?LegacySettingsBridge $bridge;

    /**
     * @param LegacySettingsBridge|null $bridge
     */
    public function __construct( ?LegacySettingsBridge $bridge = null ) {
        $this->bridge = $bridge;
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
                // Container miss — return null and skip mirroring this request.
            }
        }
        return null;
    }

    /**
     * {@inheritDoc}
     */
    public function register_hooks(): void {
        add_action( 'dokan_admin_settings_changed', [ $this, 'on_settings_changed' ], 10, 3 );
    }

    /**
     * Handle `dokan_admin_settings_changed`.
     *
     * The repository pre-computes the diff so the bootstrap doesn't need
     * to redo that work; it just mirrors the changed keys.
     *
     * @param array<string,mixed> $changed     Added/modified entries.
     * @param array<string,mixed> $old         Payload before the write (unused).
     * @param array<string,mixed> $new_payload Payload after the write (unused).
     *
     * @return void
     */
    public function on_settings_changed( $changed, $old = [], $new_payload = [] ): void {
        unset( $old, $new_payload );
        if ( self::$in_reverse_write ) {
            return;
        }
        if ( ! is_array( $changed ) || empty( $changed ) ) {
            return;
        }
        $this->mirror( $changed );
    }

    /**
     * Run the mirror under the reentry guard.
     *
     * @param array<string,mixed> $changed
     *
     * @return void
     */
    private function mirror( array $changed ): void {
        $bridge = $this->resolve_bridge();
        if ( ! $bridge instanceof LegacySettingsBridge ) {
            return;
        }
        self::$in_reverse_write = true;
        try {
            $bridge->write_new_to_legacy( $changed );
        } finally {
            self::$in_reverse_write = false;
        }
    }
}
