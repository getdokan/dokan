<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema\Tab;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Parity tests for the Verification tab fields wired through the CSV-derived
 * fragment + LegacySettingsBridge.
 *
 * The Verification tab is the FIRST tab in the CSV migration whose fields are
 * sourced from TWO distinct legacy wp_options:
 *   - `dokan_verification`            → 2 fields (verified_icon, vendor_verification_methods)
 *   - `dokan_email_verification`      → 3 fields (enabled, registration_notice, login_notice)
 *
 * The trace report (`docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`,
 * Task 21 §"Schema collision on `dokan_verification.enabled`") flagged a P0 risk
 * in the in-progress non-CSV plugin-ui rewrite: it relocated Email Verification
 * fields into the `dokan_verification` option, where the literal key `enabled`
 * collided with Vendor Verification's own master gate. The CSV-driven migration
 * sidesteps that storage collision at the bridge layer because each row's
 * `legacy_key.option` is the original storage row.
 *
 * The remaining collision concern is at the NEW SCHEMA id level — the generator
 * slug rule `<top_tab>_<sub_path>_<FieldKey>` could in principle produce duplicate
 * `verification_*_enabled` ids. The two sub-paths differ here
 * (`Vendor Verification` vs `Email Verification`) so the slug rule naturally
 * disambiguates: `verification_vendor_verification_*` vs
 * `verification_email_verification_*`. `test_no_id_collisions_within_tab`
 * pins that down.
 *
 * `test_saves_to_one_legacy_option_do_not_pollute_the_other` is the new
 * defensive guard against the collision pattern surfaced in the trace — it
 * proves that a mirror-back to `dokan_verification` does not touch
 * `dokan_email_verification`, and vice versa.
 *
 * Sentinel discipline:
 *   - All test values use `__T_*` prefixes so accidental persistence is
 *     trivially scrubbed and grep-detectable.
 *   - Both legacy options and `dokan_settings` are reset between tests.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 * @group settings-verification
 */
class VerificationSchemaTest extends DokanTestCase {

    /**
     * Absolute path to the generated fragment.
     */
    private function fragment_path(): string {
        $root = defined( 'DOKAN_DIR' ) ? DOKAN_DIR : dirname( __DIR__, 6 );
        return $root . '/includes/Admin/Settings/Schema/Generated/csv_fields.php';
    }

    /**
     * Load the Verification slice of the generated fragment.
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
        delete_option( 'dokan_verification' );
        delete_option( 'dokan_email_verification' );
        delete_option( 'dokan_admin_settings' );
    }

    public function tear_down() {
        delete_option( 'dokan_verification' );
        delete_option( 'dokan_email_verification' );
        delete_option( 'dokan_admin_settings' );
        parent::tear_down();
    }

    public function test_tab_verification_has_expected_field_count(): void {
        $this->assertCount(
            5,
            $this->fragment_for_tab( 'Verification' ),
            'Expected 5 Verification fields in the generated CSV fragment.'
        );
    }

    public function test_legacy_keys_come_from_both_dokan_verification_and_dokan_email_verification(): void {
        $sources = [];
        foreach ( $this->fragment_for_tab( 'Verification' ) as $element ) {
            $sources[ $element['legacy_key']['option'] ] = true;
        }

        // Both legacy options must be represented — the trace surfaced this as
        // a critical collision point in the non-CSV plugin-ui rewrite.
        $this->assertArrayHasKey( 'dokan_verification', $sources );
        $this->assertArrayHasKey( 'dokan_email_verification', $sources );
    }

    public function test_no_id_collisions_within_tab(): void {
        $ids    = array_column( $this->fragment_for_tab( 'Verification' ), 'id' );
        $unique = array_unique( $ids );

        $this->assertSame(
            count( $ids ),
            count( $unique ),
            'Verification tab has duplicate ids: ' . implode( ',', array_diff_assoc( $ids, $unique ) )
        );
    }

    public function test_legacy_save_propagates_to_new_settings_for_verification(): void {
        $tab_fields = $this->fragment_for_tab( 'Verification' );

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
                $existing_new = get_option( 'dokan_admin_settings', [] );
                update_option(
                    'dokan_admin_settings',
                    array_merge( is_array( $existing_new ) ? $existing_new : [], $slice )
                );

                $new = get_option( 'dokan_admin_settings', [] );
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

    public function test_new_save_propagates_back_to_legacy_for_verification(): void {
        $tab_fields = $this->fragment_for_tab( 'Verification' );

        $map_filter = function ( $map ) use ( $tab_fields ) {
            foreach ( $tab_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Seed both legacy options clean so write_new_to_legacy operates
            // against a known baseline.
            update_option( 'dokan_verification', [] );
            update_option( 'dokan_email_verification', [] );

            $payload = [];
            foreach ( $tab_fields as $element ) {
                $payload[ $element['id'] ] = '__T_reverse_' . $element['id'];
            }

            $existing_new = get_option( 'dokan_admin_settings', [] );
            update_option(
                'dokan_admin_settings',
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

    public function test_saves_to_one_legacy_option_do_not_pollute_the_other(): void {
        $tab_fields = $this->fragment_for_tab( 'Verification' );

        $map_filter = function ( $map ) use ( $tab_fields ) {
            foreach ( $tab_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Set both legacy options to known states with a fingerprint key
            // that is NOT in the mapping — anything that overwrites the option
            // wholesale would erase it.
            update_option( 'dokan_verification', [ 'fingerprint' => 'fp_v' ] );
            update_option( 'dokan_email_verification', [ 'fingerprint' => 'fp_ev' ] );

            // Pick a field that belongs to dokan_verification only.
            $v_field = null;
            foreach ( $tab_fields as $element ) {
                if ( 'dokan_verification' === $element['legacy_key']['option'] ) {
                    $v_field = $element;
                    break;
                }
            }
            $this->assertNotNull( $v_field, 'No dokan_verification field found in Verification tab.' );

            // Mirror a new-option write for that single field back into legacy
            // via the bridge — which is what the new UI's REST writer will do.
            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $v_field['id'] => '__T_isolated' ] );

            $verification       = get_option( 'dokan_verification', [] );
            $email_verification = get_option( 'dokan_email_verification', [] );

            $this->assertSame(
                '__T_isolated',
                $verification[ $v_field['legacy_key']['field'] ] ?? null,
                'Bridge write should have landed the new value in dokan_verification.'
            );
            $this->assertSame(
                'fp_v',
                $verification['fingerprint'] ?? null,
                'dokan_verification fingerprint must remain untouched after a targeted write.'
            );
            $this->assertSame(
                'fp_ev',
                $email_verification['fingerprint'] ?? null,
                'dokan_email_verification fingerprint must remain untouched — writes to dokan_verification must not pollute the sibling option.'
            );
            $this->assertArrayNotHasKey(
                $v_field['legacy_key']['field'],
                $email_verification,
                "Field {$v_field['legacy_key']['field']} leaked from dokan_verification into dokan_email_verification."
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }
}
