<?php

namespace WeDevs\Dokan\Admin;

use WeDevs\Dokan\Admin\Notices\Helper;

class Menu {

    /**
     * Class constructor
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function __construct() {
        add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );
    }

    /**
     * Add Dokan admin menu
     *
     * @since 1.0.0
     * @since 3.0.0 Moved to Menu class
     *
     * @return void
     */
    public function add_admin_menu() {
        global $submenu;

        $menu_position = dokan_admin_menu_position();
        $capability    = dokana_admin_menu_capability();
        $withdraw      = dokan_get_withdraw_count();
        $withdraw_text = __( 'Withdraw', 'dokan-lite' );
        $slug          = 'dokan';

        // phpcs:disable
        if ( $withdraw['pending'] ) {
            // translators: %s: withdraw count
            $withdraw_text = sprintf( __( 'Withdraw %s', 'dokan-lite' ), '<span class="awaiting-mod count-1"><span class="pending-count">' . $withdraw['pending'] . '</span></span>' );
        }

        $dashboard = add_menu_page( __( 'Dokan', 'dokan-lite' ), __( 'Dokan', 'dokan-lite' ), $capability, $slug, [ $this, 'dashboard' ], 'data:image/svg+xml;base64,' . base64_encode( '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="62" fill="#fff"><path opacity=".5" d="M36.265 29.552c-.043 10.6-4.597 21.543-14.007 26.521C15.64 59.592 0 62.295 0 50.837V8.181C0 1.83 5.371-.273 10.742.028c7.992.429 15.64 4.163 20.281 11.029 2.965 4.377 4.597 9.656 5.113 14.977.043 1.201.129 2.36.129 3.519z"/><path d="M51.088 25.819c-.902-8.754-6.273-16.093-13.707-20.513-4.287-2.569-9.511-3.458-12.924.218-1.104 1.189-1.818 2.742-2.593 4.168L1.332 47.404c-1.89 3.478-1.46 6.352.258 8.712 2.578 3.519 7.691 5.107 11.859 5.536 3.867.429 7.777 0 11.515-.858 11.3-2.575 21.312-10.256 24.706-21.414 1.332-4.377 1.891-8.969 1.418-13.561z"/></svg>' ), $menu_position );

        if ( current_user_can( $capability ) ) {
            $submenu[ $slug ][] = [ __( 'Dashboard', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/' ];
            $submenu[ $slug ][] = [ __( 'Withdraw', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/withdraw?status=pending' ];
            $submenu[ $slug ][] = [ __( 'Reverse Withdrawal', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/reverse-withdrawal' ];

            // if dokan pro not installed or dokan pro is greater than 2.9.14 register the `vendor` sub-menu
            if ( ! dokan()->is_pro_exists() || version_compare( DOKAN_PRO_PLUGIN_VERSION, '2.9.14', '>' ) ) {
                $submenu[ $slug ][] = [ __( 'Vendors', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/vendors' ];
            }

            if ( ! dokan()->is_pro_exists() ) {
                $submenu[ $slug ][] = [ __( 'Modules', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/pro-modules' ];
            }

            if ( ! dokan()->is_pro_exists() ) {
                $submenu[ $slug ][] = [ __( 'PRO Features', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/premium' ];
            }
        }

        do_action( 'dokan_admin_menu', $capability, $menu_position );

        if ( current_user_can( $capability ) ) {
            $submenu[ $slug ][] = [ __( '<span style="color:#f18500">Help</span>', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/help' ];
            $submenu[ $slug ][] = [ __( 'Settings', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/settings' ];
        }

        // phpcs:enable

        add_action( $dashboard, [ $this, 'dashboard_script' ] );
    }

    /**
     * Dashboard scripts and styles
     *
     * @since 1.0
     * @since 3.0.0 Moved to Menu class
     *
     * @return void
     */
    public function dashboard_script() {
        wp_enqueue_style( 'dokan-admin-css' );
        wp_enqueue_style( 'jquery-ui' );

        wp_enqueue_script( 'jquery-ui-datepicker' );
        wp_enqueue_script( 'wp-color-picker' );
        wp_enqueue_script( 'dokan-flot' );
        wp_enqueue_script( 'dokan-chart' );

        do_action( 'dokan_enqueue_admin_dashboard_script' );
    }

    /**
     * Load Dashboard Template
     *
     * @since 1.0
     * @since 3.0.0 Moved to Menu class
     *
     * @return void
     */
    public function dashboard() {
        $has_new_version = Helper::dokan_has_new_version();

        include DOKAN_DIR . '/templates/admin-header.php';
        echo '<div class="wrap"><div id="dokan-vue-admin"></div></div>';
    }
}
