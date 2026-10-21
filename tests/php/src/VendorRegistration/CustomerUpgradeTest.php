<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\CustomerUpgrade;
use WeDevs\Dokan\VendorRegistration\FormRenderer;
use WeDevs\Dokan\VendorRegistration\Submission;

/**
 * Covers a logged-in customer becoming a vendor from the registration block.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class CustomerUpgradeTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    /** @var CustomerUpgrade */
    protected $upgrade;

    /** @var int */
    protected $customer_id;

    public function set_up() {
        parent::set_up();

        $this->upgrade     = dokan_get_container()->get( CustomerUpgrade::class );
        $this->customer_id = $this->factory()->user->create(
            [
                'role'          => 'customer',
                'user_nicename' => 'nila',
                'first_name'    => 'Nila',
            ]
        );

        wp_set_current_user( $this->customer_id );
    }

    /**
     * Fill $_POST like the block's customer form does.
     *
     * @param array $fields     Posted fields.
     * @param array $attributes Block attributes.
     *
     * @return void
     */
    private function post_form( array $fields = [], array $attributes = [] ): void {
        $page_id = $this->factory()->post->create( [ 'post_type' => 'page' ] );
        $signed  = dokan_get_container()->get( FormRenderer::class )->sign_setup( $attributes, $page_id );

        $_POST = array_merge(
            [
                FormRenderer::CUSTOMER_SUBMIT => 'Become a Vendor',
                FormRenderer::CUSTOMER_NONCE  => wp_create_nonce( FormRenderer::CUSTOMER_SUBMIT ),
                'dokan_vreg_form'             => $page_id,
                'dokan_vreg_setup'            => $signed['payload'],
                'dokan_vreg_sig'              => $signed['signature'],
                'fname'                       => 'Nila',
                'lname'                       => 'Customer',
                'shopname'                    => 'Nila Crafts',
                'shopurl'                     => 'nila-crafts',
                'phone'                       => '01800000000',
            ],
            $fields
        );
    }

    public function test_a_customer_becomes_a_vendor_with_their_answers() {
        $this->post_form(
            [ 'dokan_vreg' => [ 'dokan_vreg_licence' => 'TL-1' ] ],
            [
                'sections' => [
                    [
                        'id'   => 'additional',
                        'rows' => [
                            [
                                'id'      => 'f1',
                                'custom'  => true,
                                'type'    => 'text',
                                'label'   => 'Licence',
                                'metaKey' => 'dokan_vreg_licence',
                            ],
                        ],
                    ],
                ],
            ]
        );

        $this->assertTrue( $this->upgrade->upgrade( wp_get_current_user() ) );

        $user = get_userdata( $this->customer_id );

        $this->assertTrue( dokan_is_user_seller( $this->customer_id ) );
        $this->assertSame( 'nila-crafts', $user->user_nicename );
        $this->assertSame( 'Nila Crafts', dokan()->vendor->get( $this->customer_id )->get_shop_name() );
        $this->assertSame( 'TL-1', get_user_meta( $this->customer_id, 'dokan_vreg_licence', true ) );
        $this->assertSame( (int) $_POST['dokan_vreg_form'], (int) get_user_meta( $this->customer_id, Submission::SIGNUP_PAGE_META, true ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput
    }

    public function test_a_taken_shop_url_is_refused_not_renamed() {
        $this->factory()->user->create(
            [
                'role'          => 'seller',
                'user_nicename' => 'taken-shop',
            ]
        );
        $this->post_form( [ 'shopurl' => 'Taken Shop' ] );

        $result = $this->upgrade->upgrade( wp_get_current_user() );

        $this->assertWPError( $result );
        $this->assertContains( 'shop-url-error', $result->get_error_codes() );
        $this->assertFalse( dokan_is_user_seller( $this->customer_id ) );
    }

    public function test_the_customers_own_nicename_is_kept() {
        $this->post_form( [ 'shopurl' => 'nila' ] );

        $this->assertTrue( $this->upgrade->upgrade( wp_get_current_user() ) );
        $this->assertSame( 'nila', get_userdata( $this->customer_id )->user_nicename );
    }

    public function test_required_fields_are_checked() {
        $this->post_form( [ 'shopname' => '' ] );

        $result = $this->upgrade->upgrade( wp_get_current_user() );

        $this->assertWPError( $result );
        $this->assertContains( 'dokan_vreg_required_shop_name', $result->get_error_codes() );
    }

    public function test_a_bad_nonce_is_refused() {
        $this->post_form( [ FormRenderer::CUSTOMER_NONCE => 'nope' ] );

        $this->assertSame( 'dokan_vreg_nonce', $this->upgrade->upgrade( wp_get_current_user() )->get_error_code() );
    }

    public function test_vendors_cannot_upgrade_again() {
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'seller' ] ) );
        $this->post_form();

        $this->assertSame( 'dokan_vreg_role', $this->upgrade->upgrade( wp_get_current_user() )->get_error_code() );
    }

    public function test_a_tampered_setup_is_refused() {
        $this->post_form( [ 'dokan_vreg_sig' => 'forged' ] );

        $this->assertSame( 'dokan_vreg_form', $this->upgrade->upgrade( wp_get_current_user() )->get_error_code() );
    }

    public function test_fields_add_ons_require_are_enforced() {
        add_filter(
            'dokan_seller_registration_required_fields',
            function ( $fields ) {
                $fields['dokan-subscription-pack'] = 'Please choose a subscription pack.';

                return $fields;
            }
        );
        $this->post_form();

        $result = $this->upgrade->upgrade( wp_get_current_user() );

        $this->assertWPError( $result );
        $this->assertContains( 'Please choose a subscription pack.', $result->get_error_messages() );

        $this->post_form( [ 'dokan-subscription-pack' => '12' ] );

        $this->assertTrue( $this->upgrade->upgrade( wp_get_current_user() ) );
    }

    public function test_a_shop_url_that_sanitizes_to_nothing_is_refused() {
        $this->post_form( [ 'shopurl' => '!!!' ] );

        $result = $this->upgrade->upgrade( wp_get_current_user() );

        $this->assertWPError( $result );
        $this->assertContains( 'Please enter a valid shop URL.', $result->get_error_messages() );
    }

    public function test_the_spam_trap_is_checked() {
        $this->post_form( [ 'email_2' => 'bot@example.test' ] );

        $this->assertSame( 'dokan_vreg_spam', $this->upgrade->upgrade( wp_get_current_user() )->get_error_code() );
    }

    public function test_privileged_users_are_refused_even_with_a_customer_role() {
        $user_id = $this->factory()->user->create( [ 'role' => 'editor' ] );
        $user    = get_userdata( $user_id );
        $user->add_role( 'customer' );
        wp_set_current_user( $user_id );
        $this->post_form();

        $this->assertSame( 'dokan_vreg_role', $this->upgrade->upgrade( wp_get_current_user() )->get_error_code() );
        $this->assertContains( 'editor', get_userdata( $user_id )->roles );
    }

    public function test_authors_keep_their_role() {
        $user_id = $this->factory()->user->create( [ 'role' => 'author' ] );
        wp_set_current_user( $user_id );
        $this->post_form();

        $this->assertSame( 'dokan_vreg_role', $this->upgrade->upgrade( wp_get_current_user() )->get_error_code() );
        $this->assertSame( [ 'author' ], get_userdata( $user_id )->roles );
    }

    public function test_a_subscriber_can_become_a_vendor() {
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );
        $this->post_form();

        $this->assertTrue( $this->upgrade->upgrade( wp_get_current_user() ) );
        $this->assertTrue( dokan_is_user_seller( get_current_user_id() ) );
    }

    public function test_an_unsigned_form_is_refused() {
        $this->post_form();
        unset( $_POST['dokan_vreg_setup'], $_POST['dokan_vreg_sig'] );

        $this->assertSame( 'dokan_vreg_form', $this->upgrade->upgrade( wp_get_current_user() )->get_error_code() );
    }
}
