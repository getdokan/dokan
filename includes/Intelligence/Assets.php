<?php

namespace WeDevs\Dokan\Intelligence;

use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Intelligence\Utils\AISupportedFields;

class Assets implements Hookable {

    public function register_hooks(): void {
        add_action( 'init', [ $this, 'register_all_scripts' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_ai_assets' ] );
    }

    /**
     * Register all scripts
     *
     * @return void
     */

    public function register_all_scripts() {
        $asset = require DOKAN_DIR . '/assets/js/dokan-intelligence.asset.php';

        wp_register_style(
            'dokan-ai-style',
            DOKAN_PLUGIN_ASSEST . '/css/dokan-intelligence.css',
            [],
            $asset['version']
        );

        wp_register_script(
            'dokan-ai-script',
            DOKAN_PLUGIN_ASSEST . '/js/dokan-intelligence.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );
    }

    /**
     * Enqueue AI assets
     *
     * @return void
     */
    public function enqueue_ai_assets() {
        $is_configured = dokan()->get_container()->get( Manager::class )->is_configured();
        if ( ! dokan_is_seller_dashboard() || ! $is_configured ) {
            return;
        }

        $supported_fields = AISupportedFields::get_supported_fields();

        $settings = [ 'fields' => $supported_fields ];

        wp_enqueue_style( 'dokan-ai-style' );
        wp_enqueue_script( 'dokan-ai-script' );
        wp_localize_script( 'dokan-ai-script', 'dokanAiSettings', $settings );
    }
}
