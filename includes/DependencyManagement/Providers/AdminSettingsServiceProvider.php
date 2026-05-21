<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Admin\Settings\Migration\BridgeBootstrap;
use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\LegacySettingsRepositoryInterface;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepositoryInterface;
use WeDevs\Dokan\Admin\Settings\Schema\SchemaValidator;
use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
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
        SettingsRegistry::class,
        SchemaValidator::class,
        SettingsRepository::class,
        LegacySettingsBridge::class,
        LegacySettingsRepository::class,
        BridgeBootstrap::class,
    ];

	/**
     * Register the classes.
     */
	public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->share_with_implements_tags( $service );
            $this->add_tags( $definition, $this->tags );
        }

        // Bind the repository interfaces to the same shared instances. Without
        // this, constructor injection of `?SettingsRepositoryInterface` /
        // `?LegacySettingsRepositoryInterface` falls back to the type-hint
        // default (null) and the consuming class instantiates a *fresh*
        // repository — yielding parallel snapshots that drift apart.
        $this->getContainer()
            ->add( SettingsRepositoryInterface::class, fn() => $this->getContainer()->get( SettingsRepository::class ) )
            ->setShared( true );
        $this->getContainer()
            ->add( LegacySettingsRepositoryInterface::class, fn() => $this->getContainer()->get( LegacySettingsRepository::class ) )
            ->setShared( true );
    }
}
