<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema\Tab;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Parity tests for the AI Assist tab fields wired through the CSV-derived
 * fragment + LegacySettingsBridge.
 *
 * The CSV fragment at `includes/Admin/Settings/Schema/Generated/csv_fields.php`
 * declares 5 AI Assist fields, all mapped to the legacy `dokan_ai` wp_option
 * via per-field `legacy_key` structs. These tests pin down:
 *   - Field count + legacy_option parity with the trace report (5 fields,
 *     all under `dokan_ai`).
 *   - Legacy → new round-trip: writing to `dokan_ai` propagates to
 *     `dokan_settings` via `transform_legacy_payload_to_new`.
 *   - New → legacy round-trip: writing to `dokan_settings` mirrors back into
 *     `dokan_ai` via `write_new_to_legacy`.
 *   - Drift protection: the bridge filters legacy payloads to declared
 *     `legacy_key` only, so an unknown payload key cannot pollute the new
 *     option (root-cause guard for the `dokan_ai_chatgpt_*` historical
 *     drift documented in the trace report).
 *
 * Sentinel discipline:
 *   - All test values use `__T_*` prefixes so accidental persistence is
 *     trivially scrubbed and grep-detectable.
 *   - We never write real API key shapes (`sk-...`, `AIza...`). The legacy
 *     `dokan_ai` option is reset between assertions.
 *
 * Validators (trim, allow-list, model default fixups) noted in the trace
 * report are out of scope for Task 3 (bridge-layer parity only) and will be
 * added at the new UI / REST layer in a later task.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 * @group settings-ai-assist
 */
class AiAssistSchemaTest extends DokanTestCase {

    /**
     * Absolute path to the generated fragment.
     *
     * Mirrors `GeneratedFragmentTest::fragment_path()` so the two tests stay
     * in sync if DOKAN_DIR resolution ever changes.
     */
    private function fragment_path(): string {
        $root = defined( 'DOKAN_DIR' ) ? DOKAN_DIR : dirname( __DIR__, 6 );
        return $root . '/includes/Admin/Settings/Schema/Generated/csv_fields.php';
    }

    /**
     * Load the AI Assist slice of the generated fragment.
     *
     * Re-indexes via `array_values` so positional access (`[0]`) is stable
     * regardless of the fragment's source ordering.
     *
     * @return array<int,array<string,mixed>>
     */
    private function fragment_for_tab( string $tab ): array {
        $fragment = require $this->fragment_path();
        $matches  = array_filter( $fragment, static fn ( $element ) => ( $element['top_tab'] ?? '' ) === $tab );
        return array_values( $matches );
    }

    /**
     * Reset the legacy `dokan_ai` and new `dokan_settings` options.
     *
     * Each test seeds whatever it needs from a clean baseline so no state
     * leaks between cases.
     */
    public function set_up() {
        parent::set_up();
        delete_option( 'dokan_ai' );
        delete_option( 'dokan_settings' );
    }

    public function tear_down() {
        delete_option( 'dokan_ai' );
        delete_option( 'dokan_settings' );
        parent::tear_down();
    }

    public function test_tab_ai_assist_has_expected_field_count(): void {
        $this->assertCount(
            5,
            $this->fragment_for_tab( 'AI Assist' ),
            'Expected 5 AI Assist fields in the generated CSV fragment.'
        );
    }

    public function test_every_legacy_key_maps_to_dokan_ai(): void {
        foreach ( $this->fragment_for_tab( 'AI Assist' ) as $element ) {
            $id = $element['id'] ?? '<missing-id>';
            $this->assertArrayHasKey( 'legacy_key', $element, "AI Assist field {$id} missing legacy_key." );
            $this->assertSame(
                'dokan_ai',
                $element['legacy_key']['option'] ?? null,
                "AI Assist field {$id} must map to the dokan_ai wp_option, got " . var_export( $element['legacy_key']['option'] ?? null, true )
            );
            $this->assertNotEmpty(
                $element['legacy_key']['field'] ?? '',
                "AI Assist field {$id} legacy_key.field must be non-empty."
            );
        }
    }

