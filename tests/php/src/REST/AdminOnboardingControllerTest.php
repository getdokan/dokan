<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Admin\SetupWizard;
use WeDevs\Dokan\REST\AdminOnboardingController;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Server;
use Mockery;
use ReflectionClass;

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
	 * Test create onboarding endpoint
	 *
	 * @return void
	 */
	public function test_create_onboarding() {
		wp_set_current_user( $this->admin_id );

		// Create a mock for SetupWizard using a partial mock approach
		$setup_wizard_mock = Mockery::mock( SetupWizard::class );
		$setup_wizard_mock->shouldReceive( 'install_plugin' )
							->once()
							->with( 'wemail', Mockery::any() )
							->andReturn( true );

		// Create a partial mock of the controller to inject our setup wizard mock
		$controller = Mockery::mock( AdminOnboardingController::class )->makePartial();
		$controller->shouldAllowMockingProtectedMethods();

		// Replace the install_required_plugins method to use our mock
		$controller->shouldReceive( 'install_required_plugins' )
					->once()
					->andReturnUsing(
						function ( $plugins ) use ( $setup_wizard_mock ) {
							foreach ( $plugins as $plugin ) {
								if ( isset( $plugin['id'], $plugin['info'] ) ) {
									$setup_wizard_mock->install_plugin( $plugin['id'], $plugin['info'] );
								}
							}
						}
                    );

		// Register the controller's routes
		$controller->register_routes();

		// Set up the request data
		$request_data = [
			'onboarding' => true,
			'marketplace_goal' => [
				'marketplace_focus' => 'digital',
				'handle_delivery' => false,
				'top_priority' => 'security',
			],
			'custom_store_url' => 'my-store',
			'share_essentials' => true,
//			'plugins' => [
//				[
//					'id' => 'wemail',
//					'info' => [
//						'name' => 'weMail',
//						'slug' => 'wemail',
//					],
//				],
//			],
		];

		// Create the request
		$request = new WP_REST_Request( 'POST', "/{$this->namespace}/{$this->rest_base}" );
		$request->set_header( 'content-type', 'application/json' );
		$request->set_body( wp_json_encode( $request_data ) );

		// Mock the tracker insights
		$tracker_mock = Mockery::mock();
		$tracker_mock->shouldReceive( 'optin' )->once()->andReturn( true );
		$tracker_mock->shouldReceive( 'optout' )->never();

		// Mock the dokan tracker
		$dokan_mock = Mockery::mock();
		$dokan_mock->tracker = (object) [ 'insights' => $tracker_mock ];

		// Use a function mock for dokan()
		Mockery::mock( 'alias:dokan' )->shouldReceive( '__invoke' )->andReturn( $dokan_mock );

		// Replace the controller in the REST server
		add_filter(
            'rest_dispatch_request', function ( $dispatch_result, $request_handler, $request ) use ( $controller ) {
				if ( $request->get_route() === "/{$this->namespace}/{$this->rest_base}" ) {
					return $controller->create_onboarding( $request );
				}
				return $dispatch_result;
			}, 10, 3
        );

		// Dispatch the request
		$response = $this->server->dispatch( $request );

		// Check response status
		$this->assertEquals( 200, $response->get_status() );

		// Check the response data
		$data = $response->get_data();
		$this->assertEquals( 'Onboarding created successfully', $data['message'] );

		// Check that options were saved correctly
		$this->assertEquals( true, get_option( 'dokan_onboarding' ) );

		$general_options = get_option( 'dokan_general', [] );
		$this->assertEquals( 'my-store', $general_options['custom_store_url'] );

		$this->assertEquals( true, get_option( 'dokan_share_essentials' ) );

		$marketplace_goal = get_option( 'dokan_marketplace_goal', [] );
		$this->assertEquals( 'digital', $marketplace_goal['marketplace_focus'] );
		$this->assertEquals( false, $marketplace_goal['handle_delivery'] );
		$this->assertEquals( 'security', $marketplace_goal['top_priority'] );
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
				'handle_delivery' => false,
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
				'handle_delivery' => false,
				'top_priority' => 'security',
			], $data['marketplace_goal']
        );
	}
}
