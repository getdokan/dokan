<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Admin\Settings\Pages\GeneralPage;
use WeDevs\Dokan\Admin\Settings\Pages\VendorPage;
use WeDevs\Dokan\Admin\Settings\Settings;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class AdminSettingsServiceProvider extends BaseServiceProvider {
    /**
     * Tag for services added to the container.
     */
    protected $tags = [ 'admin-settings-service' ];

    /**
     * Services to register.
     */
    protected $services = [
        Settings::class,
        GeneralPage::class,
        VendorPage::class,
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
