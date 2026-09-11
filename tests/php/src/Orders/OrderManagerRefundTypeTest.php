<?php

namespace WeDevs\Dokan\Test\Orders;

use WC_Order_Refund;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Order\Manager::all() must only ever return real orders.
 *
 * `get_backward_compatibility_args()` declares `'type' => 'shop_order'` but used to
 * drop the key while building `$query_args`, so `wc_get_orders()` fell back to its
 * own default of `[ 'shop_order', 'shop_order_refund' ]`. Any caller that did not
 * scope by `seller_id` — the admin branch of `OrderController::get_items()` being
 * the one in the plugin — then got `WC_Order_Refund` objects mixed into the
 * collection and fatalled on `$object->get_refunds()`.
 *
 * Regressed in #1833 (3.8.0), reported as dokan-pro#6059.
 *
 * @group orders
 * @group order-manager
 */
class OrderManagerRefundTypeTest extends DokanTestCase {

    /**
     * Order id carrying the refund.
     *
     * @var int
     */
    private $order_id;

    /**
     * Refund id created against the order.
     *
     * @var int
     */
    private $refund_id;

    public function set_up() {
        parent::set_up();

        $this->order_id = $this->create_single_vendor_order( $this->seller_id1 );

        $refund = wc_create_refund(
            [
                'amount'   => 5,
                'reason'   => 'refund type regression',
                'order_id' => $this->order_id,
            ]
        );

        $this->assertNotWPError( $refund, 'Failed to seed the refund the test depends on.' );

        $this->refund_id = $refund->get_id();
    }

    /**
     * The unscoped listing — the admin path — must not leak refund objects.
     */
    public function test_all_excludes_refund_objects() {
        $orders = dokan()->order->all( [ 'limit' => 20 ] );

        $this->assertNotEmpty( $orders, 'The seeded order should be listed.' );

        foreach ( $orders as $order ) {
            $this->assertNotInstanceOf( WC_Order_Refund::class, $order, 'Order\Manager::all() returned a refund object.' );
            $this->assertSame( 'shop_order', $order->get_type() );
        }
    }

    /**
     * The count query counts orders, not orders plus their refunds.
     */
    public function test_all_does_not_count_refunds() {
        $ids   = dokan()->order->all(
            [
                'limit'  => 20,
                'return' => 'ids',
            ]
        );
        $count = dokan()->order->all(
            [
                'limit'  => 20,
                'return' => 'count',
            ]
        );

        $this->assertNotContains( $this->refund_id, $ids, 'The refund id must not appear in the id listing.' );
        $this->assertSame( count( $ids ), (int) $count, 'The count must match the number of orders returned.' );
    }

    /**
     * A caller asking for refunds still gets them — the default is a default, not a lock.
     */
    public function test_an_explicit_type_argument_is_still_honoured() {
        $ids = dokan()->order->all(
            [
                'limit'  => 20,
                'type'   => [ 'shop_order', 'shop_order_refund' ],
                'return' => 'ids',
            ]
        );

        $this->assertContains( $this->refund_id, $ids, 'An explicit type argument must override the shop_order default.' );
    }

    /**
     * The unscoped admin listing used to fatal on `WC_Order_Refund::get_refunds()`.
     */
    public function test_admin_order_listing_survives_a_refunded_order() {
        wp_set_current_user( $this->admin_id );

        $response = $this->get_request( 'orders', [ 'per_page' => 20 ] );

        $this->assertSame( 200, $response->get_status() );

        foreach ( $response->get_data() as $order ) {
            $this->assertNotSame( $this->refund_id, $order['id'], 'A refund must not be rendered as an order.' );
        }
    }

    public function tear_down() {
        wp_set_current_user( 0 );

        parent::tear_down();
    }
}
