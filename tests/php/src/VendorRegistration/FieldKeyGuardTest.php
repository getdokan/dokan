<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\FieldKeyGuard;
use WeDevs\Dokan\VendorRegistration\FormSetup;

/**
 * Covers the custom field key rules re-checked when a page with the block is saved.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class FieldKeyGuardTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();

        // Registered on `plugins_loaded`, which ran before the test's own hooks were reset.
        dokan_get_container()->get( FieldKeyGuard::class )->register_hooks();
    }

    /**
     * Block content with the given custom rows in one section.
     *
     * @param array[] $rows Rows: `id`, `metaKey`, `type`, optional `reused`.
     *
     * @return string
     */
    private function content( array $rows ): string {
        $rows = array_map(
            function ( $row ) {
                return array_merge(
                    [
                        'custom' => true,
                        'type'   => 'text',
                        'label'  => ucfirst( str_replace( 'dokan_vreg_', '', $row['metaKey'] ) ),
                    ],
                    $row
                );
            },
            $rows
        );

        return serialize_block(
            [
                'blockName'    => FormSetup::BLOCK_NAME,
                'attrs'        => [
					'sections' => [
						[
							'id' => 'additional',
							'rows' => $rows,
						],
					],
				],
                'innerBlocks'  => [],
                'innerHTML'    => '',
                'innerContent' => [],
            ]
        );
    }

    private function page( array $rows ): int {
        return $this->factory()->post->create(
            [
                'post_type'    => 'page',
                'post_status'  => 'publish',
                'post_content' => $this->content( $rows ),
            ]
        );
    }

    /**
     * The custom rows saved on a page, keyed by row ID: `metaKey`, `type`, `reused`.
     *
     * @param int $page_id Page ID.
     *
     * @return array
     */
    private function saved_rows( int $page_id ): array {
        $rows = [];

        foreach ( parse_blocks( get_post( $page_id )->post_content ) as $block ) {
            foreach ( $block['attrs']['sections'][0]['rows'] ?? [] as $row ) {
                $rows[ $row['id'] ] = [
                    'metaKey' => $row['metaKey'],
                    'type'    => $row['type'],
                    'reused'  => $row['reused'] ?? null,
                ];
            }
        }

        return $rows;
    }

    public function test_a_key_used_elsewhere_with_another_type_gets_a_key_of_its_own() {
        $this->page(
            [
				[
					'id' => 'a',
					'metaKey' => 'dokan_vreg_website',
					'type' => 'text',
				],
			]
        );

        $page_b = $this->page(
            [
				[
					'id' => 'b',
					'metaKey' => 'dokan_vreg_website',
					'type' => 'select',
				],
			]
        );

        $this->assertSame( 'dokan_vreg_website_2', $this->saved_rows( $page_b )['b']['metaKey'] );
    }

    public function test_a_new_field_never_shares_a_key_unless_it_was_picked() {
        $this->page(
            [
				[
					'id' => 'a',
					'metaKey' => 'dokan_vreg_website',
				],
			]
        );

        $silent = $this->page(
            [
				[
					'id' => 'b',
					'metaKey' => 'dokan_vreg_website',
				],
			]
        );
        $picked = $this->page(
            [
				[
					'id' => 'c',
					'metaKey' => 'dokan_vreg_website',
					'reused' => true,
				],
			]
        );

        $this->assertSame( 'dokan_vreg_website_2', $this->saved_rows( $silent )['b']['metaKey'] );
        $this->assertSame( 'dokan_vreg_website', $this->saved_rows( $picked )['c']['metaKey'] );
        $this->assertTrue( $this->saved_rows( $picked )['c']['reused'] );
    }

    public function test_a_picked_key_still_needs_the_same_type() {
        $this->page(
            [
				[
					'id' => 'a',
					'metaKey' => 'dokan_vreg_website',
					'type' => 'text',
				],
			]
        );

        $page_b = $this->page(
            [
				[
					'id' => 'b',
					'metaKey' => 'dokan_vreg_website',
					'type' => 'select',
					'reused' => true,
				],
			]
        );

        $this->assertSame( 'dokan_vreg_website_2', $this->saved_rows( $page_b )['b']['metaKey'] );
        $this->assertNull( $this->saved_rows( $page_b )['b']['reused'] );
    }

    public function test_a_page_keeps_the_keys_it_already_had() {
        $page_a = $this->page(
            [
				[
					'id' => 'a',
					'metaKey' => 'dokan_vreg_website',
				],
			]
        );
        $this->page(
            [
				[
					'id' => 'b',
					'metaKey' => 'dokan_vreg_website',
					'reused' => true,
				],
			]
        );

        // Re-saving page A (now sharing the key with B) changes nothing.
        wp_update_post(
            [
				'ID' => $page_a,
				'post_content' => $this->content(
                    [
						[
							'id' => 'a',
							'metaKey' => 'dokan_vreg_website',
							'label' => 'Site',
						],
                    ]
				),
			]
        );

        $this->assertSame( 'dokan_vreg_website', $this->saved_rows( $page_a )['a']['metaKey'] );
    }

    public function test_an_answered_key_cannot_change_type() {
        $page = $this->page(
            [
				[
					'id' => 'a',
					'metaKey' => 'dokan_vreg_website',
					'type' => 'text',
				],
			]
        );
        update_user_meta( $this->factory()->user->create(), 'dokan_vreg_website', 'https://example.com' );

        wp_update_post(
            [
				'ID' => $page,
				'post_content' => $this->content(
                    [
						[
							'id' => 'a',
							'metaKey' => 'dokan_vreg_website',
							'type' => 'select',
						],
                    ]
				),
			]
        );

        $this->assertSame( 'dokan_vreg_website_2', $this->saved_rows( $page )['a']['metaKey'] );
    }

    public function test_a_type_change_on_an_unanswered_key_only_this_page_uses_is_fine() {
        $page = $this->page(
            [
				[
					'id' => 'a',
					'metaKey' => 'dokan_vreg_website',
					'type' => 'text',
				],
			]
        );

        wp_update_post(
            [
				'ID' => $page,
				'post_content' => $this->content(
                    [
						[
							'id' => 'a',
							'metaKey' => 'dokan_vreg_website',
							'type' => 'select',
						],
                    ]
				),
			]
        );

        $this->assertSame( 'dokan_vreg_website', $this->saved_rows( $page )['a']['metaKey'] );
    }

    public function test_a_stale_editor_saving_the_clashing_key_again_gets_the_same_replacement() {
        $this->page(
            [
				[
					'id' => 'a',
					'metaKey' => 'dokan_vreg_website',
				],
			]
        );
        $page_b = $this->page(
            [
				[
					'id' => 'b',
					'metaKey' => 'dokan_vreg_website',
				],
			]
        );

        $this->assertSame( 'dokan_vreg_website_2', $this->saved_rows( $page_b )['b']['metaKey'] );

        // The editor still holds the key it sent the first time.
        wp_update_post(
            [
				'ID' => $page_b,
				'post_content' => $this->content(
                    [
						[
							'id' => 'b',
							'metaKey' => 'dokan_vreg_website',
							'label' => 'Web',
						],
                    ]
				),
			]
        );

        $this->assertSame( 'dokan_vreg_website_2', $this->saved_rows( $page_b )['b']['metaKey'] );
    }

    public function test_two_rows_in_one_form_cannot_share_a_key() {
        $page = $this->page(
            [
                [
					'id' => 'a',
					'metaKey' => 'dokan_vreg_website',
				],
                [
					'id' => 'b',
					'metaKey' => 'dokan_vreg_website',
				],
            ]
        );

        $rows = $this->saved_rows( $page );

        $this->assertSame( 'dokan_vreg_website', $rows['a']['metaKey'] );
        $this->assertSame( 'dokan_vreg_website_2', $rows['b']['metaKey'] );
    }

    public function test_the_replacement_skips_keys_taken_anywhere() {
        $this->page(
            [
				[
					'id' => 'a',
					'metaKey' => 'dokan_vreg_website',
				],
			]
        );
        $this->page(
            [
				[
					'id' => 'a2',
					'metaKey' => 'dokan_vreg_website_2',
					'reused' => true,
				],
			]
        );
        update_user_meta( $this->factory()->user->create(), 'dokan_vreg_website_3', 'x' );

        $page = $this->page(
            [
				[
					'id' => 'b',
					'metaKey' => 'dokan_vreg_website',
				],
			]
        );

        $this->assertSame( 'dokan_vreg_website_4', $this->saved_rows( $page )['b']['metaKey'] );
    }

    public function test_other_blocks_on_the_page_are_left_as_they_were() {
        $this->page(
            [
				[
					'id' => 'a',
					'metaKey' => 'dokan_vreg_website',
				],
			]
        );
        $paragraph = "<!-- wp:paragraph -->\n<p>Hello &amp; welcome</p>\n<!-- /wp:paragraph -->";

        $page = $this->factory()->post->create(
            [
                'post_type'    => 'page',
                'post_status'  => 'publish',
                'post_content' => $paragraph . "\n\n" . $this->content(
                    [
						[
							'id' => 'b',
							'metaKey' => 'dokan_vreg_website',
						],
					]
                ),
            ]
        );

        $this->assertStringStartsWith( $paragraph, get_post( $page )->post_content );
        $this->assertSame( 'dokan_vreg_website_2', $this->saved_rows( $page )['b']['metaKey'] );
    }

    public function test_blocks_nested_in_a_group_are_checked_too() {
        $this->page( [ [ 'id' => 'a', 'metaKey' => 'dokan_vreg_website' ] ] );

        $page = $this->factory()->post->create(
            [
                'post_type'    => 'page',
                'post_status'  => 'publish',
                'post_content' => "<!-- wp:group -->\n<div class=\"wp-block-group\">" . $this->content( [ [ 'id' => 'b', 'metaKey' => 'dokan_vreg_website' ] ] ) . "</div>\n<!-- /wp:group -->",
            ]
        );

        $this->assertStringContainsString( '"metaKey":"dokan_vreg_website_2"', get_post( $page )->post_content );
    }

    public function test_pages_without_a_clash_are_not_rewritten() {
        $content = $this->content(
            [
				[
					'id' => 'a',
					'metaKey' => 'dokan_vreg_website',
				],
			]
        ) . "\n<!-- custom marker -->";
        $page    = $this->factory()->post->create(
            [
				'post_type' => 'page',
				'post_content' => $content,
			]
        );

        $this->assertSame( $content, get_post( $page )->post_content );
    }
}
