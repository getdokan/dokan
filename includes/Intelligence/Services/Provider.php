<?php

namespace WeDevs\Dokan\Intelligence\Services;

use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Intelligence\Services\AIProviderInterface;

/**
 * Abstract class for AI Provider
 *
 * This class serves as a base for all AI providers in the Dokan Intelligence system.
 * It implements the AIProviderInterface and provides common functionality
 *
 * @package WeDevs\Dokan\Intelligence\Services
 */
abstract class Provider implements AIProviderInterface, Hookable {
    const GENERATION_TYPE_TEXT = 'text';
    const GENERATION_TYPE_IMAGE = 'image';
    const GENERATION_TYPE_AUDIO = 'audio';
    const GENERATION_TYPE_VIDEO = 'video';

	/**
	 * @inheritDoc
	 */
    abstract public function get_id(): string;

	/**
	 * @inheritDoc
	 */
	abstract public function get_title(): string;

	/**
	 * @inheritDoc
	 */
	abstract public function get_description(): string;

    abstract public function get_api_key_url(): string;

	/**
	 * @return AIModelInterface[]
	 */
	public function get_models(): array {
		return apply_filters( 'dokan_intelligence_provider_' . $this->get_id() . '_models', [], $this->get_id() );
	}

	/**
	 * @inheritDoc
	 */
	public function get_model( string $model_id ): ?AIModelInterface {
		$models = $this->get_models();

        // $model = array_find( $models, fn( $model, $key ) => $model->get_id() === $model_id );
        // Using array_filter to find the model by ID
        $filtered_models = array_filter(
            $models, function ( $model ) use ( $model_id ) {
				return $model->get_id() === $model_id;
			}
        );

        $model = ! empty( $filtered_models ) ? reset( $filtered_models ) : null;

        return apply_filters( 'dokan_intelligence_' . $this->get_id() . '_provider_' . $model_id . '_model', $model, $model_id, $this->get_id() );
	}

	/**
	 * @inheritDoc
	 */
	public function get_default_model(): ?AIModelInterface {
		$default_model_id = $this->get_default_model_id();

        return $this->get_model( $default_model_id );
	}

    abstract public function get_default_model_id(): string;

	/**
	 * @inheritDoc
	 */
	public function has_model( string $type ): bool {
		$models = $this->get_models();

        // Check if any model supports the given type
        foreach ( $models as $model ) {
            if ( $model->supports( $type ) ) {
                return true;
            }
        }

        return false;
	}

    /**
     * Get models by type.
     *
     * This method retrieves models that support a specific generation type.
     *
     * @param string $type The type of generation (e.g., 'text', 'image').
     * @return AIModelInterface[] An array of models that support the specified type.
     */
    public function get_models_by_type( string $type ) {
        $models = $this->get_models();

        // Filter models that support the given type
        $filtered_models = array_filter(
            $models, function ( $model ) use ( $type ) {
                return $model->supports( $type );
            }
        );

        return apply_filters( 'dokan_intelligence_' . $this->get_id() . '_provider_models_by_type', $filtered_models, $type, $this->get_id() );
    }

    /**
     * Register hooks for the provider.
     *
     * This method is used to register the necessary hooks for the AI provider.
     * It should be called during the plugin initialization phase.
     */
    public function register_hooks(): void {
        add_filter( 'dokan_intelligence_providers', [ $this, 'enlist' ] );
    }

    /**
     * Enlist the provider in the Dokan Intelligence system.
     *
     * This method adds the current provider instance to the list of AI providers.
     *
     * @param array $providers The existing list of AI providers.
     * @return array The updated list of AI providers including the current provider.
     */
    public function enlist( array $providers ): array {
        $provider = $this;

        $providers[ $provider->get_id() ] = $provider;

        return $providers;
    }
}
