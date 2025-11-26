<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Utilities\OrderUtil;
use WeDevs\Dokan\Utilities\VendorUtil;

/**
 * Fullwidth vendor layout
 *
 * @since 4.2.0
 */
class FullWidthVendorLayout implements Hookable {

    /**
     * Script/style handle key for vendor dashboard React app.
     *
     * @var string
     */
    protected $script_key = 'dokan-vendor-dashboard';

    /**
     * Register hooks.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'dokan_setup_wizard_styles', [ $this, 'update_layout_style' ] );
        // Register vendor dashboard assets if the vendor layout is not legacy.
        $vendor_layout = dokan_get_option( 'vendor_layout_style', 'dokan_appearance', 'legacy' );
        if ( 'latest' === $vendor_layout ) {
            add_action( 'init', [ $this, 'register_vendor_dashboard_assets' ], 99 );
            add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_vendor_dashboard_assets' ] );
            add_filter( 'template_include', [ $this, 'rewrite_vendor_dashboard_template' ] );
        }
    }

    /**
     * Update vendor layout style option.
     *
     * @since 4.2.0
     *
     * @return void
     */
    public function update_layout_style(): void {
        if ( ! is_admin() ) {
            return;
        }

        $appearance                        = get_option( 'dokan_appearance', [] );
        $appearance['vendor_layout_style'] = 'latest';

        update_option( 'dokan_appearance', $appearance );
    }

    /**
     * Load a custom fullwidth template.
     *
     * This method intercepts the template_include filter and returns
     * a custom blank template when fullwidth mode is activated.
     * The custom template preserves wp_head() and wp_footer() hooks
     * to ensure all enqueued scripts and styles are loaded properly.
     *
     * @since 4.2.0
     *
     * @param string $template Path to the template
     *
     * @return string Modified template path
     */
    public function rewrite_vendor_dashboard_template( $template ) {
        // Check if we should load the fullwidth template.
        if ( ! dokan_is_seller_dashboard() ) {
            return $template;
        }

        // Path to custom template.
        $custom_template = DOKAN_DIR . '/templates/dashboard/fullwidth-dashboard.php';

        // Check if a custom template exists.
        if ( file_exists( $custom_template ) ) {
            return $custom_template;
        }

        return $template;
    }

    /**
     * Register and enqueue React vendor dashboard assets when viewing the seller dashboard.
     *
     * @since 4.2.0
     *
     * @return void
     */
    public function register_vendor_dashboard_assets() {
        $admin_dashboard_file = DOKAN_DIR . '/assets/js/vendor-dashboard/layout/index.asset.php';
        if ( file_exists( $admin_dashboard_file ) ) {
            $dashboard_script = require $admin_dashboard_file;
            $dependencies     = $dashboard_script['dependencies'] ?? [];
            $version          = $dashboard_script['version'] ?? '';

            wp_register_script(
                $this->script_key,
                DOKAN_PLUGIN_ASSEST . '/js/vendor-dashboard/layout/index.js',
                $dependencies,
                $version,
                true
            );

            wp_register_style(
                $this->script_key,
                DOKAN_PLUGIN_ASSEST . '/js/vendor-dashboard/layout/index.css',
                [ 'dokan-tailwind' ],
                $version
            );

            wp_set_script_translations(
                $this->script_key,
                'dokan-lite'
            );

            $user_id      = get_current_user_id();
            $seller_id    = dokan_get_current_user_id();
            $vendor       = dokan()->vendor->get( $seller_id );
            $is_admin     = current_user_can( 'manage_options' );
            $user_name    = wp_get_current_user()->display_name ?? '';
            $admin_access = dokan_get_option( 'admin_access', 'dokan_general', 'on' );
            $no_access    = OrderUtil::is_hpos_enabled() ? 'on' : $admin_access;

            // Frontend header nav items.
            // Build base with My Account and Log out; insert conditional admin links next.
            $header_nav = [
                [
                    'label' => esc_html__( 'My Account', 'dokan-lite' ),
                    'icon'  => 'UserRound',
                    'url'   => dokan_get_navigation_url( 'edit-account' ),
                ],
                [
                    'label' => esc_html__( 'Log out', 'dokan-lite' ),
                    'icon'  => 'LogOut',
                    'url'   => esc_url_raw( wp_logout_url( home_url() ) ),
                ],
            ];

            if ( $is_admin ) {
                // Only administrators: show Back to WP Panel.
                array_splice(
                    $header_nav,
                    1,
                    0,
                    [
                        [
                            'label' => esc_html__( 'Back to WP Panel', 'dokan-lite' ),
                            'icon'  => 'WPLogo',
                            'url'   => admin_url(),
                            'isSvg' => true,
                        ],
                    ]
                );
            } elseif ( 'on' !== $no_access ) {
                // Non-admins with admin panel access: show Access Admin Panel.
                array_splice(
                    $header_nav,
                    1,
                    0,
                    [
                        [
                            'label' => esc_html__( 'Access Admin Panel', 'dokan-lite' ),
                            'icon'  => 'LockOpen',
                            'url'   => admin_url(),
                        ],
                    ]
                );
            }

            wp_add_inline_script(
                $this->script_key,
                'var vendorDashboardLayoutConfig = ' . wp_json_encode(
                    apply_filters(
                        'dokan_vendor_dashboard_layout_config',
                        [
                            'siteInfo'   => [
                                'siteTitle' => get_bloginfo( 'name' ),
                                'siteIcon'  => get_site_icon_url(),
                            ],
                            'vendor'     => [
                                'name'   => $vendor ? $vendor->get_shop_name() : $user_name,
                                'avatar' => $vendor->get_avatar() ?? VendorUtil::get_vendor_default_avatar_url(),
                            ],
                            'editUrl'    => dokan_get_navigation_url( 'edit-account' ),
                            'user'       => [
                                'name'   => $user_name,
                                'avatar' => get_avatar_url( $user_id ),
                            ],
                            'sidebarNav' => dokan_get_dashboard_nav(),
                            'headerNav'  => $header_nav,
                        ],
                        $vendor
                    )
                ),
                'before'
            );
        }
    }

    /**
     * Enqueue React vendor dashboard assets when viewing the seller dashboard.
     *
     * @since 4.2.0
     *
     * @return void
     */
    public function enqueue_vendor_dashboard_assets() {
        if ( ! is_user_logged_in() || ! dokan_is_seller_dashboard() ) {
            return;
        }

        wp_enqueue_script( $this->script_key );
        wp_enqueue_style( $this->script_key );
    }
}
