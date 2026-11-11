<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Support\AbilityArgs;
use WeDevs\Dokan\Abilities\Support\RequestContext;
use WeDevs\Dokan\Contracts\Hookable;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Applies the marketplace's AI assistant policy to every governed ability, on whichever MCP
 * server runs it: the WooCommerce product and order abilities are also served by the adapter's
 * default server and by third-party ones, where Dokan's door ({@see Transport}) does not stand.
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

        // After the scope classes (priority 10) have shaped the registration arguments, so the
        // policy wraps their permission wrappers and decides last.
        add_filter( 'wp_register_ability_args', [ $this, 'guard_registration' ], AbilityArgs::POLICY_PRIORITY, 2 );
        // WordPress 7.1 also filters the permission result: the same decision, taken first there.
        add_filter( 'wp_ability_permission_result', [ $this, 'authorize' ], AbilityArgs::POLICY_RESULT_PRIORITY, 2 );

        add_action( 'wp_ability_invoked', [ $this, 'record_invocation' ], 10, 2 );
    }

    /**
     * Wrap the permission callback of every governed ability with the policy.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $args Ability registration arguments.
     * @param string $name Ability name.
     *
     * @return array
     */
    public function guard_registration( $args, $name ) {
        $name = (string) $name;

        if ( ! is_array( $args ) || ! Access::governs( $name ) ) {
            return $args;
        }

        return AbilityArgs::wrap_permission(
            $args,
            function ( $result ) use ( $name ) {
                return $this->authorize( $result, $name );
            }
        );
    }

    /**
     * Refuse a governed ability over MCP to anyone the policy does not admit, with the reason.
     *
     * Outside an MCP request the result passes through: the Abilities REST API and in-process
     * callers keep the abilities' own rules.
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
            return Access::disabled_error();
        }

        if ( ! Access::user_can_connect( get_current_user_id() ) ) {
            return Access::not_allowed_error();
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
         * @param string $name    The ability invoked.
         * @param mixed  $input   Its input.
         * @param int    $user_id The connected user.
         */
        do_action( 'dokan_mcp_ability_invoked', $name, $input, $user_id );

        dokan_log( sprintf( '[mcp] user #%d invoked %s', $user_id, $name ), 'info' );
    }
}
