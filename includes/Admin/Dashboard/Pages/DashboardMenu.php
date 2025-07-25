<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class DashboardMenu extends AbstractPage {

    /**
     * Get the ID of the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
	public function get_id(): string {
		return 'dokan-admin-dashboard-menu';
	}

	/**
	 * @inheritDoc
	 */
	public function menu( string $capability, string $position ): array {
		return [
            'page_title' => __( 'Dashboard', 'dokan-lite' ),
            'menu_title' => __( 'Dashboard', 'dokan-lite' ),
            'route'      => '#',
            'capability' => $capability,
            'position'   => 99,
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
        return [ 'dokan-admin-dashboard-menu' ];
	}

    /**
     * Get the styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string> An array of style handles.
     */
    public function styles(): array {
        return [ 'dokan-admin-dashboard-menu' ];
    }

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register(): void {
        $asset_file = include DOKAN_DIR . '/assets/js/dokan-admin-dashboard-menu.asset.php';

        wp_register_script(
            'dokan-admin-dashboard-menu',
            DOKAN_PLUGIN_ASSEST . '/js/dokan-admin-dashboard-menu.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            [
                'strategy' => 'defer',
                'in_footer' => true,
            ]
        );

        wp_register_style( 'dokan-admin-dashboard-menu', DOKAN_PLUGIN_ASSEST . '/css/dokan-admin-dashboard-menu.css', [], $asset_file['version'] );
    }
}
