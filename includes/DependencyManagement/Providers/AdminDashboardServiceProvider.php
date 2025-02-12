<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Admin\Dashboard\Dashboard;
use WeDevs\Dokan\Admin\Dashboard\Pages\Status;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class AdminDashboardServiceProvider extends BaseServiceProvider {
    /**
     * Tag for services added to the container.
     */
    protected $tags = [ 'admin-dashboard-service' ];

	protected $services = [
        Dashboard::class,
        Status::class,
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
