<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-payment-gateways-v3
 */
class PaymentGatewaysControllerTest extends DokanTestCase {

    protected $namespace = 'dokan/v1';

    /**
     * Test ensuring the route is registered.
     *
     * @return void
     */
    public function test_ensure_route_is_registered() {
        $routes = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route( 'payment_gateways' );

        $this->assertArrayHasKey( $full_route, $routes );
        $this->assertNestedContains( [ 'methods' => [ 'GET' => true ] ], $routes[ $full_route ] );
    }

    /**
     * Test getting payment gateways.
     */
    public function test_get_payment_gateways() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'payment_gateways' );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertIsArray( $data );
        $this->assertNotEmpty( $data );
    }

    /**
     * Test getting a single payment gateway.
     */
    public function test_get_payment_gateway() {
        wp_set_current_user( $this->seller_id1 );

        // Assuming 'bacs' is a valid payment gateway ID
        $response = $this->get_request( 'payment_gateways/bacs' );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertEquals( 'bacs', $data['id'] );
    }
}
