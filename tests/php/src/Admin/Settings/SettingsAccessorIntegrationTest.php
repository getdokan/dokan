<?php

namespace WeDevs\Dokan\Test\Admin\Settings;

use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WeDevs\Dokan\Admin\Settings\SettingsAccessorInterface;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 * @group settings-accessor
 * @group integration
 */
class SettingsAccessorIntegrationTest extends DokanTestCase {

    protected function setUp(): void {
        parent::setUp();
        $repo = new SettingsRepository();
        $repo->replace( [] );
        delete_option( 'dokan_general' );
        // The shared SettingsRegistry caches its processed schema. Force a
        // rebuild so each test sees the storage state it just set up.
        dokan_get_container()->get( SettingsRegistry::class )->clear_cache();
    }

    protected function tearDown(): void {
        $repo = new SettingsRepository();
        $repo->replace( [] );
        delete_option( 'dokan_general' );
        dokan_get_container()->get( SettingsRegistry::class )->clear_cache();
        parent::tearDown();
    }

    public function test_dokan_settings_magic_getter_resolves_to_accessor(): void {
        $accessor = dokan()->settings;

        $this->assertInstanceOf(
            SettingsAccessorInterface::class,
            $accessor,
            'dokan()->settings must resolve to a SettingsAccessorInterface implementation.'
        );
    }

    public function test_dokan_settings_get_returns_schema_default_when_unset(): void {
        $this->assertSame( 'store', dokan()->settings->get( 'vendor_store_url_slug' ) );
    }

    public function test_dokan_settings_get_reads_new_flat_option(): void {
        $repo = new SettingsRepository();
        $repo->update( [ 'vendor_store_url_slug' => 'boutique' ] );

        $this->assertSame( 'boutique', dokan()->settings->get( 'vendor_store_url_slug' ) );
    }

    public function test_dokan_settings_get_overlays_legacy_section_value(): void {
        // Legacy storage only — new flat option is empty. The bridge overlay
        // (via SettingsRegistry::populate_values()) must surface this.
        update_option( 'dokan_general', [ 'custom_store_url' => 'shoppe' ] );

        // The legacy field 'dokan_general.custom_store_url' maps to flat id
        // 'vendor_store_url_slug' (see SettingsSchema.php:166).
        $this->assertSame(
            'shoppe',
            dokan()->settings->get( 'vendor_store_url_slug' ),
            'Accessor must reflect legacy per-section values via the bridge overlay.'
        );
    }
}
