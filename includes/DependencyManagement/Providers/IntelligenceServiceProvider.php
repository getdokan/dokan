<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;
use WeDevs\Dokan\Intelligence\Hooks;
use WeDevs\Dokan\Intelligence\Manager;
use WeDevs\Dokan\ThirdParty\Packages\League\Container\Definition\DefinitionInterface;

class IntelligenceServiceProvider extends BaseServiceProvider {
    /**
     * Tags for services added to the container.
     */
    public const TAGS = [ 'intelligence-service', 'common-service' ];

	protected $services = [
        Manager::class,
        Hooks::class,
    ];

    /**
     * {@inheritDoc}
     *
     * Check if the service provider can provide the given service alias.
     *
     * @param string $alias The service alias to check.
     * @return bool True if the service provider can provide the service, false otherwise.
     */
	public function provides( string $alias ): bool {
        return in_array( $alias, $this->services, true ) || in_array( $alias, self::TAGS, true );
	}

	/**
     * Register the classes.
     */
	public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->getContainer()
                ->addShared(
                    $service, function () use ( $service ) {
						return new $service();
					}
                );
            $this->add_tags( $definition, self::TAGS );
        }
    }

    private function add_tags( DefinitionInterface $definition, $tags ) {
        foreach ( $tags as $tag ) {
			$definition = $definition->addTag( $tag );
        }
    }
}
