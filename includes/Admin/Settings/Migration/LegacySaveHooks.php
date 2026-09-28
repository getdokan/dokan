<?php

namespace WeDevs\Dokan\Admin\Settings\Migration;

use RuntimeException;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepositoryInterface;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Runs the legacy `dokan_{before,after}_saving_settings` hooks for new-settings saves.
 *
 * @since DOKAN_SINCE
 */
class LegacySaveHooks implements Hookable {

    private ?LegacySettingsBridge $bridge;

    private ?LegacySettingsRepositoryInterface $legacy_repo;

    /**
     * @param LegacySettingsBridge|null              $bridge      Optional bridge (for testing).
     * @param LegacySettingsRepositoryInterface|null $legacy_repo Optional legacy repository (for testing).
     */
    public function __construct( ?LegacySettingsBridge $bridge = null, ?LegacySettingsRepositoryInterface $legacy_repo = null ) {
        $this->bridge      = $bridge;
        $this->legacy_repo = $legacy_repo;
    }

    /**
     * Register listeners that must run for saves from either settings UI.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'dokan_before_saving_settings', [ $this, 'validate_withdraw_limit' ], 10, 2 );
        add_action( 'dokan_after_saving_settings', [ $this, 'flush_store_url_rewrites' ], 10, 3 );
    }

    /**
     * Legacy sections a new-option slice maps to, as they are before the save.
     *
     * @since DOKAN_SINCE
     *
     * @param array<string,mixed> $new_slice New-option keys and values about to be saved.
     *
     * @return array<string,array> Legacy rows keyed by option name.
     */
    public function snapshot( array $new_slice ): array {
        $before = [];
        foreach ( $this->bridge()->legacy_options_for( array_keys( $new_slice ) ) as $section ) {
            $before[ $section ] = $this->legacy_repo()->all( $section );
        }
        return $before;
    }

    /**
     * Fire `dokan_before_saving_settings` per section and collect legacy validation errors.
     *
     * @since DOKAN_SINCE
     *
     * @param array<string,mixed> $new_slice New-option keys and values about to be saved.
     * @param array<string,array> $before    Result of {@see snapshot()}.
     *
     * @return array<string,string[]> Error messages keyed by new-option key, empty when valid.
     */
    public function run_before( array $new_slice, array $before ): array {
        $projected = $this->bridge()->project_new_onto_legacy( $new_slice, $before );

        foreach ( $before as $section => $old_value ) {
            $response = $this->catch_json_error(
                static function () use ( $section, $projected, $old_value ) {
                    do_action( 'dokan_before_saving_settings', $section, $projected[ $section ], $old_value );
                }
            );

            if ( null !== $response ) {
                return $this->map_errors( $section, $response );
            }
        }

        return [];
    }

    /**
     * Fire `dokan_after_saving_settings` per section once the save is stored.
     *
     * @since DOKAN_SINCE
     *
     * @param array<string,array> $before Result of {@see snapshot()}.
     *
     * @return void
     */
    public function run_after( array $before ): void {
        foreach ( $before as $section => $old_value ) {
            $this->legacy_repo()->flush_cache( $section );
            do_action( 'dokan_after_saving_settings', $section, $this->legacy_repo()->all( $section ), $old_value );
        }
    }

    /**
     * Reject a negative minimum withdraw limit.
     *
     * @since DOKAN_SINCE Moved from `WeDevs\Dokan\Admin\Settings`, which only loads in wp-admin.
     *
     * @param string $option_name  Legacy option name.
     * @param array  $option_value Legacy option value.
     *
     * @return void
     */
    public function validate_withdraw_limit( $option_name, $option_value ) {
        if ( 'dokan_withdraw' !== $option_name ) {
            return;
        }

        $errors = [];

        if ( ! empty( $option_value['withdraw_limit'] && $option_value['withdraw_limit'] < 0 ) ) {
            $errors[] = [
                'name'  => 'withdraw_limit',
                'error' => __( 'Minimum Withdraw Limit can\'t be negative value.', 'dokan-lite' ),
            ];
        }

        if ( ! empty( $errors ) ) {
            wp_send_json_error(
                [
                    'settings' => [
                        'name'  => $option_name,
                        'value' => $option_value,
                    ],
                    'message'  => __( 'Validation error', 'dokan-lite' ),
                    'errors'   => $errors,
                ],
                400
            );
        }
    }

