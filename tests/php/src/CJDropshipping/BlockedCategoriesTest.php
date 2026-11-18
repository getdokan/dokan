<?php

namespace WeDevs\Dokan\Test\CJDropshipping;

use WeDevs\Dokan\CJDropshipping\Api\Catalog;
use WeDevs\Dokan\CJDropshipping\Api\Points;
use WeDevs\Dokan\CJDropshipping\Data\Schema;
use WeDevs\Dokan\CJDropshipping\Product\BlockedCategories;
use WeDevs\Dokan\CJDropshipping\Product\Drafts;
use WeDevs\Dokan\CJDropshipping\Product\Importer;
use WeDevs\Dokan\CJDropshipping\Product\OffSale;
use WeDevs\Dokan\CJDropshipping\Queue;
use WeDevs\Dokan\CJDropshipping\Security\Credentials;
use WeDevs\Dokan\CJDropshipping\Security\Crypto;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\CJDropshipping\Status;
use WeDevs\Dokan\CJDropshipping\Sync\Synchronizer;
use WeDevs\Dokan\CJDropshipping\Vendor\Access;
use WeDevs\Dokan\CJDropshipping\Vendor\Alerts;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;

/**
 * Admin-blocked CJ categories (B8).
 *
 * @since DOKAN_SINCE
 *
 * @group cj-dropshipping
 */
class BlockedCategoriesTest extends DokanTestCase {

    // CJ category of product P1 in the fake CJ.
    protected string $category = 'CAT-VAPE';

    public function set_up() {
        parent::set_up();

        Schema::install();
        $this->block( [] );
        update_option(
            Status::OPTION, [
				'state'        => Status::CONNECTED,
				'active_since' => time(),
			]
        );
        update_option(
            Credentials::OPTION, [
				'access_token'   => Crypto::encrypt( 'fake_access_token_1' ),
				'access_expires' => time() + 100 * DAY_IN_SECONDS,
				'open_id'        => Crypto::encrypt( '123' ),
			]
        );
        delete_option( Points::OPTION );
        delete_transient( 'dokan_cj_categories' );
        delete_transient( 'dokan_cj_product_' . md5( 'P1' ) );
        delete_user_meta( $this->seller_id1, Alerts::META );
        as_unschedule_all_actions( BlockedCategories::DRAFT_HOOK );

        add_filter( 'dokan_cj_requests_per_second', fn() => 1000 );
        add_filter( 'dokan_cj_email_vendor_alerts', '__return_false' );
        add_filter( 'pre_http_request', [ $this, 'fake_cj' ], 10, 3 );
    }

    protected function block( array $rows ): void {
        update_option(
            Settings::OPTION, [
				'enabled'            => 'on',
				'stock_source'       => 'all',
				'blocked_categories' => $rows,
			]
        );
    }

    public function fake_cj( $pre, $args, $url ) {
        if ( false === strpos( $url, 'cjdropshipping.com' ) ) {
            return $pre;
        }

        if ( false !== strpos( $url, 'getCategory' ) ) {
            $data = [
                [
                    'categoryFirstName' => 'Home',
                    'categoryFirstList' => [
                        [
                            'categorySecondName' => 'Smoking',
                            'categorySecondList' => [
                                [
									'categoryId'   => 'CAT-VAPE',
									'categoryName' => 'Vapes',
								],
                                [
									'categoryId'   => 'CAT-PIPE',
									'categoryName' => 'Pipes',
								],
                            ],
                        ],
                    ],
                ],
            ];
        } elseif ( false !== strpos( $url, 'listV2' ) ) {
            $data = [
                'totalRecords' => 2,
                'totalPages'   => 1,
                'content'      => [
                    [
                        'productList' => [
                            [
								'id'         => 'P1',
								'nameEn'     => 'Vape',
								'sellPrice'  => '2',
								'categoryId' => 'CAT-VAPE',
							],
                            [
								'id'         => 'P2',
								'nameEn'     => 'Case',
								'sellPrice'  => '2',
								'categoryId' => 'CAT-CASE',
							],
                        ],
                    ],
                ],
            ];
        } elseif ( false !== strpos( $url, 'getInventoryByPid' ) ) {
            $data = [
                'variantInventories' => [
                    [
                        'vid'       => 'V1',
                        'inventory' => [
                            [
								'countryCode'      => 'CN',
								'cjInventory'      => 0,
								'factoryInventory' => 50,
							],
                        ],
                    ],
                ],
            ];
        } else {
            $data = [
                'pid'        => 'P1',
                'status'     => '3',
                'categoryId' => $this->category,
                'variants'   => [
                    [
						'vid'              => 'V1',
						'variantSku'       => 'CJ-V1',
						'variantSellPrice' => 2.0,
					],
                ],
            ];
        }

        return [
            'headers'  => [],
            'body'     => wp_json_encode(
                [
					'code' => 200,
					'data' => $data,
				]
            ),
            'response' => [ 'code' => 200 ],
            'cookies'  => [],
        ];
    }

