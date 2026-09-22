<?php

namespace WeDevs\Dokan\Test\Orders;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Ownership guard for the shared bulk order-status helper.
 *
 * Covers the cross-vendor IDOR (audit L6 / plugin-internal-tasks#2148) where the
 * legacy vendor-dashboard bulk form reached dokan_apply_bulk_order_status_change()
 * without an ownership check. The guard now lives in the shared helper, so both the
 * REST bulk-actions endpoint and the dashboard form are covered.
 *
 * @group orders
 * @group order-status
 * @group security
 */
class BulkOrderStatusOwnershipTest extends DokanTestCase {

    /**
     * A vendor cannot change another vendor's order status; their own still changes.
     */
    public function test_vendor_cannot_change_other_vendors_order_status() {
        $own_order     = $this->create_single_vendor_order( $this->seller_id1 );
        $foreign_order = $this->create_single_vendor_order( $this->seller_id2 );

        wp_set_current_user( $this->seller_id1 );

        dokan_apply_bulk_order_status_change(
            [
                'status'      => 'completed',
                'bulk_orders' => [ $own_order, $foreign_order ],
            ]
        );

        $this->assertSame( 'completed', wc_get_order( $own_order )->get_status(), 'Vendor should be able to update their own order.' );
        $this->assertSame( 'processing', wc_get_order( $foreign_order )->get_status(), 'Vendor must not update another vendor\'s order.' );
    }

    /**
     * Admins / shop managers are exempt and may change any vendor's order.
     */
    public function test_admin_can_change_any_order_status() {
        $foreign_order = $this->create_single_vendor_order( $this->seller_id2 );

        wp_set_current_user( $this->admin_id );

        dokan_apply_bulk_order_status_change(
            [
                'status'      => 'completed',
                'bulk_orders' => [ $foreign_order ],
            ]
        );

        $this->assertSame( 'completed', wc_get_order( $foreign_order )->get_status(), 'Admin should be able to update any order.' );
    }

    public function tear_down() {
        wp_set_current_user( 0 );
        parent::tear_down();
    }
}
