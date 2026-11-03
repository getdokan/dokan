<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

/**
 * Black Friday / Cyber Monday (BFCM) campaign page.
 *
 * Owns the seasonal "Black Friday" submenu entry. On Lite the page sells Pro; when Dokan Pro
 * ships its own upgrade page for the same route, this class only contributes the menu entry.
 *
 * @since DOKAN_SINCE
 *
 * @todo BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); nothing switches itself off.
 */
class BlackFriday extends AbstractPage {

    /**
     * Dashboard route (also the URL fragment `#/black-friday`).
     *
     * @since DOKAN_SINCE
     */
    const ROUTE = 'black-friday';

    /**
     * Script and style handle.
     *
     * @since DOKAN_SINCE
     */
    const HANDLE = 'dokan-black-friday';

    /**
     * Build a campaign link tagged with the BFCM UTM parameters.
     *
     * @since DOKAN_SINCE
     *
     * @param string $content Value for `utm_content`, identifying the clicked CTA.
     * @param string $url     Destination; defaults to the Dokan pricing page.
     *
     * @return string
     */
    public static function cta_url( string $content, string $url = '' ): string {
        return add_query_arg(
            [
                'utm_source'   => 'plugin',
                'utm_medium'   => 'wp-admin',
                'utm_campaign' => 'bfcm-2026',
                'utm_content'  => $content,
            ],
            $url ? $url : dokan_pro_buynow_url()
        );
    }

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return self::ROUTE;
    }

    /**
     * @inheritDoc
     */
    public function menu( string $capability, string $position ): array {
        $badge = $this->has_pro_page() ? esc_html__( '75% OFF', 'dokan-lite' ) : esc_html__( '60% OFF', 'dokan-lite' );

        return [
            'menu_title' => sprintf(
                '%1$s <span class="dokan-black-friday-menu-badge">%2$s</span>',
                esc_html__( 'Black Friday', 'dokan-lite' ),
                $badge
            ),
            'route'      => self::ROUTE,
            'capability' => $capability,
            'hidden'     => true, // Rendered via Menu::append_dashboard_page_submenu() so it sits between "Pro Features" and "Settings".
        ];
    }

    /**
     * @inheritDoc
     */
    public function settings(): array {
        if ( $this->has_pro_page() ) {
            return [];
        }

        $plans = [];
        foreach ( [ 'starter', 'professional', 'business', 'enterprise' ] as $plan ) {
            $plans[ $plan ] = self::cta_url( 'plan-' . $plan );
        }

        return [
            'assets_url' => DOKAN_PLUGIN_ASSEST . '/images/black-friday',
            'urls'       => [
                'claim_deal'        => self::cta_url( 'hero-claim-deal' ),
                'entrepreneur_pack' => self::cta_url( 'entrepreneur-pack' ),
                'enterprise_bundle' => self::cta_url( 'enterprise-bundle' ),
                'plans'             => $plans,
                'book_call'         => self::cta_url( 'book-a-call', 'https://dokan.co/contact/' ),
            ],
        ];
    }

    /**
     * @inheritDoc
     */
    public function scripts(): array {
        return $this->has_pro_page() ? [] : [ self::HANDLE ];
    }

    /**
     * @inheritDoc
     */
    public function styles(): array {
        return $this->has_pro_page() ? [] : [ self::HANDLE ];
    }

    /**
     * Register the Lite page assets.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register(): void {
        $asset_file = DOKAN_DIR . '/assets/js/dokan-black-friday.asset.php';

        if ( ! file_exists( $asset_file ) ) {
            return;
        }

        $asset = include $asset_file;

        wp_register_script(
            self::HANDLE,
            DOKAN_PLUGIN_ASSEST . '/js/dokan-black-friday.js',
            $asset['dependencies'],
            $asset['version'],
            [
                'strategy'  => 'defer',
                'in_footer' => true,
            ]
        );

        wp_set_script_translations( self::HANDLE, 'dokan-lite' );

        wp_register_style( self::HANDLE, DOKAN_PLUGIN_ASSEST . '/css/dokan-black-friday.css', [], $asset['version'] );
    }

    /**
     * Whether Dokan Pro renders its own upgrade page on this route.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    protected function has_pro_page(): bool {
        /**
         * Filters whether Dokan Pro replaces the Lite Black Friday page.
         *
         * Keyed on the Pro page itself rather than on Pro being active, so an older Pro
         * without the page still gets the Lite page instead of an empty route.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $has_pro_page Whether a Pro page is registered for the route.
         */
        return (bool) apply_filters( 'dokan_black_friday_pro_page', false );
    }
}
