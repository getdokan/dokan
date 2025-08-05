<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class FeatureApiServiceProvider extends BaseServiceProvider {
	protected $services = [
        \WeDevs\Dokan\FeatureAPI\Loader::class,
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
