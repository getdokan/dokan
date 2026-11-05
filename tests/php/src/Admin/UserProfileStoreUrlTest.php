<?php

namespace WeDevs\Dokan\Test\Admin;

use WeDevs\Dokan\Admin\UserProfile;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Error;

/**
 * Covers the store URL check on WP Admin → Users → Edit User.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class UserProfileStoreUrlTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    /**
     * Post the Dokan profile fields for a vendor as an administrator.
     *
     * @param int    $vendor_id Vendor being edited.
     * @param string $store_url Requested store URL.
     *
     * @return void
     */
    private function post_profile_fields( int $vendor_id, string $store_url ): void {
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

        $_POST = [
            'dokan_update_user_profile_info_nonce' => wp_create_nonce( 'dokan_update_user_profile_info' ),
            'dokan_enable_selling'                 => 'yes',
            'dokan_store_name'                     => 'Edited Shop',
            'dokan_store_url'                      => $store_url,
        ];
    }

    public function test_a_taken_store_url_is_reported_and_not_saved() {
        $this->factory()->user->create(
            [
                'role'          => 'seller',
                'user_nicename' => 'taken-shop',
            ]
        );
        $vendor_id = $this->factory()->user->create(
            [
                'role'          => 'seller',
                'user_nicename' => 'other-shop',
            ]
        );
        $this->post_profile_fields( $vendor_id, 'Taken Shop' );

        $profile = new UserProfile();
        $errors  = new WP_Error();
        $user    = (object) [ 'ID' => $vendor_id ];

        $profile->validate_store_url( $errors, true, $user );
        $profile->save_meta_fields( $vendor_id );

        $this->assertSame( [ 'Shop URL is not available' ], $errors->get_error_messages() );
        $this->assertSame( 'other-shop', get_userdata( $vendor_id )->user_nicename );
    }

    public function test_a_free_store_url_is_saved_normalized_without_errors() {
        $vendor_id = $this->factory()->user->create(
            [
                'role'          => 'seller',
                'user_nicename' => 'other-shop',
            ]
        );
        $this->post_profile_fields( $vendor_id, 'My New Shop' );

        $profile = new UserProfile();
        $errors  = new WP_Error();
        $user    = (object) [ 'ID' => $vendor_id ];

        $profile->validate_store_url( $errors, true, $user );
        $profile->save_meta_fields( $vendor_id );

        $this->assertFalse( $errors->has_errors() );
        $this->assertSame( 'my-new-shop', get_userdata( $vendor_id )->user_nicename );
    }

    public function test_the_vendor_may_keep_their_own_store_url() {
        $vendor_id = $this->factory()->user->create(
            [
                'role'          => 'seller',
                'user_nicename' => 'other-shop',
            ]
        );
        $this->post_profile_fields( $vendor_id, 'other-shop' );

        $errors = new WP_Error();
        ( new UserProfile() )->validate_store_url( $errors, true, (object) [ 'ID' => $vendor_id ] );

        $this->assertFalse( $errors->has_errors() );
    }
}
