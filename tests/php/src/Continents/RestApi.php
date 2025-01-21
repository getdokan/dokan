<?php

namespace WeDevs\Dokan\Test\Continents;

use WeDevs\Dokan\Test\DokanTestCase;

class RestApi extends DokanTestCase {

    /**
     * The namespace of the REST route.
     *
     * @var string Dokan API Namespace
     */
    protected $rest_base = 'data/continents';

    /**
     *  Test that the endpoint exist.
     */
    public function test_if_get_all_continents_api_exists() {
        $routes     = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route( $this->rest_base );

        $this->assertArrayHasKey( $full_route, $routes );
    }

    /**
     *  Test that the endpoint exist.
     */
    public function test_if_get_a_single_continent_api_exists() {
        $routes     = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route( $this->rest_base . '/(?P<location>[\w-]+)' );

        $this->assertArrayHasKey( $full_route, $routes );
    }

    public function test_that_we_can_get_all_continents() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( $this->rest_base );

        $this->assertEquals( 200, $response->get_status() );

        $data = $response->get_data();

        $this->assertIsArray( $data );
        $this->assertArrayHasKey( 'code', $data[0] );
        $this->assertArrayHasKey( 'name', $data[0] );
        $this->assertArrayHasKey( 'countries', $data[0] );
    }

    public function test_that_we_can_get_single_continent_item_by_code() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( $this->rest_base . '/AS' );

        $this->assertEquals( 200, $response->get_status() );

        $data = $response->get_data();

        $this->assertIsArray( $data );
        $this->assertArrayHasKey( 'code', $data );
        $this->assertArrayHasKey( 'name', $data );
        $this->assertArrayHasKey( 'countries', $data );
    }
}
