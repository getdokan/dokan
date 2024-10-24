<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-taxes
 */
class TaxControllerTest extends DokanTestCase {

    protected $namespace = 'dokan/v1';

    /**
     * Test ensuring the route is registered.
     *
     * @return void
     */
    public function test_ensure_route_is_registered() {
        $routes = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route( 'taxes' );

        $this->assertArrayHasKey( $full_route, $routes );
        $this->assertNestedContains( [ 'methods' => [ 'GET' => true ] ], $routes[ $full_route ] );
    }

    /**
     * Test getting taxes.
     */
    public function test_get_taxes() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'taxes' );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertIsArray( $data );
        // Add more assertions based on expected tax data
    }
}
