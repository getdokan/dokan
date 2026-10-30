<?php

namespace WeDevs\Dokan\Abilities\Mcp;

defined( 'ABSPATH' ) || exit;

/**
 * Everything the admin settings screens need to describe the MCP server and how to connect.
 *
 * Both settings UIs (the plugin-ui schema and the legacy fields) read this one snapshot and the
 * same copy, so the two screens never disagree.
 *
 * @since DOKAN_SINCE
 */
class Status {

    /**
     * The server as the settings screens see it.
     *
     * @since DOKAN_SINCE
     *
     * @return array{enabled:bool,vendor_access:bool,adapter_available:bool,live:bool,https:bool,endpoint:string,tools:int}
     */
    public static function summary(): array {
        $enabled   = Access::is_enabled();
        $available = Server::adapter_available();

        return [
            'enabled'           => $enabled,
            'vendor_access'     => Access::vendor_access_enabled(),
            'adapter_available' => $available,
            'live'              => $enabled && $available,
            'https'             => wc_site_is_https(),
            'endpoint'          => Access::endpoint(),
            'tools'             => $enabled ? Catalog::tool_count() : 0,
        ];
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
            'intro'         => __( 'Connect assistants such as Claude Code, Claude Desktop or Cursor to your marketplace through the Model Context Protocol.', 'dokan-lite' ),
            'enabled'       => __( 'Run the Dokan MCP server so connected assistants can read and manage products and orders.', 'dokan-lite' ),
            'vendor_access' => __( 'Vendors and their staff can connect an assistant with an application password of their own. Each connection only reaches that vendor\'s own store.', 'dokan-lite' ),
        ];
    }

    /**
     * Why the server cannot be used yet, if anything: a title and a sentence per problem, unescaped.
     *
     * @since DOKAN_SINCE
     *
     * @param array $summary Output of {@see self::summary()}.
     *
     * @return array<string, array{title:string,text:string}> Keyed `adapter` and/or `https`.
     */
    public static function warnings( array $summary ): array {
        $warnings = [];

        if ( ! $summary['adapter_available'] ) {
            $warnings['adapter'] = [
                'title' => __( 'The MCP adapter is not available', 'dokan-lite' ),
                'text'  => __( 'It ships with WooCommerce 10.9 or newer. Update WooCommerce to run the server.', 'dokan-lite' ),
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
     * "N available actions", unescaped.
     *
     * @since DOKAN_SINCE
     *
     * @param int $tools Number of tools.
     *
     * @return string
     */
    public static function tool_count_label( int $tools ): string {
        /* translators: %d: number of tools. */
        return sprintf( _n( '%d available action', '%d available actions', $tools, 'dokan-lite' ), $tools );
    }

    /**
     * What to do with the connector URL, unescaped: how to use it, who may, then the server state in brackets.
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
            ? self::tool_count_label( $summary['tools'] )
            : __( 'The server is off', 'dokan-lite' );

        return __( 'Add this to the assistant as an HTTP MCP server, signed in with HTTP Basic authentication.', 'dokan-lite' ) . ' ' . $who . ' (' . $state . ')';
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
        $parts = [ __( 'Assistants sign in with an application password', 'dokan-lite' ) ];

        if ( $summary['vendor_access'] ) {
            $parts[] = __( 'Vendors: create theirs under Users › Edit', 'dokan-lite' );
        }

        $parts[] = __( 'A Read/Write WooCommerce key works too', 'dokan-lite' );

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
