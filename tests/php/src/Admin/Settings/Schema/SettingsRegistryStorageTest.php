<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Tests the single-option `dokan_settings` storage model.
 *
 * Covers SettingsRegistry's populate_values() reads and the absence of
 * per-page wp_options.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-storage
 */
class SettingsRegistryStorageTest extends DokanTestCase {

    protected function setUp(): void {
        parent::setUp();
        delete_option( 'dokan_admin_settings' );
    }

    protected function tearDown(): void {
        delete_option( 'dokan_admin_settings' );
        parent::tearDown();
    }

    public function test_populate_values_reads_from_dokan_settings_by_id(): void {
        update_option(
            'dokan_admin_settings',
            [
                'vendor_store_url' => 'shop',
                'map_api_source'   => 'mapbox',
            ]
        );

        $schema = ( new SettingsRegistry() )->get_schema( true );

        $store_url_field = null;
        $map_source_field = null;
        foreach ( $schema as $el ) {
            if ( ( $el['type'] ?? '' ) !== 'field' ) {
                continue;
            }
            if ( ( $el['id'] ?? '' ) === 'vendor_store_url' ) {
                $store_url_field = $el;
            }
            if ( ( $el['id'] ?? '' ) === 'map_api_source' ) {
                $map_source_field = $el;
            }
        }

        $this->assertNotNull( $store_url_field, 'Field vendor_store_url must exist in the schema.' );
        $this->assertSame( 'shop', $store_url_field['value'], 'vendor_store_url value must come from dokan_settings.' );

        $this->assertNotNull( $map_source_field, 'Field map_api_source must exist in the schema.' );
        $this->assertSame( 'mapbox', $map_source_field['value'], 'map_api_source value must come from dokan_settings.' );
    }

    public function test_populate_values_falls_back_to_default_when_id_absent(): void {
        update_option( 'dokan_admin_settings', [] );

        $schema = ( new SettingsRegistry() )->get_schema( true );

        $found = null;
        foreach ( $schema as $el ) {
            if ( ( $el['type'] ?? '' ) === 'field' && ( $el['id'] ?? '' ) === 'vendor_store_url' ) {
                $found = $el;
                break;
            }
        }

        $this->assertNotNull( $found, 'vendor_store_url must exist.' );
        $this->assertSame( $found['default'] ?? '', $found['value'], 'Missing stored id must yield the field default.' );
    }

    public function test_no_per_page_wp_options_are_read(): void {
        // Seed the OLD per-page key with a value that would have been read by the previous code path.
        update_option( 'dokan_settings_general', [ 'marketplace' => [ 'marketplace_settings' => [ 'vendor_store_url' => 'OLD_VALUE' ] ] ] );
        // The new key is empty, so reads should fall back to the field default — NOT to OLD_VALUE.
        delete_option( 'dokan_admin_settings' );

        $schema = ( new SettingsRegistry() )->get_schema( true );

        $found = null;
        foreach ( $schema as $el ) {
            if ( ( $el['type'] ?? '' ) === 'field' && ( $el['id'] ?? '' ) === 'vendor_store_url' ) {
                $found = $el;
                break;
            }
        }

        $this->assertNotNull( $found );
        $this->assertNotSame( 'OLD_VALUE', $found['value'], 'Registry must no longer read from dokan_settings_general.' );

        delete_option( 'dokan_settings_general' );
    }
}
