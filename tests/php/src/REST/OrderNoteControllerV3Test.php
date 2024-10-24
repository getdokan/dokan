<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-orders-v3
 * @group dokan-order-notes-v3
 */
class OrderNoteControllerV3Test extends DokanTestCase {
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
            "/{$this->namespace}/{$this->base}/(?P<order_id>[\\d]+)/notes",
            $routes
        );
        $this->assertArrayHasKey(
            "/{$this->namespace}/{$this->base}/(?P<order_id>[\\d]+)/notes/(?P<id>[\\d]+)",
            $routes
        );
    }

    /**
     * Test getting notes with unauthorized user
     */
    public function test_get_items_unauthorized() {
        wp_set_current_user( 0 );

        $response = $this->get_request( "orders/{$this->order_id}/notes" );

        $this->assertEquals( 401, $response->get_status() );
        $this->assertEquals( 'dokan_rest_cannot_view', $response->get_data()['code'] );
    }

    /**
     * Test getting notes for non-existent order
     */
    public function test_get_items_invalid_order() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'orders/999999/notes' );

        $this->assertEquals( 404, $response->get_status() );
        $this->assertEquals( 'dokan_rest_invalid_order', $response->get_data()['code'] );
    }

    /**
     * Test getting notes from another vendor's order
     */
    public function test_get_items_unauthorized_vendor() {
        wp_set_current_user( $this->seller_id2 );

        $response = $this->get_request( "orders/{$this->order_id}/notes" );

        $this->assertEquals( 403, $response->get_status() );
        $this->assertEquals( 'dokan_rest_unauthorized_order', $response->get_data()['code'] );
    }

    /**
     * Test getting notes successfully
     */
    public function test_get_items_success() {
        wp_set_current_user( $this->seller_id1 );

        // Add some test notes
        $order = wc_get_order( $this->order_id );
        $note1_id = $order->add_order_note( 'Test note 1' );
        $note2_id = $order->add_order_note( 'Test note 2', 1 ); // Customer note

        $response = $this->get_request( "orders/{$this->order_id}/notes" );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        // Verify notes are returned
        $this->assertCount( 2, $data );

        // Verify note structure
        $first_note = $data[0];
        $this->assertArrayHasKey( 'id', $first_note );
        $this->assertArrayHasKey( 'author', $first_note );
        $this->assertArrayHasKey( 'date_created', $first_note );
        $this->assertArrayHasKey( 'note', $first_note );
        $this->assertArrayHasKey( 'customer_note', $first_note );
    }

    /**
     * Test creating note with missing parameters
     */
    public function test_create_item_missing_params() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->post_request( "orders/{$this->order_id}/notes", [] );

        $this->assertEquals( 400, $response->get_status() );
    }

    /**
     * Test creating private note
     */
    public function test_create_private_note() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->post_request(
            "orders/{$this->order_id}/notes",
            [
                'note' => 'Test private note',
                'customer_note' => false,
            ]
        );

        $this->assertEquals( 201, $response->get_status() );
        $data = $response->get_data();

        // Verify note data
        $this->assertEquals( 'Test private note', $data['note'] );
        $this->assertFalse( $data['customer_note'] );

        // Verify author is set correctly
        $this->assertEquals(
            get_user_by( 'id', $this->seller_id1 )->display_name,
            $data['author']
        );

        // Verify vendor note meta
        $this->assertTrue(
            (bool) get_comment_meta( $data['id'], 'dokan_vendor_note', true )
        );
    }

    /**
     * Test creating customer note
     */
    public function test_create_customer_note() {
        wp_set_current_user( $this->seller_id1 );

        // Track email sending
        $emails_sent = 0;
        add_action(
            'woocommerce_new_customer_note', function () use ( &$emails_sent ) {
				$emails_sent++;
			}
        );

        $response = $this->post_request(
            "orders/{$this->order_id}/notes",
            [
                'note' => 'Test customer note',
                'customer_note' => true,
            ]
        );

        $this->assertEquals( 201, $response->get_status() );
        $data = $response->get_data();

        // Verify note data
        $this->assertEquals( 'Test customer note', $data['note'] );
        $this->assertTrue( $data['customer_note'] );

        // Verify email was sent
        $this->assertEquals( 1, $emails_sent );
    }

    /**
     * Test deleting note
     */
    public function test_delete_note() {
        wp_set_current_user( $this->seller_id1 );

        // Create a note
        $order = wc_get_order( $this->order_id );
        $note_id = $order->add_order_note( 'Test note' );

        $response = $this->delete_request(
            "orders/{$this->order_id}/notes/{$note_id}",
            [ 'force' => true ]
        );

        $this->assertEquals( 200, $response->get_status() );

        // Verify note was deleted
        $this->assertEmpty(
            wc_get_order_notes( [ 'id' => $note_id ] )
        );
    }

    /**
     * Test deleting non-existent note
     */
    public function test_delete_invalid_note() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->delete_request(
            "orders/{$this->order_id}/notes/999999",
            [ 'force' => true ]
        );

        $this->assertEquals( 404, $response->get_status() );
    }

    /**
     * Test note content sanitization
     */
    public function test_note_content_sanitization() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->post_request(
            "orders/{$this->order_id}/notes",
            [
                'note' => '<script>alert("xss")</script>Test note with <strong>HTML</strong>',
                'customer_note' => false,
            ]
        );

        $this->assertEquals( 201, $response->get_status() );
        $data = $response->get_data();

        // Verify harmful content was stripped but safe HTML remains
        $this->assertEquals(
            'alert("xss")Test note with <strong>HTML</strong>',
            $data['note']
        );
    }

    /**
     * Test note length limits
     */
    public function test_note_length_limits() {
        wp_set_current_user( $this->seller_id1 );

        // Test empty note
        $response = $this->post_request(
            "orders/{$this->order_id}/notes",
            [
                'note' => '',
                'customer_note' => false,
            ]
        );

        $this->assertEquals( 400, $response->get_status() );
        $this->assertEquals( 'dokan_rest_missing_note', $response->get_data()['code'] );

        // supported length: 65535

        // Test very long note
        $long_note = str_repeat( 'a', 100000 );
        $response = $this->post_request(
            "orders/{$this->order_id}/notes",
            [
                'note' => $long_note,
                'customer_note' => false,
            ]
        );

        $this->assertEquals( 500, $response->get_status() );
        $this->assertEquals( 'woocommerce_api_cannot_create_order_note', $response->get_data()['code'] );
    }

    /**
     * Test note creation with system user
     */
    public function test_system_note_creation() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->post_request(
            "orders/{$this->order_id}/notes",
            [
                'note' => 'System note',
                'customer_note' => false,
            ]
        );

        $this->assertEquals( 201, $response->get_status() );
        $data = $response->get_data();

        // Verify system note details
        $this->assertNotEquals( 'System', $data['author'] );
    }

    /**
     * Test concurrent note operations
     */
    public function test_concurrent_notes() {
        wp_set_current_user( $this->seller_id1 );

        // Create multiple notes concurrently
        $responses = [];
        for ( $i = 1; $i <= 3; $i++ ) {
            $responses[] = $this->post_request(
                "orders/{$this->order_id}/notes",
                [
                    'note' => "Concurrent note {$i}",
                    'customer_note' => false,
                ]
            );
        }

        // Verify all notes were created successfully
        foreach ( $responses as $response ) {
            $this->assertEquals( 201, $response->get_status() );
        }

        // Verify notes exist in correct order
        $response = $this->get_request( "orders/{$this->order_id}/notes" );
        $data = $response->get_data();

        $this->assertCount( 3, $data );
        $this->assertEquals( 'Concurrent note 1', $data[0]['note'] );
        $this->assertEquals( 'Concurrent note 2', $data[1]['note'] );
        $this->assertEquals( 'Concurrent note 3', $data[2]['note'] );
    }
}
