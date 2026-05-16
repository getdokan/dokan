<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema\Tab;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Parity tests for the Compliance tab fields wired through the CSV-derived
 * fragment + LegacySettingsBridge.
 *
 * The Compliance tab is the FIRST tab in the CSV migration whose 11 fields
 * are sourced from THREE distinct legacy wp_options:
 *   - `dokan_general`     → 3 fields (`admin_access`, `data_clear_on_uninstall`, `seller_enable_terms_and_conditions`)
 *   - `dokan_privacy`     → 3 fields (`enable_privacy`, `privacy_page`, `privacy_policy`)
 *   - `dokan_germanized`  → 5 fields (`vendor_fields`, `vendor_registration`, `customer_fields`,
 *                                     `enabled_germanized`, `override_invoice_number`)
 *
 * Trace-driven hazards (see `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`):
 *
 * - **`billing_` prefix decision (Task 28 P0):** the in-progress non-CSV plugin-ui
 *   rewrite drops the `billing_` prefix on `customer_fields`'s array VALUES, which
 *   would break `CustomFields/Billing.php`'s `<input name="billing_dokan_*">` checkout
 *   rendering. The CSV-driven migration sidesteps this entirely at the bridge layer:
 *   the legacy_key.field is `customer_fields` (the multicheck key, not its values),
 *   so the stored array (e.g. `['billing_dokan_vat_number', …]`) round-trips as an
 *   opaque value. **No value-string remapping happens at the bridge.**
 *
 * - **`dokan_general.admin_access` cross-tab grouping:** trace maps `admin_access`
 *   into the "Privacy" sub_path of the Compliance tab even though it physically
 *   lives in `dokan_general`. The CSV preserves the legacy address, so the bridge
 *   correctly routes new-id writes back to `dokan_general` — even though sibling
 *   Compliance fields go to `dokan_privacy` and `dokan_germanized`.
 *
 * - **`dokan_privacy.privacy_policy` stored XSS (Task 7):** `<script>` tags
 *   round-trip verbatim because `Settings::sanitize_options` is no-op when no
 *   `sanitize_callback` is registered. Sanitization is the new REST/UI layer's
 *   responsibility (`wp_kses_post`), NOT the bridge's. Tracked as a deferred
 *   follow-up; intentionally NOT asserted here.
 *
 * Sentinel discipline:
 *   - All test values use `__T_*` prefixes so accidental persistence is trivially
 *     scrubbed and grep-detectable.
 *   - All three legacy options + `dokan_settings` are reset between tests.
 *
 * `test_writes_to_one_legacy_option_do_not_pollute_others` is the cross-section
 * isolation guard — it proves that a new-option write targeting a single
 * `dokan_general` field does not leak into `dokan_privacy` or `dokan_germanized`.
 * This is the three-section analogue of the two-section guard in
 * `VerificationSchemaTest::test_saves_to_one_legacy_option_do_not_pollute_the_other`.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 * @group settings-compliance
 */
class ComplianceSchemaTest extends DokanTestCase {

    /**
     * Absolute path to the generated fragment.
     */
    private function fragment_path(): string {
        $root = defined( 'DOKAN_DIR' ) ? DOKAN_DIR : dirname( __DIR__, 6 );
        return $root . '/includes/Admin/Settings/Schema/Generated/csv_fields.php';
    }

    /**
     * Load the Compliance slice of the generated fragment.
     *
     * @return array<int,array<string,mixed>>
     */
    private function fragment_for_tab( string $tab ): array {
        $fragment = require $this->fragment_path();
        $matches  = array_filter( $fragment, static fn ( $element ) => ( $element['top_tab'] ?? '' ) === $tab );
        return array_values( $matches );
    }

    public function set_up() {
        parent::set_up();
        delete_option( 'dokan_general' );
        delete_option( 'dokan_privacy' );
        delete_option( 'dokan_germanized' );
        delete_option( 'dokan_settings' );
    }

    public function tear_down() {
        delete_option( 'dokan_general' );
        delete_option( 'dokan_privacy' );
        delete_option( 'dokan_germanized' );
        delete_option( 'dokan_settings' );
        parent::tear_down();
    }

    public function test_tab_compliance_has_expected_field_count(): void {
        $this->assertCount(
            11,
            $this->fragment_for_tab( 'Compliance' ),
            'Expected 11 Compliance fields in the generated CSV fragment.'
        );
    }

    public function test_legacy_keys_span_three_legacy_options(): void {
        $sources = [];
        foreach ( $this->fragment_for_tab( 'Compliance' ) as $element ) {
            $sources[ $element['legacy_key']['option'] ] = true;
        }

        // All three legacy options must be represented — the Compliance tab is the
        // first CSV-migrated tab that fans out across three legacy wp_options.
        $this->assertArrayHasKey( 'dokan_general', $sources, 'Compliance must include at least one dokan_general field (admin_access).' );
        $this->assertArrayHasKey( 'dokan_privacy', $sources, 'Compliance must include the dokan_privacy fields (enable_privacy/privacy_page/privacy_policy).' );
        $this->assertArrayHasKey( 'dokan_germanized', $sources, 'Compliance must include the dokan_germanized EU compliance fields.' );
    }

