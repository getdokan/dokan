<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\CJDropshipping\Admin\Monitor;
use WeDevs\Dokan\CJDropshipping\Admin\SettingsSchema;
use WeDevs\Dokan\CJDropshipping\REST\Registrar;
use WeDevs\Dokan\CJDropshipping\Vendor\Navigation;
use WeDevs\Dokan\CJDropshipping\Product\Hooks as ProductHooks;
use WeDevs\Dokan\CJDropshipping\Data\Cleanup;
use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Data\OrderRefRepository;
use WeDevs\Dokan\CJDropshipping\Data\Schema;
use WeDevs\Dokan\CJDropshipping\Data\VariantRepository;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

/**
 * Registers the CJ Dropshipping services.
 *
 * @since DOKAN_SINCE
 */
class CJDropshippingServiceProvider extends BaseServiceProvider {

    protected $tags = [ 'cj-dropshipping-service' ];

    protected $services = [
        Schema::class,
        Cleanup::class,
        Monitor::class,
        SettingsSchema::class,
        Registrar::class,
        Navigation::class,
        ProductHooks::class,
        LinkRepository::class,
        VariantRepository::class,
        OrderRefRepository::class,
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
