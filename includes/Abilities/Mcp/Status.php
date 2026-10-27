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
     * What to do with the connector URL, unescaped.
     *
     * @since DOKAN_SINCE
     *
     * @param array $summary Output of {@see self::summary()}.
     *
     * @return string
     */
    public static function connector_description( array $summary ): string {
        $who = $summary['vendor_access']
            ? __( 'Vendors use the same URL with their own login.', 'dokan-lite' )
            : __( 'Only store admins can connect while vendor access is off.', 'dokan-lite' );

        return __( 'Add this to the assistant as an HTTP MCP server, signed in with HTTP Basic authentication.', 'dokan-lite' ) . ' ' . $who;
    }

    /**
     * The Claude Code CLI line that adds the server, with the credential left for the user to fill in.
     *
     * @since DOKAN_SINCE
     *
     * @param string $endpoint The MCP endpoint URL.
     *
     * @return string
     */
    public static function claude_code_command( string $endpoint ): string {
        return sprintf( 'claude mcp add --transport http dokan %s --header "Authorization: Basic $(printf %%s \'USERNAME:APPLICATION PASSWORD\' | base64)"', $endpoint );
    }

    /**
     * How an assistant signs in with a WordPress application password, as escaped HTML.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function application_password_html(): string {
        $profile = sprintf( '<a href="%1$s">%2$s</a>', esc_url( admin_url( 'profile.php#application-passwords-section' ) ), esc_html__( 'Profile › Application Passwords', 'dokan-lite' ) );
        $lines   = [
            /* translators: %s: link to the profile screen. */
            sprintf( esc_html__( 'Create an application password for your account under %s, then give the assistant your username and that password.', 'dokan-lite' ), $profile ),
            esc_html__( 'Works with any assistant that can send a username and password (HTTP Basic authentication), such as Claude Code, Cursor or Claude Desktop.', 'dokan-lite' ),
        ];

        if ( ! wp_is_application_passwords_available() ) {
            $lines[] = '<strong>' . esc_html__( 'WordPress only accepts application passwords over HTTPS, so none will work on this site yet.', 'dokan-lite' ) . '</strong>';
        }

        return implode( '<br>', $lines );
    }

    /**
     * How a vendor or staff member gets an application password, as escaped HTML.
     *
     * Dokan keeps vendors out of wp-admin and adds nothing for this: WordPress lets an
     * administrator add application passwords to any user's profile, so the store admin issues theirs.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function vendor_password_html(): string {
        $users = sprintf( '<a href="%1$s">%2$s</a>', esc_url( admin_url( 'users.php' ) ), esc_html__( 'Users › Edit', 'dokan-lite' ) );

        /* translators: %s: link to the users list. */
        return sprintf( esc_html__( 'A vendor\'s or staff member\'s password is created by the store admin on that user\'s profile (%s › Application Passwords) and handed to them.', 'dokan-lite' ), $users );
    }

    /**
     * How a store owner signs in with a WooCommerce REST API key, as escaped HTML.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function api_key_html(): string {
        $keys = sprintf( '<a href="%1$s">%2$s</a>', esc_url( admin_url( 'admin.php?page=wc-settings&tab=advanced&section=keys' ) ), esc_html__( 'WooCommerce › Settings › Advanced › REST API', 'dokan-lite' ) );

        /* translators: %s: link to the WooCommerce REST API keys screen. */
        return sprintf( esc_html__( 'A WooCommerce REST API key with Read/Write permissions, created under %s, also works: the consumer key is the username and the consumer secret is the password. A Read-only key cannot be used, because every MCP request is a POST.', 'dokan-lite' ), $keys );
    }
}
