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
     * Default transient expiration time in seconds (15 days)
     *
     * @since DOKAN_SINCE
     *
     * @var int
     */
    protected int $transient_expiration = 15 * DAY_IN_SECONDS;

    /**
     * Register hooks for the LegacySwitcher
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'admin_menu', [ $this, 'clear_admin_submenu_title' ], 30 );
        add_action( 'admin_menu', [ $this, 'handle_dokan_admin_submenu' ], 20 );
        add_action( 'admin_init', [ $this, 'handle_dashboard_redirect' ] );
    }

    /**
     * Clear the Dokan submenu title.
     *
     * This method clears the title of the Dokan submenu to prevent it from displaying
     * in the admin menu. It is useful for cases where you want to hide the submenu title
     * but still keep the submenu item accessible.
     *
     * @since 4.1.0
     *
     * @return void
     */
    public function clear_admin_submenu_title(): void {
        global $submenu;

        // Check if the user has the required capability.
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        // Check if the Dokan Dashboard submenu exists.
        $legacy   = get_transient( 'dokan_legacy_dashboard_page' );
        $position = (int) $legacy;

        // @codingStandardsIgnoreStart
        if ( isset( $submenu['dokan'][ $position ][0] ) ) {
            $submenu['dokan'][ $position ][0] = '';
        }

        if ( ! $legacy ) {
            $submenu['dokan'][0][2] = 'admin.php?page=dokan-dashboard';
        }
        // @codingStandardsIgnoreEnd
    }

    /**
     * Clear admin submenu title based on legacy dashboard preference.
     *
     * @since DOKAN_SINCE
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
				$title = sanitize_title_with_dashes( $menu_item[0] );
				$is_legacy = get_transient( 'dokan_legacy_' . $title . '_page' );

				// Keep the dashboard menu item.
				if ( 'dashboard' === $title ) {
					$filtered[] = $menu_item;
					return $filtered;
				}

				// Check if the menu item for handle the admin legacy page switching.
				if ( isset( $menu_item[2] ) && strpos( $menu_item[2], 'dokan-dashboard' ) !== false ) {
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
        if ( ! isset( $_GET['dokan_admin_switching_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_GET['dokan_admin_switching_nonce'] ) ), 'dokan_switch_admin_panel' ) ) {
            return;
        }

        $legacy_key        = sanitize_key( wp_unslash( $_GET['legacy_key'] ?? 'dashboard' ) );
        $current_is_legacy = get_transient( 'dokan_legacy_' . $legacy_key . '_page' );
        $new_legacy_state  = ! $current_is_legacy;

        $legacy_transient_key = 'dokan_legacy_' . $legacy_key . '_page';
        if ( $current_is_legacy ) {
            delete_transient( $legacy_transient_key );
        } else {
            set_transient( $legacy_transient_key, $new_legacy_state, $this->transient_expiration );
        }

        // TODO: Redirect to base vendors URL until the React vendors list page is available.
        // Remove this workaround once the React vendors page is implemented.
        // Redirect to the new admin page, if needed.
        $page_slug = $new_legacy_state ? 'dokan' : 'dokan-dashboard';
        $page_slug = ( 'vendors' !== $legacy_key ) ? $page_slug : 'dokan';

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
}
