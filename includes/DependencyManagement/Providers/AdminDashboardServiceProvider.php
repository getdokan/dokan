<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\REST\AdminDashboardController;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

/**
 * Admin Dashboard API Service Provider
 *
 * @since DOKAN_SINCE
 */
class AdminDashboardServiceProvider extends BaseServiceProvider {
    /**
     * Tag for services added to the container.
     *
     * @var array
     */
    protected $tags = [ 'admin-dashboard-api-service' ];

    /**
     * Services to register
     *
     * @var array
     */
    protected $services = [
        AdminDashboardController::class,
    ];

    /**
     * Register the services.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->share_with_implements_tags( $service );
            $this->add_tags( $definition, $this->tags );
        }
    }
}