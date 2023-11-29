<?php

namespace Withdrawal;


use WeDevs\Dokan\Withdraw\Hooks;

class MakeDefaultWithdrawalMethodTest extends \WP_Ajax_UnitTestCase {

    public function setUp(): void {
        parent::set_up();

        remove_action( 'admin_init', '_maybe_update_core' );
        remove_action( 'admin_init', '_maybe_update_plugins' );
        remove_action( 'admin_init', '_maybe_update_themes' );
        remove_action( 'admin_init', [ dokan()->core, 'block_admin_access'], 10 );

        remove_action( 'admin_init', [ \WC_Tracks_Client::class, 'maybe_set_identity_cookie' ] );
        add_action( 'wp_ajax_dokan_withdraw_handle_make_default_method', [ new Hooks(), 'ajax_handle_make_default_method' ] );
    }

    /**
     * Test that we can remove the schedule from user.
     *
     * @test
     */
    public function test_that_we_can_remove_withdraw_schedule() {
        global $_POST;

        $user = $this->factory()->user->create(
            [
                'role' => 'seller',
            ]
        );

        wp_set_current_user( $user );

        $_POST[ 'nonce' ]  = wp_create_nonce( 'dokan_withdraw_make_default' );
        $_POST[ 'action' ] = 'dokan_withdraw_handle_make_default_method';
        $_POST[ 'method' ] = 'paypal';

        try {
            $this->_handleAjax( 'dokan_withdraw_handle_make_default_method' );
        } catch (\WPAjaxDieContinueException $e) {
            // This means that the ajax request succeeded.
        }

        $data = json_decode( $this->_last_response, true  );

        $this->assertNotEquals( '', $this->_last_response );
        $this->assertTrue( $data['success'] );
        $this->assertEquals( 'Default method update successful.', $data['data'] );
    }

}
