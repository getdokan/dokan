<?php

namespace WeDevs\Dokan\Test\Coupon;

use WeDevs\Dokan\Test\DokanTestCase;
use WC_Coupon;

class CouponTest extends DokanTestCase {

    /**
     * @param $coupons array
     * @return array
     */
    protected function create_coupon( array $coupons = [] ): array {
        $coupon_codes = [
            [
                'code' => 'test_coupon1',
                'status' => 'publish',
                'meta' => [
                    'discount_type' => 'percent',
                    'coupon_amount' => 20,
                ],
            ],
        ];
        $coupon_codes = array_merge( $coupon_codes, $coupons );
        foreach ( $coupon_codes as $coupon_item ) {
            $this->factory()->coupon->create_object( $coupon_item );
        }
        return $coupon_codes;
    }
    public function test_coupon_can_be_applied() {
        $order_id = $this->create_multi_vendor_order();
        $order = wc_get_order( $order_id );

        $coupons = $this->create_coupon();

        // Apply the coupon to the order
        foreach ( $coupons as $coupon ) {
            $order->apply_coupon( $coupon['code'] );
            $order->calculate_totals();
			$order->save();
        }

        $expected_parent = [
			'total' => 58,
			'discount' => 7,
		];
        $expected = [
            [
                'total' => 27,
                'discount' => 3,
            ],
            [
                'total' => 21,
                'discount' => 4,
            ],
        ];

        $this->assertEquals( $expected_parent['discount'], $order->get_total_discount() );
        $this->assertEquals( $expected_parent['total'], $order->get_total() );

        // order has sub orders
        $sub_orders = dokan_get_suborder_ids_by( $order_id );
        foreach ( $sub_orders as $key => $sub_order_id ) {
            $sub_order = wc_get_order( $sub_order_id );
            $this->assertEquals( $expected[ $key ]['discount'], $sub_order->get_total_discount() );
            $this->assertEquals( $expected[ $key ]['total'], $sub_order->get_total() );
        }
    }
}
