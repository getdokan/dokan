<?php

namespace WeDevs\Dokan\Admin\Dashboard;

use WeDevs\Dokan\Admin\Notices\Helper;
use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Utilities\OrderUtil;

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
     * Admin switching script key.
     *
     * @SINCE 4.1.3
     *
     * @var string
     */
    protected string $switching_script_key = 'dokan-admin-switching';

    /**
     * Admin panel header script key.
     *
     * @since 4.1.3
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
        add_action( 'admin_notices', [ $this, 'inject_before_notices' ], -9999 );
        add_action( 'admin_notices', [ $this, 'inject_after_notices' ], PHP_INT_MAX );
        add_filter( 'admin_footer_text', [ $this, 'add_switching_container' ] );
        add_filter( 'update_footer', [ $this, 'add_update_footer' ], 99 );
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
            'nonce'       => wp_create_nonce( 'dokan_admin_dashboard' ),
            'header_info' => apply_filters( 'dokan_admin_setup_guides_header_info', $header_info ),
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
                $this->switching_script_key,
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
                $this->switching_script_key,
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

        // Register the admin switching scripts.
        $this->register_admin_switching_scripts();

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
            $dependencies     = array_merge( $dashboard_script['dependencies'] ?? [], [ 'dokan-react-components', 'dokan-react-frontend', 'jquery', 'media-upload', 'media-views' ] );
            $version          = $dashboard_script['version'] ?? '';

            $banner_width    = dokan_get_vendor_store_banner_width();
            $banner_height   = dokan_get_vendor_store_banner_height();

            $has_flex_width  = dokan_get_option( 'store_banner_flex_width', 'dokan_general', true );
            $has_flex_height = dokan_get_option( 'store_banner_flex_height', 'dokan_general', true );

            $data = apply_filters(
                'dokan_admin_dashboard_localize_scripts',
                [
                    'currency'  => dokan_get_container()->get( 'scripts' )->get_localized_price(),
                    'states'    => WC()->countries->get_allowed_country_states(),
                    'countries' => WC()->countries->get_allowed_countries(),
                    'nonce'     => wp_create_nonce( 'dokan_admin' ),
                    'store_banner_dimension'                   => [
                        'width'       => $banner_width,
                        'height'      => $banner_height,
                        'flex-width'  => $has_flex_width,
                        'flex-height' => $has_flex_height,
                    ],
                    'urls'                              => [
                        'adminRoot'         => admin_url(),
                        'siteUrl'           => home_url( '/' ),
                        'storePrefix'       => dokan_get_option( 'custom_store_url', 'dokan_general', 'store' ),
                        'assetsUrl'         => DOKAN_PLUGIN_ASSEST,
                        'buynowpro'         => dokan_pro_buynow_url(),
                        'upgradeToPro'      => 'https://dokan.co/wordpress/upgrade-to-pro/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite',
                        'dummy_data'        => DOKAN_PLUGIN_ASSEST . '/dummy-data/dokan_dummy_data.csv',
                        'adminOrderListUrl' => OrderUtil::get_admin_order_list_url(),
                        'adminOrderEditUrl' => OrderUtil::get_admin_order_edit_url(),
                    ],
                ]
            );

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
                [ 'dokan-react-components', 'wc-components' ],
                $version
            );

            wp_set_script_translations(
                $this->script_key,
                'dokan-lite'
            );

            wp_add_inline_script(
                $this->script_key,
                'window.dokanAdminDashboard = ' . wp_json_encode( $data ),
                'before'
            );
        }
    }

    /**
     * Register the admin panel header scripts.
     *
     * @since 4.1.3
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
     * Register the admin switching scripts.
     *
     * @since 4.1.3
     *
     * @return void
     */
    protected function register_admin_switching_scripts() {
        $admin_switching_file = DOKAN_DIR . '/assets/js/dokan-admin-switching.asset.php';
        if ( file_exists( $admin_switching_file ) ) {
            $switching_script = require $admin_switching_file;
            $dependencies     = $switching_script['dependencies'] ?? [];

            $dependencies[]   = 'dokan-react-components';
            $dependencies[]   = 'dokan-react-frontend';
            $version          = $switching_script['version'] ?? '';

            wp_register_script(
                $this->switching_script_key,
                DOKAN_PLUGIN_ASSEST . '/js/dokan-admin-switching.js',
                $dependencies,
                $version,
                true
            );

            wp_register_style(
                $this->switching_script_key,
                DOKAN_PLUGIN_ASSEST . '/js/dokan-admin-switching.css',
                [],
                $version
            );

            wp_set_script_translations(
                $this->switching_script_key,
                'dokan-lite'
            );

            wp_add_inline_script(
                $this->switching_script_key,
                'const dokanAdminSwitching = ' . wp_json_encode(
                    [
                        'nonce'     => wp_create_nonce( 'dokan_switch_admin_panel' ),
                        'admin_url' => admin_url(),
                    ]
                ),
                'before'
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

        // Enqueue media scripts
        wp_enqueue_media();

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
     * Add container for admin switching functionality.
     *
     * @since 4.1.3
     *
     * @param string $text Footer text
     *
     * @return string Modified footer text with admin switching container
     */
    public function add_switching_container( $text ) {

        $current_screen = get_current_screen();
		$is_dokan_screen = ( $current_screen && false !== strpos( $current_screen->id, 'dokan' ) );
		if ( ! $is_dokan_screen ) {
            return $text;
        }

        $dom_element = '<span id="dokan-admin-switching" class="dokan-layout dokan-admin-page-body"></span><br/>';

        return $dom_element;
    }

    /**
     * Add empty update footer for Dokan screens.
     *
     * @since 4.1.3
     *
     * @param string $content Footer content
     *
     * @return string Empty string for Dokan screens, original content otherwise
     */
    public function add_update_footer( $content ) {
        $current_screen = get_current_screen();
		$is_dokan_screen = ( $current_screen && false !== strpos( $current_screen->id, 'dokan' ) );

		if ( ! $is_dokan_screen ) {
            return $content;
        }

        return '';
    }
}
