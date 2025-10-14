<?php

namespace WeDevs\Dokan\Intelligence\Services;

/**
 * Interface for AI Model
 *
 * This interface defines the methods that any AI model must implement.
 * It includes methods to retrieve model details and check capabilities for text and image generation.
 *
 * @package WeDevs\Dokan\Intelligence\Services
 * @since 4.1.0
 */
interface AIModelInterface {
    /**
     * Get the model ID.
     *
     * @return string
     */
    public function get_id(): string;

    /**
     * Get the model title.
     *
     * @return string
     */
    public function get_title(): string;

    /**
     * Get the model description.
     *
     * @return string
     */
    public function get_description(): string;

    /**
     * Get the model provider ID.
     *
     * @return string
     */
    public function get_provider_id(): string;

    /**
     * Check if the model can generate text.
     *
     * @return bool
     */
    public function supports( string $type ): bool;
}
