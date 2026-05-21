<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WeDevs\Dokan\Admin\Settings\SettingsAccessor;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Regression: SettingsRegistry must invalidate its processed-schema cache
 * when the underlying storage changes within a single request, so
 * dokan()->settings->get() never returns stale values after a write.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-cache
 */
class SettingsRegistryCacheInvalidationTest extends DokanTestCase {

    protected function setUp(): void {
        parent::setUp();
        delete_option( 'dokan_admin_settings' );
        delete_option( 'dokan_general' );
    }

    protected function tearDown(): void {
        delete_option( 'dokan_admin_settings' );
        delete_option( 'dokan_general' );
        parent::tearDown();
    }

    public function test_cache_invalidates_when_new_flat_option_is_updated(): void {
        $registry = new SettingsRegistry();
        $accessor = new SettingsAccessor( $registry );

        // Prime the cache with the schema default.
        $this->assertSame( 'store', $accessor->get( 'vendor_store_url_slug' ) );

        // Write through the canonical repository.
        ( new SettingsRepository() )->update( [ 'vendor_store_url_slug' => 'boutique' ] );

        // Without invalidation hooks, this would still return the cached 'store'.
        $this->assertSame( 'boutique', $accessor->get( 'vendor_store_url_slug' ) );
    }

    public function test_cache_invalidates_when_legacy_section_is_updated(): void {
        $registry = new SettingsRegistry();
        $accessor = new SettingsAccessor( $registry );

        // Prime the cache.
        $this->assertSame( 'store', $accessor->get( 'vendor_store_url_slug' ) );

        // Write the legacy field that maps to vendor_store_url_slug
        // (legacy_key: dokan_general.custom_store_url).
        update_option( 'dokan_general', [ 'custom_store_url' => 'shoppe' ] );

        // The bridge overlay should pick up the legacy write on the next read.
        $this->assertSame( 'shoppe', $accessor->get( 'vendor_store_url_slug' ) );
    }

    public function test_cache_invalidates_when_new_flat_option_is_added(): void {
        // Ensure the option doesn't exist so add_option fires (not update_option).
        delete_option( SettingsRepository::OPTION_KEY );

        $registry = new SettingsRegistry();
        $accessor = new SettingsAccessor( $registry );

        $this->assertSame( 'store', $accessor->get( 'vendor_store_url_slug' ) );

        add_option( SettingsRepository::OPTION_KEY, [ 'vendor_store_url_slug' => 'emporium' ] );

        $this->assertSame( 'emporium', $accessor->get( 'vendor_store_url_slug' ) );
    }
}
