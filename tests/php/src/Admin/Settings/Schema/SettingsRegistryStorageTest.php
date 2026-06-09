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
                'vendor_store_url_slug' => 'shop',
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
            if ( ( $el['id'] ?? '' ) === 'vendor_store_url_slug' ) {
                $store_url_field = $el;
            }
            if ( ( $el['id'] ?? '' ) === 'map_api_source' ) {
                $map_source_field = $el;
            }
        }

        $this->assertNotNull( $store_url_field, 'Field vendor_store_url_slug must exist in the schema.' );
        $this->assertSame( 'shop', $store_url_field['value'], 'vendor_store_url_slug value must come from dokan_settings.' );

        $this->assertNotNull( $map_source_field, 'Field map_api_source must exist in the schema.' );
        $this->assertSame( 'mapbox', $map_source_field['value'], 'map_api_source value must come from dokan_settings.' );
    }

    /**
     * DB-backed option lists (page selects) must be lazy on the raw schema —
     * a closure, so the front-end legacy bridge never triggers the page query
     * when it harvests SettingsSchema — and resolved to a concrete array by
     * SettingsRegistry for the admin/REST consumer.
     *
     * @group settings-perf
     */
    public function test_dynamic_page_options_are_lazy_raw_and_resolved_by_registry(): void {
        // Raw schema: the page-backed select carries a closure, not an array.
        $raw       = \WeDevs\Dokan\Admin\Settings\Schema\SettingsSchema::get_schema();
        $raw_field = null;
        foreach ( $raw as $el ) {
            if ( ( $el['id'] ?? '' ) === 'vendor_dashboard_page' ) {
                $raw_field = $el;
                break;
            }
        }

        $this->assertNotNull( $raw_field, 'vendor_dashboard_page field must exist in the raw schema.' );
        $this->assertArrayHasKey( 'options', $raw_field );
        $this->assertInstanceOf(
            \Closure::class,
            $raw_field['options'],
            'Page options must be lazy (a closure) on the raw schema so the bridge skips the query.'
        );

        // Registry output: the same field exposes a resolved array, no closure.
        $resolved       = ( new SettingsRegistry() )->get_schema( true );
        $resolved_field = null;
        foreach ( $resolved as $el ) {
            if ( ( $el['id'] ?? '' ) === 'vendor_dashboard_page' ) {
                $resolved_field = $el;
                break;
            }
        }

        $this->assertNotNull( $resolved_field, 'vendor_dashboard_page field must exist in the registry schema.' );
        $this->assertIsArray(
            $resolved_field['options'],
            'SettingsRegistry must resolve lazy page options to an array.'
        );
    }

    public function test_populate_values_falls_back_to_default_when_id_absent(): void {
        update_option( 'dokan_admin_settings', [] );

        $schema = ( new SettingsRegistry() )->get_schema( true );

        $found = null;
        foreach ( $schema as $el ) {
            if ( ( $el['type'] ?? '' ) === 'field' && ( $el['id'] ?? '' ) === 'vendor_store_url_slug' ) {
                $found = $el;
                break;
            }
        }

        $this->assertNotNull( $found, 'vendor_store_url_slug must exist.' );
        $this->assertSame( $found['default'] ?? '', $found['value'], 'Missing stored id must yield the field default.' );
    }

    public function test_no_per_page_wp_options_are_read(): void {
        // Seed the OLD per-page key with a value that would have been read by the previous code path.
        update_option( 'dokan_settings_general', [ 'marketplace' => [ 'marketplace_settings' => [ 'vendor_store_url_slug' => 'OLD_VALUE' ] ] ] );
        // The new key is empty, so reads should fall back to the field default — NOT to OLD_VALUE.
        delete_option( 'dokan_admin_settings' );

        $schema = ( new SettingsRegistry() )->get_schema( true );

        $found = null;
        foreach ( $schema as $el ) {
            if ( ( $el['type'] ?? '' ) === 'field' && ( $el['id'] ?? '' ) === 'vendor_store_url_slug' ) {
                $found = $el;
                break;
            }
        }

        $this->assertNotNull( $found );
        $this->assertNotSame( 'OLD_VALUE', $found['value'], 'Registry must no longer read from dokan_settings_general.' );

        delete_option( 'dokan_settings_general' );
    }
}
