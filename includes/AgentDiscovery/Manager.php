<?php

namespace WeDevs\Dokan\AgentDiscovery;

class Manager {

    const QUERY_VAR_LLMS   = 'dokan_llms_txt';
    const QUERY_VAR_POLICY = 'dokan_ai_policy';
    const CACHE_KEY_LLMS   = 'dokan_llms_txt_body';
    const CACHE_KEY_POLICY = 'dokan_ai_policy_body';
    const CACHE_TTL        = 6 * HOUR_IN_SECONDS;
    const CRON_HOOK        = 'dokan_agent_discovery_refresh';
    const REWRITE_FLAG     = 'dokan_agent_discovery_rewrites_v1';

    private $data;
    private $llms;
    private $policy;

    public function __construct() {
        $this->data   = new DataProvider();
        $this->llms   = new LLMsTxt( $this->data );
        $this->policy = new AgentPolicy( $this->data );

        $this->register_hooks();
    }

    public function register_hooks() {
        add_action( 'init', [ $this, 'register_rewrites' ] );
        add_filter( 'query_vars', [ $this, 'add_query_vars' ] );
        add_action( 'template_redirect', [ $this, 'maybe_render' ] );
        add_filter( 'redirect_canonical', [ $this, 'suppress_canonical_redirect' ], 10, 2 );

        add_action( 'save_post_product', [ $this, 'invalidate' ], 20 );
        add_action( 'deleted_post', [ $this, 'on_post_deleted' ], 20, 2 );
        add_action( 'user_register', [ $this, 'on_user_changed' ] );
        add_action( 'delete_user', [ $this, 'on_user_changed' ] );
        add_action( 'set_user_role', [ $this, 'on_user_changed' ] );
        add_action( 'dokan_after_saving_settings', [ $this, 'invalidate' ] );

        add_action( self::CRON_HOOK, [ $this, 'invalidate' ] );
        if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
            wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', self::CRON_HOOK );
        }

        add_action( 'wp_loaded', [ $this, 'maybe_flush_rewrites' ] );
    }

    public function register_rewrites() {
        add_rewrite_rule( '^llms\.txt/?$', 'index.php?' . self::QUERY_VAR_LLMS . '=1', 'top' );
        add_rewrite_rule( '^ai-agent-policy/?$', 'index.php?' . self::QUERY_VAR_POLICY . '=1', 'top' );
    }

    public function suppress_canonical_redirect( $redirect_url, $requested_url ) {
        $path = wp_parse_url( $requested_url, PHP_URL_PATH );
        if ( $path === '/llms.txt' || $path === '/ai-agent-policy' ) {
            return false;
        }
        return $redirect_url;
    }

    public function add_query_vars( $vars ) {
        $vars[] = self::QUERY_VAR_LLMS;
        $vars[] = self::QUERY_VAR_POLICY;
        return $vars;
    }

    public function maybe_flush_rewrites() {
        if ( get_option( self::REWRITE_FLAG ) === DOKAN_PLUGIN_VERSION ) {
            return;
        }
        flush_rewrite_rules( false );
        update_option( self::REWRITE_FLAG, DOKAN_PLUGIN_VERSION );
    }

    public function maybe_render() {
        if ( get_query_var( self::QUERY_VAR_LLMS ) ) {
            $this->respond_text( $this->cached_body( self::CACHE_KEY_LLMS, [ $this->llms, 'render' ] ) );
        }
        if ( get_query_var( self::QUERY_VAR_POLICY ) ) {
            $this->respond_json( $this->cached_body( self::CACHE_KEY_POLICY, [ $this->policy, 'render' ] ) );
        }
    }

    private function cached_body( $cache_key, callable $renderer ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            return (string) call_user_func( $renderer );
        }
        $cached = get_transient( $cache_key );
        if ( false !== $cached ) {
            return (string) $cached;
        }
        $body = (string) call_user_func( $renderer );
        set_transient( $cache_key, $body, self::CACHE_TTL );
        return $body;
    }

    private function respond_text( $body ) {
        nocache_headers();
        header( 'Content-Type: text/plain; charset=utf-8' );
        header( 'X-Robots-Tag: noindex' );
        echo $body; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        exit;
    }

    private function respond_json( $body ) {
        nocache_headers();
        header( 'Content-Type: application/json; charset=utf-8' );
        echo $body; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        exit;
    }

    public function invalidate() {
        delete_transient( self::CACHE_KEY_LLMS );
        delete_transient( self::CACHE_KEY_POLICY );
    }

    public function on_post_deleted( $post_id, $post ) {
        if ( $post instanceof \WP_Post && 'product' === $post->post_type ) {
            $this->invalidate();
        }
    }

    public function on_user_changed( $user_id ) {
        $user = get_userdata( $user_id );
        if ( $user && in_array( 'seller', (array) $user->roles, true ) ) {
            $this->invalidate();
        }
    }

    public function llms_renderer() {
        return $this->llms;
    }

    public function policy_renderer() {
        return $this->policy;
    }

    public function data_provider() {
        return $this->data;
    }
}
