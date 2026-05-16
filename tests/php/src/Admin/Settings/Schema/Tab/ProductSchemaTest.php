<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema\Tab;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Parity tests for the Product tab fields wired through the CSV-derived
 * fragment + LegacySettingsBridge.
 *
 * The Product tab carries 28 fields fanned across FOUR legacy wp_options:
 *
 *   - `dokan_printful`              → 10 fields (1 compound `app` field plus
 *                                        the Size Guide sub_section + 8
 *                                        color/text/select fields)
 *   - `dokan_quote_settings`        → 8 fields (2 sub_section + 6
 *                                        switcher/number fields)
 *   - `dokan_product_advertisement` → 7 fields (`total_available_slot`,
 *                                        `expire_after_days`,
 *                                        `per_product_enabled`, `cost`,
 *                                        `featured`, `catalog_priority`,
 *                                        `hide_out_of_stock_items`)
 *   - `dokan_wholesale`             → 3 fields (`wholesale_price_display`,
 *                                        `display_price_in_shop_archieve`,
 *                                        `need_approval_for_wholesale_customer`)
 *
 * Trace-driven hazards (see `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`):
 *
 *  1. **`dokan_printful` 1-of-11 read-site mismatch:** the in-progress non-CSV
 *     plugin-ui schema renamed 10 of 11 Printful fields (e.g.
 *     `printful_client_id`→`app_id`, `printful_secret_key`→`app_secret`,
 *     `printful_size_guide_*`→`size_guide_*`). The CSV-driven migration
 *     sidesteps the mismatch by keeping the legacy option+field as the
 *     `legacy_key` — the bridge round-trips against the ORIGINAL storage
 *     names, not the renamed in-progress schema.
 *     `test_legacy_keys_span_four_source_options` and
 *     `test_legacy_save_propagates_to_new_settings_for_product` together pin
 *     down that every Printful row reads from AND writes to `dokan_printful`
 *     under the original CSV-declared field name.
 *
 *  2. **`dokan_printful` half-paired sensitive-key wrapper:** legacy GET
 *     masks `printful_secret_key` as `"[BLOCKED: Sensitive key]"` but
 *     `printful_client_id` is NOT masked. In the CSV slice both credentials
 *     are NESTED inside the compound `app` field (`field_type: social`) — a
 *     single top-level row, not two. The bridge round-trips the whole
 *     compound opaquely.
 *     `test_printful_credentials_round_trip_opaquely` proves the bridge does
 *     NOT mask, wrap, or strip either nested credential. If a future bridge
 *     change introduces masking here, the test fails loudly and forces the
 *     developer to move the asymmetric wrapper into the new REST GET layer
 *     (the correct location for response-side masking) and pair both
 *     credentials there (the legacy half-pair is a bug to fix, not a contract
 *     to preserve).
 *
 *  3. **`dokan_product_advertisement` fail-closed pre-save validator:**
 *     `dokan_before_saving_settings` priority 20 can `wp_send_json_error(…,
 *     400)` and `wp_die` for invalid `total_available_slot`,
 *     `expire_after_days`, or `cost`. The legacy AJAX path fires the
 *     validator; the bridge does NOT. Validation belongs in the new REST
 *     writer's `sanitize_callback`/`validate_callback`. The bridge stays
 *     storage-only. Deferred follow-up — intentionally NOT asserted here.
 *
 *  4. **`dokan_product_advertisement` four default flips in the in-progress
 *     non-CSV schema:** the renamed schema flipped `total_available_slot
 *     100→-1`, `expire_after_days 10→-1`, `featured off→on`, `cost 15→0`.
 *     The CSV-driven migration uses the CSV's `default` column, which
 *     restores the LEGACY stored defaults (100/10/off/15). This is the
 *     contract the new tab must ship with — a vendor with no override should
 *     see the same numbers they saw under the legacy UI.
 *     `test_product_advertisement_defaults_match_legacy_stored_values` pins
 *     the four defaults verbatim. If a future regenerator pass silently
 *     restores the flipped values, this test fails loudly.
 *
 *  5. **`dokan_product_advertisement` post-save `create_advertisement_base_product`:**
 *     `dokan_after_saving_settings` priority 11 inserts a hidden wp_posts row
 *     to act as the advertisement's base product. Legacy AJAX path fires
 *     this; bridge doesn't. Deferred follow-up for the new REST writer
 *     (decide whether to keep the side effect or drop it).
 *
 *  6. **`dokan_wholesale` silent enum-value rename:** the in-progress non-CSV
 *     schema silently rewrote the `wholesale_price_display` enum value
 *     `all_user`→`all_users`. The CSV migration preserves legacy values
 *     verbatim. `test_wholesale_legacy_enum_values_round_trip_unchanged`
 *     proves the bridge does NOT rename enum strings — a write of `all_user`
 *     (legacy spelling, with the underscore typo) round-trips byte-identical
 *     in both directions. If a future bridge change adds a transformer that
 *     pluralizes enum values, this test fails loudly.
 *
 * Sentinel discipline:
 *   - All test values use `__T_*` prefixes so accidental persistence is
 *     trivially scrubbed and grep-detectable.
 *   - All four legacy options + `dokan_settings` are reset between tests.
 *
 * `test_writes_to_one_legacy_option_do_not_pollute_others` is the four-option
 * generalization of the cross-section isolation guard. It picks a
 * `dokan_printful` field (carries the half-paired credential concern) and
 * proves a targeted bridge write there does not leak into the three sibling
 * legacy options.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 * @group settings-product
 */
