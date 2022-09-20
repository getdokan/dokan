<?php

namespace WeDevs\Dokan\Dashboard\Templates;

class Main {

    public function __construct() {
        add_action( 'dokan_dashboard_content_before', [ self::class, 'dashboard_side_navigation' ] );
    }

    /**
     * Dashboard Side Navigations
     *
     * @since 2.4
     *
     * @return void
     */
    public static function dashboard_side_navigation() {
        global $wp;

        $request = $wp->request;
        $active  = explode( '/', $request );

        unset( $active[0] );

        if ( $active ) {
            $active_menu = implode( '/', $active );

            if ( $active_menu === 'new-product' ) {
                $active_menu = 'products';
            }

            if ( get_query_var( 'edit' ) && is_singular( 'product' ) ) {
                $active_menu = 'products';
            }
        } else {
            $active_menu = 'dashboard';
        }

        dokan_get_template_part( 'global/dashboard-nav', '', [ 'active_menu' => apply_filters( 'dokan_dashboard_nav_active', $active_menu, $request, $active ) ] );
    }
}
