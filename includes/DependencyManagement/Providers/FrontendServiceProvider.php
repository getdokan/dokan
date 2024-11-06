<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class FrontendServiceProvider extends BaseServiceProvider {
    /**
     * Tag for services added to the container.
     */
    public const TAG = 'frontend-service';

	protected $services = [
		self::TAG,
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
		return in_array( $alias, $this->services, true );
	}

	/**
     * Register the classes.
     */
	public function register(): void {
		$this->getContainer()
            ->addShared( \WeDevs\Dokan\Vendor\StoreListsFilter::class, \WeDevs\Dokan\Vendor\StoreListsFilter::class )
            ->addTag( self::TAG );

		$this->getContainer()
            ->addShared( \WeDevs\Dokan\ThemeSupport\Manager::class, \WeDevs\Dokan\ThemeSupport\Manager::class )
            ->addTag( self::TAG );
    }
}
