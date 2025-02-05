<?php

namespace WeDevs\Dokan\Test\Orders;

use WeDevs\Dokan\Test\DokanTestCase;

class OrderRestoreFromTrashTest extends DokanTestCase {

    public function test_dokan_order_restore_from_trash() {

        $parent_order_id = $this->create_multi_vendor_order();

        $child_orders = dokan()->order->get_child_orders( $parent_order_id );
        $this->assertCount( 2, $child_orders );

        // Move to trash
        wp_trash_post( $parent_order_id );
        $this->assertEquals( 'trash', get_post_status( $parent_order_id ) );

        foreach ( $child_orders as $child_order ) {
            wp_trash_post( $child_order->get_id() );
            $this->assertEquals( 'trash', get_post_status( $child_order->get_id() ) );
        }

        $child_orders = dokan()->order->get_child_orders( $parent_order_id );
        $this->assertCount( 0, $child_orders );

        // Restore order
        wp_untrash_post( $parent_order_id );
        // Assert order status is not trash anymore
        $this->assertNotEquals( 'trash', get_post_status( $parent_order_id ) );

        // get from trash
        $child_orders = dokan()->order->get_child_orders( $parent_order_id, true );
        $this->assertCount( 2, $child_orders );

        foreach ( $child_orders as $child_order ) {
            wp_untrash_post( $child_order->get_id() );
            $this->assertNotEquals( 'trash', get_post_status( $child_order->get_id() ) );
        }
    }
}
