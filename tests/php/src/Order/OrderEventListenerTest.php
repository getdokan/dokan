<?php

namespace WeDevs\Dokan\Test\Order;

use WeDevs\Dokan\Order\OrderEventListener;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group order-event-listener
 *
 * @note by default the withdrawal option is enable for completed order.
 */
class OrderEventListenerTest extends DokanTestCase {

    private $order_event_listener;
    private $seller_id;

    public function setUp(): void {
        parent::setUp();
        $this->order_event_listener = new OrderEventListener();
        $this->seller_id = $this->factory()->seller->create();
    }

    public function test_processing_order_with_trash_event() {
        $order_id = $this->create_order( 'processing' );
        $vendor_id = dokan_get_seller_id_by_order( $order_id );
        $initial_balance = dokan()->vendor->get( $vendor_id )->get_earnings( false );

        $processing_order = wc_get_order( $order_id );
        $processing_order->delete();

        $trash_order = wc_get_order( $order_id );
        $this->assertEquals( 'trash', $trash_order->get_status() );

        $current_balance = dokan()->vendor->get( $vendor_id )->get_earnings( false );
        $this->assertEquals( $initial_balance, $current_balance );
    }

    public function test_completed_order_with_trash_event() {
        $order_id = $this->create_order( 'completed' );
        $vendor_id = dokan_get_seller_id_by_order( $order_id );
        $initial_balance = dokan()->vendor->get( $vendor_id )->get_earnings( false );

        $completed_order = wc_get_order( $order_id );
        $completed_order->delete();

        $trash_order = wc_get_order( $order_id );
        $this->assertEquals( 'trash', $trash_order->get_status() );

        $current_balance = dokan()->vendor->get( $vendor_id )->get_earnings( false );
        $this->assertEquals( 0, $current_balance );
        $this->assertLessThan( $initial_balance, $current_balance );
    }

    public function test_processing_order_with_untrash_event() {
        $order_id = $this->create_order( 'processing' );
        $vendor_id = dokan_get_seller_id_by_order( $order_id );
        $initial_balance = dokan()->vendor->get( $vendor_id )->get_earnings( false );

        $processing_order = wc_get_order( $order_id );
        $processing_order->delete();

        $trash_order = wc_get_order( $order_id );
        $trash_order->set_status( 'processing' );
        $trash_order->save();

        $untrash_order = wc_get_order( $order_id );
        $this->assertEquals( 'processing', $untrash_order->get_status() );

        $current_balance = dokan()->vendor->get( $vendor_id )->get_earnings( false );
        $this->assertEquals( $initial_balance, $current_balance );
    }

    public function test_completed_order_with_untrash_event() {
        $order_id = $this->create_order( 'completed' );
        $vendor_id = dokan_get_seller_id_by_order( $order_id );
        $initial_balance = dokan()->vendor->get( $vendor_id )->get_earnings( false );

        $completed_order = wc_get_order( $order_id );
        $completed_order->delete();

        $trash_order = wc_get_order( $order_id );
        $trash_order->set_status( 'completed' );
        $trash_order->save();

        $untrash_order = wc_get_order( $order_id );
        $this->assertEquals( 'completed', $untrash_order->get_status() );

        $current_balance = dokan()->vendor->get( $vendor_id )->get_earnings( false );
        $this->assertEquals( $initial_balance, $current_balance );
    }

    private function create_order( $status ) {
        $order_id = $this->factory()->order->set_seller_id( $this->seller_id )->create();
        $order = wc_get_order( $order_id );
        $order->set_status( $status );
        $order->save();

        return $order_id;
    }
}
