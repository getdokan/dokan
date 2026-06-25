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
     * Whether the current request targets an MCP / abilities endpoint.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_mcp_request(): bool {
        $request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';

        $is_mcp_request = self::is_executing_ability() || self::matches_mcp_endpoint( $request_uri );

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
