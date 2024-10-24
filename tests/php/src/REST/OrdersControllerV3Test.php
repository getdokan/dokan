<?php

namespace WeDevs\Dokan\Test\REST;

use DateTime;
use WC_Coupon;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-orders-v3
 */
class OrdersControllerV3Test extends DokanTestCase {

    protected $namespace = 'dokan/v3';

	/**
	 * Test ensuring the route is registered.
	 *
	 * @return void
	 */
    public function test_ensure_route_is_registered() {
        $routes = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route( 'orders' );

        $this->assertArrayHasKey( $full_route, $routes );
        $this->assertNestedContains( [ 'methods' => [ 'GET' => true ] ], $routes[ $full_route ] );
    }

    /**
     * Get all expected fields.
     */
    public function get_expected_response_fields(): array {
        return array(
            'id',
            'parent_id',
            'number',
            'order_key',
            'created_via',
            'version',
            'status',
            'currency',
            'date_created',
            'date_created_gmt',
            'date_modified',
            'date_modified_gmt',
            'discount_total',
            'discount_tax',
            'shipping_total',
            'shipping_tax',
            'cart_tax',
            'total',
            'total_tax',
            'prices_include_tax',
            'customer_id',
            'customer_ip_address',
            'customer_user_agent',
            'customer_note',
            'billing',
            'shipping',
            'payment_method',
            'payment_method_title',
            'transaction_id',
            'date_paid',
            'date_paid_gmt',
            'date_completed',
            'date_completed_gmt',
            'cart_hash',
            'meta_data',
            'line_items',
            'tax_lines',
            'shipping_lines',
            'fee_lines',
            'coupon_lines',
            'currency_symbol',
            'refunds',
            'payment_url',
            'is_editable',
            'needs_payment',
            'needs_processing',
	        'stores',
	        'store',
	        'subtotal',
	        'fee_total',
        );
    }

    /**
     * Test that all expected response fields are present.
     * Note: This has fields hardcoded intentionally instead of fetching from schema to test for any bugs in schema result. Add new fields manually when added to schema.
     */
    public function test_orders_api_get_all_fields() {
		wp_set_current_user( $this->seller_id1 );

        $order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create();
        $response = $this->get_request( 'orders/' . $order_id );

        $data  = $response->get_data();
        $response_fields = array_keys( $data );

	    $expected_response_fields = $this->get_expected_response_fields();

        $this->assertEquals( 200, $response->get_status() );
        $this->assertEmpty( array_diff( $expected_response_fields, $response_fields ), 'These fields were expected but not present in API response: ' . print_r( array_diff( $expected_response_fields, $response_fields ), true ) );
        $this->assertEmpty( array_diff( $response_fields, $expected_response_fields ), 'These fields were not expected in the API response: ' . print_r( array_diff( $response_fields, $expected_response_fields ), true ) );
    }

    /**
     * Tests getting all orders with the REST API.
     *
     * @todo: Meta query is not working in test cases
     *
     * @return void
     */
    public function test_orders_get_all(): void {
        $order_ids = $this->factory()->order->set_seller_id( $this->seller_id1 )->create_many( 5 );

        // Create some orders for another seller.
        $this->factory()->order->set_seller_id( $this->seller_id2 )->create_many( 5 );

        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'orders', array( 'per_page' => 100 ) );
        $status   = $response->get_status();
        $data     = $response->get_data();

