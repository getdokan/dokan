<?php

namespace WeDevs\Dokan\Test\Orders;

use WeDevs\Dokan\Order\VendorBalanceUpdateHandler;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group orders
 * @group order-vendor-balance-update-handler
 */
class VendorBalanceUpdateHandlerTest extends DokanTestCase {

    public function test_balance_table_query() {
        $handler = dokan_get_container()->get( 'WeDevs\Dokan\Order\VendorBalanceUpdateHandler' );
        $handler->register_hooks();

        $order_id = $this->create_single_vendor_order();
        $order = wc_get_order( $order_id );

        // so we need to use reflection to access it
        $reflection = new \ReflectionClass( $handler );
        $method = $reflection->getMethod( 'get_order_amount' );
        $method->setAccessible( true );

        $vendor_earning_amount = $method->invoke( $handler, $order );

        $this->assertIsNumeric( $vendor_earning_amount, 'Order amount should be numeric' );
        $this->assertNotEquals( 0, $vendor_earning_amount, 'Order amount should  be 0' );

        $order->set_id( $order_id + 30 );

        // for non existing order
        $vendor_earning_amount = $method->invoke( $handler, $order );

        $this->assertIsNotNumeric( $vendor_earning_amount, 'Order amount should not be numeric.' );
        $this->assertNull( $vendor_earning_amount, 'Order amount should  null for non existing record.' );
    }

    public function test_handle_order_edit_got_called() {
        $order_id = $this->create_single_vendor_order();
        $order = wc_get_order( $order_id );

        $mock_handler = \Mockery::mock( VendorBalanceUpdateHandler::class )->makePartial();
        $mock_handler->shouldReceive( 'handle_order_edit' )->once();
        $mock_handler->register_hooks();

        $order->save();
    }

    public function test_if_order_update_the_balance_got_updated() {
        $order_id = $this->create_single_vendor_order();
        $order = wc_get_order( $order_id );

        $mock_handler = \Mockery::mock( VendorBalanceUpdateHandler::class )->makePartial();
        $mock_handler->shouldAllowMockingProtectedMethods();
        $mock_handler->register_hooks();

        $mock_handler->shouldReceive( 'handle_order_edit' )->times( 2 );

        // if `update_balance` got called, `$order->save()` will be called.
        $mock_handler->shouldReceive( 'update_balance' );
        $order->save();

        $new_product = $this->factory()->product->set_seller_id( $this->seller_id1 )->create_and_get();

        $order->add_product( wc_get_product( $new_product ), 2 );

        $order->save();
    }
}
