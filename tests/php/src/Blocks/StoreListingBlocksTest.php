<?php

namespace WeDevs\Dokan\Test\Blocks;

use WeDevs\Dokan\Blocks\Manager;
use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Vendor\StoreListsFilter;
use WP_Block_Patterns_Registry;

/**
 * @group blocks
 */
class StoreListingBlocksTest extends DokanTestCase {

    /**
     * @test
     */
    public function it_registers_the_store_listing_pattern() {
        $registry = WP_Block_Patterns_Registry::get_instance();

        $this->assertTrue( $registry->is_registered( 'dokan/store-listing-default' ) );

        $pattern = $registry->get_registered( 'dokan/store-listing-default' );

        $this->assertSame( [ 'dokan-store-listing' ], $pattern['categories'] );
        $this->assertStringContainsString( '<!-- wp:dokan/store-filter-bar /-->', $pattern['content'] );
        $this->assertStringContainsString( '<!-- wp:dokan/store-list /-->', $pattern['content'] );
    }

    /**
     * @test
     */
    public function it_publishes_a_rendering_block_attributes_and_name_to_extensions() {
        $received = null;

        add_action(
            'dokan_blocks_rendering_attributes', function ( $attributes, $block_name ) use ( &$received ) {
                $received = [ $attributes, $block_name ];
            }, 10, 2
        );

        Manager::publish_rendering_attributes( [ 'columns' => 4 ], 'dokan/store-list' );

        $this->assertSame( [ [ 'columns' => 4 ], 'dokan/store-list' ], $received );
    }

    /**
     * @test
     */
    public function it_dispatches_the_filter_form_hook_once_with_dokan_own_listener_stood_aside() {
        $filter = dokan()->get_container()->get( StoreListsFilter::class );
        $calls  = 0;

        add_action(
            'dokan_store_lists_filter_form', function () use ( &$calls ) {
                $calls++;
            }
        );

        ob_start();
        Manager::dispatch_store_lists_filter_form(
            [
				'users' => [],
				'count' => 0,
			]
        );
        Manager::dispatch_store_lists_filter_form(
            [
				'users' => [],
				'count' => 0,
			]
        );
        $output = ob_get_clean();

        $this->assertSame( 1, $calls, 'Every block that reproduces the template dispatches, but the hook fires once.' );
        $this->assertSame( '', $output, 'The classic filter template must not render during the dispatch.' );
        $this->assertSame( 10, has_action( 'dokan_store_lists_filter_form', [ $filter, 'filter_area' ] ), 'The listener goes back on the hook.' );
    }

    /**
     * @test
     */
    public function it_registers_the_store_listing_extension_registry_script() {
        $this->assertTrue( wp_script_is( 'dokan-blocks-store-listing', 'registered' ) );
    }
}
