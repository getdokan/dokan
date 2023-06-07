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
            $withdraw_text = sprintf( __( 'Withdraw %s', 'dokan-lite' ), '<span class="awaiting-mod count-1"><span class="pending-count">' . $withdraw['pending'] . '</span></span>' );
        }

        $dashboard = add_menu_page( __( 'Dokan', 'dokan-lite' ), __( 'Dokan', 'dokan-lite' ), $capability, $slug, [ $this, 'dashboard' ], 'data:image/svg+xml;base64,' . base64_encode( '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><g fill="#9EA3A8" fill-rule="nonzero"><path d="M2.565 1.909s10.352-.665 10.352 7.231-2.735 9.481-5.134 9.994c0 0 9.974 2.125 9.974-8.995S5.035.624 2.565 1.91z"/><path d="M10.982 15.353s-.999 3.07-4.018 3.461c-3.02.39-3.582-1.062-5.688-.962 0 0-.171-1.441 1.529-1.644 1.7-.202 4.885.193 7.004-.991 0 0 1.253-.582 1.499-.862l-.326.998z"/><path d="M2.407 2.465V15.74a3.29 3.29 0 01.32-.056 18.803 18.803 0 011.794-.083c.624 0 1.306-.022 1.987-.078v-4.465c0-1.485-.107-3.001 0-4.484.116-.895.782-1.66 1.73-1.988.759-.25 1.602-.2 2.316.135-3.414-2.24-7.25-2.284-8.147-2.255z"/></g></svg>' ), $menu_position );

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
