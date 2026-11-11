<?php

namespace WeDevs\Dokan\Abilities\Mcp;

defined( 'ABSPATH' ) || exit;

/**
 * Everything the admin settings screens need to describe AI assistant access and how to connect.
 *
 * Both settings UIs (the plugin-ui schema and the legacy fields) read this one snapshot and the
 * same copy, so the two screens never disagree.
 *
 * @since DOKAN_SINCE
 */
class Status {

    /**
     * The connection as the settings screens see it.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function summary(): array {
        $enabled = Access::is_enabled();

        return [
            'enabled'             => $enabled,
            'vendor_access'       => Access::vendor_access_enabled(),
            'adapter_available'   => self::adapter_available(),
            'woocommerce_feature' => self::woocommerce_feature_on(),
            'live'                => $enabled && self::server_can_run(),
            'https'               => wc_site_is_https(),
            'endpoint'            => Access::endpoint(),
        ];
    }

    /**
     * Whether something on this site runs the MCP Adapter, so Dokan's server can be registered
     * on it. Says nothing about the switches.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function server_can_run(): bool {
        /**
         * Filters whether the MCP Adapter runs on this site, so Dokan's server is registered on it.
         *
         * For a site that boots the adapter in a way Dokan cannot see, such as its own bootstrap
         * of the copy WooCommerce bundles.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $can_run Whether the adapter is loaded and something runs it.
         */
        return (bool) apply_filters( 'dokan_mcp_server_can_run', self::adapter_available() && self::woocommerce_feature_on() );
    }

    /**
     * Whether the MCP Adapter and the Abilities API are both loaded.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function adapter_available(): bool {
        return class_exists( '\WP\MCP\Core\McpAdapter' ) && function_exists( 'wp_register_ability' );
    }

    /**
     * Whether this WooCommerce bundles the MCP Adapter: 10.9 to 11.2 do, behind their
     * "MCP Integration" feature; 11.3 dropped it in favour of the standalone plugin.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function woocommerce_bundles_adapter(): bool {
        return function_exists( 'WC' ) && version_compare( (string) WC()->version, '11.3', '<' );
    }

    /**
     * Whether the standalone MCP Adapter plugin is active. It boots the adapter by itself,
     * whatever WooCommerce's feature flag says.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function standalone_adapter_active(): bool {
        // Only the plugin's own bootstrap loads this class; WooCommerce starts its bundled copy without it.
        return class_exists( '\WP\MCP\Plugin', false );
    }

    /**
     * Whether WooCommerce lets its bundled adapter run. Always true from 11.3, and with the
     * standalone plugin active, since the plugin boots the adapter itself.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function woocommerce_feature_on(): bool {
        if ( ! self::woocommerce_bundles_adapter() || self::standalone_adapter_active() ) {
            return true;
        }

        return class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' )
            && \Automattic\WooCommerce\Utilities\FeaturesUtil::feature_is_enabled( 'mcp_integration' );
    }

    /**
     * The copy both settings screens share for the switches, unescaped.
     *
     * @since DOKAN_SINCE
     *
     * @return array{intro:string,enabled:string,vendor_access:string}
     */
    public static function copy(): array {
        return [
            'intro'         => __( 'Connect assistants such as Claude, Cursor or VS Code to your marketplace through the Model Context Protocol. Dokan runs its own MCP server on the WordPress MCP Adapter, at the connector URL below.', 'dokan-lite' ),
            'enabled'       => __( 'Offer the marketplace tools (vendors, products, orders, withdrawals) to connected assistants. The vendor limits on the WooCommerce product and order tools apply either way.', 'dokan-lite' ),
            'vendor_access' => __( 'Vendors and their staff can connect an assistant with an application password they create in their dashboard, under Settings > Store > AI Assistant. Each connection can only manage that vendor\'s own store.', 'dokan-lite' ),
        ];
    }

    /**
     * Why assistants cannot connect yet, if anything: a title and a sentence per problem, unescaped.
     *
     * @since DOKAN_SINCE
     *
     * @param array $summary The snapshot from {@see summary()}.
     *
     * @return array<string, array{title:string,text:string}>
     */
    public static function warnings( array $summary ): array {
        $warnings = [];

        if ( ! $summary['adapter_available'] ) {
            $warnings['adapter'] = [
                'title' => __( 'The MCP Adapter is not available', 'dokan-lite' ),
                'text'  => self::woocommerce_bundles_adapter()
                    ? __( 'Update WooCommerce, or install and activate the MCP Adapter plugin from WordPress.org (wp plugin install mcp-adapter --activate). Dokan registers its MCP server on it.', 'dokan-lite' )
                    : __( 'From WooCommerce 11.3 the adapter is a separate plugin: install and activate the MCP Adapter plugin from WordPress.org (wp plugin install mcp-adapter --activate). Dokan registers its MCP server on it.', 'dokan-lite' ),
            ];
        } elseif ( ! $summary['woocommerce_feature'] ) {
            $warnings['woocommerce_feature'] = [
                'title' => __( 'WooCommerce\'s MCP integration is switched off', 'dokan-lite' ),
                'text'  => __( 'Turn on WooCommerce > Settings > Advanced > Features > MCP Integration, or install and activate the MCP Adapter plugin. Nothing serves the tools until one of them runs the adapter.', 'dokan-lite' ),
            ];
        }

        if ( ! $summary['https'] ) {
            $warnings['https'] = [
                'title' => __( 'This site is not served over HTTPS', 'dokan-lite' ),
                'text'  => __( 'WordPress only accepts application passwords over HTTPS, and most AI assistants refuse a plain-http connector.', 'dokan-lite' ),
            ];
        }

        return $warnings;
    }

    /**
     * What to do with the connector URL, unescaped: how to use it, who may, then the state in brackets.
     *
     * @since DOKAN_SINCE
     *
     * @param array $summary The snapshot from {@see summary()}.
     *
     * @return string
     */
    public static function connector_description( array $summary ): string {
        $who   = $summary['vendor_access']
            ? __( 'Vendors use the same URL with their own username and application password.', 'dokan-lite' )
            : __( 'Only store admins can connect while vendor access is off.', 'dokan-lite' );
        $state = $summary['live']
            ? __( 'Live', 'dokan-lite' )
            : __( 'Off', 'dokan-lite' );

        return __( 'Add this to the assistant as an HTTP MCP server, signed in with HTTP Basic authentication: a WordPress username and an application password. WooCommerce REST API keys are not accepted.', 'dokan-lite' ) . ' ' . $who . ' (' . $state . ')';
    }

    /**
     * How an assistant signs in, unescaped: one sentence for both settings screens.
     *
     * @since DOKAN_SINCE
     *
     * @param array $summary The snapshot from {@see summary()}.
     *
     * @return string
     */
    public static function sign_in_text( array $summary ): string {
        $parts = [];

        if ( $summary['vendor_access'] ) {
            $parts[] = __( 'Vendors create their application password in their dashboard, under Settings > Store > AI Assistant', 'dokan-lite' );
        }

        // Last, because both screens put the Store Admin's own "Create yours" link right after this sentence.
        $parts[] = __( 'Assistants sign in with a WordPress application password', 'dokan-lite' );

        return implode( ' | ', $parts );
    }

    /**
     * Where a Store Admin creates an application password for themselves. Vendors have no access
     * to wp-admin and create theirs in the Vendor Dashboard ({@see VendorSettings}).
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function application_passwords_url(): string {
        return admin_url( 'profile.php#application-passwords-section' );
    }
}
