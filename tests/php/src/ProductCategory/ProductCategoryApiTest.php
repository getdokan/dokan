<?php

namespace WeDevs\Dokan\Test\ProductCategory;

use WeDevs\Dokan\Test\DokanTestCase;

class ProductCategoryApiTest extends DokanTestCase {

    /**
     * The namespace of the REST route.
     *
     * @var string Dokan API Namespace
     */
    protected string $rest_base = 'product-categories';

    /**
     * Test that the endpoint exists
     *
     * @return void
     */
    public function test_endpoint_exists() {
        $routes     = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route( $this->rest_base . '/' );
        $this->assertArrayHasKey( $full_route, $routes );
    }

    /**
     * Test that get categories permission callback works
     */

    public function test_get_categories_permission_callback() {
        $route    = $this->get_route( $this->rest_base . '/' );
        $request  = new \WP_REST_Request( 'GET', $route );
        $response = $this->server->dispatch( $request );
        $this->assertEquals( 401, $response->get_status() );
    }

    /**
     * Test that get categories permission only for vendor
     */

    public function test_get_categories_permission_only_for_vendor() {
        $route    = $this->get_route( $this->rest_base . '/' );
        $request  = new \WP_REST_Request( 'GET', $route );
        $seller_id = $this->seller_id1;
        wp_set_current_user( $seller_id );
        $response = $this->server->dispatch( $request );
        $this->assertEquals( 200, $response->get_status() );
    }

    /**
     * Test that get categories with pagination
     */

    public function test_get_categories_with_pagination() {

        // create 10 categories for testing with factory
        $this->factory()->term->create_many( 10, [ 'taxonomy' => 'product_cat' ] );

        $route     = $this->get_route( $this->rest_base . '/' );
        $request   = new \WP_REST_Request( 'GET', $route );
        $seller_id = $this->seller_id1;
        wp_set_current_user( $seller_id );
        $request->set_param( 'per_page', 5 );
        $response = $this->server->dispatch( $request );
        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        // Check if the response is an array and has 5 items
        print_r( $data );
        $this->assertIsArray( $data );
        $this->assertCount( 5, $data );
    }



    /**
     * Test that get categories with search
     */

    public function test_get_categories_with_search() {

        // create 10 categories for testing with factory
        $this->factory()->term->create_many( 10, [ 'taxonomy' => 'product_cat' ] );
        $route     = $this->get_route( $this->rest_base . '/' );
        $request   = new \WP_REST_Request( 'GET', $route );
        $seller_id = $this->seller_id1;
        wp_set_current_user( $seller_id );
        $request->set_param( 'search', 'term' );

        $response = $this->server->dispatch( $request );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        // Check if the response is an array and includes the search term
        $this->assertIsArray( $data );
        print_r( $data[0]['name'] );
        $this->assertStringContainsStringIgnoringCase( 'term', $data[0]['name'] );
    }


    /**
     * Test that get categories with exclude
     */

    public function test_get_categories_with_exclude() {

        // create 10 categories for testing with factory
		$categories = $this->factory()->term->create_many( 10, [ 'taxonomy' => 'product_cat' ] );
        $exclude = $categories[0];
        // convert the exclude integer to string
        $exclude = strval( $exclude );
        $route     = $this->get_route( $this->rest_base . '/' );
        $request   = new \WP_REST_Request( 'GET', $route );
        $seller_id = $this->seller_id1;
        wp_set_current_user( $seller_id );
        $request->set_param( 'search', 'term' );

        $response = $this->server->dispatch( $request );
        $request->set_param( 'exclude', $exclude );

        $response = $this->server->dispatch( $request );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        // Check if the response is an array and does not include the excluded category
        $this->assertIsArray( $data );
        $this->assertNotContains( $exclude, $data );
    }

    /**
     * Test that get categories with include
     */

    public function test_get_categories_with_include() {

        // create 10 categories for testing with factory
        $categories = $this->factory()->term->create_many( 10, [ 'taxonomy' => 'product_cat' ] );
        $include    = $categories[0];
        // convert the include integer to string
        $include   = strval( $include );
        $route     = $this->get_route( $this->rest_base . '/' );
        $request   = new \WP_REST_Request( 'GET', $route );
        $seller_id = $this->seller_id1;
        wp_set_current_user( $seller_id );
        $request->set_param( 'search', 'term' );

        $response = $this->server->dispatch( $request );
        $request->set_param( 'include', $include );

        $response = $this->server->dispatch( $request );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        // Check if the response is an array and includes the included category
        $this->assertIsArray( $data );
        $this->assertCount( 1, $data );
        $this->assertEquals( $include, $data[0]['id'] );
    }

    /**
     * Test that get categories with _fields
     */

    public function test_get_categories_with_fields() {

        // create 10 categories for testing with factory
        $categories = $this->factory()->term->create_many( 10, [ 'taxonomy' => 'product_cat' ] );
        $route      = $this->get_route( $this->rest_base . '/' );
        $request    = new \WP_REST_Request( 'GET', $route );
        $seller_id  = $this->seller_id1;
        wp_set_current_user( $seller_id );
        $request->set_param( '_fields', 'id,name' );

        $response = $this->server->dispatch( $request );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        // Check if the response is an array and includes only the id and name fields
        $this->assertIsArray( $data );
        $this->assertArrayHasKey( 'id', $data[0] );
        $this->assertArrayHasKey( 'name', $data[0] );
        $this->assertArrayNotHasKey( 'description', $data[0] );
    }
}