    /**
     * Flush rewrite rules when the vendor store URL slug changes.
     *
     * @since DOKAN_SINCE
     *
     * @param string $option_name  Legacy option name.
     * @param array  $option_value Legacy option value after the save.
     * @param array  $old_options  Legacy option value before the save.
     *
     * @return void
     */
    public function flush_store_url_rewrites( $option_name, $option_value, $old_options ) {
        if ( 'dokan_general' !== $option_name || ! isset( $old_options['custom_store_url'] ) ) {
            return;
        }

        if ( $old_options['custom_store_url'] === ( $option_value['custom_store_url'] ?? null ) ) {
            return;
        }

        dokan()->rewrite->register_rule();
        flush_rewrite_rules();
    }

    /**
     * Run a callback and turn a `wp_send_json_error()` exit into its decoded payload.
     *
     * @param callable $callback Callback that may call `wp_send_json_error()`.
     *
     * @return array|null The JSON payload, or null when the callback returned normally.
     */
    private function catch_json_error( callable $callback ): ?array {
        $halted      = false;
        $doing_ajax  = static fn() => true;
        $die_handler = static function () use ( &$halted ) {
            return static function () use ( &$halted ) {
                $halted = true;
                throw new RuntimeException( 'dokan_legacy_settings_validation_halt' );
            };
        };
        $quiet       = static fn( $trigger, $function_name ) => 'wp_send_json' === $function_name ? false : $trigger;

        // Legacy validators exit via wp_send_json_error(); route that exit through a throwing wp_die handler.
        add_filter( 'wp_doing_ajax', $doing_ajax, PHP_INT_MAX );
        add_filter( 'wp_die_ajax_handler', $die_handler, PHP_INT_MAX );
        add_filter( 'doing_it_wrong_trigger_error', $quiet, 10, 2 );
        ob_start();

        try {
            $callback();
        } catch ( RuntimeException $e ) {
            if ( ! $halted ) {
                throw $e;
            }
        } finally {
            $output = (string) ob_get_clean();
            remove_filter( 'wp_doing_ajax', $doing_ajax, PHP_INT_MAX );
            remove_filter( 'wp_die_ajax_handler', $die_handler, PHP_INT_MAX );
            remove_filter( 'doing_it_wrong_trigger_error', $quiet, 10 );
        }

        if ( ! $halted ) {
            return null;
        }

        $response = json_decode( $output, true );

        return is_array( $response ) ? $response : [];
    }

    /**
     * Key a legacy validation payload's errors by new-option key.
     *
     * @param string $section  Legacy option name the errors belong to.
     * @param array  $response Decoded `wp_send_json_error()` payload.
     *
     * @return array<string,string[]>
     */
    private function map_errors( string $section, array $response ): array {
        $data     = is_array( $response['data'] ?? null ) ? $response['data'] : [];
        $messages = $data['errors'] ?? $data['message'] ?? __( 'Validation failed for one or more fields.', 'dokan-lite' );

        $keys = [];
        foreach ( $this->bridge()->get_mapping() as $new_key => $entry ) {
            foreach ( isset( $entry['option'] ) ? [ $entry ] : $entry as $address ) {
                if ( $section === $address['option'] ) {
                    $keys[ explode( '.', $address['field'] )[0] ] ??= $new_key;
                }
            }
        }

        $errors = [];
        foreach ( (array) $messages as $error ) {
            $name    = is_array( $error ) ? (string) ( $error['name'] ?? '' ) : '';
            $message = is_array( $error ) ? (string) ( $error['error'] ?? '' ) : (string) $error;

            $errors[ $keys[ $name ] ?? ( '' !== $name ? $name : $section ) ][] = $message;
        }

        return $errors;
    }

    /**
     * @return LegacySettingsBridge
     */
    private function bridge(): LegacySettingsBridge {
        $this->bridge ??= dokan_get_container()->get( LegacySettingsBridge::class );

        return $this->bridge;
    }

    /**
     * @return LegacySettingsRepositoryInterface
     */
    private function legacy_repo(): LegacySettingsRepositoryInterface {
        $this->legacy_repo ??= dokan_get_container()->get( LegacySettingsRepository::class );

        return $this->legacy_repo;
    }
}
