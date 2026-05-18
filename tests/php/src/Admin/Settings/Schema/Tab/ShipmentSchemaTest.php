<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema\Tab;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Parity tests for the Shipment tab fields wired through the CSV-derived
 * fragment + LegacySettingsBridge.
 *
 * The Shipment tab carries 21 fields fanned across THREE legacy wp_options:
 *
 *   - `dokan_delivery_time`           → 16 fields (allow_vendor_override_settings,
 *                                          delivery_support, delivery_date_label,
 *                                          preorder_date, time_slot_minutes,
 *                                          order_per_slot, delivery_box_info,
 *                                          selection_required, delivery_day
 *                                          (sub_section), and 7 SEPARATE
 *                                          `delivery_day_<weekday>` day_timer
 *                                          fields — see hazard #1)
 *   - `dokan_shipping_status_setting` → 4 fields (enabled, allow_mark_received,
 *                                          shipping_status_provider,
 *                                          shipping_status_list)
 *   - `dokan_general`                 → 1 field (enable_shipstation_logging)
 *
 * Trace-driven hazards (see `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`):
 *
 *  1. **`dokan_delivery_time` 7→1 day-field reshape:** the in-progress non-CSV
 *     plugin-ui schema COLLAPSED the 7 individual `delivery_day_<weekday>`
 *     rows into a single combined `delivery_days_schedule` field. The CSV
 *     migration KEEPS the 7 separate `day_timer` rows, each with its own
 *     `legacy_key.field` (`delivery_day_monday` … `delivery_day_sunday`).
 *     `test_legacy_keys_span_three_source_options` pins the 16-field count
 *     for `dokan_delivery_time` (which mathematically requires 7 day rows to
 *     hit 16). Defensive test `test_delivery_time_day_fields_round_trip`
 *     additionally proves each day round-trips OPAQUELY as a compound shape
 *     (`{delivery_status, opening_time, closing_time}`) without the bridge
 *     reshaping or collapsing the rows.
 *
 *  2. **`dokan_delivery_time` fail-closed pre-save validator:**
 *     `dokan_before_saving_settings` runs 7 numeric/range checks (preorder
 *     date, time_slot_minutes, order_per_slot, etc.) and can
 *     `wp_send_json_error(…, 400)` + `wp_die`. The legacy AJAX path fires the
 *     validator; the bridge does NOT. Validation belongs in the new REST
 *     writer's `sanitize_callback`/`validate_callback`. The bridge stays
 *     storage-only. Deferred follow-up — intentionally NOT asserted here.
 *
 *  3. **`dokan_delivery_time` post-save self-seeder + side option write:**
 *     `dokan_after_saving_settings` writes a SEPARATE wp_option
 *     `_dokan_delivery_slot_settings` AND re-`update_option`s
 *     `dokan_delivery_time` with int-coerced numeric fields. The bridge does
 *     NOT fire `dokan_after_saving_settings`, so neither side effect runs on
 *     a bridge-only path. Deferred follow-up for the new REST writer.
 *
 *  4. **`dokan_shipping_status_setting` cross-plugin Lite reads:** Lite's
 *     `Assets.php` (twice) and `Dashboard/Templates/Orders.php` read this
 *     Pro-owned option via `dokan_get_option( 'enabled',
 *     'dokan_shipping_status_setting', 'off' )`. That helper routes through
 *     the bridge's `hydrate_legacy_from_new`, so a save via the new UI is
 *     reflected on the very next legacy read. Defensive test
 *     `test_shipping_status_lite_cross_plugin_read_sees_bridge_writes` proves
 *     a bridge `write_new_to_legacy` is observable via `dokan_get_option`
 *     (the exact helper Lite uses for the cross-plugin read).
 *
 *  5. **`dokan_shipping_status_setting` self-seeding:** legacy
 *     `add_default_shipping_status()` writes 6 default rows on the first
 *     empty read. The bridge does not run the self-seeder — it only
 *     mirrors writes. Defensive test
 *     `test_shipping_status_self_seeder_does_not_overwrite_bridge_writes`
 *     pins that a bridge write survives a subsequent legacy read cycle (the
 *     self-seeder only fires when the option is empty, so once the bridge
 *     has stamped a value the seeder cannot clobber it).
 *
 * Sentinel discipline:
 *   - All test values use `__T_*` prefixes so accidental persistence is
 *     trivially scrubbed and grep-detectable.
 *   - All three legacy options + `dokan_settings` + the
 *     `_dokan_delivery_slot_settings` side option are reset between tests.
 *
 * `test_writes_to_one_legacy_option_do_not_pollute_others` is the three-option
 * generalization of the cross-section isolation guard. It picks a
 * `dokan_delivery_time` field (the most complex source — 16 rows including
 * the 7 day_timer rows) and proves a targeted bridge write there does not
 * leak into the two sibling legacy options.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 * @group settings-shipment
 */
class ShipmentSchemaTest extends DokanTestCase {

    /**
     * The complete set of legacy wp_options that this tab's fields read from
     * and write to. Used in `set_up`/`tear_down` and the isolation guard.
     *
     * @var array<int,string>
     */
    private const LEGACY_OPTIONS = [
        'dokan_delivery_time',
        'dokan_shipping_status_setting',
        'dokan_general',
    ];

    /**
     * Side wp_option written by the legacy Delivery Time
     * `dokan_after_saving_settings` self-seeder. The bridge does not touch
     * this option, but it is cleared between tests so a stray leftover
     * cannot mask a regression in the deferred-follow-up territory.
     */
    private const DELIVERY_SLOT_SIDE_OPTION = '_dokan_delivery_slot_settings';

    /**
     * Absolute path to the generated fragment.
     */
    private function fragment_path(): string {
        $root = defined( 'DOKAN_DIR' ) ? DOKAN_DIR : dirname( __DIR__, 6 );
        return $root . '/includes/Admin/Settings/Schema/Generated/csv_fields.php';
    }

    /**
     * Load the named tab slice of the generated fragment.
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
        delete_option( self::DELIVERY_SLOT_SIDE_OPTION );
    }

    public function tear_down() {
        foreach ( self::LEGACY_OPTIONS as $option ) {
            delete_option( $option );
        }
        delete_option( 'dokan_admin_settings' );
        delete_option( self::DELIVERY_SLOT_SIDE_OPTION );
        parent::tear_down();
    }

    public function test_tab_shipment_has_expected_field_count(): void {
        $this->assertCount(
            21,
            $this->fragment_for_tab( 'Shipment' ),
            'Expected 21 Shipment fields in the generated CSV fragment.'
        );
    }

    public function test_legacy_keys_span_three_source_options(): void {
        $sources = [];
        foreach ( $this->fragment_for_tab( 'Shipment' ) as $element ) {
            $sources[ $element['legacy_key']['option'] ] = ( $sources[ $element['legacy_key']['option'] ] ?? 0 ) + 1;
        }

        // Every legacy option that the inventory says feeds the Shipment tab
        // must appear at the exact CSV-derived count. The 16 against
        // `dokan_delivery_time` mathematically requires that the CSV keep 7
        // SEPARATE `delivery_day_<weekday>` rows — if a future regenerator
        // pass collapses them into a single `delivery_days_schedule` field
        // (the in-progress non-CSV rewrite's shape), this count drops to 10
        // and the test fails loudly.
        $this->assertSame(
            [
                'dokan_delivery_time'           => 16,
                'dokan_general'                 => 1,
                'dokan_shipping_status_setting' => 4,
            ],
            $this->ksort_copy( $sources ),
            'Shipment tab section breakdown drifted from the frozen inventory.'
        );
    }

    public function test_no_id_collisions_within_tab(): void {
        $ids    = array_column( $this->fragment_for_tab( 'Shipment' ), 'id' );
        $unique = array_unique( $ids );

        $this->assertSame(
            count( $ids ),
            count( $unique ),
            'Shipment tab has duplicate ids: ' . implode( ',', array_diff_assoc( $ids, $unique ) )
        );
    }

    public function test_legacy_save_propagates_to_new_settings_for_shipment(): void {
        $tab_fields = $this->fragment_for_tab( 'Shipment' );

        $map_filter = function ( $map ) use ( $tab_fields ) {
            foreach ( $tab_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            $bridge = new LegacySettingsBridge();

            // Opaque sentinel — used even for compound fields (the 7
            // `delivery_day_<weekday>` day_timer rows, the
            // `shipping_status_list` repeatable, the
            // `shipping_status_provider` multicheck) because the bridge is
            // opaque about content. If a future bridge change ever
            // introduces masking or shape-coercion here, this assertion
            // fails loudly.
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

    public function test_new_save_propagates_back_to_legacy_for_shipment(): void {
        $tab_fields = $this->fragment_for_tab( 'Shipment' );

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
        $tab_fields = $this->fragment_for_tab( 'Shipment' );

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
            // would erase it. Three-option generalization of the cross-section
            // isolation guards in prior tab tests.
            $fingerprints = [];
            foreach ( self::LEGACY_OPTIONS as $option ) {
                $fingerprints[ $option ] = 'fp_' . $option;
                update_option( $option, [ 'fingerprint' => $fingerprints[ $option ] ] );
            }

            // Pick a `dokan_delivery_time` field — the most complex source
            // with 16 rows including the 7 day_timer rows. A targeted write
            // here should leave both sibling options completely untouched.
            $target = null;
            foreach ( $tab_fields as $element ) {
                if ( 'dokan_delivery_time' === $element['legacy_key']['option'] ) {
                    $target = $element;
                    break;
                }
            }
            $this->assertNotNull( $target, 'No dokan_delivery_time field found in Shipment tab.' );

            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $target['id'] => '__T_isolated' ] );

            // The targeted option got the new value, with its fingerprint
            // preserved (proof of nested write_to, not wholesale overwrite).
            $delivery = get_option( 'dokan_delivery_time', [] );
            $this->assertSame(
                '__T_isolated',
                $delivery[ $target['legacy_key']['field'] ] ?? null,
                'Bridge write should have landed the new value in dokan_delivery_time.'
            );
            $this->assertSame(
                $fingerprints['dokan_delivery_time'],
                $delivery['fingerprint'] ?? null,
                'dokan_delivery_time fingerprint must remain untouched after a targeted write.'
            );

            // Both sibling options must remain pristine.
            foreach ( self::LEGACY_OPTIONS as $option ) {
                if ( 'dokan_delivery_time' === $option ) {
                    continue;
                }
                $row = get_option( $option, [] );
                $this->assertSame(
                    $fingerprints[ $option ],
                    $row['fingerprint'] ?? null,
                    "{$option} fingerprint must remain untouched — writes to dokan_delivery_time must not pollute the sibling option."
                );
                $this->assertArrayNotHasKey(
                    $target['legacy_key']['field'],
                    $row,
                    "Field {$target['legacy_key']['field']} leaked from dokan_delivery_time into {$option}."
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard for the 7-day delivery-time round-trip.
     *
     * Trace report finding: the in-progress non-CSV plugin-ui rewrite
     * COLLAPSED 7 separate `delivery_day_<weekday>` rows into a single
     * combined `delivery_days_schedule` field — a destructive reshape that
     * would break any deployment whose vendors had stored per-day rows. The
     * CSV-driven migration KEEPS the 7 separate `day_timer` fields, each
     * carrying a `{delivery_status, opening_time, closing_time}` compound
     * value.
     *
     * This test pins that the BRIDGE preserves the 7-field shape AND
     * round-trips each compound value opaquely in BOTH directions. A
     * production-shaped compound (delivery_status + opening + closing) is
     * stamped for every weekday on the legacy side, read out as 7 distinct
     * new-id slice entries, and stamped back to legacy via
     * `write_new_to_legacy` — every step must come out byte-identical. If a
     * future bridge change ever:
     *
     *   (a) collapses the 7 rows back into 1 (re-introducing the in-progress
     *       rewrite's destructive reshape); or
     *   (b) introduces a transformer that flattens, normalizes, or
     *       int-coerces nested time values
     *
     * this test fails loudly and forces the developer to back out the
     * change.
     *
     * Distinct from the loop in
     * `test_legacy_save_propagates_to_new_settings_for_shipment` because the
     * value here is the FULL COMPOUND shape and the assertion is on all 7
     * day rows TOGETHER — closer to the production payload the legacy AJAX
     * save and the new REST writer will hand to the bridge.
     */
    public function test_delivery_time_day_fields_round_trip(): void {
        $tab_fields = $this->fragment_for_tab( 'Shipment' );

        // Collect the 7 day_timer fields. The CSV declares them as separate
        // `legacy_key.field` rows under `dokan_delivery_time`.
        $weekdays   = [ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ];
        $day_fields = [];
        foreach ( $weekdays as $weekday ) {
            $legacy_field = 'delivery_day_' . $weekday;
            foreach ( $tab_fields as $element ) {
                if ( 'dokan_delivery_time' === $element['legacy_key']['option']
                    && $legacy_field === $element['legacy_key']['field']
                ) {
                    $day_fields[ $weekday ] = $element;
                    break;
                }
            }
        }
        $this->assertCount(
            7,
            $day_fields,
            'Expected 7 separate dokan_delivery_time.delivery_day_<weekday> rows in the CSV — the in-progress ' .
            'non-CSV rewrite collapsed these into a single delivery_days_schedule field, and a regression ' .
            'here means the destructive reshape has snuck back in.'
        );

        $map_filter = function ( $map ) use ( $day_fields ) {
            foreach ( $day_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Production-shaped compound value, one per weekday. Times are
            // distinct strings per day so the assertion catches any cross-day
            // bleed.
            $payload_legacy = [];
            $expected_per_day = [];
            foreach ( $day_fields as $weekday => $element ) {
                $compound = [
                    'delivery_status' => 'on',
                    'opening_time'    => sprintf( '%02d:00', array_search( $weekday, $weekdays, true ) + 8 ),
                    'closing_time'    => sprintf( '%02d:00', array_search( $weekday, $weekdays, true ) + 18 ),
                ];
                $payload_legacy[ $element['legacy_key']['field'] ] = $compound;
                $expected_per_day[ $weekday ]                       = $compound;
            }

            // ---- Forward direction: legacy → new (opaque, 7 rows preserved) ----
            update_option( 'dokan_delivery_time', $payload_legacy );

            $bridge = new LegacySettingsBridge();
            $slice  = $bridge->transform_legacy_payload_to_new( 'dokan_delivery_time', $payload_legacy );

            foreach ( $day_fields as $weekday => $element ) {
                $this->assertSame(
                    $expected_per_day[ $weekday ],
                    $slice[ $element['id'] ] ?? null,
                    "Bridge must NOT reshape, flatten, or normalize the dokan_delivery_time.{$element['legacy_key']['field']} compound on legacy→new. " .
                    'The CSV keeps 7 separate day_timer rows — a regression here means the in-progress 7→1 reshape has snuck back in.'
                );
            }

            // ---- Reverse direction: new → legacy (7 rows preserved) ----
            update_option( 'dokan_delivery_time', [] );

            $reverse_payload = [];
            foreach ( $day_fields as $weekday => $element ) {
                $reverse_payload[ $element['id'] ] = $expected_per_day[ $weekday ];
            }
            $bridge->write_new_to_legacy( $reverse_payload );

            $legacy = get_option( 'dokan_delivery_time', [] );
            $this->assertIsArray(
                $legacy,
                'dokan_delivery_time should be an array after bridge write.'
            );
            foreach ( $day_fields as $weekday => $element ) {
                $this->assertSame(
                    $expected_per_day[ $weekday ],
                    $legacy[ $element['legacy_key']['field'] ] ?? null,
                    "Bridge must NOT reshape, flatten, or normalize {$element['legacy_key']['field']} on new→legacy. " .
                    'Each weekday must land at its own top-level key inside dokan_delivery_time.'
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard against the legacy self-seeder clobbering bridge writes.
     *
     * Trace report finding: legacy `add_default_shipping_status()` writes 6
     * default rows to `dokan_shipping_status_setting` on the first empty
     * read. The bridge does NOT run the self-seeder — it only mirrors
     * writes. The seeder's gating clause (it only writes when the option is
     * empty) is what protects the bridge's writes in production: once the
     * bridge has stamped any non-empty value, the seeder cannot fire again.
     *
     * This test pins that contract: a bridge `write_new_to_legacy` for a
     * `dokan_shipping_status_setting` field survives a subsequent
     * `get_option` cycle (the read path the seeder would gate on). If a
     * future bridge change ever made the bridge fire the seeder, this
     * assertion would catch the clobber because the seeded defaults would
     * overwrite the `__T_*` sentinel.
     */
    public function test_shipping_status_self_seeder_does_not_overwrite_bridge_writes(): void {
        $tab_fields = $this->fragment_for_tab( 'Shipment' );

        $status_field = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_shipping_status_setting' === $element['legacy_key']['option']
                && 'enabled' === $element['legacy_key']['field']
            ) {
                $status_field = $element;
                break;
            }
        }
        $this->assertNotNull(
            $status_field,
            'Expected dokan_shipping_status_setting.enabled to be mapped into the Shipment tab.'
        );

        $map_filter = function ( $map ) use ( $status_field ) {
            $map[ $status_field['id'] ] = $status_field['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Start from a truly empty legacy option — the state the seeder
            // would fire from in production.
            delete_option( 'dokan_shipping_status_setting' );

            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $status_field['id'] => '__T_seeder_survives' ] );

            // A subsequent `get_option` MUST return the bridge's stamped
            // value, not seeded defaults. The seeder is gated on emptiness;
            // the bridge's write makes the option non-empty, so the seeder
            // cannot clobber.
            $legacy = get_option( 'dokan_shipping_status_setting', [] );
            $this->assertIsArray(
                $legacy,
                'dokan_shipping_status_setting should be an array after bridge write.'
            );
            $this->assertSame(
                '__T_seeder_survives',
                $legacy['enabled'] ?? null,
                'Bridge write to dokan_shipping_status_setting.enabled was clobbered by a subsequent read cycle — ' .
                'the legacy self-seeder must not run on top of a bridge-populated option.'
            );

            // A second read cycle to mimic Lite's `dokan_get_option` round
            // trip through the bridge's `hydrate_legacy_from_new`. The
            // bridge's hydrate path overwrites legacy with new-option
            // values, but here the new option already carries the bridge
            // mirror, so the round-trip should be a no-op on the stamped
            // value.
            $second_read = get_option( 'dokan_shipping_status_setting', [] );
            $this->assertSame(
                '__T_seeder_survives',
                $second_read['enabled'] ?? null,
                'Second read cycle clobbered the bridge write — a regression here means the seeder is racing the bridge.'
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard for Lite's cross-plugin reads of a Pro-owned option.
     *
     * Trace report finding: Lite's `Assets.php` (twice) and
     * `Dashboard/Templates/Orders.php` read the Pro-owned
     * `dokan_shipping_status_setting` option via the helper
     * `dokan_get_option( 'enabled', 'dokan_shipping_status_setting', 'off' )`.
     * That helper goes through `hydrate_legacy_from_new`, so a save via the
     * new UI must be visible on the very next legacy read.
     *
     * This test pins that contract end-to-end:
     *
     *   1. Save a value through the new path (`dokan_settings` + bridge mirror).
     *   2. Read it back via `dokan_get_option` — the exact call Lite uses.
     *   3. Assert the fresh bridge-written value comes through, NOT the
     *      `'off'` default fallback.
     *
     * If a future bridge change ever drops the `hydrate_legacy_from_new`
     * call from `dokan_get_option` (or the helper stops routing through the
     * bridge), this test fails loudly. The fix would be to restore the
     * cross-plugin read coupling — Lite's order list and asset bootstrap
     * depend on it.
     */
    public function test_shipping_status_lite_cross_plugin_read_sees_bridge_writes(): void {
        $tab_fields = $this->fragment_for_tab( 'Shipment' );

        $status_field = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_shipping_status_setting' === $element['legacy_key']['option']
                && 'enabled' === $element['legacy_key']['field']
            ) {
                $status_field = $element;
                break;
            }
        }
        $this->assertNotNull(
            $status_field,
            'Expected dokan_shipping_status_setting.enabled to be mapped into the Shipment tab.'
        );

        $map_filter = function ( $map ) use ( $status_field ) {
            $map[ $status_field['id'] ] = $status_field['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Seed `dokan_settings` with the new-UI value AND mirror to
            // legacy via the bridge — this is the exact path the new REST
            // writer will take.
            update_option( 'dokan_admin_settings', [ $status_field['id'] => 'on' ] );

            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $status_field['id'] => 'on' ] );

            // ---- Read 1: direct get_option ----
            // This is how the trace report flagged Lite reads the option —
            // straight `get_option('dokan_shipping_status_setting')`. The
            // bridge has mirrored the write through, so the value is in the
            // legacy option directly.
            $direct = get_option( 'dokan_shipping_status_setting', [] );
            $this->assertIsArray(
                $direct,
                'dokan_shipping_status_setting should be an array after bridge write.'
            );
            $this->assertSame(
                'on',
                $direct['enabled'] ?? null,
                'A direct get_option on dokan_shipping_status_setting did NOT see the bridge-written value — ' .
                'Lite\'s Assets.php and Orders.php cross-plugin reads would still see stale defaults.'
            );

            // ---- Read 2: dokan_get_option (the helper Lite actually uses) ----
            // This routes through `hydrate_legacy_from_new`, which projects
            // the new option into the legacy shape on read.
            $via_helper = dokan_get_option( 'enabled', 'dokan_shipping_status_setting', 'off' );
            $this->assertSame(
                'on',
                $via_helper,
                'dokan_get_option did NOT see the bridge-written value — the cross-plugin coupling Lite ' .
                'depends on is broken (Assets.php allow_shipment, Orders.php allow_shipment).'
            );
            $this->assertNotSame(
                'off',
                $via_helper,
                'dokan_get_option returned the default fallback instead of the fresh bridge value — ' .
                'the hydrate path is missing or short-circuiting.'
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Stable ksort: PHP's sort functions mutate by reference and return bool,
     * which makes inline use awkward. This helper returns a sorted copy so
     * the section-breakdown assertion stays a one-liner.
     *
     * @param array<string,mixed> $input
     *
     * @return array<string,mixed>
     */
    private function ksort_copy( array $input ): array {
        ksort( $input );
        return $input;
    }
}
