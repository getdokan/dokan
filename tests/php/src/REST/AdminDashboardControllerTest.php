<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\AdminDashboardController;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Server;

class AdminDashboardControllerTest extends DokanTestCase {

    /**
     * @var WP_REST_Server
     */
    protected $server;

    /**
     * @var string
     */
    protected $namespace = 'dokan/v1/admin';

    /**
     * @var string
     */
    protected $rest_base = 'dashboard';

    /**
     * @var int
     */
    protected $admin_id;

    /**
     * @var int
     */
    protected $vendor_id;

    /**
     * @var int
     */
    protected $customer_id;

    /**
     * Setup test environment
     */
    protected function setUp(): void {
        parent::setUp();

        global $wp_rest_server;
        $wp_rest_server = new WP_REST_Server();
        $this->server   = $wp_rest_server;
        do_action( 'rest_api_init' );

        // Create an admin user
        $this->admin_id = self::factory()->user->create(
            [
                'role' => 'administrator',
            ]
        );

        // Add capabilities to an admin user
        $admin = get_user_by( 'id', $this->admin_id );
        $admin->add_cap( 'manage_woocommerce' );

        // Create a vendor user
        $this->vendor_id = self::factory()->user->create(
            [
                'role' => 'seller',
            ]
        );

        // Create a customer user
        $this->customer_id = self::factory()->user->create(
            [
                'role' => 'customer',
            ]
        );
    }

    /**
     * Test if all endpoints exist
     * @test
     * @return void
     */
    public function test_if_endpoints_exist() {
        $routes = $this->server->get_routes( $this->namespace );
        
        $expected_endpoints = [
            'todo',
            'monthly-overview',
            'sales-chart',
            'customer-metrics',
            'all-time-stats',
            'top-performing-vendors',
            'most-reviewed-products'
        ];

        foreach ( $expected_endpoints as $endpoint ) {
            $full_route = $this->get_route( $this->rest_base . '/' . $endpoint );
            $this->assertArrayHasKey( $full_route, $routes, "Endpoint {$endpoint} should exist" );
        }
    }

    /**
     * Test register routes
     * @test
     * @return void
     */
    public function test_register_routes() {
        $controller = new AdminDashboardController();
        $controller->register_routes();

        $routes = $this->server->get_routes( $this->namespace );
        
        $expected_endpoints = [
            'todo',
            'monthly-overview',
            'sales-chart',
            'customer-metrics',
            'all-time-stats',
            'top-performing-vendors',
            'most-reviewed-products'
        ];

        foreach ( $expected_endpoints as $endpoint ) {
            $full_route = $this->get_route( $this->rest_base . '/' . $endpoint );
            $this->assertArrayHasKey( $full_route, $routes, "Route {$endpoint} should be registered" );
        }
    }

    /**
     * Test Permission Callback
     * @test
     * @return void
     */
    public function test_permission_callback() {
        $controller = new AdminDashboardController();
        $request = new WP_REST_Request( 'GET', "/{$this->namespace}/{$this->rest_base}/todo" );

        // Test without user
        wp_set_current_user( 0 );
        $this->assertFalse( $controller->check_permission( $request ) );

        // Test with customer user
        wp_set_current_user( $this->customer_id );
        $this->assertFalse( $controller->check_permission( $request ) );

        // Test with vendor user
        wp_set_current_user( $this->vendor_id );
        $this->assertFalse( $controller->check_permission( $request ) );

        // Test with admin user
        wp_set_current_user( $this->admin_id );
        $this->assertTrue( $controller->check_permission( $request ) );
    }

    /**
     * Test get_to_do endpoint
     * @test
     * @return void
     */
    public function test_get_to_do() {
        wp_set_current_user( $this->admin_id );

        $request = new WP_REST_Request( 'GET', "/{$this->namespace}/{$this->rest_base}/todo" );
        $controller = new AdminDashboardController();
        $response = $controller->get_to_do();

        $this->assertEquals( 200, $response->get_status() );

        $data = $response->get_data();
        $this->assertArrayHasKey( 'vendor_approvals', $data );
        $this->assertArrayHasKey( 'product_approvals', $data );
        $this->assertArrayHasKey( 'pending_withdrawals', $data );

        // Check structure of each todo item
        foreach ( ['vendor_approvals', 'product_approvals', 'pending_withdrawals'] as $key ) {
            $this->assertArrayHasKey( 'icon', $data[$key] );
            $this->assertArrayHasKey( 'count', $data[$key] );
            $this->assertArrayHasKey( 'title', $data[$key] );
            $this->assertIsInt( $data[$key]['count'] );
        }
    }

