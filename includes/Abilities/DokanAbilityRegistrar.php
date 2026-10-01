<?php

namespace WeDevs\Dokan\Abilities;

use WeDevs\Dokan\Abilities\Definitions\CurrentVendor;
use WeDevs\Dokan\Abilities\Definitions\VendorsQuery;
use WeDevs\Dokan\Abilities\Definitions\VendorStatsGet;
use WeDevs\Dokan\Abilities\Definitions\WithdrawsQuery;
use WeDevs\Dokan\Contracts\Hookable;

defined( 'ABSPATH' ) || exit;

/**
 * Registers Dokan-native abilities with the WordPress Abilities API.
 *
 * Dokan exposes vendor-scoped abilities (withdrawals, vendor stats, …) for resources WooCommerce
 * does not model. Registration uses WooCommerce 10.9's public `woocommerce_ability_definition_classes`
 * filter, so the abilities are picked up by the same Abilities API / MCP surface as WooCommerce's own,
 * without depending on any WooCommerce internal class.
 *
 * The ability classes implement WooCommerce's public AbilityDefinition interface; because they are only
 * autoloaded when that filter runs (which only happens when WooCommerce 10.9+ is active), nothing here
 * fatals on older WooCommerce.
 *
 * @since 5.0.15
 */
class DokanAbilityRegistrar implements Hookable {

    /**
     * Register hooks.
     *
     * @since 5.0.15
     *
     * @return void
     */
    public function register_hooks(): void {
        // Register the Dokan ability category (support pre-6.9 and 6.9+ action names).
        add_action( 'abilities_api_categories_init', [ $this, 'register_category' ] );
        add_action( 'wp_abilities_api_categories_init', [ $this, 'register_category' ] );

        // Append Dokan ability definition classes to WooCommerce's loader.
        add_filter( 'woocommerce_ability_definition_classes', [ $this, 'register_definition_classes' ] );
    }

    /**
     * Register the `dokan` ability category.
     *
     * @since 5.0.15
     *
     * @return void
     */
    public function register_category(): void {
        if ( ! function_exists( 'wp_register_ability_category' ) ) {
            return;
        }

        if ( function_exists( 'wp_has_ability_category' ) && wp_has_ability_category( 'dokan' ) ) {
            return;
        }

        wp_register_ability_category(
            'dokan',
            [
                'label'       => __( 'Dokan', 'dokan-lite' ),
                'description' => __( 'Vendor-scoped Dokan marketplace operations.', 'dokan-lite' ),
            ]
        );
    }

    /**
     * Append Dokan ability definition classes.
     *
     * @since 5.0.15
     *
     * @param array $classes Ability definition class names.
     *
     * @return array
     */
    public function register_definition_classes( $classes ): array {
        if ( ! is_array( $classes ) ) {
            $classes = [];
        }

        return array_merge( $classes, $this->ability_classes() );
    }

    /**
     * Dokan ability definition class names.
     *
     * @since 5.0.15
     *
     * @return string[]
     */
    private function ability_classes(): array {
        /**
         * Filters the list of Dokan ability definition classes.
         *
         * @since 5.0.15
         *
         * @param string[] $classes Fully-qualified ability definition class names.
         */
        return apply_filters(
            'dokan_ability_definition_classes',
            [
                CurrentVendor::class,
                VendorStatsGet::class,
                WithdrawsQuery::class,
                VendorsQuery::class,
            ]
        );
    }
}
