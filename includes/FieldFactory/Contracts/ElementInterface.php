<?php
/**
 * Element Interface
 *
 * Base contract for all UI elements in the field factory.
 *
 * @package WeDevs\Dokan\FieldFactory\Contracts
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Contracts;

/**
 * Interface ElementInterface
 */
interface ElementInterface {

    /**
     * Get element ID.
     *
     * @return string
     */
    public function get_id(): string;

    /**
     * Get element type.
     *
     * @return string
     */
    public function get_type(): string;

    /**
     * Get element title/label.
     *
     * @return string
     */
    public function get_title(): string;

    /**
     * Get element description.
     *
     * @return string
     */
    public function get_description(): string;

    /**
     * Check if element should be displayed.
     *
     * @return bool
     */
    public function should_display(): bool;

    /**
     * Get element category (container, layout, field, display).
     *
     * @return string
     */
    public function get_category(): string;

    /**
     * Get hook key for WordPress actions/filters.
     *
     * @return string
     */
    public function get_hook_key(): string;

    /**
     * Get dependencies configuration.
     *
     * @return array
     */
    public function get_dependencies(): array;

    /**
     * Fill element from configuration array.
     *
     * @param array $config Configuration array.
     *
     * @return self
     */
    public function fill( array $config ): self;

    /**
     * Convert element to array representation.
     *
     * @return array
     */
    public function to_array(): array;
}
