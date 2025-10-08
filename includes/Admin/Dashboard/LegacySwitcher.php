<?php

namespace WeDevs\Dokan\Admin\Dashboard;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * LegacySwitcher Class
 *
 * Handles legacy URL switching and menu title clearing for admin dashboard and settings.
 *
 * @since DOKAN_SINCE
 */
class LegacySwitcher implements Hookable {

    /**
     * Filter array with legacy configurations
     *
     * @since DOKAN_SINCE
     *
     * @var array
     */
//    protected array $legacy_url_mappings = [
//        'dashboard' => [
//            'legacy_url'  => 'admin.php?page=dokan#/',
//            'new_url'     => 'dokan-dashboard',
//            'legacy_data' => 'dokan_legacy_dashboard_page',
//        ],
//        'settings'  => [
//            'legacy_url'  => 'admin.php?page=dokan#/settings',
//            'new_url'     => 'dokan-dashboard#/settings',
//            'legacy_data' => 'dokan_legacy_admin_settings',
//        ],
//    ];

    protected array $legacy_url_mappings;

    /**
     * Register hooks for the LegacySwitcher
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'admin_menu', [ $this, 'clear_admin_submenu_title' ], 20 );
        add_action( 'admin_init', [ $this, 'handle_dashboard_redirect' ] );
    }

    /**
     * Get legacy URL mappings with filter applied.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    protected function get_legacy_url_mappings(): array {
        global $submenu;

        // Filter URLs that have dokan-dashboard menu slug
        $dokan_dashboard_items = array_filter(
            $submenu['dokan'],
            function ( $menu_item ) {
                return isset( $menu_item[2] ) && strpos( $menu_item[2], 'dokan-dashboard' ) !== false;
            }
        );

        // Extract URLs
        $dokan_dashboard_urls = wp_list_pluck( $dokan_dashboard_items, 2 );

        // Create an associative array with context as key and URL as value
        $this->legacy_url_mappings = array();

        foreach ( $dokan_dashboard_urls as $url ) {
            // Extract context from URL
            $context = 'dashboard'; // Default

            if ( preg_match( '/#\/(.+)$/', $url, $matches ) ) {
                // Extract the part after #/
                $context = str_replace( '-', '_', $matches[1] );
            } elseif ( $url === 'dokan-dashboard' ) {
                $context = 'dashboard';
            }

            $this->legacy_url_mappings[ $context ] = $url;
        }

        error_log( 'dokan_legacy_url_mappings: ' . print_r( $this->legacy_url_mappings, true ) );

        return apply_filters( 'dokan_legacy_url_mappings', $this->legacy_url_mappings );
    }

    /**
     * Clear the admin settings submenu title.
     *
     * This method clears the title of the admin settings submenu to prevent it from displaying
     * in the admin menu. It is useful for cases where you want to hide the submenu title
     * but still keep the submenu item accessible.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function clear_admin_submenu_title(): void {
        global $submenu;

        // Check if the submenu exists.
        if ( ! isset( $submenu['dokan'] ) || ! is_array( $submenu['dokan'] ) ) {
            return;
        }

        // @codingStandardsIgnoreStart
        foreach ( $submenu['dokan'] as $index => $menu_item ) {
            $url = $menu_item[2] ?? '';

            foreach ( $this->get_legacy_url_mappings() as $key => $new_url ) {
                if ( $url === $new_url ) {
                    $submenu['dokan'][ $index ][0] = '';
                }

                $legacy_data = get_option( 'dokan_legacy_admin_' . $key, false );
                if ( ! $legacy_data ) {
//                    $submenu['dokan'][ $index ][2] = 'admin.php?page=' . $mapping['url'];
                }
            }
        }
        // @codingStandardsIgnoreEnd
    }

    /**
     * Handle dashboard redirect based on legacy dashboard preference.
     *
     * This method checks if the user has requested to switch the dashboard or settings and updates
     * the option accordingly. It then redirects the user to the appropriate page with URL fragments.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function handle_dashboard_redirect(): void {
        // Early return if not a switch request.
        if ( ! isset( $_GET['dokan_action'] ) || 'switch_admin_panel' !== sanitize_key( wp_unslash( $_GET['dokan_action'] ) ) ) {
            return;
        }

        // Early return if nonce verification fails.
        if ( ! isset( $_GET['dokan_admin_switching_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['dokan_admin_switching_nonce'] ) ), 'dokan_switch_admin_panel' ) ) {
            return;
        }

        $url_maps   = $this->get_legacy_url_mappings();
        $legacy_key = sanitize_key( wp_unslash( $_GET['legacy_key'] ?? '' ) );
        if ( ! $legacy_key || ! isset( $url_maps[ $legacy_key ] ) ) {
            return;
        }

        $current_is_legacy = get_option( 'dokan_legacy_admin_' . $legacy_key, false );
        $new_legacy_state  = ! $current_is_legacy;

        update_option( 'dokan_legacy_admin_' . $legacy_key, $new_legacy_state );

        $page_slug    = $new_legacy_state ? 'dokan' : 'dokan-dashboard';
        $redirect_url = add_query_arg( [ 'page' => $page_slug ], admin_url( 'admin.php' ) );

		//        if ( ! $new_legacy_state ) {
		//            $redirect_url .= '#/settings';
		//        }
        wp_safe_redirect( $redirect_url );
        exit;
    }

//    /**
//     * Clear the admin settings submenu title.
//     *
//     * This method clears the title of the admin settings submenu to prevent it from displaying
//     * in the admin menu. It is useful for cases where you want to hide the submenu title
//     * but still keep the submenu item accessible.
//     *
//     * @since DOKAN_SINCE
//     *
//     * @return void
//     */
//    public function clear_admin_submenu_title(): void {
//        global $submenu;
//
//        // Check if the submenu exists.
//        if ( ! isset( $submenu['dokan'] ) || ! is_array( $submenu['dokan'] ) ) {
//            return;
//        }
//
//        // @codingStandardsIgnoreStart
//        foreach ( $submenu['dokan'] as $index => $menu_item ) {
//            $url = $menu_item[2] ?? '';
//
//            foreach ( $this->get_legacy_url_mappings() as $mapping ) {
//                if ( $url === $mapping['new_url'] ) {
//                    $submenu['dokan'][ $index ][0] = '';
//                }
//
//                $legacy_data = get_option( $mapping['legacy_data'], false );
//                if ( ! $legacy_data && $url === $mapping['legacy_url'] ) {
//                    $submenu['dokan'][ $index ][2] = 'admin.php?page=' . $mapping['new_url'];
//                }
//            }
//        }
//        // @codingStandardsIgnoreEnd
//    }
//
//    /**
//     * Handle dashboard redirect based on legacy dashboard preference.
//     *
//     * This method checks if the user has requested to switch the dashboard or settings and updates
//     * the option accordingly. It then redirects the user to the appropriate page with URL fragments.
//     *
//     * @since DOKAN_SINCE
//     *
//     * @return void
//     */
//    public function handle_dashboard_redirect(): void {
//        // Early return if not a switch request.
//        if ( ! isset( $_GET['dokan_action'] ) || 'switch_admin_panel' !== sanitize_key( wp_unslash( $_GET['dokan_action'] ) ) ) {
//            return;
//        }
//
//        // Early return if nonce verification fails.
//        if ( ! isset( $_GET['dokan_admin_switching_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['dokan_admin_switching_nonce'] ) ), 'dokan_switch_admin_panel' ) ) {
//            return;
//        }
//
//        $url_maps   = $this->get_legacy_url_mappings();
//        $legacy_key = sanitize_key( wp_unslash( $_GET['legacy_key'] ?? '' ) );
//        if ( ! $legacy_key || empty( $url_maps[ $legacy_key ] ) ) {
//            return;
//        }
//
//        $current_is_legacy = get_option( $url_maps[ $legacy_key ]['legacy_data'], false );
//        $new_legacy_state  = ! $current_is_legacy;
//
//        update_option( $url_maps[ $legacy_key ]['legacy_data'], $new_legacy_state );
//
//        $page_slug    = $new_legacy_state ? 'dokan' : 'dokan-dashboard';
//        $redirect_url = add_query_arg( [ 'page' => $page_slug ], admin_url( 'admin.php' ) );
//
//		//        if ( ! $new_legacy_state ) {
//		//            $redirect_url .= '#/settings';
//		//        }
//        wp_safe_redirect( $redirect_url );
//        exit;
//    }
}
