<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class AnalyticsServiceProvider extends BaseServiceProvider {
    public const TAGS = [ 'analytics-service', 'common-service' ];

	protected $services = [
        \WeDevs\Dokan\Analytics\ScheduleListener::class,
    ];

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
}
