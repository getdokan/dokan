<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;
use WeDevs\Dokan\ThemeSupport\Manager;
use WeDevs\Dokan\Vendor\StoreListsFilter;

/**
 * Class FrontendServiceProvider
 *
 * Registers and provides frontend-related services to the dependency container.
 *
 * @package WeDevs\Dokan\DependencyManagement\Providers
 */
class FrontendServiceProvider extends BaseServiceProvider {
    protected $tags = [ 'frontend-service' ];

    /**
     * List of service identifiers provided by this provider.
     *
     * @var array
     */
    protected $services = [
        StoreListsFilter::class,
        Manager::class,
    ];

    /**
     * Register the frontend services with the dependency container.
     *
     * @return void
     */
    public function register(): void {
        $container = $this->getContainer();

        $this->add_tags(
            $container->addShared( StoreListsFilter::class, StoreListsFilter::class ),
            $this->tags
        );

        $this->add_tags(
            $container->addShared( Manager::class, Manager::class ),
            $this->tags
        );
    }
}
