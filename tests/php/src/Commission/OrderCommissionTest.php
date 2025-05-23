<?php

namespace WeDevs\Dokan\Test\Commission;

use WC_Coupon;
use WC_Order;
use WeDevs\Dokan\Vendor\Coupon;

/**
 * @group commission
 * @group commission-order
 */
class OrderCommissionTest extends \WeDevs\Dokan\Test\DokanTestCase {
    protected array $order_data = [];

    /**
     * @dataProvider get_order_commission_data
	 *
	 * Commission and vendor earning calculation formula:
	 *
	 * Admin net commission =  (item_subtotal - vendor discount) * commission_rate) - admin_discount
	 * Vendor net earning = (item_subtotal - total discount) - admin_commission
	 * Admin commission = Admin net commission + Shipping fee + admin tax fee + shipping tax fee // When shipping fee recipient is admin
	 * Vendor earning = Vendor net earning + shipping fee + vendor tax fee
     *
	 * For Refund:
	 * Vendor earning in refund = item net vendor earning * refund_amount / item_total
	 * Admin commission in refund = item net admin commission * refund_amount / item_total
	 *
     * @return void
     */
    public function test_calculate_for_order( $case_name, $data, $settings, $expected ) {
        $seller_id = $this->seller_id1;

        $this->set_order_data( $data ['order'] );
        $this->set_settings( $settings );

        $order_id = $this->create_single_vendor_order( $seller_id );
        $order = wc_get_order( $order_id );
        $order->calculate_totals();
		$order_total = $order->get_total();

		if ( isset( $data['coupon'] ) ) {
			$coupon = $this->create_coupon( $data['coupon'], $order );

			$order->apply_coupon( $data['coupon']['code'] );
			$order->calculate_totals();
			$this->assertNotEquals( $order_total, $order->get_total(), 'Order total should be equal to expected' );
		}

		$order = new WC_Order( $order->get_id() );

        $order_id = $order->get_id();

        $this->assertNotEmpty( $order_id, 'Order ID should not be empty' );

        $this->assertEquals( $expected['total'], $order->get_total(), 'Order total should be equal to expected' );

        $order_commission = dokan_get_container()->get( \WeDevs\Dokan\Commission\OrderCommission::class );
        $order_commission->set_order( $order );
        $order_commission->calculate();

        $this->assertEquals( $expected['net_commission'], number_format( $order_commission->get_admin_net_commission(), 2 ), 'Admin net commission should be equal to expected' );
        $this->assertEquals( $expected['commission'], number_format( $order_commission->get_admin_commission(), 2 ), 'Admin commission should be equal to expected' );
        $this->assertEquals( $expected['vendor_earnings'], number_format( $order_commission->get_vendor_earning(), 2 ), 'Vendor earnings should be equal to expected' );
        $this->assertEquals( $expected['vendor_net_earnings'], number_format( $order_commission->get_vendor_net_earning(), 2 ), 'Vendor net earnings should be equal to expected' );

        if ( isset( $data['refund'] ) ) {
			$this->create_refund_and_ensure_vendor_earning_deduction( $order, $data['refund'], $expected['refund'] );
        }
    }

	/**
	 * Create a coupon.
	 *
	 * @param array $coupon_data
	 * @param WC_Order $order
	 *
	 * @return int
	 */
	protected function create_coupon( array $coupon_data, $order ) {
		$place_holders = $this->get_common_placeholders();

		$item_index = 1;

		foreach ( $order->get_items() as $item ) {
			$place_holders[ '{product_item_id' . $item_index . '}' ] = $item->get_product_id();
			$place_holders[ '{product_id' . $item_index . '}' ] = $item->get_product_id();
			$place_holders[ '{product_id_of_item' . $item_index . '}' ] = $item->get_product_id();
			++$item_index;
		}

		$coupon_data = json_encode( $coupon_data );
		$coupon_data = str_replace( array_keys( $place_holders ), array_values( $place_holders ), $coupon_data );
		$coupon_data = json_decode( $coupon_data, true );

		$coupon = $this->factory()->coupon->create( $coupon_data );

		return $coupon;
	}

