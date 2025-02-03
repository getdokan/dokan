<?php

namespace WeDevs\Dokan\Tests\REST;

use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;

/**
 * Vendor Product Categories Controller Test
 *
 * @covers \WeDevs\Dokan\REST\VendorProductCategoriesController
 */
class VendorProductCategoriesApiTest extends DokanTestCase {
    /**
     * Test REST API base
     *
     * @var string
     */
    protected $base = '/products/categories';

    /**
     * Setup test environment
     */
    protected function setUp(): void {
        parent::setUp();

        // Create test categories
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

        return $categories;
    }

    /**
     * Test that endpoint exists
     */
    public function test_endpoint_exists(): void {
        $routes = $this->server->get_routes();
        $this->assertArrayHasKey( $this->get_route( $this->base ), $routes );
    }

    /**
     * Test get_items permissions
     */
    public function test_get_items_permissions(): void {
        // Test as guest
        wp_set_current_user( 0 );
        $response = $this->get_request( $this->base );
        $this->assertEquals( 401, $response->get_status() );

        // Test as customer
        wp_set_current_user( $this->customer_id );
        $response = $this->get_request( $this->base );
        $this->assertEquals( 403, $response->get_status() );

        // Test as vendor
        wp_set_current_user( $this->seller_id1 );
        $response = $this->get_request( $this->base );
        $this->assertEquals( 200, $response->get_status() );
    }

    /**
     * Test get_item permissions
     */
    public function test_get_item_permissions(): void {
        $category_id = $this->categories['parent1'];

        // Test as guest
        wp_set_current_user( 0 );
        $response = $this->get_request( "{$this->base}/{$category_id}" );
        $this->assertEquals( 401, $response->get_status() );

        // Test as customer
        wp_set_current_user( $this->customer_id );
        $response = $this->get_request( "{$this->base}/{$category_id}" );
        $this->assertEquals( 403, $response->get_status() );

        // Test as vendor
        wp_set_current_user( $this->seller_id1 );
        $response = $this->get_request( "{$this->base}/{$category_id}" );
        $this->assertEquals( 200, $response->get_status() );
    }

    /**
     * Test getting product categories list
     */
    public function test_get_product_categories(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( $this->base );
        $this->assertEquals( 200, $response->get_status() );

        $data = $response->get_data();
        $this->assertIsArray( $data );
        $this->assertNotEmpty( $data );

        // Check structure of first category
        $first_category = $data[0];
        $this->assertArrayHasKey( 'id', $first_category );
        $this->assertArrayHasKey( 'name', $first_category );
        $this->assertArrayHasKey( 'slug', $first_category );
        $this->assertArrayHasKey( 'parent', $first_category );
        $this->assertArrayHasKey( 'count', $first_category );
    }

    /**
     * Test getting single product category
     */
    public function test_get_single_product_category(): void {
        wp_set_current_user( $this->seller_id1 );

        $category_id = $this->categories['parent1'];
        $response = $this->get_request( "{$this->base}/{$category_id}" );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        $this->assertEquals( $category_id, $data['id'] );
        $this->assertEquals( 'Parent Category 1', $data['name'] );
    }

    /**
     * Test filtering categories by parent
     */
    public function test_filter_categories_by_parent(): void {
        wp_set_current_user( $this->seller_id1 );

        $parent_id = $this->categories['parent1'];
        $response = $this->get_request( $this->base, [ 'parent' => $parent_id ] );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        foreach ( $data as $category ) {
            $this->assertEquals( $parent_id, $category['parent'] );
        }
    }

    /**
     * Test category creation is disabled
     */
    public function test_create_category_is_disabled(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->post_request(
            $this->base, [
				'name' => 'Test Category',
			]
        );

        $this->assertEquals( 404, $response->get_status() );
    }

    /**
     * Test category update is disabled
     */
    public function test_update_category_is_disabled(): void {
        wp_set_current_user( $this->seller_id1 );

        $category_id = $this->categories['parent1'];
        $response = $this->put_request(
            "{$this->base}/{$category_id}", [
				'name' => 'Updated Name',
			]
        );

        $this->assertEquals( 404, $response->get_status() );
    }

    /**
     * Test category deletion is disabled
     */
    public function test_delete_category_is_disabled(): void {
        wp_set_current_user( $this->seller_id1 );

        $category_id = $this->categories['parent1'];
        $response = $this->delete_request( "{$this->base}/{$category_id}" );

        $this->assertEquals( 404, $response->get_status() );
    }

    /**
     * Test batch operations are disabled
     */
    public function test_batch_operations_are_disabled(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->post_request(
            "{$this->base}/batch", [
				'create' => [
					[ 'name' => 'New Category' ],
				],
				'update' => [
					[
						'id' => $this->categories['parent1'],
						'name' => 'Updated Name',
					],
				],
				'delete' => [
					$this->categories['child1'],
				],
			]
        );

        $this->assertEquals( 404, $response->get_status() );
    }

    /**
     * Clean up after tests
     */
    protected function tearDown(): void {
        // Delete test categories
        foreach ( $this->categories as $category_id ) {
            wp_delete_term( $category_id, 'product_cat' );
        }

        parent::tearDown();
    }
}
