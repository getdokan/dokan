<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Mcp\Catalog;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 * @group mcp
 *
 * Which abilities the Dokan MCP server exposes as tools.
 */
class CatalogTest extends DokanTestCase {

    public function test_the_configured_list_is_filterable_and_deduplicated() {
        add_filter(
            'dokan_mcp_server_abilities',
            static function ( array $ids ) {
                $ids[] = 'dokan/current-vendor';
                $ids[] = 'dokan/does-not-exist';
                $ids[] = 42;

                return array_values( array_diff( $ids, [ 'dokan/product-delete' ] ) );
            }
        );

        $ids = Catalog::configured_ability_ids();

        $this->assertSame( 1, count( array_keys( $ids, 'dokan/current-vendor', true ) ) );
        $this->assertContains( 'dokan/does-not-exist', $ids );
        $this->assertNotContains( 'dokan/product-delete', $ids );
        $this->assertNotContains( 42, $ids );
        $this->assertSame( count( $ids ), Catalog::tool_count() );
    }

    public function test_only_registered_abilities_become_tools() {
        if ( ! function_exists( 'wp_has_ability' ) ) {
            $this->markTestSkipped( 'The Abilities API is not loaded.' );
        }

        add_filter(
            'dokan_mcp_server_abilities',
            static function ( array $ids ) {
                $ids[] = 'dokan/does-not-exist';

                return $ids;
            }
        );

        $ids = Catalog::ability_ids();

        $this->assertNotContains( 'dokan/does-not-exist', $ids );

        if ( wp_has_ability( 'dokan/current-vendor' ) ) {
            $this->assertContains( 'dokan/current-vendor', $ids );
            $this->assertContains( 'dokan/orders-summary-get', $ids );
        }
    }
}
