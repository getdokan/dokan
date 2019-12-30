<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Abstracts\DokanShortcode;

class Dashboard extends DokanShortcode {

    protected $shortcode = 'dokan-dashboard';

    /**
     * Load template files
     *
     * Based on the query vars, load the appropriate template files
     * in the frontend user dashboard.
     *
     * @param array $atts
     *
     * @return void
     */
    public function render_shortcode( $atts ) {
        global $wp;

        if ( ! function_exists( 'WC' ) ) {
            return sprintf( __( 'Please install <a href="%s"><strong>WooCommerce</strong></a> plugin first', 'dokan-lite' ), 'http://wordpress.org/plugins/woocommerce/' );
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return __( 'You have no permission to view this page', 'dokan-lite' );
        }

        ob_start();

        if ( isset( $wp->query_vars['products'] ) ) {
            if ( ! current_user_can( 'dokan_view_product_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'products/products' );
            }

            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['new-product'] ) ) {
            if ( ! current_user_can( 'dokan_add_product' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                do_action( 'dokan_render_new_product_template', $wp->query_vars );
            }

            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['orders'] ) ) {
            if ( ! current_user_can( 'dokan_view_order_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'orders/orders' );
            }

            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['withdraw'] ) ) {
            if ( ! current_user_can( 'dokan_view_withdraw_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'withdraw/withdraw' );
            }

            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['settings'] ) ) {
            dokan_get_template_part('settings/store');

            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['page'] ) ) {
            if ( ! current_user_can( 'dokan_view_overview_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'dashboard/dashboard' );
            }

            return ob_get_clean();
        }
        if ( isset( $wp->query_vars['edit-account'] ) ) {
            dokan_get_template_part( 'dashboard/edit-account' );

            return ob_get_clean();
        }

        do_action( 'dokan_load_custom_template', $wp->query_vars );

        return ob_get_clean();
    }
}
