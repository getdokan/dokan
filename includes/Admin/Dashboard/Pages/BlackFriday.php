<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

/**
 * Black Friday / Cyber Monday (BFCM) campaign page.
 *
 * Owns the seasonal "Black Friday" submenu entry. On Lite the page sells Pro; when Dokan Pro
 * ships its own upgrade page for the same route, this class only contributes the menu entry.
 *
 * @since 5.3.4
 *
 * @todo BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026), together with assets/images/black-friday; nothing switches itself off.
 */
class BlackFriday extends AbstractPage {

    /**
     * Dashboard route (also the URL fragment `#/black-friday`).
     *
     * @since 5.3.4
     */
    const ROUTE = 'black-friday';

    /**
     * Script and style handle.
     *
     * @since 5.3.4
     */
    const HANDLE = 'dokan-black-friday';

    /**
     * Purchase page for Lite users during BFCM.
     *
     * @since 5.3.4
     *
     * @var string
     */
    const DEAL_URL = 'https://dokan.co/wordpress/pricing/';

    /**
     * Build a campaign link tagged with the BFCM UTM parameters.
     *
     * @since 5.3.4
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
        if ( $this->is_hidden() ) {
            return [];
        }

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
        if ( $this->has_pro_page() || $this->is_hidden() ) {
            return [];
        }

        $plans = [];
        foreach ( [ 'starter', 'professional', 'business', 'enterprise' ] as $plan ) {
            $plans[ $plan ] = self::cta_url( 'plan-' . $plan, self::DEAL_URL );
        }

        return [
            'assets_url' => DOKAN_PLUGIN_ASSEST . '/images/black-friday',
            'urls'       => [
                'claim_deal'        => self::cta_url( 'hero-claim-deal', self::DEAL_URL ),
                'entrepreneur_pack' => self::cta_url( 'entrepreneur-pack', self::DEAL_URL ),
                'enterprise_bundle' => self::cta_url( 'enterprise-bundle', self::DEAL_URL ),
                'plans'             => $plans,
                'book_call'         => self::cta_url( 'book-a-call', 'https://calendly.com/dokan-support/30min?back=1' ),
            ],
        ];
    }

    /**
     * @inheritDoc
     */
    public function scripts(): array {
        return $this->has_pro_page() || $this->is_hidden() ? [] : [ self::HANDLE ];
    }

    /**
     * @inheritDoc
     */
    public function styles(): array {
        return $this->has_pro_page() || $this->is_hidden() ? [] : [ self::HANDLE ];
    }

    /**
     * Register the Lite page assets.
     *
     * @since 5.3.4
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
     * @since 5.3.4
     *
     * @return bool
     */
    protected function has_pro_page(): bool {
        /**
         * Filters whether Dokan Pro replaces the Lite Black Friday page.
         *
         * Keyed on the Pro page itself rather than on Pro being active. An older Pro
         * without the page hides the campaign entirely, see is_hidden().
         *
         * @since 5.3.4
         *
         * @param bool $has_pro_page Whether a Pro page is registered for the route.
         */
        return (bool) apply_filters( 'dokan_black_friday_pro_page', false );
    }

    /**
     * Whether the campaign page is hidden.
     *
     * An older Pro without its own upgrade page must not fall back to the Lite
     * offer, since that pitches the free-user deal to a paying Pro customer.
     *
     * @since 5.3.4
     *
     * @return bool
     */
    protected function is_hidden(): bool {
        return dokan()->is_pro_exists() && ! $this->has_pro_page();
    }
}
