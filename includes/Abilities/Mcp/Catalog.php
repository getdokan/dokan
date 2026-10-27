<?php

namespace WeDevs\Dokan\Abilities\Mcp;

defined( 'ABSPATH' ) || exit;

/**
 * The curated list of abilities the Dokan MCP server exposes as tools.
 *
 * One place to find the tools: Lite's own abilities plus the Dokan-named aliases of the
 * WooCommerce product and order abilities ({@see \WeDevs\Dokan\Abilities\WooCommerceAliases}),
 * which {@see \WeDevs\Dokan\Abilities\ProductAbilityScope} and
 * {@see \WeDevs\Dokan\Abilities\OrderAbilityScope} vendor-scope. Pro and modules append their own
 * through `dokan_mcp_server_abilities`.
 *
 * @since DOKAN_SINCE
 */
class Catalog {

    /**
     * Abilities exposed by default.
     *
     * @since DOKAN_SINCE
     *
     * @return string[]
     */
    public static function default_ability_ids(): array {
        return [
            // Dokan-native.
            'dokan/current-vendor',
            'dokan/vendors-query',
            'dokan/vendor-stats-get',
            'dokan/withdraws-query',
            'dokan/orders-summary-get',
            // Dokan-named aliases of WooCommerce's product and order abilities, vendor-scoped by the Abilities layer.
            'dokan/products-query',
            'dokan/product-create',
            'dokan/product-update',
            'dokan/product-delete',
            'dokan/orders-query',
            'dokan/order-update-status',
            'dokan/order-add-note',
        ];
    }

    /**
     * The abilities the site wants exposed: the default list after the filter, deduplicated.
     *
     * @since DOKAN_SINCE
     *
     * @return string[]
     */
    public static function configured_ability_ids(): array {
        /**
         * Filters the abilities the Dokan MCP server exposes as tools.
         *
         * @since DOKAN_SINCE
         *
         * @param string[] $ids Ability names, e.g. `dokan/current-vendor`.
         */
        $ids = apply_filters( 'dokan_mcp_server_abilities', self::default_ability_ids() );

        return is_array( $ids ) ? array_values( array_unique( array_filter( $ids, 'is_string' ) ) ) : [];
    }

    /**
     * The configured abilities that are actually registered, which is what the server registers.
     *
     * Registering a tool for an unregistered ability is a logged failure on the adapter.
     *
     * @since DOKAN_SINCE
     *
     * @return string[]
     */
    public static function ability_ids(): array {
        if ( ! function_exists( 'wp_has_ability' ) ) {
            return [];
        }

        return array_values( array_filter( self::configured_ability_ids(), 'wp_has_ability' ) );
    }

    /**
     * How many tools the settings screens announce.
     *
     * Counts the configured list without consulting the Abilities registry: a settings schema may
     * be built before the registry has initialised, and forcing it early would register only the
     * plugins hooked so far.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public static function tool_count(): int {
        return count( self::configured_ability_ids() );
    }
}
