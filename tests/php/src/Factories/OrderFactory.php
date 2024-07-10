<?php
namespace WeDevs\Dokan\Test\Factories;

use WC_Abstract_Order;
use WC_Coupon;
use WC_Order;
use WC_Order_Item_Fee;
use WC_Order_Item_Shipping;
use WeDevs\Dokan\Test\Helpers\WC_Helper_Order;
use WP_UnitTest_Factory_For_Thing;
use WC_Order_Item;

class OrderFactory extends WP_UnitTest_Factory_For_Thing {
    /**
     * @var array<WC_Order_Item>
     */
    protected $order_items = [];

    /**
     * @var array<WC_Coupon>
     */
    protected $coupon_items = [];

    /**
     * Factory Instance.
     *
     * @param DokanFactory $factory
     */
    public function __construct( $factory = null ) {
        parent::__construct( $factory );
        $this->default_generation_definitions = array(
            'status'      => 'pending',
            'customer_id' => 1,
        );
    }

    public function create_object( $args ) {
        $order = wc_create_order();

        if ( ! empty( $args['customer_id'] ) ) {
            $order->set_customer_id( $args['customer_id'] );
        }

        $line_items = isset( $args['line_items'] ) ? $args['line_items'] : $this->get_default_line_items();

        if ( ! empty( $line_items ) ) {
            foreach ( $line_items as $item_data ) {
                $product = wc_get_product( $item_data['product_id'] );
                $order->add_product( $product, $item_data['quantity'] );
            }
        }

        if ( ! empty( $args['status'] ) ) {
            $order->set_status( $args['status'] );
        }

        foreach ( $this->order_items as $item ) {
            $item->set_order_id( $order->get_id() );

            $order->add_item( $item );
        }

        foreach ( $this->coupon_items as $item ) {
            $order->apply_coupon( $item->get_code() );
        }

        $order->calculate_totals();

        $order->save();

        // Dispatch the action to create the Dokan Suborder.
        do_action( 'woocommerce_checkout_update_order_meta', $order->get_id() );

        return $order->get_id();
    }

    public function update_object( $order_id, $fields ) {
        $order = wc_get_order( $order_id );

        if ( isset( $fields['status'] ) ) {
            $order->set_status( $fields['status'] );
        }

        if ( isset( $fields['customer_id'] ) ) {
            $order->set_customer_id( $fields['customer_id'] );
        }

        if ( isset( $fields['line_items'] ) ) {
            $this->remove_all_items( $order );
            foreach ( $fields['line_items'] as $item_data ) {
                $product = wc_get_product( $item_data['product_id'] );
                $order->add_product( $product, $item_data['quantity'] );
            }
        }

        $order->save();

        return $order_id;
    }

    public function get_object_by_id( $order_id ) {
        return wc_get_order( $order_id );
    }

    public function remove_all_items( WC_Abstract_Order $order ) {
        foreach ( $order->get_items() as $item ) {
            wc_delete_order_item( $item->get_id() );
        }
    }

    protected function get_default_line_items(): array {
        return array(
            array(
                'product_id' => $this->factory->product->create( array( 'name' => 'Test Product 1' ) ),
                'quantity'   => 2,
            ),
            array(
                'product_id' => $this->factory->product->create( array( 'name' => 'Test Product 2' ) ),
                'quantity'   => 1,
            ),
        );
    }

    /**
     * Add a discount or coupon line item to the Order.
     *
     * @param array $order_data
     * @param array $products
     * @param array $coupon_data
     * @return WC_Order
     */
    public function add_discount( \WC_Order $order, \WC_Coupon $coupon ) {
        $order->apply_coupon( $coupon->get_code() );

        // Calculate totals
        $order->calculate_totals();

        // Save the order
        $order->save();

        return $order;
    }

    public function set_item_coupon( WC_Coupon $coupon ) {
        $this->coupon_items[] = $coupon;

        return $this;
    }

    public function set_item_fee( array $args = [
		'name' => 'Extra Fee',
		'amount' => 100,
	] ) {
        $args = wp_parse_args(
            $args, [
				'name' => 'Extra Fee',
				'amount' => 100,
			]
        );

        $fee_item = new WC_Order_Item_Fee();
        $fee_item->set_name( $args['name'] );
        $fee_item->set_total( $args['amount'] );

        $this->order_items[] = $fee_item;

        return $this;
    }

    public function set_item_shipping( array $args = [] ) {
        $args = wp_parse_args(
            $args, [
				'name' => 'Flat shipping',
				'amount' => 25,
			]
        );

        $shipping_item = new WC_Order_Item_Shipping();
        $shipping_item->set_name( $args['name'] );
        $shipping_item->set_total( $args['amount'] );

        $this->order_items[] = $shipping_item;

        return $this;
    }

    /**** Wrapper of WC Test */

    /**
     * Delete an order.
     *
     * @param int $order_id ID of the order to delete.
     */
    public static function delete_order( $order_id ) {
        return WC_Helper_Order::delete_order( $order_id );
    }

    /**
     * Create a order.
     *
     * @since   2.4
     * @version 3.0 New parameter $product.
     *
     * @param int        $customer_id The ID of the customer the order is for.
     * @param WC_Product $product The product to add to the order.
     * @param int        $product_quantity The product quanitty to add to the order.
     *
     * @return WC_Order
     */
    public static function create_order( $customer_id = 1, $product = null, $product_quantity = 1 ) {
        return WC_Helper_Order::create_order( $customer_id, $product, $product_quantity );
    }

    /**
     * Helper function to create order with fees and shipping objects.
     *
     * @param int        $customer_id The ID of the customer the order is for.
     * @param WC_Product $product The product to add to the order.
     *
     * @return WC_Order
     */
    public static function create_order_with_fees_and_shipping( $customer_id = 1, $product = null ) {
		return WC_Helper_Order::create_order_with_fees_and_shipping( $customer_id, $product );
    }
}
