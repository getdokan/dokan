<?php
namespace WeDevs\Dokan\Test\Admin\Settings;

use WeDevs\Dokan\Admin\Settings as LegacyAdminSettingsController;
use WeDevs\Dokan\Admin\Settings\Pages\GeneralPage;
use WeDevs\Dokan\Admin\Settings\SettingsMapper;
use WeDevs\Dokan\Admin\Settings\Settings as NewAdminSettingsManager;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 */
class AdminSettingsBridgingTest extends DokanTestCase {

    private $pages_filter_cb;

    protected function setUp(): void {
        parent::setUp();
        $this->is_unit_test = true;

        // Ensure the General page is available to the new Settings manager during tests.
        $this->pages_filter_cb = function ( $pages ) {
            $pages[] = dokan_get_container()->get( GeneralPage::class );
            return $pages;
        };
        add_filter( 'dokan_admin_settings_pages', $this->pages_filter_cb, 10, 1 );

        // Hard reset both new and legacy storage for a clean slate.
        delete_option( 'dokan_settings_general' );
        delete_option( 'dokan_general' );
    }

    protected function tearDown(): void {
        remove_filter( 'dokan_admin_settings_pages', $this->pages_filter_cb, 10 );
        parent::tearDown();
    }

    private function call_protected( $object, string $method, array $args = [] ) {
        $ref = new ReflectionClass( $object );
        $m = $ref->getMethod( $method );
        $m->setAccessible( true );
        return $m->invokeArgs( $object, $args );
    }

    public function test_legacy_values_populate_new_storage_when_blank_and_then_new_is_preferred(): void {
        // 1) Seed legacy option only
        update_option( 'dokan_general', [ 'custom_store_url' => 'legacy-store' ] );

        // 2) Run the population routine
        $admin = new LegacyAdminSettingsController();
        $this->call_protected( $admin, 'ensure_new_settings_populated_from_legacy' );

        // 3) Verify new storage has been populated from legacy
        $stored = get_option( 'dokan_settings_general', [] );
        $new_path = 'general.marketplace.marketplace_settings.vendor_store_url';
        $this->assertSame( 'legacy-store', SettingsMapper::get_value_by_path( $stored, $new_path, null ) );

        // 4) Change legacy to something else and prefill a different new value
        update_option( 'dokan_general', [ 'custom_store_url' => 'legacy-changed' ] );

        SettingsMapper::set_value_by_path( $stored, $new_path, 'new-store' );
        update_option( 'dokan_settings_general', $stored );

        // 5) Run the population routine again; existing new value should not be overridden
        $this->call_protected( $admin, 'ensure_new_settings_populated_from_legacy' );

        $stored_after = get_option( 'dokan_settings_general', [] );
        $this->assertSame( 'new-store', SettingsMapper::get_value_by_path( $stored_after, $new_path, null ) );
    }

    public function test_get_legacy_values_from_new_converts_back_to_legacy_format(): void {
        // Prepare new storage directly with a known value
        $new_data = [];
        $path = 'general.marketplace.marketplace_settings.vendor_store_url';
        SettingsMapper::set_value_by_path( $new_data, $path, 'roundtrip-store' );

        // Save via the new Settings manager to emulate real flow
        /** @var NewAdminSettingsManager $manager */
        $manager = dokan_get_container()->get( NewAdminSettingsManager::class );
        $manager->save( $new_data );

        // Convert new → legacy using the controller helper
        $admin = new LegacyAdminSettingsController();
        $legacy = $this->call_protected( $admin, 'get_legacy_values_from_new' );

        $this->assertArrayHasKey( 'dokan_general', $legacy );
        $this->assertSame( 'roundtrip-store', $legacy['dokan_general']['custom_store_url'] );
    }
}
