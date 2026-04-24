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
     * Transient key prefix used to persist the vendor's product editor preference.
     * The actual key is suffixed with the user id (see `get_product_editor_transient_key`).
     *
     * @since DOKAN_SINCE
     */
    public const PRODUCT_EDITOR_USE_LEGACY_TRANSIENT_KEY = 'dokan_product_editor_use_legacy';

    /**
     * Nonce action used for product editor switch URLs.
     *
     * @since DOKAN_SINCE
     */
    public const PRODUCT_EDITOR_NONCE_ACTION = 'dokan_switch_product_editor';

    /**
     * Query arg that carries the nonce on product editor switch URLs.
     *
     * @since DOKAN_SINCE
     */
    public const PRODUCT_EDITOR_NONCE_QUERY_ARG = 'dokan_product_editor_switching_nonce';

    /**
     * Value of `dokan_action` that triggers the product editor switch.
     *
     * @since DOKAN_SINCE
     */
    public const PRODUCT_EDITOR_SWITCH_ACTION = 'switch_product_editor';

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
        add_action( 'template_redirect', [ $this, 'handle_product_editor_switch' ] );
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
                'refund'              => 'refunds',
                'request-for-quote'   => 'rfq',
                'announcement'        => 'announcements',
                'dokan-seller-badge'  => 'seller-badge',
                'product-advertising' => 'advertising',
                'admin-store-support' => 'store-support',
                'product-qa'          => 'product-qa',
            ]
        );

        // Get the legacy key from the map or the original key.
        $legacy_key = sanitize_key( wp_unslash( $admin_url_map[ $key ] ?? $key ) );

        return 'dokan_legacy_' . $legacy_key . '_page';
    }

    /**
     * Handle the vendor product editor switch request: toggle the per-vendor
     * preference and redirect to the opposite editor for the requested product.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function handle_product_editor_switch(): void {
        if ( ! isset( $_GET['dokan_action'] ) || self::PRODUCT_EDITOR_SWITCH_ACTION !== sanitize_key( wp_unslash( $_GET['dokan_action'] ) ) ) {
            return;
        }

        if ( ! isset( $_GET[ self::PRODUCT_EDITOR_NONCE_QUERY_ARG ] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_GET[ self::PRODUCT_EDITOR_NONCE_QUERY_ARG ] ) ), self::PRODUCT_EDITOR_NONCE_ACTION ) ) {
            return;
        }

        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            return;
        }

        $product_id = isset( $_GET['product_id'] ) ? absint( wp_unslash( $_GET['product_id'] ) ) : 0;
        if ( ! $product_id ) {
            return;
        }

        $use_legacy_after_toggle = ! $this->is_product_editor_legacy_preferred( $user_id );
        $transient_key           = $this->get_product_editor_transient_key( $user_id );

        if ( $use_legacy_after_toggle ) {
            set_transient( $transient_key, '1', $this->transient_expiration );
        } else {
            delete_transient( $transient_key );
        }

        $redirect_url = $use_legacy_after_toggle
            ? $this->get_legacy_product_editor_url( $product_id )
            : $this->get_new_product_editor_url( $product_id );

        wp_safe_redirect( $redirect_url );
        exit;
    }

    /**
     * Build a nonce-protected product editor switch URL for a given product.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id
     *
     * @return string
     */
    public function get_product_editor_switch_url( int $product_id ): string {
        return add_query_arg(
            [
                'dokan_action'                       => self::PRODUCT_EDITOR_SWITCH_ACTION,
                self::PRODUCT_EDITOR_NONCE_QUERY_ARG => wp_create_nonce( self::PRODUCT_EDITOR_NONCE_ACTION ),
                'product_id'                         => $product_id,
            ],
            dokan_get_navigation_url( 'products' )
        );
    }

    /**
     * Whether the given user prefers the legacy product editor.
     *
     * Defaults to `false` — the new (React) product editor — when no
     * per-user preference transient has been stored.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id Optional. Defaults to current user.
     *
     * @return bool
     */
    public function is_product_editor_legacy_preferred( int $user_id = 0 ): bool {
        if ( ! $user_id ) {
            $user_id = get_current_user_id();
        }

        // Anonymous context (cron, emails without a current user) → prefer the new editor.
        if ( ! $user_id ) {
            return false;
        }

        // Missing transient → prefer the new editor.
        return (bool) get_transient( $this->get_product_editor_transient_key( $user_id ) );
    }

    /**
     * Build the per-user transient key that stores the product editor preference.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id
     *
     * @return string
     */
    protected function get_product_editor_transient_key( int $user_id ): string {
        return self::PRODUCT_EDITOR_USE_LEGACY_TRANSIENT_KEY . '_' . $user_id;
    }

    /**
     * Build the new (React) product editor URL.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id
     *
     * @return string
     */
    public function get_new_product_editor_url( int $product_id ): string {
        // `dokan_get_navigation_url( 'products', true )` already ends with `#products/`.
        $base   = dokan_get_navigation_url( 'products', true );
        $suffix = $product_id ? $product_id . '/edit' : 'create';

        return $base . $suffix;
    }

    /**
     * Build the legacy product editor URL, falling back to the
     * create-new-product URL when no product id is supplied.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id
     *
     * @return string
     */
    protected function get_legacy_product_editor_url( int $product_id ): string {
        if ( ! $product_id ) {
            return (string) dokan_get_new_product_url();
        }

        return (string) dokan_edit_product_url( $product_id );
    }
}
