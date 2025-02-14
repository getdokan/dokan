<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;
use WeDevs\Dokan\Intelligence\Assets;
use WeDevs\Dokan\Intelligence\Admin\Settings;
use WeDevs\Dokan\Intelligence\Manager;

class IntelligenceServiceProvider extends BaseServiceProvider {
    /**
     * Tags for services added to the container.
     */
    protected $tags = [ 'intelligence-service' ];

	protected $services = [
        Assets::class,
        Manager::class,
        Settings::class,
    ];

	/**
     * Register the classes.
     */
	public function register(): void {
        $this->add_tags( $this->getContainer()->add( Manager::class ), $this->tags );

        $assets = $this->share_with_implements_tags( Assets::class );
        $this->add_tags( $assets, $this->tags );

        $settings = $this->share_with_implements_tags( Settings::class );
        $this->add_tags( $settings, $this->tags );
    }
}
