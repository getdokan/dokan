<?php

namespace WeDevs\Dokan\Test\Orders;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group order-status
 */
class OrderStatusChangeTest extends DokanTestCase {

    /**
     * Test standard status transitions that should be allowed
     *
     * @dataProvider allowed_status_transitions
     *
     * @param string $from The initial status
     * @param string $to The status to transition to
     */
    public function test_allowed_status_transitions( string $from, string $to ) {
        $this->verify_status_transition( $from, $to, true );
    }

    /**
     * Test status transitions that should be blocked
     *
     * @dataProvider not_allowed_status_transitions
     *
     * @param string $from The initial status
     * @param string $to The status to transition to
     */
    public function test_blocked_status_transitions( string $from, string $to ) {
        $this->verify_status_transition( $from, $to, false );
    }

    /**
     * Test custom status transitions
     *
     * @see \Automattic\WooCommerce\Blocks\Domain\Services\DraftOrders
     *
     * @dataProvider custom_status_transitions
     *
     * @param string $from The initial status
     * @param string $to The status to transition to
     */
    public function test_custom_status_transitions( string $from, string $to ) {
        add_filter(
            'wc_order_statuses', function ( $statuses ) {
				$statuses['wc-checkout-draft'] = _x( 'Checkout Draft', 'Order status', 'dokan-lite' );
				$statuses['wc-delivered'] = _x( 'Delivered', 'Order status', 'dokan-lite' );

				return $statuses;
			}
        );

        $this->verify_status_transition( $from, $to, true );
    }

    /**
     * Test that sub-orders follow parent order status changes when allowed
     */
    public function test_sub_orders_status_sync() {
        $order = $this->create_order( 'pending' );

        $order->update_status( 'processing' );

        // Verify parent order status
        $this->assertEquals( 'processing', $order->get_status() );

        // Refresh sub-orders
        $sub_orders = dokan()->order->get_child_orders( $order->get_id() );

        // Verify all sub-orders followed the status change
        foreach ( $sub_orders as $sub_order ) {
            $this->assertEquals( 'processing', $sub_order->get_status() );
        }
    }

    /**
     * Test the 'any' status transition rule for pending orders
     *
     * @see \Automattic\WooCommerce\Blocks\Domain\Services\DraftOrders
     *
     * @dataProvider pending_to_any_status
     *
     * @param string $from The initial status
     * @param string $to The status to transition to
     */
    public function test_pending_to_any_status( string $from, string $to ) {
        add_filter(
            'wc_order_statuses', function ( $statuses ) {
				$statuses['wc-checkout-draft'] = _x( 'Checkout Draft', 'Order status', 'dokan-lite' );

				return $statuses;
			}
        );
        $this->verify_status_transition( $from, $to, true );
    }

    /**
     * Test status transitions with custom whitelist filter
     */
    public function test_custom_whitelist_filter() {
        add_filter(
            'dokan_sub_order_status_update_whitelist', function ( $whitelist ) {
				$whitelist['wc-completed'][] = 'wc-processing';
				return $whitelist;
			}
        );

        // This should now be allowed due to our custom filter
        $this->verify_status_transition( 'completed', 'processing', true );

        // Cleanup
        remove_all_filters( 'dokan_sub_order_status_update_whitelist' );
    }

    /**
     * Helper method to verify status transitions
     */
    private function verify_status_transition( $from_status, $to_status, $should_change ) {
        $order = $this->create_order( $from_status );
        $sub_orders = dokan()->order->get_child_orders( $order->get_id() );

        // Verify initial status
        $this->assertEquals( $from_status, $order->get_status() );
        foreach ( $sub_orders as $sub_order ) {
            $this->assertEquals( $from_status, $sub_order->get_status() );
        }

        // Attempt status change
        $order->update_status( $to_status );

        // Verify parent order status
        $this->assertEquals( $to_status, $order->get_status() );

        // Refresh sub-orders
        $sub_orders = dokan()->order->get_child_orders( $order->get_id() );

        // If should change is true, verify new status, otherwise verify old status maintained
        $expected_status = $should_change ? $to_status : $from_status;

        foreach ( $sub_orders as $sub_order ) {
            $this->assertEquals( $expected_status, $sub_order->get_status() );
        }
    }

    /**
     * Create test order with initial status
     */
    private function create_order( string $status ) {
        $order_id = $this->create_multi_vendor_order(
            [
				'item_fee_list' => [
					[
						'name' => 'Extra Charge',
						'amount' => 10,
					],
				],
				'shipping_item_list' => [
					[
						'name' => 'Shipping Fee 1',
						'amount' => 15,
						'seller_id' => $this->seller_id1,
					],
					[
						'name' => 'Shipping Fee 2',
						'amount' => 5,
						'seller_id' => $this->seller_id2,
					],
				],
				'status'      => $status,
				'customer_id' => $this->customer_id,
				'line_items'  => array(
					array(
						'product' => [
							'name' => 'Test Product 1',
							'regular_price' => 5,
							'price' => 5,
							'seller_id' => $this->seller_id1,
						],
						'quantity'   => 3,
					),
					array(
						'product' => [
							'name' => 'Test Product 2',
							'regular_price' => 10,
							'price' => 10,
							'seller_id' => $this->seller_id2,
						],
						'quantity'   => 2,
					),
				),

			]
        );

        return wc_get_order( $order_id );
    }

    /**
     * Data provider for allowed status transitions
     */
    public function allowed_status_transitions(): array {
        return [
            [ 'pending', 'processing' ],
            [ 'pending', 'on-hold' ],
            [ 'on-hold', 'processing' ],
            [ 'processing', 'completed' ],
            [ 'processing', 'cancelled' ],
            [ 'completed', 'refunded' ],
        ];
    }

    /**
     * Data provider for blocked status transitions
     */
    public function not_allowed_status_transitions(): array {
        return [
            [ 'completed', 'processing' ],
            [ 'refunded', 'completed' ],
            [ 'cancelled', 'processing' ],
        ];
    }

    /**
     * Data provider for pending to any status transitions
     */
    public function pending_to_any_status(): array {
        return [
            [ 'pending', 'processing' ],
            [ 'pending', 'on-hold' ],
            [ 'pending', 'completed' ],
            [ 'pending', 'cancelled' ],
            [ 'pending', 'refunded' ],
            [ 'pending', 'checkout-draft' ],
        ];
    }

    /**
     * Data provider for custom status transitions
     */
    public function custom_status_transitions(): array {
        return [
            [ 'pending', 'checkout-draft' ],
            [ 'checkout-draft', 'processing' ],
            [ 'checkout-draft', 'delivered' ],
        ];
    }

    public function tearDown(): void {
        parent::tearDown();
        remove_all_filters( 'dokan_sub_order_status_update_whitelist' );
        remove_all_filters( 'wc_order_statuses' );
    }
}
