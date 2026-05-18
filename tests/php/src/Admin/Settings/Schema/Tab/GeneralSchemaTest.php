<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema\Tab;

use WeDevs\Dokan\Admin\Settings\Migration\LegacyAddress;
use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Parity tests for the General tab fields wired through the CSV-derived
 * fragment + LegacySettingsBridge.
 *
 * The General tab is the FIRST CSV-migrated tab whose 22 fields fan out across
 * SIX distinct legacy wp_options, and the first tab where the trace report
 * identified deep-path / nested-array legacy storage:
 *
 *   - `dokan_general`              → 3 fields (`custom_store_url`, `enable_single_seller_mode`, `store_category_type`)
 *   - `dokan_selling`              → 3 fields (`hide_customer_info`, `enable_guest_user_enquiry`, `catalog_mode_hide_add_to_cart_button`)
 *   - `dokan_pages`                → 4 fields (`dashboard`, `my_orders`, `store_listing`, `reg_tc_page`)
 *   - `dokan_geolocation`          → 8 fields (all flat top-level, e.g. `show_locations_map`, `distance_min`, `map_zoom`)
 *   - `dokan_appearance`           → 3 fields (`map_api_source`, `gmap_api_key`, `mapbox_access_token`)
 *   - `dokan_live_search_setting`  → 1 field  (`live_search_option`)
 *
 * Trace-driven hazards (see `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`):
 *
 * - **`dokan_pages` MERGE save (Task 5 of trace):** the ONLY legacy section
 *   that persists via `array_replace_recursive` instead of OVERWRITE. The MERGE
 *   semantics happen INSIDE the legacy AJAX save handler, BEFORE the bridge
 *   sees the payload. By the time `transform_legacy_payload_to_new()` runs,
 *   `dokan_pages` already reflects the merged state in wp_options. The bridge
 *   reads/writes individual `dokan_pages.<field>` keys without caring about
 *   how upstream merged them. **No bridge-layer change required.** Documented
 *   here so future readers don't try to special-case the bridge for MERGE.
 *
 * - **`dokan_geolocation.location.*` nested `gmap` (Task 10 of trace):** the
 *   legacy `dokan_geolocation` option stores a nested `location` array with 4
 *   sub-keys (`address`, `latitude`, `longitude`, `zoom`). **However**, per
 *   the frozen CSV inventory (`docs/superpowers/specs/2026-05-16-csv-fields-inventory.md`)
 *   the `location` gmap row is unmapped (`Mapping == ""`) and decided
 *   `KEEP-BRIDGE-ONLY-NESTED`. The generator emits a single `bridge_only`
 *   entry whose `legacy_key.field` is the top-level `'location'` array —
 *   round-tripped as an opaque blob. The 8 visible `dokan_geolocation`
 *   fields surfaced in the General tab are all FLAT top-level keys
 *   (`show_locations_map`, `distance_min`, `map_zoom`, etc.).
 *
 *   **Decision (Option B from the task plan):** the General tab fragment
 *   intentionally uses flat (single-segment) legacy_keys for every visible
 *   geolocation field. Deep-path (`dokan_geolocation.location.latitude`)
 *   semantics are NOT exercised by any visible General field. The bridge's
 *   `LegacyAddress` deep-path support is exercised by
 *   `LegacyAddressTest` at the unit level; this test adds an integration-level
 *   guard via `dokan_legacy_settings_key_mapping` to prove the bridge's
 *   `write_new_to_legacy` + `transform_legacy_payload_to_new` round-trip
 *   correctly with deep-path addresses, so if Task 7 (Appearance) or a future
 *   CSV revision promotes `location.latitude` to a visible field, the wiring
 *   is already proven.
 *
 * - **`dokan_general.custom_store_url` rewrite flush (Task 1 of trace):** the
 *   legacy AJAX save handler flushes rewrite rules whenever this changes.
 *   The bridge propagates the value verbatim; the side effect
 *   (`flush_rewrite_rules()`) is the responsibility of the writer that owns
 *   the side effect. **For the new REST writer, this is a deferred follow-up:**
 *   when `custom_store_url` changes through the new path, the REST handler
 *   must also call `flush_rewrite_rules()`. Tracked here so the next REST-
 *   layer task can find it. NOT asserted here — bridge has no opinion.
 *
 * - **`dokan_geolocation` body-encoding gotcha:** the legacy AJAX uses
 *   `application/x-www-form-urlencoded`; PHP bracket-parses nested keys
 *   (`settingsData[location][latitude]`) correctly. Multipart FormData would
 *   leave them as literal `'location[latitude'` strings. Bridge operates on
 *   PHP arrays post-parse — this is a frontend concern only. Documented
 *   here for the REST-layer follow-up so the new UI does not regress.
 *
 * - **`dokan_pages` page-id validation absence (Task 5 of trace):** legacy
 *   accepts `0`, `999999`, deleted page ids silently. New UI must validate
 *   via `get_post()` existence check. NOT asserted here — bridge has no
 *   opinion on validity.
 *
 * Sentinel discipline:
 *   - All test values use `__T_*` prefixes so accidental persistence is
 *     trivially scrubbed and grep-detectable.
 *   - All six legacy options + `dokan_settings` are reset between tests.
 *
 * `test_writes_to_one_legacy_option_do_not_pollute_others` is the
 * cross-section isolation guard generalized to six options — it proves that
 * a targeted new-option write to a single `dokan_general` field does not
 * leak into any of the five sibling options.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 * @group settings-general
 */
