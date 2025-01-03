<?php

namespace WeDevs\Dokan\Test\Coupon;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group coupon-discount
 */
class CouponTest extends DokanTestCase {

    /**
     * Test coupon data provider for all coupons.
     *
     * @return array[]
     */
    public function data_provider(): array {
        $seller_id1 = $this->factory()->seller->create();
        $seller_id2 = $this->factory()->seller->create();

        // create product category and assign to product
        $category_id1 = $this->factory()->term->create( [ 'taxonomy' => 'product_cat' ] );

        $product_id1 = $this->factory()->product
            ->set_seller_id( $seller_id1 )
            ->create(
                [
                    'regular_price' => 50,
                    'price' => 50,
                ]
            );
        $product_id2 = $this->factory()->product
            ->set_seller_id( $seller_id2 )
            ->create(
                [
                    'regular_price' => 30,
                    'price' => 30,
                ]
            );

        $customer_id = $this->factory()->customer->create( [ 'email' => 'customer@gmail.com' ] );

        $order_items = [
			'status'      => 'wc-completed',
			'customer_id' => $customer_id,
			'meta_data'   => [],
			'line_items'  => [
				[
					'product_id' => $product_id1, // price 50
					'quantity'   => 2,
				],
				[
					'product_id' => $product_id2, // price 30
					'quantity'   => 1,
				],
			],
		];

        $product = wc_get_product( $product_id1 );
        $product->set_category_ids( [ $category_id1 ] );
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
					'discount' => 26, // 20% of 130 = 26
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
					'discount' => 15, // Order items quantity 3, discount 5 = 3 * 5 = 15
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
					'discount' => 0, // Order total 130, minimum amount 150, so no discount
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
								'product_ids' => [ $product_id1 ],
							],
						],
					],
					'order_items' => $order_items,
				],
				[
					'discount' => 10, // Product id 1, discount 10%
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
								'product_categories' => [ $category_id1 ],
							],
						],
					],
					'order_items' => $order_items,
				],
				[
					'discount' => 10, // Product category 1, discount 10%
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
								'excluded_product_categories' => [ $category_id1 ],
							],
						],
					],
					'order_items' => $order_items,
				],
				[
					'discount' => 13, // Excluded product category 1, discount 10%
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
					'discount' => 0, // Customer email is matched, discount 10
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
								'exclude_product_ids' => [ $product_id1 ],
							],
						],
					],
					'order_items' => $order_items,
				],
				[
					'discount' => 3, // Excluded product id 1, discount 10%
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
        $order_factory = $this->factory()->order
        ->set_item_shipping(
            [
				'name' => 'Flat Rate',
				'amount' => 10,
			]
        );

        foreach ( $input['coupons'] as $coupon ) {
            $coupon_item = $this->factory()->coupon->create_and_get( $coupon );
            $order_factory->set_item_coupon( $coupon_item );
        }

        $order_id = $order_factory->create( $input['order_items'] );

        $order = wc_get_order( $order_id );
        $this->assertEquals( $expected['discount'], $order->get_discount_total() );
    }
}
