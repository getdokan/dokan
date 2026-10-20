<?php

namespace WeDevs\Dokan\Abilities\Mcp;

defined( 'ABSPATH' ) || exit;

/**
 * Everything the admin settings screens need to describe the MCP connection of one user.
 *
 * Both settings UIs (the plugin-ui schema and the legacy fields) read this one snapshot, so the
 * two screens never disagree about what is connected.
 *
 * @since DOKAN_SINCE
 */
class Status {

    /**
     * The connection as the settings screens see it.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id The user looking at the screen; their personal token is reported.
     *
     * @return array
     */
    public static function summary( int $user_id ): array {
        $enabled = Access::is_enabled();
        $user    = get_userdata( $user_id );
        $apps    = OAuth::connected_apps();
        $token   = Tokens::public_status( $user_id );

        $last_used = $token['last_used'];

        foreach ( $apps as $app ) {
            $last_used = max( $last_used, (int) $app['last_used'] );
        }

        return [
            'enabled'           => $enabled,
            'vendor_access'     => Access::vendor_access_enabled(),
            'adapter_available' => Server::adapter_available(),
            'live'              => $enabled && Server::adapter_available(),
            'https'             => 'https' === wp_parse_url( home_url(), PHP_URL_SCHEME ),
            'endpoint'          => Access::endpoint(),
            'authorize_url'     => Consent::authorize_url(),
            'tools'             => $enabled ? Catalog::tool_count() : 0,
            'token'             => $token,
            'apps'              => $apps,
            'last_used'         => $last_used,
            'user'              => [
                'id'           => $user_id,
                'display_name' => $user ? (string) $user->display_name : '',
            ],
        ];
    }

    /**
     * A unix timestamp as the screens print it, or "Never".
     *
     * @since DOKAN_SINCE
     *
     * @param int $timestamp Unix timestamp, 0 for never.
     *
     * @return string
     */
    public static function format_date( int $timestamp ): string {
        if ( $timestamp <= 0 ) {
            return __( 'Never', 'dokan-lite' );
        }

        return wp_date( get_option( 'date_format' ), $timestamp );
    }

    /**
     * The role label shown next to who approved an app.
     *
     * @since DOKAN_SINCE
     *
     * @param string $role One of `admin`, `vendor`, `staff`, `none`.
     *
     * @return string
     */
    public static function role_label( string $role ): string {
        switch ( $role ) {
            case 'admin':
                return __( 'Store admin', 'dokan-lite' );
            case 'vendor':
                return __( 'Vendor', 'dokan-lite' );
            case 'staff':
                return __( 'Vendor staff', 'dokan-lite' );
            default:
                return __( 'Unknown role', 'dokan-lite' );
        }
    }

    /**
     * One line summarising activity: actions, apps, last use.
     *
     * @since DOKAN_SINCE
     *
     * @param array $summary Output of {@see self::summary()}.
     *
     * @return string
     */
    public static function activity_line( array $summary ): string {
        return sprintf(
            /* translators: 1: number of tools, 2: number of connected apps, 3: date. */
            __( '%1$d available actions · %2$d connected apps · Last activity: %3$s', 'dokan-lite' ),
            (int) $summary['tools'],
            count( $summary['apps'] ),
            self::format_date( (int) $summary['last_used'] )
        );
    }

    /**
     * The connected apps as an HTML list for the settings screens, with a revoke link each.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $apps     Output of {@see OAuth::connected_apps()}.
     * @param string $redirect Where the revoke action returns to.
     * @param bool   $table    A table (new settings UI), or inline lines for the legacy `html` field.
     *
     * @return string Escaped HTML.
     */
    public static function apps_html( array $apps, string $redirect, bool $table = true ): string {
        if ( empty( $apps ) ) {
            $empty = esc_html__( 'No apps connected yet. When someone approves an AI assistant, it appears here.', 'dokan-lite' );

            return $table ? '<p>' . $empty . '</p>' : $empty;
        }

        if ( ! $table ) {
            return implode( '<br>', array_map( [ self::class, 'app_line' ], $apps, array_fill( 0, count( $apps ), $redirect ) ) );
        }

        $rows = '';

        foreach ( $apps as $app ) {
            $rows .= sprintf(
                '<tr><td><strong>%1$s</strong><br><small>%2$s</small></td><td>%3$s</td><td>%4$s</td><td>%5$s</td><td><a href="%6$s">%7$s</a></td></tr>',
                esc_html( $app['name'] ),
                esc_html( implode( ', ', $app['redirect_uris'] ) ),
                $app['read_only'] ? esc_html__( 'Read only', 'dokan-lite' ) : esc_html__( 'Read and write', 'dokan-lite' ),
                esc_html( sprintf( '%1$s (%2$s)', '' !== $app['user_name'] ? $app['user_name'] : __( 'a deleted user', 'dokan-lite' ), self::role_label( $app['user_role'] ) ) ),
                esc_html( self::format_date( (int) $app['last_used'] ) ),
                esc_url( Actions::url( 'revoke_app', $redirect, [ 'client_id' => $app['client_id'] ] ) ),
                esc_html__( 'Revoke', 'dokan-lite' )
            );
        }

        return sprintf(
            '<table><thead><tr><th>%1$s</th><th>%2$s</th><th>%3$s</th><th>%4$s</th><th></th></tr></thead><tbody>%5$s</tbody></table>',
            esc_html__( 'App', 'dokan-lite' ),
            esc_html__( 'Access', 'dokan-lite' ),
            esc_html__( 'Approved by', 'dokan-lite' ),
            esc_html__( 'Last used', 'dokan-lite' ),
            $rows
        );
    }

    /**
     * One connected app as a single line, for the legacy screen.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $app      One entry of {@see OAuth::connected_apps()}.
     * @param string $redirect Where the revoke action returns to.
     *
     * @return string Escaped HTML.
     */
    private static function app_line( array $app, string $redirect ): string {
        return sprintf(
            /* translators: 1: app name, 2: access level, 3: callback host(s), 4: approver, 5: date, 6: revoke link. */
            esc_html__( '%1$s (%2$s) · %3$s · Approved by %4$s · Last used: %5$s · %6$s', 'dokan-lite' ),
            '<strong>' . esc_html( $app['name'] ) . '</strong>',
            $app['read_only'] ? esc_html__( 'read only', 'dokan-lite' ) : esc_html__( 'read and write', 'dokan-lite' ),
            esc_html( implode( ', ', $app['redirect_uris'] ) ),
            esc_html( sprintf( '%1$s (%2$s)', '' !== $app['user_name'] ? $app['user_name'] : __( 'a deleted user', 'dokan-lite' ), self::role_label( $app['user_role'] ) ) ),
            esc_html( self::format_date( (int) $app['last_used'] ) ),
            sprintf( '<a href="%1$s">%2$s</a>', esc_url( Actions::url( 'revoke_app', $redirect, [ 'client_id' => $app['client_id'] ] ) ), esc_html__( 'Revoke', 'dokan-lite' ) )
        );
    }
}
