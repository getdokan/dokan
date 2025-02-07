<?php

namespace WeDevs\Dokan\Intelligence;

use WeDevs\Dokan\Intelligence\Services\ChatgptResponseService;
use WeDevs\Dokan\Intelligence\Services\GeminiResponseService;
use WeDevs\Dokan\Intelligence\Utils\AISupportedFields;

class Hooks {
    public function __construct() {
        add_filter( 'dokan_settings_sections', [ $this, 'render_appearance_section' ] );
        add_filter( 'dokan_settings_fields', [ $this, 'render_ai_settings' ] );
        add_filter( 'dokan_rest_api_class_map', [ $this, 'rest_api_class_map' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_ai_assets' ] );
    }

    /**
     * Render AI section in Dokan settings
     *
     * @param array $sections
     * @return array
     */
    public function render_appearance_section( array $sections ): array {
        $sections[] = [
            'id'                   => 'dokan_ai',
            'title'                => __( 'AI Assist', 'dokan-lite' ),
            'icon_url'             => DOKAN_PLUGIN_ASSEST . '/images/dokan-ai.svg',
            'description'          => __( 'Dokan AI Assist', 'dokan-lite' ),
            'document_link'        => '#',
            'settings_title'       => __( 'AI Assist Settings', 'dokan-lite' ),
            'settings_description' => __( 'Set up AI to elevate your platform with enhanced capabilities.', 'dokan-lite' ),
        ];

        return $sections;
    }

    /**
     * Render AI settings fields
     *
     * @param array $settings_fields
     * @return array
     */
    public function render_ai_settings( array $settings_fields ): array {
        $settings_fields['dokan_ai'] = [
            'dokan_ai_engine' => [
                'name'    => 'dokan_ai_engine',
                'label'   => __( 'Engine', 'dokan-lite' ),
                'type'    => 'select',
                'options' => Manager::get_engines(),
                'desc'    => __( 'Select AI engine', 'dokan-lite' ),
                'default' => 'chatgpt',
            ],
            'dokan_ai_chatgpt_model' => [
                'name'    => 'dokan_ai_chatgpt_model',
                'label'   => __( 'ChatGPT Model', 'dokan-lite' ),
                'type'    => 'select',
                'options' => ChatgptResponseService::get_models(),
                'desc'    => __( 'Select your model', 'dokan-lite' ),
                'default' => 'gpt-3.5-turbo',
                'show_if' => [
                    'dokan_ai_engine' => [
                        'equal' => 'chatgpt',
                    ],
                ],
            ],
            'dokan_ai_gemini_model' => [
                'name'    => 'dokan_ai_gemini_model',
                'label'   => __( 'Gemini Model', 'dokan-lite' ),
                'type'    => 'select',
                'options' => GeminiResponseService::get_models(),
                'desc'    => __( 'Select your model', 'dokan-lite' ),
                'default' => 'gemini-1.5-flash',
                'show_if' => [
                    'dokan_ai_engine' => [
                        'equal' => 'gemini',
                    ],
                ],
            ],
            'dokan_ai_gemini_api_key' => [
                'name'    => 'dokan_ai_gemini_api_key',
                'label'   => __( 'Gemini API Key', 'dokan-lite' ),
                'type'    => 'text',
                'desc'    => __( 'Enter your API key', 'dokan-lite' ),
                'default' => '',
                'secret_text' => true,
                'show_if' => [
                    'dokan_ai_engine' => [
                        'equal' => 'gemini',
                    ],
                ],
            ],
            'dokan_ai_chatgpt_api_key' => [
                'name'    => 'dokan_ai_chatgpt_api_key',
                'label'   => __( 'ChatGPT API Key', 'dokan-lite' ),
                'type'    => 'text',
                'desc'    => __( 'Enter your API key', 'dokan-lite' ),
                'default' => '',
                'secret_text' => true,
                'show_if' => [
                    'dokan_ai_engine' => [
                        'equal' => 'chatgpt',
                    ],
                ],
            ],
            'dokan_ai_max_tokens_for_marketplace' => [
                'name'    => 'dokan_ai_max_tokens_for_marketplace',
                'label'   => __( 'Max Output Tokens for Marketplace', 'dokan-lite' ),
                'type'    => 'number',
                'desc'    => __( 'Set the maximum number of tokens for marketplace.', 'dokan-lite' ),
                'default' => '250',
            ],
        ];

        return $settings_fields;
    }

    /**
     * Map REST API classes
     *
     * @param array $class_map
     * @return array
     */
    public function rest_api_class_map( array $class_map ): array {

        $class_map[ DOKAN_DIR . '/includes/Intelligence/REST/AIRequestController.php' ] = 'WeDevs\Dokan\Intelligence\REST\AIRequestController';

        return $class_map;
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

        wp_enqueue_style( 'dokan-ai-style' );
        wp_enqueue_script( 'dokan-ai-script' );

        $supported_fields = AISupportedFields::get_supported_fields();

        $settings = [
            'fields' => $supported_fields,
        ];

        wp_localize_script( 'dokan-ai-script', 'dokanAiSettings', $settings );
    }
}
