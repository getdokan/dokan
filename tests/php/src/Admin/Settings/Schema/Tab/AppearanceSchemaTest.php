<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema\Tab;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Parity tests for the Appearance tab fields wired through the CSV-derived
 * fragment + LegacySettingsBridge.
 *
 * The Appearance tab fans 20 visible fields across SIX legacy wp_options. It is
 * the second six-option fan-out in the migration (after General), but it
 * introduces three trace-confirmed hazards that the earlier tabs did not have
 * to reason about. They are documented here so future readers do not try to
 * special-case the bridge for them — every one of them belongs to a downstream
 * layer (REST validation/sanitization or a Pro-side fix), NOT the bridge:
 *
 *   - `dokan_appearance`            → 9 fields (e.g. store_header_template,
 *                                     store_banner_width/height, contact_seller,
 *                                     enable_theme_store_sidebar, …)
 *   - `dokan_colors`                → 1 field  (store_color_pallete — the
 *                                     ENTIRE palette is stored as ONE nested
 *                                     array on a single legacy key)
 *   - `dokan_general`               → 3 fields (store_products_per_page,
 *                                     show_vendor_info, enabled_more_products_tab)
 *   - `dokan_menu_manager`          → 1 field  (menu_manager_menu_tab)
 *   - `dokan_verification`          → 5 fields (vendor_verification_social_section
 *                                     + four social app detail blobs)
 *   - `dokan_selling`               → 1 field  (disable_shipping_tab)
 *
 * Trace-driven hazards (see `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`):
 *
 *  1. **`dokan_colors` read-time palette-name shim:** the legacy AJAX GET
 *     handler normalizes palette identifiers in the response only
 *     (`'purple plus' → 'purple pulse'`, `'default' → 'majestic orange'`)
 *     while the DB row is left intact. The bridge reads RAW DB values via
 *     `get_option`, so it returns the literal DB value, not the normalized
 *     response. This is correct behaviour for the bridge — round-tripping
 *     opaquely preserves whatever the legacy AJAX wrote. The shim is the
 *     responsibility of the new REST read path (a transformer on output) and
 *     is tracked as a deferred follow-up for the REST-layer task. NOT
 *     asserted here.
 *
 *  2. **`Settings::sanitize_options` does not recurse into nested arrays:**
 *     XSS / garbage values in any nested key of `store_color_pallete` persist
 *     verbatim through the legacy save. The bridge round-trips the value as
 *     an opaque blob, so it inherits the gap. Sanitization is the new REST
 *     writer's responsibility — `sanitize_hex_color()` per palette colour
 *     plus `sanitize_key()` per palette identifier. NOT asserted here.
 *
 *  3. **MenuManager cross-leak (`dashboard_menu_manager: []` injected on
 *     every save):** a separate Pro-side bug at `DataSource.php:45` injects
 *     a phantom `dashboard_menu_manager` key into every save payload. The
 *     bridge filters by `dokan_legacy_settings_key_mapping`, so any key
 *     without a mapping is silently dropped on the bridge transform layer.
 *     `test_menu_manager_leak_key_is_not_mapped_in_appearance` is the
 *     defensive guard that pins this contract — if a future CSV revision
 *     ever maps `dashboard_menu_manager` to an Appearance id, the test
 *     fails loudly and the developer must consciously decide whether to
 *     un-quarantine the leak or update the Pro fix first.
 *
 *  4. **`dokan_appearance` zero validation on `radio_image` / `croppable_image`:**
 *     the legacy save accepts media id `0`, non-existent attachment ids, and
 *     any garbage as-is. The bridge has no opinion; flagged for the REST
 *     writer (see deferred follow-ups in the task report). NOT asserted
 *     here.
 *
 * Sentinel discipline:
 *   - All test values use `__T_*` prefixes so accidental persistence is
 *     trivially scrubbed and grep-detectable.
 *   - All six legacy options + `dokan_settings` are reset between tests.
 *
 * `test_writes_to_one_legacy_option_do_not_pollute_others` is the
 * cross-section isolation guard generalized to six options — it picks the
 * single `dokan_colors` field (the smallest, most distinct section in the
 * tab) and proves a targeted bridge write there does not leak into any of
 * the five sibling legacy options.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 * @group settings-appearance
 */
class AppearanceSchemaTest extends DokanTestCase {

    /**
     * The complete set of legacy wp_options that this tab's fields read from
     * and write to. Used in `set_up`/`tear_down` and the isolation guard.
     *
     * @var array<int,string>
     */
    private const LEGACY_OPTIONS = [
        'dokan_appearance',
        'dokan_colors',
        'dokan_general',
        'dokan_menu_manager',
        'dokan_verification',
        'dokan_selling',
    ];

    /**
     * Absolute path to the generated fragment.
     */
    private function fragment_path(): string {
        $root = defined( 'DOKAN_DIR' ) ? DOKAN_DIR : dirname( __DIR__, 6 );
        return $root . '/includes/Admin/Settings/Schema/Generated/csv_fields.php';
    }

