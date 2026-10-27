<?php

namespace WeDevs\Dokan\Test\Abilities;

use WeDevs\Dokan\Abilities\WooCommerceAliases;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 * @group mcp
 *
 * The Dokan-named abilities that stand for WooCommerce's product and order abilities.
 */
class WooCommerceAliasesTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();

        if ( ! function_exists( 'wp_get_ability' ) || ! wp_has_ability( 'woocommerce/products-query' ) ) {
            $this->markTestSkipped( 'WooCommerce abilities are not registered in this environment.' );
        }
    }

    public function test_every_alias_is_registered_with_its_sources_contract() {
        foreach ( WooCommerceAliases::ALIASES as $alias => $source_name ) {
            $alias_ability = wp_get_ability( $alias );
            $source        = wp_get_ability( $source_name );

            $this->assertNotNull( $alias_ability, "$alias is not registered." );
            $this->assertSame( 'dokan', $alias_ability->get_category() );
            $this->assertSame( $source->get_description(), $alias_ability->get_description() );
            // The alias may add top-level properties for strict clients, but the branches and the output are the source's.
            $this->assertCount( count( $source->get_input_schema()['oneOf'] ?? [] ), $alias_ability->get_input_schema()['oneOf'] ?? [] );
            $this->assertSame(
                array_keys( $source->get_output_schema()['properties'] ?? [] ),
                array_keys( $alias_ability->get_output_schema()['properties'] ?? [] ),
                "$alias does not return the same shape as $source_name."
            );
            $this->assertSame( $source->get_meta()['annotations'] ?? null, $alias_ability->get_meta()['annotations'] ?? null );
        }
    }

    public function test_an_alias_delegates_permission_and_execution_to_the_source() {
        $alias = wp_get_ability( 'dokan/products-query' );

        wp_set_current_user( $this->customer_id );
        $this->assertNotTrue( $alias->check_permissions( [] ) );

        wp_set_current_user( $this->admin_id );
        $this->assertTrue( $alias->check_permissions( [] ) );

        $result = $alias->execute( [ 'per_page' => 1 ] );

        $this->assertIsArray( $result );
        $this->assertArrayHasKey( 'products', $result );
    }
}