class ProductSchemaTest extends DokanTestCase {

    /**
     * The complete set of legacy wp_options that this tab's fields read from
     * and write to. Used in `set_up`/`tear_down` and the isolation guard.
     *
     * @var array<int,string>
     */
    private const LEGACY_OPTIONS = [
        'dokan_printful',
        'dokan_quote_settings',
        'dokan_product_advertisement',
        'dokan_wholesale',
    ];

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
        delete_option( 'dokan_settings' );
    }

    public function tear_down() {
        foreach ( self::LEGACY_OPTIONS as $option ) {
            delete_option( $option );
        }
        delete_option( 'dokan_settings' );
        parent::tear_down();
    }

    public function test_tab_product_has_expected_field_count(): void {
        $this->assertCount(
            28,
            $this->fragment_for_tab( 'Product' ),
            'Expected 28 Product fields in the generated CSV fragment.'
        );
    }

    public function test_legacy_keys_span_four_source_options(): void {
        $sources = [];
        foreach ( $this->fragment_for_tab( 'Product' ) as $element ) {
            $sources[ $element['legacy_key']['option'] ] = ( $sources[ $element['legacy_key']['option'] ] ?? 0 ) + 1;
        }

        // Every legacy option that the inventory says feeds the Product tab
        // must appear at the exact CSV-derived count. If a row is moved
        // between tabs or its legacy_key is rewritten (e.g. a regenerator
        // pass quietly renames `printful_secret_key`→`app_secret`), the
        // counts shift and this test fails loudly. This is the Product-tab
        // guard against the Printful 10-of-11 schema rename surfaced in the
        // trace.
        $this->assertSame(
            [
                'dokan_printful'              => 10,
                'dokan_product_advertisement' => 7,
                'dokan_quote_settings'        => 8,
                'dokan_wholesale'             => 3,
            ],
            $this->ksort_copy( $sources ),
            'Product tab section breakdown drifted from the frozen inventory.'
        );
    }

    public function test_no_id_collisions_within_tab(): void {
        $ids    = array_column( $this->fragment_for_tab( 'Product' ), 'id' );
        $unique = array_unique( $ids );

        $this->assertSame(
            count( $ids ),
            count( $unique ),
            'Product tab has duplicate ids: ' . implode( ',', array_diff_assoc( $ids, $unique ) )
        );
    }

    public function test_legacy_save_propagates_to_new_settings_for_product(): void {
        $tab_fields = $this->fragment_for_tab( 'Product' );

        $map_filter = function ( $map ) use ( $tab_fields ) {
            foreach ( $tab_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            $bridge = new LegacySettingsBridge();

            // Opaque sentinel — used even for credential-bearing compound
            // fields (e.g. `dokan_printful.app` carrying `printful_client_id`
            // / `printful_secret_key`) because the bridge is opaque about
            // content. If a future bridge change ever introduces masking
            // here, this assertion fails loudly.
            foreach ( $tab_fields as $element ) {
                $legacy_option = $element['legacy_key']['option'];
                $legacy_field  = $element['legacy_key']['field'];
                $new_id        = $element['id'];
                $sentinel      = '__T_parity_' . $new_id;

                // Seed only the relevant legacy option per iteration so
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

    public function test_new_save_propagates_back_to_legacy_for_product(): void {
        $tab_fields = $this->fragment_for_tab( 'Product' );

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
        $tab_fields = $this->fragment_for_tab( 'Product' );

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
            // would erase it. Four-option generalization of the cross-section
            // isolation guards in prior tab tests.
            $fingerprints = [];
            foreach ( self::LEGACY_OPTIONS as $option ) {
                $fingerprints[ $option ] = 'fp_' . $option;
                update_option( $option, [ 'fingerprint' => $fingerprints[ $option ] ] );
            }

            // Pick a dokan_printful field — carries the half-paired
            // sensitive-key wrapper concern surfaced in the trace. A targeted
            // write here should leave all three sibling options completely
            // untouched.
            $target = null;
            foreach ( $tab_fields as $element ) {
                if ( 'dokan_printful' === $element['legacy_key']['option'] ) {
                    $target = $element;
                    break;
                }
            }
            $this->assertNotNull( $target, 'No dokan_printful field found in Product tab.' );

            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $target['id'] => '__T_isolated' ] );

            // The targeted option got the new value, with its fingerprint
            // preserved (proof of nested write_to, not wholesale overwrite).
            $printful = get_option( 'dokan_printful', [] );
            $this->assertSame(
                '__T_isolated',
                $printful[ $target['legacy_key']['field'] ] ?? null,
                'Bridge write should have landed the new value in dokan_printful.'
            );
            $this->assertSame(
                $fingerprints['dokan_printful'],
                $printful['fingerprint'] ?? null,
                'dokan_printful fingerprint must remain untouched after a targeted write.'
            );

            // All three sibling options must remain pristine.
            foreach ( self::LEGACY_OPTIONS as $option ) {
                if ( 'dokan_printful' === $option ) {
                    continue;
                }
                $row = get_option( $option, [] );
                $this->assertSame(
                    $fingerprints[ $option ],
                    $row['fingerprint'] ?? null,
                    "{$option} fingerprint must remain untouched — writes to dokan_printful must not pollute the sibling option."
                );
                $this->assertArrayNotHasKey(
                    $target['legacy_key']['field'],
                    $row,
                    "Field {$target['legacy_key']['field']} leaked from dokan_printful into {$option}."
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard for the Printful compound credential round-trip.
     *
     * Trace report finding: `dokan_printful` had a 10-of-11 schema mismatch
     * in the in-progress non-CSV plugin-ui rewrite — including a renamed pair
     * `printful_client_id`→`app_id` and `printful_secret_key`→`app_secret`.
     * The CSV migration sidesteps the rename by holding both credentials
     * NESTED inside a single compound `app` field (`field_type: social`)
     * keyed by the original legacy option `dokan_printful.app`.
     *
     * Crucially, legacy GET masks `printful_secret_key` as
     * `"[BLOCKED: Sensitive key]"` but does NOT mask `printful_client_id` —
     * an asymmetric, half-paired wrapper that the trace flagged as a bug to
     * fix in the new REST GET layer rather than a contract to preserve.
     *
     * This test pins that the BRIDGE is opaque about both credentials. A
     * production-shaped compound (both `client_id` and `secret_key`) goes
     * in, the SAME shape comes out, in BOTH directions. If a future bridge
     * change introduces a transformer that masks `printful_secret_key`, this
     * test fails loudly and forces the developer to:
     *
     *   (a) move the masking into the correct layer — the new REST GET
     *       `response_sanitize_callback`; and
     *   (b) pair the masking properly across BOTH `client_id` AND
     *       `secret_key` rather than carrying forward the legacy half-pair.
     *
     * Distinct from the loop in
     * `test_legacy_save_propagates_to_new_settings_for_product` because the
     * value here is the FULL COMPOUND shape (both nested credentials at
     * once) rather than a scalar sentinel — closer to the production payload
     * the legacy AJAX save and the new REST writer will hand to the bridge.
     */
    public function test_printful_credentials_round_trip_opaquely(): void {
        $tab_fields = $this->fragment_for_tab( 'Product' );

        $printful_app = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_printful' === $element['legacy_key']['option']
                && 'app' === $element['legacy_key']['field']
            ) {
                $printful_app = $element;
                break;
            }
        }
        $this->assertNotNull(
            $printful_app,
            'Expected dokan_printful.app to be mapped into the Product tab as the compound credential field.'
        );

        $map_filter = function ( $map ) use ( $printful_app ) {
            $map[ $printful_app['id'] ] = $printful_app['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Production-shaped compound value. Both `printful_client_id`
            // (NOT masked on legacy GET) and `printful_secret_key` (masked
            // on legacy GET) are present. The bridge must NOT touch either.
            $compound = [
                'printful_client_id'  => 'pf_client_id_a1b2c3d4e5f6_TEST',
                'printful_secret_key' => 'pf_secret_key_a1b2c3d4e5f6_LIVE',
            ];

            // ---- Forward direction: legacy → new (opaque) ----
            update_option( 'dokan_printful', [ 'app' => $compound ] );

            $bridge = new LegacySettingsBridge();
            $slice  = $bridge->transform_legacy_payload_to_new(
                'dokan_printful',
                [ 'app' => $compound ]
            );

            $this->assertSame(
                $compound,
                $slice[ $printful_app['id'] ] ?? null,
                'Bridge must NOT mask, wrap, or reshape dokan_printful.app on legacy→new. ' .
                'The asymmetric printful_secret_key sensitive-key wrapper is the new REST GET ' .
                'layer\'s concern, not the bridge\'s — and a future fix should pair masking ' .
                'across BOTH credentials there, not just the secret.'
            );
            $this->assertSame(
                'pf_client_id_a1b2c3d4e5f6_TEST',
                $slice[ $printful_app['id'] ]['printful_client_id'] ?? null,
                'Nested printful_client_id must round-trip unchanged through the bridge.'
            );
            $this->assertSame(
                'pf_secret_key_a1b2c3d4e5f6_LIVE',
                $slice[ $printful_app['id'] ]['printful_secret_key'] ?? null,
                'Nested printful_secret_key must round-trip unchanged through the bridge — ' .
                'no `[BLOCKED: Sensitive key]` substitution at the storage layer.'
            );

            // ---- Reverse direction: new → legacy (opaque) ----
            // Clear legacy so the reverse write is observable.
            update_option( 'dokan_printful', [] );

            $bridge->write_new_to_legacy( [ $printful_app['id'] => $compound ] );

            $legacy = get_option( 'dokan_printful', [] );
            $this->assertIsArray(
                $legacy,
                'dokan_printful should be an array after bridge write.'
            );
            $this->assertSame(
                $compound,
                $legacy['app'] ?? null,
                'Bridge must NOT mask, wrap, or reshape dokan_printful.app on new→legacy.'
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard against silent enum-value renaming on dokan_wholesale.
     *
     * Trace report finding: the in-progress non-CSV plugin-ui rewrite
     * silently rewrote the `wholesale_price_display` enum value
     * `all_user`→`all_users` — a stored value typo that the rewrite "fixed"
     * by renaming, which would break any deployment whose vendors had
     * already selected the legacy value. The CSV-driven migration preserves
     * legacy values verbatim.
     *
     * This test pins that the bridge does NOT pluralize, normalize, or
     * otherwise transform enum strings. The exact legacy value `all_user`
     * (with the underscore typo, NOT `all_users`) is written through the
     * bridge in BOTH directions and asserted byte-identical on the other
     * side. If a future bridge change introduces a normalization
     * transformer, this test fails loudly and forces the developer to
     * either:
     *
     *   (a) drop the transformer (preserve legacy spelling); or
     *   (b) consciously add a migration shim that reads BOTH spellings on
     *       legacy GET and writes a single canonical spelling on legacy
     *       SET — at the REST/UI layer, NOT the bridge.
     */
    public function test_wholesale_legacy_enum_values_round_trip_unchanged(): void {
        $tab_fields = $this->fragment_for_tab( 'Product' );

        $wholesale_radio = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_wholesale' === $element['legacy_key']['option']
                && 'wholesale_price_display' === $element['legacy_key']['field']
            ) {
                $wholesale_radio = $element;
                break;
            }
        }
        $this->assertNotNull(
            $wholesale_radio,
            'Expected dokan_wholesale.wholesale_price_display to be mapped into the Product tab as a radio field.'
        );

        $map_filter = function ( $map ) use ( $wholesale_radio ) {
            $map[ $wholesale_radio['id'] ] = $wholesale_radio['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // The legacy enum value with the underscore typo. The
            // in-progress non-CSV rewrite would rename this to `all_users`;
            // the bridge MUST NOT.
            $legacy_value = 'all_user';

            // ---- Forward direction: legacy → new (no rename) ----
            update_option( 'dokan_wholesale', [ 'wholesale_price_display' => $legacy_value ] );

            $bridge = new LegacySettingsBridge();
            $slice  = $bridge->transform_legacy_payload_to_new(
                'dokan_wholesale',
                [ 'wholesale_price_display' => $legacy_value ]
            );

            $this->assertSame(
                $legacy_value,
                $slice[ $wholesale_radio['id'] ] ?? null,
                'Bridge must NOT pluralize or normalize wholesale_price_display on legacy→new. ' .
                'The legacy enum spelling `all_user` (with underscore typo) must round-trip ' .
                'byte-identical — vendor selections must not silently shift values during migration.'
            );

            // ---- Reverse direction: new → legacy (no rename) ----
            // Clear legacy so the reverse write is observable.
            update_option( 'dokan_wholesale', [] );

            $bridge->write_new_to_legacy( [ $wholesale_radio['id'] => $legacy_value ] );

            $legacy = get_option( 'dokan_wholesale', [] );
            $this->assertIsArray(
                $legacy,
                'dokan_wholesale should be an array after bridge write.'
            );
            $this->assertSame(
                $legacy_value,
                $legacy['wholesale_price_display'] ?? null,
                'Bridge must NOT pluralize or normalize wholesale_price_display on new→legacy.'
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard against the four product-advertisement default flips.
     *
     * Trace report finding: the in-progress non-CSV plugin-ui rewrite
     * flipped four product_advertisement defaults vs. the legacy stored
     * values:
     *
     *   - `total_available_slot`: 100 → -1
     *   - `expire_after_days`:    10  → -1
     *   - `featured`:             off → on
     *   - `cost`:                 15  → 0
     *
     * The CSV-driven migration uses the CSV's `default` column, which
     * RESTORES the legacy stored defaults. This test pins those four
     * defaults verbatim in the generated fragment so a future regenerator
     * pass that silently restores the flipped values fails loudly.
     *
     * Distinct from the parity tests above because this asserts on the
     * SHAPE of the fragment itself (the static schema contract), not on
     * bridge behavior with seeded data.
     */
    public function test_product_advertisement_defaults_match_legacy_stored_values(): void {
        $expected_defaults = [
            'total_available_slot' => '100',
            'expire_after_days'    => '10',
            'featured'             => 'off',
            'cost'                 => '15',
        ];

        $found = [];
        foreach ( $this->fragment_for_tab( 'Product' ) as $element ) {
            if ( 'dokan_product_advertisement' !== $element['legacy_key']['option'] ) {
                continue;
            }
            $field = $element['legacy_key']['field'];
            if ( ! array_key_exists( $field, $expected_defaults ) ) {
                continue;
            }
            $found[ $field ] = $element['default'] ?? null;
        }

        $this->assertSame(
            $this->ksort_copy( $expected_defaults ),
            $this->ksort_copy( $found ),
            'dokan_product_advertisement defaults must match the LEGACY stored values, ' .
            'not the in-progress non-CSV rewrite\'s flipped values ' .
            '(total_available_slot 100, expire_after_days 10, featured off, cost 15). ' .
            'A regression here means a vendor with no override would silently see ' .
            'different numbers under the new tab vs. the legacy one.'
        );
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
