<?php

namespace WeDevs\Dokan\Test\Admin;

use WeDevs\Dokan\Admin\UserProfile;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Saving a vendor from WP Admin → Users → Edit User keeps the vendor commission.
 *
 * @group admin
 */
class UserProfileCommissionTest extends DokanTestCase {

    /**
     * Only the profile save handler is exercised; no REST server needed.
     *
     * @var bool
     */
    protected $is_unit_test = true;

    public function tear_down() {
        $_POST = [];

        parent::tear_down();
    }

    public function test_saving_user_profile_keeps_vendor_commission() {
        // save_meta_fields() is gated on manage_woocommerce, so run as an admin.
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

        $vendor_id = $this->factory()->seller->create();

        dokan()->vendor->get( $vendor_id )->save_commission_settings(
            [
                'type'       => 'fixed',
                'percentage' => '25',
                'flat'       => '',
            ]
        );

        // The Edit User form renders no commission inputs, so none are posted.
        $_POST = [
            'dokan_update_user_profile_info_nonce' => wp_create_nonce( 'dokan_update_user_profile_info' ),
            'dokan_enable_selling'                 => dokan_is_seller_enabled( $vendor_id ) ? 'yes' : 'no',
        ];

        ( new UserProfile() )->save_meta_fields( $vendor_id );

        $settings = dokan()->vendor->get( $vendor_id )->get_commission_settings();

        $this->assertSame( 'fixed', $settings->get_type() );
        $this->assertSame( '25', $settings->get_percentage() );
    }
}
