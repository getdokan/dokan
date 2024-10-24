<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-tax-classes-v3
 */
class TaxClassControllerTest extends DokanTestCase {

    protected $namespace = 'dokan/v1';

    /**
     * Test ensuring the route is registered.
     *
     * @return void
     */
    public function test_ensure_route_is_registered() {
        $routes = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route( 'taxes/classes' );

        $this->assertArrayHasKey( $full_route, $routes );
        $this->assertNestedContains( [ 'methods' => [ 'GET' => true ] ], $routes[ $full_route ] );
    }

    /**
     * Test getting tax classes.
     */
    public function test_get_tax_classes() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'taxes/classes' );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertIsArray( $data );
    }
}
