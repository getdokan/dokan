<?php

namespace WeDevs\Dokan\Admin;

use WeDevs\Dokan\Admin\Dashboard\Pages\Extensions;
use WeDevs\Dokan\Admin\Dashboard\Pages\ProFeatures;
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

        $capability = dokana_admin_menu_capability();
        if ( ! current_user_can( $capability ) ) {
            return;
        }

        $menu_position = dokan_admin_menu_position();
        $withdraw      = dokan_get_withdraw_count();
        $withdraw_text = __( 'Withdraw', 'dokan-lite' );
        $slug          = 'dokan';

        // phpcs:disable
        if ( $withdraw['pending'] ) {
            // translators: %s: withdraw count
            $withdraw_text = sprintf( __( 'Withdraw %s', 'dokan-lite' ), '<span class="awaiting-mod count-1"><span class="pending-count">' . $withdraw['pending'] . '</span></span>' );
        }
        $menu_icon  = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxNSAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0xMC41NDU4IDguNjA0NjVDMTAuNTMzMyAxMS42OTA5IDkuMjA4ODMgMTQuODc3MiA2LjQ3MjQyIDE2LjMyNjZDNC41NDgxOSAxNy4zNTEyIDAgMTguMTM4NCAwIDE0LjgwMjJDMCAxNC44MDIyIDAgMi4zOTQ2MiAwIDIuMzgyMTNDMCAwLjUzMjg2NSAxLjU2MTg4IC0wLjA3OTM5MiAzLjEyMzc2IDAuMDA4MDczMkM1LjQ0NzgzIDAuMTMzMDI0IDcuNjcxOTUgMS4yMjAwOSA5LjAyMTQxIDMuMjE5M0M5Ljg4MzU3IDQuNDkzNzkgMTAuMzU4NCA2LjAzMDY4IDEwLjUwODMgNy41ODAwNkMxMC41MjA4IDcuOTI5OTIgMTAuNTQ1OCA4LjI2NzI5IDEwLjU0NTggOC42MDQ2NVoiIGZpbGw9IiM5RUEzQTgiIGZpbGwtb3BhY2l0eT0iMC41Ii8+CiAgICA8cGF0aCBkPSJNMTQuODU2MiA3LjUxNzY2QzE0LjU5MzggNC45Njg2NyAxMy4wMzIgMi44MzIwMiAxMC44NzAzIDEuNTQ1MDNDOS40MzMzOSAwLjY4Mjg3NSA3LjYzNDExIDAuNDcwNDYxIDYuNjk2OTggMi4xOTQ3OEM2LjY5Njk4IDIuMjA3MjcgMC4zODY5OSAxMy44MDI3IDAuMzg2OTkgMTMuODAyN0MtMC4xNjI3OTEgMTQuODE0OCAtMC4wMzc4NDAyIDE1LjY1MTkgMC40NjE5NjEgMTYuMzM5MkMxLjIxMTY2IDE3LjM2MzcgMi42OTg1NyAxNy44MjYxIDMuOTEwNTkgMTcuOTUxQzUuMDM1MTQgMTguMDc2IDYuMTcyMTkgMTcuOTUxIDcuMjU5MjYgMTcuNzAxMUMxMC41NDU1IDE2Ljk1MTQgMTMuNDU2OCAxNC43MTQ4IDE0LjQ0MzkgMTEuNDY2MUMxNC44MzEyIDEwLjE5MTYgMTQuOTkzNyA4Ljg1NDYzIDE0Ljg1NjIgNy41MTc2NloiIGZpbGw9IiM5RUEzQTgiLz4KICAgIDxwYXRoIGQ9Ik02LjQ3MjM3IDE2LjMzOTNDOS4yMDg3OCAxNC44Nzc0IDEwLjUzMzMgMTEuNjkxMiAxMC41NDU3IDguNjE3NDFDMTAuNTQ1NyA4LjI4MDA1IDEwLjUzMzMgNy45NDI2OCAxMC40OTU4IDcuNjA1MzJDMTAuMzU4MyA2LjA1NTkzIDkuODcxMDIgNC41MTkwNCA5LjAwODg2IDMuMjQ0NTVDOC41MzQwNSAyLjUzMjMzIDcuOTQ2NzggMS45NDUwNyA3LjI4NDU0IDEuNDU3NzZDNy4wNzIxMyAxLjY0NTE5IDYuODcyMjEgMS44OTUwOSA2LjcwOTc3IDIuMjA3NDdDNi43MDk3NyAyLjIxOTk2IDAuMzk5Nzg0IDEzLjgxNTMgMC4zOTk3ODQgMTMuODE1M0MtMC4wMTI1NTI1IDE0LjU2NSAtMC4wMzc1NDQ4IDE1LjIyNzMgMC4xNzQ4NzEgMTUuODAyMUMwLjE3NDg3MSAxNS44MTQ2IDAuMTg3MzY2IDE1LjgyNyAwLjE4NzM2NiAxNS44Mzk1QzAuMTk5ODYyIDE1Ljg2NDUgMC4yMTIzNTUgMTUuOTAyIDAuMjI0ODUgMTUuOTI3QzAuMjM3MzQ1IDE1Ljk1MiAwLjIzNzM0NyAxNS45NjQ1IDAuMjQ5ODQyIDE1Ljk4OTVDMC4yNDk4NDIgMTYuMDAyIDAuMjYyMzM3IDE2LjAxNDUgMC4yNjIzMzcgMTYuMDE0NUMxLjI0OTQ0IDE3LjkxMzcgNC44MjMwMiAxNy4yMTQgNi40NzIzNyAxNi4zMzkzWiIgZmlsbD0iIzlFQTNBOCIvPgogICAgPC9zdmc+';

        $dashboard = add_menu_page(
            __( 'Dokan', 'dokan-lite' ),
            __( 'Dokan', 'dokan-lite' ),
            $capability,
            $slug,
            [ $this, 'dashboard' ],
            $menu_icon,
            $menu_position
        );

        if ( current_user_can( $capability ) ) {
            $submenu[ $slug ][] = [ __( 'Dashboard', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/' ];
            $submenu[ $slug ][] = [ __( 'Withdraw', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/withdraw?status=pending' ];
            $submenu[ $slug ][] = [ __( 'Reverse Withdrawal', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/reverse-withdrawal' ];

            // if dokan pro not installed or dokan pro is greater than 2.9.14 register the `vendor` sub-menu
            if ( ! dokan()->is_pro_exists() || version_compare( DOKAN_PRO_PLUGIN_VERSION, '2.9.14', '>' ) ) {
                $submenu[ $slug ][] = [ __( 'Vendors', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/vendors' ];
            }
        }

        do_action( 'dokan_admin_menu', $capability, $menu_position );

        if ( current_user_can( $capability ) ) {
            $submenu[ $slug ][] = [ esc_html__( 'Help', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/help' ];

            /**
             * Fires after the Dokan "Help" submenu item is added, before "Settings".
             * Hook here to insert items between Help and Settings.
             *
             * @since 5.0.0
             *
             * @param string $capability    Capability required to view the menu.
             * @param int    $menu_position Dokan top-level menu position.
             */
            do_action( 'dokan_admin_menu_after_help', $capability, $menu_position );

            // ProFeatures and Extensions are dashboard Page services that opt out of
            // Dashboard::register_menu()'s auto-append (via 'hidden' => true) so we can
            // place them precisely under Help and Settings here.
            $this->append_dashboard_page_submenu( ProFeatures::class, $slug, $capability, $menu_position );

            $submenu[ $slug ][] = [ __( 'Settings', 'dokan-lite' ), $capability, 'admin.php?page=' . $slug . '#/settings' ];

            /**
             * Fires after the Dokan "Settings" submenu item is added.
             * Hook here to insert items between Settings and Chat with us.
             *
             * @since 5.0.0
             *
             * @param string $capability    Capability required to view the menu.
             * @param int    $menu_position Dokan top-level menu position.
             */
            do_action( 'dokan_admin_menu_after_settings', $capability, $menu_position );

            $this->append_dashboard_page_submenu( Extensions::class, $slug, $capability, $menu_position );
        }

        // Add a chat with us link if Dokan Pro is not installed.
        if ( ! dokan()->is_pro_exists() ) {
            $chat_svg_icon = '<svg xmlns="http://www.w3.org/2000/svg" class="dokan-chat-with-us-icon" viewBox="0 0 24 24">
                <path d="M15 3h6v6"/>
                <path d="M10 14 21 3"/>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            </svg>';

            $submenu[ $slug ][] = [
                esc_html__( 'Chat with us', 'dokan-lite' ) . $chat_svg_icon,
                $capability,
                'https://dokan.co/wordpress/?utm_campaign=Chat-With-Us&utm_medium=Dokan-Lite&utm_source=Chat_Button&chat=open'
            ];
        }

        // phpcs:enable

        add_action( $dashboard, [ $this, 'dashboard_script' ] );
    }

    /**
     * Append a dashboard Page service's submenu entry under the Dokan top-level menu.
     *
     * Used for pages that opt out of {@see \WeDevs\Dokan\Admin\Dashboard\Dashboard::register_menu()}
     * via 'hidden' => true so their position relative to the static Help/Settings entries
     * can be controlled here.
     *
     * @since 5.0.0
     *
     * @param string $page_class    Fully-qualified Pageable service class name.
     * @param string $parent_slug   Parent menu slug (the Dokan top-level menu).
     * @param string $capability    Capability required to view the menu.
     * @param int    $menu_position Dokan top-level menu position.
     *
     * @return void
     */
    protected function append_dashboard_page_submenu( string $page_class, string $parent_slug, string $capability, int $menu_position ): void {
        global $submenu;

        $page = dokan_get_container()->get( $page_class );
        $args = $page->menu( $capability, (string) $menu_position );

        if ( empty( $args ) ) {
            return;
        }

        $route = trim( $args['route'] ?? $page->get_id(), ' /' );

        // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
        $submenu[ $parent_slug ][] = [
            $args['menu_title'],
            $capability,
            'admin.php?page=dokan-dashboard#/' . $route,
        ];
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
        wp_enqueue_script( 'dokan-admin-panel-header' );

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

        // Render the admin dashboard template.
        echo '<div id="dokan-admin-panel-header" class="dokan-layout"></div>';
        echo '<div class="wrap"><div id="dokan-vue-admin"></div></div>';
    }
}
