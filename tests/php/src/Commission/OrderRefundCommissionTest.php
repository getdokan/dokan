<?php

namespace WeDevs\Dokan\Test\Commission;

use WC_Order;
use WeDevs\Dokan\Commission\OrderCommission;
use WeDevs\Dokan\Commission\OrderRefundCommission;

/**
 * @group commission
 *
 * @group commission-refund
 */
class OrderRefundCommissionTest extends \WeDevs\Dokan\Test\DokanTestCase {

	protected $seller_id1;
	protected $seller_id2;
	protected $customer_id;

	public function set_up() {
		parent::set_up();

		$this->clear_commission_settings();

		$this->seller_id1  = $this->factory()->seller->create();
		$this->seller_id2  = $this->factory()->seller->create();
		$this->customer_id = $this->factory()->customer->create();
	}

	/**
	 * Reset commission settings to a known default state.
	 *
	 * @return void
	 */
	protected function clear_commission_settings() {
		( new \WeDevs\Dokan\Commission\Settings\GlobalSetting( 0 ) )->save(
			[
				'type'       => 'fixed',
				'percentage' => 10,
				'flat'       => 0,
			]
		);

		$selling_options = get_option( 'dokan_selling', [] );
		unset( $selling_options['commission_fixed_values'] );
		unset( $selling_options['commission_category_based_values'] );
		$selling_options['commission_type']            = 'fixed';
		$selling_options['shipping_fee_recipient']     = 'admin';
		$selling_options['tax_fee_recipient']          = 'admin';
		$selling_options['shipping_tax_fee_recipient'] = 'admin';
		update_option( 'dokan_selling', $selling_options );
	}

	/**
	 * Set fee recipients on the dokan_selling option.
	 *
	 * @param array $recipients
	 *
	 * @return void
	 */
	protected function set_fee_recipients( array $recipients ) {
		$selling_options = get_option( 'dokan_selling', [] );

		foreach ( $recipients as $key => $recipient ) {
			$selling_options[ $key ] = $recipient;
		}

		update_option( 'dokan_selling', $selling_options );
	}

	/**
	 * Create a single vendor order: 3 × 10 line item + 15 shipping = 45 total.
	 *
	 * @return WC_Order
	 */
	protected function create_order(): WC_Order {
		$order_id = $this->create_single_vendor_order(
			$this->seller_id1,
			[
				'shipping_item_list' => [
					[
						'name'      => 'Shipping Fee',
						'amount'    => 15,
						'seller_id' => $this->seller_id1,
					],
				],
				'status'             => 'processing',
				'customer_id'        => $this->customer_id,
				'line_items'         => [
					[
						'product'  => [
							'name'          => 'Test Product',
							'regular_price' => 10,
							'price'         => 10,
							'seller_id'     => $this->seller_id1,
						],
						'quantity' => 3,
					],
				],
			]
		);

		$order = wc_get_order( $order_id );
		$order->calculate_totals();

		return new WC_Order( $order->get_id() );
	}

	/**
	 * Create a refund for the order's first line item.
	 *
	 * @param WC_Order $order
	 * @param float    $item_refund_total
	 * @param float    $shipping_refund_total
	 *
	 * @return \WC_Order_Refund
	 */
	protected function create_refund( WC_Order $order, float $item_refund_total, float $shipping_refund_total = 0 ) {
		$item_id = array_key_first( $order->get_items() );

		$line_items = [
			$item_id => [
				'qty'          => 1,
				'refund_total' => $item_refund_total,
				'refund_tax'   => [],
			],
		];

		if ( $shipping_refund_total > 0 ) {
			$shipping_item_id = array_key_first( $order->get_items( 'shipping' ) );

			$line_items[ $shipping_item_id ] = [
				'qty'          => 0,
				'refund_total' => $shipping_refund_total,
				'refund_tax'   => [],
			];
		}

		$refund = wc_create_refund(
			[
				'amount'         => $item_refund_total + $shipping_refund_total,
				'reason'         => 'Testing refund',
				'order_id'       => $order->get_id(),
				'line_items'     => $line_items,
				'refund_payment' => false,
			]
		);

		$this->assertNotWPError( $refund );

		return $refund;
	}

