<?php

namespace WeDevs\Dokan\Abilities\Support;

defined( 'ABSPATH' ) || exit;

/**
 * Request context helpers for the WordPress Abilities / MCP layer.
 *
 * WooCommerce 10.9.0 exposes abilities to MCP clients. Dokan only wants to apply
 * vendor scoping during such requests, so the heavy data-store / permission filters
 * stay inert for normal storefront and admin traffic.
 *
 * The primary, server-agnostic signal is "are we currently executing a registered ability"
 * (tracked via the `wp_before_execute_ability` / `wp_after_execute_ability` actions). This works
 * no matter which MCP server invoked the ability — WooCommerce's `/woocommerce/mcp`, a future
 * Dokan server, or a third-party server such as the MCP Site Manager. A URI check (preferring
 * WooCommerce's own detection when present) is kept as a secondary signal, and the final result
 * is filterable via `dokan_is_mcp_request`.
 *
 * @since DOKAN_SINCE
 */
class RequestContext {

    /**
     * Nesting depth of in-progress ability executions.
     *
     * @var int
     */
    private static $ability_execution_depth = 0;

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
    private static $request_is_mcp = false;

    /**
     * Whether the shared MCP detection hooks have been registered this request.
     *
     * @var bool
     */
    private static $detection_hooks_registered = false;

    /**
     * Register the shared MCP-detection hooks exactly once.
     *
     * Both the product and order ability scopers depend on these signals, so either may call this;
     * the guard keeps the execution counter from being incremented twice per ability.
     *
     * @since DOKAN_SINCE
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

        // Flag the request as MCP the moment the adapter begins handling a tool call — during its
        // permission pre-flight, before the target ability's permission callback runs and before
        // any wp_before_execute_ability window opens. Works for any server on the shared adapter.
        add_filter( 'mcp_adapter_execute_ability_capability', [ self::class, 'flag_mcp_request' ] );
    }

    /**
     * Whether the current request targets an MCP / abilities endpoint.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_mcp_request(): bool {
        $request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';

        $is_mcp_request = self::$request_is_mcp || self::is_executing_ability() || self::matches_mcp_endpoint( $request_uri );

        /**
         * Filters whether the current request should be treated as an MCP / abilities request.
         *
         * @since DOKAN_SINCE
         *
         * @param bool   $is_mcp_request Whether the request targets an MCP endpoint.
         * @param string $request_uri    The current request URI.
         */
        return (bool) apply_filters( 'dokan_is_mcp_request', $is_mcp_request, $request_uri );
    }

    /**
     * Whether a registered ability is currently executing.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_executing_ability(): bool {
        return self::$ability_execution_depth > 0;
    }

    /**
     * Whether the current request is a vendor acting over an MCP / abilities endpoint.
     *
     * Store admins (manage_woocommerce) are intentionally left unscoped. Vendor staff resolve to
     * their parent vendor via dokan_get_current_user_id().
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_vendor_mcp_context(): bool {
        if ( ! self::is_mcp_request() ) {
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
     * yet. Works for any MCP server built on the shared adapter (WooCommerce, a future Dokan
     * server, or a third-party such as MCP Site Manager).
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function mark_ability_execution_started(): void {
        ++self::$ability_execution_depth;
    }

    /**
     * Mark the end of an ability execution. Hooked to `wp_after_execute_ability`.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function mark_ability_execution_finished(): void {
        self::$ability_execution_depth = max( 0, self::$ability_execution_depth - 1 );
    }

    /**
     * Reset the per-request MCP state. Intended for test isolation.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function reset(): void {
        self::$ability_execution_depth    = 0;
        self::$request_is_mcp             = false;
        self::$detection_hooks_registered = false;
    }

    /**
     * Whether the request targets a known MCP endpoint.
     *
     * Prefers WooCommerce's own detection when present; otherwise (or when it reports false,
     * e.g. for a future `/dokan/mcp` endpoint) falls back to a URI check.
     *
     * @since DOKAN_SINCE
     *
     * @param string $request_uri The current request URI.
     *
     * @return bool
     */
    protected static function matches_mcp_endpoint( string $request_uri ): bool {
        $provider = '\Automattic\WooCommerce\Internal\MCP\MCPAdapterProvider';

        if ( class_exists( $provider ) && method_exists( $provider, 'is_mcp_request' ) && $provider::is_mcp_request() ) {
            return true;
        }

        return self::is_rest_request()
            && '' !== $request_uri
            && (bool) preg_match( '#/(?:woocommerce|dokan)/mcp(?:/|$)#', $request_uri );
    }

    /**
     * Whether the current request is a REST request.
     *
     * @since DOKAN_SINCE
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