    protected function create_refund_and_ensure_vendor_earning_deduction( $order, array $refund_data, array $expected ) {
        $order_items = $order->get_items();
		$item_index = 0;

		$place_holders = [
			'{order_id}' => $order->get_id(),
		];

        foreach ( $order_items as $item_id => $item ) {
			++$item_index;

			$place_holders[ '{item_id' . $item_index . '}' ] = $item_id;
        }

        $refund_data = json_encode( $refund_data );
		$refund_data = str_replace( array_keys( $place_holders ), array_values( $place_holders ), $refund_data );
		$refund_data = json_decode( $refund_data, true );

        // Create the refund object.
        $refund_order = wc_create_refund(
            $refund_data
        );

		$this->assertEquals( -1 * $refund_data['amount'], $refund_order->get_total(), 'Refund amount should be equal to expected' );

		$order_commission = dokan_get_container()->get( \WeDevs\Dokan\Commission\OrderCommission::class );
		$order_commission->set_order( $order );
		$order_commission->calculate();

        $this->assertEquals( $expected['net_commission'], number_format( $order_commission->get_admin_net_commission(), 2 ), 'Admin net commission should be equal to expected' );
		$this->assertEquals( $expected['commission'], number_format( $order_commission->get_admin_commission(), 2 ), 'Admin commission should be equal to expected' );
        $this->assertEquals( $expected['vendor_earnings'], number_format( $order_commission->get_vendor_earning(), 2 ), 'Vendor earnings should be equal to expected' );
        $this->assertEquals( $expected['vendor_net_earnings'], number_format( $order_commission->get_vendor_net_earning(), 2 ), 'Vendor net earnings should be equal to expected' );

		$refund_commission = $order_commission->calculate_for_refund( $refund_order );

		$this->assertEquals( $expected['vendor_earning_in_refund'], number_format( $refund_commission->get_vendor_net_earning(), 2 ), 'Refund total should be equal to expected' );
		$this->assertEquals( $expected['commission_in_refund'], number_format( $refund_commission->get_admin_net_commission(), 2 ), 'Refund total should be equal to expected' );

		$this->ensure_vendor_balance_created_for_refund(
			number_format( $refund_commission->get_vendor_net_earning(), 2 ),
			$order->get_id()
		);
	}

