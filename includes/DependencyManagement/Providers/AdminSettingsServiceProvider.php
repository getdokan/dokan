<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Admin\Settings\Pages\GeneralPage;
use WeDevs\Dokan\Admin\Settings\Pages\ProductPage;
use WeDevs\Dokan\Admin\Settings\Pages\AppearancePage;
use WeDevs\Dokan\Admin\Settings\Pages\VendorPage;
use WeDevs\Dokan\Admin\Settings\Pages\TransactionPage;
use WeDevs\Dokan\Admin\Settings\Pages\AIAssistPage;
use WeDevs\Dokan\Admin\Settings\Pages\ModerationPage;
use WeDevs\Dokan\Admin\Settings\Pages\CompliancePage;
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
        ProductPage::class,
        AppearancePage::class,
        VendorPage::class,
        TransactionPage::class,
        AIAssistPage::class,
        ModerationPage::class,
        CompliancePage::class,
    ];

	/**
     * Register the classes.
     */
	public function register(): void {

        /**
         * Filter the admin settings services before registration.
         *
         * Allows plugins and themes to add, remove, or modify admin settings services.
         *
         * @since DOKAN_SINCE
         *
         * @param array $services Array of service class names to register.
         *
         * @return array Modified array of service class names.
         */
        $services = apply_filters( 'dokan_admin_settings_services', $this->services );

        foreach ( $services as $service ) {
            $definition = $this->share_with_implements_tags( $service );
            $this->add_tags( $definition, $this->tags );
        }
    }
}
