<?php

namespace WeDevs\Dokan\Intelligence\Services;

use Exception;
use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Intelligence\Services\AIModelInterface;

abstract class Model implements Hookable, AIModelInterface {
    const SUPPORTS_TEXT = 'text';
    const SUPPORTS_IMAGE = 'image';
    const SUPPORTS_AUDIO = 'audio';
    const SUPPORTS_VIDEO = 'video';

    /**
     * List of supported generation types.
     *
     * @var string[]
     */
    protected array $supports = [
        self::SUPPORTS_TEXT => AITextGenerationInterface::class,
        self::SUPPORTS_IMAGE => AIImageGenerationInterface::class,
    ];

    /**
     * The type of generation this model currently performing.
     *
     * @var string
     */
    protected string $generation_type = self::SUPPORTS_TEXT;

	/**
	 * @inheritDoc
	 */
	public function register_hooks(): void {
		add_filter( 'dokan_intelligence_provider_' . $this->get_provider_id() . '_models', [ $this, 'enlist' ] );
	}

    /**
     * Enlist the model in the provided models array.
     *
     * @param  AIModelInterface[]  $models The array of models to enlist into.
     *
     * @return array The updated array of models including this model.
     */
    public function enlist( array $models ): array {
        $models[ $this->get_id() ] = $this;

        return $models;
    }

    /**
     * Get the model ID.
     *
     * @return string
     */
    abstract public function get_id(): string;

    /**
     * Get the model title.
     *
     * @return string
     */
    abstract public function get_title(): string;

    /**
     * Get the model description.
     *
     * @return string
     */
    abstract public function get_description(): string;

    /**
     * Get the model provider ID.
     *
     * @return string
     */
    abstract public function get_provider_id(): string;

    /**
     * Check if the model can generate text.
     *
     * @param  string  $type The type of generation to check (e.g., 'text', 'image').
     *
     * @return bool
     */
    public function supports( string $type ): bool {
        // Check if the model supports the type by checking the interface it implements from the support array.
        if ( ! array_key_exists( $type, $this->get_supports() ) ) {
            return false;
        }

        $interface = $this->get_supports()[ $type ];

        return in_array( $interface, class_implements( $this ), true );
    }

    /**
     * Get the list of supported generation types.
     *
     * @return array<string, string>
     */
    protected function get_supports(): array {
        return apply_filters( 'dokan_intelligence_models_supports_generation_type', $this->supports, $this );
    }


    /**
     * Retrieves the API url required.
     *
     * @return string The API key.
     */
    abstract protected function get_url(): string;

    /**
     * Retrieves the headers required for the API request.
     *
     * @return array
     */
    abstract protected function get_headers(): array;

    /**
     * Retrieves the payload required for the API request.
     *
     * @param string $prompt
     * @param array $args
     *
     * @return array
     */
    abstract protected function get_payload( string $prompt, array $args = [] ): array;

    /**
     * Retrieves the API key.
     *
     * @return string
     */
    protected function get_api_key(): string {
        $type = $this->get_type_prefix_for_generation();

        return dokan_get_option( "dokan_ai_{$type}{$this->get_provider_id()}_api_key", 'dokan_ai' );
    }

    /**
     * Retrieves the type prefix for generation.
     *
     * This is used to differentiate between different types of generation (e.g., text, image).
     *
     * @return string The type prefix for generation.
     */
    protected function get_type_prefix_for_generation(): string {
        return $this->generation_type === self::SUPPORTS_TEXT ? '' : sanitize_key( $this->generation_type ) . '_';
    }

    /**
     * Check if the API key is valid.
     *
     *
     * @return bool
     */
    protected function is_valid_api_key(): bool {
        if ( empty( $this->get_api_key() ) ) {
            return false;
        }
        return true;
    }

    /**
     * Make API request
     *
     * @param string $prompt Prompt for the AI model.
     * @param array $args Additional arguments for the request.
     *
     * @return array
     * @throws Exception
     */
    protected function request( string $prompt, array $args = [] ): array {
        if ( ! $this->is_valid_api_key() ) {
            throw new Exception( esc_html__( 'API key is not configured', 'dokan-lite' ) );
        }
        // Make the request
        $response = wp_remote_post(
            $this->get_url(), [
                'headers' => $this->get_headers(),
                'body' => wp_json_encode( $this->get_payload( $prompt, $args ) ),
                'timeout' => 60,
            ]
        );
        $codes = [
            'invalid_api_key' => 401,
            'insufficient_quota' => 429,
        ];
        if ( is_wp_error( $response ) ) {
            throw new Exception( esc_html( $response->get_error_message() ), $codes[ $response->get_error_code() ] ?? 500 ); // phpcs:ignore
        }

        $response_body = wp_remote_retrieve_body( $response );
        $data = json_decode( $response_body, true );

        if ( isset( $data['error'] ) ) {
            throw new Exception( esc_html( $data['error']['message'] ), $codes[ $data['error']['code'] ] ?? 500 ); // phpcs:ignore
        }

        return $data;
    }
}
