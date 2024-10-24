<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-data-countries
 */
class DataCountriesControllerTest extends DokanTestCase {

    protected $namespace = 'dokan/v1';

    /**
     * Test ensuring the route is registered.
     *
     * @return void
     */
    public function test_ensure_route_is_registered() {
        $routes = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route( 'data/countries' );

        $this->assertArrayHasKey( $full_route, $routes );
        $this->assertNestedContains( [ 'methods' => [ 'GET' => true ] ], $routes[ $full_route ] );
    }

    /**
     * Test getting countries.
     */
    public function test_get_countries() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'data/countries' );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertIsArray( $data );
        $this->assertNotEmpty( $data );
        // Add more assertions based on expected country data
    }

    /**
     * Test getting states for a specific country.
     */
    public function test_get_country_states() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'data/countries/US' );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertArrayHasKey( 'states', $data );
        $this->assertNotEmpty( $data['states'] );
    }
}
