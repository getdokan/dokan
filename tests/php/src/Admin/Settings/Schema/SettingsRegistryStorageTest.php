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

    /**
     * The resolved page-select options must contain the site's actual pages
     * (value = ID, title = post_title) and must reflect pages created after an
     * earlier build — guarding against an un-bustable per-process options memo.
     *
     * @group settings-perf
     */
    public function test_resolved_page_options_include_pages_and_reflect_new_pages(): void {
        // A page that exists at build time must appear in the resolved options.
        $page_a    = self::factory()->post->create(
            [ 'post_type' => 'page', 'post_title' => 'Dokan Lazy Options Page A' ]
        );
        $by_value  = wp_list_pluck( $this->resolved_page_options( 'vendor_dashboard_page' ), 'title', 'value' );

        $this->assertArrayHasKey( $page_a, $by_value, 'Resolved page options must include a page that exists at build time.' );
        $this->assertSame( 'Dokan Lazy Options Page A', $by_value[ $page_a ], 'Resolved option title must match the page title.' );

        // A page created AFTER the first build must appear in a subsequent build.
        // An un-bustable static memo would serve the stale first result here;
        // WP_Query's own cache (invalidated on page creation) makes the fresh
        // build reflect it.
        $page_b   = self::factory()->post->create(
            [ 'post_type' => 'page', 'post_title' => 'Dokan Lazy Options Page B' ]
        );
        $values_b = wp_list_pluck( $this->resolved_page_options( 'vendor_dashboard_page' ), 'value' );

        $this->assertContains( $page_b, $values_b, 'Page options must reflect pages created after an earlier build (no stale memo).' );
    }

    /**
     * Build the schema via the registry and return one field's resolved options.
     *
     * @param string $field_id Field id to locate.
     *
     * @return array Resolved options array for the field.
     */
    private function resolved_page_options( string $field_id ): array {
        foreach ( ( new SettingsRegistry() )->get_schema( true ) as $el ) {
            if ( ( $el['id'] ?? '' ) === $field_id ) {
                $this->assertIsArray( $el['options'], "Field {$field_id} options must resolve to an array." );

                return $el['options'];
            }
        }

        $this->fail( "Field {$field_id} not found in the resolved schema." );
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
