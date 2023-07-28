<?php

class WithdrawChargeTest extends WP_UnitTestCase {

    public function set_up() {
        parent::set_up();
    }

    public function test_get_method_charges_function_exists() {
        $this->assertIsCallable( 'dokan_withdraw_get_method_charges' );
    }

    public function test_that_we_can_get_withdraw_charges() {
        $all_methods = dokan_withdraw_get_methods();
        $charges = dokan_withdraw_get_method_charges();

        $this->assertNotEmpty( $charges );
        $this->assertIsArray( $charges );

        foreach ( array_keys( $all_methods ) as $method ) {
            $this->assertArrayHasKey( $method, $charges );
        }
    }
}
