<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\CustomersController;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-customers
 */
class CustomersControllerTest extends DokanTestCase {

    /**
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * @var CustomersController
     */
    protected $controller;

    /**
     * Setup test environment
     */
    protected function setUp(): void {
        parent::setUp();

        $this->controller = new CustomersController();
    }

    /**
     * Test registering REST routes
     */
    public function test_register_routes() {
        $routes = $this->server->get_routes();

        $this->assertArrayHasKey( "/{$this->namespace}/customers", $routes );
        $this->assertArrayHasKey( "/{$this->namespace}/customers/(?P<id>[\\d]+)", $routes );
        $this->assertArrayHasKey( "/{$this->namespace}/customers/search", $routes );
    }

    /**
     * Test get_items permission check for non-vendor users
     */
    public function test_get_items_without_permission() {
        wp_set_current_user( 0 );

        $response = $this->get_request( 'customers' );

        $this->assertEquals( 401, $response->get_status() );
        $this->assertEquals( 'dokan_rest_cannot_view', $response->get_data()['code'] );
    }

    /**
     * Test get_items for vendor
     */
    public function test_get_items_as_vendor() {
        wp_set_current_user( $this->seller_id1 );

        // Create orders for the vendor with customers
        $customer_ids = [];
        for ( $i = 0; $i < 3; $i++ ) {
            $customer_id = $this->factory()->customer->create();
            $customer_ids[] = $customer_id;

            // Create order for this customer with the vendor
            $this->factory()->order->set_seller_id( $this->seller_id1 )->create(
                [ 'customer_id' => $customer_id ]
            );
        }

        $response = $this->get_request( 'customers' );
        $data = $response->get_data();

        $this->assertEquals( 200, $response->get_status() );
        $this->assertCount( 4, $data );

        // Verify only customers with orders from this vendor are returned
        $returned_ids = array_map(
            function ( $customer ) {
				return $customer['id'];
			}, $data
        );

        $this->assertEquals( sort( $customer_ids ), sort( $returned_ids ) );
    }

    /**
     * Test get_item permission check
     */
    public function test_get_item_without_permission() {
        wp_set_current_user( 0 );

        $customer_id = $this->factory()->customer->create();

        $response = $this->get_request( "customers/{$customer_id}" );

        $this->assertEquals( 401, $response->get_status() );
        $this->assertEquals( 'dokan_rest_cannot_view', $response->get_data()['code'] );
    }

    /**
     * Test get_item for vendor
     */
    public function test_get_item_as_vendor() {
        wp_set_current_user( $this->seller_id1 );

        $customer_id = $this->factory()->customer->create();

        // Create order for customer with the vendor
        $this->factory()->order->set_seller_id( $this->seller_id1 )->create(
            [ 'customer_id' => $customer_id ]
        );

        $response = $this->get_request( "customers/{$customer_id}" );
        $data = $response->get_data();

        $this->assertEquals( 200, $response->get_status() );
        $this->assertEquals( $customer_id, $data['id'] );
    }

    /**
     * Test customer search functionality
     */
    public function test_search_customers() {
        wp_set_current_user( $this->seller_id1 );

        // Create test customers with orders
        for ( $i = 0; $i < 3; $i++ ) {
            $customer_id = $this->factory()->customer->create(
                [
					'first_name' => "Test{$i}",
					'last_name' => 'Customer',
					'email' => "test{$i}@example.com",
                    'username' => "test{$i}",
				]
            );

            // Create order for this customer
            $this->factory()->order->set_seller_id( $this->seller_id1 )->create(
                [ 'customer_id' => $customer_id ]
            );
        }

        // Test search by name
        $response = $this->get_request( 'customers/search', [ 'search' => 'Test1' ] );
        $data = $response->get_data();

        $this->assertEquals( 200, $response->get_status() );
        $this->assertCount( 1, $data );
        $this->assertEquals( 'Test1 Customer', $data[0]['name'] );

        // Test search by email
        $response = $this->get_request( 'customers/search', [ 'search' => 'test2@example' ] );
        $data = $response->get_data();

        $this->assertEquals( 200, $response->get_status() );
        $this->assertCount( 1, $data );
        $this->assertEquals( 'test2@example.com', $data[0]['email'] );
    }

    /**
     * Test customer search with exclude parameter
     */
    public function test_search_customers_with_exclude() {
        wp_set_current_user( $this->seller_id1 );

        // Create test customers
        $exclude_customer_id = $this->factory()->customer->create(
            [
				'first_name' => 'Exclude',
				'last_name' => 'Customer',
                'username' => 'exclude_customer',
			]
        );

        $keep_customer_id = $this->factory()->customer->create(
            [
				'first_name' => 'Keep',
				'last_name' => 'Customer',
                'username' => 'keep_customer',
			]
        );

        // Create orders for both customers
        foreach ( [ $exclude_customer_id, $keep_customer_id ] as $customer_id ) {
            $this->factory()->order->set_seller_id( $this->seller_id1 )->create(
                [ 'customer_id' => $customer_id ]
            );
        }

        // Search with exclude parameter
        $response = $this->get_request(
            'customers/search', [
				'search' => (string) $keep_customer_id,
				'exclude' => (string) $exclude_customer_id,
			]
        );

        $data = $response->get_data();

        $this->assertEquals( 200, $response->get_status() );
        $this->assertCount( 1, $data );
        $this->assertEquals( 'Keep Customer', $data[0]['name'] );
    }

    /**
     * Test search validation
     */
    public function test_search_customers_validation() {
        wp_set_current_user( $this->seller_id1 );

        // Test empty search term
        $response = $this->get_request( 'customers/search', [ 'search' => '' ] );

        $this->assertEquals( 400, $response->get_status() );
        $this->assertEquals( 'dokan_rest_empty_search', $response->get_data()['code'] );
    }
}
