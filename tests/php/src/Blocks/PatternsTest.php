<?php

namespace WeDevs\Dokan\Test\Blocks;

use WeDevs\Dokan\Blocks\Patterns;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Block_Pattern_Categories_Registry;
use WP_Block_Patterns_Registry;

/**
 * @group blocks
 */
class PatternsTest extends DokanTestCase {

    /**
     * @test
     */
    public function it_registers_the_dokan_pattern_categories() {
        $registry = WP_Block_Pattern_Categories_Registry::get_instance();

        $this->assertTrue( $registry->is_registered( 'dokan-store' ) );
        $this->assertTrue( $registry->is_registered( 'dokan-store-listing' ) );
    }

    /**
     * @test
     */
    public function extensions_register_pattern_files_through_the_filter() {
        $file = tempnam( sys_get_temp_dir(), 'dokan-pattern' ) . '.php';

        file_put_contents( // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents -- test fixture
            $file,
            "<?php\n/**\n * Title: Extension Pattern\n * Slug: dokan-test/extension\n * Categories: dokan-store-listing, dokan-store\n * Viewport Width: 900\n * Inserter: no\n */\n?>\n<!-- wp:paragraph --><p>Hi</p><!-- /wp:paragraph -->"
        );

        add_filter(
            'dokan_block_pattern_files', function ( $files ) use ( $file ) {
                return array_merge( (array) $files, [ $file ] );
            }
        );

        ( new Patterns() )->register();
        wp_delete_file( $file );

        $registry = WP_Block_Patterns_Registry::get_instance();

        $this->assertTrue( $registry->is_registered( 'dokan-test/extension' ) );

        $pattern = $registry->get_registered( 'dokan-test/extension' );

        $this->assertSame( 'Extension Pattern', $pattern['title'] );
        $this->assertSame( [ 'dokan-store-listing', 'dokan-store' ], $pattern['categories'] );
        $this->assertSame( 900, $pattern['viewportWidth'] );
        $this->assertFalse( $pattern['inserter'] );
        $this->assertSame( '<!-- wp:paragraph --><p>Hi</p><!-- /wp:paragraph -->', $pattern['content'] );

        unregister_block_pattern( 'dokan-test/extension' );
    }

    /**
     * @test
     */
    public function it_skips_a_file_without_a_title_or_slug() {
        $file = tempnam( sys_get_temp_dir(), 'dokan-pattern' ) . '.php';

        file_put_contents( $file, "<?php\n/**\n * Title: No Slug\n */\n?>\n<!-- wp:paragraph --><p>Hi</p><!-- /wp:paragraph -->" );

        add_filter(
            'dokan_block_pattern_files', function () use ( $file ) {
                return [ $file ];
            }
        );

        $before = count( WP_Block_Patterns_Registry::get_instance()->get_all_registered() );

        ( new Patterns() )->register();
        wp_delete_file( $file );

        $this->assertCount( $before, WP_Block_Patterns_Registry::get_instance()->get_all_registered() );
    }
}
