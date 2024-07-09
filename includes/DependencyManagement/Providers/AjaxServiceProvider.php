<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class AjaxServiceProvider extends BaseServiceProvider {
    public const TAG = 'ajax-service';

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
            ->addShared( \WeDevs\Dokan\Ajax::class, \WeDevs\Dokan\Ajax::class )
            ->addTag( self::TAG );
    }
}
