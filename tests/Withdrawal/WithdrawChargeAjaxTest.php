<?php

class WithdrawChargeAjaxTest extends WP_Ajax_UnitTestCase {

    public function set_up() {
        parent::set_up();
        parent::set_up_before_class();

        remove_action( 'admin_init', [ dokan()->core, 'block_admin_access'], 10 );
    }

    public function test_that_we_can_request_to_calculate_and_get_withdraw_charge() {
        global $_POST;

        $user = $this->factory()->user->create(
            [
                'role' => 'seller',
            ]
        );

        wp_set_current_user( $user );

        $_POST[ 'security' ] = wp_create_nonce( '_handle_withdraw_request' );
        $_POST[ 'action' ]   = 'dokan_handle_get_withdraw_method_charge';

        try {
            $this->_handleAjax( 'dokan_handle_get_withdraw_method_charge' );
        } catch (\WPAjaxDieContinueException $e) {
            // This means that the ajax request succeeded.
        }

        $data = json_decode( $this->_last_response, true  );
        $this->assertNotEquals( '', $this->_last_response );
//        $this->assertTrue( $data['success'] );
//        $this->assertEquals( 'Withdraw schedule removed successfully.', $data['data'] );
    }
}
