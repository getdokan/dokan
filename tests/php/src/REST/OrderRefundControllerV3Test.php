<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-orders-v3
 * @group dokan-order-refunds-v3
 */
class OrderRefundControllerV3Test extends DokanTestCase {
    /**
     * @var string
     */
    protected $namespace = 'dokan/v3';

    /**
     * @var string
     */
    protected $base = 'orders';

    /**
     * @var int
     */
    private $order_id;

    /**
     * @var array
     */
    private $product_ids;

    /**
     * Setup test environment
     */
    protected function setUp(): void {
        parent::setUp();

        // Create products with stock management
        $this->product_ids = [];
        for ( $i = 0; $i < 3; $i++ ) {
            $this->product_ids[] = $this->factory()->product->set_seller_id( $this->seller_id1 )->create(
                [
					'regular_price' => 50,
					'manage_stock'  => true,
					'stock_quantity' => 100,
				]
            );
        }

        // Create order with multiple products
        $order_data = [
            'status' => 'processing',
            'line_items' => array_map(
                function ( $product_id ) {
					return [
						'product_id' => $product_id,
						'quantity'   => 2,
					];
				}, $this->product_ids
            ),
        ];

        $this->order_id = $this->factory()->order->set_seller_id( $this->seller_id1 )->create( $order_data );

        // Ensure the order is marked as paid
        $order = wc_get_order( $this->order_id );
        $order->set_payment_method( 'bacs' );
        $order->set_payment_method_title( 'Direct Bank Transfer' );
        $order->set_date_paid( time() );
        $order->save();
    }

    /**
     * Test route registration
     */
    public function test_register_routes() {
        $routes = rest_get_server()->get_routes();

        $this->assertArrayHasKey(
            "/{$this->namespace}/{$this->base}/(?P<order_id>[\\d]+)/refunds",
            $routes
        );
        $this->assertArrayHasKey(
            "/{$this->namespace}/{$this->base}/(?P<order_id>[\\d]+)/refunds/(?P<id>[\\d]+)",
            $routes
        );
    }

    /**
     * Test getting refunds with unauthorized user
     */
    public function test_get_refunds_unauthorized() {
        wp_set_current_user( 0 );

        $response = $this->get_request( "orders/{$this->order_id}/refunds" );

        $this->assertEquals( 401, $response->get_status() );
        $this->assertEquals( 'dokan_rest_cannot_view', $response->get_data()['code'] );
    }

