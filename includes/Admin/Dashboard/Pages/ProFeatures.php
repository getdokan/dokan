<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class ProFeatures extends AbstractPage {

    /**
     * Get the ID of the page.
     *
     * @since 4.1.0
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
        if ( dokan()->is_pro_exists() ) {
            return [];
        }
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
        return [
            'avatar1'             => DOKAN_PLUGIN_ASSEST . '/images/pro-features/Avatar1.png',
            'avatar2'             => DOKAN_PLUGIN_ASSEST . '/images/pro-features/Avatar2.png',
            'avatar3'             => DOKAN_PLUGIN_ASSEST . '/images/pro-features/Avatar3.png',
            'avatar4'             => DOKAN_PLUGIN_ASSEST . '/images/pro-features/Avatar4.png',
            'avatar5'             => DOKAN_PLUGIN_ASSEST . '/images/pro-features/Avatar5.png',
            'avatar6'             => DOKAN_PLUGIN_ASSEST . '/images/pro-features/Avatar6.png',
            'avatar7'             => DOKAN_PLUGIN_ASSEST . '/images/pro-features/Avatar7.png',
            'avatar8'             => DOKAN_PLUGIN_ASSEST . '/images/pro-features/Avatar8.png',
            'avatar9'             => DOKAN_PLUGIN_ASSEST . '/images/pro-features/Avatar9.png',
            'avatar10'            => DOKAN_PLUGIN_ASSEST . '/images/pro-features/Avatar10.png',
            'avatar11'            => DOKAN_PLUGIN_ASSEST . '/images/pro-features/Avatar11.png',
            'iftsyImg'            => DOKAN_PLUGIN_ASSEST . '/images/pro-features/iftsy.webp',
            'bidCuriousImg'       => DOKAN_PLUGIN_ASSEST . '/images/pro-features/bidCurious.webp',
            'bootstrapImg'        => DOKAN_PLUGIN_ASSEST . '/images/pro-features/bootstrap.webp',
            'designAddictImg'     => DOKAN_PLUGIN_ASSEST . '/images/pro-features/designAddict.webp',
            'parsiankalaImg'      => DOKAN_PLUGIN_ASSEST . '/images/pro-features/parsiankala.webp',
            'zakartoImg'          => DOKAN_PLUGIN_ASSEST . '/images/pro-features/zakarto.webp',
            'g2Logo'              => DOKAN_PLUGIN_ASSEST . '/images/pro-features/g2Logo.webp',
            'trustpilotLogo'      => DOKAN_PLUGIN_ASSEST . '/images/pro-features/trustpilotLogo.webp',
            'capterraLogo'        => DOKAN_PLUGIN_ASSEST . '/images/pro-features/capterraLogo.webp',
            'wordpressLogo'       => DOKAN_PLUGIN_ASSEST . '/images/pro-features/wordpressLogo.webp',
            'shippingImg'         => DOKAN_PLUGIN_ASSEST . '/images/pro-features/shipping.webp',
            'paymentImg'          => DOKAN_PLUGIN_ASSEST . '/images/pro-features/payment.webp',
            'smartImg'            => DOKAN_PLUGIN_ASSEST . '/images/pro-features/smart.webp',
            'storeImg'            => DOKAN_PLUGIN_ASSEST . '/images/pro-features/store.webp',
            'brandingImg'         => DOKAN_PLUGIN_ASSEST . '/images/pro-features/branding.webp',
            'supportImg'          => DOKAN_PLUGIN_ASSEST . '/images/pro-features/support.webp',
            'crownLock'  => DOKAN_PLUGIN_ASSEST . '/images/pro-features/CrownLock.png',
            'aiStart'  => DOKAN_PLUGIN_ASSEST . '/images/pro-features/AiStart.png',
            'products'  => DOKAN_PLUGIN_ASSEST . '/images/pro-features/Products.png',
            'photo'  => DOKAN_PLUGIN_ASSEST . '/images/pro-features/photo.png',
            'dokanSmall'  => DOKAN_PLUGIN_ASSEST . '/images/pro-features/DokanSmall.png',
            'dokanLarge'  => DOKAN_PLUGIN_ASSEST . '/images/pro-features/DokanLarge.png',
        ];
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
     * @since 4.1.0
     *
     * @return array<string> An array of style handles.
     */
    public function styles(): array {
        return [ 'dokan-pro-features' ];
    }

    /**
     * Register the page scripts and styles.
     *
     * @since 4.1.0
     *
     * @return void
     */
    public function register(): void {
        if ( dokan()->is_pro_exists() ) {
            return;
        }
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
