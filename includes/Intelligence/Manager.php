<?php

namespace WeDevs\Dokan\Intelligence;

use WeDevs\Dokan\Intelligence\Services\AIProviderInterface;
use WeDevs\Dokan\Intelligence\Services\Model;
use WeDevs\Dokan\Intelligence\Services\Provider;

class Manager {

    public function active_engine( string $type = Model::SUPPORTS_TEXT ): string {
        $prefix = $this->get_type_prefix( $type );
        /**
         * Filters the active AI engine.
         *
         * @since 4.1.0
         *
         * @param string $engine The ID of the active AI engine.
         */
        return apply_filters(
            'dokan_ai_' . $prefix . 'active_engine',
            dokan_get_option( 'dokan_ai_' . $prefix . 'engine', 'dokan_ai', 'openai' )
        );
    }

    /**
     * Get available AI engines.
     *
     * @since 4.1.0
     *
     * @param string $type The type of generation to filter engines by (default is Model::SUPPORTS_TEXT).
     *
     * @return array
     */
    public function get_engines( string $type = Model::SUPPORTS_TEXT ): array {

        return $this->get_providers_by_type( $type );
    }

    /**
     * Get activated AI engine
     *
     * @since 4.1.0
     *
     * @param string $type The type of generation to filter engines by (default is Model::SUPPORTS_TEXT).
     *
     * @return bool
     */
    public function is_configured( string $type = Model::SUPPORTS_TEXT ): bool {
        $engine  = $this->active_engine( $type );
        $engines = $this->get_engines( $type );
        $prefix = $this->get_type_prefix( $type );

        $available_engines = array_keys( $engines );
        // activated engine should be in available engines
        if ( ! in_array( $engine, $available_engines, true ) ) {
            return false;
        }

        // Activated api key
        $api_key = dokan_get_option( "dokan_ai_{$prefix}{$engine}_api_key", 'dokan_ai', '' );

        if ( empty( $api_key ) ) {
            return false;
        }
        return true;
    }

    /**
     * Get available AI providers
     *
     * @since 4.1.0
     *
     * @return array< string, AIProviderInterface >
     */
    public function get_providers(): array {
        $providers = apply_filters(
            'dokan_intelligence_providers', []
        );

        $instances = [];
        foreach ( $providers as $id => $provider_class ) {
            if ( is_a( $provider_class, AIProviderInterface::class ) ) {
                $instances[ $id ] = $provider_class;
            }
        }

        return $instances;
    }

    /**
     * Get provider by ID
     *
     * @since 4.1.0
     *
     * @param string $provider_id
     *
     * @return AIProviderInterface|null
     */
    public function get_provider( string $provider_id ): ?AIProviderInterface {
        $providers = $this->get_providers();

        if ( ! array_key_exists( $provider_id, $providers ) ) {
            return null;
        }

        return $providers[ $provider_id ];
    }

    /**
     * Get all supported providers for text generation
     *
     * @return array< string, AIProviderInterface >
     */
    public function get_text_supported_providers(): array {
        return $this->get_providers_by_type( Provider::GENERATION_TYPE_TEXT );
    }

    /**
     * Get all supported providers for image generation
     *
     * @return array< string, AIProviderInterface >
     */
    public function get_image_supported_providers(): array {
        return $this->get_providers_by_type( Provider::GENERATION_TYPE_IMAGE );
    }

    /**
     * Get all supported providers for selected type
     *
     * @param string $type The type of generation to filter providers by (e.g., 'text', 'image').
     *
     * @return array< string, AIProviderInterface >
     */
    protected function get_providers_by_type( string $type ): array {
        $providers = $this->get_providers();
        $filtered_providers = [];

        foreach ( $providers as $provider ) {
            if ( $provider->has_model( $type ) ) {
                $filtered_providers[ $provider->get_id() ] = $provider;
            }
        }

        return apply_filters( 'dokan_intelligence_' . $type . '_supported_providers', $filtered_providers );
    }


    /**
     * Get the type prefix for the given generation type.
     *
     * @param string $type The type of generation (e.g., 'text', 'image', 'video').
     *
     * @return string The prefix for the type.
     */
    public function get_type_prefix( string $type ): string {
        switch ( $type ) {
            case Model::SUPPORTS_IMAGE:
                return 'image_';
            case Model::SUPPORTS_VIDEO:
                return 'video_';
            case Model::SUPPORTS_TEXT:
            default:
                return '';
        }
    }
}
