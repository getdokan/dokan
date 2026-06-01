<?php

namespace WeDevs\Dokan\AgentAbilities;

/**
 * Registers Dokan marketplace operations into the WordPress Abilities API.
 *
 * Abilities become callable via REST (/wp-json/wp-abilities/v1/abilities/{name}/run),
 * MCP (any client connected through wordpress/mcp-adapter), CLI, and any future
 * AI surface. Ships in Dokan Lite so every marketplace — free or paid — is
 * agent-callable on day one.
 *
 * The framework enforces registration timing strictly: wp_register_ability()
 * must run inside the wp_abilities_api_init action, never earlier.
 *
 * Pro module (agent-abilities-pro) registers additional abilities under the
 * same dokan-marketplace category — agents shouldn't care which SKU you bought.
 */
class Manager {

    const CATEGORY_SLUG = 'dokan-marketplace';

    public function __construct() {
        add_action( 'wp_abilities_api_categories_init', [ $this, 'register_category' ] );
        add_action( 'wp_abilities_api_init', [ $this, 'register_abilities' ] );

        // Opt Dokan abilities into the WooCommerce MCP server. WC's server
        // only exposes `woocommerce/*` abilities by default. Without this
        // filter, Dokan abilities exist on the REST endpoint and the WP
        // Abilities API but won't show up in MCP clients (Claude, ChatGPT)
        // connecting via the WC server.
        add_filter( 'woocommerce_mcp_include_ability', [ $this, 'include_in_woocommerce_mcp' ], 10, 2 );
    }

    public function include_in_woocommerce_mcp( $include, $ability_id ) {
        if ( is_string( $ability_id ) && 0 === strpos( $ability_id, 'dokan/' ) ) {
            return true;
        }
        return $include;
    }

    public function register_category() {
        if ( ! function_exists( 'wp_register_ability_category' ) ) {
            return;
        }

        wp_register_ability_category(
            self::CATEGORY_SLUG,
            [
                'label'       => __( 'Dokan Marketplace', 'dokan-lite' ),
                'description' => __( 'Marketplace and vendor operations exposed by Dokan. Lets AI agents like Claude, ChatGPT, and Cursor query vendors, list products, manage vendor lifecycle, and read marketplace stats through one unified surface.', 'dokan-lite' ),
            ]
        );
    }

    public function register_abilities() {
        if ( ! function_exists( 'wp_register_ability' ) ) {
            return;
        }

        $classes = [
            // Reads
            Abilities\VendorsQuery::class,
            Abilities\VendorGet::class,
            Abilities\VendorProductsQuery::class,
            Abilities\VendorOrdersQuery::class,
            // Admin writes
            Abilities\VendorApprove::class,
            Abilities\VendorSuspend::class,
            Abilities\VendorCommissionSet::class,
            Abilities\MarketplaceStatsSummary::class,
            // Vendor self-service writes (F-18)
            Abilities\VendorProductCreate::class,
            Abilities\VendorProductUpdate::class,
            Abilities\VendorInventoryUpdate::class,
            Abilities\VendorWithdrawalRequest::class,
            Abilities\VendorStoreUpdate::class,
        ];

        foreach ( $classes as $class ) {
            if ( ! class_exists( $class ) ) {
                continue;
            }

            wp_register_ability( constant( $class . '::NAME' ), $class::definition() );
        }

        /**
         * Fires when Dokan Lite has finished registering its core abilities.
         * Pro and 3rd-party plugins can hook here to register additional abilities
         * under the same dokan-marketplace category.
         */
        do_action( 'dokan_register_abilities' );
    }
}
