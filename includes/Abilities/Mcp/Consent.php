<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Contracts\Hookable;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * The browser consent page of the OAuth flow, plus the `/.well-known/` discovery documents.
 *
 * Both are served from `parse_request` rather than as REST routes. A REST route only honours
 * cookie authentication when a REST nonce comes with it, and a browser coming back from
 * `wp-login.php` carries the cookie and no nonce: the consent screen would bounce to login
 * forever. Matching the request path here also needs no rewrite rule and no flush.
 *
 * @since DOKAN_SINCE
 */
class Consent implements Hookable {

    /**
     * Pretty path of the consent page beneath the site root.
     *
     * @since DOKAN_SINCE
     */
    const PATH = 'dokan-mcp/authorize';

    /**
     * Query var marking a request for the consent page, for sites without pretty permalinks.
     *
     * @since DOKAN_SINCE
     */
    const QUERY_VAR = 'dokan_mcp_authorize';

    /**
     * Nonce action for the consent form.
     *
     * @since DOKAN_SINCE
     */
    const NONCE = 'dokan_mcp_consent';

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'query_vars', [ $this, 'register_query_var' ] );
        add_action( 'parse_request', [ $this, 'maybe_handle' ], 1 );
    }

    /**
     * The browser-facing consent page URL.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function authorize_url(): string {
        if ( get_option( 'permalink_structure' ) ) {
            return home_url( '/' . self::PATH . '/' );
        }

        return add_query_arg( self::QUERY_VAR, '1', home_url( '/' ) );
    }

    /**
     * Let WordPress carry the consent query var.
     *
     * @since DOKAN_SINCE
     *
     * @param array $vars Registered query vars.
     *
     * @return array
     */
    public function register_query_var( $vars ) {
        $vars[] = self::QUERY_VAR;

        return $vars;
    }

    /**
     * Answer the consent page and the discovery documents, short-circuiting WordPress.
     *
     * @since DOKAN_SINCE
     *
     * @param \WP $wp Current WordPress environment.
     *
     * @return void
     */
    public function maybe_handle( $wp ): void {
        $path = isset( $wp->request ) ? trim( (string) $wp->request, '/' ) : '';
        $vars = isset( $wp->query_vars ) && is_array( $wp->query_vars ) ? $wp->query_vars : [];

        $document = self::discovery_document_for( $path );

        if ( '' !== $document ) {
            $this->emit_discovery( $document );
        }

        if ( self::PATH === $path || ! empty( $vars[ self::QUERY_VAR ] ) ) {
            $this->handle_authorize_page();
        }
    }

    /**
     * Which discovery document a request path asks for, if any.
     *
     * Serves the RFC 8414 / RFC 9728 path-insert forms for the MCP endpoint, e.g.
     * `/.well-known/oauth-authorization-server/wp-json/dokan/mcp`.
     *
     * @since DOKAN_SINCE
     *
     * @param string $path Request path relative to the site root.
     *
     * @return string `protected-resource`, `authorization-server`, or '' for none.
     */
    public static function discovery_document_for( string $path ): string {
        if ( '' === $path || 0 !== strpos( $path, '.well-known/' ) ) {
            return '';
        }

        $resource = trim( (string) wp_parse_url( Access::endpoint(), PHP_URL_PATH ), '/' );
        $home     = trim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );

        // `$wp->request` is relative to the site root, the REST path is not.
        if ( '' !== $home && 0 === strpos( $resource, $home . '/' ) ) {
            $resource = substr( $resource, strlen( $home ) + 1 );
        }

        if ( '' === $resource ) {
            return '';
        }

        $documents = [
            '.well-known/oauth-protected-resource/' . $resource   => 'protected-resource',
            '.well-known/oauth-authorization-server/' . $resource => 'authorization-server',
            '.well-known/openid-configuration/' . $resource       => 'authorization-server',
        ];

        return $documents[ $path ] ?? '';
    }

    /**
     * Serve one discovery document and stop.
     *
     * @since DOKAN_SINCE
     *
     * @param string $document `protected-resource` or `authorization-server`.
     *
     * @return void
     */
    private function emit_discovery( string $document ): void {
        if ( ! Access::is_enabled() ) {
            $this->emit_json( [ 'error' => 'not_found' ], 404 );
        }

        $body = 'protected-resource' === $document ? OAuth::protected_resource_metadata() : OAuth::authorization_server_metadata();

        $this->emit_json( $body, 200, [ 'Cache-Control' => 'public, max-age=3600' ] );
    }

    /**
     * The consent page, GET and POST.
     *
     * The order of the checks is the point: the master switch first, then login, then the OAuth
     * parameters, so someone who is not logged in learns nothing about registered clients.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    private function handle_authorize_page(): void {
        if ( ! Access::is_enabled() ) {
            $this->emit_page( __( 'Not available', 'dokan-lite' ), __( 'AI assistant connections are switched off on this marketplace.', 'dokan-lite' ), 404 );
        }

        if ( ! is_user_logged_in() ) {
            wp_safe_redirect( wp_login_url( $this->current_authorize_url() ) );
            exit;
        }

        if ( ! Access::user_can_connect( get_current_user_id() ) ) {
            $this->emit_page( __( 'Not allowed', 'dokan-lite' ), __( 'Your account cannot connect an AI assistant to this marketplace.', 'dokan-lite' ), 403 );
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- OAuth parameters, validated below; the form POST is nonce-checked separately.
        $params  = wp_unslash( $_GET );
        $params  = is_array( $params ) ? array_map( 'strval', array_filter( $params, 'is_scalar' ) ) : [];
        $request = OAuth::validate_authorize_request( $params );

        if ( is_wp_error( $request ) ) {
            $this->refuse_authorize( $request, $params );
        }

        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- compared as a literal.
        $method = isset( $_SERVER['REQUEST_METHOD'] ) ? strtoupper( (string) wp_unslash( $_SERVER['REQUEST_METHOD'] ) ) : 'GET';

        if ( 'POST' === $method ) {
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- verified on the next line.
            $posted = wp_unslash( $_POST );
            $nonce  = isset( $posted['_dokan_mcp_nonce'] ) ? (string) $posted['_dokan_mcp_nonce'] : '';

            if ( ! wp_verify_nonce( $nonce, self::NONCE ) ) {
                $this->emit_page( __( 'Expired', 'dokan-lite' ), __( 'That approval form has expired. Start the connection again from your AI client.', 'dokan-lite' ), 403 );
            }

            if ( empty( $posted['approve'] ) ) {
                $this->redirect_back(
                    $request['redirect_uri'],
                    [
                        'error' => 'access_denied',
                        'state' => $request['state'],
                    ]
                );
            }

            $this->redirect_back(
                $request['redirect_uri'],
                [
                    'code'  => OAuth::issue_code( $request, get_current_user_id() ),
                    'state' => $request['state'],
                ]
            );
        }

        $this->emit_consent_screen( $request );
    }

    /**
     * This request's own URL, rebuilt from the authorize URL plus the query string so a crafted
     * `REQUEST_URI` can never turn the login round-trip into an off-site redirect.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    private function current_authorize_url(): string {
        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- parsed for its query string only.
        $uri   = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
        $query = (string) wp_parse_url( $uri, PHP_URL_QUERY );
        $url   = self::authorize_url();

        if ( '' === $query ) {
            return $url;
        }

        return $url . ( false === strpos( $url, '?' ) ? '?' : '&' ) . $query;
    }

    /**
     * Refuse an `/authorize` request, redirecting only where that is safe.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_Error $error  Why it was refused.
     * @param array    $params The original query parameters.
     *
     * @return void
     */
    private function refuse_authorize( WP_Error $error, array $params ): void {
        $data = (array) $error->get_error_data();

        // Only a request that already matched a registered client and one of its redirect URIs may be answered by redirect.
        if ( ! empty( $data['redirectable'] ) && isset( $params['redirect_uri'] ) ) {
            $this->redirect_back(
                (string) $params['redirect_uri'],
                [
                    'error'             => $error->get_error_code(),
                    'error_description' => $error->get_error_message(),
                    'state'             => isset( $params['state'] ) ? (string) $params['state'] : '',
                ]
            );
        }

        $this->emit_page( __( 'Connection refused', 'dokan-lite' ), $error->get_error_message(), 400 );
    }

    /**
     * Send the browser back to the client's callback.
     *
     * `wp_redirect()`, not `wp_safe_redirect()`: the destination is an off-site callback already
     * matched against the client's registered list, which is the check that matters here.
     *
     * @since DOKAN_SINCE
     *
     * @param string $redirect_uri Validated callback.
     * @param array  $args         Query arguments to add.
     *
     * @return void
     */
    private function redirect_back( string $redirect_uri, array $args ): void {
        $args = array_filter(
            $args,
            static function ( $value ): bool {
                return '' !== $value && null !== $value;
            }
        );

        // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- an OAuth callback, matched against the client's registered redirect_uris.
        wp_redirect( add_query_arg( array_map( 'rawurlencode', $args ), $redirect_uri ) );
        exit;
    }

    /**
     * Draw the consent screen: self-contained markup, no theme, works with scripts off.
     *
     * @since DOKAN_SINCE
     *
     * @param array $request Validated authorize request.
     *
     * @return void
     */
    private function emit_consent_screen( array $request ): void {
        $identity = OAuth::callback_identity( $request['redirect_uri'] );
        $user     = wp_get_current_user();
        $writes   = ! OAuth::scope_is_read_only( $request['scope'] );
        $is_admin = 'admin' === Access::role_of( $user->ID );

        $lines = [
            $is_admin
                ? __( 'Read products, orders, balances and payout requests of every store', 'dokan-lite' )
                : __( 'Read the products, orders, balance and payout requests of your store', 'dokan-lite' ),
        ];

        if ( $writes ) {
            $lines[] = $is_admin
                ? __( 'Create and update products, change order status and add order notes, in any store', 'dokan-lite' )
                : __( 'Create and update your products, change your order status and add order notes', 'dokan-lite' );
        }

        $this->page_headers( 200 );
        ?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="referrer" content="no-referrer" />
    <title><?php esc_html_e( 'Connect an AI assistant', 'dokan-lite' ); ?></title>
    <style>
        :root { color-scheme: light; }
        body { margin: 0; padding: 48px 16px; background: #f9fafb; color: #111827; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .box { max-width: 460px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
        h1 { margin: 0 0 8px; font-size: 20px; line-height: 1.4; }
        p { margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #4b5563; }
        ul { margin: 0 0 20px; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #374151; }
        .host { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; background: #f3f4f6; border-radius: 6px; padding: 2px 6px; }
        .warn { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; font-size: 13px; color: #92400e; margin-bottom: 20px; }
        .actions { display: flex; gap: 12px; }
        button { flex: 1; font-size: 14px; font-weight: 500; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
        .approve { background: #7047eb; color: #fff; border: 1px solid #7047eb; }
        .deny { background: #fff; color: #374151; border: 1px solid #d1d5db; }
        .who { font-size: 13px; color: #6b7280; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="box">
        <h1><?php echo esc_html( sprintf( /* translators: %s: application name or host. */ __( 'Connect %s to your marketplace?', 'dokan-lite' ), $identity['label'] ) ); ?></h1>

        <p>
            <?php esc_html_e( 'It will send requests to', 'dokan-lite' ); ?>
            <span class="host"><?php echo esc_html( $identity['host'] ); ?></span>
        </p>

        <?php if ( ! $identity['trusted'] ) : ?>
            <div class="warn">
                <?php esc_html_e( 'This callback is not an application Dokan recognises, and it is not encrypted. Only continue if you started this connection yourself.', 'dokan-lite' ); ?>
            </div>
        <?php endif; ?>

        <p><?php esc_html_e( 'If you approve, it will be able to:', 'dokan-lite' ); ?></p>

        <ul>
            <?php foreach ( $lines as $line ) : ?>
                <li><?php echo esc_html( $line ); ?></li>
            <?php endforeach; ?>
        </ul>

        <p><?php esc_html_e( 'It acts as you, so it can never do more than your own account can. You can revoke it at any time.', 'dokan-lite' ); ?></p>

        <form method="post">
            <?php wp_nonce_field( self::NONCE, '_dokan_mcp_nonce' ); ?>
            <div class="actions">
                <button type="submit" name="deny" value="1" class="deny"><?php esc_html_e( 'Cancel', 'dokan-lite' ); ?></button>
                <button type="submit" name="approve" value="1" class="approve"><?php esc_html_e( 'Approve', 'dokan-lite' ); ?></button>
            </div>
        </form>

        <p class="who">
            <?php echo esc_html( sprintf( /* translators: %s: user display name. */ __( 'Signed in as %s', 'dokan-lite' ), $user->display_name ) ); ?>
        </p>
    </div>
</body>
</html>
        <?php
        exit;
    }

    /**
     * A minimal page for the refusals that cannot redirect.
     *
     * @since DOKAN_SINCE
     *
     * @param string $title   Page heading.
     * @param string $message What happened.
     * @param int    $status  HTTP status.
     *
     * @return void
     */
    private function emit_page( string $title, string $message, int $status ): void {
        $this->page_headers( $status );

        printf(
            '<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="referrer" content="no-referrer" /><title>%1$s</title></head>'
            . '<body style="margin:0;padding:48px 16px;background:#f9fafb;color:#111827;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif">'
            . '<div style="max-width:460px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:32px">'
            . '<h1 style="margin:0 0 8px;font-size:20px">%1$s</h1><p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563">%2$s</p>'
            . '</div></body></html>',
            esc_html( $title ),
            esc_html( $message )
        );

        exit;
    }

    /**
     * Headers every consent-flow page carries.
     *
     * @since DOKAN_SINCE
     *
     * @param int $status HTTP status.
     *
     * @return void
     */
    private function page_headers( int $status ): void {
        status_header( $status );
        nocache_headers();

        header( 'Content-Type: text/html; charset=utf-8' );
        header( 'Cache-Control: no-store' );
        header( 'X-Frame-Options: DENY' );
        header( 'Referrer-Policy: no-referrer' );
    }

    /**
     * Write a JSON body with headers and stop.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $data    Body to encode.
     * @param int   $status  HTTP status.
     * @param array $headers Extra headers.
     *
     * @return void
     */
    private function emit_json( $data, int $status, array $headers = [] ): void {
        status_header( $status );
        header( 'Content-Type: application/json; charset=utf-8', true, $status );

        foreach ( $headers as $name => $value ) {
            header( $name . ': ' . $value, true, $status );
        }

        echo wp_json_encode( $data );
        exit;
    }
}
