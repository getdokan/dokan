<?php

namespace WeDevs\Dokan\Test\Blocks;

use WeDevs\Dokan\Blocks\Manager;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Block_Editor_Context;

/**
 * @group blocks
 */
class ManagerTest extends DokanTestCase {

    /**
     * @test
     */
    public function it_registers_the_dokan_block_category_exactly_once() {
        $context = new WP_Block_Editor_Context( [ 'post' => $this->factory()->post->create_and_get() ] );
        $slugs   = wp_list_pluck( get_block_categories( $context ), 'slug' );

        $this->assertCount( 1, array_keys( $slugs, 'dokan', true ) );
        $this->assertSame( 'dokan', $slugs[0], 'The Dokan category leads the inserter.' );
    }

    /**
     * @test
     */
    public function it_leaves_a_category_an_extension_already_registered_alone() {
        $manager  = dokan()->get_container()->get( Manager::class );
        $existing = [
            [ 'slug' => 'dokan', 'title' => 'Dokan' ],
            [ 'slug' => 'text', 'title' => 'Text' ],
        ];

        $this->assertSame( $existing, $manager->register_block_category( $existing ) );
    }

    /**
     * @test
     */
    public function it_hooks_the_category_ahead_of_extensions() {
        $manager = dokan()->get_container()->get( Manager::class );

        $this->assertSame( 9, has_filter( 'block_categories_all', [ $manager, 'register_block_category' ] ) );
    }

    /**
     * @test
     */
    public function it_registers_block_types_through_the_collections_filter() {
        $seen = null;

        add_filter(
            'dokan_block_type_collections', function ( $collections ) use ( &$seen ) {
                $seen = $collections;

                return [];
            }
        );

        dokan()->get_container()->get( Manager::class )->register_block_types();

        $this->assertArrayHasKey( DOKAN_DIR . '/assets/blocks', $seen );
        $this->assertSame( DOKAN_DIR . '/assets/blocks/blocks-manifest.php', $seen[ DOKAN_DIR . '/assets/blocks' ] );
    }
}
