<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Blocks\Manager;
use WeDevs\Dokan\Blocks\Patterns;
use WeDevs\Dokan\Blocks\Templates;
use WeDevs\Dokan\Blocks\VendorResolver;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

/**
 * Class BlocksServiceProvider
 *
 * Registers the Gutenberg/FSE block services (block types, patterns, block
 * templates and the shared vendor context resolver) with the container.
 *
 * @since DOKAN_SINCE
 *
 * @package WeDevs\Dokan\DependencyManagement\Providers
 */
class BlocksServiceProvider extends BaseServiceProvider {

    protected $tags = [ 'blocks-service' ];

    /**
     * List of services provided by this provider.
     *
     * @var array
     */
    protected $services = [
        Manager::class,
        Patterns::class,
        Templates::class,
        VendorResolver::class,
    ];

    /**
     * Register the block services with the dependency container.
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
