<?php
namespace WeDevs\Dokan\Dashboard\Templates;

defined( 'ABSPATH' ) || exit;

class Main {

    public function __construct() {
        add_action( 'dokan_dashboard_content_before', [ self::class, 'dashboard_side_navigation' ] );
        add_filter( 'dokan_vendor_dashboard_menu_title', [ $this, 'add_notification_count' ], 10, 2 );
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

    /**
     * Adds notification count to menu and submenu of vendor dashboard
     *
     * @since 3.10.3
     *
     * @param string $menu_title Menu title
     * @param array $menu_details Menu details array
     *
     * @return string
     */
    public function add_notification_count( string $menu_title, array $menu_details ): string {
        if ( ! empty( $menu_details['counts'] ) ) {
            $notification_counts = (int) $menu_details['counts'];
            /**
             * Notification count filter
             *
             * @since 3.10.3
             *
             * @param int $notification_counts Number of notifications for menu & submenu
             * @param array $menu_details Details for menu and submenu
             */
            $notification_counts = apply_filters(
                'dokan_vendor_dashboard_menu_notification_count',
                $notification_counts, $menu_details
            );
            $menu_title = sprintf(
            // translators: 1) Title 2) Notification Count
                __( '%1$s (%2$s)', 'dokan-lite' ),
                $menu_title,
                number_format_i18n( $notification_counts )
            );
        }

        return $menu_title;
    }
}
