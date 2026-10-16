<?php

namespace WeDevs\Dokan\Test\Blocks;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group blocks
 */
class StoreListingDetectionTest extends DokanTestCase {

    /**
     * Visit a published page holding the given content and report dokan_is_store_listing().
     *
     * @param string $content Page content.
     *
     * @return bool
     */
    protected function is_store_listing_for( $content ) {
        $page_id = $this->factory()->post->create(
            [
                'post_type'    => 'page',
                'post_status'  => 'publish',
                'post_content' => $content,
            ]
        );

        $this->go_to( get_permalink( $page_id ) );

        return dokan_is_store_listing();
    }

    /**
     * @test
     */
    public function it_detects_the_store_list_block() {
        $this->assertTrue( $this->is_store_listing_for( '<!-- wp:dokan/store-filter-bar /--><!-- wp:dokan/store-list {"columns":4} /-->' ) );
    }

    /**
     * @test
     */
    public function it_detects_a_page_that_references_the_store_listing_pattern() {
        $this->assertTrue( $this->is_store_listing_for( '<!-- wp:pattern {"slug":"dokan/store-listing-default"} /-->' ) );
    }

    /**
     * @test
     */
    public function it_still_detects_the_shortcode() {
        $this->assertTrue( $this->is_store_listing_for( '[dokan-stores per_row="4"]' ) );
    }

    /**
     * @test
     */
    public function it_ignores_an_ordinary_page() {
        $this->assertFalse( $this->is_store_listing_for( '<!-- wp:paragraph --><p>Hello</p><!-- /wp:paragraph -->' ) );
    }
}
