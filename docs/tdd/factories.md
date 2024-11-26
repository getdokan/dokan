# Dokan Factories
- [Introduction](#introduction)
- [User Factory](#user-factory)
- [Customer Factory](#customer-factory)
- [Seller Factory](#seller-factory)
- [Product Factory](#product-factory)
- [Coupon Factory](#coupon-factory)
- [Order Factory](#order-factory)
- [Example of Factories](#example-of-factories)
- [Why Woocommerce Helper](#why-woocommerce-helper-methods-are-wrapped)


## Introduction

When writing unit tests for various functionalities in Dokan, it's essential to have factories for different entities such as Vendor, Vendor specific Products, Coupons, Shipping, Orders, etc. These factories make it easier to create test data and ensure your tests are readable and maintainable.

**Extending [DokanTestCase](./../../tests/php/src/DokanTestCase.php#L14)**

To write unit tests in Dokan smoothly, your test class should extend the `WeDevs\Dokan\Test\DokanTestCase` abstract class. This class contains a method and property named `factory` to return the [DokanFactory](./../../tests/php/src/Factories/DokanFactory.php), allowing you to access factories for various entities.

**Usage**  

You can access these factories using the following syntax:
```php
$this->factory()->{entity}->{method}
```
> Generally, `create` method is used to get the *ID* and `create_and_get` method is used to get the *instance*.

All Dokan factory classes extend **WP_UnitTest_Factory_For_Thing** and also have wrapper methods of respective [**Woocommerce Factories**](https://github.com/woocommerce/woocommerce/tree/trunk/plugins/woocommerce/tests/legacy/framework/helpers).


## [User Factory](./../../tests/php/src/Factories/CustomerFactory.php)
```php
// Get the user ID.
$admin_id = $this->factory()->user->create(
    [
        'role' => 'administrator',
    ]
);

// Get the user instance.
$admin_user = $this->factory()->user->create_and_get(
    [
        'role' => 'administrator',
    ]
);
```

## [Customer Factory](./../../tests/php/src/Factories/CustomerFactory.php)
```php
 $customer_id = $this->customer->create(); // Create customer with default data.
 
 // Create customer with given data.
 $customer_id = $this->customer->create(
    [
        'first_name' => 'User First Name',
        'last_name' => 'User last Name',
        'email' => 'user@example.com',
    ]
 );
```


## [Seller Factory](./../../tests/php/src/Factories/SellerFactory.php)

```php
$seller_id = $this->seller->create(); // Create seller with default data.

// Create seller with given data.
$seller_id = $this->seller->create(
    [
        'email'    => 'seller%s@example.com',
        'username' => 'seller_1',
        'fname'    => 'store_1',
        'lname'    => 'store_1',
        'phone'    => 'store_1',
        'shopname' => 'store_1',
        'shopurl'  => 'store_1',
    ]
);
```
The array keys are optional. You can assign any of them others will be filled by the factory.

## [Product Factory](./../../tests/php/src/Factories/ProductFactory.php)
Example of Product factory:

```php

$seller_id = $this->factory()->seller->create();

$product_id = $this->factory()->product
    ->set_seller_id( $seller_id )
    ->create( array(
        'name' => 'Test Product',
        'regular_price' => '19.99',
    ) );

$product = wc_get_product( $product_id );
```

## [Coupon Factory](./../../tests/php/src/Factories/CouponFactory.php)

You can create coupon using `coupon` factory.

```php
$coupon_instance = $this->factory()->coupon->create_and_get(
    'code' => 'test_coupon_code',
    'status' => 'publish',
    'meta' => [
        'discount_type' => 'percent',
        'coupon_amount' => '20'
    ]
);
```


## [Order Factory](./../../tests/php/src/Factories/OrderFactory.php) 

**Option 1:**

To create a multi-vendor or single vendor order in the simplest way, you can use the protected methods provided. Your test classes should inherit from [DokanTestCase](./../../tests/php/src/DokanTestCase.php#L270) to access these methods: `create_multi_vendor_order` and `create_single_vendor_order`.

#### Example Usage

```php
use WeDevs\Dokan\Test\DokanTestCase;

class MyClassTest extends DokanTestCase {
    public function test_multi_vendor_order() {
        $parent_order_id = $this->create_multi_vendor_order();
        // Add assertions or additional test logic here
    }

    public function test_single_vendor_order() {
        $order_id = $this->create_single_vendor_order();
        // Add assertions or additional test logic here
    }
}
```

In the above example, the `test_multi_vendor_order` method demonstrates how to create a multi-vendor order, while the `test_single_vendor_order` method shows how to create a single vendor order. Both methods return the  ID of the order, which can be used for further assertions or test logic.


> You can pass the `data` for the multi-order in this [format](./../../tests/php/src/DokanTestCase.php#L219).

**Option 2:**

You may also create a multi-vendor order as per your specific requirements. Example using Order Factory:

```php
$seller_id1 = $this->factory()->seller->create();
$seller_id2 = $this->factory()->seller->create();
$coupon = $this->factory()->coupon->create_and_get([ 'meta' => [ 'coupon_amount' => 15 ] ]);

$order_id = $this->factory()
    ->order
    ->set_item_fee([ 'name' => 'Extra Charge', 'amount' => 10 ])
    ->set_item_shipping([ 'name' => 'Shipping Fee', 'amount' => 10 ])
    ->set_item_coupon($coupon)
    ->create([
        'status'      => 'pending',
        'customer_id' => $this->factory()->customer->create([]),
        'meta_data'   => [
            [
                'key'     => '_custom_meta_key',
                'value'   => 'custom_meta_value',
                'unique'  => true
            ],
            [
                'key'     => '_another_meta_key',
                'value'   => 'another_meta_value'
            ]
        ],
        'line_items'  => array(
            array(
                'product_id' => $this->factory()->product
                    ->set_seller_id($seller_id1)
                    ->create([
                        'name' => 'Test Product 1',
                        'regular_price' => 5,
                        'price' => 5,
                    ]),
                'quantity'   => 2,
            ),
            array(
                'product_id' => $this->factory()->product
                    ->set_seller_id($seller_id2)
                    ->create([
                        'name' => 'Test Product 2',
                        'regular_price' => 5,
                        'price' => 5,
                    ]),
                'quantity'   => 1,
            ),
        ),
    ]);

// Assertion to ensure that Dokan sub-orders are created.
$this->assertDatabaseCount('posts', 3, [ 'post_type' => 'shop_order' ]);
```

The assertion `$this->assertDatabaseCount('posts', 3, [ 'post_type' => 'shop_order' ]);` ensures that Dokan sub-orders have been created because there are products from two vendors during the order creation.

> The methods `set_item_fee`, `set_item_shipping`, and `set_item_coupon` are optional. Use any of them as needed.

You can pass [meta](./../../tests/php/src/Helpers/WC_Helper_Coupon.php#L33) as per your requirements.

### Adding Meta Data to Orders

To add meta data to an order, you can include a `meta_data` array in the order creation parameters. Each meta data item should be an array with `key` and `value` elements. Optionally, you can set `unique` to `true` if you want the meta to be unique.

Example:

```php
$order_id = $this->factory()->order->create([
    // ... other order parameters ...
    'meta_data' => [
        [
            'key'     => '_custom_meta_key',
            'value'   => 'custom_meta_value',
            'unique'  => true
        ],
        [
            'key'     => '_another_meta_key',
            'value'   => 'another_meta_value'
        ]
    ],
    // ... more order parameters ...
]);
```

This will add two meta fields to the order: `_custom_meta_key` (set as unique) and `_another_meta_key`.

## Example of Factories

There is a test class named [DokanFactoryTest](./../../tests/php/src/DokanFactoryTest.php) which covers the test cases for most of the Dokan factories.

## Why WooCommerce Helper Methods are Wrapped

Dokan factory classes utilize the WC Factories so that we can adapt to future changes in WooCommerce. By wrapping WooCommerce helper methods, we ensure that our application test code remains consistent and compatible with any updates in WooCommerce. This approach allows us to modify the wrapper methods as needed to align with WooCommerce changes, maintaining the stability and reliability of our tests.

Dokan factory classes utilize the [WC Factories](https://github.com/woocommerce/woocommerce/tree/trunk/plugins/woocommerce/tests/legacy/framework/helpers) so that we can adapt the future changes of Woocommerce. Our application test code will be consistent because well will be to change wrapper method to make compatible with WC changes.
