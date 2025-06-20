<?php

namespace WeDevs\Dokan\Intelligence\Services;

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
        $models[] = $this;

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
}
