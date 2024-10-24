<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-orders-v3
 * @group dokan-order-actions-v3
 */
class OrderActionsControllerV3Test extends DokanTestCase {

    protected $namespace = 'dokan/v3';

    /**
     * Test getting available order actions.
     */
    public function test_get_order_actions() {
        wp_set_current_user( $this->seller_id1 );

        $order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create();

        $response = $this->get_request( "orders/{$order_id}/actions" );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        $this->assertIsArray( $data );
        $this->assertArrayHasKey( 'send_order_details', $data );
        $this->assertArrayHasKey( 'send_order_details_admin', $data );
        $this->assertArrayHasKey( 'regenerate_download_permissions', $data );
    }

    /**
     * Test applying an order action.
     */
    public function test_apply_order_action() {
        wp_set_current_user( $this->seller_id1 );

        $order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create();

        $response = $this->post_request(
            "orders/{$order_id}/actions", [
				'action' => 'send_order_details',
			]
        );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        $this->assertArrayHasKey( 'message', $data );
        $this->assertEquals( 'Order action applied successfully.', $data['message'] );
        $this->assertEquals( 'send_order_details', $data['action'] );
    }

    /**
     * Test applying an invalid order action.
     */
    public function test_apply_invalid_order_action() {
        wp_set_current_user( $this->seller_id1 );

        $order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create();

        $response = $this->post_request(
            "orders/{$order_id}/actions", [
				'action' => 'invalid_action',
			]
        );

        $this->assertEquals( 400, $response->get_status() );
    }
}