	/**
	 * Get a fresh calculator instance for a refund.
	 *
	 * @param \WC_Order_Refund $refund
	 * @param WC_Order         $order
	 *
	 * @return OrderRefundCommission
	 */
	protected function get_refund_commission( $refund, WC_Order $order ): OrderRefundCommission {
		$refund_commission = dokan_get_container()->get( OrderRefundCommission::class );

		return $refund_commission->set_refund( $refund )->set_order( $order );
	}

	/**
	 * Line item earning and commission are prorated by refund_amount / item_total.
	 *
	 * Order: item total 30, commission 10% → admin 3, vendor 27.
	 * Refund 10 of the item → vendor gives back 27/30×10 = 9, admin 3/30×10 = 1.
	 */
	public function test_line_item_refund_is_prorated() {
		$order  = $this->create_order();
		$refund = $this->create_refund( $order, 10 );

		$refund_commission = $this->get_refund_commission( $refund, $order )->calculate();

		$this->assertEquals( 9.0, round( $refund_commission->get_vendor_net_earning(), 2 ) );
		$this->assertEquals( 1.0, round( $refund_commission->get_admin_net_commission(), 2 ) );

		// No tax refunded and shipping was not refunded.
		$this->assertEquals( 0.0, $refund_commission->get_vendor_tax_refund() );
		$this->assertEquals( 0.0, $refund_commission->get_vendor_shipping_refund() );

		$this->assertEquals( 9.0, round( $refund_commission->get_vendor_total_refund(), 2 ) );
		$this->assertEquals( 1.0, round( $refund_commission->get_admin_total_refund(), 2 ) );
	}

	/**
	 * The dokan_vendor_earning_in_refund filter (RefundHandler) returns the same
	 * total as OrderRefundCommission::get_vendor_total_refund().
	 */
	public function test_refund_handler_filter_parity() {
		$order  = $this->create_order();
		$refund = $this->create_refund( $order, 10 );

		$vendor_refund = apply_filters( 'dokan_vendor_earning_in_refund', $refund, $order );

		$refund_commission = $this->get_refund_commission( $refund, $order );

		$this->assertEquals(
			round( $refund_commission->get_vendor_total_refund(), 2 ),
			round( floatval( $vendor_refund ), 2 )
		);
		$this->assertEquals( 9.0, round( floatval( $vendor_refund ), 2 ) );
	}

	/**
	 * Refunded shipping is routed to whichever party is the shipping fee recipient.
	 *
	 * The recipient is snapshotted onto order meta on first read (Fees.php), so
	 * each scenario uses a fresh order created under the respective setting.
	 */
	public function test_shipping_refund_routed_by_recipient() {
		// Scenario 1: shipping fee recipient is the seller.
		$this->set_fee_recipients( [ 'shipping_fee_recipient' => 'seller' ] );

		$order  = $this->create_order();
		$refund = $this->create_refund( $order, 10, 5 );

		$refund_commission = $this->get_refund_commission( $refund, $order )->calculate();

		$this->assertEquals( 5.0, round( $refund_commission->get_vendor_shipping_refund(), 2 ) );
		$this->assertEquals( 0.0, round( $refund_commission->get_admin_shipping_refund(), 2 ) );

		// Vendor gives back prorated earning + refunded shipping.
		$this->assertEquals( 14.0, round( $refund_commission->get_vendor_total_refund(), 2 ) );
		$this->assertEquals( 1.0, round( $refund_commission->get_admin_total_refund(), 2 ) );

		// Scenario 2: shipping fee recipient is the admin (fresh order).
		$this->set_fee_recipients( [ 'shipping_fee_recipient' => 'admin' ] );

		$order  = $this->create_order();
		$refund = $this->create_refund( $order, 10, 5 );

		$refund_commission = $this->get_refund_commission( $refund, $order )->calculate();

		$this->assertEquals( 0.0, round( $refund_commission->get_vendor_shipping_refund(), 2 ) );
		$this->assertEquals( 5.0, round( $refund_commission->get_admin_shipping_refund(), 2 ) );
		$this->assertEquals( 9.0, round( $refund_commission->get_vendor_total_refund(), 2 ) );
		$this->assertEquals( 6.0, round( $refund_commission->get_admin_total_refund(), 2 ) );
	}

