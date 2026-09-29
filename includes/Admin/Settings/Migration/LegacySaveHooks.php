<?php

namespace WeDevs\Dokan\Admin\Settings\Migration;

use Exception;
use WeDevs\Dokan\Admin\Settings as AdminSettings;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepositoryInterface;
use WeDevs\Dokan\Contracts\Hookable;
use WP_Error;

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
        add_action( 'dokan_after_saving_settings', [ $this, 'flush_store_url_rewrites' ], 10, 3 );
    }

    /**
     * Fire `dokan_before_saving_settings` for every legacy section the slice maps to.
     *
     * @since DOKAN_SINCE
     *
     * @param array<string,mixed> $new_slice New-option keys and values about to be saved.
     *
     * @return array<string,array>|WP_Error Legacy rows before the save keyed by option name,
     *                                      or a validation error when a listener stopped the save.
     */
    public function before_save( array $new_slice ) {
        $before = [];
        foreach ( $this->bridge()->legacy_options_for( $new_slice ) as $section ) {
            $before[ $section ] = $this->legacy_repo()->all( $section );
        }
        $new_values = $this->bridge()->apply_new_to_legacy( $new_slice, $before );

        // Admin\Settings hooks the legacy validators but only loads in wp-admin; REST saves need it too.
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
     * Fire `dokan_after_saving_settings` per section once the save is stored.
     *
     * @since DOKAN_SINCE
     *
     * @param array<string,array> $before Result of {@see before_save()}.
     *
     * @return void
     */
    public function after_save( array $before ): void {
        foreach ( $before as $section => $old_value ) {
            $this->legacy_repo()->flush_cache( $section );
            do_action( 'dokan_after_saving_settings', $section, $this->legacy_repo()->all( $section ), $old_value );
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
        if (
            'dokan_general' !== $option_name
            || ! isset( $old_options['custom_store_url'] )
            || $old_options['custom_store_url'] === ( $option_value['custom_store_url'] ?? null )
        ) {
            return;
        }

        dokan()->rewrite->register_rule();
        flush_rewrite_rules();
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
