<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Admin\UserList;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * A subsite admin must not enable selling for users outside their own site (getdokan/dokan-pro#6284).
 *
 * @since DOKAN_SINCE
 *
 * @group ms-required
 * @group dokan-vendor
 * @group dokan-authorization
 * @group security
 *
 * @covers \WeDevs\Dokan\Utilities\VendorUtil::current_user_can_manage_vendor
 * @covers \WeDevs\Dokan\REST\StoreController::update_vendor_status
 * @covers \WeDevs\Dokan\REST\StoreController::batch_update
 * @covers \WeDevs\Dokan\Admin\UserList::handle_bulk_actions
 */
class VendorStatusMultisiteScopeTest extends DokanTestCase {

    /**
     * Pending vendor who is only a member of another site.
     *
     * @var int
     */
    protected int $outsider_id;

    /**
     * Super admin who also holds the vendor capability here.
     *
     * @var int
     */
    protected int $super_admin_id;

    public function set_up() {
        parent::set_up();

        if ( ! is_multisite() ) {
            $this->markTestSkipped( 'Multisite only; run with WP_MULTISITE=1.' );
        }

        $other_site = self::factory()->blog->create();

        $this->outsider_id = self::factory()->user->create();
        remove_user_from_blog( $this->outsider_id, get_current_blog_id() );
        add_user_to_blog( $other_site, $this->outsider_id, 'seller' );
        update_user_meta( $this->outsider_id, 'dokan_enable_selling', 'no' );

        $this->super_admin_id = self::factory()->user->create( [ 'role' => 'seller' ] );
        grant_super_admin( $this->super_admin_id );
        update_user_meta( $this->super_admin_id, 'dokan_enable_selling', 'no' );

        update_user_meta( $this->seller_id1, 'dokan_enable_selling', 'no' );

        $this->assertFalse( is_super_admin( $this->admin_id ), 'The acting admin must be a plain subsite admin.' );
        $this->assertFalse( is_user_member_of_blog( $this->outsider_id ) );

        wp_set_current_user( $this->admin_id );
    }

    /**
     * @dataProvider out_of_scope_targets
     */
    public function test_status_route_refuses_users_outside_the_site( string $target ) {
        $user_id = $this->{$target};

        $response = $this->put_request( 'stores/' . $user_id . '/status', [ 'status' => 'active' ] );

        $this->assertSame( 403, $response->get_status() );
        $this->assertSame( 'no', get_user_meta( $user_id, 'dokan_enable_selling', true ) );
    }

    public function out_of_scope_targets(): array {
        return [
            'member of another site' => [ 'outsider_id' ],
            'super admin'            => [ 'super_admin_id' ],
        ];
    }

    public function test_status_route_still_manages_this_sites_vendor() {
        $response = $this->put_request( 'stores/' . $this->seller_id1 . '/status', [ 'status' => 'active' ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( 'yes', get_user_meta( $this->seller_id1, 'dokan_enable_selling', true ) );
    }

    public function test_batch_route_only_approves_this_sites_vendors() {
        $response = $this->put_request( 'stores/batch', [ 'approved' => [ $this->outsider_id, $this->super_admin_id, $this->seller_id1 ] ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( [ $this->outsider_id, $this->super_admin_id ], $response->get_data()['skipped'] );
        $this->assertSame( 'no', get_user_meta( $this->outsider_id, 'dokan_enable_selling', true ) );
        $this->assertSame( 'no', get_user_meta( $this->super_admin_id, 'dokan_enable_selling', true ) );
        $this->assertSame( 'yes', get_user_meta( $this->seller_id1, 'dokan_enable_selling', true ) );
    }

    public function test_bulk_action_skips_super_admin() {
        $sendback = ( new UserList() )->handle_bulk_actions( 'users.php', 'approve_vendors', [ $this->super_admin_id, $this->seller_id1 ] );

        $this->assertStringContainsString( 'vendors_approved=1', $sendback );
        $this->assertSame( 'no', get_user_meta( $this->super_admin_id, 'dokan_enable_selling', true ) );
        $this->assertSame( 'yes', get_user_meta( $this->seller_id1, 'dokan_enable_selling', true ) );
    }

    public function test_super_admin_can_manage_any_network_user() {
        grant_super_admin( $this->admin_id );

        $response = $this->put_request( 'stores/' . $this->outsider_id . '/status', [ 'status' => 'active' ] );

        revoke_super_admin( $this->admin_id );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( 'yes', get_user_meta( $this->outsider_id, 'dokan_enable_selling', true ) );
    }
}
