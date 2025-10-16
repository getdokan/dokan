<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Abstracts\DokanShortcode;

class Dashboard extends DokanShortcode {

    protected $shortcode = 'dokan-dashboard';

    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct();

        add_filter( 'template_include', [ $this, 'load_fullwidth_template' ], 99 );
    }

    /**
     * Load custom fullwidth template
     *
     * This method intercepts the template_include filter and returns
     * a custom blank template when fullwidth mode is activated.
     * The custom template preserves wp_head() and wp_footer() hooks
     * to ensure all enqueued scripts and styles are loaded properly.
     *
     * @param string $template Path to the template
     *
     * @return string Modified template path
     */
    public function load_fullwidth_template( $template ) {
        // Check if we should load the fullwidth template
        if ( ! dokan_is_seller_dashboard() ) {
            return $template;
        }

        // Path to custom template
        $custom_template = DOKAN_DIR . '/templates/dashboard/full-dashboard.php';

        // Check if custom template exists
        if ( file_exists( $custom_template ) ) {
            return $custom_template;
        }

        return $template;
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
