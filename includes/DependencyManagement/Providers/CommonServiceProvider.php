<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class CommonServiceProvider extends BaseServiceProvider {
    public const TAG = 'common-service';

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
            ->addShared( \WeDevs\Dokan\Withdraw\Hooks::class, \WeDevs\Dokan\Withdraw\Hooks::class )
            ->addTag( self::TAG );

		$this->getContainer()
            ->addShared( \WeDevs\Dokan\Product\Hooks::class, \WeDevs\Dokan\Product\Hooks::class )
            ->addTag( self::TAG );

        $this->getContainer()
            ->addShared( \WeDevs\Dokan\ProductCategory\Hooks::class, \WeDevs\Dokan\ProductCategory\Hooks::class )
            ->addTag( self::TAG );

		$this->getContainer()
            ->addShared( \WeDevs\Dokan\Upgrade\Hooks::class, \WeDevs\Dokan\Upgrade\Hooks::class )
            ->addTag( self::TAG );

        $this->getContainer()
            ->addShared( \WeDevs\Dokan\Vendor\UserSwitch::class, \WeDevs\Dokan\Vendor\UserSwitch::class )
            ->addTag( self::TAG );

        $this->getContainer()
            ->addShared( \WeDevs\Dokan\CacheInvalidate::class, \WeDevs\Dokan\CacheInvalidate::class )
            ->addTag( self::TAG );

		$this->getContainer()
            ->addShared( \WeDevs\Dokan\Shipping\Hooks::class, \WeDevs\Dokan\Shipping\Hooks::class )
            ->addTag( self::TAG );

		$this->getContainer()
            ->addShared( \WeDevs\Dokan\Privacy::class, \WeDevs\Dokan\Privacy::class )
            ->addTag( self::TAG );
    }
}
