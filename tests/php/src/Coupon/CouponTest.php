<?php

namespace WeDevs\Dokan\Test\Coupon;

use Exception;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group coupon-discount
 */
class CouponTest extends DokanTestCase {

    public int $product_id1;
    public int $product_id2;

    public function set_up() {
        parent::set_up();

        $this->seller_id1 = $this->factory()->seller->create();
        $this->seller_id2 = $this->factory()->seller->create();

        $this->product_id1 = $this->factory()->product
            ->set_seller_id( $this->seller_id1 )
            ->create(
                [
                    'name' => 'Test Product 1',
                    'regular_price' => 50,
                    'price' => 50,
                ]
            );
        $this->product_id2 = $this->factory()->product
            ->set_seller_id( $this->seller_id2 )
            ->create(
                [
                    'name' => 'Test Product 2',
                    'regular_price' => 30,
                    'price' => 30,
                ]
            );

        $this->customer_id = $this->factory()->customer->create( [ 'email' => 'customer@gmail.com' ] );
    }

    public function get_order_data(): array {
        return [
			'status'      => 'wc-completed',
			'customer_id' => $this->customer_id,
			'meta_data'   => [],
			'line_items'  => [
				[
					'product_id' => $this->product_id1, // price 50
					'quantity'   => 2,
				],
				[
					'product_id' => $this->product_id2, // price 30
					'quantity'   => 1,
				],
			],
		];
    }

    /**
     * Test coupon data provider for all products.
     *
     * @return array[]
     */
    public function data_provider_for_all_products(): array {
        return [
            'coupon-pd-20' => [
                [
                    'code' => 'pd-20',
                    'status' => 'publish',
                    'meta' => [
                        'discount_type' => 'percent',
                        'coupon_amount' => 20,
                    ],
                ],
                [
					'discount' => 26,
                    'total_sub_order' => 2,
				],
            ],
        ];
    }

    /**
     * Test coupon with all products.
     *
     * @dataProvider data_provider_for_all_products
     * @throws Exception
     */
    public function test_coupon_with_all_products( $input, $expected ) {
        $coupon1 = $this->factory()->coupon->create_and_get( $input );

        $order_id = $this->factory()->order
            ->set_item_shipping()
            ->set_item_coupon( $coupon1 )
            ->create( $this->get_order_data() );

        $order = wc_get_order( $order_id );
        $this->assertEquals( $expected['discount'], $order->get_total_discount(), 'Discount should be 26' );
        // sub order
        $sub_orders = dokan_get_suborder_ids_by( $order_id );
        $this->assertCount( $expected['total_sub_order'], $sub_orders, 'Sub orders count should be 2' );
    }

    /**
     * Test coupon data provider for specific products.
     *
     * @return array[]
     */
    public function data_provider_for_specific_products(): array {
        return [
            'coupon-pd-20' => [
                [
					'code' => 'pd-20',
					'status' => 'publish',
					'meta' => [
						'discount_type' => 'fixed_product',
						'coupon_amount' => 5,
                        'individual_use' => 'no',
					],
				],
                [ 'discount' => 10 ],
            ],
        ];
    }

    /**
     * Test coupon with specific products.
     *
     * @dataProvider data_provider_for_specific_products
     * @throws Exception
     */
    public function test_coupon_with_specific_products( $input, $expected ) {
        $input['meta']['product_ids'] = [ $this->product_id1 ];
        $coupon1 = $this->factory()->coupon->create_and_get( $input );

        $order_id = $this->factory()->order
            ->set_item_shipping()
            ->set_item_coupon( $coupon1 )
            ->create( $this->get_order_data() );

        $order = wc_get_order( $order_id );
        $this->assertEquals( $expected['discount'], $order->get_total_discount(), 'Discount should be 10' );
    }

    public function test_coupon_with_usage_limit() {
        $input = [
            'code' => 'pd-20',
            'status' => 'publish',
            'meta' => [
                'discount_type' => 'percent',
                'coupon_amount' => 20,
                'usage_limit' => 1,
            ],
        ];

        $coupon1 = $this->factory()->coupon->create_and_get( $input );

        $order_id = $this->factory()->order
            ->set_item_shipping()
            ->set_item_coupon( $coupon1 )
            ->create( $this->get_order_data() );

        $order = wc_get_order( $order_id );
        $this->assertEquals( 26, $order->get_total_discount() );

        $order_id = $this->factory()->order
            ->set_item_shipping()
            ->set_item_coupon( $coupon1 )
            ->create( $this->get_order_data() );

        $order = wc_get_order( $order_id );
        $this->assertEquals( 0, $order->get_total_discount(), 'Discount should be 0' );
    }

    public function test_coupon_with_minimum_amount() {
        $input = [
            'code' => 'pd-20',
            'status' => 'publish',
            'meta' => [
                'discount_type' => 'percent',
                'coupon_amount' => 20,
                'minimum_amount' => 200,
            ],
        ];

        $coupon1 = $this->factory()->coupon->create_and_get( $input );

        $order_id = $this->factory()->order
            ->set_item_shipping()
            ->set_item_coupon( $coupon1 )
            ->create( $this->get_order_data() );

        $order = wc_get_order( $order_id );
        $this->assertNotContains( $input['code'], $order->get_coupon_codes(), 'Coupon code should not be applied' );
    }

    public function test_coupon_with_email_restrictions() {
        $input = [
            'code' => 'pd-20',
            'status' => 'publish',
            'meta' => [
                'discount_type' => 'percent',
                'coupon_amount' => 20,
                'customer_email' => [ 'customer1@gmail.com' ],
            ],
        ];
        $coupon1 = $this->factory()->coupon->create_and_get( $input );

        $order_id = $this->factory()->order
            ->set_item_shipping()
            ->set_item_coupon( $coupon1 )
            ->create( $this->get_order_data() );

        $order = wc_get_order( $order_id );
        $this->assertNotContains( $input['code'], $order->get_coupon_codes(), 'Coupon code should not be applied' );
    }
}
