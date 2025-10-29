<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Abstracts\DokanShortcode;
use WeDevs\Dokan\Utilities\OrderUtil;
use WeDevs\Dokan\Utilities\VendorUtil;

class Dashboard extends DokanShortcode {

    protected $shortcode = 'dokan-dashboard';

    /**
     * Script/style handle key for vendor dashboard React app.
     *
     * @var string
     */
    protected $script_key = 'dokan-vendor-dashboard';

    /**
     * Dashboard constructor.
     *
     * @return void
     */
    public function __construct() {
        parent::__construct();

        if ( apply_filters( 'dokan_vendor_dashboard_enable_full_width_page', true ) ) {
            add_action( 'template_redirect', [ $this, 'rewrite_vendor_dashboard_template' ], 1 );
        }

        // Enqueue React vendor dashboard assets when needed.
        add_action( 'init', [ $this, 'register_vendor_dashboard_assets' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_vendor_dashboard_assets' ] );
    }

    /**
     * Rewrite vendor dashboard template
     *
     * This method intercepts the template_redirect action and loads
     * a custom full-width template for the vendor dashboard.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function rewrite_vendor_dashboard_template() {
        // Check if the user is logged in and is on the vendor dashboard.
        if ( is_user_logged_in() && dokan_is_seller_dashboard() ) {
            $dashboard_template = DOKAN_DIR . '/templates/dashboard/block-dashboard.php';

            // Check if the custom template exists.
            if ( file_exists( $dashboard_template ) ) {
                // Load dokan full width vendor dashboard template.
                include_once $dashboard_template;
                wp_print_media_templates();
                exit;
            }
        }
    }

    /**
     * Register and enqueue React vendor dashboard assets when viewing the seller dashboard.
     *
     * @since DOKAN_SINCE
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
            $vendor       = dokan()->vendor->get( $user_id );
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
                    'url'   => dokan_get_page_url( 'myaccount', 'woocommerce' ),
                ],
                [
                    'label' => esc_html__( 'Log out', 'dokan-lite' ),
                    'icon'  => 'LogOut',
                    'url'   => esc_url_raw( wp_logout_url( home_url() ) ),
                ],
            ];

            if ( $is_admin ) {
                // Only administrators: show Back to WP Panel.
                array_splice( $header_nav, 1, 0, [
                    [
                        'label' => esc_html__( 'Back to WP Panel', 'dokan-lite' ),
                        'icon'  => 'WPLogo',
                        'url'   => admin_url(),
                        'isSvg' => true,
                    ],
                ] );
            } elseif ( 'on' !== $no_access ) {
                // Non-admins with admin panel access: show Access Admin Panel.
                array_splice( $header_nav, 1, 0, [
                    [
                        'label' => esc_html__( 'Access Admin Panel', 'dokan-lite' ),
                        'icon'  => 'LockOpen',
                        'url'   => admin_url(),
                    ],
                ] );
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
                                'avatar' => VendorUtil::get_vendor_default_avatar_url(),
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
     * @since DOKAN_SINCE
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

    /**
     * Load template files
     *
     * Based on the query vars, load the appropriate template files
     * in the frontend user dashboard.
     *
     * @param array $atts
     *
     * @return string
     */
    public function render_shortcode( $atts ) {
        global $wp;

        if ( ! function_exists( 'WC' ) ) {
            // translators: 1) wooCommerce installation url
            return sprintf( __( 'Please install <a href="%s"><strong>WooCommerce</strong></a> plugin first', 'dokan-lite' ), 'http://wordpress.org/plugins/woocommerce/' );
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return __( 'You have no permission to view this page', 'dokan-lite' );
        }

        ob_start();

        /**
         * Filter query var before rendering dokan vendor shortcode
         */
        $query_vars = apply_filters( 'dokan_dashboard_shortcode_query_vars', $wp->query_vars );

        if ( is_wp_error( $query_vars ) ) {
            dokan_get_template_part(
                'global/dokan-error', '', [
                    'deleted' => false,
                    'message' => $query_vars->get_error_message(),
                ]
            );
            return ob_get_clean();
        }

        if ( isset( $query_vars['products'] ) ) {
            if ( ! current_user_can( 'dokan_view_product_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'products/products' );
            }

            return ob_get_clean();
        }

        if ( isset( $query_vars['new-product'] ) ) {
            if ( ! current_user_can( 'dokan_add_product' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                do_action( 'dokan_render_new_product_template', $wp->query_vars );
            }

            return ob_get_clean();
        }

        if ( isset( $query_vars['orders'] ) ) {
            if ( ! current_user_can( 'dokan_view_order_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'orders/orders' );
            }

            return ob_get_clean();
        }

        if ( isset( $query_vars['withdraw'] ) ) {
            if ( ! current_user_can( 'dokan_view_withdraw_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'withdraw/withdraw' );
            }

            return ob_get_clean();
        }

        if ( isset( $query_vars['reverse-withdrawal'] ) ) {
            if ( ! current_user_can( 'dokan_view_withdraw_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'reverse-withdrawal/reverse-withdrawal' );
            }

            return ob_get_clean();
        }

        if ( isset( $query_vars['settings'] ) ) {
            dokan_get_template_part( 'settings/store' );

            return ob_get_clean();
        }

        if ( isset( $query_vars['page'] ) ) {
            if ( ! current_user_can( 'dokan_view_overview_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'dashboard/dashboard' );
            }

            return ob_get_clean();
        }
        if ( isset( $query_vars['edit-account'] ) ) {
            dokan_get_template_part( 'dashboard/edit-account' );

            return ob_get_clean();
        }

        do_action( 'dokan_load_custom_template', $query_vars );

        return ob_get_clean();
    }
}
