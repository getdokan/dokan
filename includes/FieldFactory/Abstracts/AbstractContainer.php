<?php
/**
 * Base implementation for elements that can contain children.
 *
 * @package WeDevs\Dokan\FieldFactory\Abstracts
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Abstracts;

use WeDevs\Dokan\FieldFactory\Contracts\ContainerInterface;
use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;

abstract class AbstractContainer extends AbstractElement implements ContainerInterface {

    /**
     * Child elements.
     *
     * @var ElementInterface[]
     */
    protected array $children = [];

    /**
     * {@inheritdoc}
     */
    public function add_child( ElementInterface $element ): self {
        $this->children[ $element->get_id() ] = $element;
        return $this;
    }

    /**
     * Add multiple children.
     *
     * @param ElementInterface[] $elements Children to add.
     *
     * @return self
     */
    public function add_children( array $elements ): self {
        foreach ( $elements as $element ) {
            $this->add_child( $element );
        }
        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function get_children(): array {
        return array_values( $this->children );
    }

    /**
     * Get children indexed by ID.
     *
     * @return ElementInterface[]
     */
    public function get_children_indexed(): array {
        return $this->children;
    }

    /**
     * {@inheritdoc}
     */
    public function has_children(): bool {
        return ! empty( $this->children );
    }

    /**
     * Get children count.
     *
     * @return int
     */
    public function get_children_count(): int {
        return count( $this->children );
    }

    /**
     * {@inheritdoc}
     */
    public function find_child( string $id ): ?ElementInterface {
        // Direct child lookup
        if ( isset( $this->children[ $id ] ) ) {
            return $this->children[ $id ];
        }

        // Recursive search in nested containers
        foreach ( $this->children as $child ) {
            if ( $child instanceof ContainerInterface ) {
                $found = $child->find_child( $id );
                if ( $found !== null ) {
                    return $found;
                }
            }
        }

        return null;
    }

    /**
     * Find all children of a specific type.
     *
     * @param string $type Element type to find.
     *
     * @return ElementInterface[]
     */
    public function find_children_by_type( string $type ): array {
        $found = [];

        foreach ( $this->children as $child ) {
            if ( $child->get_type() === $type ) {
                $found[] = $child;
            }

            // Recursive search
            if ( $child instanceof ContainerInterface ) {
                $found = array_merge( $found, $child->find_children_by_type( $type ) );
            }
        }

        return $found;
    }

    /**
     * {@inheritdoc}
     */
    public function remove_child( string $id ): bool {
        if ( isset( $this->children[ $id ] ) ) {
            unset( $this->children[ $id ] );
            return true;
        }

        return false;
    }

    /**
     * Remove all children.
     *
     * @return self
     */
    public function clear_children(): self {
        $this->children = [];
        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        $data = parent::to_array();

        $children_array = [];
        foreach ( $this->get_children() as $child ) {
            $children_array[] = $child->to_array();
        }
        $data['children'] = $children_array;

        return $data;
    }

    /**
     * Get flattened list of all descendant elements.
     *
     * @return ElementInterface[]
     */
    public function get_all_descendants(): array {
        $descendants = [];

        foreach ( $this->children as $child ) {
            $descendants[] = $child;

            if ( $child instanceof ContainerInterface ) {
                $descendants = array_merge( $descendants, $child->get_all_descendants() );
            }
        }

        return $descendants;
    }
}
