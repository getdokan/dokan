<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Support\RequestContext;
use WeDevs\Dokan\Utilities\VendorUtil;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * The marketplace's policy for AI assistants: whether Dokan's MCP server answers at all, who may
 * use it, and where an assistant connects.
 *
 * {@see Server} registers the endpoint on the WordPress MCP Adapter; this class only answers
 * policy questions. Both switches live in the AI Assist settings (`dokan_ai` section) so the
 * legacy and the new admin settings screens share one source of truth through the settings bridge.
 *
 * @since DOKAN_SINCE
 */
class Access {

    /**
     * Legacy settings section holding the MCP switches.
     */
    const SETTING_SECTION = 'dokan_ai';

    /**
     * Master switch option key.
     */
    const SETTING_ENABLED = 'dokan_mcp_enabled';

    /**
     * Vendor access option key.
     */
    const SETTING_VENDOR_ACCESS = 'dokan_mcp_vendor_access';

    /**
     * Identifier of Dokan's server on the MCP Adapter.
     */
    const SERVER_ID = 'dokan-mcp';

    /**
     * REST namespace of Dokan's MCP endpoint.
     */
    const ROUTE_NAMESPACE = 'dokan';

    /**
     * REST route of Dokan's MCP endpoint, beneath its namespace.
     */
    const ROUTE = 'mcp';

    /**
     * Whether Dokan's tools are exposed to AI assistants.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_enabled(): bool {
        $enabled = 'on' === dokan_get_option( self::SETTING_ENABLED, self::SETTING_SECTION, 'off' );

        /**
         * Filters whether Dokan's tools are exposed to AI assistants over MCP.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $enabled Whether the master switch is on.
         */
        return (bool) apply_filters( 'dokan_mcp_enabled', $enabled );
    }

    /**
     * Whether vendors (and their staff) may use the tools through an assistant of their own.
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
         * Filters whether vendors may use Dokan's tools through an AI assistant.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $enabled Whether the vendor access switch is on.
         */
        return (bool) apply_filters( 'dokan_mcp_vendor_access_enabled', $enabled );
    }

    /**
     * The MCP endpoint an AI client connects to: Dokan's own server on the MCP Adapter.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function endpoint(): string {
        /**
         * Filters the MCP endpoint the settings screens hand out.
         *
         * @since DOKAN_SINCE
         *
         * @param string $endpoint The URL of Dokan's MCP server.
         */
        return (string) apply_filters( 'dokan_mcp_endpoint', rest_url( self::ROUTE_NAMESPACE . '/' . self::ROUTE ) );
    }

    /**
     * Whether WordPress is serving Dokan's MCP endpoint right now.
     *
     * Decided on the REST route WordPress dispatches, never on the request URI, so a URL that
     * merely mentions the endpoint in its query string does not count.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_request_to_endpoint(): bool {
        return RequestContext::serves_route( '/' . self::ROUTE_NAMESPACE . '/' . self::ROUTE );
    }

    /**
     * Whether an ability is one of Dokan's own.
     *
     * @since DOKAN_SINCE
     *
     * @param string $ability_name Ability name.
     *
     * @return bool
     */
    public static function is_dokan_ability( string $ability_name ): bool {
        return 0 === strpos( $ability_name, 'dokan/' );
    }

    /**
     * Whether Dokan's access policy applies to an ability: its own, and the WooCommerce product
     * and order abilities it vendor-scopes.
     *
     * @since DOKAN_SINCE
     *
     * @param string $ability_name Ability name.
     *
     * @return bool
     */
    public static function governs( string $ability_name ): bool {
        $governs = self::is_dokan_ability( $ability_name )
            || 0 === strpos( $ability_name, 'woocommerce/product' )
            || 0 === strpos( $ability_name, 'woocommerce/order' );

        /**
         * Filters whether Dokan's AI assistant access policy applies to an ability.
         *
         * @since DOKAN_SINCE
         *
         * @param bool   $governs      Whether the policy applies.
         * @param string $ability_name Ability name.
         */
        return (bool) apply_filters( 'dokan_mcp_governs_ability', $governs, $ability_name );
    }

    /**
     * Whether a user may use the marketplace tools through an AI assistant right now.
     *
     * Store Admins always may. A Vendor or Vendor Staff may only while both switches are on and
     * the store's selling is enabled: the settings screen offers vendor access beneath the master
     * switch, so a master switch that is off closes vendor access with it, and a suspended
     * vendor's assistant stops with the suspension.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User ID.
     *
     * @return bool
     */
    public static function user_can_connect( int $user_id ): bool {
        if ( $user_id <= 0 || ! get_userdata( $user_id ) ) {
            return false;
        }

        if ( user_can( $user_id, 'manage_woocommerce' ) ) {
            $allowed = true;
        } elseif ( self::is_enabled() && self::vendor_access_enabled() ) {
            // A vendor resolves to themselves, staff to their parent vendor.
            $vendor_id = VendorUtil::get_vendor_id_for_user( $user_id );
            $allowed   = $vendor_id > 0 && dokan_is_user_seller( $vendor_id ) && dokan_is_seller_enabled( $vendor_id );
        } else {
            $allowed = false;
        }

        /**
         * Filters whether a user may use the marketplace tools through an AI assistant.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $allowed Whether the user may connect.
         * @param int  $user_id User ID.
         */
        return (bool) apply_filters( 'dokan_mcp_user_can_connect', $allowed, $user_id );
    }

    /**
     * What an assistant is told while the master switch is off.
     *
     * @since DOKAN_SINCE
     *
     * @return WP_Error
     */
    public static function disabled_error(): WP_Error {
        return new WP_Error( 'dokan_mcp_disabled', __( 'AI assistant access to Dokan is switched off. A store admin can turn it on under Dokan > Settings > AI Assist > MCP Server.', 'dokan-lite' ), [ 'status' => 403 ] );
    }

    /**
     * What an assistant is told when its account may not connect.
     *
     * @since DOKAN_SINCE
     *
     * @return WP_Error
     */
    public static function not_allowed_error(): WP_Error {
        return new WP_Error( 'dokan_mcp_not_allowed', __( 'This account may not use the marketplace tools through an AI assistant. Store admins always can; vendors and their staff only while AI assistant access and "Allow vendors to connect" are both on and their store is enabled.', 'dokan-lite' ), [ 'status' => 403 ] );
    }
}
