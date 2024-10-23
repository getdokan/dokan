<?php

namespace WeDevs\Dokan\Test\REST;

use Exception;
use WC_Customer;
use WeDevs\Dokan\REST\CustomersController;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Response;

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
    protected CustomersController $controller;

    /**
     * @var array
     */
    protected $customers = [];

    /**
     * Setup test environment
     */
    protected function setUp(): void {
        parent::setUp();

        $this->controller = new CustomersController();

        // Create test customers with specific data
        $this->customer_data = [
            [
                'first_name' => 'John',
                'last_name'  => 'Doe',
                'email'      => 'john.doe@example.com',
                'username'   => 'johndoe',
            ],
            [
                'first_name' => 'Jane',
                'last_name'  => 'Smith',
                'email'      => 'jane.smith@example.com',
                'username'   => 'janesmith',
            ],
        ];

        foreach ( $this->customer_data as $data ) {
            $this->customers[] = $this->factory()->customer->create( $data );
        }
    }

    /**
     * Test route registration
     */
    public function test_register_routes() {
        $routes = $this->server->get_routes();

        $base_endpoints = [
            "/$this->namespace/customers",
            "/$this->namespace/customers/(?P<id>[\\d]+)",
            "/$this->namespace/customers/search",
            "/$this->namespace/customers/batch",
        ];

        foreach ( $base_endpoints as $endpoint ) {
            $this->assertArrayHasKey( $endpoint, $routes );
        }

        // Verify HTTP methods for each endpoint
        $this->assertCount( 2, $routes[ "/$this->namespace/customers" ] );
        $this->assertCount( 3, $routes[ "/$this->namespace/customers/(?P<id>[\\d]+)" ] );
        $this->assertCount( 1, $routes[ "/$this->namespace/customers/search" ] );
        $this->assertCount( 1, $routes[ "/$this->namespace/customers/batch" ] );
    }

    /**
     * Test permission checks for each endpoint
     */
    public function test_endpoint_permissions() {
        $test_cases = [
            [ 'GET', 'customers', 401, 'dokan_rest_cannot_view' ],
            [ 'POST', 'customers', 400, 'rest_missing_callback_param' ],
            [ 'GET', "customers/{$this->customers[0]}", 401, 'dokan_rest_cannot_view' ],
            [ 'PUT', "customers/{$this->customers[0]}", 401, 'dokan_rest_cannot_edit' ],
            [ 'DELETE', "customers/{$this->customers[0]}", 401, 'dokan_rest_cannot_delete' ],
            [ 'POST', 'customers/batch', 401, 'dokan_rest_cannot_batch' ],
            [ 'GET', 'customers/search', 400, 'rest_missing_callback_param' ],
        ];

        foreach ( $test_cases as [ $method, $endpoint, $expected_status, $expected_code ] ) {
            wp_set_current_user( 0 );

            $response = $this->request( $method, $endpoint );

            $this->assertEquals( $expected_status, $response->get_status() );
            $this->assertEquals( $expected_code, $response->get_data()['code'] );
        }
    }

    /**
     * Test get_items functionality
     */
    public function test_get_items() {
        wp_set_current_user( $this->seller_id1 );

        // Create orders for customers with the vendor
        foreach ( $this->customers as $customer_id ) {
            $this->factory()->order->set_seller_id( $this->seller_id1 )->create(
                [
					'customer_id' => $customer_id,
				]
            );
        }

        // Test default listing
        $response = $this->get_request( 'customers' );

        $this->assertEquals( 200, $response->get_status() );
        $this->assertCount( 3, $response->get_data() );

        // Test with per_page parameter
        $response = $this->get_request( 'customers', [ 'per_page' => 1 ] );
        $this->assertEquals( 200, $response->get_status() );
        $this->assertCount( 1, $response->get_data() );

        // Test with ordering
        $response = $this->get_request(
            'customers', [
				'orderby' => 'registered_date',
				'order'   => 'desc',
			]
        );
        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertTrue(
            strtotime( $data[0]['date_created'] ) >= strtotime( $data[1]['date_created'] )
        );
    }

    /**
     * Test get_item functionality
     */
    public function test_get_item() {
        wp_set_current_user( $this->seller_id1 );

        // Create order to establish vendor-customer relationship
        $this->factory()->order->set_seller_id( $this->seller_id1 )->create(
            [
				'customer_id' => $this->customers[0],
			]
        );

        // Test valid customer fetch
        $response = $this->get_request( "customers/{$this->customers[0]}" );
        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertEquals( $this->customers[0], $data['id'] );
        $this->assertEquals( 'john.doe@example.com', $data['email'] );

        // Test invalid customer ID
        $response = $this->get_request( 'customers/999999' );
        $this->assertEquals( 404, $response->get_status() );
    }

    /**
     * Test create_item functionality
     */
    public function test_create_item() {
        wp_set_current_user( $this->seller_id1 );

        $test_cases = [
            // Valid customer data
            [
                'data' => [
                    'email'      => 'new.customer@example.com',
                    'first_name' => 'New',
                    'last_name'  => 'Customer',
                    'username'   => 'newcustomer',
                    'password'   => 'password123',
                ],
                'expected_status' => 201,
                'assertions' => function ( $response ) {
                    $data = $response->get_data();
                    $this->assertEquals( 'new.customer@example.com', $data['email'] );
                    $this->assertEquals( 'New', $data['first_name'] );
                },
            ],
            // Missing required fields
            [
                'data' => [
                    'first_name' => 'Invalid',
                ],
                'expected_status' => 400,
                'assertions' => function ( $response ) {
                    $this->assertEquals( 'rest_missing_callback_param', $response->get_data()['code'] );
                },
            ],
            // Invalid email
            [
                'data' => [
                    'email'      => 'invalid-email',
                    'first_name' => 'Invalid',
                    'username'   => 'invalid',
                ],
                'expected_status' => 400,
                'assertions' => function ( $response ) {
                    $this->assertEquals( 'customer_invalid_email', $response->get_data()['code'] );
                },
            ],
        ];

        foreach ( $test_cases as $test_case ) {
            $response = $this->post_request( 'customers', $test_case['data'] );
            $this->assertEquals( $test_case['expected_status'], $response->get_status() );
            $test_case['assertions']( $response );
        }
    }

    /**
     * Test update_item functionality
     */
    public function test_update_item() {
        wp_set_current_user( $this->seller_id1 );

        // Create order to establish vendor-customer relationship
        $this->factory()->order->set_seller_id( $this->seller_id1 )->create(
            [
				'customer_id' => $this->customers[0],
			]
        );

        $test_cases = [
            // Valid update
            [
                'data' => [
                    'first_name' => 'Updated',
                    'last_name'  => 'Name',
                    'email'      => 'updated.email@example.com',
                ],
                'expected_status' => 200,
                'assertions' => function ( $response ) {
                    $data = $response->get_data();
                    $this->assertEquals( 'Updated', $data['first_name'] );
                    $this->assertEquals( 'updated.email@example.com', $data['email'] );
                },
            ],
            // Invalid email update
            [
                'data' => [
                    'email' => 'invalid-email',
                ],
                'expected_status' => 400,
                'assertions' => function ( $response ) {
                    $this->assertEquals( 'rest_invalid_param', $response->get_data()['code'] );
                },
            ],
        ];

        foreach ( $test_cases as $test_case ) {
            $response = $this->put_request( "customers/{$this->customers[0]}", $test_case['data'] );
            $this->assertEquals( $test_case['expected_status'], $response->get_status() );
            $test_case['assertions']( $response );
        }
    }

    /**
     * Test batch operations
     */
    public function test_batch_operations() {
        wp_set_current_user( $this->seller_id1 );

        // Create vendor-customer relationships
        foreach ( $this->customers as $customer_id ) {
            $this->factory()->order->set_seller_id( $this->seller_id1 )->create(
                [
					'customer_id' => $customer_id,
				]
            );
        }

        $batch_data = [
            'create' => [
                [
                    'email'      => 'batch.new@example.com',
                    'first_name' => 'Batch',
                    'last_name'  => 'New',
                    'username'   => 'batchnew',
                ],
            ],
            'update' => [
                [
                    'id'         => $this->customers[0],
                    'first_name' => 'Batch',
                    'last_name'  => 'Updated',
                ],
            ],
            'delete' => [
                $this->customers[1],
            ],
        ];

        $response = $this->post_request( 'customers/batch', $batch_data );
        $this->assertEquals( 200, $response->get_status() );

        $data = $response->get_data();

        // Verify creation
        $this->assertCount( 1, $data['create'] );
        $this->assertEquals( 'batch.new@example.com', $data['create'][0]['email'] );

        // Verify update
        $this->assertCount( 1, $data['update'] );
        $this->assertEquals( 'Batch', $data['update'][0]['first_name'] );

        // Verify deletion
        $this->assertCount( 1, $data['delete'] );
        $this->assertEquals( $this->customers[1], $data['delete'][0]['id'] );

        // Verify database state
        $this->assertFalse( get_user_by( 'id', $this->customers[1] ) );
    }

    /**
     * Test search functionality
     */
    public function test_search_functionality() {
        wp_set_current_user( $this->seller_id1 );

        // Create orders for test customers
        foreach ( $this->customers as $customer_id ) {
            $this->factory()->order->set_seller_id( $this->seller_id1 )->create(
                [ 'customer_id' => $customer_id ]
            );
        }

        $test_cases = [
            // Search by email
            [
                'params' => [ 'search' => 'john.doe@example.com' ],
                'expected_count' => 1,
                'assertions' => function ( $data ) {
                    $this->assertEquals( 'john.doe@example.com', $data[0]['email'] );
                },
            ],
            // Search by partial email
            [
                'params' => [ 'search' => '@example.com' ],
                'expected_count' => 2,
                'assertions' => function ( $data ) {
                    $this->assertContains( 'john.doe@example.com', wp_list_pluck( $data, 'email' ) );
                    $this->assertContains( 'jane.smith@example.com', wp_list_pluck( $data, 'email' ) );
                },
            ],
            // Search by name
            [
                'params' => [ 'search' => 'John' ],
                'expected_count' => 1,
                'assertions' => function ( $data ) {
                    $this->assertEquals( 'John Doe', $data[0]['name'] );
                },
            ],
            // Search with exclude
            [
                'params' => [
                    'search'  => '@example.com',
                    'exclude' => (string) $this->customers[0],
                ],
                'expected_count' => 1,
                'assertions' => function ( $data ) {
                    $this->assertEquals( 'jane.smith@example.com', $data[0]['email'] );
                },
            ],
        ];

        foreach ( $test_cases as $test_case ) {
            $response = $this->get_request( 'customers/search', $test_case['params'] );
            $this->assertEquals( 200, $response->get_status() );
            $data = $response->get_data();
            $this->assertCount( $test_case['expected_count'], $data );
            $test_case['assertions']( $data );
        }
    }

    /**
     * Test vendor specific customer filtering (continued)
     */
    public function test_vendor_customer_filtering() {
        // Create customers with orders from different vendors
        $customer_id = $this->factory()->customer->create(
            [
				'email'      => 'multi.vendor@example.com',
				'first_name' => 'Multi',
				'last_name'  => 'Vendor',
			]
        );

        // Create orders for both vendors
        $this->factory()->order->set_seller_id( $this->seller_id1 )->create(
            [
				'customer_id' => $customer_id,
			]
        );
        $this->factory()->order->set_seller_id( $this->seller_id2 )->create(
            [
				'customer_id' => $customer_id,
			]
        );

        // Test as first vendor
        wp_set_current_user( $this->seller_id1 );
        $response = $this->get_request( 'customers' );
        $this->assertEquals( 200, $response->get_status() );
        $this->assertContains( $customer_id, wp_list_pluck( $response->get_data(), 'id' ) );

        // Test as second vendor
        wp_set_current_user( $this->seller_id2 );
        $response = $this->get_request( 'customers' );
        $this->assertEquals( 200, $response->get_status() );
        $this->assertContains( $customer_id, wp_list_pluck( $response->get_data(), 'id' ) );

        // Verify customer details match for both vendors
        $response1 = $this->get_request( "customers/$customer_id" );
        $response2 = $this->get_request( "customers/$customer_id" );
        $this->assertEquals( $response1->get_data(), $response2->get_data() );
    }

    /**
     * Test customer meta data handling
     */
    public function test_customer_meta_data() {
        wp_set_current_user( $this->seller_id1 );

        // Create customer with meta
        $customer_data = [
            'email'      => 'meta.test@example.com',
            'first_name' => 'Meta',
            'last_name'  => 'Test',
            'username'   => 'metatest',
            'meta_data'  => [
                [
                    'key'   => 'dokan_test_meta',
                    'value' => 'test_value',
                ],
            ],
        ];

        $response = $this->post_request( 'customers', $customer_data );
        $this->assertEquals( 201, $response->get_status() );
        $customer_id = $response->get_data()['id'];

        // Create order to establish vendor relationship
        $this->factory()->order->set_seller_id( $this->seller_id1 )->create(
            [
				'customer_id' => $customer_id,
			]
        );

        // Test meta data retrieval
        $response = $this->get_request( "customers/$customer_id" );
        $data = $response->get_data();
        $this->assertEquals( 200, $response->get_status() );

        // WooCommerce api does not support meta data retrieval
        $this->assertArrayNotHasKey( 'meta_data', $data );
    }

    /**
     * Test customer search validation and edge cases
     */
    public function test_search_validation_and_edge_cases() {
        wp_set_current_user( $this->seller_id1 );

        $test_cases = [
            // Empty search term
            [
                'params' => [ 'search' => '' ],
                'expected_status' => 400,
                'expected_code' => 'dokan_rest_empty_search',
            ],
            // Very short search term
            [
                'params' => [ 'search' => 'a' ],
                'expected_status' => 200,
                'assertions' => function ( $response ) {
                    $this->assertLessThanOrEqual( 20, count( $response->get_data() ) );
                },
            ],
            // Multiple excludes
            [
                'params' => [
                    'search' => 'test',
                    'exclude' => implode( ',', $this->customers ),
                ],
                'expected_status' => 200,
                'assertions' => function ( $response ) {
                    $excluded_ids = wp_list_pluck( $response->get_data(), 'id' );
                    foreach ( $this->customers as $customer_id ) {
                        $this->assertNotContains( $customer_id, $excluded_ids );
                    }
                },
            ],
        ];

        foreach ( $test_cases as $test_case ) {
            $response = $this->get_request( 'customers/search', $test_case['params'] );

            if ( isset( $test_case['expected_status'] ) ) {
                $this->assertEquals( $test_case['expected_status'], $response->get_status() );
            }

            if ( isset( $test_case['expected_code'] ) ) {
                $this->assertEquals( $test_case['expected_code'], $response->get_data()['code'] );
            }

            if ( isset( $test_case['assertions'] ) ) {
                $test_case['assertions']( $response );
            }
        }
    }

    /**
     * Test customer role handling
     * @throws Exception
     */
    public function test_customer_role_handling() {
        wp_set_current_user( $this->seller_id1 );

        // Test creating customer with additional roles
        $customer_data = [
            'email'      => 'role.test@example.com',
            'first_name' => 'Role',
            'last_name'  => 'Test',
            'username'   => 'roletest',
            'password'   => 'password123',
            'roles'      => [ 'customer', 'subscriber' ],
        ];

        $response = $this->post_request( 'customers', $customer_data );
        $this->assertEquals( 201, $response->get_status() );
        $customer_id = $response->get_data()['id'];

        // Verify roles
        $customer = new WC_Customer( $customer_id );
        $customer_role = $customer->get_role();
        $this->assertEquals( 'customer', $customer_role );

        // Test updating roles
        $update_data = [
            'roles' => [ 'customer' ],
        ];

        $response = $this->put_request( "customers/$customer_id", $update_data );
        $this->assertEquals( 200, $response->get_status() );

        // Verify updated roles
        $customer = new WC_Customer( $customer_id );
        $this->assertEquals( 'customer', $customer->get_role() );
    }

    /**
     * Test error responses format
     */
    public function test_error_response_format() {
        wp_set_current_user( $this->seller_id1 );

        $test_cases = [
            // Invalid email format
            [
                'endpoint' => 'customers',
                'method' => 'POST',
                'data' => [
                    'email' => 'invalid-email',
                    'username' => 'test',
                ],
                'assertions' => function ( $response ) {
                    $data = $response->get_data();
                    $this->assertEquals( 400, $response->get_status() );
                    $this->assertArrayHasKey( 'code', $data );
                    $this->assertArrayHasKey( 'message', $data );
                    $this->assertArrayHasKey( 'data', $data );
                },
            ],
            // Duplicate username
            [
                'endpoint' => 'customers',
                'method' => 'POST',
                'data' => [
                    'email' => 'unique@example.com',
                    'username' => 'admin',
                ],
                'assertions' => function ( $response ) {
                    $data = $response->get_data();
                    $this->assertEquals( 400, $response->get_status() );
                    $this->assertEquals( 'registration-error-username-exists', $data['code'] );
                },
            ],
        ];

        foreach ( $test_cases as $test_case ) {
            $response = $this->request(
                $test_case['method'],
                $test_case['endpoint'],
                $test_case['data']
            );
            $test_case['assertions']( $response );
        }
    }

    /**
     * Helper method for making requests
     */
    protected function request( $method, $endpoint, $data = [] ): WP_REST_Response {
        $request = new WP_REST_Request( $method, "/$this->namespace/$endpoint" );
        if ( ! empty( $data ) ) {
            $request->set_body_params( $data );
        }
        return $this->server->dispatch( $request );
    }
}
