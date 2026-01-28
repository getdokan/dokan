<?php
/**
 * Element Factory
 *
 * Main factory for creating element instances from configuration.
 *
 * @package WeDevs\Dokan\FieldFactory\Factory
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Factory;

use WeDevs\Dokan\FieldFactory\Contracts\ContainerInterface;
use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;
use WeDevs\Dokan\FieldFactory\Registry\ElementRegistry;
use InvalidArgumentException;

/**
 * Class ElementFactory
 */
class ElementFactory {

    /**
     * Element registry.
     *
     * @var ElementRegistry
     */
    private ElementRegistry $registry;

    /**
     * Constructor.
     *
     * @param ElementRegistry|null $registry Element registry.
     */
    public function __construct( ?ElementRegistry $registry = null ) {
        $this->registry = $registry ?? ElementRegistry::get_instance();

        // Fire hook for extensions
        $this->registry->do_registration_hook();
    }

    /**
     * Create elements from array data.
     *
     * @param array $data Array of element configurations or existing elements.
     *
     * @return ElementInterface[] Created elements.
     */
    public function create_from_data( array $data ): array {
        $elements = [];

        foreach ( $data as $config ) {
            // Support both arrays (config) and ElementInterface objects (already created)
            $elements[] = $this->create( $config );
        }

        return $elements;
    }

    /**
     * Create single element from configuration or return existing element.
     *
     * @param array|ElementInterface $config Element configuration or existing element.
     *
     * @return ElementInterface
     * @throws InvalidArgumentException If element type is unknown.
     */
    public function create( $config ): ElementInterface {
        // If already an ElementInterface, return as-is
        if ( $config instanceof ElementInterface ) {
            return $config;
        }

        // Ensure config is an array
        if ( ! is_array( $config ) ) {
            throw new InvalidArgumentException(
                esc_html( 'Element configuration must be an array or ElementInterface instance.' )
            );
        }

        // Determine type key
        $type    = $config['type'] ?? 'field';
        $variant = $config['variant'] ?? $config['field_type'] ?? null;

        $type_key = $this->registry->resolve_type_key( $type, $variant );

        // Get class from registry
        $class_name = $this->registry->get( $type_key );

        if ( $class_name === null ) {
            // Try to create a generic field if class not found
            $class_name = $this->registry->get( 'field' );

            if ( $class_name === null || ! class_exists( $class_name ) ) {
                throw new InvalidArgumentException(
                    esc_html(
                        sprintf(
                            'Unknown element type: %s (variant: %s). Registered types: %s',
                            $type,
                            $variant ?? 'none',
                            implode( ', ', array_keys( $this->registry->get_all() ) )
                        )
                    )
                );
            }
        }

        // Create instance
        /** @var ElementInterface $element */
        $element = new $class_name();
        $element->fill( $config );

        // Handle children for containers
        if ( $element instanceof ContainerInterface ) {
            $this->create_children( $element, $config );
        }

        return $element;
    }

    /**
     * Create and attach children to container.
     *
     * @param ContainerInterface $container Parent container.
     * @param array              $config    Configuration with children.
     *
     * @return void
     */
    private function create_children( ContainerInterface $container, array $config ): void {
        // Handle 'children' key
        if ( ! empty( $config['children'] ) && is_array( $config['children'] ) ) {
            foreach ( $config['children'] as $child_config ) {
                // Support both arrays (config) and ElementInterface objects (already created)
                if ( $child_config instanceof ElementInterface ) {
                    $child = $child_config;
                } else {
                    $child = $this->create( $child_config );
                }
                $container->add_child( $child );
            }
        }
    }

    /**
     * Get the registry instance.
     *
     * @return ElementRegistry
     */
    public function get_registry(): ElementRegistry {
        return $this->registry;
    }

    /**
     * Create element by type only.
     *
     * @param string $type    Element type.
     * @param string $variant Optional variant.
     *
     * @return ElementInterface|null
     */
    public function make( string $type, string $variant = '' ): ?ElementInterface {
        $type_key = $this->registry->resolve_type_key( $type, $variant );
        return $this->registry->make( $type_key );
    }

    /**
     * Check if type is registered.
     *
     * @param string $type    Element type.
     * @param string $variant Optional variant.
     *
     * @return bool
     */
    public function supports( string $type, string $variant = '' ): bool {
        $type_key = $this->registry->resolve_type_key( $type, $variant );
        return $this->registry->has( $type_key );
    }

    /**
     * Convert elements to array representation.
     *
     * @param ElementInterface[] $elements Elements to convert.
     *
     * @return array
     */
    public function to_array( array $elements ): array {
        $result = [];
        foreach ( $elements as $element ) {
            $result[] = $element->to_array();
        }
        return $result;
    }

    /**
     * Find element by ID in element tree.
     *
     * @param ElementInterface[] $elements Elements to search.
     * @param string             $id       Element ID to find.
     *
     * @return ElementInterface|null
     */
    public function find_by_id( array $elements, string $id ): ?ElementInterface {
        foreach ( $elements as $element ) {
            if ( $element->get_id() === $id ) {
                return $element;
            }

            if ( $element instanceof ContainerInterface ) {
                $found = $element->find_child( $id );
                if ( $found !== null ) {
                    return $found;
                }
            }
        }

        return null;
    }
}
