<?php


namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-shipping-methods
 */
class ShippingMethodControllerTest extends DokanTestCase {


    protected $namespace = 'dokan/v1';

    /**
     * Test ensuring the route is registered.
     *
     * @return void
     */
    public function test_ensure_route_is_registered() {
        $routes = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route( 'shipping_methods' );

        $this->assertArrayHasKey( $full_route, $routes );
        $this->assertNestedContains( [ 'methods' => [ 'GET' => true ] ], $routes[ $full_route ] );
    }

    /**
     * Test getting shipping methods.
     */
    public function test_get_shipping_methods() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'shipping_methods' );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertIsArray( $data );
        $this->assertNotEmpty( $data );
        // Add more assertions based on expected shipping method data
    }

    /**
     * Test getting a single shipping method.
     */
    public function test_get_shipping_method() {
        wp_set_current_user( $this->seller_id1 );

        // Assuming 'flat_rate' is a valid shipping method ID
        $response = $this->get_request( 'shipping_methods/flat_rate' );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertEquals( 'flat_rate', $data['id'] );
    }
}
