<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Admin\Dashboard\Dashboard;
use WeDevs\Dokan\Admin\Dashboard\Pages\DashboardMenu;
use WeDevs\Dokan\Admin\Dashboard\Pages\Modules;
use WeDevs\Dokan\Admin\Dashboard\Pages\SetupGuide;
use WeDevs\Dokan\Admin\Dashboard\Pages\Status;
use WeDevs\Dokan\Admin\OnboardingSetup\AdminSetupGuide;
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
    protected $tags = [ 'admin-dashboard-service' ];

    /**
     * Services to register
     *
     * @var array
     */
    protected $services = [
        Dashboard::class,
        Modules::class,
        Status::class,
        DashboardMenu::class,
	];

    /**
     * Register the services.
     *
     * @return void
     */
    public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->share_with_implements_tags( $service );
            $this->add_tags( $definition, $this->tags );
        }

        $this->add_tags( $this->share_with_implements_tags( SetupGuide::class )->addArgument( AdminSetupGuide::class ), $this->tags );
    }
}
