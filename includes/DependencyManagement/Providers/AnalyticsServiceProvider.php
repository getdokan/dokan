<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Analytics\Reports\Orders\QueryFilter;
use WeDevs\Dokan\Analytics\Reports\Orders\Stats\QueryFilter as StatsQueryFilter;
use WeDevs\Dokan\Analytics\Reports\Orders\Stats\ScheduleListener;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;
use WeDevs\Dokan\ThirdParty\Packages\League\Container\Definition\DefinitionInterface;

class AnalyticsServiceProvider extends BaseServiceProvider {
    /**
     * Tags for services added to the container.
     */
    public const TAGS = [ 'analytics-service', 'common-service' ];

	protected $services = [
        ScheduleListener::class,
        QueryFilter::class,
        StatsQueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Products\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Products\Stats\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Variations\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Variations\Stats\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Categories\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\DataStoreModifier::class,
        \WeDevs\Dokan\Analytics\Reports\Taxes\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Taxes\Stats\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Coupons\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Coupons\Stats\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Customers\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Customers\Stats\QueryFilter::class,
        \WeDevs\Dokan\Analytics\Reports\Stock\QueryFilter::class,
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
