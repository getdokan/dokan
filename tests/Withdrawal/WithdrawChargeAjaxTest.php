<?php

class WithdrawChargeAjaxTest extends WP_Ajax_UnitTestCase {

    public function set_up() {
        parent::set_up();

        remove_action( 'admin_init', '_maybe_update_core' );
        remove_action( 'admin_init', '_maybe_update_plugins' );
        remove_action( 'admin_init', '_maybe_update_themes' );

        remove_action( 'admin_init', [ dokan()->core, 'block_admin_access'], 10 );
        remove_action( 'admin_init', [ \WC_Tracks_Client::class, 'maybe_set_identity_cookie' ] );


        add_action( 'wp_ajax_dokan_handle_get_withdraw_method_charge', [ new \WeDevs\Dokan\Withdraw\Hooks(), 'ajax_handle_get_withdraw_method_charge' ] );
    }

    /**
     *
     * @test
     */
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


        var_dump( 'before' );
        $this->_handleAjax( 'dokan_handle_get_withdraw_method_charge' );
        var_dump( 'after' );

        $data = json_decode( $this->_last_response, true  );
        $this->assertNotEquals( '', $this->_last_response );
        $this->assertTrue( $data['success'] );
    }
}