class GeneralSchemaTest extends DokanTestCase {

    /**
     * The complete set of legacy wp_options that this tab's fields read from
     * and write to. Used in `set_up`/`tear_down` and the isolation guard.
     *
     * @var array<int,string>
     */
    private const LEGACY_OPTIONS = [
        'dokan_general',
        'dokan_selling',
        'dokan_pages',
        'dokan_geolocation',
        'dokan_appearance',
        'dokan_live_search_setting',
    ];

    /**
     * Absolute path to the generated fragment.
     */
    private function fragment_path(): string {
        $root = defined( 'DOKAN_DIR' ) ? DOKAN_DIR : dirname( __DIR__, 6 );
        return $root . '/includes/Admin/Settings/Schema/Generated/csv_fields.php';
    }

    /**
     * Load the General slice of the generated fragment.
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
        foreach ( self::LEGACY_OPTIONS as $option ) {
            delete_option( $option );
        }
        delete_option( 'dokan_admin_settings' );
    }

    public function tear_down() {
        foreach ( self::LEGACY_OPTIONS as $option ) {
            delete_option( $option );
        }
        delete_option( 'dokan_admin_settings' );
        parent::tear_down();
    }

    public function test_tab_general_has_expected_field_count(): void {
        $this->assertCount(
            22,
            $this->fragment_for_tab( 'General' ),
            'Expected 22 General fields in the generated CSV fragment.'
        );
    }

    public function test_legacy_keys_span_all_six_expected_source_options(): void {
        $sources = [];
        foreach ( $this->fragment_for_tab( 'General' ) as $element ) {
            $sources[ $element['legacy_key']['option'] ] = ( $sources[ $element['legacy_key']['option'] ] ?? 0 ) + 1;
        }

        // Every legacy option that the inventory says feeds the General tab
        // must appear at least once. The exact per-section counts pin down
        // any future drift — if a row is moved between tabs the counts shift
        // and this test fails loudly.
        $this->assertSame(
            [
                'dokan_appearance'          => 3,
                'dokan_general'             => 3,
                'dokan_geolocation'         => 8,
                'dokan_live_search_setting' => 1,
                'dokan_pages'               => 4,
                'dokan_selling'             => 3,
            ],
            $this->ksort_copy( $sources ),
            'General tab section breakdown drifted from the frozen inventory.'
        );
    }

    public function test_no_id_collisions_within_tab(): void {
        $ids    = array_column( $this->fragment_for_tab( 'General' ), 'id' );
        $unique = array_unique( $ids );

        $this->assertSame(
            count( $ids ),
            count( $unique ),
            'General tab has duplicate ids: ' . implode( ',', array_diff_assoc( $ids, $unique ) )
        );
    }

    public function test_visible_geolocation_fields_are_flat_not_deep_path(): void {
        // Decision Option B per the task plan: the CSV intentionally maps
        // only flat top-level dokan_geolocation keys into the visible General
        // tab. The nested `location` gmap composite stays bridge-only (see
        // class docblock). This test pins that decision — if a future CSV
        // revision promotes `location.latitude` to a visible field, the
        // generator must emit a dotted-string `legacy_key` and this test
        // must be updated alongside the schema/inventory.
        foreach ( $this->fragment_for_tab( 'General' ) as $element ) {
            if ( ( $element['legacy_key']['option'] ?? null ) !== 'dokan_geolocation' ) {
                continue;
            }
            $field = $element['legacy_key']['field'] ?? '';
            $this->assertStringNotContainsString(
                '.',
                $field,
                "Visible General geolocation field {$element['id']} legacy_key.field is unexpectedly dotted (got '{$field}'). " .
                'If introducing deep-path here, update the inventory + this test together.'
            );
            $this->assertNotSame(
                'location',
                $field,
                "The 'location' gmap composite must remain bridge-only (see inventory), not surface as a visible General field."
            );
        }
    }

    public function test_legacy_save_propagates_to_new_settings_for_general(): void {
        $tab_fields = $this->fragment_for_tab( 'General' );

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

                // Seed only the relevant legacy option per iteration so
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

    public function test_new_save_propagates_back_to_legacy_for_general(): void {
        $tab_fields = $this->fragment_for_tab( 'General' );

        $map_filter = function ( $map ) use ( $tab_fields ) {
            foreach ( $tab_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Seed every legacy option clean so write_new_to_legacy operates
            // against a known baseline.
            foreach ( self::LEGACY_OPTIONS as $option ) {
                update_option( $option, [] );
            }

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

    public function test_writes_to_one_legacy_option_do_not_pollute_others(): void {
        $tab_fields = $this->fragment_for_tab( 'General' );

        $map_filter = function ( $map ) use ( $tab_fields ) {
            foreach ( $tab_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Seed every legacy option with a fingerprint key that is NOT in
            // the mapping — anything that overwrites the option wholesale
            // would erase it. Six-option generalization of the cross-section
            // isolation guard from VerificationSchemaTest and ComplianceSchemaTest.
            $fingerprints = [];
            foreach ( self::LEGACY_OPTIONS as $option ) {
                $fingerprints[ $option ] = 'fp_' . $option;
                update_option( $option, [ 'fingerprint' => $fingerprints[ $option ] ] );
            }

            // Pick a field that belongs to dokan_general — the smallest
            // section in the tab, so a targeted write there should leave
            // the other five options completely untouched.
            $target = null;
            foreach ( $tab_fields as $element ) {
                if ( 'dokan_general' === $element['legacy_key']['option'] ) {
                    $target = $element;
                    break;
                }
            }
            $this->assertNotNull( $target, 'No dokan_general field found in General tab.' );

            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $target['id'] => '__T_isolated' ] );

            // The targeted option got the new value, with its fingerprint
            // preserved (proof of nested write_to, not wholesale overwrite).
            $general = get_option( 'dokan_general', [] );
            $this->assertSame(
                '__T_isolated',
                $general[ $target['legacy_key']['field'] ] ?? null,
                'Bridge write should have landed the new value in dokan_general.'
            );
            $this->assertSame(
                $fingerprints['dokan_general'],
                $general['fingerprint'] ?? null,
                'dokan_general fingerprint must remain untouched after a targeted write.'
            );

            // All five sibling options must remain pristine.
            foreach ( self::LEGACY_OPTIONS as $option ) {
                if ( 'dokan_general' === $option ) {
                    continue;
                }
                $row = get_option( $option, [] );
                $this->assertSame(
                    $fingerprints[ $option ],
                    $row['fingerprint'] ?? null,
                    "{$option} fingerprint must remain untouched — writes to dokan_general must not pollute the sibling option."
                );
                $this->assertArrayNotHasKey(
                    $target['legacy_key']['field'],
                    $row,
                    "Field {$target['legacy_key']['field']} leaked from dokan_general into {$option}."
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Deep-path coverage: even though no visible General field currently uses
     * deep-path addressing (see `test_visible_geolocation_fields_are_flat_not_deep_path`),
     * the bridge MUST support it for `dokan_geolocation.location.{address,latitude,longitude,zoom}`
     * so that Task 7 (Appearance) and future CSV revisions can promote these
     * sub-keys to visible fields without re-engineering the bridge.
     *
     * This test exercises the deep-path round-trip end-to-end via the
     * `dokan_legacy_settings_key_mapping` filter — injecting a synthetic
     * dotted-string `legacy_key` for `dokan_geolocation.location.latitude`
     * and proving that:
     *   1. `transform_legacy_payload_to_new` reads the nested value.
     *   2. `write_new_to_legacy` writes back into the nested array WITHOUT
     *      touching unrelated sibling sub-keys (longitude, address, zoom).
     *   3. `LegacyAddress::parse` returns a non-null instance with the
     *      correct option + multi-segment path.
     *
     * Mirrors the trace-confirmed legacy storage shape (see report line 489).
     */
    public function test_bridge_round_trips_deep_path_address_for_geolocation_location_latitude(): void {
        // Pre-flight: LegacyAddress understands the dotted form.
        $address = LegacyAddress::parse( 'dokan_geolocation.location.latitude' );
        $this->assertNotNull( $address, 'LegacyAddress must parse the dotted form for deep-path lookups.' );
        $this->assertSame( 'dokan_geolocation', $address->option() );
        $this->assertSame( [ 'location', 'latitude' ], $address->path() );

        $synthetic_id = '__T_general_location_latitude_deep_path__';

        $map_filter = function ( $map ) use ( $synthetic_id ) {
            // Inject a deep-path entry via the dotted-string form. This is the
            // shape the generator WOULD emit if Task 7 (or a CSV revision)
            // promotes `location.latitude` to a visible field.
            $map[ $synthetic_id ] = 'dokan_geolocation.location.latitude';
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Seed the full legacy nested shape (trace report line 489 default
            // shape) so we can verify siblings stay untouched.
            update_option(
                'dokan_geolocation',
                [
                    'location' => [
                        'address'   => '__T_seed_addr',
                        'latitude'  => '23.709921',
                        'longitude' => '90.40714300000002',
                        'zoom'      => '10',
                    ],
                ]
            );

            $bridge = new LegacySettingsBridge();

            // (1) Legacy → new: transform_legacy_payload_to_new reads the
            // nested latitude. The payload is shaped exactly as the legacy
            // AJAX handler would deliver it (top-level `location` nested array).
            $slice = $bridge->transform_legacy_payload_to_new(
                'dokan_geolocation',
                [
                    'location' => [
                        'address'   => '__T_seed_addr',
                        'latitude'  => '23.709921',
                        'longitude' => '90.40714300000002',
                        'zoom'      => '10',
                    ],
                ]
            );

            $this->assertArrayHasKey(
                $synthetic_id,
                $slice,
                'transform_legacy_payload_to_new must surface the deep-path latitude in the new-flat slice.'
            );
            $this->assertSame(
                '23.709921',
                $slice[ $synthetic_id ],
                'Deep-path read should return the nested latitude string verbatim.'
            );

            // (2) New → legacy: write a fresh latitude through write_new_to_legacy
            // and confirm only `location.latitude` mutates.
            $bridge->write_new_to_legacy( [ $synthetic_id => '12.345678' ] );

            $legacy = get_option( 'dokan_geolocation', [] );
            $this->assertIsArray( $legacy, 'dokan_geolocation must remain an array after deep-path write.' );
            $this->assertIsArray( $legacy['location'] ?? null, 'Nested location array must survive the write.' );

            $this->assertSame(
                '12.345678',
                $legacy['location']['latitude'] ?? null,
                'Deep-path write did not land at dokan_geolocation.location.latitude.'
            );
            // The other three sub-keys must remain at their seeded values.
            $this->assertSame(
                '__T_seed_addr',
                $legacy['location']['address'] ?? null,
                'Deep-path write must not clobber location.address.'
            );
            $this->assertSame(
                '90.40714300000002',
                $legacy['location']['longitude'] ?? null,
                'Deep-path write must not clobber location.longitude.'
            );
            $this->assertSame(
                '10',
                $legacy['location']['zoom'] ?? null,
                'Deep-path write must not clobber location.zoom.'
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Stable ksort: PHP's sort functions mutate by reference and return bool,
     * which makes inline use awkward. This helper returns a sorted copy so
     * assertions in `test_legacy_keys_span_all_six_expected_source_options`
     * stay one-liners.
     *
     * @param array<string,int> $input
     *
     * @return array<string,int>
     */
    private function ksort_copy( array $input ): array {
        ksort( $input );
        return $input;
    }
}
