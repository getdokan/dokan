<?php

namespace WeDevs\Dokan\Intelligence\Services;

/**
 * Interface for AI Provider
 *
 * This interface defines the methods that any AI provider must implement.
 * It includes methods to retrieve provider details, models, and check model types.
 *
 * @package WeDevs\Dokan\Intelligence\Services
 * @since 4.1.0
 */
interface AIProviderInterface {

    /**
     * Get the provider ID.
     *
     * @return string The unique identifier for the AI provider.
     */
    public function get_id(): string;

    /**
     * Get the provider title.
     *
     * @return string The human-readable name of the AI provider.
     */
    public function get_title(): string;

    /**
     * Get the provider description.
     *
     * @return string A brief description of the AI provider.
     */
    public function get_description(): string;

    /**
     * Get api key URL for the provider.
     *
     * @return string
     */
    public function get_api_key_url(): string;

    /**
     * Get the list of models supported by the provider.
     *
     * @return array An array of models provided by the AI provider.
     */
    public function get_models(): array;

    /**
     * Get a specific model by its ID.
     *
     * @param string $model_id The ID of the model to retrieve.
     * @return AIModelInterface|null The model instance or null if not found.
     */
    public function get_model( string $model_id ): ?AIModelInterface;

    /**
     * Get the default model for the provider.
     *
     * @return AIModelInterface|null The default model instance or null if not set.
     */
    public function get_default_model(): ?AIModelInterface;

    /**
     * Check if the provider supports type-based models.
     *
     * @param string $type The type of model to check (e.g., 'text', 'image').
     *
     * @return bool True if text models are supported, false otherwise.
     */
    public function has_model( string $type ): bool;

}