	/**
	 * Ensure a vendor balance record exists for a refund.
	 *
	 * @param float $min_vendor_earning_in_refund
	 * @param int   $order_id
	 *
	 * @return void
	 */
	protected function ensure_vendor_balance_created_for_refund( float $min_vendor_earning_in_refund, int $order_id ): void {
		global $wpdb;

		$count = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->dokan_vendor_balance} WHERE trn_type = %s AND trn_id = %d AND credit >= %f",
                'dokan_refund',
                $order_id,
                (int) $min_vendor_earning_in_refund
            )
		);
		$this->assertGreaterThanOrEqual( 1, $count );
	}

	protected function set_settings( array $settings ) {
		if ( ! empty( $settings['commission']['global'] ) ) {
			( new \WeDevs\Dokan\Commission\Settings\GlobalSetting( 0 ) )->save( $settings['commission']['global'] );
		}

		$selling_options = get_option( 'dokan_selling' );

		if ( ! empty( $settings['shipping_fee_recipient'] ) ) {
			$selling_options['shipping_fee_recipient'] = $settings['shipping_fee_recipient'];
		}

		if ( ! empty( $settings['tax_fee_recipient'] ) ) {
			$selling_options['tax_fee_recipient'] = $settings['tax_fee_recipient'];
		}

		if ( ! empty( $settings['shipping_tax_fee_recipient'] ) ) {
			$selling_options['shipping_tax_fee_recipient'] = $settings['shipping_tax_fee_recipient'];
		}

		update_option( 'dokan_selling', $selling_options );
	}

	protected function set_order_data( array $order_data ) {
		$this->order_data = $order_data;
	}

    /**
     * Get order data.
     *
     * @param array $order_data
     *
     * @return array
     */
	protected function get_order_data( array $place_holders ): array {
		$data = json_encode( $this->order_data );
		$data = str_replace( array_keys( $place_holders ), array_values( $place_holders ), $data );
		$data = json_decode( $data, true );

		return $data;
	}

	protected function get_common_placeholders() {
		return [
			'{seller_id1}' => $this->seller_id1,
			'{vendor_id1}' => $this->seller_id1,
			'{seller_id2}' => $this->seller_id2,
			'{vendor_id2}' => $this->seller_id2,
			'{customer_id}' => $this->customer_id,
		];
	}

	protected function get_multi_vendor_order_data() {
		$placeholder = $this->get_common_placeholders();

		return $this->get_order_data( $placeholder );
	}

	public static function get_order_commission_data() {
		return [
			[
				'case' => 'shipping_fee_recipient_seller',
				'data' => [
					'order' => [
						'shipping_item_list' => [
							[
								'name' => 'Shipping Fee 1',
								'amount' => 15,
								'seller_id' => '{seller_id1}',
							],
							[
								'name' => 'Shipping Fee 2',
								'amount' => 5,
								'seller_id' => '{seller_id2}',
							],
						],
						'status'      => 'processing',
						'customer_id' => '{customer_id}',
						'line_items' => array(
							array(
								'product' => [
									'name' => 'Test Product 1',
									'regular_price' => 5,
									'price' => 5,
									'seller_id' => '{seller_id1}',
								],
								'quantity'   => 3,
								'meta_data' => [
									'coupon_info' => '{seller_id1}',
								],
							),
							array(
								'product' => [
									'name' => 'Test Product 2',
									'regular_price' => 10,
									'price' => 10,
									'seller_id' => '{seller_id2}',
								],
								'quantity'   => 2,
							),
						),
					],
				],
				'settings' => [
					'commission' => [
						'global' => [
							'type' => 'flat',
							'percentage' => 10,
							'flat' => 0,
						],
					],
					'shipping_fee_recipient' => 'seller',
				],
				'expected' => [
					'total' => 55,
					'commission' => 3.5,
					'vendor_earnings' => 51.5,
					'vendor_net_earnings' => 31.5,
					'net_commission' => 3.5,
				],
			],
			[
				'case' => 'shipping_fee_recipient_admin',
				'data' => [
					'order' => [
						'shipping_item_list' => [
							[
								'name' => 'Shipping Fee 1',
								'amount' => 15,
								'seller_id' => '{seller_id1}',
							],
							[
								'name' => 'Shipping Fee 2',
								'amount' => 5,
								'seller_id' => '{seller_id2}',
							],
						],
						'status'      => 'processing',
						'customer_id' => '{customer_id}',
						'line_items' => array(
							array(
								'product' => [
									'name' => 'Test Product 1',
									'regular_price' => 5,
									'price' => 5,
									'seller_id' => '{seller_id1}',
								],
								'quantity'   => 3,
								'meta_data' => [
									'coupon_info' => '{seller_id1}',
								],
							),
							array(
								'product' => [
									'name' => 'Test Product 2',
									'regular_price' => 10,
									'price' => 10,
									'seller_id' => '{seller_id2}',
								],
								'quantity'   => 2,
							),
						),
					],
				],
				'settings' => [
					'commission' => [
						'global' => [
							'type' => 'flat',
							'percentage' => 10,
							'flat' => 0,
						],
					],
					'shipping_fee_recipient' => 'admin',
				],
				'expected' => [
					'total' => 55,
					'commission' => 23.5,
					'vendor_earnings' => 31.5,
					'vendor_net_earnings' => 31.5,
					'net_commission' => 3.5,
				],
			],

			[
				'case' => 'Coupon applied and refunded a item',
				'data' => [
					'order' => [
						'shipping_item_list' => [
							[
								'name' => 'Shipping Fee 1',
								'amount' => 15,
								'seller_id' => '{seller_id1}',
							],
							[
								'name' => 'Shipping Fee 2',
								'amount' => 5,
								'seller_id' => '{seller_id2}',
							],
						],
						'status'      => 'processing',
						'customer_id' => '{customer_id}',
						'line_items' => array(
							array(
								'product' => [
									'name' => 'Test Product 1',
									'regular_price' => 5,
									'price' => 5,
									'seller_id' => '{seller_id1}',
								],
								'quantity'   => 3,
							),
							array(
								'product' => [
									'name' => 'Test Product 2',
									'regular_price' => 10,
									'price' => 10,
									'seller_id' => '{seller_id2}',
								],
								'quantity'   => 2,  // Admin commission = 10 * 2 * 10% = 2
							),
						),
					],
					'coupon' => [
						'code' => 'testcoupon',
						'meta' => [
							'discount_type' => 'percent', // percent/fixed_product
							'coupon_amount' => 20,
							'product_ids' => [ '{product_item_id1}' ],
							'excluded_product_ids' => [],
							'admin_coupons_enabled_for_vendor' => 'yes',
							'coupons_vendors_ids' => [],
							'coupons_exclude_vendors_ids' => [],
							'coupon_commissions_type' => 'from_admin',
							'admin_shared_coupon_type' => '', // flat/percentage
							'admin_shared_coupon_amount' => '',
						],
					],
					'refund' => [
						'amount'         => 5,
						'reason'         => 'Testing Refund',
						'order_id'       => '{order_id}',
						'line_items'     => [
							'{item_id1}' => [
								'qty'          => 1,
								'refund_total' => 5, // Commission in Refund = - 1.5 /12 * 5
								'refund_tax'   => array(),
							],
						],
						'refund_payment' => false,
					],
				],
				'settings' => [
					'commission' => [
						'global' => [
							'type' => 'fixed',
							'percentage' => 10,
							'flat' => 0,
						],
					],
					'shipping_fee_recipient' => 'admin',
				],
				'expected' => [
					'total' => 55 - 3,
					'net_commission' => 3.5 - 3, // Shipping fee - Admin commission = 0.5
					'commission' => 20 + 3.5 - 3, // Shipping fee + Admin Net Commission
					'vendor_earnings' => 31.5, // 13.5 + 18
					'vendor_net_earnings' => 31.5,
					'refund' => [ // Refund amount = 5
						'commission_in_refund' => number_format( ( 5 / 12 * -1.5 ), 2 ), // Sum of ( Item wise net commission in refund = commission before refund * refund amount / paid amount ).
						'vendor_earning_in_refund' => number_format( 5 / 12 * 13.5, 2 ), // Sum of ( Item wise net earning in refund  = earning before refund * refund amount / paid amount ).
						'net_commission' => number_format( 0.5 - ( -1.5 / 12 * 5 ), 2 ), // Net commission after refund =  (Net commission before refund - Net commission in refund),
						'commission' => number_format( 20 + 0.5 - ( -1.5 / 12 * 5 ), 2 ), // Admin Shipping Fee + Net commission after refund
						'vendor_earnings' => number_format( 31.5 - ( 13.5 / 12 * 5 ), 2 ), // Item wise Vendor earning in refund = earning_before_refund / paid_amount * refund_amount
						'vendor_net_earnings' => number_format( 31.5 - ( 13.5 / 12 * 5 ), 2 ), // Item wise Vendor earning in refund = earning_before_refund / paid_amount * refund_amount
					],
				],
			],
            [
				'case' => 'Coupon applied (from_vendor commission)',
				'data' => [
					'order' => [
						'shipping_item_list' => [
							[
								'name' => 'Shipping Fee 1',
								'amount' => 15,
								'seller_id' => '{seller_id1}',
							],
							[
								'name' => 'Shipping Fee 2',
								'amount' => 5,
								'seller_id' => '{seller_id2}',
							],
						],
						'status'      => 'processing',
						'customer_id' => '{customer_id}',
						'line_items' => array(
							array(
								'product' => [
									'name' => 'Test Product 1',
									'regular_price' => 5,
									'price' => 5,
									'seller_id' => '{seller_id1}',
								],
								'quantity'   => 3,
							),
							array(
								'product' => [
									'name' => 'Test Product 2',
									'regular_price' => 10,
									'price' => 10,
									'seller_id' => '{seller_id2}',
								],
								'quantity'   => 2,  // Admin commission = 10 * 2 * 10% = 2
							),
						),
					],
					'coupon' => [
						'code' => 'vendor-test-coupon',
						'meta' => [
							'discount_type' => 'percent',
							'coupon_amount' => 20,
							'product_ids' => [ '{product_item_id1}' ],
							'excluded_product_ids' => [],
							'admin_coupons_enabled_for_vendor' => 'yes',
							'coupons_vendors_ids' => [],
							'coupons_exclude_vendors_ids' => [],
							'coupon_commissions_type' => 'from_vendor',
							'admin_shared_coupon_type' => '',
							'admin_shared_coupon_amount' => '',
						],
					],
				],
				'settings' => [
					'commission' => [
						'global' => [
							'type' => 'fixed',
							'percentage' => 10,
							'flat' => 0,
						],
					],
					'shipping_fee_recipient' => 'admin',
				],
				'expected' => [
					'total' => 55 - 3, // line_item_total - coupon
					'net_commission' => 3.2, // (35 - 3) * 10% = 3.2
					'commission' => 20 + 3.2, // shipping fee + net commission
					'vendor_earnings' => ( 35 - 3 ) - 3.2, // line_item_total - coupon - commission(12.15 + 18)
					'vendor_net_earnings' => ( 35 - 3 ) - 3.2,
				],
			],
            [
				'case' => 'Coupon applied commission type shared (admin 60% vendor 40%) and refunded a item',
				'data' => [
					'order' => [
						'shipping_item_list' => [
							[
								'name' => 'Shipping Fee 1',
								'amount' => 15,
								'seller_id' => '{seller_id1}',
							],
							[
								'name' => 'Shipping Fee 2',
								'amount' => 5,
								'seller_id' => '{seller_id2}',
							],
						],
						'status'      => 'processing',
						'customer_id' => '{customer_id}',
						'line_items' => array(
							array(
								'product' => [
									'name' => 'Test Product 1',
									'regular_price' => 5,
									'price' => 5,
									'seller_id' => '{seller_id1}',
								],
								'quantity'   => 3,
							),
							array(
								'product' => [
									'name' => 'Test Product 2',
									'regular_price' => 10,
									'price' => 10,
									'seller_id' => '{seller_id2}',
								],
								'quantity'   => 2,  // Admin commission = 10 * 2 * 10% = 2
							),
						),
					],
					'coupon' => [
						'code' => 'vendor-test-coupon-shared',
						'meta' => [
							'discount_type' => 'percent',
							'coupon_amount' => 20,
							'product_ids' => [],
							'excluded_product_ids' => [],
							'admin_coupons_enabled_for_vendor' => 'yes',
							'coupons_vendors_ids' => [],
							'coupons_exclude_vendors_ids' => [],
							'coupon_commissions_type' => 'shared_coupon',
							'admin_shared_coupon_type' => 'percentage',
							'admin_shared_coupon_amount' => '60',
						],
					],
                    'refund' => [
						'amount'         => 5,
						'reason'         => 'Testing Refund',
						'order_id'       => '{order_id}',
						'line_items'     => [
							'{item_id1}' => [
								'qty'          => 1,
								'refund_total' => 5,
								'refund_tax'   => array(),
							],
						],
						'refund_payment' => false,
					],
				],
				'settings' => [
					'commission' => [
						'global' => [
							'type' => 'fixed',
							'percentage' => 10,
							'flat' => 0,
						],
					],
					'shipping_fee_recipient' => 'admin',
				],
				'expected' => [
					'total' => 55 - 7, // line_item_total - coupon
					'net_commission' => number_format( -0.98, 2 ), // ((35 - 2.8) * 10%) - 4.2 = -0.98
					'commission' => number_format( 20 - 0.98, 2 ), // shipping fee + net commission
					'vendor_earnings' => 28.98, // ( 35 - (3+4) ) + 0.98  line_item_total - coupon - commission (12.42 + 16.56)
					'vendor_net_earnings' => 28.98, // vendor_earnings

                    'refund' => [
                        'commission_in_refund' => number_format( ( 5 / 12 * -0.42 ), 2 ), // Sum of (Item wise net commission in refund = commission before refund * refund amount / paid amount ).
                        'vendor_earning_in_refund' => number_format( 5 / 12 * 12.42, 2 ), // Sum of (Item wise net earning in refund = earning before refund * refund amount / paid amount ).
                        'net_commission' => number_format( -0.98 - ( 5 / 12 * -0.42 ), 2 ), // Net commission after refund =  (Net commission before refund - Net commission in refund),
                        'commission' => number_format( 20 - 0.98 - ( 5 / 12 * -0.42 ), 2 ), // Admin Shipping Fee + Net commission after refund
                        'vendor_earnings' => number_format( 28.98 - ( 12.42 / 12 * 5 ), 2 ), // Item wise Vendor earning in refund = earning_before_refund / paid_amount * refund_amount
                        'vendor_net_earnings' => number_format( 28.98 - ( 12.42 / 12 * 5 ), 2 ), // Item wise Vendor earning in refund = earning_before_refund / paid_amount * refund_amount
                    ],
				],
			],
            [
				'case' => 'Coupon applied discount type fixed_product (from_vendor commission) with refund',
				'data' => [
					'order' => [
						'shipping_item_list' => [
							[
								'name' => 'Shipping Fee 1',
								'amount' => 15,
								'seller_id' => '{seller_id1}',
							],
							[
								'name' => 'Shipping Fee 2',
								'amount' => 5,
								'seller_id' => '{seller_id2}',
							],
						],
						'status'      => 'processing',
						'customer_id' => '{customer_id}',
						'line_items' => array(
							array(
								'product' => [
									'name' => 'Test Product 1',
									'regular_price' => 10,
									'price' => 10,
									'seller_id' => '{seller_id1}',
								],
								'quantity'   => 3,
							),
							array(
								'product' => [
									'name' => 'Test Product 2',
									'regular_price' => 20,
									'price' => 20,
									'seller_id' => '{seller_id2}',
								],
								'quantity'   => 2,
							),
						),
					],
					'coupon' => [
						'code' => 'vendor-test-coupon-shared',
						'meta' => [
							'discount_type' => 'fixed_product',
							'coupon_amount' => 5,
							'product_ids' => [],
							'excluded_product_ids' => [],
							'admin_coupons_enabled_for_vendor' => 'yes',
							'coupons_vendors_ids' => [],
							'coupons_exclude_vendors_ids' => [],
							'coupon_commissions_type' => 'from_vendor',
							'admin_shared_coupon_type' => '',
							'admin_shared_coupon_amount' => '',
						],
					],
                    'refund' => [
						'amount'         => 15,
						'reason'         => 'Testing Refund',
						'order_id'       => '{order_id}',
						'line_items'     => [
							'{item_id1}' => [
								'qty'          => 1,
								'refund_total' => 5,
								'refund_tax'   => array(),
							],
                            '{item_id2}' => [
                                'qty'          => 1,
                                'refund_total' => 10,
                                'refund_tax'   => array(),
                            ],
						],
						'refund_payment' => false,
					],
				],
				'settings' => [
					'commission' => [
						'global' => [
							'type' => 'fixed',
							'percentage' => 10,
							'flat' => 0,
						],
					],
					'shipping_fee_recipient' => 'admin',
				],
				'expected' => [
					'total' => 90 - 25, // line_item_total - coupon
					'net_commission' => number_format( 4.5, 2 ), // ((70 - 25) * 10%) - 0 = 4.5
					'commission' => number_format( 20 + 4.5, 2 ), // shipping fee + net commission
					'vendor_earnings' => 40.5, // ( 70 - 25) ) - 4.5  line_item_total - coupon - commission (13.5 + 27)
					'vendor_net_earnings' => 40.5, // vendor_earnings

                    'refund' => [
                        'commission_in_refund' => number_format( ( ( 5 / 15 * 1.5 ) + ( 10 / 30 * 3 ) ), 2 ), // Sum of (Item wise net commission in refund = commission before refund * refund amount / paid amount ).
                        'vendor_earning_in_refund' => number_format( ( 5 / 15 * 13.5 ) + ( 10 / 30 * 27 ), 2 ), // Sum of (Item wise net earning in refund = earning before refund * refund amount / paid amount ).
                        'net_commission' => number_format( 4.5 - ( ( 5 / 15 * 1.5 ) + ( 10 / 30 * 3 ) ), 2 ), // Net commission after refund =  (Net commission before refund - Net commission in refund),
                        'commission' => number_format( 20 + 4.5 - ( ( 5 / 15 * 1.5 ) + ( 10 / 30 * 3 ) ), 2 ), // Admin Shipping Fee + Net commission after refund
                        'vendor_earnings' => number_format( 40.5 - ( ( 13.5 / 15 * 5 ) + ( 27 / 30 * 10 ) ), 2 ), // Item wise Vendor earning in refund = earning_before_refund / paid_amount * refund_amount
                        'vendor_net_earnings' => number_format( 40.5 - ( ( 13.5 / 15 * 5 ) + ( 27 / 30 * 10 ) ), 2 ), // Item wise Vendor earning in refund = earning_before_refund / paid_amount * refund_amount
                    ],
				],
			],
            [
				'case' => 'Coupon applied discount type fixed_product (from_admin commission) and shipping fee recipient seller',
				'data' => [
					'order' => [
						'shipping_item_list' => [
							[
								'name' => 'Shipping Fee 1',
								'amount' => 15,
								'seller_id' => '{seller_id1}',
							],
							[
								'name' => 'Shipping Fee 2',
								'amount' => 5,
								'seller_id' => '{seller_id2}',
							],
						],
						'status'      => 'processing',
						'customer_id' => '{customer_id}',
						'line_items' => array(
							array(
								'product' => [
									'name' => 'Test Product 1',
									'regular_price' => 10,
									'price' => 10,
									'seller_id' => '{seller_id1}',
								],
								'quantity'   => 3,
							),
							array(
								'product' => [
									'name' => 'Test Product 2',
									'regular_price' => 20,
									'price' => 20,
									'seller_id' => '{seller_id2}',
								],
								'quantity'   => 2,  // Admin commission = 10 * 2 * 10% = 2
							),
						),
					],
					'coupon' => [
						'code' => 'vendor-test-coupon-shared',
						'meta' => [
							'discount_type' => 'fixed_product',
							'coupon_amount' => 5,
							'product_ids' => [],
							'excluded_product_ids' => [],
							'admin_coupons_enabled_for_vendor' => 'yes',
							'coupons_vendors_ids' => [],
							'coupons_exclude_vendors_ids' => [],
							'coupon_commissions_type' => 'from_admin',
							'admin_shared_coupon_type' => '',
							'admin_shared_coupon_amount' => '',
						],
					],
				],
				'settings' => [
					'commission' => [
						'global' => [
							'type' => 'fixed',
							'percentage' => 10,
							'flat' => 0,
						],
					],
					'shipping_fee_recipient' => 'seller',
				],
				'expected' => [
					'total' => 90 - 25, // line_item_total - coupon
					'net_commission' => number_format( -18, 2 ), // ((70 - 0) * 10%) - 25 = -18
					'commission' => number_format( -18, 2 ), // shipping fee + net commission
					'vendor_earnings' => 20 + 63, // ( 70 - 25) ) + 18  line_item_total - coupon - commission (13.5 + 27)
					'vendor_net_earnings' => 63, // vendor_earnings
				],
			],
            [
				'case' => 'Coupon applied discount type fixed_product (from_vendor commission) with refund',
				'data' => [
					'order' => [
						'shipping_item_list' => [
							[
								'name' => 'Shipping Fee 1',
								'amount' => 15,
								'seller_id' => '{seller_id1}',
							],
							[
								'name' => 'Shipping Fee 2',
								'amount' => 5,
								'seller_id' => '{seller_id2}',
							],
						],
						'status'      => 'processing',
						'customer_id' => '{customer_id}',
						'line_items' => array(
							array(
								'product' => [
									'name' => 'Test Product 1',
									'regular_price' => 10,
									'price' => 10,
									'seller_id' => '{seller_id1}',
								],
								'quantity'   => 3,
							),
							array(
								'product' => [
									'name' => 'Test Product 2',
									'regular_price' => 20,
									'price' => 20,
									'seller_id' => '{seller_id2}',
								],
								'quantity'   => 2,  // Admin commission = 10 * 2 * 10% = 2
							),
						),
					],
					'coupon' => [
						'code' => 'vendor-test-coupon-shared',
						'meta' => [
							'discount_type' => 'fixed_product',
							'coupon_amount' => 5,
							'product_ids' => [],
							'excluded_product_ids' => [],
							'admin_coupons_enabled_for_vendor' => 'yes',
							'coupons_vendors_ids' => [],
							'coupons_exclude_vendors_ids' => [],
							'coupon_commissions_type' => 'from_vendor',
							'admin_shared_coupon_type' => '',
							'admin_shared_coupon_amount' => '',
						],
					],
                    'refund' => [
						'amount'         => 15,
						'reason'         => 'Testing Refund',
						'order_id'       => '{order_id}',
						'line_items'     => [
							'{item_id1}' => [
								'qty'          => 1,
								'refund_total' => 5,
								'refund_tax'   => array(),
							],
                            '{item_id2}' => [
                                'qty'          => 1,
                                'refund_total' => 10,
                                'refund_tax'   => array(),
                            ],
						],
						'refund_payment' => false,
					],
				],
				'settings' => [
					'commission' => [
						'global' => [
							'type' => 'fixed',
							'percentage' => 10,
							'flat' => 0,
						],
					],
					'shipping_fee_recipient' => 'admin',
				],
				'expected' => [
					'total' => 90 - 25, // line_item_total - coupon
					'net_commission' => number_format( 4.5, 2 ), // ((70 - 25) * 10%) - 0 = -0.98
					'commission' => number_format( 20 + 4.5, 2 ), // shipping fee + net commission
					'vendor_earnings' => 40.5, // ( 70 - 25) ) - 4.5  line_item_total - coupon - commission (13.5 + 27)
					'vendor_net_earnings' => 40.5, // vendor_earnings

                    'refund' => [
                        'commission_in_refund' => number_format( ( ( 5 / 15 * 1.5 ) + ( 10 / 30 * 3 ) ), 2 ), // Sum of (Item wise net commission in refund = commission before refund * refund amount / paid amount ).
                        'vendor_earning_in_refund' => number_format( ( 5 / 15 * 13.5 ) + ( 10 / 30 * 27 ), 2 ), // Sum of (Item wise net earning in refund = earning before refund * refund amount / paid amount ).
                        'net_commission' => number_format( 4.5 - ( ( 5 / 15 * 1.5 ) + ( 10 / 30 * 3 ) ), 2 ), // Net commission after refund =  (Net commission before refund - Net commission in refund),
                        'commission' => number_format( 20 + 4.5 - ( ( 5 / 15 * 1.5 ) + ( 10 / 30 * 3 ) ), 2 ), // Admin Shipping Fee + Net commission after refund
                        'vendor_earnings' => number_format( 40.5 - ( ( 13.5 / 15 * 5 ) + ( 27 / 30 * 10 ) ), 2 ), // Item wise Vendor earning in refund = earning_before_refund / paid_amount * refund_amount
                        'vendor_net_earnings' => number_format( 40.5 - ( ( 13.5 / 15 * 5 ) + ( 27 / 30 * 10 ) ), 2 ), // Item wise Vendor earning in refund = earning_before_refund / paid_amount * refund_amount
                    ],
				],
			],
            [
				'case' => 'Partial Refund',
				'data' => [
					'order' => [
						'shipping_item_list' => [
							[
								'name' => 'Shipping Fee 1',
								'amount' => 15,
								'seller_id' => '{seller_id1}',
							],
							[
								'name' => 'Shipping Fee 2',
								'amount' => 5,
								'seller_id' => '{seller_id2}',
							],
						],
						'status'      => 'processing',
						'customer_id' => '{customer_id}',
						'line_items' => array(
							array(
								'product' => [
									'name' => 'Test Product 1',
									'regular_price' => 5,
									'price' => 5,
									'seller_id' => '{seller_id1}',
								],
								'quantity'   => 3,
							),
							array(
								'product' => [
									'name' => 'Test Product 2',
									'regular_price' => 10,
									'price' => 10,
									'seller_id' => '{seller_id2}',
								],
								'quantity'   => 2,  // Admin commission = 10 * 2 * 10% = 2
							),
						),
					],
					'refund' => [
						'amount'         => 5,
						'reason'         => 'Testing Refund',
						'order_id'       => '{order_id}',
						'line_items'     => [
							'{item_id1}' => [
                                // 'qty'          => 1,
								'refund_total' => 5,
								'refund_tax'   => array(),
							],
						],
						'refund_payment' => false,
					],
				],
				'settings' => [
					'commission' => [
						'global' => [
							'type' => 'fixed',
							'percentage' => 10,
							'flat' => 0,
						],
					],
					'shipping_fee_recipient' => 'admin',
				],
				'expected' => [
					'total' => 55,
					'net_commission' => 3.5, // Admin commission = 3.5
					'commission' => 20 + 3.5, // Shipping fee + Admin Net Commission
					'vendor_earnings' => 31.5, // 13.5 + 18
					'vendor_net_earnings' => 31.5,
					'refund' => [ // Refund amount = 5
						'commission_in_refund' => number_format( ( 5 / 15 * 1.5 ), 2 ),
						'vendor_earning_in_refund' => number_format( 5 / 15 * 13.5, 2 ),
						'net_commission' => number_format( 3.5 - ( 1.5 / 15 * 5 ), 2 ),
						'commission' => number_format( 20 + 3.5 - ( 1.5 / 15 * 5 ), 2 ),
						'vendor_earnings' => number_format( 31.5 - ( 13.5 / 15 * 5 ), 2 ),
						'vendor_net_earnings' => number_format( 31.5 - ( 13.5 / 15 * 5 ), 2 ),
					],
				],
			],
		];
	}
}