        $this->assertEquals( 200, $status, 'Expected 200 response code, got ' . $status );
        $this->assertCount( 5, $data, 'Expected 5 orders, got ' . count( $data ) . '. Order IDs created: ' . implode( ', ', $order_ids ) );
    }

	/**
	 * Tests filtering with the 'before' and 'after' params.
	 *
	 * @return void
	 */
	public function test_orders_date_filtering(): void {
		wp_set_current_user( $this->seller_id1 );

		$time_before_orders = time();

		$this->factory()->order->set_seller_id( $this->seller_id1 )->create_many( 5 );

		$time_after_orders = time() + HOUR_IN_SECONDS;

		// No date params should return all orders.
		$response = $this->get_request( 'orders', array( 'dates_are_gmt' => 1 ) );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertCount( 5, $response->get_data() );

		// There are no orders before `$time_before_orders`.
		$response = $this->get_request( 'orders', array( 'before' => gmdate( DateTime::ATOM, $time_before_orders ) ) );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertCount( 0, $response->get_data() );

		// All orders are before `$time_after_orders`.
		$response = $this->get_request( 'orders', array( 'before' => gmdate( DateTime::ATOM, $time_after_orders ) ) );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertCount( 5, $response->get_data() );
	}

	/**
	 * Tests filtering with the 'before' and 'after' params.
	 *
	 * @return void
	 */
	public function test_orders_create(): void {
		wp_set_current_user( $this->seller_id1 );

		$product_id = $this->factory()->product->create();
		$product    = wc_get_product( $product_id );

		$order_params             = array(
			'payment_method'       => 'bacs',
			'payment_method_title' => 'Direct Bank Transfer',
			'set_paid'             => true,
			'billing'              => array(
				'first_name' => 'John',
				'last_name'  => 'Doe',
				'address_1'  => '969 Market',
				'address_2'  => '',
				'city'       => 'San Francisco',
				'state'      => 'CA',
				'postcode'   => '94103',
				'country'    => 'US',
				'email'      => 'john.doe@example.com',
				'phone'      => '(555) 555-5555',
			),
			'line_items'           => array(
				array(
					'product_id' => $product->get_id(),
					'quantity'   => 3,
				),
			),
		);
		$order_params['shipping'] = $order_params['billing'];

		$response = $this->post_request( 'orders', $order_params );

		$this->assertEquals( 201, $response->get_status() );

		$data = $response->get_data();
		$this->assertArrayHasKey( 'id', $data );
		$this->assertEquals( 'processing', $data['status'] );

		wp_cache_flush();

		// Fetch the order and compare some data.
		$order = wc_get_order( $data['id'] );
		$this->assertNotEmpty( $order );

		$this->assertEquals( (float) ( $product->get_price() * 3 ), (float) $order->get_total() );
		$this->assertEquals( $order_params['payment_method'], $order->get_payment_method( 'edit' ) );

		foreach ( array_keys( $order_params['billing'] ) as $address_key ) {
			$this->assertEquals( $order_params['billing'][ $address_key ], $order->{"get_billing_{$address_key}"}( 'edit' ) );
		}
	}

	/**
	 * Tests deleting an order.
	 */
	public function test_orders_delete(): void {
		wp_set_current_user( $this->seller_id1 );

		$order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create(
            array(
				'status' => 'completed',
            )
        );

		$response = $this->delete_request( 'orders/' . $order_id );

		$this->assertEquals( 200, $response->get_status() );

		// Check that the response includes order data from the order (before deletion).
		$data = $response->get_data();
		$this->assertArrayHasKey( 'id', $data );
		$this->assertEquals( $data['id'], $order_id );
		$this->assertEquals( 'completed', $data['status'] );

		wp_cache_flush();

		// Check the order was actually deleted.
		$order = wc_get_order( $order_id );
		$this->assertEquals( 'trash', $order->get_status( 'edit' ) );
	}

	/**
	 * Test that the `include_meta` param filters the `meta_data` prop correctly.
	 */
	public function test_collection_param_include_meta() {
		wp_set_current_user( $this->seller_id1 );

        $order_params = array(
            'meta_data' => array(
                array(
                    'key'   => 'test1',
                    'value' => 'test1',
                ),
                array(
                    'key'   => 'test2',
                    'value' => 'test2',
                ),
            ),
        );

		$this->factory()->order->set_seller_id( $this->seller_id1 )->create_many( 3, $order_params );

		$response = $this->get_request( 'orders', array( 'include_meta' => 'test1' ) );
		$this->assertEquals( 200, $response->get_status() );

		$response_data = $response->get_data();
		$this->assertCount( 3, $response_data );

		foreach ( $response_data as $order ) {
			$this->assertArrayHasKey( 'meta_data', $order );
			$this->assertEquals( 1, count( $order['meta_data'] ) );
			$meta_keys = array_map(
				function ( $meta_item ) {
					return $meta_item->get_data()['key'];
				},
				$order['meta_data']
			);
			$this->assertContains( 'test1', $meta_keys );
		}
	}

    /**
     * Test that the `include_meta` param is skipped when empty.
     */
    public function test_collection_param_include_meta_empty() {
        wp_set_current_user( $this->seller_id1 );

        $order_params = array(
            'meta_data' => array(
                array(
                    'key'   => 'test1',
                    'value' => 'test1',
                ),
                array(
                    'key'   => 'test2',
                    'value' => 'test2',
                ),
            ),
        );

        $this->factory()->order->set_seller_id( $this->seller_id1 )->create_many( 3, $order_params );

        $response = $this->get_request( 'orders', array( 'include_meta' => '' ) );

        $this->assertEquals( 200, $response->get_status() );

        $response_data = $response->get_data();
        $this->assertCount( 3, $response_data );

        foreach ( $response_data as $order ) {
            $this->assertArrayHasKey( 'meta_data', $order );
            $meta_keys = array_map(
                function ( $meta_item ) {
                    return $meta_item->get_data()['key'];
                },
                $order['meta_data']
            );
            $this->assertContains( 'test1', $meta_keys );
            $this->assertContains( 'test2', $meta_keys );
        }
    }

    /**
     * Test that the `exclude_meta` param filters the `meta_data` prop correctly.
     */
    public function test_collection_param_exclude_meta() {
        wp_set_current_user( $this->seller_id1 );

        $order_params = array(
            'meta_data' => array(
                array(
                    'key'   => 'test1',
                    'value' => 'test1',
                ),
                array(
                    'key'   => 'test2',
                    'value' => 'test2',
                ),
            ),
        );

        $this->factory()->order->set_seller_id( $this->seller_id1 )->create_many( 3, $order_params );

        $response = $this->get_request( 'orders', array( 'exclude_meta' => 'test1' ) );
        $this->assertEquals( 200, $response->get_status() );

        $response_data = $response->get_data();
        $this->assertCount( 3, $response_data );

        foreach ( $response_data as $order ) {
            $this->assertArrayHasKey( 'meta_data', $order );
            $meta_keys = array_map(
                function ( $meta_item ) {
                    return $meta_item->get_data()['key'];
                },
                $order['meta_data']
            );
            $this->assertContains( 'test2', $meta_keys );
            $this->assertNotContains( 'test1', $meta_keys );
        }
    }

    /**
     * Test that the `include_meta` param overrides the `exclude_meta` param.
     */
    public function test_collection_param_include_meta_override() {
        wp_set_current_user( $this->seller_id1 );

        $order_params = array(
            'meta_data' => array(
                array(
                    'key'   => 'test1',
                    'value' => 'test1',
                ),
                array(
                    'key'   => 'test2',
                    'value' => 'test2',
                ),
            ),
        );

        $this->factory()->order->set_seller_id( $this->seller_id1 )->create_many( 3, $order_params );

        $response = $this->get_request(
            'orders', array(
				'include_meta' => 'test1',
				'exclude_meta' => 'test1',
            )
        );
        $this->assertEquals( 200, $response->get_status() );

        $response_data = $response->get_data();
        $this->assertCount( 3, $response_data );

        foreach ( $response_data as $order ) {
            $this->assertArrayHasKey( 'meta_data', $order );
            $this->assertEquals( 1, count( $order['meta_data'] ) );
            $meta_keys = array_map(
                function ( $meta_item ) {
                    return $meta_item->get_data()['key'];
                },
                $order['meta_data']
            );
            $this->assertContains( 'test1', $meta_keys );
        }
    }

    /**
     * Test that the meta_data property contains an array, and not an object, after being filtered.
     */
    public function test_collection_param_include_meta_returns_array() {
        wp_set_current_user( $this->seller_id1 );

        $order_params = array(
            'meta_data' => array(
                array(
                    'key'   => 'test1',
                    'value' => 'test1',
                ),
                array(
                    'key'   => 'test2',
                    'value' => 'test2',
                ),
            ),
        );

        $this->factory()->order->set_seller_id( $this->seller_id1 )->create( $order_params );

        $response = $this->get_request( 'orders', array( 'include_meta' => 'test2' ) );
        $this->assertEquals( 200, $response->get_status() );

        $response_data       = $this->server->response_to_data( $response, false );
        $encoded_data_string = wp_json_encode( $response_data );
        $decoded_data_object = \json_decode( $encoded_data_string, false ); // Ensure object instead of associative array.

        $this->assertIsArray( $decoded_data_object[0]->meta_data );
    }

	/**
	 * Test that the `include_meta` param is skipped when empty.
	 */
	public function test_order_update_line_item_quantity_updates_product_stock() {
		wp_set_current_user( $this->seller_id1 );

		$product_id = $this->factory()->product->create();
		$product = wc_get_product( $product_id );
		$product->set_manage_stock( true );
		$product->set_stock_quantity( 10 );
		$product->save();

        $customer = $this->factory()->customer->create_customer();

        $order_params = array(
            'status'      => 'on-hold',
            'customer_id' => $customer->get_id(),
            'line_items'  => array(
                array(
                    'product_id' => $product_id,
                    'quantity'   => 4,
                ),
            ),
        );

		$order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create( $order_params );
		$order = wc_get_order( $order_id );
		$items = $order->get_items();
		$item  = reset( $items );
		wc_maybe_adjust_line_item_product_stock( $item );

		$product = wc_get_product( $product->get_id() );
		$this->assertEquals( 6, $product->get_stock_quantity() );

		$response = $this->post_request(
			'orders/' . $order->get_id(),
			array(
				'line_items' => array(
					array(
						'id'       => $item->get_id(),
						'quantity' => 5,
					),
				),
			)
        );
		$this->assertEquals( 200, $response->get_status() );

		$product = wc_get_product( $product );
		$this->assertEquals( 5, $product->get_stock_quantity() );
	}

    /**
     * @testdox When a line item in an order is removed via REST API, the product's stock should also be updated.
     */
    public function test_order_remove_line_item_updates_product_stock() {
        wp_set_current_user( $this->seller_id1 );

        $product_id = $this->factory()->product->create();
        $product = wc_get_product( $product_id );
        $product->set_manage_stock( true );
        $product->set_stock_quantity( 10 );
        $product->save();

        $customer = $this->factory()->customer->create_customer();

        $order_params = array(
            'status'      => 'on-hold',
            'customer_id' => $customer->get_id(),
            'line_items'  => array(
                array(
                    'product_id' => $product_id,
                    'quantity'   => 4,
                ),
            ),
        );

        $order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create( $order_params );
        $order = wc_get_order( $order_id );
        $items = $order->get_items();
        $item  = reset( $items );
        wc_maybe_adjust_line_item_product_stock( $item );

        $product = wc_get_product( $product->get_id() );
        $this->assertEquals( 6, $product->get_stock_quantity() );

        $response = $this->post_request(
            'orders/' . $order->get_id(),
            array(
                'line_items' => array(
                    array(
                        'id'       => $item->get_id(),
                        'quantity' => 0,
                    ),
                ),
            )
        );
        $this->assertEquals( 200, $response->get_status() );

        $order = wc_get_order( $order );
        $this->assertEmpty( $order->get_items() );

        $product = wc_get_product( $product );
        $this->assertEquals( 10, $product->get_stock_quantity() );
    }

    /**
     * When a line item in an order is updated via REST API, the product's stock should also be updated.
     */
    public function test_order_commission_by_vendor() {
        wp_set_current_user( $this->seller_id1 );

        // Update commission settings for dokan.
        $commission_options = array(
            'commission_type'  => 'percentage',
            'admin_percentage' => 10,
            'additional_fee'   => 0,
        );
        update_option( 'dokan_selling', $commission_options );

        $order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create();
        $response = $this->get_request( 'orders/' . $order_id );

        $this->assertEquals( 200, $response->get_status() );

        $order = $response->get_data();

        $this->assertArrayHasKey( 'line_items', $order );

        foreach ( $order['line_items'] as $line_item ) {
            $this->assertArrayHasKey( 'meta_data', $order );
            $this->assertGreaterThanOrEqual( 3, count( $order['meta_data'] ) );

            $meta_keys = array_column( $line_item['meta_data'], 'key' );
            $this->assertContains( '_dokan_commission_rate', $meta_keys );
            $this->assertContains( '_dokan_commission_type', $meta_keys );
            $this->assertContains( '_dokan_additional_fee', $meta_keys );

            // calculate commission for admin.
            $vendor_earning = dokan()->commission->get_earning_by_product( $line_item['product_id'] );
            $this->assertEquals( 9.0, $vendor_earning );

            // calculate commission for admin.
            $admin_earning = dokan()->commission->get_earning_by_product( $line_item['product_id'], 'admin' );
            $this->assertEquals( 1.0, $admin_earning );
        }
    }

    /**
     * Tests creating an order with a vendor coupon using the REST API.
     *
     * @return void
     */
    public function test_orders_create_with_vendor_coupon(): void {
        wp_set_current_user( $this->seller_id1 );

        // Create products
        $product_id = $this->factory()->product->set_seller_id( $this->seller_id1 )->create(
            array(
                'regular_price' => 100,
                'price'         => 100,
            )
        );

        // Create a vendor coupon
        $coupon_code = 'vendorcoupon';
        $coupon_id = $this->factory()->coupon->create(
            [
				'code'          => $coupon_code,
				'amount'        => 10,
				'discount_type' => 'percent',
				'product_ids'   => [ $product_id ],
			]
        );

        // Set vendor-specific meta
        $coupon = $this->factory()->coupon->get_object_by_id( $coupon_id );
        $coupon->update_meta_data( 'apply_before_tax', 'no' );
        $coupon->update_meta_data( 'apply_new_products', 'yes' );
        $coupon->update_meta_data( 'show_on_store', 'yes' );

        // Order parameters including the coupon
        $order_params = [
            'payment_method' => 'bacs',
            'set_paid'       => true,
            'line_items'     => [
                [
                    'product_id' => $product_id,
                    'quantity'   => 2,
                ],
            ],
            'coupon_lines'   => [
                [
                    'code' => $coupon_code,
                ],
            ],
        ];

        // Create the order
        $response = $this->post_request( 'orders', $order_params );

        // Validate the response
        $this->assertEquals( 201, $response->get_status() );
        $data = $response->get_data();

        // Check order details
        $this->assertEquals( 'processing', $data['status'] );
        $this->assertCount( 1, $data['coupon_lines'] );
        $this->assertEquals( $coupon_code, $data['coupon_lines'][0]['code'] );

        // Verify order total (assuming product price is 100)
        $product = wc_get_product( $product_id );
        $expected_total = (float) ( $product->get_price() * 2 ) * 0.95; // 10% discount
        $this->assertEquals( $expected_total, $data['total'] );

        // Check coupon usage
        $coupon = new WC_Coupon( $coupon_code );
        $this->assertEquals( 1, $coupon->get_usage_count() );

        // Verify vendor ID
        $order = wc_get_order( $data['id'] );
        $this->assertEquals( $this->seller_id1, $order->get_meta( '_dokan_vendor_id' ) );
    }
}
