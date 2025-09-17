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
        return [
            'dokanAiBanner'       => DOKAN_PLUGIN_ASSEST . '/images/pro-features/DokanAi.png',
            'dokanAiBannerMobile' => DOKAN_PLUGIN_ASSEST . '/images/pro-features/DokanAiMobile.png',
            'dokanAiBannerTablet' => DOKAN_PLUGIN_ASSEST . '/images/pro-features/DokanAiTablet.png',
            'iftsyImg'            => DOKAN_PLUGIN_ASSEST . '/images/pro-features/iftsy.png',
            'bidCuriousImg'       => DOKAN_PLUGIN_ASSEST . '/images/pro-features/bidCurious.png',
            'bootstrapImg'        => DOKAN_PLUGIN_ASSEST . '/images/pro-features/bootstrap.png',
            'designAddictImg'     => DOKAN_PLUGIN_ASSEST . '/images/pro-features/designAddict.png',
            'parsiankalaImg'      => DOKAN_PLUGIN_ASSEST . '/images/pro-features/parsiankala.png',
            'zakartoImg'          => DOKAN_PLUGIN_ASSEST . '/images/pro-features/zakarto.png',
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
            'g2Logo'              => DOKAN_PLUGIN_ASSEST . '/images/pro-features/g2Logo.png',
            'trustpilotLogo'      => DOKAN_PLUGIN_ASSEST . '/images/pro-features/trustpilotLogo.png',
            'capterraLogo'        => DOKAN_PLUGIN_ASSEST . '/images/pro-features/capterraLogo.png',
            'wordpressLogo'       => DOKAN_PLUGIN_ASSEST . '/images/pro-features/wordpressLogo.png',
            'shippingImg'         => DOKAN_PLUGIN_ASSEST . '/images/pro-features/shipping.png',
            'paymentImg'          => DOKAN_PLUGIN_ASSEST . '/images/pro-features/payment.png',
            'smartImg'            => DOKAN_PLUGIN_ASSEST . '/images/pro-features/smart.png',
            'storeImg'            => DOKAN_PLUGIN_ASSEST . '/images/pro-features/store.png',
            'brandingImg'         => DOKAN_PLUGIN_ASSEST . '/images/pro-features/branding.png',
            'supportImg'          => DOKAN_PLUGIN_ASSEST . '/images/pro-features/support.png',
            'unlockBanner'        => DOKAN_PLUGIN_ASSEST . '/images/pro-features/unlock-banner.png',
            'unlockBannerMobile'  => DOKAN_PLUGIN_ASSEST . '/images/pro-features/unlock-banner-mobile.png',
            'unlockBannerTablet'  => DOKAN_PLUGIN_ASSEST . '/images/pro-features/unlock-banner-tablet.png',
            'scaleImg'            => DOKAN_PLUGIN_ASSEST . '/images/pro-features/scale.png',
            'scaleMobileImg'      => DOKAN_PLUGIN_ASSEST . '/images/pro-features/scale-mobile.png',
            'moduleBanner'        => DOKAN_PLUGIN_ASSEST . '/images/pro-features/modules-banner.png',
            'moduleBannerMobile'  => DOKAN_PLUGIN_ASSEST . '/images/pro-features/modules-banner-mobile.png',
            'moduleBannerTablet'  => DOKAN_PLUGIN_ASSEST . '/images/pro-features/modules-banner-tablet.png',
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
