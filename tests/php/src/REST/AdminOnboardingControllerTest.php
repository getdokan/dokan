<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Admin\SetupWizard;
use WeDevs\Dokan\REST\AdminOnboardingController;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Server;

class AdminOnboardingControllerTest extends DokanTestCase {
	/**
	 * @var WP_REST_Server
	 */
	protected $server;

	/**
	 * @var string
	 */
	protected $namespace = 'dokan/v1';

	/**
	 * @var string
	 */
	protected $rest_base = 'admin-onboarding';

	/**
	 * @var int
	 */
	protected $admin_id;

	/**
	 * Setup test environment
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$this->server = $wp_rest_server = new WP_REST_Server();
		do_action( 'rest_api_init' );

		// Create an admin user
		$this->admin_id = self::factory()->user->create(
			[
				'role' => 'administrator',
			]
		);

		// Add capabilities to admin user
		$admin = get_user_by( 'id', $this->admin_id );
		$admin->add_cap( 'manage_woocommerce' );
	}

	/**
	 * Test if the endpoint exists
	 *
	 * @return void
	 */
	public function test_if_endpoint_exists() {
		$routes = $this->server->get_routes( $this->namespace );
		$full_route = $this->get_route( $this->rest_base );

		$this->assertArrayHasKey( $full_route, $routes );
	}

	/**
	 * Test register routes
	 *
	 * @return void
	 */
	public function test_register_routes() {
		$controller = new AdminOnboardingController();
		$controller->register_routes();

		$routes = $this->server->get_routes( $this->namespace );
		$full_route = $this->get_route( $this->rest_base );

		$this->assertArrayHasKey( $full_route, $routes );
	}

	/**
	 * Test Permission Callback
	 *
	 * @return void
	 */
	public function test_permission_callback() {
		// Test without user
		wp_set_current_user( 0 );
		$request = new WP_REST_Request( 'GET', "/{$this->namespace}/{$this->rest_base}" );
		$controller = new AdminOnboardingController();
		$this->assertFalse( $controller->check_permission( $request ) );

		// Test with non-admin user
		$customer_id = $this->factory->user->create( [ 'role' => 'customer' ] );
		wp_set_current_user( $customer_id );
		$this->assertFalse( $controller->check_permission( $request ) );

		// Test with admin user
		wp_set_current_user( $this->admin_id );
		$this->assertTrue( $controller->check_permission( $request ) );
	}

	/**
	 * Test create_onboarding method with valid data.
	 */
	public function test_create_onboarding_valid_data() {
		wp_set_current_user( $this->admin_id );

		$request_data = [
			'onboarding' => true,
			'custom_store_url' => 'vendor',
			'share_essentials' => true,
			'marketplace_goal' => [
				'marketplace_focus' => 'physical',
				'handle_delivery' => 'marketplace',
				'top_priority' => 'growth',
			],
			'plugins' => [
				[
					'id' => 'wemail',
					'info' => [
						'name' => 'weMail',
						'repo-slug' => 'wemail',
					],
				],
			],
		];

		// Make the request
		$response = $this->post_request( "/{$this->rest_base}", $request_data );

		// Assert response is successful
		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertArrayHasKey( 'message', $data );
		$this->assertArrayHasKey( 'onboarding', $data );
		$this->assertArrayHasKey( 'general_options', $data );
		$this->assertArrayHasKey( 'share_essentials', $data );
		$this->assertArrayHasKey( 'marketplace_goal', $data );

		// Verify options were saved
		$this->assertEquals( true, get_option( 'dokan_onboarding' ) );
		$this->assertEquals( 'vendor', get_option( 'dokan_general' )['custom_store_url'] );
		$this->assertEquals( true, get_option( 'dokan_share_essentials' ) );

		$marketplace_goal = get_option( 'dokan_marketplace_goal' );
		$this->assertEquals( 'physical', $marketplace_goal['marketplace_focus'] );
		$this->assertEquals( true, $marketplace_goal['handle_delivery'] );
		$this->assertEquals( 'growth', $marketplace_goal['top_priority'] );
	}

	/**
	 * Test get onboarding endpoint
	 *
	 * @return void
	 */
	public function test_get_onboarding() {
		wp_set_current_user( $this->admin_id );

		// Set up test data in options
		update_option( 'dokan_onboarding', true );
		update_option( 'dokan_general', [ 'custom_store_url' => 'test-store' ] );
		update_option( 'dokan_share_essentials', true );
		update_option(
			'dokan_marketplace_goal', [
				'marketplace_focus' => 'digital',
				'handle_delivery' => 'marketplace',
				'top_priority' => 'security',
			]
		);

		// Create the request
		$request = new WP_REST_Request( 'GET', "/{$this->namespace}/{$this->rest_base}" );

		// Create controller and call the method directly
		$controller = new AdminOnboardingController();
		$response = $controller->get_onboarding( $request );

		// Check response status
		$this->assertEquals( 200, $response->get_status() );

		// Check the response data
		$data = $response->get_data();
		$this->assertEquals( true, $data['onboarding'] );
		$this->assertEquals( [ 'custom_store_url' => 'test-store' ], $data['general_options'] );
		$this->assertEquals( true, $data['share_essentials'] );
		$this->assertEquals(
			[
				'marketplace_focus' => 'digital',
				'handle_delivery' => 'marketplace',
				'top_priority' => 'security',
			], $data['marketplace_goal']
		);
	}
}
