<?php

namespace WeDevs\Dokan\Test\CJDropshipping;

use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Data\Schema;
use WeDevs\Dokan\CJDropshipping\Product\Hooks;
use WeDevs\Dokan\CJDropshipping\Product\Importer;
use WeDevs\Dokan\CJDropshipping\Security\Crypto;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\CJDropshipping\Status;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Error;
use WP_REST_Request;

/**
 * Importing CJ products and keeping their CJ fields locked.
 *
 * @since DOKAN_SINCE
 *
 * @group cj-dropshipping
 */
class ImporterTest extends DokanTestCase {

    protected int $category_id;

    public function set_up() {
        parent::set_up();

        Schema::install();
        update_option(
            Settings::OPTION, [
				'enabled'      => 'on',
				'stock_source' => 'all',
			]
        );
        update_option(
            Status::OPTION, [
				'state'        => Status::CONNECTED,
				'active_since' => time(),
			]
        );
        update_option(
            'dokan_cj_credentials', [
				'access_token'   => Crypto::encrypt( 'fake_access_token_1' ),
				'access_expires' => time() + 100 * DAY_IN_SECONDS,
			]
        );
        delete_transient( 'dokan_cj_product_' . md5( 'P1' ) );

        $this->category_id = $this->factory()->term->create( [ 'taxonomy' => 'product_cat' ] );

        add_filter( 'dokan_cj_requests_per_second', fn() => 1000 );
        add_filter( 'pre_http_request', [ $this, 'fake_cj' ], 10, 3 );
        wp_set_current_user( $this->seller_id1 );
    }

