<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-orders-v3
 * @group dokan-order-notes-v3
 */
class OrderNotesControllerTestV3 extends DokanTestCase {

    protected $namespace = 'dokan/v3';

    /**
     * Test creating an order note.
     */
    public function test_create_order_note() {
        wp_set_current_user( $this->seller_id1 );

        $order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create();

        $response = $this->post_request(
            "orders/{$order_id}/notes", [
				'note' => 'Test note',
				'customer_note' => false,
			]
        );

        $this->assertEquals( 201, $response->get_status() );
        $data = $response->get_data();

        $this->assertArrayHasKey( 'id', $data );
        $this->assertEquals( 'Test note', $data['note'] );
        $this->assertFalse( $data['customer_note'] );
    }

    /**
     * Test getting order notes.
     */
    public function test_get_order_notes() {
        wp_set_current_user( $this->seller_id1 );

        $order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create();

        // Add some notes
        wc_create_order_note( $order_id, 'Note 1' );
        wc_create_order_note( $order_id, 'Note 2', 1, true );

        $response = $this->get_request( "orders/{$order_id}/notes" );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        $this->assertCount( 2, $data );
        $this->assertEquals( 'Note 1', $data[0]['note'] );
        $this->assertFalse( $data[0]['customer_note'] );
        $this->assertEquals( 'Note 2', $data[1]['note'] );
        $this->assertTrue( $data[1]['customer_note'] );
    }

    /**
     * Test deleting an order note.
     */
    public function test_delete_order_note() {
        wp_set_current_user( $this->seller_id1 );

        $order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create();
        $note_id = wc_create_order_note( $order_id, 'Test note' );

        $response = $this->delete_request(
            "orders/{$order_id}/notes/{$note_id}",
            array( 'force' => true )
        );

        $this->assertEquals( 200, $response->get_status() );

        // Verify the note is deleted
        $this->assertEmpty( wc_get_order_notes( [ 'id' => $note_id ] ) );
    }
}
