<?php

namespace WeDevs\Dokan\Admin\Settings\Bridge;

use WeDevs\Dokan\Admin\Settings\Bridge\Pages\GeneralPage;
use WeDevs\Dokan\Admin\Settings\SettingsMapperCallbacks;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

/**
 * Admin Settings Service Provider (Using plugin-settings package)
 *
 * This demonstrates how to update the service provider to use the
 * plugin-settings package via the bridge classes.
 *
 * @since DOKAN_SINCE
 */
class AdminSettingsServiceProvider extends BaseServiceProvider {

    /**
     * Tag for services added to the container.
     *
     * @var array
     */
    protected $tags = [ 'admin-settings-service' ];

    /**
     * Page classes to register.
     *
     * @var array
     */
    protected $page_classes = [
        GeneralPage::class,
        // Add more pages here as they are migrated:
        // ProductPage::class,
        // AppearancePage::class,
        // VendorPage::class,
        // TransactionPage::class,
        // AIAssistPage::class,
        // ModerationPage::class,
        // CompliancePage::class,
    ];

    /**
     * Register the classes.
     *
     * @return void
     */
    public function register(): void {
        // Register the Settings Manager.
        $this->getContainer()->add( SettingsManager::class )
            ->setShared( true );

        // Register the REST Controller.
        $this->getContainer()->add( SettingsController::class )
            ->addArgument( SettingsManager::class )
            ->setShared( true );

        // Register mapper callbacks (for legacy compatibility).
        $definition = $this->share_with_implements_tags( SettingsMapperCallbacks::class );
        $this->add_tags( $definition, $this->tags );

        /**
         * Filter the admin settings page classes before registration.
         *
         * @since DOKAN_SINCE
         *
         * @param array $page_classes Array of page class names to register.
         */
        $page_classes = apply_filters( 'dokan_admin_settings_page_classes', $this->page_classes );

        // Register each page.
        foreach ( $page_classes as $page_class ) {
            $definition = $this->share_with_implements_tags( $page_class );
            $this->add_tags( $definition, $this->tags );
        }
    }

    /**
     * Boot the service provider.
     *
     * Called after all services are registered.
     *
     * @return void
     */
    public function boot(): void {
        // Register REST routes.
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );

        // Register page hooks.
        add_action( 'init', [ $this, 'register_page_hooks' ] );
    }

    /**
     * Register REST API routes.
     *
     * @return void
     */
    public function register_rest_routes(): void {
        /** @var SettingsController $controller */
        $controller = $this->getContainer()->get( SettingsController::class );
        $controller->register_routes();
    }

    /**
     * Register hooks for all settings pages.
     *
     * @return void
     */
    public function register_page_hooks(): void {
        /**
         * Filter the admin settings page classes.
         *
         * @since DOKAN_SINCE
         *
         * @param array $page_classes Array of page class names.
         */
        $page_classes = apply_filters( 'dokan_admin_settings_page_classes', $this->page_classes );

        foreach ( $page_classes as $page_class ) {
            /** @var AbstractPage $page */
            $page = $this->getContainer()->get( $page_class );
            $page->register_hooks();
        }
    }
}

