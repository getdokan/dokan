<?php

namespace WeDevs\Dokan\Abilities\Support;

defined( 'ABSPATH' ) || exit;

/**
 * Detects an **Ability Context**: any execution of a registered WordPress Ability.
 *
 * WooCommerce 10.9.0 exposes abilities to MCP clients. Dokan applies vendor scoping only inside
 * an Ability Context, so the heavy data-store / permission filters stay inert for normal
 * storefront and admin traffic.
 *
 * The primary, server-agnostic signal is "are we currently executing a registered ability"
 * (tracked via the `wp_before_execute_ability` / `wp_after_execute_ability` actions). That action
 * fires inside `WP_Ability::execute()`, so it is true no matter what invoked the ability — an MCP
 * server, another plugin in-process, or WP-CLI. Scoping deliberately follows the Ability rather
 * than the transport: an ability call that never touches an MCP URL is still scoped.
 *
 * A check of the REST route WordPress is serving is kept as a secondary signal, and the result
 * is filterable via `dokan_is_ability_context`.
 *
 * @since 5.0.15
 */
class RequestContext {

    /**
     * Capability filters the MCP Adapter applies while handling a request, in order: the HTTP
     * transport's permission check, then the default server's discover, get-info and execute
     * meta-tools. Any of them firing means an MCP client is on the line.
     *
     * @since DOKAN_SINCE
     */
    const ADAPTER_CAPABILITY_FILTERS = [
        'mcp_adapter_default_transport_permission_user_capability',
        'mcp_adapter_discover_abilities_capability',
        'mcp_adapter_get_ability_info_capability',
        'mcp_adapter_execute_ability_capability',
    ];

    /**
     * REST routes that serve MCP: the servers of the WordPress MCP Adapter (`/mcp/<server>`),
     * Dokan's own server, and WooCommerce's endpoint of 11.2 and earlier.
     *
     * @since DOKAN_SINCE
     */
    const MCP_ROUTES = [ '/mcp', '/dokan/mcp', '/woocommerce/mcp' ];

    /**
     * Nesting depth of in-progress ability executions.
     *
     * @var int
     */
    private static int $ability_execution_depth = 0;

    /**
     * Whether the current request has been positively identified as an MCP request.
     *
     * Set as soon as the MCP adapter starts handling an ability call — before the target
     * ability's permission callback runs (see {@see flag_mcp_request()}). This is essential
     * because the adapter pre-flights an ability's permission check *outside* of any tracked
     * `wp_before_execute_ability` window, so the execution-depth signal is still zero then.
     *
     * @var bool
     */
    private static bool $request_is_mcp = false;

    /**
     * Whether the shared MCP detection hooks have been registered this request.
     *
     * @var bool
     */
    private static bool $detection_hooks_registered = false;

    /**
     * Register the shared MCP-detection hooks exactly once.
     *
     * Both the product and order ability scopers depend on these signals, so either may call this;
     * the guard keeps the execution counter from being incremented twice per ability.
     *
     * @since 5.0.15
     *
     * @return void
     */
    public static function register_detection_hooks(): void {
        if ( self::$detection_hooks_registered ) {
            return;
        }

        self::$detection_hooks_registered = true;

        // Track ability execution so scoping works on ANY MCP server (WooCommerce, Dokan, or
        // third-party such as MCP Site Manager), not just known endpoint URLs.
        add_action( 'wp_before_execute_ability', [ self::class, 'mark_ability_execution_started' ] );
        add_action( 'wp_after_execute_ability', [ self::class, 'mark_ability_execution_finished' ] );

        // Flag the request as MCP the moment the adapter starts handling it: the transport's
        // permission check, then each meta-tool's pre-flight, all before the target ability's own
        // permission callback runs and before any wp_before_execute_ability window opens.
        foreach ( self::ADAPTER_CAPABILITY_FILTERS as $filter ) {
            add_filter( $filter, [ self::class, 'flag_mcp_request' ] );
        }
    }

    /**
     * Whether an Ability is currently executing, whatever invoked it.
     *
     * True for an MCP tool call, an in-process ability call from another plugin, or WP-CLI —
     * `wp_before_execute_ability` fires inside `WP_Ability::execute()` regardless of transport.
     * Vendor scoping follows the Ability, not the URL that reached it, so integrations must not
     * assume a non-MCP ability call is unscoped.
     *
     * @since 5.0.15
     *
     * @return bool
     */
    public static function is_ability_context(): bool {
        $request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';

        $is_ability_context = self::$request_is_mcp || self::is_executing_ability() || self::matches_mcp_endpoint();

        /**
         * Filters whether the current request should be treated as an Ability Context.
         *
         * @since 5.0.15
         *
         * @param bool   $is_ability_context Whether an ability is executing / about to execute.
         * @param string $request_uri        The current request URI.
         */
        $is_ability_context = (bool) apply_filters( 'dokan_is_ability_context', $is_ability_context, $request_uri );

        return $is_ability_context;
    }

