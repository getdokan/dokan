<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Utilities\VendorUtil;

defined( 'ABSPATH' ) || exit;

/**
 * The marketplace's policy for AI assistants: whether Dokan's tools are exposed over MCP at all,
 * who may use them, and where an assistant connects.
 *
 * Dokan runs no MCP server. Its abilities are served by the WordPress MCP Adapter's default
 * server, next to WooCommerce's, and this class only answers policy questions. Both switches live
 * in the AI Assist settings (`dokan_ai` section) so the legacy and the new admin settings screens
 * share one source of truth through the settings bridge.
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
     * Id of the Dokan server on the MCP Adapter.
     *
     * @since DOKAN_SINCE
     */
    const SERVER_ID = 'dokan';

    /**
     * REST namespace of the Dokan server: the adapter's own, like every server it hosts.
     *
     * @since DOKAN_SINCE
     */
    const SERVER_NAMESPACE = 'mcp';

    /**
     * REST route of the Dokan server beneath that namespace.
     *
     * @since DOKAN_SINCE
     */
    const SERVER_ROUTE = 'dokan';

    /**
     * REST route of the MCP Adapter's default server, beneath the REST prefix.
     *
     * @since DOKAN_SINCE
     */
    const DEFAULT_SERVER_ROUTE = 'mcp/mcp-adapter-default-server';

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
         * @param bool $enabled Whether MCP access is on.
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
         * @param bool $enabled Whether vendor access is on.
         */
        return (bool) apply_filters( 'dokan_mcp_vendor_access_enabled', $enabled );
    }

    /**
     * The MCP endpoint an AI client connects to: the Dokan server, one tool per ability.
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
         * @param string $endpoint The Dokan server's URL.
         */
        return (string) apply_filters( 'dokan_mcp_endpoint', rest_url( self::SERVER_NAMESPACE . '/' . self::SERVER_ROUTE ) );
    }

    /**
     * The adapter's default server, where the same abilities sit behind its discover and
     * execute meta-tools next to WooCommerce's.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function default_server_endpoint(): string {
        return rest_url( self::DEFAULT_SERVER_ROUTE );
    }

    /**
     * Whether an ability is one of Dokan's own.
     *
     * @since DOKAN_SINCE
     *
     * @param string $ability_name Ability name, e.g. `dokan/current-vendor`.
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
         * @param string $ability_name The ability.
         */
        return (bool) apply_filters( 'dokan_mcp_governs_ability', $governs, $ability_name );
    }

    /**
     * Whether a user may use Dokan's tools through an AI assistant right now.
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
         * Filters whether a user may use Dokan's tools through an AI assistant.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $allowed Whether the user may connect.
         * @param int  $user_id The user.
         */
        return (bool) apply_filters( 'dokan_mcp_user_can_connect', $allowed, $user_id );
    }
}
