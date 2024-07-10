<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Analytics\Reports\Orders\FilterQuery;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;
use WeDevs\Dokan\ThirdParty\Packages\League\Container\Definition\DefinitionInterface;

class AnalyticsServiceProvider extends BaseServiceProvider {
    public const TAGS = [ 'analytics-service', 'common-service' ];

	protected $services = [
        \WeDevs\Dokan\Analytics\Reports\Orders\ScheduleListener::class,
        FilterQuery::class,
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
