<?php

namespace WeDevs\Dokan\Test\Admin;

use WeDevs\Dokan\Admin\Dashboard\LegacySwitcher;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Admin links open the screen (classic or new) the site uses.
 *
 * @group dokan-admin-dashboard
 *
 * @covers \WeDevs\Dokan\Admin\Dashboard\LegacySwitcher::is_legacy_page
 * @covers \WeDevs\Dokan\Admin\Dashboard\LegacySwitcher::get_admin_page_url
 * @covers ::dokan_get_admin_page_url
 */
class AdminPageUrlTest extends DokanTestCase {

    public function tear_down() {
        delete_option( LegacySwitcher::NEW_SETTINGS_OPTION );
        delete_transient( 'dokan_legacy_withdraw_page' );
        delete_transient( 'dokan_legacy_dashboard_page' );
        delete_transient( 'dokan_legacy_settings_page' );

        parent::tear_down();
    }

    public function test_settings_link_opens_classic_screen_by_default() {
        $this->assertSame( admin_url( 'admin.php?page=dokan#/settings' ), dokan_get_admin_page_url( 'settings' ) );
    }

    public function test_settings_link_opens_new_screen_after_opt_in() {
        update_option( LegacySwitcher::NEW_SETTINGS_OPTION, 'yes' );

        $this->assertSame( admin_url( 'admin.php?page=dokan-dashboard#/settings' ), dokan_get_admin_page_url( 'settings' ) );
    }

    public function test_settings_link_ignores_the_old_settings_transient() {
        update_option( LegacySwitcher::NEW_SETTINGS_OPTION, 'yes' );
        set_transient( 'dokan_legacy_settings_page', true );

        $this->assertSame( admin_url( 'admin.php?page=dokan-dashboard#/settings' ), dokan_get_admin_page_url( 'settings' ) );
    }

    public function test_page_link_follows_its_own_switch() {
        $this->assertSame( admin_url( 'admin.php?page=dokan-dashboard#/withdraw' ), dokan_get_admin_page_url( 'withdraw' ) );

        set_transient( 'dokan_legacy_withdraw_page', true );

        $this->assertSame( admin_url( 'admin.php?page=dokan#/withdraw' ), dokan_get_admin_page_url( 'withdraw' ) );
    }

    public function test_route_query_and_subpath_keep_the_page_key() {
        set_transient( 'dokan_legacy_withdraw_page', true );
        update_option( LegacySwitcher::NEW_SETTINGS_OPTION, 'yes' );

        $this->assertSame( admin_url( 'admin.php?page=dokan#/withdraw?status=pending' ), dokan_get_admin_page_url( 'withdraw?status=pending' ) );
        $this->assertSame( admin_url( 'admin.php?page=dokan-dashboard#/settings/verification' ), dokan_get_admin_page_url( 'settings/verification' ) );
    }

    public function test_empty_route_follows_the_dashboard_switch() {
        $this->assertSame( admin_url( 'admin.php?page=dokan-dashboard#/' ), dokan_get_admin_page_url() );

        set_transient( 'dokan_legacy_dashboard_page', true );

        $this->assertSame( admin_url( 'admin.php?page=dokan#/' ), dokan_get_admin_page_url() );
    }
}
