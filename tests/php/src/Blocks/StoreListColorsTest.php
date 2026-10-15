<?php

namespace WeDevs\Dokan\Test\Blocks;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group blocks
 */
class StoreListColorsTest extends DokanTestCase {

    /**
     * Render the store list block with the given attributes.
     *
     * @param array $attrs Block attributes.
     *
     * @return string
     */
    protected function render_store_list( array $attrs ): string {
        return render_block(
            [
                'blockName'    => 'dokan/store-list',
                'attrs'        => $attrs,
                'innerBlocks'  => [],
                'innerHTML'    => '',
                'innerContent' => [],
            ]
        );
    }

    /**
     * @test
     */
    public function an_untouched_block_adds_no_store_text_colours() {
        $html = $this->render_store_list( [] );

        $this->assertStringNotContainsString( 'has-store-name-color', $html );
        $this->assertStringNotContainsString( 'has-store-details-color', $html );
        $this->assertStringNotContainsString( '--dokan-store-name-color', $html );
    }

    /**
     * @test
     */
    public function the_store_name_and_details_colours_are_set_separately() {
        $html = $this->render_store_list(
            [
                'storeNameColor'    => '#c0392b',
                'storeDetailsColor' => 'var(--wp--preset--color--accent-3)',
            ]
        );

        $this->assertStringContainsString( 'has-store-name-color', $html );
        $this->assertStringContainsString( 'has-store-details-color', $html );
        $this->assertStringContainsString( '--dokan-store-name-color:#c0392b', $html );
        $this->assertStringContainsString( '--dokan-store-details-color:var(--wp--preset--color--accent-3)', $html );
    }

    /**
     * @test
     */
    public function the_picture_position_and_text_sizes_are_applied() {
        $html = $this->render_store_list(
            [
                'avatarPosition'   => 'left',
                'storeNameSize'    => '32px',
                'storeDetailsSize' => 'var(--wp--preset--font-size--small)',
            ]
        );

        $this->assertStringContainsString( 'has-avatar-position-left', $html );
        $this->assertStringContainsString( 'has-store-name-size', $html );
        $this->assertStringContainsString( '--dokan-store-name-size:32px', $html );
        $this->assertStringContainsString( '--dokan-store-details-size:var(--wp--preset--font-size--small)', $html );
    }

    /**
     * @test
     */
    public function an_untouched_block_keeps_dokans_picture_position_and_sizes() {
        $html = $this->render_store_list( [] );

        $this->assertStringNotContainsString( 'has-avatar-position-', $html );
        $this->assertStringNotContainsString( 'has-store-name-size', $html );
        $this->assertStringNotContainsString( 'has-store-details-size', $html );
    }

    /**
     * @test
     */
    public function an_unknown_position_or_unsafe_size_is_dropped() {
        $html = $this->render_store_list(
            [
                'avatarPosition' => 'top',
                'storeNameSize'  => '20px;color:red',
            ]
        );

        $this->assertStringNotContainsString( 'has-avatar-position-', $html );
        $this->assertStringNotContainsString( 'has-store-name-size', $html );
        $this->assertStringNotContainsString( 'color:red', $html );
    }

    /**
     * @test
     */
    public function the_link_colour_reaches_the_store_name() {
        $html = $this->render_store_list( [ 'style' => [ 'elements' => [ 'link' => [ 'color' => [ 'text' => 'var:preset|color|accent-1' ] ] ] ] ] );

        $this->assertStringContainsString( 'has-store-link-color', $html );
        $this->assertStringContainsString( '--dokan-store-link-color:var(--wp--preset--color--accent-1)', $html );
    }

    /**
     * @test
     */
    public function an_unsafe_colour_is_dropped() {
        $html = $this->render_store_list( [ 'storeNameColor' => 'red;background:url(x)' ] );

        $this->assertStringNotContainsString( 'has-store-name-color', $html );
        $this->assertStringNotContainsString( 'url(x)', $html );
    }
}
