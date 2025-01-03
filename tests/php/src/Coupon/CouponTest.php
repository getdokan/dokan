<?php

namespace WeDevs\Dokan\Test\Coupon;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group coupon-discount
 */
class CouponTest extends DokanTestCase {

    public int $product_id1;
    public int $product_id2;
    public int $category_id1;

    /**
     * Test coupon data provider for all coupons.
     *
     * @return array[]
     */
    public function data_provider(): array {
        $this->seller_id1 = $this->factory()->seller->create();
        $this->seller_id2 = $this->factory()->seller->create();

        // create product category and assign to product
        $this->category_id1 = $this->factory()->term->create( [ 'taxonomy' => 'product_cat' ] );

        $this->product_id1 = $this->factory()->product
            ->set_seller_id( $this->seller_id1 )
            ->create(
                [
                    'regular_price' => 50,
                    'price' => 50,
                ]
            );
        $this->product_id2 = $this->factory()->product
            ->set_seller_id( $this->seller_id2 )
            ->create(
                [
                    'regular_price' => 30,
                    'price' => 30,
                ]
            );

        $this->customer_id = $this->factory()->customer->create( [ 'email' => 'customer@gmail.com' ] );

        $order_items = [
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
        $product = wc_get_product( $this->product_id1 );
        $product->set_category_ids( [ $this->category_id1 ] );
        $product->save();

        return [
            'discount_type_percentage' => [
				[
					'coupons' => [
						[
							'code' => 'percent-10',
							'status' => 'publish',
							'meta' => [
								'discount_type' => 'percent',
								'coupon_amount' => 20,
							],
						],
					],
					'order_items' => $order_items,
				],
				[
					'discount' => 26,
				],
			],
			'discount_type_fixed_product' => [
				[
					'coupons' => [
						[
							'code' => 'fixed-product-5',
							'status' => 'publish',
							'meta' => [
								'discount_type' => 'fixed_product',
								'coupon_amount' => 5,
							],
						],
					],
					'order_items' => $order_items,
				],
				[
					'discount' => 15,
				],
			],
			'minimum_amount' => [
				[
					'coupons' => [
						[
							'code' => 'min-10',
							'status' => 'publish',
							'meta' => [
								'discount_type' => 'percent',
								'coupon_amount' => 10,
								'minimum_amount' => 150,
							],
						],
					],
					'order_items' => $order_items,
				],
				[
					'discount' => 0,
				],
			],
			'product_ids' => [
				[
					'coupons' => [
						[
							'code' => 'adm-10',
							'status' => 'publish',
							'meta' => [
								'discount_type' => 'percent',
								'coupon_amount' => 10,
								'product_ids' => [ $this->product_id1 ],
							],
						],
					],
					'order_items' => $order_items,
				],
				[
					'discount' => 10,
				],
			],
			'product_categories' => [
				[
					'coupons' => [
						[
							'code' => 'cat-10',
							'status' => 'publish',
							'meta' => [
								'discount_type' => 'percent',
								'coupon_amount' => 10,
								'product_categories' => [ $this->category_id1 ],
							],
						],
					],
					'order_items' => $order_items,
				],
				[
					'discount' => 10,
				],
			],
			'excluded_product_categories' => [
				[
					'coupons' => [
						[
							'code' => 'ex-cat-10',
							'status' => 'publish',
							'meta' => [
								'discount_type' => 'percent',
								'coupon_amount' => 10,
								'excluded_product_categories' => [ $this->category_id1 ],
							],
						],
					],
					'order_items' => $order_items,
				],
				[
					'discount' => 13,
				],
			],
			'email_restrictions' => [
				[
					'coupons' => [
						[
							'code' => 'email-10',
							'status' => 'publish',
							'meta' => [
								'discount_type' => 'fixed_product',
								'coupon_amount' => 10,
								'customer_email' => [ 'customer@gmail.com' ],
							],
						],
					],
					'order_items' => $order_items,
				],
				[
					'discount' => 0,
				],
			],
			'exclude_product_ids' => [
				[
					'coupons' => [
						[
							'code' => 'ex-prod-10',
							'status' => 'publish',
							'meta' => [
								'discount_type' => 'percent',
								'coupon_amount' => 10,
								'exclude_product_ids' => [ $this->product_id1 ],
							],
						],
					],
					'order_items' => $order_items,
				],
				[
					'discount' => 3,
				],
			],
            'single vendor order' => [
                [
					'single_vendor' => true,
					'coupons' => [
                        [
                            'code' => 'percent-10',
                            'status' => 'publish',
                            'meta' => [
                                'discount_type' => 'percent',
                                'coupon_amount' => 10,
                                'free_shipping' => 'yes',
                            ],
                        ],
                    ],
                    'order_items' => $order_items,
				],
                [
                    'discount' => 13,
                    'free_shipping' => true,
                ],
            ],
        ];
    }

    /**
     * Test coupon with all products.
     *
     * @dataProvider data_provider
     */
    public function test_coupon( $input, $expected ) {
        $order_factory = $this->factory()->order;
        if ( isset( $input['shipping'] ) ) {
            $order_factory->set_item_shipping( $input['shipping'] );
        } else {
            $order_factory->set_item_shipping(
                [
                    'name' => 'Flat Rate',
                    'amount' => 10,
                ]
            );
        }

        foreach ( $input['coupons'] as $coupon ) {
            $coupon_item = $this->factory()->coupon->create_and_get( $coupon );
            $order_factory->set_item_coupon( $coupon_item );
        }

        $order_items = $input['order_items'];

        if ( isset( $input['line_items'] ) ) {
            $order_items['line_items'] = [];
            foreach ( $input['line_items'] as $line_item ) {
                $product_factory = $this->factory()->product;
                if ( isset( $line_item['seller_id'] ) ) {
                    $product_factory->set_seller_id( $line_item['seller_id'] );
                }
                $order_items['line_items'][] = $product_factory->create( $line_item );
            }
        }

        $order_id = $order_factory->create( $order_items );

        $order = wc_get_order( $order_id );
        if ( isset( $expected['count_order'] ) ) {
            $sub_orders = dokan_get_suborder_ids_by( $order_id ) ?? [];
            $this->assertCount( $expected['count_order'], $sub_orders );
        }
        $this->assertEquals( $expected['discount'], $order->get_discount_total() );
    }
}
