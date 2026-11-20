<?php

namespace WeDevs\Dokan\Test\CJDropshipping;

use WeDevs\Dokan\CJDropshipping\Api\ProductDetails;
use WeDevs\Dokan\CJDropshipping\Data\Schema;
use WeDevs\Dokan\CJDropshipping\Data\VariantRepository;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\CJDropshipping\Status;
use WeDevs\Dokan\CJDropshipping\Vendor\Access;
use WeDevs\Dokan\CJDropshipping\Vendor\Navigation;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;

/**
 * Vendor CJ endpoints: access, start step, search and product details.
 *
 * @since DOKAN_SINCE
 *
 * @group cj-dropshipping
 */
class VendorRestTest extends DokanTestCase {

    protected int $calls = 0;

    public function set_up() {
        parent::set_up();

        Schema::install();
        $this->calls = 0;

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
				'access_token'   => \WeDevs\Dokan\CJDropshipping\Security\Crypto::encrypt( 'fake_access_token_1' ),
				'access_expires' => time() + 100 * DAY_IN_SECONDS,
			]
        );
        delete_user_meta( $this->seller_id1, Access::TERMS_META );

        add_filter( 'dokan_cj_requests_per_second', fn() => 1000 );
        add_filter( 'pre_http_request', [ $this, 'fake_cj' ], 10, 3 );
    }

    public function fake_cj( $pre, $args, $url ) {
        if ( false === strpos( $url, 'cjdropshipping.com' ) ) {
            return $pre;
        }

        ++$this->calls;

        if ( false !== strpos( $url, 'product/listV2' ) ) {
            $data = [
				'totalRecords' => 1,
				'totalPages'   => 1,
				'content'      => [
					[
						'productList' => [
							[
								'id'        => 'P1',
								'nameEn'    => 'Case',
								'sellPrice' => '2.00',
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
								'cjInventory'      => 3,
								'factoryInventory' => 900,
							],
						],
					],
				],
			];
        } elseif ( false !== strpos( $url, 'product/query' ) ) {
            $data = [
				'pid'             => 'P1',
				'productNameEn'   => 'Case',
				'status'          => '3',
				'productProEnSet' => [ 'COMMON' ],
				'variants'        => [
					[
						'vid'              => 'V1',
						'variantSku'       => 'CJ-V1',
						'variantSellPrice' => 2.5,
						'variantWeight'    => 100,
						'variantVolume'    => 2000,
					],
				],
			];
        } else {
            $data = [];
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

    protected function get( string $path, array $params = [] ) {
        $request = new WP_REST_Request( 'GET', '/dokan/v1/cj-dropshipping/' . $path );
        $request->set_query_params( $params );

        return rest_do_request( $request );
    }

    public function test_status_reports_start_step_until_terms_accepted() {
        wp_set_current_user( $this->seller_id1 );

        $status = $this->get( 'status' )->get_data();
        $this->assertTrue( $status['can_use'] );
        $this->assertFalse( $status['accepted_terms'] );
        $this->assertNotEmpty( $status['terms'] );

        $this->assertSame( 403, $this->get( 'catalog' )->get_status() );

        $request = new WP_REST_Request( 'POST', '/dokan/v1/cj-dropshipping/accept-terms' );
        $request->set_param( 'accepted', true );
        $this->assertTrue( rest_do_request( $request )->get_data()['accepted_terms'] );
        $this->assertSame( 200, $this->get( 'catalog', [ 'keyword' => 'case' ] )->get_status() );
    }

    public function test_staff_and_customers_cannot_use_cj() {
        // The vendor_staff role comes from Pro; give the user its capabilities directly.
        $staff_id = $this->factory()->user->create( [ 'role' => 'subscriber' ] );
        $staff    = get_user_by( 'id', $staff_id );
        $staff->add_cap( 'dokandar' );
        $staff->add_cap( 'vendor_staff' );
        update_user_meta( $staff_id, '_vendor_id', $this->seller_id1 );
        wp_set_current_user( $staff_id );

        $this->assertSame( 'staff', Access::blocked_reason( $staff_id ) );
        $this->assertFalse( ( new Navigation() )->add_menu( [] ) ? true : false );

        wp_set_current_user( $this->customer_id );
        $this->assertNotSame( 200, $this->get( 'status' )->get_status() );
    }

    public function test_disabled_module_hides_menu_and_blocks_endpoints() {
        update_option( Settings::OPTION, [ 'enabled' => 'off' ] );
        Access::accept_terms( $this->seller_id1 );
        wp_set_current_user( $this->seller_id1 );

        $this->assertSame( [], ( new Navigation() )->add_menu( [] ) );
        $this->assertSame( 403, $this->get( 'catalog' )->get_status() );
    }

    public function test_search_is_cached_and_converted_to_store_currency() {
        Access::accept_terms( $this->seller_id1 );
        wp_set_current_user( $this->seller_id1 );

        $first  = $this->get( 'catalog', [ 'keyword' => 'cached-case' ] )->get_data();
        $second = $this->get( 'catalog', [ 'keyword' => 'cached-case' ] )->get_data();

        $this->assertSame( 1, $this->calls );
        $this->assertSame( $first, $second );
        $this->assertArrayNotHasKey( 'price', $first['items'][0] );
        $this->assertArrayHasKey( 'cost', $first['items'][0] );
    }

    public function test_product_details_store_variants_and_count_factory_stock_by_default() {
        Access::accept_terms( $this->seller_id1 );
        wp_set_current_user( $this->seller_id1 );

        $data = $this->get( 'catalog/P1' )->get_data();

        $this->assertSame( 903, $data['variants'][0]['stock']['CN'] );
        $this->assertArrayNotHasKey( 'raw_stock', $data['variants'][0] );
        $this->assertSame( 0, $data['variants'][0]['imported_product_id'] );

        $variant = ( new VariantRepository() )->get( 'V1' );
        $this->assertEquals( 2.5, (float) $variant['cost_usd'] );
        $this->assertSame( 'COMMON', $variant['props'] );
        $this->assertSame(
            [
				'CN' => [
					'cj'      => 3,
					'factory' => 900,
				],
			], ( new VariantRepository() )->get_stock( 'V1' )
        );

        update_option(
            Settings::OPTION, [
				'enabled'      => 'on',
				'stock_source' => 'warehouse',
			]
        );
        $this->assertSame(
            3, ProductDetails::counted(
                [
					'cj'      => 3,
					'factory' => 900,
				]
            )
        );
    }
}