    protected function import() {
        wp_set_current_user( $this->seller_id1 );
        $category = $this->factory()->term->create( [ 'taxonomy' => 'product_cat' ] );

        return ( new Importer() )->import(
            $this->seller_id1, [
				'pid'          => 'P1',
				'vids'         => [ 'V1' ],
				'prices'       => [ 'V1' => 10 ],
				'category_ids' => [ $category ],
			]
        );
    }

    protected function publish( int $product_id ): void {
        wp_update_post(
            [
				'ID'          => $product_id,
				'post_status' => 'publish',
			]
        );
    }

    public function test_categories_come_flat_with_their_parents() {
        $categories = ( new Catalog() )->categories();

        $this->assertSame(
            [
				'id'     => 'CAT-VAPE',
				'name'   => 'Vapes',
				'parent' => 'Home › Smoking',
			],
            $categories[0]
        );
        $this->assertCount( 2, $categories );
    }

    public function test_setting_keeps_only_clean_rows() {
        $clean = Settings::sanitize_blocked_categories(
            [
				[
					'id'   => 'CAT-VAPE',
					'name' => '<b>Vapes</b>',
					'mode' => 'existing',
				],
				[
					'id'   => 'CAT-PIPE',
					'mode' => 'anything',
				],
				[ 'name' => 'no id' ],
				'junk',
			]
        );

        $this->assertSame(
            [
				[
					'id'   => 'CAT-VAPE',
					'name' => 'Vapes',
					'mode' => 'existing',
				],
				[
					'id'   => 'CAT-PIPE',
					'name' => 'CAT-PIPE',
					'mode' => 'imports',
				],
			],
            $clean
        );
    }

    public function test_blocked_category_is_hidden_from_search_and_refused_on_import() {
        $this->block(
            [
				[
					'id'   => 'CAT-VAPE',
					'name' => 'Vapes',
					'mode' => 'imports',
				],
			]
        );
        Access::accept_terms( $this->seller_id1 );
        wp_set_current_user( $this->seller_id1 );

        $request = new WP_REST_Request( 'GET', '/dokan/v1/cj-dropshipping/catalog' );
        $request->set_query_params( [ 'keyword' => 'blocked-search' ] );
        $items = rest_do_request( $request )->get_data()['items'];

        $this->assertSame( [ 'P2' ], array_column( $items, 'pid' ) );
        $this->assertArrayNotHasKey( 'category_id', $items[0] );

        $details = rest_do_request( new WP_REST_Request( 'GET', '/dokan/v1/cj-dropshipping/catalog/P1' ) )->get_data();
        $this->assertTrue( $details['blocked'] );

        $result = $this->import();
        $this->assertWPError( $result );
        $this->assertSame( 'dokan_cj_category_blocked', $result->get_error_code() );
    }

