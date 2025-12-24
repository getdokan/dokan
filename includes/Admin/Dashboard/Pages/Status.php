<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class Status extends AbstractPage {

    /**
     * Get the ID of the page.
     *
     * @since 4.0.0
     *
     * @return string
     */
	public function get_id(): string {
		return 'status';
	}

	/**
	 * @inheritDoc
	 */
	public function menu( string $capability, string $position ): array {
		return [
            'page_title' => __( 'Dokan Status', 'dokan-lite' ),
            'menu_title' => __( 'Status', 'dokan-lite' ),
            'route'      => 'status',
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
        return [ 'dokan-status' ];
	}

    /**
     * Get the styles.
     *
     * @since 4.0.0
     *
     * @return array<string> An array of style handles.
     */
    public function styles(): array {
        return [ 'dokan-status' ];
    }

    /**
     * Register the page scripts and styles.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function register(): void {
        $asset_file = include DOKAN_DIR . '/assets/js/dokan-status.asset.php';

        wp_register_script(
            'dokan-status',
            DOKAN_PLUGIN_ASSEST . '/js/dokan-status.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            [
                'strategy' => 'defer',
                'in_footer' => true,
            ]
        );

        wp_register_style( 'dokan-status', DOKAN_PLUGIN_ASSEST . '/css/dokan-status.css', [], $asset_file['version'] );
    }
}
