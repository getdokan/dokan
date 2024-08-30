<?php
namespace WeDevs\Dokan\Test\Factories;

use Exception;
use WC_Order_Item_Shipping;
use WP_UnitTest_Factory;
use WP_UnitTest_Factory_For_Thing;
use WP_UnitTest_Generator_Sequence;

class ShippingFactory extends WP_UnitTest_Factory_For_Thing {
    public function __construct( $factory = null ) {
        parent::__construct( $factory );
        $this->default_generation_definitions = [
            // 'order_id' => 1, // Required
            'method_title' => new WP_UnitTest_Generator_Sequence( 'Shipping Method %s' ),
            'method_id' => new WP_UnitTest_Generator_Sequence( 'shipping_method_%s' ),
            'total' => 10,
        ];
    }

    public function create_object( $args ) {
        $order = wc_get_order( $args['order_id'] );

        if ( ! $order ) {
            throw new Exception( 'Order found for ID ' . (int) $args['order_id'] );
        }

        $shipping_item = new WC_Order_Item_Shipping();
        $shipping_item->set_props( $args );

        $order->add_item( $shipping_item );
        $order->save();

        return $shipping_item->get_id();
    }

    public function update_object( $shipping_id, $fields ) {
        $shipping_item = new WC_Order_Item_Shipping( $shipping_id );

        if ( ! $shipping_item ) {
            throw new Exception( 'Shipping item not found for ID ' . (int) $shipping_id );
        }
        $shipping_item->set_props( $fields );

        $shipping_item->save();

        return $shipping_id;
    }

    public function get_object_by_id( $shipping_id ) {
        return new WC_Order_Item_Shipping( $shipping_id );
    }
}
