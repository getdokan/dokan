<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Abstracts\DokanShortcode;

class Dashboard extends DokanShortcode {

    protected $shortcode = 'dokan-dashboard';

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