	/**
	 * The gateway fee refund defaults to 0 (most gateways keep the processing
	 * fee on refund); the associated gateway supplies the returned amount via
	 * the dokan_refund_gateway_fee filter, which receives the prorated share
	 * ( fee × |refund_total| / order_total ) and is routed to the fee payer.
	 *
	 * Order total 45, gateway fee 4.5 paid by seller, refund 15 → prorated fee 1.5.
	 */
	public function test_gateway_fee_refund_defaults_to_zero_and_is_gateway_supplied() {
		$order = $this->create_order();
		$order->update_meta_data( 'dokan_gateway_fee', 4.5 );
		$order->update_meta_data( 'dokan_gateway_fee_paid_by', 'seller' );
		$order->save();

		$order  = new WC_Order( $order->get_id() );
		$refund = $this->create_refund( $order, 15 );

		$refund_commission = $this->get_refund_commission( $refund, $order )->calculate();

		// Default: no gateway returns its fee, nothing is deducted.
		$this->assertEquals( 0.0, round( $refund_commission->get_vendor_gateway_fee_refund(), 2 ) );
		$this->assertEquals( 0.0, round( $refund_commission->get_admin_gateway_fee_refund(), 2 ) );
		$this->assertEquals( 13.5, round( $refund_commission->get_vendor_total_refund(), 2 ) ); // 27/30 × 15

		// A gateway that returns its fee (e.g. Paystack) supplies the amount.
		$supply_prorated_fee = function ( $gateway_fee_refund, $prorated_fee ) {
			return $prorated_fee;
		};
		add_filter( 'dokan_refund_gateway_fee', $supply_prorated_fee, 10, 2 );

		$this->assertEquals( 1.5, round( $refund_commission->get_vendor_gateway_fee_refund(), 2 ) );
		$this->assertEquals( 0.0, round( $refund_commission->get_admin_gateway_fee_refund(), 2 ), 'Non-payer gets no gateway fee refund' );
		$this->assertEquals( 12.0, round( $refund_commission->get_vendor_total_refund(), 2 ) );
		$this->assertEquals(
			round( $refund_commission->get_admin_net_commission(), 2 ),
			round( $refund_commission->get_admin_total_refund(), 2 ),
			'Admin total should be unaffected when the seller paid the gateway fee'
		);

		remove_filter( 'dokan_refund_gateway_fee', $supply_prorated_fee, 10 );
	}

	/**
	 * When the gateway fee is split between the vendor and the admin — the
	 * vendor share stored in dokan_gateway_fee (paid_by seller) and the admin
	 * share stored separately in dokan_admin_gateway_fee (e.g. Paystack split
	 * payments) — each recipient's prorated share is based on the fee that
	 * recipient actually bore, mirroring OrderCommission's forward routing.
	 *
	 * Order total 45, vendor fee 4.5 + admin fee 1.5, refund 15 (1/3):
	 * vendor prorated 1.5, admin prorated 0.5.
	 */
	public function test_gateway_fee_split_between_vendor_and_admin_is_prorated_per_recipient() {
		$order = $this->create_order();
		$order->update_meta_data( 'dokan_gateway_fee', 4.5 );
		$order->update_meta_data( 'dokan_gateway_fee_paid_by', 'seller' );
		$order->update_meta_data( 'dokan_admin_gateway_fee', 1.5 );
		$order->save();

		$order  = new WC_Order( $order->get_id() );
		$refund = $this->create_refund( $order, 15 );

		$refund_commission = $this->get_refund_commission( $refund, $order )->calculate();

		$supply_prorated_fee = function ( $gateway_fee_refund, $prorated_fee ) {
			return $prorated_fee;
		};
		add_filter( 'dokan_refund_gateway_fee', $supply_prorated_fee, 10, 2 );

		$this->assertEquals( 1.5, round( $refund_commission->get_vendor_gateway_fee_refund(), 2 ) ); // 4.5 × 15/45
		$this->assertEquals( 0.5, round( $refund_commission->get_admin_gateway_fee_refund(), 2 ) );  // 1.5 × 15/45
		$this->assertEquals( 12.0, round( $refund_commission->get_vendor_total_refund(), 2 ) );      // 13.5 − 1.5
		$this->assertEquals( 1.0, round( $refund_commission->get_admin_total_refund(), 2 ) );        // 1.5 − 0.5

		remove_filter( 'dokan_refund_gateway_fee', $supply_prorated_fee, 10 );
	}

