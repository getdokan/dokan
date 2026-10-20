<?php

namespace WeDevs\Dokan\Abilities\Mcp;

defined( 'ABSPATH' ) || exit;

/**
 * The curated list of abilities the Dokan MCP server exposes as tools.
 *
 * One place to find the tools: Lite's own abilities plus the WooCommerce domain abilities that
 * {@see \WeDevs\Dokan\Abilities\ProductAbilityScope} and {@see \WeDevs\Dokan\Abilities\OrderAbilityScope}
 * already vendor-scope. Pro and modules append their own through `dokan_mcp_server_abilities`.
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
            // WooCommerce domain abilities, vendor-scoped by the Abilities layer.
            'woocommerce/products-query',
            'woocommerce/product-create',
            'woocommerce/product-update',
            'woocommerce/product-delete',
            'woocommerce/orders-query',
            'woocommerce/order-update-status',
            'woocommerce/order-add-note',
        ];
    }

    /**
     * The abilities to expose, filtered and reduced to the ones actually registered.
     *
     * Registering a tool for an unregistered ability is a logged failure on the adapter, so the
     * list is intersected with the registry at the moment it is read.
     *
     * @since DOKAN_SINCE
     *
     * @return string[]
     */
    public static function ability_ids(): array {
        /**
         * Filters the abilities the Dokan MCP server exposes as tools.
         *
         * @since DOKAN_SINCE
         *
         * @param string[] $ids Ability names, e.g. `dokan/current-vendor`.
         */
        $ids = apply_filters( 'dokan_mcp_server_abilities', self::default_ability_ids() );

        if ( ! is_array( $ids ) || ! function_exists( 'wp_has_ability' ) ) {
            return [];
        }

        $ids = array_filter(
            array_unique( array_filter( $ids, 'is_string' ) ),
            static function ( string $id ): bool {
                return wp_has_ability( $id );
            }
        );

        return array_values( $ids );
    }

    /**
     * How many tools a connected client would find.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public static function tool_count(): int {
        return count( self::ability_ids() );
    }
}
