<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

use WeDevs\Dokan\Admin\Settings\Settings as AdminSettingsProvider;

/**
 * The settings page class.
 *
 * @since DOKAN_SINCE
 */
class Settings extends AbstractPage {

    /**
     * @var AdminSettingsProvider $settings_provider Admin setup guide instance.
     */
    protected AdminSettingsProvider $settings_provider;

    /**
     * SetupGuide constructor.
     *
     * @param AdminSettingsProvider $admin_setup_guide Admin setup guide instance.
     */
    public function __construct( AdminSettingsProvider $admin_setup_guide ) {
        $this->settings_provider = $admin_setup_guide;
    }

	/**
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'settings';
	}

	/**
	 * @inheritDoc
	 */
	public function menu( string $capability, string $position ): array {
        return [
            'page_title' => __( 'Admin Settings', 'dokan-lite' ),
            'menu_title' => __( 'Settings', 'dokan-lite' ),
            'route'      => $this->get_id(),
            'capability' => $capability,
            'position'   => 5,
            'hidden'     => false,
        ];
	}

	/**
	 * @inheritDoc
	 */
	public function settings(): array {
		return $this->settings_provider->settings();
	}

	/**
	 * @inheritDoc
	 */
	public function scripts(): array {
        return $this->settings_provider->scripts();
	}

	/**
	 * @inheritDoc
	 */
	public function styles(): array {
		return $this->settings_provider->styles();
	}

	/**
	 * @inheritDoc
	 */
	public function register(): void {
        $this->settings_provider->register();
	}
}