    /**
     * Load the Appearance slice of the generated fragment.
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

    public function test_tab_appearance_has_expected_field_count(): void {
        $this->assertCount(
            20,
            $this->fragment_for_tab( 'Appearance' ),
            'Expected 20 Appearance fields in the generated CSV fragment.'
        );
    }

    public function test_legacy_keys_span_six_source_options(): void {
        $sources = [];
        foreach ( $this->fragment_for_tab( 'Appearance' ) as $element ) {
            $sources[ $element['legacy_key']['option'] ] = ( $sources[ $element['legacy_key']['option'] ] ?? 0 ) + 1;
        }

        // Every legacy option that the inventory says feeds the Appearance tab
        // must appear at least once. The exact per-section counts pin down
        // any future drift — if a row is moved between tabs the counts shift
        // and this test fails loudly.
        $this->assertSame(
            [
                'dokan_appearance'    => 9,
                'dokan_colors'        => 1,
                'dokan_general'       => 3,
                'dokan_menu_manager'  => 1,
                'dokan_selling'       => 1,
                'dokan_verification'  => 5,
            ],
            $this->ksort_copy( $sources ),
            'Appearance tab section breakdown drifted from the frozen inventory.'
        );
    }

    public function test_no_id_collisions_within_tab(): void {
        $ids    = array_column( $this->fragment_for_tab( 'Appearance' ), 'id' );
        $unique = array_unique( $ids );

        $this->assertSame(
            count( $ids ),
            count( $unique ),
            'Appearance tab has duplicate ids: ' . implode( ',', array_diff_assoc( $ids, $unique ) )
        );
    }

    public function test_legacy_save_propagates_to_new_settings_for_appearance(): void {
        $tab_fields = $this->fragment_for_tab( 'Appearance' );

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

    public function test_new_save_propagates_back_to_legacy_for_appearance(): void {
        $tab_fields = $this->fragment_for_tab( 'Appearance' );

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
        $tab_fields = $this->fragment_for_tab( 'Appearance' );

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
            // isolation guard from VerificationSchemaTest and GeneralSchemaTest.
            $fingerprints = [];
            foreach ( self::LEGACY_OPTIONS as $option ) {
                $fingerprints[ $option ] = 'fp_' . $option;
                update_option( $option, [ 'fingerprint' => $fingerprints[ $option ] ] );
            }

            // Pick the dokan_colors field — the smallest, most distinct
            // section in the Appearance tab and the one carrying the trace-
            // confirmed palette-shim concerns. A targeted write here should
            // leave all five sibling options completely untouched.
            $target = null;
            foreach ( $tab_fields as $element ) {
                if ( 'dokan_colors' === $element['legacy_key']['option'] ) {
                    $target = $element;
                    break;
                }
            }
            $this->assertNotNull( $target, 'No dokan_colors field found in Appearance tab.' );

            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $target['id'] => '__T_isolated' ] );

            // The targeted option got the new value, with its fingerprint
            // preserved (proof of nested write_to, not wholesale overwrite).
            $colors = get_option( 'dokan_colors', [] );
            $this->assertSame(
                '__T_isolated',
                $colors[ $target['legacy_key']['field'] ] ?? null,
                'Bridge write should have landed the new value in dokan_colors.'
            );
            $this->assertSame(
                $fingerprints['dokan_colors'],
                $colors['fingerprint'] ?? null,
                'dokan_colors fingerprint must remain untouched after a targeted write.'
            );

            // All five sibling options must remain pristine.
            foreach ( self::LEGACY_OPTIONS as $option ) {
                if ( 'dokan_colors' === $option ) {
                    continue;
                }
                $row = get_option( $option, [] );
                $this->assertSame(
                    $fingerprints[ $option ],
                    $row['fingerprint'] ?? null,
                    "{$option} fingerprint must remain untouched — writes to dokan_colors must not pollute the sibling option."
                );
                $this->assertArrayNotHasKey(
                    $target['legacy_key']['field'],
                    $row,
                    "Field {$target['legacy_key']['field']} leaked from dokan_colors into {$option}."
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard for the MenuManager cross-leak documented in the trace
     * report (Pro `DataSource.php:45` injects `dashboard_menu_manager: []`
     * into every save payload). The bridge filters payloads by the
     * `dokan_legacy_settings_key_mapping`, so any key without a mapping is
     * silently dropped on the bridge transform layer.
     *
     * If a future CSV revision ever maps `dashboard_menu_manager` to an
     * Appearance id (or any id whose `legacy_key.field` equals that name),
     * this test fails loudly and the developer must consciously decide
     * whether to un-quarantine the leak or update the Pro fix first.
     *
     * This is a CSV-shape assertion only — it does not exercise the bridge.
     */
    public function test_menu_manager_leak_key_is_not_mapped_in_appearance(): void {
        foreach ( $this->fragment_for_tab( 'Appearance' ) as $element ) {
            $this->assertNotSame(
                'dashboard_menu_manager',
                $element['legacy_key']['field'] ?? null,
                "Appearance field {$element['id']} maps to the Pro DataSource leak key 'dashboard_menu_manager'. " .
                'See trace report — this key is silently dropped by the bridge today; mapping it would un-quarantine the Pro-side leak.'
            );
        }
    }

    /**
     * Stable ksort: PHP's sort functions mutate by reference and return bool,
     * which makes inline use awkward. This helper returns a sorted copy so
     * the section-breakdown assertion stays a one-liner.
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
