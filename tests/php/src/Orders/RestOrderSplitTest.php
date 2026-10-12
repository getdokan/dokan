<?php

namespace WeDevs\Dokan\Test\Orders;

use WeDevs\Dokan\Order\Hooks;
use WeDevs\Dokan\REST\OrderController;
use WeDevs\Dokan\REST\OrderControllerV2;
use WeDevs\Dokan\REST\OrderControllerV3;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;

/**
 * Regression tests for splitting orders created through the WooCommerce REST API.
 *
 * Every versioned REST\OrderController used to register the WooCommerce REST
 * insert hooks from its constructor, so a multi-vendor order created over REST
 * was split once per API version and ended up with N x 3 sub-orders (#3230).
 *
 * @since DOKAN_SINCE
 *
 * @group orders
 * @group rest-order-split
 *
 * @covers \WeDevs\Dokan\Order\Hooks::split_rest_order
 * @covers \WeDevs\Dokan\Order\Hooks::mark_rest_order_as_parent
 */
class RestOrderSplitTest extends DokanTestCase {

    /**
     * Number of vendors with a product in the order.
     */
    private const VENDOR_COUNT = 2;

    /**
     * How many times a sub-order was created during the current test.
     *
     * @var int
     */
    private $sub_orders_created = 0;

    /**
     * Set up the per-test sub-order counter.
     *
     * @return void
     */
    public function setUp(): void {
        parent::setUp();

        $this->sub_orders_created = 0;

        // Fired once for every sub-order that create_sub_order() produces.
        add_action( 'dokan_checkout_update_order_meta', [ $this, 'count_sub_order' ] );
    }

    /**
     * Count one sub-order creation.
     *
     * @return void
     */
    public function count_sub_order() {
        ++$this->sub_orders_created;
    }

    /**
     * The REST split hooks are bound to Order\Hooks exactly once, never to a REST controller.
     *
     * @return void
     */
    public function test_rest_split_hooks_are_registered_once() {
        // The REST manager has already instantiated every controller version in setUp().
        // Instantiate them again to make sure constructors do not add callbacks.
        new OrderController();
        new OrderControllerV2();
        new OrderControllerV3();

        foreach ( [ 'woocommerce_rest_pre_insert_shop_order_object', 'woocommerce_rest_insert_shop_order_object', 'woocommerce_new_order_data' ] as $hook_name ) {
            $this->assertSame( 0, $this->count_callbacks_bound_to( $hook_name, OrderController::class ), "$hook_name must not be bound to a REST controller" );
            $this->assertSame( 1, $this->count_callbacks_bound_to( $hook_name, Hooks::class ), "$hook_name must be bound to Order\\Hooks exactly once" );
        }
    }

    /**
     * Creating a multi-vendor order over REST produces one sub-order per vendor.
     *
     * @return void
     */
    public function test_rest_created_multi_vendor_order_is_split_once() {
        $order   = $this->create_unsplit_multi_vendor_order();
        $request = new WP_REST_Request( 'POST', '/wc/v3/orders' );

        // Mirror what WC_REST_Orders_Controller::create_item() fires.
        $order = apply_filters( 'woocommerce_rest_pre_insert_shop_order_object', $order, $request, true );
        $order->save();
        do_action( 'woocommerce_rest_insert_shop_order_object', $order, $request, true );

        $this->assertTrue( wc_string_to_bool( $order->get_meta( 'has_sub_order' ) ), 'Parent order should be flagged as having sub-orders' );
        $this->assertSame( self::VENDOR_COUNT, $this->sub_orders_created, 'Each vendor sub-order must be created exactly once' );
        $this->assertCount( self::VENDOR_COUNT, dokan()->order->get_child_orders( $order->get_id() ) );
    }

    /**
     * Updating an already split parent over REST keeps its existing sub-orders.
     *
     * @return void
     */
    public function test_rest_update_does_not_recreate_sub_orders() {
        $order   = $this->create_unsplit_multi_vendor_order();
        $request = new WP_REST_Request( 'POST', '/wc/v3/orders' );

        $order = apply_filters( 'woocommerce_rest_pre_insert_shop_order_object', $order, $request, true );
        $order->save();
        do_action( 'woocommerce_rest_insert_shop_order_object', $order, $request, true );

        $child_ids_after_create = $this->get_child_order_ids( $order->get_id() );
        $this->assertCount( self::VENDOR_COUNT, $child_ids_after_create );

        $this->sub_orders_created = 0;
        $update_request           = new WP_REST_Request( 'PUT', '/wc/v3/orders/' . $order->get_id() );

        $order = apply_filters( 'woocommerce_rest_pre_insert_shop_order_object', $order, $update_request, false );
        $order->save();
        do_action( 'woocommerce_rest_insert_shop_order_object', $order, $update_request, false );

        $this->assertSame( 0, $this->sub_orders_created, 'An update must not create sub-orders again' );
        $this->assertSame( $child_ids_after_create, $this->get_child_order_ids( $order->get_id() ), 'Existing sub-orders must survive a REST update' );
    }

    /**
     * Create an order with one product from each vendor without triggering the checkout split.
     *
     * @return \WC_Order
     */
    private function create_unsplit_multi_vendor_order() {
        $order = wc_create_order( [ 'customer_id' => $this->customer_id ] );

        foreach ( [ $this->seller_id1, $this->seller_id2 ] as $index => $seller_id ) {
            $product_id = $this->factory()->product->set_seller_id( $seller_id )->create(
                [
                    'name'          => 'REST split product ' . $index,
                    'regular_price' => 10,
                    'price'         => 10,
                ]
            );

            $order->add_product( wc_get_product( $product_id ), 1 );
        }

        $order->calculate_totals();
        $order->save();

        $this->assertEmpty( dokan()->order->get_child_orders( $order->get_id() ), 'Fixture order must start without sub-orders' );

        return $order;
    }

    /**
     * Sorted IDs of the sub-orders that belong to a parent order.
     *
     * @param int $parent_order_id Parent order ID.
     *
     * @return int[]
     */
    private function get_child_order_ids( $parent_order_id ) {
        $ids = array_map(
            static function ( $child_order ) {
                return $child_order->get_id();
            },
            dokan()->order->get_child_orders( $parent_order_id )
        );

        sort( $ids );

        return $ids;
    }

    /**
     * Count the callbacks on a hook whose object is an instance of the given class.
     *
     * @param string $hook_name  Hook name.
     * @param string $class_name Fully qualified class name.
     *
     * @return int
     */
    private function count_callbacks_bound_to( $hook_name, $class_name ) {
        global $wp_filter;

        if ( empty( $wp_filter[ $hook_name ] ) ) {
            return 0;
        }

        $count = 0;

        foreach ( $wp_filter[ $hook_name ]->callbacks as $callbacks ) {
            foreach ( $callbacks as $callback ) {
                if ( is_array( $callback['function'] ) && $callback['function'][0] instanceof $class_name ) {
                    ++$count;
                }
            }
        }

        return $count;
    }
}