    public function test_block_for_new_imports_only_leaves_imported_products_on_sale() {
        $product_id = $this->import();
        $this->publish( $product_id );
        $this->assertSame( 'CAT-VAPE', get_post_meta( $product_id, BlockedCategories::META, true ) );

        $rows = [
			[
				'id'   => 'CAT-VAPE',
				'name' => 'Vapes',
				'mode' => 'imports',
			],
		];
        $this->block( $rows );
        ( new BlockedCategories() )->on_settings_saved( Settings::OPTION, [ 'blocked_categories' => $rows ], [] );

        $this->assertFalse( Queue::is_pending( BlockedCategories::DRAFT_HOOK ) );
        $this->assertTrue( ( new Synchronizer() )->sync_product( 'P1' ) );
        $this->assertSame( 'publish', get_post_status( $product_id ) );
    }

    public function test_block_with_existing_products_drafts_them_and_keeps_them_off_sale_until_unblocked() {
        $product_id = $this->import();
        $this->publish( $product_id );

        $rows = [
			[
				'id'   => 'CAT-VAPE',
				'name' => 'Vapes',
				'mode' => 'existing',
			],
		];
        $this->block( $rows );
        ( new BlockedCategories() )->on_settings_saved( Settings::OPTION, [ 'blocked_categories' => $rows ], [ 'blocked_categories' => [] ] );
        $this->assertTrue( Queue::is_pending( BlockedCategories::DRAFT_HOOK ) );

        ( new BlockedCategories() )->draft_batch( [ 'CAT-VAPE' ], 0 );

        $this->assertSame( 'draft', get_post_status( $product_id ) );
        $this->assertSame( 'category', get_post_meta( $product_id, Drafts::DRAFT_REASON_META, true ) );
        $this->assertArrayHasKey( 'category:' . $product_id, Alerts::all( $this->seller_id1 ) );
        $this->assertStringContainsString( '"Vapes"', Alerts::all( $this->seller_id1 )[ 'category:' . $product_id ]['message'] );

        // The vendor can't publish it again, or restore it, while the block stands.
        wp_set_current_user( $this->seller_id1 );
        $this->publish( $product_id );
        $this->assertSame( 'draft', get_post_status( $product_id ) );
        $this->assertSame( [], ( new OffSale() )->restorable( $this->seller_id1 ) );

        // Unblocked: the bulk action puts it back and clears the alert.
        $this->block( [] );
        $this->assertSame( [ $product_id ], ( new OffSale() )->restorable( $this->seller_id1 ) );
        $this->assertSame( 1, ( new OffSale() )->restore( $this->seller_id1 ) );
        $this->assertSame( 'publish', get_post_status( $product_id ) );
        $this->assertArrayNotHasKey( 'category:' . $product_id, Alerts::all( $this->seller_id1 ) );
    }

    protected function block_existing_and_draft( int $product_id ): void {
        $rows = [
			[
				'id'   => 'CAT-VAPE',
				'name' => 'Vapes',
				'mode' => 'existing',
			],
		];
        $this->block( $rows );
        ( new BlockedCategories() )->draft_batch( [ 'CAT-VAPE' ], 0 );
        $this->assertSame( 'draft', get_post_status( $product_id ) );
    }

    public function test_admin_publish_is_an_exception_until_the_admin_blocks_existing_products_again() {
        $product_id = $this->import();
        $this->publish( $product_id );
        $this->block_existing_and_draft( $product_id );

        wp_set_current_user( 1 );
        $this->publish( $product_id );

        $this->assertSame( 'publish', get_post_status( $product_id ) );
        $this->assertSame( '', get_post_meta( $product_id, Drafts::DRAFT_REASON_META, true ) );
        $this->assertArrayNotHasKey( 'category:' . $product_id, Alerts::all( $this->seller_id1 ) );

        // The daily sync keeps the admin's exception.
        $this->assertTrue( ( new Synchronizer() )->sync_product( 'P1' ) );
        $this->assertSame( 'publish', get_post_status( $product_id ) );

        // Switching the category to "existing" again is a new decision: the exception goes.
        ( new BlockedCategories() )->on_settings_saved(
            Settings::OPTION,
            [
				'blocked_categories' => [
					[
						'id'   => 'CAT-VAPE',
						'mode' => 'existing',
					],
				],
			],
            [
				'blocked_categories' => [
					[
						'id'   => 'CAT-VAPE',
						'mode' => 'imports',
					],
				],
			]
        );
        $this->assertTrue( Queue::is_pending( BlockedCategories::DRAFT_HOOK ) );
        ( new BlockedCategories() )->draft_batch( [ 'CAT-VAPE' ], 0 );
        $this->assertSame( 'draft', get_post_status( $product_id ) );
    }

