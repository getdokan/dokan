<?php

namespace WeDevs\Dokan\Test\Withdrawal;

use WeDevs\Dokan\Test\DokanTestCase;

class WithdrawChargeApiTest extends DokanTestCase {
    /**
     * The namespace of the REST route.
     *
     * @var string Dokan API Namespace
     */
    protected $rest_base = 'withdraw';

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
        $routes = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route( $this->rest_base . '/charges' );

        $this->assertArrayHasKey( $full_route, $routes );
    }

    /**
     *  Test that the endpoint exist.
     */
    public function test_if_get_method_withdraw_charge_api_exists() {
        $routes = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route( $this->rest_base . '/charge' );

        $this->assertNestedContains( [ 'methods' => [ 'GET' => true ] ], $routes[ $full_route ] );
    }

    public function test_if_we_can_get_all_withdraw_charges() {
        $this->save_withdraw_data_to_database();

        $user = $this->factory()->user->create(
            [
                'role' => 'seller',
            ]
        );

        wp_set_current_user( $user );

        $response = $this->get_request( $this->rest_base . '/charges' );

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

        $response = $this->get_request(
            $this->rest_base . '/charge', [
				'method' => $input['method'],
				'amount' => $input['amount'],
			]
        );

        $data = $response->get_data();

        $this->assertArrayNotHasKey( 'code', $data );

        $this->assertArrayHasKey( 'charge', $data );
        $this->assertEquals( $expected['charge'], $data['charge'] );

        $this->assertArrayHasKey( 'receivable', $data );
        $this->assertEquals( $expected['receivable'], $data['receivable'] );

        $this->assertArrayHasKey( 'charge_data', $data );
        $this->assertEquals( $expected['charge_data'], $data['charge_data'] );
    }
}
