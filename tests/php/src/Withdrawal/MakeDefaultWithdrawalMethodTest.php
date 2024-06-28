<?php

namespace WeDevs\Dokan\Test\Withdrawal;

use WeDevs\Dokan\Test\DokanAjaxUnitTestCase;
use WeDevs\Dokan\Withdraw\Hooks;
use WPAjaxDieContinueException;

class MakeDefaultWithdrawalMethodTest extends DokanAjaxUnitTestCase {

    public function setUp(): void {
        parent::setUp();

        // Add the AJAX handler
        add_action( 'wp_ajax_dokan_withdraw_handle_make_default_method', [ new Hooks(), 'ajax_handle_make_default_method' ] );
    }

    /**
     * Test that we can remove the schedule from user.
     *
     * @test
     */
    public function test_that_we_can_remove_withdraw_schedule() {
        // Create a seller user
        $user = $this->factory()->seller->create();

        // Set the current user to the created seller
        wp_set_current_user( $user );

        // Set up POST variables
        $_POST['nonce']  = wp_create_nonce( 'dokan_withdraw_make_default' );
        $_POST['action'] = 'dokan_withdraw_handle_make_default_method';
        $_POST['method'] = 'paypal';

        // Handle the AJAX request
        try {
            $this->_handleAjax( 'dokan_withdraw_handle_make_default_method' );
        } catch ( WPAjaxDieContinueException $e ) {
            // Catch the die() statement in AJAX handling
        }
        wp_set_current_user( $user );

        // Get the last response
        $response = $this->_last_response;

        if ( empty( $response ) ) {
            $this->fail( 'No response from AJAX handler' );
        }

        // Decode the JSON response
        $data = json_decode( $response, true );

        if ( json_last_error() !== JSON_ERROR_NONE ) {
            $this->fail( 'Invalid JSON response: ' . json_last_error_msg() );
        }

        // Assert that the response is not empty
        $this->assertNotEmpty( $response, 'The response should not be empty' );

        // Assert that the response indicates success
        $this->assertTrue( isset( $data['success'] ) && $data['success'], 'The success key should be true' );

        // Assert that the response message is correct
        $this->assertEquals( 'Default method update successful.', $data['data'], 'The response message should match' );
    }
}
