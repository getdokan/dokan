<?php

namespace WeDevs\Dokan\Test\Withdrawal;

use WeDevs\Dokan\Test\DokanAjaxTestCase;
use WeDevs\Dokan\Withdraw\Hooks;
use WPAjaxDieContinueException;

/**
 * @group withdrawal
 * @group withdrawal-make-default-method
 */
class MakeDefaultWithdrawalMethodTest extends DokanAjaxTestCase {

    public function setUp(): void {
        parent::setUp();

        // Add the AJAX handler
        add_action( 'wp_ajax_dokan_withdraw_handle_make_default_method', [ new Hooks(), 'ajax_handle_make_default_method' ] );
    }

    /**
     * Test that we can set a default withdrawal method.
     *
     * @test
     */
    public function test_that_we_can_remove_withdraw_schedule() {
        // Create a seller user
        $user = $this->factory()->seller->create();

        // Set the current user to the created seller
        wp_set_current_user( $user );

        // Add the dokan_manage_withdraw capability to the user
        $user_obj = get_user_by( 'id', $user );
        $user_obj->add_cap( 'dokan_manage_withdraw' );

        // Set up PayPal payment method for the user
        $profile_settings = [
            'payment' => [
                'paypal' => [
                    'email' => 'test@example.com',
                ],
            ],
        ];
        update_user_meta( $user, 'dokan_profile_settings', $profile_settings );

        // Ensure PayPal is an active withdraw method in Dokan settings
        update_option(
            'dokan_withdraw', [
				'withdraw_methods' => [
					'paypal' => 'paypal',
					'bank' => 'bank',
				],
			]
        );

        // Set up POST variables
        $_POST['nonce']  = wp_create_nonce( 'dokan_withdraw_make_default' );
        $_POST['action'] = 'dokan_withdraw_handle_make_default_method';
        $_POST['method'] = 'paypal';

        // Handle the AJAX request
        try {
            $this->_handleAjax( 'dokan_withdraw_handle_make_default_method' );
        } catch ( WPAjaxDieContinueException $e ) {
            // This is expected for AJAX handlers that call wp_die()
        }

        // Get the last response
        $response = $this->_last_response;

        if ( empty( $response ) ) {
            $this->fail( 'No response from AJAX handler' );
        }

        // Extract JSON from response (there might be HTML error messages before the JSON)
        $json_start = strrpos( $response, '{' );
        if ( $json_start !== false ) {
            $json_response = substr( $response, $json_start );
        } else {
            $json_response = $response;
        }

        // Decode the JSON response
        $data = json_decode( $json_response, true );

        if ( json_last_error() !== JSON_ERROR_NONE ) {
            $this->fail( 'Invalid JSON response: ' . json_last_error_msg() . '. Raw response: ' . $response );
        }

        // Assert that the response is not empty
        $this->assertNotEmpty( $response, 'The response should not be empty' );

        // Assert that the response indicates success
        $this->assertTrue( isset( $data['success'] ) && $data['success'], 'The success key should be true' );

        // Assert that the response message is correct
        $this->assertEquals( 'Default method update successful.', $data['data'], 'The response message should match' );

        // Verify that the default method was actually set
        $default_method = get_user_meta( $user, 'dokan_withdraw_default_method', true );
        $this->assertEquals( 'paypal', $default_method, 'The default withdraw method should be set to paypal' );
    }
}
