<?php

namespace WeDevs\Dokan\Admin\Settings\Migration;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Bridge Bootstrap.
 *
 * Wires the `dokan_settings` option lifecycle into
 * {@see LegacySettingsBridge::write_new_to_legacy()} so that every save of
 * the new flat option mirrors changed keys back into the relevant legacy
 * `dokan_<section>` wp_options. This keeps direct `get_option()` Pro
 * readers seeing fresh values without forcing them through the new option.
 *
 * A static reentry guard prevents infinite recursion when
 * `write_new_to_legacy()` writes to a `dokan_<section>` option and a
 * downstream listener (legacy AJAX save handler or another mirror)
 * re-emits `update_option('dokan_settings', ...)`.
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
        add_action( 'update_option_dokan_settings', [ $this, 'on_new_option_updated' ], 10, 2 );
        add_action( 'add_option_dokan_settings', [ $this, 'on_new_option_added' ], 10, 2 );
    }

    /**
     * Handle `update_option_dokan_settings`.
     *
     * Mirrors only the keys whose value differs from the previous payload.
     *
     * @param mixed $old_value
     * @param mixed $new_value
     *
     * @return void
     */
    public function on_new_option_updated( $old_value, $new_value ): void {
        if ( self::$in_reverse_write ) {
            return;
        }
        $changed = $this->diff_changed_keys( (array) $old_value, (array) $new_value );
        if ( empty( $changed ) ) {
            return;
        }
        $this->mirror( $changed );
    }

    /**
     * Handle `add_option_dokan_settings`.
     *
     * First-time insert: every key is "changed".
     *
     * @param string $option_name
     * @param mixed  $value
     *
     * @return void
     */
    public function on_new_option_added( $option_name, $value ): void {
        unset( $option_name );
        if ( self::$in_reverse_write ) {
            return;
        }
        $value = (array) $value;
        if ( empty( $value ) ) {
            return;
        }
        $this->mirror( $value );
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

    /**
     * Diff two option payloads, returning only changed/added entries.
     *
     * @param array<string,mixed> $old_payload
     * @param array<string,mixed> $new_payload
     *
     * @return array<string,mixed>
     */
    private function diff_changed_keys( array $old_payload, array $new_payload ): array {
        $changed = [];
        foreach ( $new_payload as $k => $v ) {
            if ( ! array_key_exists( $k, $old_payload ) || $old_payload[ $k ] !== $v ) {
                $changed[ $k ] = $v;
            }
        }
        return $changed;
    }
}
