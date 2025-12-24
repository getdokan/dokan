<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class UtilsServiceProvider extends BaseServiceProvider {
    /**
     * Tag for services added to the container.
     */
    protected $tags = [ 'utils' ];

	protected $services = [
        \WeDevs\Dokan\Utilities\AdminSettings::class,
	];

	/**
     * Register the classes.
     */
	public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->getContainer()->add( $service );
            $this->add_tags( $definition, $this->tags );
        }
    }
}
