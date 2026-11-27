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
	 * Create a refund entered as an amount only, with no lines.
	 *
	 * @param WC_Order $order
	 * @param float    $amount
	 *
	 * @return \WC_Order_Refund
	 */
	protected function create_amount_only_refund( WC_Order $order, float $amount ) {
		$refund = wc_create_refund(
			[
				'amount'         => $amount,
				'reason'         => 'Testing refund',
				'order_id'       => $order->get_id(),
				'line_items'     => [],
				'refund_payment' => false,
			]
		);

		$this->assertNotWPError( $refund );

		return $refund;
	}

	/**
	 * Get the order's commission after refunds, from a fresh order.
	 *
	 * @param WC_Order $order
	 *
	 * @return OrderCommission
	 */
	protected function get_order_commission( WC_Order $order ): OrderCommission {
		$order_commission = dokan_get_container()->get( OrderCommission::class );
		$order_commission->set_order( wc_get_order( $order->get_id() ) );

		return $order_commission->calculate();
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

	/**
	 * A refund entered as an amount only has no lines, so it is spread over the order.
	 *
	 * Order total 45: item 30 (vendor 27, admin 3) and shipping 15 to the admin.
	 * Refund 15 by amount, a third of the order: the vendor gives back 27 / 3 = 9.
	 */
	public function test_amount_only_refund_is_spread_over_the_order() {
		$order  = $this->create_order();
		$refund = $this->create_amount_only_refund( $order, 15 );

		$this->assertEquals( 9.0, $this->get_refund_commission( $refund, $order )->get_vendor_total_refund() );
		$this->assertEquals( 9.0, floatval( apply_filters( 'dokan_vendor_earning_in_refund', $refund, $order ) ) );

		// The order keeps two thirds of each party's figure.
		$order_commission = $this->get_order_commission( $order );

		$this->assertEquals( 18.0, round( $order_commission->get_vendor_earning(), 2 ) );
		$this->assertEquals( 12.0, round( $order_commission->get_admin_commission(), 2 ) );
	}

	/**
	 * A refund whose lines carry no amount is an amount-only refund too.
	 *
	 * Dokan Pro's refund requests send every line with a '0.00' total, which WooCommerce keeps as a zero line.
	 */
	public function test_refund_with_zero_lines_is_spread_like_an_amount_only_refund() {
		$order   = $this->create_order();
		$item_id = array_key_first( $order->get_items() );

		$refund = wc_create_refund(
			[
				'amount'         => 15,
				'order_id'       => $order->get_id(),
				'line_items'     => [
					$item_id => [
						'qty'          => 0,
						'refund_total' => '0.00',
						'refund_tax'   => [],
					],
				],
				'refund_payment' => false,
			]
		);

		$this->assertCount( 1, $refund->get_items() );
		$this->assertEquals( 9.0, $this->get_refund_commission( $refund, $order )->get_vendor_total_refund() );
		$this->assertEquals( 18.0, round( $this->get_order_commission( $order )->get_vendor_earning(), 2 ) );
	}

	/**
	 * The amount-only refund is booked once on the vendor balance and kept in dokan_orders.
	 */
	public function test_amount_only_refund_is_booked_on_the_balance_and_in_dokan_orders() {
		global $wpdb;

		$order = $this->create_order();

		$this->create_amount_only_refund( $order, 15 );

		$this->assertDatabaseCount(
			'dokan_vendor_balance',
			1,
			[
				'trn_id'   => $order->get_id(),
				'trn_type' => 'dokan_refund',
			]
		);
		$this->assertEquals( 9.0, (float) $wpdb->get_var( $wpdb->prepare( "SELECT credit FROM {$wpdb->dokan_vendor_balance} WHERE trn_id = %d AND trn_type = 'dokan_refund'", $order->get_id() ) ) );

		// The order's own balance row is untouched.
		$this->assertEquals( 27.0, (float) $wpdb->get_var( $wpdb->prepare( "SELECT debit FROM {$wpdb->dokan_vendor_balance} WHERE trn_id = %d AND trn_type = 'dokan_orders'", $order->get_id() ) ) );

		// dokan_orders is rewritten on every order save, so the figure has to survive one.
		wc_get_order( $order->get_id() )->save();

		$this->assertEquals( 18.0, (float) $wpdb->get_var( $wpdb->prepare( "SELECT net_amount FROM {$wpdb->dokan_orders} WHERE order_id = %d", $order->get_id() ) ) );
	}

	/**
	 * An amount-only refund after an itemised one takes what the itemised refund left.
	 *
	 * Vendor earning 27. Refund 10 of the item by items (vendor 9), then the rest of the order by amount.
	 * Each share is read when its refund is made, as the refund handlers do.
	 */
	public function test_amount_only_refund_after_an_itemised_one_takes_what_is_left() {
		$order    = $this->create_order();
		$itemised = $this->create_refund( $order, 10 );

		$this->assertEquals( 9.0, $this->get_refund_commission( $itemised, $order )->get_vendor_total_refund() );

		$the_rest = $this->create_amount_only_refund( $order, 35 );

		$this->assertEquals( 18.0, $this->get_refund_commission( $the_rest, $order )->get_vendor_total_refund() );
		$this->assertEquals( 0.0, round( $this->get_order_commission( $order )->get_vendor_earning(), 2 ) );
		$this->assertEquals( 0.0, round( $this->get_order_commission( $order )->get_admin_commission(), 2 ) );
	}

	/**
	 * An itemised refund after an amount-only one takes what the amount-only refund left.
	 *
	 * Vendor earning 27. Refund a third of the order by amount (vendor 9), then the whole item by items.
	 * Without the amount-only refund the item refund alone would take 27, and 36 in all.
	 */
	public function test_itemised_refund_after_an_amount_only_one_takes_what_is_left() {
		$order       = $this->create_order();
		$amount_only = $this->create_amount_only_refund( $order, 15 );

		$this->assertEquals( 9.0, $this->get_refund_commission( $amount_only, $order )->get_vendor_total_refund() );

		$item_id  = array_key_first( $order->get_items() );
		$itemised = wc_create_refund(
			[
				'amount'         => 30,
				'order_id'       => $order->get_id(),
				'line_items'     => [
					$item_id => [
						'qty'          => 3,
						'refund_total' => 30,
						'refund_tax'   => [],
					],
				],
				'refund_payment' => false,
			]
		);

		$this->assertEquals( 18.0, $this->get_refund_commission( $itemised, $order )->get_vendor_total_refund() );
		$this->assertEquals( 0.0, round( $this->get_order_commission( $order )->get_vendor_earning(), 2 ) );
	}

	/**
	 * Setting the order to Refunded makes WooCommerce refund the rest by amount, which takes back the whole earning.
	 */
	public function test_setting_the_order_to_refunded_takes_back_the_vendor_earning() {
		global $wpdb;

		$order = $this->create_order();
		$order->update_status( 'refunded' );

		$this->assertEquals( 27.0, (float) $wpdb->get_var( $wpdb->prepare( "SELECT SUM( credit ) FROM {$wpdb->dokan_vendor_balance} WHERE trn_id = %d AND trn_type = 'dokan_refund'", $order->get_id() ) ) );
		$this->assertEquals( 0.0, round( $this->get_order_commission( $order )->get_vendor_earning(), 2 ) );
	}

	/**
	 * A refund of a line that is not the vendor's is still not charged to the vendor.
	 */
	public function test_shipping_only_refund_is_not_an_amount_only_refund() {
		$order            = $this->create_order();
		$shipping_item_id = array_key_first( $order->get_items( 'shipping' ) );

		$refund = wc_create_refund(
			[
				'amount'         => 15,
				'order_id'       => $order->get_id(),
				'line_items'     => [
					$shipping_item_id => [
						'qty'          => 0,
						'refund_total' => 15,
						'refund_tax'   => [],
					],
				],
				'refund_payment' => false,
			]
		);

		// Shipping went to the admin, so the vendor gives nothing back and keeps the full earning.
		$this->assertEquals( 0.0, $this->get_refund_commission( $refund, $order )->get_vendor_total_refund() );
		$this->assertEquals( 27.0, round( $this->get_order_commission( $order )->get_vendor_earning(), 2 ) );
	}

	/**
	 * With cash on delivery excluded from the balance, the refund is not booked but the order figure follows.
	 */
	public function test_amount_only_refund_of_an_excluded_cod_order_is_not_booked() {
		$withdraw_options                        = get_option( 'dokan_withdraw', [] );
		$withdraw_options['exclude_cod_payment'] = 'on';
		update_option( 'dokan_withdraw', $withdraw_options );

		$order = $this->create_order();
		$order->set_payment_method( 'cod' );
		$order->save();

		$this->create_amount_only_refund( $order, 15 );

		$this->assertDatabaseCount(
			'dokan_vendor_balance',
			0,
			[
				'trn_id'   => $order->get_id(),
				'trn_type' => 'dokan_refund',
			]
		);
		$this->assertEquals( 18.0, round( $this->get_order_commission( $order )->get_vendor_earning(), 2 ) );
	}
}
