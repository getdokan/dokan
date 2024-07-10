<?php

namespace WeDevs\Dokan\Test;

use WeDevs\Dokan\Test\Factories\DokanFactory;
use WeDevs\Dokan\Test\Helpers\WC_Helper_Queue;
use WP_REST_Request;
use WP_REST_Response;
use WP_UnitTestCase;

abstract class DokanUnitTestCase extends WP_UnitTestCase {
    use DBAssertionTrait;

    /**
     * @var int
     */
    protected $admin_id;

    /**
     * @var int
     */
    protected $seller_id1;

    /**
     * @var int
     */
    protected $seller_id2;

    /**
     * @var int
     */
    protected $customer_id;

    /**
     * Rest Api Server.
     *
     * @var \WP_REST_Server The REST server instance.
     */
    protected $server;

    /**
     * The namespace of the REST route.
     *
     * @var string Dokan API Namespace
     */
    protected $namespace = 'dokan/v1/';

    /**
     * Setup a rest server for test.
     */
    public function setUp(): void {
        // Initiating the REST API.
        global $wp_rest_server;

        parent::setUp();
        $wp_rest_server = new \WP_REST_Server();
        $this->server   = $wp_rest_server;
        do_action( 'rest_api_init' );
		$this->setup_users();
	}

    /**
     * Set up users for testing.
     *
     * This method creates and sets up an administrator, a customer, and two sellers.
     *
     * @return void
     */
    protected function setup_users(): void {
        $this->admin_id = $this->factory()->user->create(
            array(
                'role' => 'administrator',
            )
        );

        $this->customer_id = $this->factory()->customer->create();
        $this->seller_id1 = $this->factory()->seller->create();
        $this->seller_id2 = $this->factory()->seller->create();
    }

    /**
     * Get the full route namespace for the given route.
     *
     * @param string $route
     * @return string
     */
    protected function get_rest_namespace( string $route ): string {
        return $this->namespace . $route;
    }

	/**
	 * @inheritDoc
     *
	 * @return DokanFactory The fixture factory.
	 */
	protected static function factory() {
		static $factory = null;

		if ( ! $factory ) {
			$factory = new DokanFactory();
		}
		return $factory;
	}

    /**
	 * Get all pending queued actions.
	 *
	 * @return array Pending jobs.
	 */
	public function get_all_pending() {
		return WC_Helper_Queue::get_all_pending();
	}

	/**
	 * Run all pending queued actions.
	 *
	 * @return void
	 */
	public function run_all_pending() {
		WC_Helper_Queue::run_all_pending();
	}

	/**
	 * Cancel all pending actions.
	 *
	 * @return void
	 */
	public function cancel_all_pending() {
		WC_Helper_Queue::cancel_all_pending();
	}

    /**
	 * Get route with namespace.
	 *
	 * @param string $route_name REST API route name.
	 * @return string The full route with namespace.
	 */
	protected function get_route( string $route_name ): string {
        // If namespace is already exist.
        if ( str_starts_with( $route_name, $this->namespace ) ) {
            return $route_name;
        }

		return $this->namespace . '/' . untrailingslashit( $route_name );
	}

    /**
     * Perform a GET request on the given route with parameters.
     *
     * @param string $route The REST API route.
     * @param array $params Optional query parameters.
     * @return WP_REST_Response The response object.
     */
    protected function get_request( string $route, array $params = [] ): WP_REST_Response {
        $request = new WP_REST_Request( 'GET', $this->get_route( $route ) );
        $request->set_query_params( $params );

        return $this->server->dispatch( $request );
    }

    /**
     * Perform a POST request on the given route with parameters.
     *
     * @param string $route The REST API route.
     * @param array $params Optional body parameters.
     * @return WP_REST_Response The response object.
     */
    protected function post_request( string $route, array $params = [] ): WP_REST_Response {
        $request = new WP_REST_Request( 'POST', $this->get_route( $route ) );
        $request->set_body_params( $params );

        return $this->server->dispatch( $request );
    }
}
