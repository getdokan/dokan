<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BootableServiceProvider;

/**
 * ServiceProvider Class
 *
 * Manages the registration and booting of Dokan's core services within the container.
 * This service provider handles the core services with the Dokan's
 * dependency injection container.
 *
 * @since 3.13.0
 */
class ServiceProvider extends BootableServiceProvider {
	/**
     * Tag for services added to the container.
     */
    public const TAG = 'container-service';

	protected $services = [
        'product_block'       => \WeDevs\Dokan\Blocks\ProductBlock::class,
        'pageview'            => \WeDevs\Dokan\PageViews::class,
        'seller_wizard'       => \WeDevs\Dokan\Vendor\SetupWizard::class,
        'core'                => \WeDevs\Dokan\Core::class,
        'scripts'             => \WeDevs\Dokan\Assets::class,
        'email'               => \WeDevs\Dokan\Emails\Manager::class,
        'vendor'              => \WeDevs\Dokan\Vendor\Manager::class,
        'product'             => \WeDevs\Dokan\Product\Manager::class,
        'shortcodes'          => \WeDevs\Dokan\Shortcodes\Shortcodes::class,
        'registration'        => \WeDevs\Dokan\Registration::class,
        'order'               => \WeDevs\Dokan\Order\Manager::class,
        'order_controller'    => \WeDevs\Dokan\Order\Controller::class,
        'api'                 => \WeDevs\Dokan\REST\Manager::class,
        'withdraw'            => \WeDevs\Dokan\Withdraw\Manager::class,
        'dashboard'           => \WeDevs\Dokan\Dashboard\Manager::class,
        'commission'          => \WeDevs\Dokan\Commission::class,
        'fees'                => \WeDevs\Dokan\Fees::class,
        'customizer'          => \WeDevs\Dokan\Customizer::class,
        'upgrades'            => \WeDevs\Dokan\Upgrade\Manager::class,
        'product_sections'    => \WeDevs\Dokan\ProductSections\Manager::class,
        'reverse_withdrawal'  => \WeDevs\Dokan\ReverseWithdrawal\ReverseWithdrawal::class,
        'dummy_data_importer' => \WeDevs\Dokan\DummyData\Importer::class,
        'catalog_mode'        => \WeDevs\Dokan\CatalogMode\Controller::class,
        'bg_process'          => \WeDevs\Dokan\BackgroundProcess\Manager::class,
        'frontend_manager'    => \WeDevs\Dokan\Frontend\Frontend::class,
		'rewrite'             => \WeDevs\Dokan\Rewrites::class,
        'widgets'             => \WeDevs\Dokan\Widgets\Manager::class,
        'admin_notices'       => \WeDevs\Dokan\Admin\Notices\Manager::class,
        'tracker'             => \WeDevs\Dokan\Tracker::class,
	];

	/**
	 * @inheritDoc
	 *
	 * @return void
	 */
	public function boot(): void {
		$this->getContainer()->addServiceProvider( new AdminServiceProvider() );
		$this->getContainer()->addServiceProvider( new CommonServiceProvider() );
		$this->getContainer()->addServiceProvider( new FrontendServiceProvider() );
		$this->getContainer()->addServiceProvider( new AjaxServiceProvider() );
		$this->getContainer()->addServiceProvider( new AnalyticsServiceProvider() );
    $this->getContainer()->addServiceProvider( new UtilsServiceProvider() );
		$this->getContainer()->addServiceProvider( new CommissionServiceProvider() );
    $this->getContainer()->addServiceProvider( new IntelligenceServiceProvider() );
		$this->getContainer()->addServiceProvider( new AdminDashboardServiceProvider() );
		$this->getContainer()->addServiceProvider( new AdminSetupGuideServiceProvider() );
		$this->getContainer()->addServiceProvider( new ModelServiceProvider() );
	}

    /**
     * {@inheritDoc}
     *
     * Check if the service provider can provide the given service alias.
     *
     * @param string $alias The service alias to check.
     * @return bool True if the service provider can provide the service, false otherwise.
     */
	public function provides( string $alias ): bool {
		if ( isset( $this->services[ $alias ] ) ) {
			return true;
		}

		return parent::provides( $alias );
	}

	/**
     * Register the classes.
     */
	public function register(): void {
		foreach ( $this->services as $key => $class_name ) {
			$this->getContainer()->addShared( $key, $class_name )->addTag( self::TAG );
		}
    }
}
