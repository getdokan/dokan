<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Support\RequestContext;
use WeDevs\Dokan\Contracts\Hookable;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Applies the marketplace's AI assistant policy in the Abilities layer, where WordPress and the
 * MCP Adapter already decide permissions.
 *
 * The adapter's default server lists an ability when its `meta.mcp.public` flag is on and runs
 * it when its own permission callback agrees. Dokan plugs into both: the master switch sets the
 * flag of every `dokan/*` ability, and the permission result of every governed ability is
 * refused over MCP for a user the policy ({@see Access}) does not admit. Nothing here runs a
 * server, authenticates anybody or touches a request that is not an MCP tool call.
 *
 * @since DOKAN_SINCE
 */
class Gate implements Hookable {

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        RequestContext::register_detection_hooks();

        // After the scope classes (priority 10) have shaped the registration arguments.
        add_filter( 'wp_register_ability_args', [ $this, 'follow_the_switch' ], 30, 2 );
        // Before the scopes honour the order-status setting (10) or explain a refusal (20).
        add_filter( 'wp_ability_permission_result', [ $this, 'authorize' ], 5, 2 );
        add_action( 'wp_ability_invoked', [ $this, 'record_invocation' ], 10, 2 );
    }

    /**
     * Expose a Dokan ability over MCP only while the master switch is on.
     *
     * The adapter reads `meta.mcp.public` from the registered ability, so a switched-off site
     * neither lists nor runs Dokan's tools; WooCommerce's own abilities are not Dokan's to hide.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $args Ability registration arguments.
     * @param string $name Ability name.
     *
     * @return array
     */
    public function follow_the_switch( $args, $name ) {
        if ( ! is_array( $args ) || ! Access::is_dokan_ability( (string) $name ) ) {
            return $args;
        }

        $meta = isset( $args['meta'] ) && is_array( $args['meta'] ) ? $args['meta'] : [];
        $mcp  = isset( $meta['mcp'] ) && is_array( $meta['mcp'] ) ? $meta['mcp'] : [];

        $mcp['public'] = Access::is_enabled();
        $meta['mcp']   = $mcp;
        $args['meta']  = $meta;

        return $args;
    }

    /**
     * Refuse a governed ability over MCP to anyone the policy does not admit.
     *
     * Runs on the permission result, so the adapter's pre-flight and the execution both see the
     * refusal, and the client reads why. Outside an MCP request the result passes through
     * untouched: the Abilities REST API and in-process callers keep the abilities' own rules.
     *
     * @since DOKAN_SINCE
     *
     * @param bool|WP_Error $result       The permission decided so far.
     * @param string        $ability_name The ability being checked.
     *
     * @return bool|WP_Error
     */
    public function authorize( $result, $ability_name ) {
        $name = (string) $ability_name;

        if ( ! Access::governs( $name ) || ! RequestContext::is_mcp_request() ) {
            return $result;
        }

        if ( Access::is_dokan_ability( $name ) && ! Access::is_enabled() ) {
            return new WP_Error( 'dokan_mcp_disabled', __( 'AI assistant access to Dokan is switched off. Turn it on under Dokan > Settings > AI Assist.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        if ( ! Access::user_can_connect( get_current_user_id() ) ) {
            return new WP_Error( 'dokan_mcp_not_allowed', __( 'This account may not use marketplace tools through an AI assistant. Store admins always can; vendors and their staff only while "Allow vendors to connect" is on and their store is enabled.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        return $result;
    }

    /**
     * Leave a trail of every Dokan tool call made through MCP.
     *
     * WordPress fires `wp_ability_invoked` from 7.1; older versions leave no trail. A WooCommerce
     * ability called through MCP is WooCommerce's to log.
     *
     * @since DOKAN_SINCE
     *
     * @param string $ability_name The ability invoked.
     * @param mixed  $input        Its input.
     *
     * @return void
     */
    public function record_invocation( $ability_name, $input ): void {
        $name    = (string) $ability_name;
        $user_id = get_current_user_id();

        if ( $user_id <= 0 || ! Access::is_dokan_ability( $name ) || ! RequestContext::is_mcp_request() ) {
            return;
        }

        /**
         * Fires when a Dokan tool is invoked through MCP.
         *
         * @since DOKAN_SINCE
         *
         * @param string $ability_name The ability invoked.
         * @param mixed  $input        Its input.
         * @param int    $user_id      The connected user.
         */
        do_action( 'dokan_mcp_ability_invoked', $name, $input, $user_id );

        dokan_log( sprintf( '[mcp] user #%d invoked %s', $user_id, $name ), 'info' );
    }
}
