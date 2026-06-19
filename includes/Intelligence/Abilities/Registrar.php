<?php

namespace WeDevs\Dokan\Intelligence\Abilities;

use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\REST\OrderController;
use WeDevs\Dokan\REST\ProductControllerV2;

/**
 * Registers Dokan resources as WordPress Abilities, WooCommerce-compatible.
 *
 * Instead of re-implementing product/order logic, this reuses WooCommerce's
 * own `RestAbilityFactory` (a `public static` API) so each ability dispatches
 * through Dokan's REST controllers via `rest_do_request()`. Those controllers
 * are already vendor-scoped, and the MCP transport calls `wp_set_current_user()`
 * to the API key's vendor, so per-vendor data boundaries happen automatically.
 *
 * The `dokan/*` abilities are then opted into WooCommerce's existing
 * `/wp-json/woocommerce/mcp` server via the `woocommerce_mcp_include_ability`
 * filter — no standalone MCP server, no parallel framework.
 *
 * @see https://github.com/getdokan/plugin-internal-tasks/issues/1972
 *
 * @since 5.1.0
 */
class Registrar implements Hookable {

    /**
     * WooCommerce's ability factory. Present only when WC's MCP layer ships.
     *
     * @var string
     */
    const WC_ABILITY_FACTORY = '\Automattic\WooCommerce\Internal\Abilities\REST\RestAbilityFactory';

    /**
     * Guards against duplicate registration within a single request.
     *
     * @var bool
     */
    private $registered = false;

    /**
     * {@inheritDoc}
     *
     * @since 5.1.0
     */
    public function register_hooks(): void {
        // No WooCommerce Abilities/MCP layer available → register nothing.
        if ( ! class_exists( self::WC_ABILITY_FACTORY ) ) {
            return;
        }

        add_action( 'wp_abilities_api_init', [ $this, 'register_abilities' ] );
        add_filter( 'woocommerce_mcp_include_ability', [ $this, 'include_dokan_abilities' ], 10, 2 );
    }

    /**
     * Register the dokan/* abilities by reusing WooCommerce's factory.
     *
     * @since 5.1.0
     *
     * @return void
     */
    public function register_abilities(): void {
        if ( $this->registered || ! function_exists( 'wp_register_ability' ) ) {
            return;
        }

        $this->registered = true;
        $factory          = self::WC_ABILITY_FACTORY;

        foreach ( $this->get_configurations() as $config ) {
            $factory::register_controller_abilities( $config );
        }
    }

    /**
     * Map Dokan REST controllers to abilities.
     *
     * Read abilities (issue #1972) dispatch to Dokan's vendor-scoped controllers:
     * products via ProductControllerV2 (/dokan/v2/products) and orders via
     * OrderController (/dokan/v1/orders). Both force the current vendor's scope.
     *
     * @since 5.1.0
     *
     * @return array<int, array<string, mixed>>
     */
    public function get_configurations(): array {
        $configurations = [
            [
                'controller' => ProductControllerV2::class,
                'route'      => '/dokan/v2/products',
                'abilities'  => [
                    [
                        'id'          => 'dokan/products-list',
                        'operation'   => 'list',
                        'label'       => __( 'List Vendor Products', 'dokan' ),
                        'description' => __( "Retrieve a paginated list of the current vendor's own products. Scoped to the authenticated vendor — never returns another vendor's products.", 'dokan' ),
                    ],
                    [
                        'id'          => 'dokan/products-get',
                        'operation'   => 'get',
                        'label'       => __( 'Get Vendor Product', 'dokan' ),
                        'description' => __( "Retrieve a single product by id, only when it belongs to the current vendor.", 'dokan' ),
                    ],
                ],
            ],
            [
                'controller' => OrderController::class,
                'route'      => '/dokan/v1/orders',
                'abilities'  => [
                    [
                        'id'          => 'dokan/orders-list',
                        'operation'   => 'list',
                        'label'       => __( 'List Vendor Orders', 'dokan' ),
                        'description' => __( "Retrieve a paginated list of the current vendor's own orders (their sub-orders). Scoped to the authenticated vendor — never returns another vendor's orders.", 'dokan' ),
                    ],
                    [
                        'id'          => 'dokan/orders-get',
                        'operation'   => 'get',
                        'label'       => __( 'Get Vendor Order', 'dokan' ),
                        'description' => __( "Retrieve a single order by id, only when it belongs to the current vendor.", 'dokan' ),
                    ],
                ],
            ],
        ];

        /**
         * Filter the Dokan ability → REST controller configurations.
         *
         * Dokan Pro and modules append their own vendor-scoped controllers here
         * (mirrors the `dokan_rest_api_class_map` Lite↔Pro pattern).
         *
         * @since 5.1.0
         *
         * @param array<int, array<string, mixed>> $configurations
         */
        return apply_filters( 'dokan_abilities_rest_config', $configurations );
    }

    /**
     * Opt every dokan/* ability into WooCommerce's MCP server.
     *
     * @since 5.1.0
     *
     * @param bool   $include    Whether WooCommerce would include the ability.
     * @param string $ability_id The ability identifier under evaluation.
     *
     * @return bool
     */
    public function include_dokan_abilities( $include, $ability_id ): bool {
        if ( is_string( $ability_id ) && 0 === strpos( $ability_id, 'dokan/' ) ) {
            return true;
        }

        return (bool) $include;
    }
}
