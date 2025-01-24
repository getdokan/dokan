<?php

namespace WeDevs\Dokan\Test\ProductCategory;

use WeDevs\Dokan\Test\DokanTestCase;

class ProductCategoryApiTest extends DokanTestCase {
    /**
     * @var string API namespace
     */
    protected string $rest_base = 'product-categories';

    /**
     * @var array Test categories
     */
    protected array $categories = [];

    /**
     * Set up test environment
     */
    public function setUp(): void {
        parent::setUp();

        // Create test categories with specific structure
        $this->categories = $this->create_test_categories();
    }

    /**
     * Create test categories with parent-child relationships
     */
    protected function create_test_categories(): array {
        $categories = [];

        // Create parent categories
        $categories['parent1'] = $this->factory()->term->create(
            [
				'taxonomy' => 'product_cat',
				'name'    => 'Parent Category 1',
			]
        );

        $categories['parent2'] = $this->factory()->term->create(
            [
				'taxonomy' => 'product_cat',
				'name'    => 'Parent Category 2',
			]
        );

        // Create child categories
        $categories['child1'] = $this->factory()->term->create(
            [
				'taxonomy' => 'product_cat',
				'name'    => 'Child Category 1',
				'parent'  => $categories['parent1'],
			]
        );

        $categories['child2'] = $this->factory()->term->create(
            [
				'taxonomy' => 'product_cat',
				'name'    => 'Child Category 2',
				'parent'  => $categories['parent1'],
			]
        );

        // Create additional categories for pagination tests
        $categories['others'] = $this->factory()->term->create_many(
            6, [
				'taxonomy' => 'product_cat',
			]
        );

        return $categories;
    }

    /**
     * Helper method to make API requests
     */
    protected function make_request( array $params = [] ): \WP_REST_Response {
        $route = $this->get_route( $this->rest_base . '/' );
        $request = new \WP_REST_Request( 'GET', $route );

        foreach ( $params as $key => $value ) {
            $request->set_param( $key, $value );
        }

        return $this->server->dispatch( $request );
    }

    // make single category request
    protected function make_single_category_request( int $category_id ): \WP_REST_Response {
        $route = $this->get_route( $this->rest_base . '/' . $category_id );
        $request = new \WP_REST_Request( 'GET', $route );

        return $this->server->dispatch( $request );

    }

    /**
     * Helper method to authenticate as vendor
     */
    protected function authenticate_as_vendor(): void {
        wp_set_current_user( $this->seller_id1 );
    }

    /**
     * @group endpoint
     */
    public function test_endpoint_exists(): void {
        $routes = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route( $this->rest_base . '/' );
        $this->assertArrayHasKey( $full_route, $routes );
    }

    /**
     * @group authentication
     */
    public function test_requires_authentication(): void {
        $response = $this->make_request();
        $this->assertEquals( 401, $response->get_status() );
    }

    /**
     * @group authentication
     */
    public function test_vendor_can_access(): void {
        $this->authenticate_as_vendor();
        $response = $this->make_request();
        $this->assertEquals( 200, $response->get_status() );
    }

    /**
     * @group pagination
     */
    public function test_pagination(): void {
        $this->authenticate_as_vendor();

        // Test first page
        $response = $this->make_request(
            [
				'per_page' => 5,
				'page' => 1,
			]
        );
        $data = $response->get_data();
        $this->assertCount( 5, $data );

        // Test second page
        $response = $this->make_request(
            [
				'per_page' => 5,
				'page' => 2,
			]
        );
        $data = $response->get_data();
        $this->assertNotEmpty( $data );

        // Test pagination headers
        $headers = $response->get_headers();
        $this->assertArrayHasKey( 'X-WP-Total', $headers );
        $this->assertArrayHasKey( 'X-WP-TotalPages', $headers );
    }

    /**
     * @group filtering
     */
    public function test_search_filter(): void {
        $this->authenticate_as_vendor();

        $response = $this->make_request( [ 'search' => 'Parent' ] );
        $data = $response->get_data();

        $this->assertNotEmpty( $data );
        foreach ( $data as $category ) {
            $this->assertStringContainsStringIgnoringCase( 'Parent', $category['name'] );
        }
    }

    /**
     * @group filtering
     */
    public function test_exclude_filter(): void {
        $this->authenticate_as_vendor();

        $exclude_id = $this->categories['parent1'];
        $response = $this->make_request( [ 'exclude' => (string) $exclude_id ] );
        $data = $response->get_data();

        $category_ids = wp_list_pluck( $data, 'id' );
        $this->assertNotContains( $exclude_id, $category_ids );
    }

    /**
     * @group filtering
     */
    public function test_include_filter(): void {
        $this->authenticate_as_vendor();

        $include_id = $this->categories['parent1'];
        $response = $this->make_request( [ 'include' => (string) $include_id ] );
        $data = $response->get_data();

        $this->assertCount( 1, $data );
        $this->assertEquals( $include_id, $data[0]['id'] );
    }

    /**
     * @group fields
     */
    public function test_fields_parameter(): void {
        $this->authenticate_as_vendor();

        $response = $this->make_request( [ '_fields' => 'id,name' ] );
        $data = $response->get_data();

        $this->assertNotEmpty( $data );
        foreach ( $data as $category ) {
            $this->assertArrayHasKey( 'id', $category );
            $this->assertArrayHasKey( 'name', $category );
            $this->assertArrayNotHasKey( 'description', $category );
            $this->assertArrayNotHasKey( 'parent', $category );
        }
    }

    /**
     * @group parent-child
     */
    public function test_parent_parameter(): void {
        $this->authenticate_as_vendor();

        $parent_id = $this->categories['parent1'];
        $response = $this->make_request( [ 'parent' => $parent_id ] );
        $data = $response->get_data();

        $this->assertNotEmpty( $data );
        foreach ( $data as $category ) {
            $this->assertEquals( $parent_id, $category['parent'] );
        }
    }

    // test single category response
    public function test_single_category_response(): void {
        $this->authenticate_as_vendor();

        $category_id = $this->categories['parent1'];
        $response = $this->make_single_category_request( $category_id );
        $data = $response->get_data();

        $this->assertEquals( $category_id, $data['id'] );
        $this->assertEquals( 'Parent Category 1', $data['name'] );
    }
    /**
     * Clean up after tests
     */
    public function tearDown(): void {
        // Delete test categories
        foreach ( $this->categories as $category_id ) {
            if ( is_array( $category_id ) ) {
                foreach ( $category_id as $id ) {
                    wp_delete_term( $id, 'product_cat' );
                }
            } else {
                wp_delete_term( $category_id, 'product_cat' );
            }
        }

        parent::tearDown();
    }
}
