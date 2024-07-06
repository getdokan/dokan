<?php

namespace WeDevs\Dokan\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class AdminServiceProvider extends BaseServiceProvider {
    public const TAG = 'admin-service';

	protected $services = [
		self::TAG,
	];

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
    }
}
