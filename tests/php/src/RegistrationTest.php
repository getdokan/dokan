<?php

namespace WeDevs\Dokan\Test;

use WeDevs\Dokan\Registration;

/**
 * Covers which roles a sign-up request is allowed to ask for.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class RegistrationTest extends DokanTestCase {

    /**
     * @var Registration
     */
    private $registration;

    public function set_up() {
        parent::set_up();

        $this->registration = new Registration();
    }

    public function tear_down() {
        unset( $_POST[ Registration::VENDOR_FORM_NONCE_FIELD ] );

        parent::tear_down();
    }

    /**
     * Set the "Show Register as a Vendor in Sign Up Page" appearance toggle.
     *
     * @param string $value Either `on` or `off`.
     *
     * @return void
     */
    private function set_vendor_signup_toggle( $value ) {
        $appearance = (array) get_option( 'dokan_appearance', [] );

        $appearance['show_register_as_vendor'] = $value;

        update_option( 'dokan_appearance', $appearance );
    }

    /**
     * Put a genuine vendor form marker on the request.
     *
     * @return void
     */
    private function stamp_vendor_form_request() {
        $_POST[ Registration::VENDOR_FORM_NONCE_FIELD ] = wp_create_nonce( Registration::VENDOR_FORM_NONCE_ACTION );
    }

    public function test_vendor_role_is_offered_while_the_toggle_is_on() {
        $this->set_vendor_signup_toggle( 'on' );

        $this->assertSame( [ 'customer', 'seller' ], $this->registration->get_allowed_registration_roles() );
    }

    public function test_vendor_role_is_withheld_while_the_toggle_is_off() {
        $this->set_vendor_signup_toggle( 'off' );

        $this->assertSame( [ 'customer' ], $this->registration->get_allowed_registration_roles() );
    }

    public function test_vendor_role_is_offered_by_default() {
        delete_option( 'dokan_appearance' );

        $this->assertSame( [ 'customer', 'seller' ], $this->registration->get_allowed_registration_roles() );
    }

    public function test_dedicated_vendor_form_keeps_the_vendor_role_while_the_toggle_is_off() {
        $this->set_vendor_signup_toggle( 'off' );
        $this->stamp_vendor_form_request();

        $this->assertSame( [ 'customer', 'seller' ], $this->registration->get_allowed_registration_roles() );
    }

    public function test_a_forged_vendor_form_marker_does_not_reopen_the_vendor_role() {
        $this->set_vendor_signup_toggle( 'off' );

        $_POST[ Registration::VENDOR_FORM_NONCE_FIELD ] = 'not-a-real-nonce';

        $this->assertSame( [ 'customer' ], $this->registration->get_allowed_registration_roles() );
    }

    public function test_the_filter_can_reopen_the_vendor_role() {
        $this->set_vendor_signup_toggle( 'off' );

        add_filter(
            'dokan_register_user_role',
            function ( $roles ) {
                $roles[] = 'seller';

                return $roles;
            }
        );

        $this->assertContains( 'seller', $this->registration->get_allowed_registration_roles() );
    }

    public function test_the_vendor_form_marker_is_printed_for_the_dedicated_form() {
        ob_start();
        do_action( 'dokan_vendor_reg_form_start' );
        $output = ob_get_clean();

        $this->assertStringContainsString( Registration::VENDOR_FORM_NONCE_FIELD, $output );
    }
}
