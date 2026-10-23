<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Utilities\VendorUtil;

defined( 'ABSPATH' ) || exit;

/**
 * Who may reach the Dokan MCP server, and whether it is switched on at all.
 *
 * Both switches live in the AI Assist settings (`dokan_ai` section) so the legacy and the new
 * admin settings screens share one source of truth through the settings bridge.
 *
 * @since DOKAN_SINCE
 */
class Access {

    /**
     * Legacy settings section holding the MCP switches.
     *
     * @since DOKAN_SINCE
     */
    const SETTING_SECTION = 'dokan_ai';

    /**
     * Master switch option key.
     *
     * @since DOKAN_SINCE
     */
    const SETTING_ENABLED = 'dokan_mcp_enabled';

    /**
     * Vendor access option key.
     *
     * @since DOKAN_SINCE
     */
    const SETTING_VENDOR_ACCESS = 'dokan_mcp_vendor_access';

    /**
     * MCP server id on the shared adapter.
     *
     * @since DOKAN_SINCE
     */
    const SERVER_ID = 'dokan';

    /**
     * REST namespace of the MCP endpoint.
     *
     * @since DOKAN_SINCE
     */
    const ROUTE_NAMESPACE = 'dokan';

    /**
     * REST route of the MCP endpoint, beneath the namespace.
     *
     * @since DOKAN_SINCE
     */
    const ROUTE = 'mcp';

    /**
     * Whether the Dokan MCP server is switched on.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_enabled(): bool {
        $enabled = 'on' === dokan_get_option( self::SETTING_ENABLED, self::SETTING_SECTION, 'off' );

        /**
         * Filters whether the Dokan MCP server answers at all.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $enabled Whether MCP is on.
         */
        return (bool) apply_filters( 'dokan_mcp_enabled', $enabled );
    }

    /**
     * Whether vendors (and their staff) may connect their own assistants.
     *
     * Off by default: the first release targets the store owner, and a vendor connection is an
     * explicit opt-in by the marketplace.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function vendor_access_enabled(): bool {
        $enabled = 'on' === dokan_get_option( self::SETTING_VENDOR_ACCESS, self::SETTING_SECTION, 'off' );

        /**
         * Filters whether vendors may connect to the Dokan MCP server.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $enabled Whether vendor access is on.
         */
        return (bool) apply_filters( 'dokan_mcp_vendor_access_enabled', $enabled );
    }

    /**
     * The MCP endpoint an AI client connects to.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function endpoint(): string {
        return rest_url( self::ROUTE_NAMESPACE . '/' . self::ROUTE );
    }

    /**
     * Whether the raw HTTP request targets the MCP endpoint.
     *
     * Decided from the request URI rather than a matched REST route, because it is needed while
     * WordPress is still working out who the user is, before any route has matched.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_request_to_endpoint(): bool {
        $path = self::ROUTE_NAMESPACE . '/' . self::ROUTE;
        $uri  = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';

        if ( preg_match( '#/' . preg_quote( rest_get_url_prefix() . '/' . $path, '#' ) . '(?:[/?]|$)#', $uri ) ) {
            return true;
        }

        // Plain permalinks carry the route in a query argument instead.
        $route = isset( $_GET['rest_route'] ) ? sanitize_text_field( wp_unslash( $_GET['rest_route'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

        return (bool) preg_match( '#^/?' . preg_quote( $path, '#' ) . '(?:/|$)#', $route );
    }

    /**
     * Whether a user may hold a working MCP connection right now.
     *
     * Store Admins always may. A Vendor or Vendor Staff may only while vendor access is on and
     * the store's selling is enabled, so a suspended vendor's assistant stops with the suspension.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User to check.
     *
     * @return bool
     */
    public static function user_can_connect( int $user_id ): bool {
        if ( $user_id <= 0 || ! get_userdata( $user_id ) ) {
            return false;
        }

        if ( user_can( $user_id, 'manage_woocommerce' ) ) {
            $allowed = true;
        } elseif ( self::vendor_access_enabled() ) {
            // A vendor resolves to themselves, staff to their parent vendor.
            $vendor_id = VendorUtil::get_vendor_id_for_user( $user_id );
            $allowed   = $vendor_id > 0 && dokan_is_user_seller( $vendor_id ) && dokan_is_seller_enabled( $vendor_id );
        } else {
            $allowed = false;
        }

        /**
         * Filters whether a user may connect an AI assistant to the Dokan MCP server.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $allowed Whether the user may connect.
         * @param int  $user_id The user.
         */
        return (bool) apply_filters( 'dokan_mcp_user_can_connect', $allowed, $user_id );
    }

    /**
     * The marketplace role a user acts in over MCP.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User to classify.
     *
     * @return string `admin`, `staff`, `vendor` or `none`.
     */
    public static function role_of( int $user_id ): string {
        if ( user_can( $user_id, 'manage_woocommerce' ) ) {
            return 'admin';
        }

        if ( user_can( $user_id, 'vendor_staff' ) ) {
            return 'staff';
        }

        return dokan_is_user_seller( $user_id ) ? 'vendor' : 'none';
    }

    /**
     * Whether plain-http transport is acceptable by default on this site.
     *
     * Most AI clients refuse a plain-http connector anyway; a local or development site is the
     * one place it is legitimately used.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function allows_insecure_transport(): bool {
        return in_array( wp_get_environment_type(), [ 'local', 'development' ], true );
    }
}
