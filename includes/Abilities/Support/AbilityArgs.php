<?php

namespace WeDevs\Dokan\Abilities\Support;

defined( 'ABSPATH' ) || exit;

/**
 * Wraps the callbacks in an ability's registration arguments, on `wp_register_ability_args`.
 *
 * The ability keeps its name, schemas and metadata, so every caller (an MCP server, the Abilities
 * REST API, WP-CLI, another plugin) runs through the wrapper. Wrapping on registration works on
 * every WordPress version with the Abilities API; the `wp_ability_*` result filters of WordPress
 * 7.1 are layered on top where they exist.
 *
 * @since DOKAN_SINCE
 */
class AbilityArgs {

    /**
     * Whether the registration arguments carry an execute callback that can be wrapped.
     *
     * WooCommerce 11.3's product-create and product-update attach theirs after this filter has
     * run (`ActionableAbility::prepare_properties()`), so they cannot be wrapped here.
     *
     * @since DOKAN_SINCE
     *
     * @param array $args Ability registration arguments.
     *
     * @return bool
     */
    public static function has_execute_callback( array $args ): bool {
        return isset( $args['execute_callback'] ) && is_callable( $args['execute_callback'] );
    }

    /**
     * Run `$around( $original, $input )` in place of the execute callback.
     *
     * @since DOKAN_SINCE
     *
     * @param array    $args   Ability registration arguments.
     * @param callable $around Receives the original callback and the input; returns the result.
     *
     * @return array
     */
    public static function wrap_execute( array $args, callable $around ): array {
        if ( ! self::has_execute_callback( $args ) ) {
            return $args;
        }

        $original = $args['execute_callback'];

        $args['execute_callback'] = static function ( $input = null ) use ( $original, $around ) {
            return $around( $original, $input );
        };

        return $args;
    }

    /**
     * Run `$decide( $result, $input )` on what the permission callback decided.
     *
     * @since DOKAN_SINCE
     *
     * @param array    $args   Ability registration arguments.
     * @param callable $decide Receives the callback's result and the input; returns the final one.
     *
     * @return array
     */
    public static function wrap_permission( array $args, callable $decide ): array {
        if ( ! isset( $args['permission_callback'] ) || ! is_callable( $args['permission_callback'] ) ) {
            return $args;
        }

        $original = $args['permission_callback'];

        $args['permission_callback'] = static function ( $input = null ) use ( $original, $decide ) {
            return $decide( call_user_func( $original, $input ), $input );
        };

        return $args;
    }
}
