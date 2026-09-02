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
     * No REST server or seeded vendors are needed here.
     *
     * @var bool
     */
    protected $is_unit_test = true;

    /**
     * Set the "Show Register as a Vendor in Sign Up Page" appearance toggle.
     *
     * @param string|null $value Either `on`, `off`, or null to leave the setting unsaved.
     *
     * @return void
     */
    private function set_vendor_signup_toggle( $value ) {
        if ( null === $value ) {
            delete_option( 'dokan_appearance' );

            return;
        }

        update_option( 'dokan_appearance', [ 'show_register_as_vendor' => $value ] );
    }

    public static function toggle_provider(): array {
        return [
            'toggle on'      => [ 'on', [ 'customer', 'seller' ] ],
            'toggle off'     => [ 'off', [ 'customer' ] ],
            'never saved'    => [ null, [ 'customer', 'seller' ] ],
        ];
    }

    /**
     * @dataProvider toggle_provider
     */
    public function test_allowed_roles_follow_the_toggle( $toggle, $expected ) {
        $this->set_vendor_signup_toggle( $toggle );

        $this->assertSame( $expected, dokan()->registration->get_allowed_registration_roles() );
    }

    public function test_dedicated_vendor_form_keeps_the_vendor_role_while_the_toggle_is_off() {
        $this->set_vendor_signup_toggle( 'off' );

        $_POST[ Registration::VENDOR_FORM_NONCE_FIELD ] = wp_create_nonce( Registration::VENDOR_FORM_NONCE_ACTION );

        $this->assertSame( [ 'customer', 'seller' ], dokan()->registration->get_allowed_registration_roles() );
    }

    public function test_a_forged_vendor_form_marker_does_not_reopen_the_vendor_role() {
        $this->set_vendor_signup_toggle( 'off' );

        $_POST[ Registration::VENDOR_FORM_NONCE_FIELD ] = 'not-a-real-nonce';

        $this->assertSame( [ 'customer' ], dokan()->registration->get_allowed_registration_roles() );
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

        $this->assertContains( 'seller', dokan()->registration->get_allowed_registration_roles() );
    }

    public function test_the_dedicated_vendor_form_prints_the_marker() {
        ob_start();
        dokan_get_template_part( 'account/vendor-registration', false, [ 'data' => dokan_get_seller_registration_form_data() ] );
        $form = ob_get_clean();

        $this->assertStringContainsString( Registration::VENDOR_FORM_NONCE_FIELD, $form );
    }
}
