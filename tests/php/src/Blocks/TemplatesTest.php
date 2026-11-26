<?php

namespace WeDevs\Dokan\Test\Blocks;

use WeDevs\Dokan\Blocks\Templates;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group blocks
 */
class TemplatesTest extends DokanTestCase {

    /**
     * @test
     */
    public function it_only_puts_the_store_template_first_on_store_requests() {
        $templates = dokan()->get_container()->get( Templates::class );
        $store_var = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );

        $this->assertSame( [ 'index' ], $templates->inject_store_template_hierarchy( [ 'index' ] ) );

        set_query_var( $store_var, 'some-store' );

        $this->assertSame( [ 'single-store', 'index' ], $templates->inject_store_template_hierarchy( [ 'index' ] ) );

        set_query_var( $store_var, '' );

        $this->assertSame( [ 'index' ], $templates->inject_store_template_hierarchy( [ 'index' ] ) );
    }

    /**
     * @test
     */
    public function it_hooks_the_index_template_hierarchy() {
        $templates = dokan()->get_container()->get( Templates::class );

        $this->assertSame( 10, has_filter( 'index_template_hierarchy', [ $templates, 'inject_store_template_hierarchy' ] ) );
    }

    /**
     * @test
     */
    public function the_store_template_is_never_available_on_a_classic_theme() {
        if ( wp_is_block_theme() ) {
            $this->markTestSkipped( 'The test theme is a block theme.' );
        }

        $this->assertFalse( Templates::is_available() );
    }
}
