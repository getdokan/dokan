<?php

namespace WeDevs\Dokan\Admin\Settings\Bridge;

use WeDevs\PluginSettings\SettingsManager as BaseSettingsManager;
use WeDevs\Dokan\Admin\Settings\LegacyTransformer;

/**
 * Dokan Settings Manager Bridge
 *
 * Extends the plugin-settings package's SettingsManager with Dokan-specific
 * functionality like legacy settings transformation.
 *
 * @since DOKAN_SINCE
 */
class SettingsManager extends BaseSettingsManager {

    /**
     * Constructor.
     *
     * Initializes with Dokan-specific configuration.
     */
    public function __construct() {
        parent::__construct( [
            'namespace'      => 'dokan',
            'rest_namespace' => 'dokan/v1/admin',
            'hook_prefix'    => 'dokan_admin_settings',
        ] );
    }

    /**
     * Save settings data with legacy transformation.
     *
     * Overrides parent to also update legacy options for backwards compatibility.
     *
     * @param array $data Settings data to save.
     *
     * @return void
     * @throws \Exception If save fails.
     */
    public function save( array $data ): void {
        // Save using the new system.
        parent::save( $data );

        // Also transform and save to legacy options for backwards compatibility.
        $this->save_to_legacy( $data );
    }

    /**
     * Transform and save data to legacy options.
     *
     * @param array $data Settings data.
     *
     * @return void
     */
    protected function save_to_legacy( array $data ): void {
        try {
            $transformer = new LegacyTransformer();

            foreach ( $this->get_pages() as $page ) {
                $page_id = $page->get_id();

                if ( isset( $data[ $page_id ] ) ) {
                    $legacy = $transformer->transform( [
                        'from' => 'new',
                        'data' => [ $page_id => $data[ $page_id ] ],
                    ] );

                    if ( is_array( $legacy ) ) {
                        foreach ( $legacy as $legacy_section => $fields ) {
                            if ( ! is_array( $fields ) ) {
                                continue;
                            }
                            $existing = get_option( $legacy_section, [] );
                            if ( ! is_array( $existing ) ) {
                                $existing = [];
                            }
                            $merged = array_replace_recursive( $existing, $fields );
                            update_option( $legacy_section, $merged );
                        }
                    }
                }
            }
        } catch ( \Exception $e ) {
            dokan_log( 'Legacy settings transformation failed: ' . $e->getMessage() );
        }
    }
}

