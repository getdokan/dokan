<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class Modules extends AbstractPage {

    /**
     * Get the ID of the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
	public function get_id(): string {
		return 'pro-modules';
	}

	/**
	 * @inheritDoc
	 */
	public function menu( string $capability, string $position ): array {
		return [
            'page_title' => __( 'Dokan Modules', 'dokan-lite' ),
            'menu_title' => __( 'Lite Modules', 'dokan-lite' ),
            'route'      => 'pro-modules',
            'capability' => $capability,
            'position'   => 30,
        ];
	}

	/**
	 * @inheritDoc
	 */
	public function settings(): array {
		return [
            'upgrade_url' => 'https://dokan.co/wordpress/upgrade-to-pro/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite',
            'modules' => [
				[
					'title' => __( 'Auction Integration', 'dokan-lite' ),
					'image' => DOKAN_PLUGIN_ASSEST . '/images/modules/auction.svg',
					'description'  => __( 'A plugin that combined WooCommerce simple auction and Dokan plugin.', 'dokan-lite' ),
					'tags' => [
						'Product Management',
						'Integration',
					],
					'actions' => [
						'docs' => 'https://dokan.co/docs/wordpress/modules/woocommerce-auctions-frontend-multivendor-marketplace/',
						'video' => '',
					],
					'requires' => [
						'WooCommerce Simple Auctions',
					],
				],
				[
					'title' => __( 'Color Scheme Customizer', 'dokan-lite' ),
					'image' => DOKAN_PLUGIN_ASSEST . '/images/modules/color-scheme-customizer.svg',
					'description'  => __( 'A Dokan plugin Add-on to Customize Colors of Dokan Dashboard', 'dokan-lite' ),
					'tags' => [
						'UI & UX',
					],
					'actions' => [
						'docs' => 'https://dokan.co/docs/wordpress/modules/color-scheme/',
						'video' => '',
					],
					'requires' => [
						'WooCommerce Simple Auctions',
					],
				],
			],
		];
	}

	/**
	 * @inheritDoc
	 */
	public function scripts(): array {
        return [];
	}

    /**
     * Get the styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string> An array of style handles.
     */
    public function styles(): array {
        return [];
    }

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register(): void {}
}