    public function test_no_id_collisions_within_tab(): void {
        $ids    = array_column( $this->fragment_for_tab( 'Compliance' ), 'id' );
        $unique = array_unique( $ids );

        $this->assertSame(
            count( $ids ),
            count( $unique ),
            'Compliance tab has duplicate ids: ' . implode( ',', array_diff_assoc( $ids, $unique ) )
        );
    }

    public function test_legacy_save_propagates_to_new_settings_for_compliance(): void {
        $tab_fields = $this->fragment_for_tab( 'Compliance' );

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
                $legacy_option = $element['legacy_key']['option'];
                $legacy_field  = $element['legacy_key']['field'];
                $new_id        = $element['id'];
                $sentinel      = '__T_parity_' . $new_id;

                // Seed only the relevant legacy option for this iteration so
                // sibling fields don't leak between sub-assertions.
                update_option( $legacy_option, [ $legacy_field => $sentinel ] );

                $slice        = $bridge->transform_legacy_payload_to_new( $legacy_option, [ $legacy_field => $sentinel ] );
                $existing_new = get_option( 'dokan_settings', [] );
                update_option(
                    'dokan_settings',
                    array_merge( is_array( $existing_new ) ? $existing_new : [], $slice )
                );

                $new = get_option( 'dokan_settings', [] );
                $this->assertSame(
                    $sentinel,
                    $new[ $new_id ] ?? null,
                    "Legacy save for {$legacy_option}.{$legacy_field} did not propagate to dokan_settings[{$new_id}]."
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    public function test_new_save_propagates_back_to_legacy_for_compliance(): void {
        $tab_fields = $this->fragment_for_tab( 'Compliance' );

        $map_filter = function ( $map ) use ( $tab_fields ) {
            foreach ( $tab_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Seed all three legacy options clean so write_new_to_legacy operates
            // against a known baseline.
            update_option( 'dokan_general', [] );
            update_option( 'dokan_privacy', [] );
            update_option( 'dokan_germanized', [] );

            $payload = [];
            foreach ( $tab_fields as $element ) {
                $payload[ $element['id'] ] = '__T_reverse_' . $element['id'];
            }

            $existing_new = get_option( 'dokan_settings', [] );
            update_option(
                'dokan_settings',
                array_merge( is_array( $existing_new ) ? $existing_new : [], $payload )
            );

            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( $payload );

            foreach ( $tab_fields as $element ) {
                $legacy = get_option( $element['legacy_key']['option'], [] );
                $this->assertIsArray(
                    $legacy,
                    "Legacy option {$element['legacy_key']['option']} should be an array after bridge write."
                );
                $this->assertSame(
                    '__T_reverse_' . $element['id'],
                    $legacy[ $element['legacy_key']['field'] ] ?? null,
                    "New save for {$element['id']} did not mirror back to {$element['legacy_key']['option']}.{$element['legacy_key']['field']}."
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    public function test_writes_to_one_legacy_option_do_not_pollute_others(): void {
        $tab_fields = $this->fragment_for_tab( 'Compliance' );

        $map_filter = function ( $map ) use ( $tab_fields ) {
            foreach ( $tab_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Seed all three legacy options with a fingerprint key that is NOT
            // in the mapping — anything that overwrites the option wholesale
            // would erase it.
            update_option( 'dokan_general', [ 'fingerprint' => 'fp_general' ] );
            update_option( 'dokan_privacy', [ 'fingerprint' => 'fp_privacy' ] );
            update_option( 'dokan_germanized', [ 'fingerprint' => 'fp_germanized' ] );

            // Pick a field that belongs to dokan_general (admin_access is the
            // canonical cross-section example: a Compliance field whose
            // storage row is `dokan_general`, not `dokan_privacy`).
            $general_field = null;
            foreach ( $tab_fields as $element ) {
                if ( 'dokan_general' === $element['legacy_key']['option'] ) {
                    $general_field = $element;
                    break;
                }
            }
            $this->assertNotNull( $general_field, 'No dokan_general field found in Compliance tab.' );

            // Mirror a new-option write for that single field back into legacy
            // via the bridge — which is what the new UI's REST writer will do.
            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $general_field['id'] => '__T_isolated' ] );

            $general    = get_option( 'dokan_general', [] );
            $privacy    = get_option( 'dokan_privacy', [] );
            $germanized = get_option( 'dokan_germanized', [] );

            $this->assertSame(
                '__T_isolated',
                $general[ $general_field['legacy_key']['field'] ] ?? null,
                'Bridge write should have landed the new value in dokan_general.'
            );
            $this->assertSame(
                'fp_general',
                $general['fingerprint'] ?? null,
                'dokan_general fingerprint must remain untouched after a targeted write.'
            );
            $this->assertSame(
                'fp_privacy',
                $privacy['fingerprint'] ?? null,
                'dokan_privacy fingerprint must remain untouched — writes to dokan_general must not pollute the sibling option.'
            );
            $this->assertSame(
                'fp_germanized',
                $germanized['fingerprint'] ?? null,
                'dokan_germanized fingerprint must remain untouched — writes to dokan_general must not pollute the sibling option.'
            );
            $this->assertArrayNotHasKey(
                $general_field['legacy_key']['field'],
                $privacy,
                "Field {$general_field['legacy_key']['field']} leaked from dokan_general into dokan_privacy."
            );
            $this->assertArrayNotHasKey(
                $general_field['legacy_key']['field'],
                $germanized,
                "Field {$general_field['legacy_key']['field']} leaked from dokan_general into dokan_germanized."
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }
}
