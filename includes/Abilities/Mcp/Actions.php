<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Contracts\Hookable;

defined( 'ABSPATH' ) || exit;

/**
 * The settings-screen actions on a connection: create / rotate / revoke the personal token,
 * revoke a connected app.
 *
 * Plain nonced `admin-post.php` links, so both settings UIs can offer them with their ordinary
 * field types and no custom widgets. The screens also show connection data in display-only
 * fields; this class keeps those values out of the saved settings.
 *
 * @since DOKAN_SINCE
 */
class Actions implements Hookable {

    /**
     * The `admin-post.php` action name.
     *
     * @since DOKAN_SINCE
     */
    const ACTION = 'dokan_mcp';

    /**
     * Nonce action.
     *
     * @since DOKAN_SINCE
     */
    const NONCE = 'dokan_mcp_action';

    /**
     * New-UI field ids whose values are display-only and never stored.
     *
     * @since DOKAN_SINCE
     */
    const DISPLAY_FIELDS = [ 'mcp_server_status', 'mcp_connector_url', 'mcp_personal_token', 'mcp_token_cli', 'mcp_token_json', 'mcp_connected_apps', 'mcp_adapter_notice', 'mcp_https_notice', 'mcp_token_notice' ];

    /**
     * Legacy field names whose values are display-only and never stored.
     *
     * @since DOKAN_SINCE
     */
    const LEGACY_DISPLAY_FIELDS = [ 'dokan_mcp_status', 'dokan_mcp_connector_url', 'dokan_mcp_token', 'dokan_mcp_apps' ];

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'admin_post_' . self::ACTION, [ $this, 'handle' ] );
        add_filter( 'dokan_admin_settings_pre_save', [ $this, 'strip_display_values' ] );
        add_filter( 'dokan_save_settings_value', [ $this, 'strip_legacy_display_values' ], 10, 2 );
    }

    /**
     * A nonced action link.
     *
     * @since DOKAN_SINCE
     *
     * @param string $action   `rotate_token`, `revoke_token` or `revoke_app`.
     * @param string $redirect Admin URL to return to.
     * @param array  $args     Extra query arguments.
     *
     * @return string
     */
    public static function url( string $action, string $redirect, array $args = [] ): string {
        $args = array_merge(
            $args,
            [
                'action'      => self::ACTION,
                'do'          => $action,
                'redirect_to' => $redirect,
            ]
        );

        return wp_nonce_url( add_query_arg( array_map( 'rawurlencode', $args ), admin_url( 'admin-post.php' ) ), self::NONCE );
    }

    /**
     * Run the requested action and return to the settings screen.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function handle(): void {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( esc_html__( 'You are not allowed to manage AI assistant connections.', 'dokan-lite' ), '', [ 'response' => 403 ] );
        }

        check_admin_referer( self::NONCE );

        $do        = isset( $_GET['do'] ) ? sanitize_key( wp_unslash( $_GET['do'] ) ) : '';
        $client_id = isset( $_GET['client_id'] ) ? sanitize_text_field( wp_unslash( $_GET['client_id'] ) ) : '';
        $redirect  = isset( $_GET['redirect_to'] ) ? esc_url_raw( wp_unslash( $_GET['redirect_to'] ) ) : '';

        switch ( $do ) {
            case 'rotate_token':
                Tokens::mint( get_current_user_id() );
                break;

            case 'revoke_token':
                Tokens::revoke( get_current_user_id() );
                break;

            case 'revoke_app':
                if ( '' !== $client_id ) {
                    OAuth::revoke_client( $client_id );
                }
                break;
        }

        // An off-site `redirect_to` falls back to the admin home.
        wp_safe_redirect( '' !== $redirect ? $redirect : admin_url( 'admin.php?page=dokan-dashboard' ) );
        exit;
    }

    /**
     * Keep the display-only fields of the new settings UI out of `dokan_admin_settings`.
     *
     * The screen sends every field of the page on save, including the token it was shown.
     *
     * @since DOKAN_SINCE
     *
     * @param array $slice Values about to be stored.
     *
     * @return array
     */
    public function strip_display_values( $slice ) {
        if ( ! is_array( $slice ) ) {
            return $slice;
        }

        foreach ( self::DISPLAY_FIELDS as $id ) {
            unset( $slice[ $id ] );
        }

        return $slice;
    }

    /**
     * Keep the display-only fields of the legacy settings UI out of the `dokan_ai` row.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $values  Section values about to be stored.
     * @param string $section Section id.
     *
     * @return array
     */
    public function strip_legacy_display_values( $values, $section ) {
        if ( Access::SETTING_SECTION !== $section || ! is_array( $values ) ) {
            return $values;
        }

        foreach ( self::LEGACY_DISPLAY_FIELDS as $name ) {
            unset( $values[ $name ] );
        }

        return $values;
    }
}
