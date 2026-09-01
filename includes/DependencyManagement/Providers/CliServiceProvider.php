<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;
use WeDevs\Dokan\CLI\Manager;

/**
 * Class CliServiceProvider
 *
 * Registers the WP-CLI command registry with the dependency container and tags
 * it so it is only resolved while running under WP-CLI.
 *
 * @since DOKAN_SINCE
 */
class CliServiceProvider extends BaseServiceProvider {
    /**
     * Tags used to identify the service in the container.
     *
     * @var array
     */
    protected $tags = [ 'cli-service' ];

    /**
     * List of services provided by this provider.
     *
     * @var array
     */
    protected $services = [
        Manager::class,
    ];

    /**
     * Register the CLI Manager in the container and add the corresponding tags.
     *
     * @return void
     */
    public function register(): void {
        $this->add_tags(
            $this->getContainer()->addShared( Manager::class ),
            $this->tags
        );
    }
}
