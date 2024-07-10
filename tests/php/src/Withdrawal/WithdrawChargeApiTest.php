<?php

namespace WeDevs\Dokan\Test\Withdrawal;

class WithdrawChargeApiTest extends \WP_UnitTestCase {

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
    protected $namespace = 'dokan/v1/withdraw';

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
     * Saves dokan withdraw data in database.
     *
     * @return void
     */
    public function save_withdraw_data_to_database() {
        $data = [
            'withdraw_methods'                                   => [
                'paypal'       => 'paypal',
                'bank'         => 'bank',
                'dokan_custom' => 'dokan_custom',
                'skrill'       => 'skrill',
            ],
            'withdraw_method_name'                               => 'bKash',
            'withdraw_method_type'                               => 'Phone',
            'withdraw_charges'                                   => [
                'paypal'       => [
                    'fixed'      => '5',
                    'percentage' => '10',
                ],
                'bank'         => [
                    'fixed'      => '10',
                    'percentage' => '',
                ],
                'skrill'       => [
                    'fixed'      => '',
                    'percentage' => '20',
                ],
                'dokan_custom' => [
                    'fixed'      => '',
                    'percentage' => '10',
                ],
            ],
            'withdraw_limit'                                     => '2',
            'withdraw_order_status'                              => [
                'wc-completed' => 'wc-completed',
            ],
            'exclude_cod_payment'                                => 'off',
            'withdraw_date_limit'                                => '0',
            'hide_withdraw_option'                               => 'off',
            'disbursement_schedule_settings'                     => '',
            'disbursement'                                       => [
                'manual' => 'manual',
            ],
            'disbursement_schedule'                              => [
                'quarterly' => '',
                'monthly'   => '',
                'biweekly'  => '',
                'weekly'    => '',
            ],
            'quarterly_schedule'                                 => [
                'month' => 'march',
                'week'  => '1',
                'days'  => 'monday',
            ],
            'monthly_schedule'                                   => [
                'week' => '1',
                'days' => 'monday',
            ],
            'biweekly_schedule'                                  => [
                'week' => '1',
                'days' => 'monday',
            ],
            'weekly_schedule'                                    => 'monday',
            'send_announcement_for_payment_change'               => 'false',
            'send_announcement_for_disbursement_schedule_change' => 'false',
        ];

        update_option( 'dokan_withdraw', $data, true );
    }

    /**
     *  Test that the endpoint exist.
     */
    public function test_if_get_all_charges_api_exists() {
        $this->save_withdraw_data_to_database();

        $endpoint = '/' . $this->namespace . '/charges';

        $request = new \WP_REST_Request( 'GET', $endpoint );

        $response = $this->server->dispatch( $request );
        $data     = $response->get_data();

        $this->assertNotEquals( 'rest_no_route', $data['code'] );
    }

    /**
     *  Test that the endpoint exist.
     */
    public function test_if_get_method_withdraw_charge_api_exists() {
        $this->save_withdraw_data_to_database();

        $endpoint = '/' . $this->namespace . '/charge';

        $request = new \WP_REST_Request( 'GET', $endpoint );

        $response = $this->server->dispatch( $request );
        $data     = $response->get_data();

        $this->assertNotEquals( 'rest_no_route', $data['code'] );
    }

    public function test_if_we_can_get_all_withdraw_charges() {
        $this->save_withdraw_data_to_database();

        $user = $this->factory()->user->create(
            [
                'role' => 'seller',
            ]
        );

        wp_set_current_user( $user );

        $endpoint = '/' . $this->namespace . '/charges';
        $request = new \WP_REST_Request( 'GET', $endpoint );

        $response = $this->server->dispatch( $request );

        $all_charges = dokan_withdraw_get_method_charges();
        $data = $response->get_data();

        $this->assertArrayNotHasKey( 'code', $data );
        $this->assertEquals( 200, $response->get_status() );
        $this->assertEquals( $all_charges, $data );
    }

    /**
     * Method charge data provider.
     *
     * @return array[]
     */
    public function charge_data_provider() {
        return [
            [
                [
                    'method' => 'paypal',
                    'amount' => 100,
                ],
                [
                    'charge'      => 15,
                    'receivable'  => 85,
                    'charge_data' => [
						'fixed' => 5,
						'percentage' => 10,
					],
                ],
            ],
            [
                [
                    'method' => 'bank',
                    'amount' => 200,
                ],
                [
                    'charge'      => 10,
                    'receivable'  => 190,
                    'charge_data' => [
						'fixed' => 10,
						'percentage' => 0,
					],
                ],
            ],
        ];
    }

    /**
     * Testing we can get charge of payment method.
     *
     * @dataProvider charge_data_provider
     *
     * @return void
     */
    public function test_if_we_can_get_withdraw_charge_of_a_method( $input, $expected ) {
        $this->save_withdraw_data_to_database();

        $user = $this->factory()->user->create(
            [
                'role' => 'seller',
            ]
        );

        wp_set_current_user( $user );

        $endpoint = '/' . $this->namespace . '/charge';
        $request = new \WP_REST_Request( 'GET', $endpoint );
        $request->set_query_params(
            [
                'method' => $input['method'],
                'amount' => $input['amount'],
            ]
        );

        $response = $this->server->dispatch( $request );
        $data     = $response->get_data();

        $this->assertArrayNotHasKey( 'code', $data );

        $this->assertArrayHasKey( 'charge', $data );
        $this->assertEquals( $expected['charge'], $data['charge'] );

        $this->assertArrayHasKey( 'receivable', $data );
        $this->assertEquals( $expected['receivable'], $data['receivable'] );

        $this->assertArrayHasKey( 'charge_data', $data );
        $this->assertEquals( $expected['charge_data'], $data['charge_data'] );
    }
}
