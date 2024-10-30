<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class AjaxServiceProvider extends BaseServiceProvider {
    /**
     * Tag for services added to the container.
     */
    public const TAG = 'ajax-service';

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
            ->addShared( \WeDevs\Dokan\Ajax::class, \WeDevs\Dokan\Ajax::class )
            ->addTag( self::TAG );
    }
}
