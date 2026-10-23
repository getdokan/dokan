<?php

namespace WeDevs\Dokan\Test\Abilities\Mcp;

use WeDevs\Dokan\Core;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 * @group mcp
 *
 * Vendors are kept out of wp-admin, except for WordPress' application-password approval screen
 * while they may connect an assistant.
 */
class VendorApprovalScreenTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();

        remove_all_filters( 'dokan_mcp_enabled' );
        remove_all_filters( 'dokan_mcp_vendor_access_enabled' );

        // The block ends in exit; turn the redirect into something a test can catch.
        add_filter(
            'wp_redirect',
            static function () {
                throw new \RuntimeException( 'redirected' );
            }
        );
    }

    /**
     * Run the admin-area block as the given user on the given admin page.
     *
     * @param int    $user_id Acting user.
     * @param string $page    `$pagenow`.
     *
     * @return string '' when the page was allowed, else where it redirected.
     */
    private function block_result( int $user_id, string $page ): string {
        global $pagenow, $current_user;

        wp_set_current_user( $user_id );
        $current_user = wp_get_current_user(); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
        $pagenow      = $page; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

        try {
            ( new Core() )->block_admin_access();
        } catch ( \RuntimeException $e ) {
            return $e->getMessage();
        }

        return '';
    }

    public function test_a_vendor_may_open_the_approval_screen_only_while_vendors_may_connect() {
        $this->assertStringContainsString( 'redirected', $this->block_result( $this->seller_id1, 'authorize-application.php' ) );

        add_filter( 'dokan_mcp_enabled', '__return_true' );

        $this->assertStringContainsString( 'redirected', $this->block_result( $this->seller_id1, 'authorize-application.php' ) );

        add_filter( 'dokan_mcp_vendor_access_enabled', '__return_true' );

        $this->assertSame( '', $this->block_result( $this->seller_id1, 'authorize-application.php' ) );

        // The rest of wp-admin stays closed, and a customer gets nothing from the switches.
        $this->assertStringContainsString( 'redirected', $this->block_result( $this->seller_id1, 'profile.php' ) );
        $this->assertStringContainsString( 'redirected', $this->block_result( $this->customer_id, 'authorize-application.php' ) );

        // Neither does a vendor whose selling was switched off.
        dokan()->vendor->get( $this->seller_id1 )->make_inactive();
        $this->assertStringContainsString( 'redirected', $this->block_result( $this->seller_id1, 'authorize-application.php' ) );
    }
}
