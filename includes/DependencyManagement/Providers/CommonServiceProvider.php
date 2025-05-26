<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class CommonServiceProvider extends BaseServiceProvider {
    /**
     * Tag for services added to the container.
     */
    protected $tags = [ 'common-service' ];

	protected $services = [
        \WeDevs\Dokan\Withdraw\Hooks::class,
        \WeDevs\Dokan\Product\Hooks::class,
        \WeDevs\Dokan\ProductCategory\Hooks::class,
        \WeDevs\Dokan\Upgrade\Hooks::class,
        \WeDevs\Dokan\Vendor\Hooks::class,
        \WeDevs\Dokan\Vendor\UserSwitch::class,
        \WeDevs\Dokan\CacheInvalidate::class,
        \WeDevs\Dokan\Shipping\Hooks::class,
        \WeDevs\Dokan\Privacy::class,
        \WeDevs\Dokan\VendorNavMenuChecker::class,
        \WeDevs\Dokan\Commission\RecalculateCommissions::class,
        \WeDevs\Dokan\Order\RefundHandler::class,
        \WeDevs\Dokan\Exceptions\Handler::class,
	];

	/**
     * Register the classes.
     */
	public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->share_with_implements_tags( $service );
            $this->add_tags( $definition, $this->tags );
        }
    }
}
