<?php

namespace WeDevs\Dokan\Admin\Dashboard;

use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Admin\Notices\Helper;

/**
 * Admin dashboard class.
 *
 * @since DOKAN_SINCE
 */
class Dashboard implements Hookable {

    /**
     * @var array< Pageable >
     */
    protected array $pages = [];

    /**
     * @var string
     */
    protected string $script_key = 'dokan-admin-dashboard';

    /**
     * Register hooks.
     */
    public function register_hooks(): void {
        add_action( 'dokan_admin_menu', [ $this, 'register_menu' ], 99, 2 );
        add_action( 'dokan_register_scripts', [ $this, 'register_scripts' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
    }

    /**
     * Get all pages.
     *
     * @since DOKAN_SINCE
     *
     * @return array< Pageable >
     *
     * @throws \InvalidArgumentException If the page is not an instance of Pageable.
     */
    public function get_pages(): array {
        $pages = apply_filters( 'dokan_admin_dashboard_pages', $this->pages );

        if ( ! is_array( $pages ) ) {
            return $this->pages;
        }

        return array_filter(
            $pages, function ( $page ) {
				if ( ! $page instanceof Pageable ) {
					throw new \InvalidArgumentException( esc_html__( 'The page must be an instance of Pageable.', 'dokan-lite' ) );
				}
				return true;
			}
        );
    }

    /**
     * Register the submenu menu.
     *
     * @since DOKAN_SINCE
     *
     * @param string $capability Menu capability.
     * @param string $position Menu position.
     *
     * @return void
     */
    public function register_menu( string $capability, string $position ) {
        global $submenu;

        $parent_slug = 'dokan';

        // TODO: Remove and rewrite this code for registering `dokan-dashboard`.
        $menu_slug = 'dokan-dashboard';
        add_submenu_page(
            'dokan',
            '',
            '',
            $capability,
            $menu_slug,
            [ $this, 'render_dashboard_page' ],
            1
        );

        foreach ( $this->get_pages() as $page ) {
            $menu_args = $page->menu( $capability, $position );

            if ( ! $menu_args ) {
                continue;
            }

            $route = $menu_args['route'] ?? $page->get_id();
            $route = trim( $route, ' /' );

            // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
            $submenu[ $parent_slug ][] = [ $menu_args['menu_title'], $capability, 'admin.php?page=' . $menu_slug . '#/' . $route ];
        }
    }

    /**
     * Render the dashboard page.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function render_dashboard_page(): void {
        ob_start();
        echo '<div class="wrap"><div id="dokan-admin-dashboard" class="dokan-layout">' . esc_html__( 'Loading...', 'dokan-lite' ) . '</div></div>';
        echo ob_get_clean();
    }

    /**
     * Get all settings.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, mixed>
     */
    public function settings(): array {
        $dashboard_url = admin_url( 'admin.php?page=dokan' );
        $header_info   = [
            'lite_version'    => DOKAN_PLUGIN_VERSION,
            'is_pro_exists'   => dokan()->is_pro_exists(),
            'dashboard_url'   => $dashboard_url,
            'help_menu_items' => apply_filters(
                'dokan_admin_setup_guides_help_menu_items',
                [
                    [
                        'id'       => 'whats-new',
                        'title'    => esc_html__( "What's New", 'dokan-lite' ),
                        'url'      => $dashboard_url . '#/changelog',
                        'icon'     => 'whats-new',
                        'active'   => Helper::dokan_has_new_version(),
                        'external' => false,
                    ],
                    [
                        'id'       => 'get-support',
                        'title'    => esc_html__( 'Get Support', 'dokan-lite' ),
                        'url'      => 'https://wedevs.com/account/tickets/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite',
                        'icon'     => 'support',
                        'external' => true,
                    ],
                    [
                        'id'       => 'community',
                        'title'    => esc_html__( 'Community', 'dokan-lite' ),
                        'url'      => 'https://www.facebook.com/groups/dokanMultivendor',
                        'icon'     => 'facebook',
                        'external' => true,
                    ],
                    [
                        'id'       => 'documentation',
                        'title'    => esc_html__( 'Documentation', 'dokan-lite' ),
                        'url'      => 'https://wedevs.com/docs/dokan/getting-started/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite',
                        'icon'     => 'documentation',
                        'external' => true,
                    ],
                    [
                        'id'       => 'faq',
                        'title'    => esc_html__( 'FAQ', 'dokan-lite' ),
                        'url'      => 'https://dokan.co/wordpress/faq/',
                        'icon'     => 'faq',
                        'external' => true,
                    ],
                    [
                        'id'       => 'basic-fundamental',
                        'title'    => esc_html__( 'Basic & Fundamental', 'dokan-lite' ),
                        'url'      => $dashboard_url . '#/help',
                        'icon'     => 'settings',
                        'external' => false,
                    ],
                    [
                        'id'       => 'feature-request',
                        'title'    => __( 'Request a Feature', 'dokan-lite' ),
                        'url'      => 'https://wedevs.com/account/dokan-feature-requests/',
                        'icon'     => 'feature-request',
                        'external' => true,
                    ],
                    [
                        'id'       => 'setup-wizard',
                        'title'    => __( 'Run Setup Wizard', 'dokan-lite' ),
                        'url'      => admin_url( 'admin.php?page=dokan-setup' ),
                        'icon'     => 'setup-wizard',
                        'external' => false,
                    ],
                    [
                        'id'       => 'import-dummy-data',
                        'title'    => __( 'Import dummy data', 'dokan-lite' ),
                        'url'      => $dashboard_url . '#/dummy-data',
                        'icon'     => 'import-data',
                        'external' => false,
                    ],
                ]
            )
        ];

        if ( dokan()->is_pro_exists() ) {
            $header_info['pro_version']  = DOKAN_PRO_PLUGIN_VERSION;
            $header_info['license_plan'] = dokan_pro()->license->get_plan();
        }

        $settings = [
            'nonce'       => wp_create_nonce( 'dokan_admin_dashboard' ),
            'header_info' => apply_filters( 'dokan_admin_setup_guides_header_info', $header_info ),
        ];

        foreach ( $this->get_pages() as $page ) {

            /**
             * Filter the settings for a specific page.
             *
             * @since DOKAN_SINCE
             *
             * @param  array  $settings The settings.
             * @param  string $page_id The page ID.
             * @param  Pageable $page The page.
             */
            $settings[ $page->get_id() ] = apply_filters( 'dokan_admin_dashboard_page_settings', $page->settings(), $page->get_id(), $page );
        }

        /**
         * Filter the settings.
         *
         * @since DOKAN_SINCE
         *
         * @param array<string, mixed> $settings The settings.
         */
        return apply_filters( 'dokan_admin_dashboard_pages_settings', $settings );
    }

    /**
     * Get all scripts ids.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string>
     */
    public function scripts(): array {
        return array_reduce(
            $this->get_pages(), fn( $carry, $page ) => array_merge( $carry, $page->scripts() ), [ $this->script_key ]
        );
    }

    /**
     * Get all styles ids.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string>
     */
    public function styles(): array {
        return array_reduce(
            $this->get_pages(), fn( $carry, $page ) => array_merge( $carry, $page->styles() ), [ $this->script_key ]
        );
    }

    /**
     * Register dashboard scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_scripts() {
        $admin_dashboard_script = require DOKAN_DIR . '/assets/js/dokan-admin-dashboard.asset.php';
        $setup_guide_script     = require DOKAN_DIR . '/assets/js/setup-guide-banner.asset.php';

        // Register the main script.
        wp_register_script( $this->script_key, DOKAN_PLUGIN_ASSEST . '/js/dokan-admin-dashboard.js', $admin_dashboard_script['dependencies'], $admin_dashboard_script['version'], true );
        wp_register_style( $this->script_key, DOKAN_PLUGIN_ASSEST . '/css/dokan-admin-dashboard.css', [], $admin_dashboard_script['version'] );

        // Register the setup guide banner script.
        wp_register_script( 'dokan-setup-guide-banner', DOKAN_PLUGIN_ASSEST . '/js/setup-guide-banner.js', $setup_guide_script['dependencies'], $setup_guide_script['version'], true );
        wp_register_style( 'dokan-setup-guide-banner', DOKAN_PLUGIN_ASSEST . '/css/setup-guide-banner.css', [], $setup_guide_script['version'] );

        // Register all other scripts.
        foreach ( $this->get_pages() as $page ) {
            $page->register();
        }
    }

    /**
     * Enqueue dashboard scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function enqueue_scripts() {
        $screen = get_current_screen();

        if ( $screen->id !== 'toplevel_page_dokan' ) {
            return;
        }

        // Enqueue the setup guide banner script.
        wp_enqueue_style( 'dokan-setup-guide-banner' );
        wp_enqueue_script( 'dokan-setup-guide-banner' );

        if ( $screen->id !== 'dokan_page_dokan-dashboard' ) {
            return;
        }

        foreach ( $this->scripts() as $handle ) {
            wp_enqueue_script( $handle );
        }

        foreach ( $this->styles() as $handle ) {
            wp_enqueue_style( $handle );
        }

        // Localize the settings.
        wp_add_inline_script(
            $this->script_key, 'const dokanAdminDashboardSettings = ' . wp_json_encode(
                $this->settings()
            ), 'before'
        );
    }
}
