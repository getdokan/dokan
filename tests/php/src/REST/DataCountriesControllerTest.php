<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group dokan-data-countries
 */
class DataCountriesControllerTest extends DokanTestCase {
    /**
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * @var string
     */
    protected $base_route = 'data/countries';

    /**
     * Setup test environment
     */
    protected function setUp(): void {
        parent::setUp();

        // Ensure WooCommerce's default countries and states are loaded
        \WC()->countries->get_countries();
        \WC()->countries->get_states();
    }

    /**
     * Test getting countries with unauthorized user
     */
    public function test_get_items_unauthorized() {
        wp_set_current_user( 0 );
        $response = $this->get_request( $this->base_route );

        $this->assertEquals( 401, $response->get_status() );
        $data = $response->get_data();
        $this->assertEquals( 'dokan_rest_cannot_view', $data['code'] );
    }

    /**
     * Test getting countries with non-vendor user
     */
    public function test_get_items_invalid_permission() {
        $customer = $this->factory()->customer->create();
        wp_set_current_user( $customer );
        $response = $this->get_request( $this->base_route );

        $this->assertEquals( 403, $response->get_status() );
        $this->assertEquals( 'dokan_rest_cannot_view', $response->get_data()['code'] );
    }

    /**
     * Test getting all countries successfully
     */
    public function test_get_items_success() {
        wp_set_current_user( $this->seller_id1 );
        $response = $this->get_request( $this->base_route );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        // Verify response structure
        $this->assertIsArray( $data );
        $this->assertNotEmpty( $data );

        // Check first country format
        $first_country = reset( $data );
        $this->assertArrayHasKey( 'code', $first_country );
        $this->assertArrayHasKey( 'name', $first_country );

        // Verify some known countries exist
        $country_codes = array_column( $data, 'code' );
        $this->assertContains( 'US', $country_codes );
        $this->assertContains( 'GB', $country_codes );
        $this->assertContains( 'CA', $country_codes );
    }

    /**
     * Test getting states for invalid country
     */
    public function test_get_states_invalid_country() {
        wp_set_current_user( $this->seller_id1 );
        $response = $this->get_request( $this->base_route . '/XX' );

        $this->assertEquals( 404, $response->get_status() );
        $this->assertEquals( 'woocommerce_rest_data_invalid_location', $response->get_data()['code'] );
    }

    /**
     * Test getting states for country without states
     */
    public function test_get_states_empty_states() {
        wp_set_current_user( $this->seller_id1 );
        $response = $this->get_request( $this->base_route . '/FR' );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        $this->assertArrayHasKey( 'states', $data );
        $this->assertEmpty( $data['states'] );
    }

    /**
     * Test getting states for US successfully
     */
    public function test_get_states_us_success() {
        wp_set_current_user( $this->seller_id1 );
        $response = $this->get_request( $this->base_route . '/US' );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();

        // Verify response structure
        $this->assertArrayHasKey( 'states', $data );
        $states = $data['states'];
        $this->assertNotEmpty( $states );

        // Verify state format
        $first_state = reset( $states );
        $this->assertArrayHasKey( 'code', $first_state );
        $this->assertArrayHasKey( 'name', $first_state );

        // Check for specific states
        $state_codes = array_column( $states, 'code' );
        $this->assertContains( 'CA', $state_codes ); // California
        $this->assertContains( 'NY', $state_codes ); // New York
        $this->assertContains( 'TX', $state_codes ); // Texas
    }

    /**
     * Test country code case sensitivity
     */
    public function test_get_states_case_insensitive() {
        wp_set_current_user( $this->seller_id1 );

        // Test lowercase
        $response_lower = $this->get_request( $this->base_route . '/us' );
        $this->assertEquals( 200, $response_lower->get_status() );

        // Test uppercase
        $response_upper = $this->get_request( $this->base_route . '/US' );
        $this->assertEquals( 200, $response_upper->get_status() );

        // Results should be identical
        $this->assertEquals(
            $response_lower->get_data(),
            $response_upper->get_data()
        );
    }

    /**
     * Test getting states with special characters in country code
     */
    public function test_get_states_special_characters() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( $this->base_route . '/US@#' );
        $this->assertEquals( 404, $response->get_status() );
    }

    /**
     * Test with multiple concurrent requests
     */
    public function test_concurrent_requests() {
        wp_set_current_user( $this->seller_id1 );

        // Simulate multiple concurrent requests
        $responses = [];
        for ( $i = 0; $i < 5; $i++ ) {
            $responses[] = $this->get_request( $this->base_route );
        }

        // Verify all responses are identical
        $first_response = reset( $responses );
        foreach ( $responses as $response ) {
            $this->assertEquals(
                $first_response->get_data(),
                $response->get_data()
            );
        }
    }
}