	/**
	 * The dokan_refund_gateway_fee filter fires even when no dokan_gateway_fee
	 * meta is stored on the order — gateways like Paystack handle fees via
	 * split-payment bearer config and never persist the meta, but must still
	 * be able to supply the returned fee per recipient.
	 */
	public function test_gateway_fee_filter_fires_without_stored_fee_meta() {
		$order  = $this->create_order(); // No dokan_gateway_fee meta at all.
		$refund = $this->create_refund( $order, 15 );

		$refund_commission = $this->get_refund_commission( $refund, $order )->calculate();

		$this->assertEquals( 0.0, $refund_commission->get_vendor_gateway_fee_refund() );

		$supply_fee_for_seller = function ( $gateway_fee_refund, $prorated_fee, $refund_obj, $order_obj, $recipient ) {
			return 'seller' === $recipient ? 0.75 : $gateway_fee_refund;
		};
		add_filter( 'dokan_refund_gateway_fee', $supply_fee_for_seller, 10, 5 );

		$this->assertEquals( 0.75, round( $refund_commission->get_vendor_gateway_fee_refund(), 2 ) );
		$this->assertEquals( 0.0, round( $refund_commission->get_admin_gateway_fee_refund(), 2 ) );
		$this->assertEquals( 12.75, round( $refund_commission->get_vendor_total_refund(), 2 ) ); // 27/30 × 15 − 0.75

		remove_filter( 'dokan_refund_gateway_fee', $supply_fee_for_seller, 10 );
	}

	/**
	 * When dokan_gateway_fee_paid_by meta is empty, the payer falls back to the
	 * seller for non Stripe-Connect payment methods (regression for the
	 * previously dead fallback in OrderCommission::get_dokan_gateway_fee()).
	 */
	public function test_gateway_fee_paid_by_fallback_defaults_to_seller() {
		$order = $this->create_order();
		$order->update_meta_data( 'dokan_gateway_fee', 3 );
		$order->save();

		$order  = new WC_Order( $order->get_id() );
		$refund = $this->create_refund( $order, 15 );

		$refund_commission = $this->get_refund_commission( $refund, $order )->calculate();

		$supply_prorated_fee = function ( $gateway_fee_refund, $prorated_fee ) {
			return $prorated_fee;
		};
		add_filter( 'dokan_refund_gateway_fee', $supply_prorated_fee, 10, 2 );

		$this->assertEquals( 1.0, round( $refund_commission->get_vendor_gateway_fee_refund(), 2 ) ); // 3 × 15/45
		$this->assertEquals( 0.0, round( $refund_commission->get_admin_gateway_fee_refund(), 2 ) );

		remove_filter( 'dokan_refund_gateway_fee', $supply_prorated_fee, 10 );

		// The same fallback in the forward calculation (OrderCommission).
		$order_commission = dokan_get_container()->get( OrderCommission::class );
		$order_commission->set_order( $order );
		$order_commission->calculate();

		$this->assertEquals( 3.0, round( $order_commission->get_vendor_gateway_fee(), 2 ) );
		$this->assertEquals( 0.0, round( $order_commission->get_admin_gateway_fee(), 2 ) );
	}

	/**
	 * Parent orders holding sub-orders are excluded: all refund portions are zero.
	 */
	public function test_parent_order_with_sub_orders_returns_zero() {
		$order = $this->create_order();
		$order->update_meta_data( 'has_sub_order', true );
		$order->save();

		$order  = new WC_Order( $order->get_id() );
		$refund = $this->create_refund( $order, 10 );

		$refund_commission = $this->get_refund_commission( $refund, $order )->calculate();

		$this->assertEquals( 0.0, $refund_commission->get_vendor_total_refund() );
		$this->assertEquals( 0.0, $refund_commission->get_admin_total_refund() );
		$this->assertEquals( 0.0, $refund_commission->get_vendor_net_earning() );
		$this->assertEquals( 0.0, $refund_commission->get_admin_net_commission() );

		$this->assertEquals( 0.0, floatval( apply_filters( 'dokan_vendor_earning_in_refund', $refund, $order ) ) );
	}
}
