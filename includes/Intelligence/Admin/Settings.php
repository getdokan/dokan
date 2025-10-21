<?php

namespace WeDevs\Dokan\Intelligence\Admin;

use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Intelligence\Manager;
use WeDevs\Dokan\Intelligence\Services\ChatgptResponseService;
use WeDevs\Dokan\Intelligence\Services\GeminiResponseService;
use WeDevs\Dokan\Intelligence\Services\Model;

class Settings implements Hookable {
    public function register_hooks(): void {
        add_filter( 'dokan_settings_sections', [ $this, 'render_appearance_section' ] );
        add_filter( 'dokan_settings_fields', [ $this, 'render_ai_settings' ] );
        add_filter( 'dokan_rest_api_class_map', [ $this, 'rest_api_class_map' ] );
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
            'document_link'        => 'https://dokan.co/docs/wordpress/settings/dokan-ai-assistant/',
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
        $text_providers = dokan()->get_container()->get( Manager::class )->get_text_supported_providers();

        $settings_fields['dokan_ai'] = [
            'dokan_ai_product_info'               => [
                'name'          => 'dokan_ai_product_info',
                'type'          => 'sub_section',
                'label'         => __( 'AI Product Info Generator', 'dokan-lite' ),
                'description'   => __( 'Let vendors generate product info by AI', 'dokan-lite' ),
                'content_class' => 'sub-section-styles',
            ],
            'dokan_ai_engine' => [
                'name'    => 'dokan_ai_engine',
                'label'   => __( 'Engine', 'dokan-lite' ),
                'type'    => 'select',
                'options' => array_map(
                    fn( $provider ) => $provider->get_title(),
                    $text_providers
                ),
                'desc'    => __( 'Select which AI provider to use for generating content.', 'dokan-lite' ),
                'default' => 'openai',
                'is_lite' => true,
            ],
        ];

        foreach ( $text_providers as $provider_id => $provider ) {
            $settings_fields['dokan_ai'][ 'dokan_ai_' . $provider_id . '_api_key' ] = [
                'name'    => 'dokan_ai_' . $provider_id . '_api_key',
                // translators: %s is the provider name, e.g., OpenAI
                'label'   => sprintf( __( '%s API Key', 'dokan-lite' ), $provider->get_title() ),
                'type'    => 'text',
                /* translators: 1: OpenAi Link */
                'desc'    => sprintf( __( 'You can get your API Keys in your <a href="%1$s" target="_blank">%2$s Account.</a>', 'dokan-lite' ), $provider->get_api_key_url(), $provider->get_title() ),
                'default' => '',
                'secret_text' => true,
                'show_if' => [
                    'dokan_ai_engine' => [
                        'equal' => $provider_id,
                    ],
                ],
                'tooltip' => __( 'Your API key provides secure access to the AI service. Usage costs will be charged to the connected account.', 'dokan-lite' ),
            ];

            $settings_fields['dokan_ai'][ 'dokan_ai_' . $provider_id . '_model' ] = [
                'name'    => 'dokan_ai_' . $provider_id . '_model',
                'label'   => __( 'Model', 'dokan-lite' ),
                'type'    => 'select',
                'options' => array_map( fn( $model ) => $model->get_title(), $provider->get_models_by_type( Model::SUPPORTS_TEXT ) ),
                'desc'    => __( 'More advanced models provide higher quality output but may cost more per generation.', 'dokan-lite' ),
                'default' => $provider->get_default_model_id(),
                'is_lite' => true,
                'show_if' => [
                    'dokan_ai_engine' => [
                        'equal' => $provider_id,
                    ],
                ],
            ];
        }

        return apply_filters( 'dokan_ai_settings_fields', $settings_fields );
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
}
