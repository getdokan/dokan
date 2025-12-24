<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

use WeDevs\Dokan\Admin\OnboardingSetup\AdminSetupGuide;

class SetupGuide extends AbstractPage {

    /**
     * @var AdminSetupGuide $admin_setup_guide Admin setup guide instance.
     */
    protected AdminSetupGuide $admin_setup_guide;

    /**
     * SetupGuide constructor.
     *
     * @param AdminSetupGuide $admin_setup_guide Admin setup guide instance.
     */
    public function __construct( AdminSetupGuide $admin_setup_guide ) {
        $this->admin_setup_guide = $admin_setup_guide;
    }

	/**
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'setup';
	}

	/**
	 * @inheritDoc
	 */
	public function menu( string $capability, string $position ): array {
        return [
            'page_title' => __( 'Setup Guide', 'dokan-lite' ),
            'menu_title' => __( 'Setup', 'dokan-lite' ),
            'route'      => $this->get_id(),
            'capability' => $capability,
            'position'   => 5,
            'hidden' => true,
        ];
	}

	/**
	 * @inheritDoc
	 */
	public function settings(): array {
		return $this->admin_setup_guide->settings();
	}

	/**
	 * @inheritDoc
	 */
	public function scripts(): array {
        return $this->admin_setup_guide->scripts();
	}

	/**
	 * @inheritDoc
	 */
	public function styles(): array {
		return $this->admin_setup_guide->styles();
	}

	/**
	 * @inheritDoc
	 */
	public function register(): void {
        $this->admin_setup_guide->register();
	}
}
