<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\OrderControllerV2;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;

/**
 * Authorization test for the REST orders bulk-actions endpoint.
 *
 * Verifies the other caller of the shared OrderUtil::current_user_can_manage_order() guard
 * (audit L6 / plugin-internal-tasks#2148): POST dokan/v2/orders/bulk-actions must not let a
 * vendor change another vendor's order status.
 *
 * @group orders
 * @group order-status
 * @group dokan-authorization
 * @group security
 *
 * @covers \WeDevs\Dokan\REST\OrderControllerV2::process_orders_bulk_action
 */
class OrderBulkActionsOwnershipTest extends DokanTestCase {

    /**
     * REST namespace for this controller.
     *
     * @var string
     */
    protected $namespace = 'dokan/v2';

    public function set_up() {
        parent::set_up();

        ( new OrderControllerV2() )->register_routes();
    }

    /**
     * A vendor cannot change another vendor's order status through the bulk-actions endpoint;
     * their own order still changes.
     */
    public function test_vendor_cannot_bulk_change_foreign_order_status() {
        $own_order     = $this->create_single_vendor_order( $this->seller_id1 );
        $foreign_order = $this->create_single_vendor_order( $this->seller_id2 );

        wp_set_current_user( $this->seller_id1 );

        $request = new WP_REST_Request( 'POST', '/dokan/v2/orders/bulk-actions' );
        $request->set_body_params(
            [
                'order_ids' => [ $own_order, $foreign_order ],
                'status'    => 'completed',
            ]
        );
        $response = $this->server->dispatch( $request );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( 'completed', wc_get_order( $own_order )->get_status(), 'Vendor should update their own order.' );
        $this->assertSame( 'processing', wc_get_order( $foreign_order )->get_status(), 'Vendor must not update another vendor\'s order.' );
    }

    public function tear_down() {
        wp_set_current_user( 0 );
        parent::tear_down();
    }
}
