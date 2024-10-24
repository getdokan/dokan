<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-orders-v3
 * @group dokan-order-actions-v3
 */
class OrderActionControllerV3Test extends DokanTestCase {
    /**
     * @var string
     */
    protected $namespace = 'dokan/v3';

    /**
     * @var string
     */
    protected $base = 'orders';

    /**
     * @var int
     */
    private $order_id;

    /**
     * Setup test environment
     */
    protected function setUp(): void {
        parent::setUp();

        // Create a test order for each test
        $this->order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create();

        // Ensure mailer is initialized
        WC()->mailer();
    }

    /**
     * Test route registration
     */
    public function test_register_routes() {
        $routes = rest_get_server()->get_routes();

        $this->assertArrayHasKey(
            "/{$this->namespace}/{$this->base}/(?P<id>[\\d]+)/actions",
            $routes
        );
    }

    /**
     * Test getting available order actions with unauthorized user
     */
    public function test_get_items_unauthorized() {
        wp_set_current_user( 0 );

        $response = $this->get_request( "orders/{$this->order_id}/actions" );

        $this->assertEquals( 401, $response->get_status() );
        $this->assertEquals( 'dokan_rest_cannot_view', $response->get_data()['code'] );
    }

    /**
     * Test getting actions for non-existent order
     */
    public function test_get_items_invalid_order() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'orders/999999/actions' );

        $this->assertEquals( 404, $response->get_status() );
        $this->assertEquals( 'dokan_rest_invalid_order_id', $response->get_data()['code'] );
    }

    /**
     * Test getting actions for parent order
     */
    public function test_get_items_parent_order() {
        wp_set_current_user( $this->seller_id1 );

        // Create parent order
        $order = wc_get_order( $this->order_id );
        $order->update_meta_data( 'has_sub_order', '1' );
        $order->save();

        $response = $this->get_request( "orders/{$this->order_id}/actions" );

        $this->assertEquals( 404, $response->get_status() );
        $this->assertEquals( 'dokan_rest_invalid_order', $response->get_data()['code'] );
    }

    /**
     * Test getting actions for another vendor's order
     */
    public function test_get_items_unauthorized_vendor() {
        wp_set_current_user( $this->seller_id2 );

        $response = $this->get_request( "orders/{$this->order_id}/actions" );

        $this->assertEquals( 403, $response->get_status() );
        $this->assertEquals( 'dokan_rest_unauthorized_order', $response->get_data()['code'] );
    }

    /**
     * Test getting available order actions successfully
     */
    public function test_get_items_success() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( "orders/{$this->order_id}/actions" );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        // Verify standard actions are available
        $this->assertArrayHasKey( 'send_order_details', $data );
        $this->assertArrayHasKey( 'send_order_details_admin', $data );
        $this->assertArrayHasKey( 'regenerate_download_permissions', $data );
    }

    /**
     * Test sending order details to customer
     */
    public function test_send_order_details_to_customer() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->post_request(
            "orders/{$this->order_id}/actions",
            [ 'action' => 'send_order_details' ]
        );

        $this->assertEquals( 200, $response->get_status() );

        // Verify order note was added
        $order = wc_get_order( $this->order_id );
        $notes = wc_get_order_notes( [ 'order_id' => $order->get_id() ] );
        $this->assertStringContainsString( 'Order details manually sent to customer', $notes[0]->content );
    }

    /**
     * Test sending new order notification to admin
     */
    public function test_send_order_details_to_admin() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->post_request(
            "orders/{$this->order_id}/actions",
            [ 'action' => 'send_order_details_admin' ]
        );

        $this->assertEquals( 200, $response->get_status() );

        $this->assertStringContainsString( 'Order action applied successfully', $response->get_data()['message'] );
        $this->assertStringContainsString( 'send_order_details_admin', $response->get_data()['action'] );
    }

    /**
     * Test regenerating download permissions
     */
    public function test_regenerate_download_permissions() {
        wp_set_current_user( $this->seller_id1 );

        // Create downloadable product
        $product = $this->factory()->product->create( [ 'downloadable' => true ] );

        // Add to order
        $order = wc_get_order( $this->order_id );
        $order->add_product( wc_get_product( $product ), 1 );
        $order->save();

        // Delete existing permissions
        $data_store = \WC_Data_Store::load( 'customer-download' );
        $data_store->delete_by_order_id( $order->get_id() );

        $response = $this->post_request(
            "orders/{$this->order_id}/actions",
            [ 'action' => 'regenerate_download_permissions' ]
        );

        $this->assertEquals( 200, $response->get_status() );

        $this->assertStringContainsString( 'Order action applied successfully', $response->get_data()['message'] );
        $this->assertStringContainsString( 'regenerate_download_permissions', $response->get_data()['action'] );
    }

    /**
     * Test invalid action request
     */
    public function test_invalid_action() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->post_request(
            "orders/{$this->order_id}/actions",
            [ 'action' => 'invalid_action' ]
        );

        $this->assertEquals( 400, $response->get_status() );
        $this->assertEquals( 'dokan_rest_invalid_order_action', $response->get_data()['code'] );
    }

    /**
     * Test custom order action through filter
     */
    public function test_custom_order_action() {
        wp_set_current_user( $this->seller_id1 );

        // Add custom action
        add_filter(
            'woocommerce_order_actions', function ( $actions ) {
				$actions['custom_action'] = 'Custom Action';
				return $actions;
			}
        );

        // Verify custom action is available
        $response = $this->get_request( "orders/{$this->order_id}/actions" );
        $data = $response->get_data();
        $this->assertArrayHasKey( 'custom_action', $data );

        // Setup action tracking
        $action_called = false;
        add_action(
            'woocommerce_order_action_custom_action', function () use ( &$action_called ) {
				$action_called = true;
			}
        );

        // Execute custom action
        $response = $this->post_request(
            "orders/{$this->order_id}/actions",
            [ 'action' => 'custom_action' ]
        );

        $this->assertEquals( 200, $response->get_status() );
        $this->assertTrue( $action_called, 'Custom action should be executed' );
    }

    /**
     * Test action with missing parameters
     */
    public function test_missing_action_parameter() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->post_request( "orders/{$this->order_id}/actions", [] );

        $this->assertEquals( 400, $response->get_status() );
    }

    /**
     * Test concurrent action requests
     */
    public function test_concurrent_actions() {
        wp_set_current_user( $this->seller_id1 );

        // Track email sends
        $emails_sent = 0;
        add_action(
            'woocommerce_after_resend_order_email', function () use ( &$emails_sent ) {
				$emails_sent++;
			}
        );

        // Send multiple concurrent requests
        $responses = [];
        for ( $i = 0; $i < 3; $i++ ) {
            $responses[] = $this->post_request(
                "orders/{$this->order_id}/actions",
                [ 'action' => 'send_order_details' ]
            );
        }

        // Verify all requests succeeded
        foreach ( $responses as $response ) {
            $this->assertEquals( 200, $response->get_status() );
        }

        // Verify emails were sent for each request
        $this->assertEquals( 3, $emails_sent );
    }
}
