<?php
namespace WeDevs\Dokan\Test\Withdrawal;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Withdraw\Withdraw;
use WP_UnitTestCase;

class WithdrawChargeTest extends DokanTestCase {

    /**
     * Set up
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();
    }

    /**
     * Test get all charges function exists.
     *
     * @return void
     */
    public function test_get_method_charges_function_exists() {
        $this->assertIsCallable( 'dokan_withdraw_get_method_charges' );
    }

    /**
     * Test we can get all withdraw charges data.
     *
     * @return void
     */
    public function test_that_we_can_get_withdraw_charges() {
        $all_methods = dokan_withdraw_get_methods();
        $charges = dokan_withdraw_get_method_charges();

        $this->assertNotEmpty( $charges );
        $this->assertIsArray( $charges );

        foreach ( array_keys( $all_methods ) as $method ) {
            $this->assertArrayHasKey( $method, $charges );
        }
    }

    /**
     * Check all withdraw charge related methods exists in WeDevs\Dokan\Withdraw\Withdraw class
     *
     * @return void
     */
    public function test_that_all_needed_method_exists_for_wothdraw_charge() {
        $withdraw = new Withdraw();

        $this->assertTrue( method_exists( $withdraw, 'set_method' ) );
        $this->assertTrue( method_exists( $withdraw, 'set_amount' ) );
        $this->assertTrue( method_exists( $withdraw, 'set_charge' ) );
        $this->assertTrue( method_exists( $withdraw, 'set_charge_data' ) );
        $this->assertTrue( method_exists( $withdraw, 'calculate_charge' ) );
        $this->assertTrue( method_exists( $withdraw, 'get_charge' ) );
    }

    /**
     * Testing for set and get charge data in WeDevs\Dokan\Withdraw\Withdraw class.
     *
     * @return void
     */
    public function test_that_we_can_set_and_get_charge_data() {
        $withdraw = new Withdraw();

        $charge_data = [
            'fixed' => 0,
            'percentage' => 10,
        ];

        $withdraw->set_charge_data( $charge_data );

        $this->assertEquals( $charge_data, $withdraw->get_charge_data() );
    }

    /**
     * Withdraw charge data provider.
     *
     * @return array[]
     */
    public function charge_data_provider() {
        return [
            [
                [
                    'amount' => 100,
                    'method' => 'paypal',
                    'charge_data' => [
                        'fixed' => 10,
                        'percentage' => 10,
                    ],
                ],
                20,
            ],
            [
                [
                    'amount' => 200,
                    'method' => 'skrill',
                    'charge_data' => [
                        'fixed' => '',
                        'percentage' => 20,
                    ],
                ],
                40,
            ],
            [
                [
                    'amount' => 1250,
                    'method' => 'dokan_custom',
                    'charge_data' => [
                        'fixed' => 5,
                        'percentage' => 32,
                    ],
                ],
                405,
            ],
            [
                [
                    'amount' => 1250,
                    'method' => 'stripe',
                    'charge_data' => [
                        'fixed' => 50,
                        'percentage' => '',
                    ],
                ],
                50,
            ],
        ];
    }

    /**
     * Test withdraw charge.
     *
     * @dataProvider charge_data_provider
     */
    public function test_that_we_can_calculate_and_get_withdraw_charge_receivable( $input, $expected ) {
        $withdraw = new Withdraw();
        $amount = $input['amount'];
        $method = $input['method'];
        $charge_data = $input['charge_data'];

        $withdraw->set_amount( $amount )->set_method( $method )->set_charge_data( $charge_data )->calculate_charge();

        $this->assertEquals( $expected, $withdraw->get_charge(), 'Charge is' . $withdraw->get_charge() );
        $this->assertEquals( $amount - $expected, $amount - $withdraw->get_charge() );
    }
}
