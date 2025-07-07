<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class ProFeatures extends AbstractPage {

    /**
     * Get the ID of the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
	public function get_id(): string {
		return 'pro-features';
	}

	/**
	 * @inheritDoc
	 */
	public function menu( string $capability, string $position ): array {
		return [
            'page_title' => __( 'Dokan Pro Features', 'dokan-lite' ),
            'menu_title' => __( 'Pro Features', 'dokan-lite' ),
            'route'      => 'pro-features',
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
        return [ 'dokan-pro-features' ];
	}

    /**
     * Get the styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string> An array of style handles.
     */
    public function styles(): array {
        return [ 'dokan-pro-features' ];
    }

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register(): void {
        $asset_file = include DOKAN_DIR . '/assets/js/dokan-pro-features.asset.php';

        wp_register_script(
            'dokan-pro-features',
            DOKAN_PLUGIN_ASSEST . '/js/dokan-pro-features.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            [
                'strategy' => 'defer',
                'in_footer' => true,
            ]
        );

        wp_register_style( 'dokan-pro-features', DOKAN_PLUGIN_ASSEST . '/css/dokan-pro-features.css', [], $asset_file['version'] );
    }
}
