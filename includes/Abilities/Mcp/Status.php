<?php

namespace WeDevs\Dokan\Abilities\Mcp;

defined( 'ABSPATH' ) || exit;

/**
 * Everything the admin settings screens need to describe the MCP server and how to connect.
 *
 * Both settings UIs (the plugin-ui schema and the legacy fields) read this one snapshot, so the
 * two screens never disagree.
 *
 * @since DOKAN_SINCE
 */
class Status {

    /**
     * The server as the settings screens see it.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function summary(): array {
        $enabled = Access::is_enabled();

        return [
            'enabled'               => $enabled,
            'vendor_access'         => Access::vendor_access_enabled(),
            'adapter_available'     => Server::adapter_available(),
            'live'                  => $enabled && Server::adapter_available(),
            'https'                 => 'https' === wp_parse_url( home_url(), PHP_URL_SCHEME ),
            'endpoint'              => Access::endpoint(),
            'tools'                 => $enabled ? Catalog::tool_count() : 0,
            'application_passwords' => wp_is_application_passwords_available(),
            'profile_url'           => admin_url( 'profile.php#application-passwords-section' ),
            'authorize_url'         => admin_url( 'authorize-application.php' ),
            'api_keys_url'          => admin_url( 'admin.php?page=wc-settings&tab=advanced&section=keys' ),
        ];
    }

    /**
     * One line summarising what a connection gets.
     *
     * @since DOKAN_SINCE
     *
     * @param array $summary Output of {@see self::summary()}.
     *
     * @return string
     */
    public static function activity_line( array $summary ): string {
        $tools = (int) $summary['tools'];

        /* translators: %d: number of tools. */
        return sprintf( _n( '%d available action', '%d available actions', $tools, 'dokan-lite' ), $tools );
    }

    /**
     * The Claude Code CLI line that adds the server, with the credential left for the user to fill in.
     *
     * @since DOKAN_SINCE
     *
     * @param array $summary Output of {@see self::summary()}.
     *
     * @return string
     */
    public static function claude_code_command( array $summary ): string {
        return sprintf( 'claude mcp add --transport http dokan %s --header "Authorization: Basic $(printf %%s \'USERNAME:APPLICATION PASSWORD\' | base64)"', $summary['endpoint'] );
    }

    /**
     * How an assistant signs in with a WordPress application password, as escaped HTML for both
     * settings screens.
     *
     * @since DOKAN_SINCE
     *
     * @param array $summary Output of {@see self::summary()}.
     * @param bool  $inline  Include the vendor approval link and the CLI line in the text (the legacy
     *                       screen); the new UI shows them as copy fields instead.
     *
     * @return string
     */
    public static function application_password_html( array $summary, bool $inline = true ): string {
        $lines = [
            sprintf(
                /* translators: %s: link to the profile screen. */
                esc_html__( 'Create an application password for your account under %s, then give the assistant your username and that password.', 'dokan-lite' ),
                sprintf( '<a href="%1$s">%2$s</a>', esc_url( $summary['profile_url'] ), esc_html__( 'Profile › Application Passwords', 'dokan-lite' ) )
            ),
        ];

        if ( $inline && $summary['vendor_access'] ) {
            $lines[] = sprintf(
                /* translators: %s: URL of the WordPress application-password approval screen. */
                esc_html__( 'Vendors create theirs on the approval screen at %s; share that link with them. A staff member\'s password is created by the store admin on that user\'s profile.', 'dokan-lite' ),
                '<code>' . esc_html( $summary['authorize_url'] ) . '</code>'
            );
        }

        $lines[] = esc_html__( 'Works with any assistant that can send a username and password (HTTP Basic authentication), such as Claude Code, Cursor or Claude Desktop.', 'dokan-lite' );

        if ( $inline ) {
            $lines[] = esc_html__( 'For Claude Code:', 'dokan-lite' ) . '<br><code>' . esc_html( self::claude_code_command( $summary ) ) . '</code>';
        }

        if ( ! $summary['application_passwords'] ) {
            $lines[] = '<strong>' . esc_html__( 'WordPress only accepts application passwords over HTTPS, so none will work on this site yet.', 'dokan-lite' ) . '</strong>';
        }

        return implode( '<br>', $lines );
    }

    /**
     * How a store owner signs in with a WooCommerce REST API key, as escaped HTML for both
     * settings screens.
     *
     * @since DOKAN_SINCE
     *
     * @param array $summary Output of {@see self::summary()}.
     *
     * @return string
     */
    public static function api_key_html( array $summary ): string {
        return sprintf(
            /* translators: %s: link to the WooCommerce REST API keys screen. */
            esc_html__( 'A WooCommerce REST API key with Read/Write permissions, created under %s, also works: the consumer key is the username and the consumer secret is the password. A Read-only key cannot be used, because every MCP request is a POST.', 'dokan-lite' ),
            sprintf( '<a href="%1$s">%2$s</a>', esc_url( $summary['api_keys_url'] ), esc_html__( 'WooCommerce › Settings › Advanced › REST API', 'dokan-lite' ) )
        );
    }
}