    /**
     * Whether an MCP client is on the line: the adapter flagged the request, or the request
     * targets an MCP endpoint.
     *
     * Narrower than {@see is_ability_context()}: the Abilities REST API and in-process callers
     * are an Ability Context but not an MCP request, and only MCP carries the marketplace's
     * assistant-access policy.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_mcp_request(): bool {
        return self::$request_is_mcp || self::matches_mcp_endpoint();
    }

    /**
     * Whether a registered ability is currently executing.
     *
     * @since 5.0.15
     *
     * @return bool
     */
    public static function is_executing_ability(): bool {
        return self::$ability_execution_depth > 0;
    }

    /**
     * Whether a vendor is acting inside an Ability Context.
     *
     * Store admins (manage_woocommerce) are intentionally left unscoped. Vendor staff resolve to
     * their parent vendor via dokan_get_current_user_id().
     *
     * @since 5.0.15
     *
     * @return bool
     */
    public static function is_vendor_ability_context(): bool {
        if ( ! self::is_ability_context() ) {
            return false;
        }

        if ( current_user_can( 'manage_woocommerce' ) ) {
            return false;
        }

        return dokan_is_user_seller( dokan_get_current_user_id() );
    }

    /**
     * Flag the current request as an MCP request and return the given value unchanged.
     *
     * Designed to be hooked onto a filter the MCP adapter runs while handling a tool call —
     * `mcp_adapter_execute_ability_capability`, which fires inside the adapter's permission
     * pre-flight, *before* it checks the target ability's own permission callback. Marking the
     * request here lets the per-object permission grant (e.g. allowing a vendor to read their own
     * orders) recognize the MCP context even though no `wp_before_execute_ability` window is open
     * yet. Works for any server built on the shared adapter: its default server, Dokan's own, or a
     * third party's such as MCP Site Manager.
     *
     * @since 5.0.15
     *
     * @param mixed $value Value passed by the filter; returned unchanged.
     *
     * @return mixed
     */
    public static function flag_mcp_request( $value = null ) {
        self::$request_is_mcp = true;

        return $value;
    }

    /**
     * Mark the start of an ability execution. Hooked to `wp_before_execute_ability`.
     *
     * @since 5.0.15
     *
     * @return void
     */
    public static function mark_ability_execution_started(): void {
        ++self::$ability_execution_depth;
    }

    /**
     * Mark the end of an ability execution. Hooked to `wp_after_execute_ability`.
     *
     * @since 5.0.15
     *
     * @return void
     */
    public static function mark_ability_execution_finished(): void {
        self::$ability_execution_depth = max( 0, self::$ability_execution_depth - 1 );
    }

    /**
     * Reset the per-request MCP state. Intended for test isolation.
     *
     * @since 5.0.15
     *
     * @return void
     */
    public static function reset(): void {
        self::$ability_execution_depth    = 0;
        self::$request_is_mcp             = false;
        self::$detection_hooks_registered = false;
    }

    /**
     * Whether the request is being served by a known MCP endpoint.
     *
     * Matches the REST route WordPress dispatches (`rest_route`), not the raw request URI: any
     * server of the WordPress MCP Adapter (`/mcp/<server>`), Dokan's own (`/dokan/mcp`), or
     * WooCommerce's endpoint of 11.2 and earlier. WooCommerce's own
     * `MCPAdapterProvider::is_mcp_request()` is not consulted: 11.3 removed the endpoint and the
     * method now only reports incorrect usage.
     *
     * @since 5.0.15
     * @since 5.3.4 Reads the dispatched REST route instead of the request URI.
     * @since DOKAN_SINCE Also matches the servers of the WordPress MCP Adapter.
     *
     * @return bool
     */
    protected static function matches_mcp_endpoint(): bool {
        foreach ( self::MCP_ROUTES as $route ) {
            if ( self::serves_route( $route ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Whether WordPress is serving this REST route, or a route beneath it.
     *
     * Compared case-insensitively, as WordPress matches routes: `/dokan/mcp` covers `/Dokan/MCP/`
     * but not `/dokan/mcpx`.
     *
     * @since DOKAN_SINCE
     *
     * @param string $route A REST route with its leading slash, e.g. `/dokan/mcp`.
     *
     * @return bool
     */
    public static function serves_route( string $route ): bool {
        $served = strtolower( self::served_rest_route() );
        $route  = strtolower( rtrim( $route, '/' ) );

        return '' !== $route && ( $served === $route || 0 === strpos( $served, $route . '/' ) );
    }

    /**
     * The REST route WordPress is serving, or an empty string outside a REST request.
     *
     * Read from the parsed query (`rest_route`), which a query string cannot fake the way it can
     * fake a match on the request URI.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function served_rest_route(): string {
        if ( ! self::is_rest_request() ) {
            return '';
        }

        $route = $GLOBALS['wp']->query_vars['rest_route'] ?? '';

        return is_string( $route ) ? $route : '';
    }

    /**
     * Whether the current request is a REST request.
     *
     * @since 5.0.15
     *
     * @return bool
     */
    public static function is_rest_request(): bool {
        if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
            return true;
        }

        return function_exists( 'wp_is_serving_rest_request' ) && wp_is_serving_rest_request();
    }
}
