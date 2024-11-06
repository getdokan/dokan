<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class CommonServiceProvider extends BaseServiceProvider {
    /**
     * Tag for services added to the container.
     */
    public const TAG = 'common-service';

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
            ->addShared( \WeDevs\Dokan\Vendor\Hooks::class, \WeDevs\Dokan\Vendor\Hooks::class )
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
