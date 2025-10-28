<?php

namespace WeDevs\Dokan\Admin\Dashboard;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * LegacySwitcher Class
 *
 * Handles legacy URL switching and menu title clearing for admin dashboard and settings.
 *
 * @since 4.1.3
 */
class LegacySwitcher implements Hookable {

    /**
     * Default transient expiration time in seconds (15 days)
     *
     * @since 4.1.3
     *
     * @var int
     */
    protected int $transient_expiration = 15 * DAY_IN_SECONDS;

    /**
     * Register hooks for the LegacySwitcher
     *
     * @since 4.1.3
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'admin_menu', [ $this, 'handle_dokan_admin_submenu' ], 20 );
        add_action( 'admin_init', [ $this, 'handle_dashboard_redirect' ] );
    }

    /**
     * Clear admin submenu title based on legacy dashboard preference.
     *
     * @since 4.1.3
     *
     * @return void
     */
    public function handle_dokan_admin_submenu(): void {
        global $submenu;

        // Check if the submenu exists.
        if ( ! isset( $submenu['dokan'] ) || ! is_array( $submenu['dokan'] ) ) {
            return;
        }

        // Filter the submenu items based on legacy dashboard preference.
        $filtered = array_reduce(
            $submenu['dokan'], function ( $filtered, $menu_item ) {
                $menu_title       = explode( ' <', $menu_item[0] );
                $title            = sanitize_title_with_dashes( $menu_title[0] );
				$is_legacy        = get_transient( 'dokan_legacy_' . $title . '_page' );
                $is_new_dashboard = strpos( $menu_item[2], 'dokan-dashboard' ) !== false;

				// Handle the admin dashboard menu item based on legacy dashboard preference.
                // Dashboard legacy and the new menu should keep (both) for the frontend mounting purpose, that's why we are handling the dashboard menu item separately.
				if ( 'dashboard' === $title ) {
                    // Clear the title if the legacy dashboard is enabled.
                    if ( $is_new_dashboard && $is_legacy ) {
                        $menu_item[0] = '';
                    }

                    // Clear the title and update the url if the legacy dashboard is disabled.
                    if ( ! $is_new_dashboard && ! $is_legacy ) {
                        $menu_item[0] = '';
                        $menu_item[2] = 'admin.php?page=dokan-dashboard';
                    }

                    // Add dashboard menu item based on legacy dashboard preference.
                    $filtered[] = $menu_item;

					return $filtered;
				}

				// Check if the menu item for handle the admin legacy page switching.
				if ( isset( $menu_item[2] ) && $is_new_dashboard ) {
					if ( ! $is_legacy ) {
						$filtered[ $title ] = $menu_item;
					}
				} elseif ( ! isset( $filtered[ $title ] ) ) {
					$filtered[ $title ] = $menu_item;
				}

				return $filtered;
			}, []
        );

        $submenu['dokan'] = array_values( $filtered ); // phpcs:ignore
    }

    /**
     * Handle dashboard redirect based on legacy dashboard preference.
     *
     * @since 4.1.3
     *
     * @return void
     */
    public function handle_dashboard_redirect(): void {
        // Early return if not a switch request.
        if ( ! isset( $_GET['dokan_action'] ) || 'switch_admin_panel' !== sanitize_key( wp_unslash( $_GET['dokan_action'] ) ) ) {
            return;
        }

        // Early return if nonce verification fails.
        if ( ! isset( $_GET['dokan_admin_switching_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_GET['dokan_admin_switching_nonce'] ) ), 'dokan_switch_admin_panel' ) ) {
            return;
        }

        $legacy_key          = sanitize_key( wp_unslash( $_GET['legacy_key'] ?? 'dashboard' ) );
        $filtered_legacy_key = $this->get_custom_transient_key( $legacy_key );
        $current_is_legacy   = get_transient( $filtered_legacy_key );
        $new_legacy_state    = ! $current_is_legacy;

        if ( $current_is_legacy ) {
            delete_transient( $filtered_legacy_key );
        } else {
            set_transient( $filtered_legacy_key, $new_legacy_state, $this->transient_expiration );
        }

        // Redirect to the new admin page, if needed.
        $page_slug    = $new_legacy_state ? 'dokan' : 'dokan-dashboard';
        $endpoint     = str_replace( 'dashboard', '', $legacy_key ); // Remove 'dashboard' from the endpoint as the default endpoint.
        $redirect_url = add_query_arg( [ 'page' => $page_slug ], admin_url( 'admin.php' ) ) . '#/' . $endpoint;

        // TODO: Remove this legacy option cleanup after 2-3 versions
        // Check if the legacy option exists and remove it.
        $legacy_dashboard_page = get_option( 'dokan_legacy_dashboard_page', false );
        if ( $legacy_dashboard_page ) {
            // This removes the old option from the database as we've migrated to transients.
            delete_option( 'dokan_legacy_dashboard_page' );
        }

        wp_safe_redirect( $redirect_url );
        exit;
    }

    /**
     * Get admin menu transient key.
     *
     * @since 4.1.3
     *
     * @param string $key
     *
     * @return string
     */
    public function get_custom_transient_key( $key ) {
        $admin_url_map = apply_filters(
            'dokan_admin_legacy_url_map',
            [
                'request-for-quote' => 'rfq',
            ]
        );

        // Get the legacy key from the map or the original key.
        $legacy_key = sanitize_key( wp_unslash( $admin_url_map[ $key ] ?? $key ) );

        return 'dokan_legacy_' . $legacy_key . '_page';
    }
}