    public function test_vendor_publishing_after_an_unblock_clears_the_category_state() {
        $product_id = $this->import();
        $this->publish( $product_id );
        $this->block_existing_and_draft( $product_id );
        $this->block( [] );

        wp_set_current_user( $this->seller_id1 );
        $this->publish( $product_id );

        $this->assertSame( 'publish', get_post_status( $product_id ) );
        $this->assertSame( '', get_post_meta( $product_id, Drafts::DRAFT_REASON_META, true ) );
        $this->assertArrayNotHasKey( 'category:' . $product_id, Alerts::all( $this->seller_id1 ) );
    }

    public function test_rest_editor_refuses_to_publish_a_blocked_product() {
        $product_id = $this->import();
        $this->publish( $product_id );
        $this->block_existing_and_draft( $product_id );

        wp_set_current_user( $this->seller_id1 );
        $product = wc_get_product( $product_id );
        $product->set_status( 'publish' );
        $result = ( new \WeDevs\Dokan\CJDropshipping\Product\Hooks() )->guard_rest_save( $product, null, false );

        $this->assertWPError( $result );
        $this->assertSame( 'dokan_cj_category_blocked', $result->get_error_code() );
    }

    public function test_copies_and_trashed_products_are_left_alone() {
        $product_id = $this->import();
        $this->publish( $product_id );

        $this->assertContains( BlockedCategories::META, ( new \WeDevs\Dokan\CJDropshipping\Product\Hooks() )->exclude_copy_meta( [] ) );

        // A plain product that still carries the meta, e.g. from an old copy.
        $copy = $this->factory()->product->create( [ 'post_author' => $this->seller_id1 ] );
        $this->publish( $copy );
        update_post_meta( $copy, BlockedCategories::META, 'CAT-VAPE' );

        $trashed = $this->factory()->product->create( [ 'post_author' => $this->seller_id1 ] );
        update_post_meta( $trashed, BlockedCategories::META, 'CAT-VAPE' );
        update_post_meta( $trashed, \WeDevs\Dokan\CJDropshipping\Data\LinkRepository::LINKED_META, 1 );
        wp_trash_post( $trashed );

        $this->block_existing_and_draft( $product_id );

        $this->assertSame( 'publish', get_post_status( $copy ) );
        $this->assertSame( 'trash', get_post_status( $trashed ) );
        $this->assertArrayNotHasKey( 'category:' . $copy, Alerts::all( $this->seller_id1 ) );
    }

    public function test_sync_learns_the_category_of_older_imports_and_drafts_them() {
        $product_id = $this->import();
        $this->publish( $product_id );
        delete_post_meta( $product_id, BlockedCategories::META );
        $this->block(
            [
				[
					'id'   => 'CAT-VAPE',
					'name' => 'Vapes',
					'mode' => 'existing',
				],
			]
        );

        // A price below cost would also take it off sale; the category reason wins.
        update_post_meta( $product_id, '_regular_price', '1' );
        update_post_meta( $product_id, '_price', '1' );

        $this->assertTrue( ( new Synchronizer() )->sync_product( 'P1' ) );

        $this->assertSame( 'CAT-VAPE', get_post_meta( $product_id, BlockedCategories::META, true ) );
        $this->assertSame( 'draft', get_post_status( $product_id ) );
        $this->assertSame( 'category', get_post_meta( $product_id, Drafts::DRAFT_REASON_META, true ) );
        $this->assertArrayNotHasKey( 'loss:' . $product_id, Alerts::all( $this->seller_id1 ) );
    }
}
