<?php

namespace WeDevs\Dokan\Test;

use WeDevs\Dokan\Test\Factories\DokanFactory;
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
}
