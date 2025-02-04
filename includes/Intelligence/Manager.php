<?php

namespace WeDevs\Dokan\Intelligence;

use WeDevs\Dokan\Intelligence\Services\ChatgptResponseService;
use WeDevs\Dokan\Intelligence\Services\GeminiResponseService;
use WeDevs\Dokan\Intelligence\Utils\AISupportedFields;

class Manager {
    /**
     * Track AI configuration status
     *
     * @var bool
     */
    private bool $is_ai_configured = false;

    public array $engines = [];

    /**
     * Constructor for the Module class
     */
    public function __construct() {
        // Supported AI engines
        $this->engines = apply_filters(
            'dokan_ai_supported_engines', [
				'chatgpt' => __( 'ChatGPT', 'dokan-lite' ),
				'gemini'  => __( 'Gemini', 'dokan-lite' ),
			]
        );
        $this->check_ai_configuration();

        // Load appropriate actions based on configuration
        if ( $this->is_ai_configured ) {
            $this->load_actions();
        } else {
            $this->load_settings_actions();
        }
    }

    /**
     * Check if AI is properly configured
     *
     * @return void
     */
    private function check_ai_configuration(): void {
        $engine = dokan_get_option( 'dokan_ai_engine', 'dokan_ai', 'chatgpt' );

        $available_engines = array_keys( $this->engines );

        // activated engine should be in available engines
        if ( ! in_array( $engine, $available_engines, true ) ) {
            $this->is_ai_configured = false;
        }

        // Activated api key
        $api_key = dokan_get_option( "dokan_ai_{$engine}_api_key", 'dokan_ai' );

        if ( ! empty( $api_key ) ) {
            $this->is_ai_configured = true;
        }
    }

    /**
     * Load settings related actions only
     *
     * @return void
     */
    public function load_settings_actions() {
        add_filter( 'dokan_settings_sections', [ $this, 'render_appearance_section' ] );
        add_filter( 'dokan_settings_fields', [ $this, 'render_ai_settings' ] );
    }

    /**
     * Load all actions when AI is configured
     *
     * @return void
     */
    public function load_actions() {
        $this->load_settings_actions();
        add_filter( 'dokan_rest_api_class_map', [ $this, 'rest_api_class_map' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_ai_assets' ] );
    }

    /**
     * Map REST API classes
     *
     * @param array $class_map
     * @return array
     */
    public function rest_api_class_map( array $class_map ): array {
        if ( $this->is_ai_configured ) {
            $class_map[ DOKAN_DIR . '/includes/Intelligence/REST/AIRequestController.php' ] = 'WeDevs\Dokan\Intelligence\REST\AIRequestController';
        }

        return $class_map;
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
        $gpt_response_service       = new ChatgptResponseService();
        $gemini_response_service    = new GeminiResponseService();

        $chatgpt_models = $gpt_response_service->get_models();
        $gemini_models  = $gemini_response_service->get_models();

        $settings_fields['dokan_ai'] = [
            'dokan_ai_engine' => [
                'name'    => 'dokan_ai_engine',
                'label'   => __( 'Engine', 'dokan-lite' ),
                'type'    => 'select',
                'options' => $this->engines,
                'desc'    => __( 'Select AI engine', 'dokan-lite' ),
                'default' => 'chatgpt',
            ],
            'dokan_ai_chatgpt_model' => [
                'name'    => 'dokan_ai_chatgpt_model',
                'label'   => __( 'ChatGPT Model', 'dokan-lite' ),
                'type'    => 'select',
                'options' => $chatgpt_models,
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
                'options' => $gemini_models,
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
                'default' => '200',
            ],
        ];

        return $settings_fields;
    }

    /**
     * Enqueue AI assets
     *
     * @return void
     */
    public function enqueue_ai_assets() {
        if ( ! dokan_is_seller_dashboard() ) {
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
            'engine' => dokan_get_option( 'dokan_ai_engine', 'dokan_ai', 'chatgpt' ),
            'gemini_model' => dokan_get_option( 'dokan_ai_gemini_model', 'dokan_ai', 'gemini-1.5-flash' ),
            'chatgpt_model' => dokan_get_option( 'dokan_ai_chatgpt_model', 'dokan_ai', 'gpt-3.5-turbo' ),
            'temperature' => dokan_get_option( 'dokan_ai_temperature', 'dokan_ai', '0.7' ),
            'max_tokens' => dokan_get_option( 'dokan_ai_max_tokens_for_marketplace', 'dokan_ai', '250' ),
            'is_configured' => true,
            'fields' => $supported_fields,
        ];

        wp_localize_script( 'dokan-ai-script', 'dokanAiSettings', $settings );
    }
}
