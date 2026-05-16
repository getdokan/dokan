<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Schema\SettingsSchema;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Tests for the generated CSV-derived settings schema fragment.
 *
 * The generator at `tools/migration/generate_schema_fragment.php` emits a
 * `return [ ... ];` fragment at `includes/Admin/Settings/Schema/Generated/csv_fields.php`.
 * These tests pin down:
 *   - The fragment is a loadable PHP file returning an array.
 *   - It contains exactly 208 `type: field` entries (one per mapped CSV row).
 *   - It contains exactly 8 `bridge_only: true` entries (per unmapped decisions doc).
 *   - Every field has a `legacy_key` struct with `option` and `field` keys so the
 *     bridge can map new → legacy.
 *   - SettingsSchema honours the `dokan_csv_schema_enabled` feature flag — fragment
 *     is excluded by default, merged in when the flag is on.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 */
class GeneratedFragmentTest extends DokanTestCase {

    /**
     * Absolute path to the generated fragment.
     *
     * @return string
     */
    private function fragment_path(): string {
        $root = defined( 'DOKAN_DIR' ) ? DOKAN_DIR : dirname( __DIR__, 5 );
        return $root . '/includes/Admin/Settings/Schema/Generated/csv_fields.php';
    }

    /**
     * Load the generated fragment for inspection.
     *
     * @return array
     */
    private function load_fragment(): array {
        $path = $this->fragment_path();
        $this->assertFileExists( $path, "Generated fragment missing: {$path}" );

        $fragment = require $path;
        $this->assertIsArray( $fragment, 'Generated fragment must return an array.' );

        return $fragment;
    }

    public function test_generated_fragment_returns_expected_element_count(): void {
        $fragment = $this->load_fragment();

        $field_count = count(
            array_filter( $fragment, static fn ( $el ) => ( $el['type'] ?? '' ) === 'field' )
        );

        $this->assertSame( 208, $field_count, 'Expected exactly 208 field entries in the generated fragment.' );
    }

    public function test_generated_fragment_has_expected_bridge_only_count(): void {
        $fragment = $this->load_fragment();

        $bridge_count = count(
            array_filter( $fragment, static fn ( $el ) => ! empty( $el['bridge_only'] ) )
        );

        $this->assertSame( 8, $bridge_count, 'Expected exactly 8 bridge-only entries in the generated fragment.' );
    }

    public function test_every_field_has_legacy_key_struct(): void {
        $fragment = $this->load_fragment();

        foreach ( $fragment as $element ) {
            if ( ( $element['type'] ?? '' ) !== 'field' ) {
                continue;
            }

            $id = $element['id'] ?? '<missing-id>';

            $this->assertArrayHasKey( 'legacy_key', $element, "Field {$id} missing legacy_key" );
            $this->assertIsArray( $element['legacy_key'], "Field {$id} legacy_key must be an array" );
            $this->assertArrayHasKey( 'option', $element['legacy_key'], "Field {$id} legacy_key missing 'option'" );
            $this->assertArrayHasKey( 'field', $element['legacy_key'], "Field {$id} legacy_key missing 'field'" );
            $this->assertNotEmpty( $element['legacy_key']['option'], "Field {$id} legacy_key.option must be non-empty" );
            $this->assertNotEmpty( $element['legacy_key']['field'], "Field {$id} legacy_key.field must be non-empty" );
        }
    }

    public function test_every_bridge_only_entry_has_legacy_key_struct(): void {
        $fragment = $this->load_fragment();

        $bridge_only = array_filter( $fragment, static fn ( $el ) => ! empty( $el['bridge_only'] ) );

        $this->assertNotEmpty( $bridge_only, 'Expected at least one bridge-only entry.' );

        foreach ( $bridge_only as $element ) {
            $id = $element['id'] ?? '<missing-id>';
            $this->assertArrayHasKey( 'legacy_key', $element, "Bridge-only {$id} missing legacy_key" );
            $this->assertIsArray( $element['legacy_key'] );
            $this->assertArrayHasKey( 'option', $element['legacy_key'] );
            $this->assertArrayHasKey( 'field', $element['legacy_key'] );
        }
    }

    public function test_generated_ids_are_unique(): void {
        $fragment = $this->load_fragment();

        $ids = array_column( $fragment, 'id' );
        $this->assertSame(
            count( $ids ),
            count( array_unique( $ids ) ),
            'Generated fragment contains duplicate ids.'
        );
    }

    // =========================================================================
    // Feature-flag wiring on SettingsSchema
    // =========================================================================

    public function test_csv_schema_not_loaded_when_flag_off(): void {
        delete_option( 'dokan_csv_schema_enabled' );

        $schema = SettingsSchema::get_schema();

        $generated_count = count(
            array_filter( $schema, static fn ( $el ) => isset( $el['top_tab'] ) )
        );

        $this->assertSame( 0, $generated_count, 'CSV schema must NOT be loaded when feature flag is off (default).' );
    }

    public function test_csv_schema_loaded_when_flag_on(): void {
        update_option( 'dokan_csv_schema_enabled', true );
        // Force Pro active so the Lite/Pro gate in SettingsSchema does not
        // filter out the 145 `is_lite: false` rows — this test pins the
        // raw fragment-merge count, NOT the gating behaviour (which has
        // its own dedicated test class LiteProFieldGatingTest).
        add_filter( 'dokan_is_pro_exists', '__return_true', 1000 );

        try {
            $schema = SettingsSchema::get_schema();

            $generated_count = count(
                array_filter( $schema, static fn ( $el ) => isset( $el['top_tab'] ) )
            );

            $this->assertSame( 208, $generated_count, 'CSV schema should contribute 208 fields when flag is on.' );
        } finally {
            remove_filter( 'dokan_is_pro_exists', '__return_true', 1000 );
            delete_option( 'dokan_csv_schema_enabled' );
        }
    }
}