    /**
     * Test get_monthly_overview_data endpoint
     * @test
     * @return void
     */
    public function test_get_monthly_overview_data() {
        wp_set_current_user( $this->admin_id );

        // Test with default date
        $request = new WP_REST_Request( 'GET', "/{$this->namespace}/{$this->rest_base}/monthly-overview" );
        $controller = new AdminDashboardController();
        $response = $controller->get_monthly_overview_data( $request );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertIsArray( $data );

        // Test with specific date
        $request->set_param( 'date', '2024-01' );
        $response = $controller->get_monthly_overview_data( $request );
        $this->assertEquals( 200, $response->get_status() );
    }

    /**
     * Test get_sales_chart_data endpoint
     * @test
     * @return void
     */
    public function test_get_sales_chart_data() {
        wp_set_current_user( $this->admin_id );

        // Test with default date
        $request = new WP_REST_Request( 'GET', "/{$this->namespace}/{$this->rest_base}/sales-chart" );
        $controller = new AdminDashboardController();
        $response = $controller->get_sales_chart_data( $request );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertIsArray( $data );

        // Test with specific date
        $request->set_param( 'date', '2024-01' );
        $response = $controller->get_sales_chart_data( $request );
        $this->assertEquals( 200, $response->get_status() );
    }

    /**
     * Test get_customer_metrics_data endpoint
     * @test
     * @return void
     */
    public function test_get_customer_metrics_data() {
        wp_set_current_user( $this->admin_id );

        // Test with default date
        $request = new WP_REST_Request( 'GET', "/{$this->namespace}/{$this->rest_base}/customer-metrics" );
        $controller = new AdminDashboardController();
        $response = $controller->get_customer_metrics_data( $request );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertIsArray( $data );

        // Test with specific date
        $request->set_param( 'date', '2024-01' );
        $response = $controller->get_customer_metrics_data( $request );
        $this->assertEquals( 200, $response->get_status() );
    }

    /**
     * Test get_all_time_stats_data endpoint
     * @test
     * @return void
     */
    public function test_get_all_time_stats_data() {
        wp_set_current_user( $this->admin_id );

        $controller = new AdminDashboardController();
        $response = $controller->get_all_time_stats_data();

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertIsArray( $data );
    }

    /**
     * Test get_top_performing_vendors_data endpoint
     * @test
     * @return void
     */
    public function test_get_top_performing_vendors_data() {
        wp_set_current_user( $this->admin_id );

        $controller = new AdminDashboardController();
        $response = $controller->get_top_performing_vendors_data();

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertIsArray( $data );
    }

    /**
     * Test get_most_reviewed_products_data endpoint
     * @test
     * @return void
     */
    public function test_get_most_reviewed_products_data() {
        wp_set_current_user( $this->admin_id );

        $controller = new AdminDashboardController();
        $response = $controller->get_most_reviewed_products_data();

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertIsArray( $data );
    }

    /**
     * Test get_vendor_approvals_count method
     * @test
     * @return void
     */
    public function test_get_vendor_approvals_count() {
        wp_set_current_user( $this->admin_id );

        $controller = new AdminDashboardController();
        $count = $controller->get_vendor_approvals_count();

        $this->assertIsInt( $count );
        $this->assertGreaterThanOrEqual( 0, $count );
    }

    /**
     * Test get_product_approvals_count method
     * @test
     * @return void
     */
    public function test_get_product_approvals_count() {
        wp_set_current_user( $this->admin_id );

        $controller = new AdminDashboardController();
        $count = $controller->get_product_approvals_count();

        $this->assertIsInt( $count );
        $this->assertGreaterThanOrEqual( 0, $count );
    }

    /**
     * Test get_pending_withdrawals_count method
     * @test
     * @return void
     */
    public function test_get_pending_withdrawals_count() {
        wp_set_current_user( $this->admin_id );

        $controller = new AdminDashboardController();
        $count = $controller->get_pending_withdrawals_count();

        $this->assertIsInt( $count );
        $this->assertGreaterThanOrEqual( 0, $count );
    }