    public function fake_cj( $pre, $args, $url ) {
        if ( false === strpos( $url, 'cjdropshipping.com' ) ) {
            return $pre;
        }

        if ( false !== strpos( $url, 'getInventoryByPid' ) ) {
            $data = [
                'variantInventories' => [
                    [
						'vid'       => 'V1',
						'inventory' => [
							[
								'countryCode'      => 'CN',
								'cjInventory'      => 2,
								'factoryInventory' => 100,
							],
						],
					],
                    [
						'vid'       => 'V2',
						'inventory' => [
							[
								'countryCode'      => 'US',
								'cjInventory'      => 8,
								'factoryInventory' => 0,
							],
						],
					],
                ],
            ];
        } else {
            $data = [
                'pid'             => 'P1',
                'productNameEn'   => 'Wooden Case',
                'productKeyEn'    => 'Color',
                'status'          => '3',
                'description'     => '<p>Case</p><script>alert(1)</script>',
                'productProEnSet' => [ 'COMMON' ],
                'variants'        => [
                    [
						'vid'              => 'V1',
						'variantSku'       => 'CJ-V1',
						'variantKey'       => 'Walnut',
						'variantSellPrice' => 2.0,
						'variantWeight'    => 120,
					],
                    [
						'vid'              => 'V2',
						'variantSku'       => 'CJ-V2',
						'variantKey'       => 'Bamboo',
						'variantSellPrice' => 3.0,
						'variantWeight'    => 100,
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

    protected function import( array $args ) {
        return ( new Importer() )->import(
            $this->seller_id1, array_merge(
                [
					'pid'          => 'P1',
					'vids'         => [ 'V1' ],
					'prices'       => [ 'V1' => 10 ],
					'category_ids' => [ $this->category_id ],
				], $args
            )
        );
    }

    public function test_import_creates_vendor_simple_product_with_cj_stock() {
        $product_id = $this->import( [] );

        $this->assertIsInt( $product_id );

        $product = wc_get_product( $product_id );
        $this->assertSame( 'simple', $product->get_type() );
        $this->assertSame( $this->seller_id1, (int) get_post_field( 'post_author', $product_id ) );
        $this->assertSame( 'Wooden Case - Walnut', $product->get_name() );
        $this->assertStringEndsWith( '-CJ-V1', $product->get_sku() );
        $this->assertSame( 97, $product->get_stock_quantity(), 'CJ 2 + factory 100 - buffer 5' );
        $this->assertFalse( $product->get_virtual() );
        $this->assertSame( '10', $product->get_regular_price() );
        $this->assertStringNotContainsString( '<script>', $product->get_description() );
        $this->assertTrue( ( new LinkRepository() )->is_cj_product( $product_id ) );
        $this->assertSame( 'V1', ( new LinkRepository() )->get( $product_id )['vid'] );
    }

    public function test_import_refuses_price_that_leaves_nothing_and_double_imports() {
        $error = $this->import( [ 'prices' => [ 'V1' => 1 ] ] );
        $this->assertInstanceOf( WP_Error::class, $error );
        $this->assertSame( 'dokan_cj_price_too_low', $error->get_error_code() );

        $this->assertIsInt( $this->import( [] ) );

        $error = $this->import( [] );
        $this->assertSame( 'dokan_cj_already_imported', $error->get_error_code() );
    }

    public function test_several_variants_need_variable_support() {
        $args = [
            'vids'   => [ 'V1', 'V2' ],
            'prices' => [
				'V1' => 10,
				'V2' => 12,
			],
        ];

        $this->assertSame( 'dokan_cj_variable_needs_pro', $this->import( $args )->get_error_code() );

        add_filter( 'dokan_cj_supports_variable_import', '__return_true' );
        $product_id = $this->import( $args );
        remove_filter( 'dokan_cj_supports_variable_import', '__return_true' );

        $product = wc_get_product( $product_id );
        $this->assertSame( 'variable', $product->get_type() );
        $this->assertCount( 2, $product->get_children() );
        $this->assertCount( 2, ( new LinkRepository() )->for_parent( $product_id ) );
        $this->assertSame( 3, wc_get_product( ( new LinkRepository() )->for_parent( $product_id )[1]['product_id'] )->get_stock_quantity() );
    }

    public function test_limit_errors_from_add_product_rules_stop_the_import() {
        add_filter( 'dokan_new_product_popup_args', fn() => new WP_Error( 'no-subscription', 'Limit reached' ) );

        $error = $this->import( [] );

        $this->assertSame( 'no-subscription', $error->get_error_code() );
        $this->assertSame( 403, $error->get_error_data()['status'] );
    }

    public function test_preview_earning_matches_the_saved_product_earning() {
        $product_id = $this->import( [] );

        $preview = Importer::earning( $this->seller_id1, 10, 2, $this->category_id );

        $this->assertEquals( dokan()->commission->get_earning_by_product( $product_id ), $preview['earning'] );
        $this->assertEquals( $preview['earning'] - 2, $preview['keeps'] );
    }

    public function test_vendor_rest_edit_cannot_change_locked_fields_or_drop_below_cost() {
        $product_id = $this->import( [] );
        $hooks      = new Hooks();
        $product    = wc_get_product( $product_id );
        $sku        = $product->get_sku();

        $product->set_sku( 'MY-OWN-SKU' );
        $product->set_stock_quantity( 999 );
        $product->set_name( 'Renamed' );
        $guarded = $hooks->guard_rest_save( $product, new WP_REST_Request(), false );

        $this->assertSame( $sku, $guarded->get_sku() );
        $this->assertSame( 97, $guarded->get_stock_quantity() );
        $this->assertSame( 'Renamed', $guarded->get_name() );

        $product = wc_get_product( $product_id );
        $product->set_regular_price( '1' );
        $this->assertSame( 'dokan_cj_price_too_low', $hooks->guard_rest_save( $product, new WP_REST_Request(), false )->get_error_code() );

        wp_set_current_user( $this->admin_id );
        $product->set_sku( 'ADMIN-SKU' );
        $this->assertSame( 'ADMIN-SKU', $hooks->guard_rest_save( $product, new WP_REST_Request(), false )->get_sku() );
    }

    public function test_editor_marks_locked_fields_and_buyers_see_no_stock_number() {
        $product_id = $this->import( [] );
        $hooks      = new Hooks();
        $items      = $hooks->lock_editor_fields(
            [
				[
					'id'   => 'sku',
					'type' => 'field',
				],
				[
					'id'   => 'name',
					'type' => 'field',
				],
			], $product_id
        );

        $this->assertTrue( $items[0]['disabled'] );
        $this->assertArrayNotHasKey( 'disabled', $items[1] );
        $this->assertSame( 'In stock', $hooks->hide_stock_number( '97 in stock', wc_get_product( $product_id ) ) );
    }

    public function test_duplicate_is_a_normal_product() {
        $product_id = $this->import( [] );
        $duplicate  = ( new \WC_Admin_Duplicate_Product() )->product_duplicate( wc_get_product( $product_id ) );

        $this->assertFalse( ( new LinkRepository() )->is_cj_product( $duplicate->get_id() ) );
        $this->assertSame( '', $duplicate->get_meta( '_dokan_cj_pid' ) );
    }

    public function test_classic_form_save_restores_cj_fields_and_takes_loss_off_sale() {
        $product_id = $this->import( [] );
        $product    = wc_get_product( $product_id );
        $sku        = $product->get_sku();

        // Classic form wrote these straight to the product.
        $product->set_virtual( true );
        $product->set_sku( 'VENDOR-SKU' );
        $product->set_regular_price( '1' );
        $product->save();

        ( new Hooks() )->reapply_after_classic_save( $product_id );

        $product = wc_get_product( $product_id );
        $this->assertFalse( $product->get_virtual() );
        $this->assertSame( $sku, $product->get_sku() );
        $this->assertSame( 'draft', get_post_status( $product_id ) );
        $this->assertArrayHasKey( 'loss:' . $product_id, \WeDevs\Dokan\CJDropshipping\Vendor\Alerts::all( $this->seller_id1 ) );
    }

    public function test_vendor_cannot_add_variations_change_type_or_strip_markers() {
        add_filter( 'dokan_cj_supports_variable_import', '__return_true' );
        $parent_id = $this->import(
            [
                'vids'   => [ 'V1', 'V2' ],
                'prices' => [
                    'V1' => 10,
                    'V2' => 12,
                ],
            ]
        );
        remove_filter( 'dokan_cj_supports_variable_import', '__return_true' );
        $hooks = new Hooks();

        $variation = new \WC_Product_Variation();
        $variation->set_parent_id( $parent_id );
        $this->assertSame( 'dokan_cj_locked', $hooks->guard_rest_save( $variation, new WP_REST_Request(), true )->get_error_code() );

        $request = new WP_REST_Request();
        $request->set_param( 'type', 'external' );
        $this->assertSame( 'dokan_cj_locked', $hooks->guard_rest_save( wc_get_product( $parent_id ), $request, false )->get_error_code() );

        $parent = wc_get_product( $parent_id );
        $parent->delete_meta_data( LinkRepository::LINKED_META );
        $guarded = $hooks->guard_rest_save( $parent, new WP_REST_Request(), false );
        $guarded->save();
        $this->assertTrue( ( new LinkRepository() )->is_cj_product( $parent_id ) );
    }

    public function test_second_link_for_same_vendor_variant_is_refused() {
        $links = new LinkRepository();

        $this->assertTrue( $links->link( 9001, 9001, $this->seller_id1, 'VX', 'PX' ) );
        $this->assertFalse( $links->link( 9002, 9002, $this->seller_id1, 'VX', 'PX' ) );
        $this->assertTrue( $links->link( 9003, 9003, $this->seller_id2, 'VX', 'PX' ) );
    }

    public function test_one_variant_is_simple_even_with_variable_support_and_skus_stay_unique() {
        add_filter( 'dokan_cj_supports_variable_import', '__return_true' );
        $product_id = $this->import( [] );
        remove_filter( 'dokan_cj_supports_variable_import', '__return_true' );

        $this->assertSame( 'simple', wc_get_product( $product_id )->get_type() );

        $importer = new Importer();
        $taken    = $importer->unique_sku( $this->seller_id1, 'CJ-V1' );
        $this->assertNotSame( wc_get_product( $product_id )->get_sku(), $taken );
        $this->assertStringEndsWith( '-CJ-V1-2', $taken );
    }
}
