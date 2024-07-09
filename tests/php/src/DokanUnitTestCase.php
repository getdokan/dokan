<?php

namespace WeDevs\Dokan\Test;

use ActionScheduler_QueueRunner;
use ActionScheduler_Store;
use WC_Helper;
use WeDevs\Dokan\Test\Factories\DokanFactory;
use WeDevs\Dokan\Test\Helpers\WC_Helper_Queue;
use WP_UnitTestCase;

abstract class DokanUnitTestCase extends WP_UnitTestCase {
    use DBAssertionTrait;

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
	 * This method is called before the first test of this test class is run.
	 *
	 * @codeCoverageIgnore
	 *
	 * @return void
	 */
	public static function setUpBeforeClass(): void {
    }

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
}
