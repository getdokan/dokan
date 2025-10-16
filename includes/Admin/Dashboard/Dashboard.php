<?php

namespace WeDevs\Dokan\Admin\Dashboard;

use WeDevs\Dokan\Admin\Notices\Helper;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Admin dashboard class.
 *
 * @since 4.0.0
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
     * @var string
     */
    protected string $setup_guide_key = 'dokan-setup-guide-banner';

    /**
     * Admin panel header script key.
     *
     * @since DOKAN_SINCE
     *
     * @var string
     */
    protected string $header_script_key = 'dokan-admin-panel-header';

    /**
     * Register hooks.
     */
    public function register_hooks(): void {
        add_action( 'dokan_admin_menu', [ $this, 'register_menu' ], 99, 2 );
        add_action( 'dokan_register_scripts', [ $this, 'register_scripts' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
        add_action( 'admin_menu', [ $this, 'clear_dokan_submenu_title' ], 20 );
        add_action( 'admin_notices', [ $this, 'inject_before_notices' ], -9999 );
        add_action( 'admin_notices', [ $this, 'inject_after_notices' ], PHP_INT_MAX );
        add_action( 'admin_init', [ $this, 'handle_dashboard_redirect' ] );
    }

    /**
     * Get all pages.
     *
     * @since 4.0.0
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
     * @since 4.0.0
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
            esc_html__( 'Dokan Admin Dashboard', 'dokan-lite' ),
            esc_html__( 'Dashboard', 'dokan-lite' ),
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

            if ( ! empty( $menu_args['hidden'] ) ) {
                continue;
            }

            // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
            $submenu[ $parent_slug ][] = [ $menu_args['menu_title'], $capability, 'admin.php?page=' . $menu_slug . '#/' . $route ];
        }
    }

    /**
     * Render the dashboard page.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function render_dashboard_page(): void {
        ob_start();
        echo '<div id="dokan-admin-panel-header" class="dokan-layout"></div>';
        echo '<div class="wrap"><div id="dokan-admin-dashboard" class="dokan-layout dokan-admin-page-body">' . esc_html__( 'Loading...', 'dokan-lite' ) . '</div></div>';
        echo ob_get_clean();
    }

    /**
     * Get all settings.
     *
     * @since 4.0.0
     *
     * @return array<string, mixed>
     */
    public function settings(): array {
        // TODO: We are using dokan legacy dashboard URL here for legacy `Import Dummy Data` & `Basic & Fundamental` page.
        // We will remove this code after getting the new `Import Dummy Data` & `Basic & Fundamental` page.
        $dashboard_url = admin_url( 'admin.php?page=dokan' );
        $header_info   = [
            'lite_version'    => DOKAN_PLUGIN_VERSION,
            'is_pro_exists'   => dokan()->is_pro_exists(),
            'dashboard_url'   => $dashboard_url,
            'has_new_version' => Helper::dokan_has_new_version(),
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
                        'id'       => 'import-dummy-data',
                        'title'    => __( 'Import dummy data', 'dokan-lite' ),
                        'url'      => $dashboard_url . '#/dummy-data',
                        'icon'     => 'import-data',
                        'external' => false,
                    ],
                ]
            ),
        ];

        if ( dokan()->is_pro_exists() ) {
            $header_info['pro_version']  = DOKAN_PRO_PLUGIN_VERSION;
            $header_info['license_plan'] = dokan_pro()->license->get_plan();
        }

        $settings = [
            'nonce'         => wp_create_nonce( 'dokan_admin_dashboard' ),
            'header_info'   => apply_filters( 'dokan_admin_setup_guides_header_info', $header_info ),
            'dashboard_url' => add_query_arg(
                [
                    'dokan_admin_dashboard_switching_nonce' => wp_create_nonce( 'dokan_switch_admin_dashboard' ),
                    'dokan_action'                          => 'switch_dashboard',
                ],
                admin_url()
            ),
        ];

        foreach ( $this->get_pages() as $page ) {

            /**
             * Filter the settings for a specific page.
             *
             * @since 4.0.0
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
         * @since 4.0.0
         *
         * @param array<string, mixed> $settings The settings.
         */
        return apply_filters( 'dokan_admin_dashboard_pages_settings', $settings );
    }

    /**
     * Get all scripts ids.
     *
     * @since 4.0.0
     *
     * @return array<string>
     */
    public function scripts(): array {
        return array_reduce(
            $this->get_pages(), fn( $carry, $page ) => array_merge( $carry, $page->scripts() ), [
                $this->script_key,
                $this->header_script_key,
                $this->setup_guide_key,
            ]
        );
    }

    /**
     * Get all styles ids.
     *
     * @since 4.0.0
     *
     * @return array<string>
     */
    public function styles(): array {
        return array_reduce(
            $this->get_pages(), fn( $carry, $page ) => array_merge( $carry, $page->styles() ), [
                $this->script_key,
                $this->header_script_key,
                $this->setup_guide_key,
            ]
        );
    }

    /**
     * Register dashboard scripts.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function register_scripts() {
        // Register the admin dashboard scripts.
        $this->register_admin_dashboard_scripts();

        // Register the admin panel header scripts.
        $this->register_admin_panel_header_scripts();

        // Register the setup guide scripts.
        $this->register_setup_guide_scripts();

        // Register all other scripts.
        foreach ( $this->get_pages() as $page ) {
            $page->register();
        }
    }

    /**
     * Register the admin dashboard scripts.
     *
     * @since 4.0.0
     *
     * @return void
     */
    protected function register_admin_dashboard_scripts() {
        $admin_dashboard_file = DOKAN_DIR . '/assets/js/dokan-admin-dashboard.asset.php';
        if ( file_exists( $admin_dashboard_file ) ) {
            $dashboard_script = require $admin_dashboard_file;
            $dependencies     = $dashboard_script['dependencies'] ?? [];

            $dependencies[]   = 'dokan-react-components';
            $dependencies[]   = 'dokan-react-frontend';

            $version          = $dashboard_script['version'] ?? '';
            $data             = [ 'currency' => dokan_get_container()->get( 'scripts' )->get_localized_price() ];

            wp_register_script(
                $this->script_key,
                DOKAN_PLUGIN_ASSEST . '/js/dokan-admin-dashboard.js',
                $dependencies,
                $version,
                true
            );

            wp_register_style(
                $this->script_key,
                DOKAN_PLUGIN_ASSEST . '/css/dokan-admin-dashboard.css',
                [ 'wc-components' ],
                $version
            );

            wp_set_script_translations(
                $this->script_key,
                'dokan-lite'
            );

            wp_localize_script(
                $this->script_key,
                'dokanAdminDashboard',
                $data,
            );
        }
    }

    /**
     * Register the admin panel header scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function register_admin_panel_header_scripts() {
        $header_script_file = DOKAN_DIR . '/assets/js/dokan-admin-panel-header.asset.php';
        if ( file_exists( $header_script_file ) ) {
            $header_script = require $header_script_file;
            $dependencies  = $header_script['dependencies'] ?? [];
            $version       = $header_script['version'] ?? '';

            wp_register_script(
                $this->header_script_key,
                DOKAN_PLUGIN_ASSEST . '/js/dokan-admin-panel-header.js',
                $dependencies,
                $version,
                true
            );

            wp_register_style(
                $this->header_script_key,
                DOKAN_PLUGIN_ASSEST . '/js/dokan-admin-panel-header.css',
                [],
                $version
            );

            wp_set_script_translations(
                $this->header_script_key,
                'dokan-lite'
            );

            // Localize the settings.
            $settings    = $this->settings();
            $header_info = $settings['header_info'] ?? [];

            wp_localize_script(
                $this->header_script_key,
                'dokanAdminPanelHeaderSettings',
                [
                    'logo_url'    => DOKAN_PLUGIN_ASSEST . '/images/dokan-logo.png',
                    'header_info' => $header_info,
                ]
            );
        }
    }

    /**
     * Register the setup guide banner scripts.
     *
     * @since 4.0.0
     *
     * @return void
     */
    protected function register_setup_guide_scripts() {
        $setup_guide_file = DOKAN_DIR . '/assets/js/setup-guide-banner.asset.php';
        if ( file_exists( $setup_guide_file ) ) {
            $setup_guide_script = require $setup_guide_file;
            $dependencies       = $setup_guide_script['dependencies'] ?? [];
            $version            = $setup_guide_script['version'] ?? '';

            wp_register_script(
                $this->setup_guide_key,
                DOKAN_PLUGIN_ASSEST . '/js/setup-guide-banner.js',
                $dependencies,
                $version,
                true
            );

            wp_register_style(
                $this->setup_guide_key,
                DOKAN_PLUGIN_ASSEST . '/css/setup-guide-banner.css',
                [],
                $version
            );

            wp_set_script_translations(
                $this->setup_guide_key,
                'dokan-lite'
            );

            wp_localize_script(
                $this->setup_guide_key,
                'dokanSetupGuideBanner',
                [
                    'asset_url'                      => DOKAN_PLUGIN_ASSEST,
                    'setup_guide_url'                => admin_url( 'admin.php?page=dokan-dashboard#/setup' ),
                    'is_setup_guide_steps_completed' => get_option( 'dokan_admin_setup_guide_steps_completed', false ),
                ]
            );
        }
    }

    /**
     * Enqueue dashboard scripts.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function enqueue_scripts() {
        $screen = get_current_screen();

        if ( $screen->id !== 'toplevel_page_dokan' && $screen->id !== 'dokan_page_dokan-dashboard' ) {
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

    /**
     * Clear the Dokan submenu title.
     *
     * This method clears the title of the Dokan submenu to prevent it from displaying
     * in the admin menu. It is useful for cases where you want to hide the submenu title
     * but still keep the submenu item accessible.
     *
     * @since 4.1.0
     *
     * @return void
     */
    public function clear_dokan_submenu_title(): void {
        global $submenu;

        $legacy   = get_option( 'dokan_legacy_dashboard_page', false );
        $position = (int) $legacy;

        if ( isset( $submenu['dokan'][ $position ][0] ) ) {
            $submenu['dokan'][ $position ][0] = '';
        }

        if ( ! $legacy ) {
            $submenu['dokan'][0][2] = 'admin.php?page=dokan-dashboard';
        }
    }

    /**
     * Runs before admin notices action and hides them.
     *
     * @since 4.1.0
     *
     * @return void
     */
    public function inject_before_notices(): void {
        $screen = get_current_screen();
        if ( ! $screen || ( $screen->id !== 'dokan_page_dokan-dashboard' ) ) {
            return;
        }

        // Wrap the notices in a hidden div to prevent flickering before
        // they are moved elsewhere in the page by WordPress Core.
        echo '<div class="dokan-layout__notice-list-hide" id="dokan__notice-list">';

        // Capture all notices and hide them. WordPress Core looks for
        // `.wp-header-end` and appends notices after it if found.
        echo '<div class="wp-header-end" id="dokan-layout__notice-catcher"></div>';
    }

    /**
     * Runs after admin notices and closes div.
     *
     * @since 4.1.0
     *
     * @return void
     */
    public function inject_after_notices(): void {
        $screen = get_current_screen();
        if ( ! $screen || ( $screen->id !== 'dokan_page_dokan-dashboard' ) ) {
            return;
        }

        // Close the hidden div used to prevent notices from flickering before
        // they are inserted elsewhere in the page.
        echo '</div>';
    }

    /**
     * Handle dashboard redirect based on legacy dashboard preference.
     *
     * This method checks if the user has requested to switch the dashboard and updates
     * the option accordingly. It then redirects the user to the appropriate dashboard page.
     *
     * @since 4.1.0
     *
     * @return void
     */
    public function handle_dashboard_redirect(): void {
        // Early return if not a dashboard switch request.
        if ( ! isset( $_GET['dokan_action'] ) || 'switch_dashboard' !== sanitize_key( wp_unslash( $_GET['dokan_action'] ) ) ) {
            return;
        }

        // Early return if nonce verification fails.
        if ( ! isset( $_GET['dokan_admin_dashboard_switching_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['dokan_admin_dashboard_switching_nonce'] ) ), 'dokan_switch_admin_dashboard' ) ) {
            return;
        }

        // Get the current state and toggle it.
        $current_is_legacy = get_option( 'dokan_legacy_dashboard_page', false );
        $new_legacy_state  = apply_filters( 'dokan_is_legacy_dashboard_page', ! $current_is_legacy );

        // Update the option
        update_option( 'dokan_legacy_dashboard_page', $new_legacy_state );

        // Build redirect URL and redirect.
        $page_slug    = $new_legacy_state ? 'dokan' : 'dokan-dashboard';
        $redirect_url = add_query_arg( [ 'page' => $page_slug ], admin_url( 'admin.php' ) );

        wp_safe_redirect( $redirect_url );
        exit;
    }
}
