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
     * @return array{enabled:bool,vendor_access:bool,adapter_available:bool,default_server:bool,live:bool,https:bool,endpoint:string}
     */
    public static function summary(): array {
        $enabled   = Access::is_enabled();
        $available = self::adapter_available();

        /** This filter is documented in the MCP Adapter plugin. */
        $default_server = (bool) apply_filters( 'mcp_adapter_create_default_server', true );

        return [
            'enabled'           => $enabled,
            'vendor_access'     => Access::vendor_access_enabled(),
            'adapter_available' => $available,
            'default_server'    => $default_server,
            'live'              => $enabled && $available && $default_server,
            'https'             => wc_site_is_https(),
            'endpoint'          => Access::endpoint(),
        ];
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
     * The copy both settings screens share for the switches, unescaped.
     *
     * @since DOKAN_SINCE
     *
     * @return array{intro:string,enabled:string,vendor_access:string}
     */
    public static function copy(): array {
        return [
            'intro'         => __( 'Connect assistants such as Claude, Cursor or VS Code to your marketplace through the Model Context Protocol. Dokan serves its tools through the WordPress MCP Adapter, alongside the WooCommerce tools.', 'dokan-lite' ),
            'enabled'       => __( 'Offer the marketplace tools (vendors, products, orders, withdrawals) to connected assistants, each as a tool the assistant lists and asks approval for.', 'dokan-lite' ),
            'vendor_access' => __( 'Vendors and their staff can connect an assistant with an application password of their own. Each connection only reaches that vendor\'s own store.', 'dokan-lite' ),
        ];
    }

    /**
     * Why assistants cannot connect yet, if anything: a title and a sentence per problem, unescaped.
     *
     * @since DOKAN_SINCE
     *
     * @param array $summary Output of {@see self::summary()}.
     *
     * @return array<string, array{title:string,text:string}> Keyed `adapter`, `default_server` and/or `https`.
     */
    public static function warnings( array $summary ): array {
        $warnings = [];

        if ( ! $summary['adapter_available'] ) {
            $warnings['adapter'] = [
                'title' => __( 'The MCP Adapter plugin is not active', 'dokan-lite' ),
                'text'  => __( 'Install and activate the MCP Adapter plugin from WordPress.org (wp plugin install mcp-adapter --activate). WooCommerce and Dokan both serve their tools through it.', 'dokan-lite' ),
            ];
        } elseif ( ! $summary['default_server'] ) {
            $warnings['default_server'] = [
                'title' => __( 'The MCP Adapter\'s default server is switched off', 'dokan-lite' ),
                'text'  => __( 'Something on this site disables it through the mcp_adapter_create_default_server filter. Dokan\'s tools are only reachable through that server.', 'dokan-lite' ),
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
     * @param array $summary Output of {@see self::summary()}.
     *
     * @return string
     */
    public static function connector_description( array $summary ): string {
        $who   = $summary['vendor_access']
            ? __( 'Vendors use the same URL with their own login.', 'dokan-lite' )
            : __( 'Only store admins can connect while vendor access is off.', 'dokan-lite' );
        $state = $summary['live']
            ? __( 'Live', 'dokan-lite' )
            : __( 'Off', 'dokan-lite' );

        return __( 'Add this to the assistant as an HTTP MCP server, signed in with HTTP Basic authentication. The same tools are also reachable through the adapter\'s default server, behind its discover-abilities tool.', 'dokan-lite' ) . ' ' . $who . ' (' . $state . ')';
    }

    /**
     * How an assistant signs in, unescaped: one sentence for both settings screens.
     *
     * @since DOKAN_SINCE
     *
     * @param array $summary Output of {@see self::summary()}.
     *
     * @return string
     */
    public static function sign_in_text( array $summary ): string {
        $parts = [ __( 'Assistants sign in with a WordPress application password', 'dokan-lite' ) ];

        if ( $summary['vendor_access'] ) {
            $parts[] = __( 'Vendors: create theirs under Users › Edit', 'dokan-lite' );
        }

        return implode( ' | ', $parts );
    }

    /**
     * Where a user creates an application password for themselves.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function application_passwords_url(): string {
        return admin_url( 'profile.php#application-passwords-section' );
    }
}
