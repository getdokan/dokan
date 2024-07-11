<?php

namespace WeDevs\Dokan\Test;

use WeDevs\Dokan\Test\Factories\DokanFactory;
use WeDevs\Dokan\Test\Helpers\WC_Helper_Queue;
use WP_REST_Request;
use WP_REST_Response;
use WP_UnitTestCase;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use Brain\Monkey;
use WP_REST_Server;

/**
 * Abstract base class for Dokan unit test cases.
 *
 * PHPUnit Docs: @see https://docs.phpunit.de/en/9.6/
 * Brain Monkey: @see https://giuseppe-mazzapica.gitbook.io/brain-monkey  A unit test utility for WP and PHP to Mock.
 * Mockery: @see http://docs.mockery.io/en/latest/
 */
abstract class DokanUnitTestCase extends WP_UnitTestCase {
    use DBAssertionTrait;
    use MockeryPHPUnitIntegration;

    /**
     * Admin user ID.
     *
     * @var int
     */
    protected $admin_id;

    /**
     * First seller user ID.
     *
     * @var int
     */
    protected $seller_id1;

    /**
     * Second seller user ID.
     *
     * @var int
     */
    protected $seller_id2;

    /**
     * Customer user ID.
     *
     * @var int
     */
    protected $customer_id;

    /**
     * REST API server instance.
     *
     * @var WP_REST_Server The REST server instance.
     */
    protected $server;

    /**
     * The namespace of the REST route.
     *
     * @var string Dokan API Namespace
     */
    protected $namespace = 'dokan/v1/';

    /**
     * Setup a REST server for test.
     *
     * @return void
     */
    public function setUp(): void {
        // Initiating the REST API.
        global $wp_rest_server;

        parent::setUp();
        Monkey\setUp();

        $wp_rest_server = new WP_REST_Server();
        $this->server   = $wp_rest_server;
        do_action( 'rest_api_init' );
        $this->setup_users();
    }

    /**
     * Tear down the test case.
     *
     * @return void
     */
    protected function tearDown(): void {
        Monkey\tearDown();
        parent::tearDown();
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
     * @param string $route The REST API route.
     * @return string The full route with namespace.
     */
    protected function get_rest_namespace( string $route ): string {
        return $this->namespace . $route;
    }

    /**
     * {@inheritDoc}
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
    public function get_all_pending(): array {
        return WC_Helper_Queue::get_all_pending();
    }

    /**
     * Run all pending queued actions.
     *
     * @return void
     */
    public function run_all_pending(): void {
        WC_Helper_Queue::run_all_pending();
    }

    /**
     * Cancel all pending actions.
     *
     * @return void
     */
    public function cancel_all_pending(): void {
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

    /**
     * Data provider for multi-vendor orders.
     *
     * @see https://docs.phpunit.de/en/9.6/writing-tests-for-phpunit.html#writing-tests-for-phpunit-data-providers
     * @return array The data for the multi-vendor order tests.
     */
    public function get_multi_vendor_order() {
        $seller_id1 = $this->factory()->seller->create();
        $seller_id2 = $this->factory()->seller->create();

        $order_id = $this->factory()
            ->order
            ->set_item_fee(
                [
                    'name' => 'Extra Charge',
                    'amount' => 10,
                ]
            )
            ->set_item_shipping(
                [
                    'name' => 'Shipping Fee',
                    'amount' => 10,
                ]
            )
            ->create(
                [
                    'status'      => 'processing',
                    'customer_id' => $this->factory()->customer->create( [] ),
                    'line_items'  => array(
                        array(
                            'product_id' => $this->factory()->product
                                ->set_seller_id( $seller_id1 )
                                ->create(
                                    [
                                        'name' => 'Test Product 1',
                                        'regular_price' => 5,
                                        'price' => 5,
                                    ]
                                ),
                            'quantity'   => 2,
                        ),
                        array(
                            'product_id' => $this->factory()->product
                                ->set_seller_id( $seller_id2 )
                                ->create(
                                    [
                                        'name' => 'Test Product 2',
                                        'regular_price' => 5,
                                        'price' => 5,
                                    ]
                                ),
                            'quantity'   => 1,
                        ),
                    ),
                ]
            );

        return [
            [ $order_id, $seller_id1, $seller_id2 ],
        ];
    }
}
