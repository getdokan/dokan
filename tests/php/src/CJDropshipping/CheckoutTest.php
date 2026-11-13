<?php

namespace WeDevs\Dokan\Test\CJDropshipping;

use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Data\Schema;
use WeDevs\Dokan\CJDropshipping\Data\VariantRepository;
use WeDevs\Dokan\CJDropshipping\Security\Credentials;
use WeDevs\Dokan\CJDropshipping\Security\Crypto;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\CJDropshipping\Shipping\Checkout;
use WeDevs\Dokan\CJDropshipping\Shipping\Method;
use WeDevs\Dokan\CJDropshipping\Shipping\Quote;
use WeDevs\Dokan\CJDropshipping\Status;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Error;

/**
 * CJ shipping quotes and checkout rules.
 *
 * @since DOKAN_SINCE
 *
 * @group cj-dropshipping
 */
class CheckoutTest extends DokanTestCase {

    // Origin country => [ price, days ] CJ returns; missing origin = can't ship.
    protected array $routes = [];

    protected array $requests = [];

    protected string $error_code = '';

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
            Credentials::OPTION, [
				'access_token'   => Crypto::encrypt( 'fake_access_token_1' ),
				'access_expires' => time() + 100 * DAY_IN_SECONDS,
			]
        );

        $variants = new VariantRepository();
        foreach ( [ 'VA', 'VB' ] as $vid ) {
            $variants->save(
                $vid, [
					'pid'      => 'P1',
					'sku'      => 'CJ-' . $vid,
					'cost_usd' => 2,
					'weight_g' => 100,
					'props'    => [ 'COMMON' ],
				]
            );
        }

        $this->routes     = [
            'CN' => [ 6.64, '4-6' ],
            'US' => [ 4.20, '3-7' ],
        ];
        $this->requests   = [];
        $this->error_code = '';

        add_filter( 'dokan_cj_requests_per_second', fn() => 1000 );
        add_filter( 'pre_http_request', [ $this, 'fake_cj' ], 10, 3 );
    }

    public function fake_cj( $pre, $args, $url ) {
        if ( false === strpos( $url, 'cjdropshipping.com' ) ) {
            return $pre;
        }

        $body             = json_decode( $args['body'], true );
        $this->requests[] = $body;
        $rows             = [];

        if ( $this->error_code ) {
            return [
                'headers'  => [],
                'body'     => wp_json_encode(
                    [
						'code'    => (int) $this->error_code,
						'message' => 'x',
					]
                ),
                'response' => [ 'code' => 200 ],
                'cookies'  => [],
            ];
        }

        foreach ( $body['reqDTOS'] as $dto ) {
            $origin = $dto['srcAreaCode'];

            if ( ! isset( $this->routes[ $origin ] ) ) {
                continue;
            }

            [ $price, $days ] = $this->routes[ $origin ];
            $rows[]           = [
				'srcArea'         => [ 'shortCode' => $origin ],
				'option'          => [ 'enName' => 'Cheap but slow' ],
				'arrivalTime'     => '20-40',
				'totalPostageFee' => $price - 1,
			];
            $rows[]           = [
                'srcArea'                => [ 'shortCode' => $origin ],
                'option'                 => [ 'enName' => 'Recommended ' . $origin ],
                'arrivalTime'            => $days,
                'totalPostageFee'        => $price,
                'compositeRecommendSort' => 1,
                'allRuleTips'            => 'BR' === $dto['destAreaCode'] ? [
					[
						'type'          => 'dutyNo',
						'interceptType' => '0',
					],
				] : [],
            ];
        }

        return [
            'headers'  => [],
            'body'     => wp_json_encode(
                [
					'code' => 200,
					'data' => $rows,
				]
            ),
            'response' => [ 'code' => 200 ],
            'cookies'  => [],
        ];
    }

    protected function stock( string $vid, array $countries ): void {
        $rows = [];
        foreach ( $countries as $country => $units ) {
            $rows[ $country ] = [
				'cj'      => $units,
				'factory' => 0,
			];
        }
        ( new VariantRepository() )->save_stock( $vid, $rows );
    }

    protected function items( array $quantities ): array {
        $items = [];
        foreach ( $quantities as $vid => $quantity ) {
            $items[] = [
				'vid'      => $vid,
				'quantity' => $quantity,
				'name'     => 'Item ' . $vid,
			];
        }

        return $items;
    }

    public function test_picks_recommended_route_from_fastest_warehouse_with_stock() {
        $this->stock(
            'VA', [
				'CN' => 100,
				'US' => 10,
			]
        );

        $quote = ( new Quote() )->get( $this->items( [ 'VA' => 2 ] ), 'MX', '01000' );

        $this->assertCount( 1, $quote['groups'] );
        $this->assertSame( 'CN', $quote['groups'][0]['warehouse'], 'CN 4-6 beats US 3-7 on the slowest day' );
        $this->assertSame( 'Recommended CN', $quote['groups'][0]['method'] );
        $this->assertEquals( 6.64, $quote['price_usd'] );
        $this->assertSame( [ 4, 6 ], $quote['days'] );
        $this->assertTrue( $quote['cross_border'] );
        $this->assertCount( 2, $this->requests[0]['reqDTOS'], 'Both warehouses quoted in one call' );
    }

    public function test_cart_no_single_warehouse_can_fill_is_split_and_summed() {
        $this->stock( 'VA', [ 'CN' => 100 ] );
        $this->stock( 'VB', [ 'US' => 100 ] );

        $quote = ( new Quote() )->get( $this->items( [ 'VA' => 1, 'VB' => 1 ] ), 'MX' ); // phpcs:ignore

        $this->assertCount( 2, $quote['groups'] );
        $this->assertEquals( 6.64 + 4.20, $quote['price_usd'] );
        $this->assertSame( [ 4, 7 ], $quote['days'], 'Slower warehouse range' );
    }

    public function test_blocked_country_no_stock_and_unreachable_name_the_items_never_cj() {
        $this->stock( 'VA', [ 'CN' => 1 ] );

        $blocked = ( new Quote() )->get( $this->items( [ 'VA' => 1 ] ), 'DE' );
        $this->assertSame( 'dokan_cj_blocked', $blocked->get_error_code() );
        $this->assertStringContainsString( 'Item VA', $blocked->get_error_message() );
        $this->assertStringNotContainsString( 'CJ', $blocked->get_error_message() );

        $this->assertSame( 'dokan_cj_no_stock', ( new Quote() )->get( $this->items( [ 'VA' => 5 ] ), 'MX' )->get_error_code() );

        $this->routes = [];
        $this->assertSame( 'dokan_cj_unreachable', ( new Quote() )->get( $this->items( [ 'VA' => 1 ] ), 'AQ' )->get_error_code() );
    }

    public function test_quote_is_cached_and_falls_back_when_cj_is_unavailable() {
        $this->stock( 'VA', [ 'CN' => 100 ] );

        $first = ( new Quote() )->get( $this->items( [ 'VA' => 1 ] ), 'MX', '1' );
        ( new Quote() )->get( $this->items( [ 'VA' => 1 ] ), 'MX', '1' );
        $this->assertCount( 1, $this->requests );

        // Cache gone, CJ out of points: the last quote (under 24h) is used.
        delete_transient( 'dokan_cj_quote_' . md5( wp_json_encode( [ 'MX', '1', [ 'single' => [ 'CN' ] ], false ] ) ) );
        $this->error_code = '16900500';
        $this->assertEquals( $first, ( new Quote() )->get( $this->items( [ 'VA' => 1 ] ), 'MX', '1' ) );

        // A new address with CJ down: the buyer is asked to try again.
        $error = ( new Quote() )->get( $this->items( [ 'VA' => 1 ] ), 'MX', '2' );
        $this->assertInstanceOf( WP_Error::class, $error );
        $this->assertSame( 'dokan_cj_unavailable', $error->get_error_code() );
    }

    public function test_route_required_fields_are_reported() {
        $this->stock( 'VA', [ 'CN' => 100 ] );

        $quote = ( new Quote() )->get( $this->items( [ 'VA' => 1 ] ), 'BR' );

        $this->assertSame( [ 'dutyNo' ], $quote['required'] );
    }

    public function test_split_packages_moves_cj_items_and_rates_are_cj_only() {
        $normal  = $this->factory()->product->create_and_get( [ 'regular_price' => 5 ] );
        $cj      = $this->factory()->product->create_and_get( [ 'regular_price' => 9 ] );
        ( new LinkRepository() )->link( $cj->get_id(), $cj->get_id(), $this->seller_id1, 'VA', 'P1' );
        $package = [
            'seller_id'   => $this->seller_id1,
            'contents'    => [
                'a' => [
					'product_id'   => $normal->get_id(),
					'variation_id' => 0,
					'quantity'     => 1,
					'line_total'   => 5,
					'data'         => $normal,
				],
                'b' => [
					'product_id'   => $cj->get_id(),
					'variation_id' => 0,
					'quantity'     => 1,
					'line_total'   => 9,
					'data'         => $cj,
				],
            ],
            'destination' => [
				'country'  => 'MX',
				'postcode' => '',
			],
        ];

        $split = ( new Checkout() )->split_packages( [ $package ] );

        $this->assertCount( 2, $split );
        $this->assertSame( [ 'a' ], array_keys( $split[0]['contents'] ) );
        $this->assertEquals( 5, $split[0]['contents_cost'] );
        $this->assertTrue( $split[1][ Checkout::PACKAGE_KEY ] );
        $this->assertEquals( 9, $split[1]['contents_cost'] );

        $rates = [
            'flat_rate:1'          => new \WC_Shipping_Rate( 'flat_rate:1', 'Flat', 3, [], 'flat_rate' ),
            Method::ID . ':1'      => new \WC_Shipping_Rate( Method::ID . ':1', 'Standard shipping', 7, [], Method::ID ),
        ];
        $this->assertSame( [ Method::ID . ':1' ], array_keys( ( new Checkout() )->only_cj_rates( $rates, $split[1] ) ) );
        $this->assertCount( 2, ( new Checkout() )->only_cj_rates( $rates, $split[0] ) );
        $this->assertTrue( ( new Checkout() )->skip_pickup( false, $split[1] ) );
    }

    public function test_shipping_goes_to_vendor_on_orders_with_cj_items() {
        $order = wc_create_order();
        $item  = new \WC_Order_Item_Product();
        $item->set_name( 'CJ thing' );
        $item->add_meta_data( '_dokan_cj_vid', 'VA', true );
        $order->add_item( $item );
        $order->save();

        $plain = wc_create_order();

        $checkout = new Checkout();
        $this->assertSame( 'seller', $checkout->vendor_gets_shipping( 'admin', $order->get_id() ) );
        $this->assertSame( 'admin', $checkout->vendor_gets_shipping( 'admin', $plain->get_id() ) );
    }

    public function test_label_names_warehouse_country_only_when_admin_allows_and_one_group() {
        $quote = [
            'groups' => [ [ 'warehouse' => 'CN' ] ],
        ];

        $this->assertSame( 'Standard shipping', Method::label( $quote ) );

        update_option(
            Settings::OPTION, [
				'enabled'                => 'on',
				'show_warehouse_country' => 'on',
			]
        );
        $this->assertSame( 'Ships from China', Method::label( $quote ) );

        $quote['groups'][] = [ 'warehouse' => 'US' ];
        $this->assertSame( 'Standard shipping', Method::label( $quote ) );
    }

    public function test_cache_key_includes_quantities_and_unreachable_is_cached() {
        $this->stock( 'VA', [ 'CN' => 100 ] );

        ( new Quote() )->get( $this->items( [ 'VA' => 1 ] ), 'MX' );
        ( new Quote() )->get( $this->items( [ 'VA' => 3 ] ), 'MX' );
        $this->assertCount( 2, $this->requests, 'A different quantity is a different quote' );

        $this->routes = [];
        ( new Quote() )->get( $this->items( [ 'VA' => 1 ] ), 'AQ' );
        ( new Quote() )->get( $this->items( [ 'VA' => 1 ] ), 'AQ' );
        $this->assertCount( 3, $this->requests, 'An unreachable route is not asked again' );
    }

    public function test_numeric_cj_ids_stay_strings_in_groups() {
        ( new VariantRepository() )->save(
            '1234567890', [
				'pid'      => 'P2',
				'sku'      => 'CJ-NUM',
				'cost_usd' => 2,
				'weight_g' => 100,
			]
        );
        $this->stock( '1234567890', [ 'CN' => 10 ] );

        $quote = ( new Quote() )->get( $this->items( [ '1234567890' => 1 ] ), 'MX' );

        $this->assertSame( [ '1234567890' ], $quote['groups'][0]['vids'] );
    }

    public function test_rate_shows_delivery_time_and_notes_but_no_warehouse() {
        $this->stock( 'VA', [ 'CN' => 100 ] );
        $product = $this->factory()->product->create_and_get( [ 'regular_price' => 9 ] );
        ( new LinkRepository() )->link( $product->get_id(), $product->get_id(), $this->seller_id1, 'VA', 'P1' );

        $method  = new Method();
        $package = [
            'seller_id'            => $this->seller_id1,
            Checkout::PACKAGE_KEY  => true,
            'contents'             => [
                'k' => [
					'product_id'   => $product->get_id(),
					'variation_id' => 0,
					'quantity'     => 1,
					'line_total'   => 9,
					'data'         => $product,
				],
            ],
            'destination'          => [
				'country'  => 'MX',
				'postcode' => '',
			],
        ];
        $method->calculate_shipping( $package );
        $rate = current( $method->rates );

        $this->assertSame( 'Standard shipping', $rate->get_label() );
        $this->assertSame( '4–6 days', $rate->get_delivery_time() );
        $this->assertSame( 'Import duties may apply.', $rate->get_description() );
        $this->assertStringNotContainsString( 'China', $rate->get_description() . $rate->get_label() );
    }
}
