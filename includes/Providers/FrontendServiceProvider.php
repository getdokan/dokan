<?php

namespace WeDevs\Dokan\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class FrontendServiceProvider extends BaseServiceProvider {
    public const TAG = 'frontend-service';

	protected $services = [
		self::TAG,
	];

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
