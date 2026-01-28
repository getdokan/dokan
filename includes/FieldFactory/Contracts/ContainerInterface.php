<?php
/**
 * Container Interface
 *
 * Contract for elements that can contain child elements.
 *
 * @package WeDevs\Dokan\FieldFactory\Contracts
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Contracts;

/**
 * Interface ContainerInterface
 */
interface ContainerInterface extends ElementInterface {

    /**
     * Add a child element.
     *
     * @param ElementInterface $element Child element to add.
     *
     * @return self
     */
    public function add_child( ElementInterface $element ): self;

    /**
     * Get all children.
     *
     * @return ElementInterface[]
     */
    public function get_children(): array;

    /**
     * Check if has children.
     *
     * @return bool
     */
    public function has_children(): bool;

    /**
     * Find child by ID (recursive search).
     *
     * @param string $id Element ID to find.
     *
     * @return ElementInterface|null
     */
    public function find_child( string $id ): ?ElementInterface;

    /**
     * Remove child by ID.
     *
     * @param string $id Element ID to remove.
     *
     * @return bool True if removed, false if not found.
     */
    public function remove_child( string $id ): bool;
}
