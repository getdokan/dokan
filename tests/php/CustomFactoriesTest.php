<?php
namespace WeDevs\Dokan\Test;

use WC_Coupon;
use WC_Customer;
use WC_Order_Item_Shipping;
use WeDevs\Dokan\Vendor\Vendor;

class CustomFactoriesTest extends DokanTestCase {
    public function test_create_order() {
        $order_id = $this->factory()
            ->order
            ->set_item_fee( [ 'name' => 'Extra Charge', 'amount' => 10 ] )
            ->set_item_shipping( [ 'name' => 'Shipping Fee', 'amount' => 10 ] )
            ->set_item_coupon( 
                $this->factory()->coupon->create_and_get( [ 'meta' => [ 'coupon_amount' => 15 ] ] ) 
            )
            ->create( [
                'status'      => 'pending',
                'customer_id' => $this->factory()->customer->create([]),
                'line_items'  => array(
                    array(
                        'product_id' => $this->factory()->product
                            ->set_seller_id(4)
                            ->create( 
                                [
                                    'name' => 'Test Product 1',
                                    'regular_price' => 5,
                                    'price' => 5,
                                ]
                            ),
                        'quantity'   => 2,
                    ),
                    array(
                        'product_id' => $this->factory()->product
                            ->set_seller_id(5)
                            ->create( 
                                [ 
                                    'name' => 'Test Product 2',
                                    'regular_price' => 5,
                                    'price' => 5,
                                ]
                            ),
                        'quantity'   => 1,
                    ),
                ),
            ] );

        $order = wc_get_order( $order_id );
        $this->assertInstanceOf( 'WC_Order', $order );
        $this->assertEquals( 'pending', $order->get_status() );
        $this->assertEquals( 2, $order->get_customer_id() );
        $this->assertEquals( 10, $order->get_total_fees());
        $this->assertEquals( 10, $order->get_shipping_total() );
        $this->assertEquals( 15, $order->get_subtotal() );
        $this->assertEquals( 15, $order->get_discount_total() );
        $this->assertEquals( 20, $order->get_total() );

        $line_items = $order->get_items();
        $this->assertCount( 2, $line_items );

        $line_item = reset( $line_items );
        $this->assertEquals( 2, $line_item->get_quantity() );

        $this->assertNotEmpty( $order->get_meta( 'has_sub_order' ) );

        $this->assertDatabaseCount( 'posts', 3, [ 'post_type' => 'shop_order'] );
        $this->assertDatabaseCount( 'posts', 2, [ 'post_type' => 'product'] );
    }

    public function test_create_customer() {
        $customer_id = $this->factory()->customer->create( array(
            'email' => 'testcustomer@example.com',
            'first_name' => 'Test',
            'last_name' => 'Customer',
        ) );

        $customer = new WC_Customer( $customer_id );

        $this->assertInstanceOf( 'WC_Customer', $customer );
        $this->assertEquals( 'testcustomer@example.com', $customer->get_email() );
        $this->assertEquals( 'Test', $customer->get_first_name() );
        $this->assertEquals( 'Customer', $customer->get_last_name() );
    }

    public function test_create_seller() {
        $seller_id = $this->factory()->seller->create( array(
            'email' => 'seller@example.com',
            'shopname' => 'my_shop',
        ) );

        $seller = new Vendor( $seller_id );

        $this->assertInstanceOf( Vendor::class, $seller );
        $this->assertEquals( 'seller@example.com', $seller->get_email() );
        $this->assertEquals( 'my_shop', $seller->get_shop_name() );
    }

    public function test_create_shipping() {
        $order_id = $this->factory()->order->create();
        $shipping_id = $this->factory()->shipping->create( array(
            'order_id' => $order_id,
            'method_title' => 'Flat Rate',
            'method_id' => 'flat_rate',
            'total' => 10.00,
        ) );

        $shipping_item = new WC_Order_Item_Shipping( $shipping_id );

        $this->assertInstanceOf( 'WC_Order_Item_Shipping', $shipping_item );
        $this->assertEquals( 'Flat Rate', $shipping_item->get_method_title() );
        $this->assertEquals( 'flat_rate', $shipping_item->get_method_id() );
        $this->assertEquals( 10.00, $shipping_item->get_total() );
    }

    public function test_create_coupon() {
        $coupon_id = $this->factory()->coupon->create( array(
            'code' => 'testcoupon',
            'meta' => [
                'discount_type'=> 'percent',
                'coupon_amount' => 20,
            ]
        ) );

        $coupon = new WC_Coupon( $coupon_id );

        $this->assertInstanceOf( 'WC_Coupon', $coupon );
        $this->assertEquals( 'testcoupon', $coupon->get_code() );
        $this->assertEquals( 'percent', $coupon->get_discount_type() );
        $this->assertEquals( '20', $coupon->get_amount() );
    }

    public function test_create_product() {
        $seller_id = 5;

        $product_id = self::factory()->product
            ->set_seller_id( $seller_id )
            ->create( array(
                'name' => 'Test Product',
                'regular_price' => '19.99',
            ) );

        $product = wc_get_product( $product_id );

        $this->assertInstanceOf( 'WC_Product_Simple', $product );
        $this->assertEquals( 'Test Product', $product->get_name() );
        $this->assertEquals( '19.99', $product->get_regular_price() );
        $this->assertEquals( $seller_id, dokan_get_vendor_by_product( $product, true ) );
    }
}
