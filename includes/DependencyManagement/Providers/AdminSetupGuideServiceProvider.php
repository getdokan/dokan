<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Admin\Dashboard\Dashboard;
use WeDevs\Dokan\Admin\Dashboard\Pages\Modules;
use WeDevs\Dokan\Admin\Dashboard\Pages\Status;
use WeDevs\Dokan\Admin\OnboardingSetup\AdminSetupGuide;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\AppearanceStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\BasicStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\CommissionStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\WithdrawStep;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class AdminSetupGuideServiceProvider extends BaseServiceProvider {
    /**
     * Tag for services added to the container.
     */
    protected $tags = [ 'admin-setup-guide-service' ];

    /**
     * Services to register.
     */
    protected $services = [
        AdminSetupGuide::class,
        BasicStep::class,
        CommissionStep::class,
        WithdrawStep::class,
        AppearanceStep::class,
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
