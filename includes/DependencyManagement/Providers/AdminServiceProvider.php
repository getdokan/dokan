<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Admin\Status\Status;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class AdminServiceProvider extends BaseServiceProvider {
    /**
     * Tag for services added to the container.
     */
    public const TAG = 'admin-service';

	protected $services = [
		self::TAG,
        Status::class,
	];

	/**
     * {@inheritDoc}
     *
     * Check if the service provider can provide the given service alias.
     *
     * @param string $alias The service alias to check.
     * @return bool True if the service provider can provide the service, false otherwise.
     */
	public function provides( string $alias ): bool {
		return in_array( $alias, $this->services, true );
	}

	/**
     * Register the classes.
     */
	public function register(): void {
		$this->getContainer()
            ->addShared( \WeDevs\Dokan\Admin\Hooks::class, \WeDevs\Dokan\Admin\Hooks::class )
            ->addTag( self::TAG );

		$this->getContainer()
            ->addShared( \WeDevs\Dokan\Admin\Menu::class, \WeDevs\Dokan\Admin\Menu::class )
            ->addTag( self::TAG );

        $this->getContainer()
            ->addShared( \WeDevs\Dokan\Admin\AdminBar::class, \WeDevs\Dokan\Admin\AdminBar::class )
            ->addTag( self::TAG );

		$this->getContainer()
            ->addShared( \WeDevs\Dokan\Admin\Pointers::class, \WeDevs\Dokan\Admin\Pointers::class )
            ->addTag( self::TAG );

        $this->getContainer()
            ->addShared( \WeDevs\Dokan\Admin\Settings::class, \WeDevs\Dokan\Admin\Settings::class )
            ->addTag( self::TAG );

        $this->getContainer()
            ->addShared( \WeDevs\Dokan\Admin\UserProfile::class, \WeDevs\Dokan\Admin\UserProfile::class )
            ->addTag( self::TAG );

		$this->getContainer()
            ->addShared( \WeDevs\Dokan\Admin\SetupWizard::class, \WeDevs\Dokan\Admin\SetupWizard::class )
            ->addTag( self::TAG );
		$this->getContainer()
            ->addShared( \WeDevs\Dokan\Admin\Status\Status::class, \WeDevs\Dokan\Admin\Status\Status::class )
            ->addTag( self::TAG );
    }
}