    /**
     * Test getting refunds for non-existent order
     */
    public function test_get_refunds_invalid_order() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'orders/999999/refunds' );

        $this->assertEquals( 404, $response->get_status() );
    }

    /**
     * Test getting refunds from another vendor's order
     */
    public function test_get_refunds_unauthorized_vendor() {
        wp_set_current_user( $this->seller_id2 );

        $response = $this->get_request( "orders/{$this->order_id}/refunds" );

        $this->assertEquals( 403, $response->get_status() );
        $this->assertEquals( 'dokan_rest_unauthorized_order', $response->get_data()['code'] );
    }

    /**
     * Test getting refunds successfully
     */
    public function test_get_refunds_success() {
        wp_set_current_user( $this->seller_id1 );

        // Create some refunds
        $this->create_refund( $this->order_id, 25 );
        $this->create_refund( $this->order_id, 25 );

        $response = $this->get_request( "orders/{$this->order_id}/refunds" );
        var_dump( $response->get_data() );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        $this->assertCount( 2, $data );

        // Verify refund structure
        $first_refund = $data[0];
        $this->assertArrayHasKey( 'id', $first_refund );
        $this->assertArrayHasKey( 'amount', $first_refund );
        $this->assertArrayHasKey( 'reason', $first_refund );
        $this->assertArrayHasKey( 'line_items', $first_refund );
    }

    /**
     * Test creating refund with missing parameters
     */
    public function test_create_refund_missing_params() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->post_request( "orders/{$this->order_id}/refunds", [] );

        $this->assertEquals( 500, $response->get_status() );
        $this->assertEquals( 'woocommerce_rest_cannot_create_order_refund', $response->get_data()['code'] );
    }

    /**
     * Test creating refund with invalid amount
     */
    public function test_create_refund_invalid_amount() {
        wp_set_current_user( $this->seller_id1 );

        // Test negative amount
        $response = $this->post_request(
            "orders/{$this->order_id}/refunds",
            [
                'amount' => -50,
                'reason' => 'Test refund',
            ]
        );

        $this->assertEquals( 400, $response->get_status() );

        // Test amount greater than order total
        $response = $this->post_request(
            "orders/{$this->order_id}/refunds",
            [
                'amount' => 1000,
                'reason' => 'Test refund',
            ]
        );

        $this->assertEquals( 400, $response->get_status() );
    }

    /**
     * Test creating full refund
     */
    public function test_create_full_refund() {
        wp_set_current_user( $this->seller_id1 );

        $order = wc_get_order( $this->order_id );
        $total = $order->get_total();

        $response = $this->post_request(
            "orders/{$this->order_id}/refunds",
            [
                'amount' => $total,
                'reason' => 'Full refund test',
            ]
        );

        $this->assertEquals( 500, $response->get_status() );
        $this->assertEquals( 'woocommerce_rest_cannot_create_order_refund', $response->get_data()['code'] );
    }

    /**
     * Test creating partial refund with line items
     */
    public function test_create_partial_refund_with_items() {
        wp_set_current_user( $this->seller_id1 );

        $order = wc_get_order( $this->order_id );
        $items = $order->get_items();
        $first_item = reset( $items );

        $response = $this->post_request(
            "orders/{$this->order_id}/refunds",
            [
                'amount' => '50',
                'reason' => 'Partial refund',
                'line_items' => [
                    [
                        'id' => $first_item->get_id(),
                        'quantity' => 1,
                        'refund_total' => 50,
                    ],
                ],
            ]
        );

        var_dump( $response->get_data() );

        $this->assertEquals( 201, $response->get_status() );
        $data = $response->get_data();

        // Verify line item refund
        $this->assertCount( 1, $data['line_items'] );
        $this->assertEquals( 1, $data['line_items'][0]['quantity'] );
        $this->assertEquals( 50, $data['line_items'][0]['total'] );
    }

    /**
     * Test refund with stock adjustment
     */
    public function test_refund_with_stock_adjustment() {
        wp_set_current_user( $this->seller_id1 );

        $product_id = $this->product_ids[0];
        $product = wc_get_product( $product_id );
        $initial_stock = $product->get_stock_quantity();

        $order = wc_get_order( $this->order_id );
        $items = $order->get_items();
        $first_item = reset( $items );

        $response = $this->post_request(
            "orders/{$this->order_id}/refunds",
            [
                'amount' => 50,
                'reason' => 'Refund with restock',
                'restock_items' => true,
                'line_items' => [
                    [
                        'id' => $first_item->get_id(),
                        'quantity' => 1,
                        'refund_total' => 50,
                    ],
                ],
            ]
        );

        $this->assertEquals( 201, $response->get_status() );

        // Verify stock was restored
        $product = wc_get_product( $product_id );
        $this->assertEquals( $initial_stock + 1, $product->get_stock_quantity() );
    }

    /**
     * Test maximum refund amount validation
     */
    public function test_maximum_refund_amount() {
        wp_set_current_user( $this->seller_id1 );

        $order = wc_get_order( $this->order_id );

        // Create initial partial refund
        $this->create_refund( $this->order_id, 100 );

        // Try to refund more than remaining amount
        $response = $this->post_request(
            "orders/{$this->order_id}/refunds",
            [
                'amount' => $order->get_total(),
                'reason' => 'Exceeding refund',
            ]
        );

        $this->assertEquals( 400, $response->get_status() );
    }

    /**
     * Test refund deletion
     */
    public function test_delete_refund() {
        wp_set_current_user( $this->seller_id1 );

        // Create a refund
        $refund_id = $this->create_refund( $this->order_id, 50 );

        $response = $this->delete_request(
            "orders/{$this->order_id}/refunds/{$refund_id}",
            [ 'force' => true ]
        );

        var_dump( $response->get_data() );

        $this->assertEquals( 200, $response->get_status() );

        // Verify refund was deleted
        $this->assertFalse( wc_get_order( $refund_id ) );
    }

    /**
     * Test refund api response format
     */
    public function test_refund_response_format() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->post_request(
            "orders/{$this->order_id}/refunds",
            [
                'amount' => 50,
                'reason' => 'Test response format',
            ]
        );

        $this->assertEquals( 201, $response->get_status() );
        $data = $response->get_data();

        // Verify all required fields are present
        $required_fields = [
            'id',
			'date_created',
			'amount',
			'reason',
            'refunded_by',
			'refunded_payment',
			'meta_data',
            'line_items',
			'shipping_lines',
			'tax_lines',
            'fee_lines',
			'currency',
			'currency_symbol',
        ];

        foreach ( $required_fields as $field ) {
            $this->assertArrayHasKey( $field, $data );
        }
    }

    /**
     * Test concurrent refund operations
     */
    public function test_concurrent_refunds() {
        wp_set_current_user( $this->seller_id1 );

        // Try to create multiple refunds concurrently
        $responses = [];
        for ( $i = 0; $i < 3; $i++ ) {
            $responses[] = $this->post_request(
                "orders/{$this->order_id}/refunds",
                [
                    'amount' => 25,
                    'reason' => "Concurrent refund {$i}",
                ]
            );
        }

        // Verify all refunds were created successfully
        foreach ( $responses as $response ) {
            $this->assertEquals( 201, $response->get_status() );
        }

        // Verify total refunded amount
        $order = wc_get_order( $this->order_id );
        $this->assertEquals( 75, $order->get_total_refunded() );
    }

    /**
     * Helper method to create a refund
     */
    private function create_refund( $order_id, $amount ) {
        $refund = wc_create_refund(
            [
				'amount' => $amount,
				'reason' => 'Test refund',
				'order_id' => $order_id,
			]
        );

        return $refund->get_id();
    }
}
