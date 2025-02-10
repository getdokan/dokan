<?php

namespace WeDevs\Dokan\Intelligence;

use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Intelligence\Utils\AISupportedFields;

class Assets implements Hookable {
    public function __construct() {
        $this->register_hooks();
    }

    public function register_hooks(): void {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_ai_assets' ] );
    }

    /**
     * Enqueue AI assets
     *
     * @return void
     */
    public function enqueue_ai_assets() {
        if ( ! dokan_is_seller_dashboard() || ! Manager::is_configured() ) {
            return;
        }

        wp_register_style(
            'dokan-ai-style',
            DOKAN_PLUGIN_ASSEST . '/css/dokan-intelligence.css',
            [],
            filemtime( DOKAN_DIR . '/assets/css/dokan-intelligence.css' )
        );

        wp_register_script(
            'dokan-ai-script',
            DOKAN_PLUGIN_ASSEST . '/js/dokan-intelligence.js',
            [ 'wp-element', 'wp-i18n', 'wp-api-fetch' ],
            filemtime( DOKAN_DIR . '/assets/js/dokan-intelligence.js' ),
            true
        );

        $supported_fields = AISupportedFields::get_supported_fields();

        $settings = [
            'fields' => $supported_fields,
        ];

        wp_enqueue_style( 'dokan-ai-style' );
        wp_enqueue_script( 'dokan-ai-script' );
        wp_localize_script( 'dokan-ai-script', 'dokanAiSettings', $settings );
    }
}