    public function test_legacy_save_propagates_to_new_settings_for_ai_assist(): void {
        $tab_fields = $this->fragment_for_tab( 'AI Assist' );

        $map_filter = function ( $map ) use ( $tab_fields ) {
            foreach ( $tab_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            $bridge = new LegacySettingsBridge();

            foreach ( $tab_fields as $element ) {
                $legacy_field = $element['legacy_key']['field'];
                $new_id       = $element['id'];
                $sentinel     = '__T_parity_' . $new_id;

                // Reset legacy option per iteration so unrelated keys don't
                // leak between sub-assertions.
                update_option( 'dokan_ai', [ $legacy_field => $sentinel ] );

                $slice        = $bridge->transform_legacy_payload_to_new( 'dokan_ai', [ $legacy_field => $sentinel ] );
                $existing_new = get_option( 'dokan_settings', [] );
                update_option( 'dokan_settings', array_merge( is_array( $existing_new ) ? $existing_new : [], $slice ) );

                $new = get_option( 'dokan_settings', [] );
                $this->assertSame(
                    $sentinel,
                    $new[ $new_id ] ?? null,
                    "Legacy save for dokan_ai.{$legacy_field} did not propagate to dokan_settings[{$new_id}]."
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    public function test_new_save_propagates_back_to_legacy_for_ai_assist(): void {
        $tab_fields = $this->fragment_for_tab( 'AI Assist' );

        $map_filter = function ( $map ) use ( $tab_fields ) {
            foreach ( $tab_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Seed legacy clean so write_new_to_legacy operates against a
            // known baseline (no stale `dokan_ai_chatgpt_*` ghost keys).
            update_option( 'dokan_ai', [] );

            $payload = [];
            foreach ( $tab_fields as $element ) {
                $payload[ $element['id'] ] = '__T_reverse_' . $element['id'];
            }

            $existing_new = get_option( 'dokan_settings', [] );
            update_option(
                'dokan_settings',
                array_merge( is_array( $existing_new ) ? $existing_new : [], $payload )
            );

            // Mirror the new slice into legacy via the bridge — this is what
            // the new UI's REST writer will trigger when legacy view is on.
            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( $payload );

            $legacy = get_option( 'dokan_ai', [] );
            $this->assertIsArray( $legacy, 'dokan_ai option should be an array after bridge write.' );

            foreach ( $tab_fields as $element ) {
                $this->assertSame(
                    '__T_reverse_' . $element['id'],
                    $legacy[ $element['legacy_key']['field'] ] ?? null,
                    "New save for {$element['id']} did not mirror back to dokan_ai.{$element['legacy_key']['field']}."
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    public function test_unknown_payload_key_in_legacy_save_does_not_pollute_new_option(): void {
        $tab_fields = $this->fragment_for_tab( 'AI Assist' );
        $this->assertNotEmpty( $tab_fields, 'AI Assist tab must have at least one field for this test.' );

        $first = $tab_fields[0];

        $map_filter = function ( $map ) use ( $first ) {
            $map[ $first['id'] ] = $first['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            $bridge = new LegacySettingsBridge();

            // Mimic the legacy AJAX handler's unfiltered-overwrite bug: the
            // payload includes both a real declared field AND an attacker
            // drift key. The bridge MUST filter to declared mappings only,
            // protecting `dokan_settings` from inheriting the historical
            // `dokan_ai_chatgpt_*` schema drift documented in the trace
            // report (lines 401-402).
            $payload = [
                $first['legacy_key']['field']     => 'real-value',
                '__attacker_drift_legacy_field__' => 'drift-value',
            ];

            $slice = $bridge->transform_legacy_payload_to_new( 'dokan_ai', $payload );

            $this->assertArrayHasKey( $first['id'], $slice, 'Declared field must round-trip through the bridge.' );
            $this->assertSame( 'real-value', $slice[ $first['id'] ] );
            $this->assertCount(
                1,
                $slice,
                'Unknown legacy keys must not pollute the new-option slice; expected exactly one declared field.'
            );
            $this->assertArrayNotHasKey(
                '__attacker_drift_legacy_field__',
                $slice,
                'Drift key from the legacy payload leaked into the new-option slice.'
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }
}
