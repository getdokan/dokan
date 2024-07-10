# Dokan Factories
- [Introduction](#introduction)
- [Product Factory](#product-factory)
- [Order Factory](#order-factory)
- [Coupon Factory](#coupon-factory)
- [Why Woocommerce Helper](#why-woocommerce-helper-methods-are-wrapped)

### Introduction

When writing unit tests for various functionalities in Dokan, it's essential to have factories for different entities such as Vendor, Vendor specific Products, Coupons, Shipping, Orders, etc. These factories make it easier to create test data and ensure your tests are readable and maintainable.

**Extending [DokanUnitTestCase](./../../tests/php/src/DokanUnitTestCase.php#L14)**

To write unit tests in Dokan smoothly, your test class should extend the `WeDevs\Dokan\Test\DokanUnitTestCase` abstract class. This class contains a method and property named `factory` to return the [DokanFactory](./../../tests/php/src/Factories/DokanFactory.php), allowing you to access factories for various entities.

**Usage**  

You can access these factories using the following syntax:
```
$this->factory()->{entity}->{method}
```

All Dokan factory classes extend **WP_UnitTest_Factory_For_Thing** and also have wrapper methods of respective [**Woocommerce Factories**](https://github.com/woocommerce/woocommerce/tree/trunk/plugins/woocommerce/tests/legacy/framework/helpers).

### [Product Factory](./../../tests/php/src/Factories/ProductFactory.php)
Example of Product factory:

```

class ProductTest extends \WeDevs\Dokan\Test\DokanUnitTestCase {
    public function test_coupon_creation() {
        $seller_id = $this->factory()->seller->create();

        $product_id = $this->factory()->product
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
```

### [Order Factory](./../../tests/php/src/Factories/OrderFactory.php) 

Example of Order Factory:

```
class DokanOrderTest extends \WeDevs\Dokan\Test\DokanUnitTestCase {
    public function test_order_creation() {
        $seller_id1 = $this->factory()->seller->create();
        $seller_id2 = $this->factory()->seller->create();

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
                            ->set_seller_id( $seller_id1 )
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
                            ->set_seller_id( seller_id2 )
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
}
```

`$this->assertDatabaseCount( 'posts', 3, [ 'post_type' => 'shop_order'] );` assures that Dokan sub-orders have been created because there are two vendor's products during the order creation.

> The methods `set_item_fee`, `set_item_shipping` and `set_item_coupon` are optional. So, we may use them when needs.

### [Coupon Factory](./../../tests/php/src/Factories/CouponFactory.php)

You can create coupon using `coupon` factory.
```
class MyCouponTest extends \WeDevs\Dokan\Test\DokanUnitTestCase {
    public function test_coupon_creation() {
        $coupon_id = $this->factory()->coupon->create(
            'code' => 'test_coupon_code',
            'status' => 'publish',
            'meta' => [
                'discount_type' => 'percent',
                'coupon_amount' => '20'
            ]
        );
    }
}
```

You can pass [meta](./../../tests/php/src/Helpers/WC_Helper_Coupon.php#L33) as per your requirements.

### Why WooCommerce Helper Methods are Wrapped

Dokan factory classes utilize the WC Factories so that we can adapt to future changes in WooCommerce. By wrapping WooCommerce helper methods, we ensure that our application test code remains consistent and compatible with any updates in WooCommerce. This approach allows us to modify the wrapper methods as needed to align with WooCommerce changes, maintaining the stability and reliability of our tests.

Dokan factory classes utilize the [WC Factories](https://github.com/woocommerce/woocommerce/tree/trunk/plugins/woocommerce/tests/legacy/framework/helpers) so that we can adapt the future changes of Woocommerce. Our application test code will be consistent because well will be to change wrapper method to make compatible with WC changes.