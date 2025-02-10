<?php
/**
 * AbstractServiceProvider class file.
 */

namespace WeDevs\Dokan\DependencyManagement;

use WeDevs\Dokan\ThirdParty\Packages\League\Container\Definition\DefinitionInterface;
use WeDevs\Dokan\ThirdParty\Packages\League\Container\ServiceProvider\AbstractServiceProvider;

/**
 * Base class for the service providers used to register classes in the container.
 *
 * See the documentation of the original class this one is based on (https://container.thephpleague.com/4.x/service-providers)
 * for basic usage details. What this class adds is:
 * Note that `AbstractInterfaceServiceProvider` likely serves as a better base class for service providers
 * tasked with registering classes that implement interfaces.
 *
 * @since 3.13.0
 */
abstract class BaseServiceProvider extends AbstractServiceProvider {
	protected $services = [];
	protected $tags = [];

	/**
     * {@inheritDoc}
     *
     * Check if the service provider can provide the given service alias.
     *
     * @param string $alias The service alias to check.
     * @return bool True if the service provider can provide the service, false otherwise.
     */
	public function provides( string $alias ): bool {
		static $implements = array();

		foreach ( $this->services as $class ) {
			if ( ! class_exists( $class ) ) {
				continue;
			}

			$implements_more = class_implements( $class );
			if ( $implements_more ) {
				$implements = array_merge( $implements, $implements_more );
			}
		}

		$implements = array_unique( $implements );

		return array_key_exists( $alias, $implements ) || in_array( $alias, $this->services, true ) || in_array( $alias, $this->tags, true );
	}

	/**
	 * Register a class in the container and add tags for all the interfaces it implements.
	 *
	 * This also updates the `$this->provides` property with the interfaces provided by the class, and ensures
	 * that the property doesn't contain duplicates.
	 *
	 * @param string     $id       Entry ID (typically a class or interface name).
	 * @param mixed|null $concrete Concrete entity to register under that ID, null for automatic creation.
	 * @param bool|null  $shared   Whether to register the class as shared (`get` always returns the same instance)
	 *                             or not.
	 *
	 * @return DefinitionInterface
	 */
	protected function add_with_implements_tags( string $id, $concrete = null, bool $shared = null ): DefinitionInterface {
		$definition = $this->getContainer()->add( $id, $concrete )->setShared( $shared );

		foreach ( class_implements( $id ) as $interface ) {
			$definition->addTag( $interface );
			if ( ! in_array( $interface, $this->services, true ) ) {
				$this->services[] = $interface;
			}
		}

		return $definition;
	}

	/**
	 * Register a shared class in the container and add tags for all the interfaces it implements.
	 *
	 * @param string     $id       Entry ID (typically a class or interface name).
	 * @param mixed|null $concrete Concrete entity to register under that ID, null for automatic creation.
	 *
	 * @return DefinitionInterface
	 */
	protected function share_with_implements_tags( string $id, $concrete = null ): DefinitionInterface {
		return $this->add_with_implements_tags( $id, $concrete, true );
	}

	/**
	 * Adds tags to the given definition.
	 *
	 * @param DefinitionInterface $definition The definition to which tags will be added.
	 * @param array $tags An array of tags to add to the definition.
	 *
	 * @return void
	 */
    protected function add_tags( DefinitionInterface $definition, $tags ) {
        foreach ( $tags as $tag ) {
			$definition = $definition->addTag( $tag );
        }
    }
}
