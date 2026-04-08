<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

/**
 * The settings page class.
 *
 * @since DOKAN_SINCE
 */
class Settings extends AbstractPage {

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
		return [];
	}

	/**
	 * @inheritDoc
	 */
	public function scripts(): array {
        return [];
	}

	/**
	 * @inheritDoc
	 */
	public function styles(): array {
		return [];
	}

	/**
	 * @inheritDoc
	 */
	public function register(): void {
        // Settings are now handled by the REST API and plugin-ui frontend.
	}
}