    /**
     * Test parse_date_range method
     * @test
     * @return void
     */
    public function test_parse_date_range() {
        $controller = new AdminDashboardController();

        // Test with valid date
        $result = $controller->parse_date_range( '2024-02' );
        $this->assertIsArray( $result );

        // Check if the result contains expected keys
        $this->assertArrayHasKey( 'current_month_start', $result );
        $this->assertArrayHasKey( 'current_month_end', $result );
        $this->assertArrayHasKey( 'previous_month_start', $result );
        $this->assertArrayHasKey( 'previous_month_end', $result );

        // Check if the dates are correct
        $this->assertEquals( '2024-02-01', $result['current_month_start'] );
        $this->assertEquals( '2024-02-29', $result['current_month_end'] );
        $this->assertEquals( '2024-01-01', $result['previous_month_start'] );
        $this->assertEquals( '2024-01-31', $result['previous_month_end'] ); // 2024 is a leap year
    }

    /**
     * Test get_filtered_product_types method
     * @test
     * @return void
     */
    public function test_get_filtered_product_types() {
        $controller = new AdminDashboardController();
        $product_types = $controller->get_filtered_product_types();

        $this->assertIsArray( $product_types );
        // Should contain basic WooCommerce product types
        $this->assertArrayHasKey( 'simple', $product_types );
        $this->assertArrayHasKey( 'grouped', $product_types );
        $this->assertArrayHasKey( 'external', $product_types );
        $this->assertArrayHasKey( 'variable', $product_types );
    }

    /**
     * Test REST API endpoints via HTTP requests
     * @test
     * @return void
     */
    public function test_rest_api_endpoints() {
        wp_set_current_user( $this->admin_id );

        $endpoints = [
            'todo',
            'monthly-overview',
            'sales-chart',
            'customer-metrics',
            'all-time-stats',
            'top-performing-vendors',
            'most-reviewed-products'
        ];

        foreach ( $endpoints as $endpoint ) {
            $response = $this->get_request( "/{$this->rest_base}/{$endpoint}" );
            $this->assertEquals( 200, $response->get_status(), "Endpoint {$endpoint} should return 200" );
            $this->assertIsArray( $response->get_data(), "Endpoint {$endpoint} should return array data" );
        }
    }

    /**
     * Test REST API endpoints with date parameter
     * @test
     * @return void
     */
    public function test_rest_api_endpoints_with_date_param() {
        wp_set_current_user( $this->admin_id );

        $endpoints_with_date = [
            'monthly-overview',
            'sales-chart',
            'customer-metrics'
        ];

        foreach ( $endpoints_with_date as $endpoint ) {
            $response = $this->get_request( "/{$this->rest_base}/{$endpoint}", ['date' => '2024-01'] );
            $this->assertEquals( 200, $response->get_status(), "Endpoint {$endpoint} with date param should return 200" );
            $this->assertIsArray( $response->get_data(), "Endpoint {$endpoint} with date param should return array data" );
        }
    }

    /**
     * Test unauthorized access to endpoints
     * @test
     * @return void
     */
    public function test_unauthorized_access() {
        wp_set_current_user( 0 ); // No user logged in

        $endpoints = [
            'todo',
            'monthly-overview',
            'sales-chart',
            'customer-metrics',
            'all-time-stats',
            'top-performing-vendors',
            'most-reviewed-products'
        ];

        foreach ( $endpoints as $endpoint ) {
            $response = $this->get_request( "/{$this->rest_base}/{$endpoint}" );
            $this->assertEquals( 401, $response->get_status(), "Endpoint {$endpoint} should return 401 for unauthorized access" );
        }
    }

    /**
     * Test customer access to endpoints (should be forbidden)
     * @test
     * @return void
     */
    public function test_customer_access_forbidden() {
        wp_set_current_user( $this->customer_id );

        $endpoints = [
            'todo',
            'monthly-overview',
            'sales-chart',
            'customer-metrics',
            'all-time-stats',
            'top-performing-vendors',
            'most-reviewed-products'
        ];

        foreach ( $endpoints as $endpoint ) {
            $response = $this->get_request( "/{$this->rest_base}/{$endpoint}" );
            $this->assertEquals( 403, $response->get_status(), "Endpoint {$endpoint} should return 403 for customer access" );
        }
    }
}