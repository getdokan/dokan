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

        $dashboard = add_menu_page( __( 'Dokan', 'dokan-lite' ), __( 'Dokan', 'dokan-lite' ), $capability, $slug, [ $this, 'dashboard' ], 'data:image/svg+xml;base64,' . base64_encode( '<svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.5458 8.60465C10.5333 11.6909 9.20883 14.8772 6.47242 16.3266C4.54819 17.3512 0 18.1384 0 14.8022C0 14.8022 0 2.39462 0 2.38213C0 0.532865 1.56188 -0.079392 3.12376 0.0080732C5.44783 0.133024 7.67195 1.22009 9.02141 3.2193C9.88357 4.49379 10.3584 6.03068 10.5083 7.58006C10.5208 7.92992 10.5458 8.26729 10.5458 8.60465Z" fill="#9EA3A8" fill-opacity="0.5"/>
<path d="M14.8562 7.51766C14.5938 4.96867 13.032 2.83202 10.8703 1.54503C9.43339 0.682875 7.63411 0.470461 6.69698 2.19478C6.69698 2.20727 0.38699 13.8027 0.38699 13.8027C-0.162791 14.8148 -0.0378402 15.6519 0.461961 16.3392C1.21166 17.3637 2.69857 17.8261 3.91059 17.951C5.03514 18.076 6.17219 17.951 7.25926 17.7011C10.5455 16.9514 13.4568 14.7148 14.4439 11.4661C14.8312 10.1916 14.9937 8.85463 14.8562 7.51766Z" fill="#9EA3A8"/>
<path d="M6.47237 16.3393C9.20878 14.8774 10.5333 11.6912 10.5457 8.61741C10.5457 8.28005 10.5333 7.94268 10.4958 7.60532C10.3583 6.05593 9.87102 4.51904 9.00886 3.24455C8.53405 2.53233 7.94678 1.94507 7.28454 1.45776C7.07213 1.64519 6.87221 1.89509 6.70977 2.20747C6.70977 2.21996 0.399784 13.8153 0.399784 13.8153C-0.0125525 14.565 -0.0375448 15.2273 0.174871 15.8021C0.174871 15.8146 0.187366 15.827 0.187366 15.8395C0.199862 15.8645 0.212355 15.902 0.22485 15.927C0.237345 15.952 0.237347 15.9645 0.249842 15.9895C0.249842 16.002 0.262337 16.0145 0.262337 16.0145C1.24944 17.9137 4.82302 17.214 6.47237 16.3393Z" fill="#9EA3A8"/>
</svg>' ), $menu_position );

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
