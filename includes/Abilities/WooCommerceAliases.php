<?php

namespace WeDevs\Dokan\Abilities;

use WeDevs\Dokan\Abilities\Mcp\Access;
use WeDevs\Dokan\Contracts\Hookable;
use WP_Ability;

defined( 'ABSPATH' ) || exit;

/**
 * Dokan-named abilities for the WooCommerce product and order abilities the Dokan MCP server
 * exposes, so a connected assistant sees `dokan-products-query`, `dokan-order-add-note` and so on
 * rather than WooCommerce's names.
 *
 * Each alias delegates to the WooCommerce ability it is named after, so everything hooked on the
 * WooCommerce name still runs: the vendor scoping of {@see ProductAbilityScope} and
 * {@see OrderAbilityScope}, and Pro's output shaping. The alias carries the source's schemas,
 * description and annotations as they are after those hooks.
 *
 * @since DOKAN_SINCE
 */
class WooCommerceAliases implements Hookable {

    /**
     * Alias → WooCommerce ability it stands for.
     *
     * @since DOKAN_SINCE
     */
    public const ALIASES = [
        'dokan/products-query'      => 'woocommerce/products-query',
        'dokan/product-create'      => 'woocommerce/product-create',
        'dokan/product-update'      => 'woocommerce/product-update',
        'dokan/product-delete'      => 'woocommerce/product-delete',
        'dokan/orders-query'        => 'woocommerce/orders-query',
        'dokan/order-update-status' => 'woocommerce/order-update-status',
        'dokan/order-add-note'      => 'woocommerce/order-add-note',
    ];

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        // After WooCommerce has registered its abilities (priority 10).
        add_action( 'wp_abilities_api_init', [ $this, 'register_aliases' ], 20 );
    }

    /**
     * Register every alias whose WooCommerce ability exists on this site.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_aliases(): void {
        $missing = [];

        foreach ( self::ALIASES as $alias => $source_name ) {
            $source = wp_get_ability( $source_name );

            if ( ! $source instanceof WP_Ability ) {
                $missing[] = $source_name;
                continue;
            }

            if ( ! wp_has_ability( $alias ) ) {
                wp_register_ability( $alias, self::alias_args( $source ) );
            }
        }

        // A tool missing from the server is easier to explain from a log line than from a short tools/list.
        if ( ! empty( $missing ) && Access::is_enabled() ) {
            dokan_log( '[mcp] WooCommerce abilities not registered, their Dokan tools are unavailable: ' . implode( ', ', $missing ), 'warning' );
        }
    }

    /**
     * Registration arguments for an alias of the given ability.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_Ability $source The WooCommerce ability to delegate to.
     *
     * @return array
     */
    public static function alias_args( WP_Ability $source ): array {
        return [
            'label'               => $source->get_label(),
            'description'         => $source->get_description(),
            'category'            => 'dokan',
            'input_schema'        => $source->get_input_schema(),
            'output_schema'       => $source->get_output_schema(),
            'execute_callback'    => static function ( $input ) use ( $source ) {
                return $source->execute( $input );
            },
            'permission_callback' => static function ( $input ) use ( $source ) {
                return $source->check_permissions( $input );
            },
            'meta'                => $source->get_meta(),
        ];
    }
}
