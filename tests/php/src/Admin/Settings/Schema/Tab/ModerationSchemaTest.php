<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema\Tab;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Parity tests for the Moderation tab fields wired through the CSV-derived
 * fragment + LegacySettingsBridge.
 *
 * The Moderation tab fans 18 visible fields across FOUR legacy wp_options. It
 * is the smallest four-option fan-out in the migration so far and introduces
 * three trace-confirmed hazards that belong in DOWNSTREAM layers (new REST
 * GET sanitization, new REST writer side-effect dispatch, Pro-side module
 * activation), NOT in the bridge:
 *
 *   - `dokan_live_chat`            → 8 fields (enable, provider, app_id,
 *                                     app_secret, wa_opening_method,
 *                                     wa_pre_filled_message,
 *                                     chat_button_seller_page,
 *                                     chat_button_product_page)
 *   - `dokan_rma`                  → 5 fields (rma_order_status,
 *                                     rma_enable_refund_request,
 *                                     rma_enable_coupon_request,
 *                                     rma_reasons, rma_policy)
 *   - `dokan_store_support_setting`→ 3 fields (enabled_for_customer_order,
 *                                     store_support_product_page,
 *                                     support_button_label)
 *   - `dokan_report_abuse`         → 2 fields (reported_by_logged_in_users_only,
 *                                     abuse_reasons)
 *
 * Trace-driven hazards (see `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`):
 *
 *  1. **`dokan_live_chat` plaintext credentials in GET:** `app_id` and
 *     `app_secret` are returned UNMASKED on the legacy AJAX GET path.
 *     `secret_text:true` (legacy CSV `OtherInfoJSON`) / `variant:'show_hide'`
 *     (in-progress non-CSV plugin-ui schema) are UI-only flags with no
 *     `response_sanitize_callback`. The bridge round-trips the values
 *     opaquely — masking the response is the new REST GET layer's
 *     responsibility, NOT the bridge's. The defensive test
 *     `test_live_chat_credentials_round_trip_opaquely` pins this contract
 *     so a future bridge change that quietly injects a masker would fail
 *     loudly here, forcing the developer to move the masking into the
 *     correct layer.
 *
 *  2. **`dokan_rma` per-row action dispatch on save:** the legacy AJAX save
 *     handler at `Settings.php:200` fires
 *     `do_action( 'dokan_after_saving_settings', $option_name, $option_value, $old_options )`
 *     once per save, and a priority-10 listener iterates each row in
 *     `rma_reasons` and dispatches `dokan_pro_register_rms_reason` per row.
 *     The bridge does not fire `dokan_after_saving_settings` because it is
 *     storage-layer; the action is a save-handler concern. When the new
 *     REST writer lands, it MUST replicate the per-row dispatch so Pro
 *     listeners continue to fire. Tracked as a deferred follow-up — NOT
 *     asserted here because the bridge has no opinion on side effects.
 *
 *  3. **`dokan_rma` orphan schema class:** `RmaSettingsSchema.php` exists
 *     but is never instantiated; the CSV-driven schema replaces it with
 *     concrete bridge mappings. No bridge-layer action required. Documented
 *     here so future readers do not try to wire it up — the orphan class
 *     should be removed in a cleanup task once the CSV migration is fully
 *     adopted.
 *
 *  4. **`dokan_report_abuse` module-activation default seeding:**
 *     `dokan_activated_module_report_abuse` populates `abuse_reasons` with a
 *     non-empty list on module activation. The CSV default for the
 *     `moderation_report_abuse_abuse_reasons` field is `''` (empty string),
 *     which is correct for the SCHEMA default — at activation the Pro
 *     module hook seeds the live option. The bridge never touches the
 *     activation hook; if a fresh install ever shows an empty abuse
 *     reasons list, the regression is in the module activation hook, not
 *     the bridge. NOT asserted here.
 *
 *  5. **`dokan_live_chat` 6 renames + 2 drops in the in-progress non-CSV
 *     plugin-ui schema:** the CSV-driven migration uses legacy names as
 *     `legacy_key.field`, so those renames do not affect the bridge layer.
 *     If a future task adopts the new names, this test should still pass
 *     as long as `legacy_key.field` stays at the legacy spelling.
 *
 * Sentinel discipline:
 *   - All test values use `__T_*` prefixes so accidental persistence is
 *     trivially scrubbed and grep-detectable.
 *   - All four legacy options + `dokan_settings` are reset between tests.
 *
 * `test_writes_to_one_legacy_option_do_not_pollute_others` is the
 * cross-section isolation guard generalized to four options — it picks a
 * `dokan_live_chat` field (the largest sub-section in the tab and the one
 * carrying the credential round-trip concern) and proves a targeted bridge
 * write there does not leak into the three sibling legacy options.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 * @group settings-moderation
 */
class ModerationSchemaTest extends DokanTestCase {

    /**
     * The complete set of legacy wp_options that this tab's fields read from
     * and write to. Used in `set_up`/`tear_down` and the isolation guard.
     *
     * @var array<int,string>
     */
    private const LEGACY_OPTIONS = [
        'dokan_live_chat',
        'dokan_rma',
        'dokan_store_support_setting',
        'dokan_report_abuse',
    ];

    /**
     * Absolute path to the generated fragment.
     */
    private function fragment_path(): string {
        $root = defined( 'DOKAN_DIR' ) ? DOKAN_DIR : dirname( __DIR__, 6 );
        return $root . '/includes/Admin/Settings/Schema/Generated/csv_fields.php';
    }

    /**
     * Load the Moderation slice of the generated fragment.
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

    public function test_tab_moderation_has_expected_field_count(): void {
        $this->assertCount(
            18,
            $this->fragment_for_tab( 'Moderation' ),
            'Expected 18 Moderation fields in the generated CSV fragment.'
        );
    }

    public function test_legacy_keys_span_four_source_options(): void {
        $sources = [];
        foreach ( $this->fragment_for_tab( 'Moderation' ) as $element ) {
            $sources[ $element['legacy_key']['option'] ] = ( $sources[ $element['legacy_key']['option'] ] ?? 0 ) + 1;
        }

        // Every legacy option that the inventory says feeds the Moderation tab
        // must appear at the exact CSV-derived count. If a row is moved
        // between tabs or its legacy_key is rewritten, the counts shift and
        // this test fails loudly.
        $this->assertSame(
            [
                'dokan_live_chat'             => 8,
                'dokan_report_abuse'          => 2,
                'dokan_rma'                   => 5,
                'dokan_store_support_setting' => 3,
            ],
            $this->ksort_copy( $sources ),
            'Moderation tab section breakdown drifted from the frozen inventory.'
        );
    }

    public function test_no_id_collisions_within_tab(): void {
        $ids    = array_column( $this->fragment_for_tab( 'Moderation' ), 'id' );
        $unique = array_unique( $ids );

        $this->assertSame(
            count( $ids ),
            count( $unique ),
            'Moderation tab has duplicate ids: ' . implode( ',', array_diff_assoc( $ids, $unique ) )
        );
    }

    public function test_legacy_save_propagates_to_new_settings_for_moderation(): void {
        $tab_fields = $this->fragment_for_tab( 'Moderation' );

        $map_filter = function ( $map ) use ( $tab_fields ) {
            foreach ( $tab_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            $bridge = new LegacySettingsBridge();

            // Opaque sentinel — used even for credential fields
            // (`app_id`/`app_secret`) because the bridge is opaque about
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

    public function test_new_save_propagates_back_to_legacy_for_moderation(): void {
        $tab_fields = $this->fragment_for_tab( 'Moderation' );

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
        $tab_fields = $this->fragment_for_tab( 'Moderation' );

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
            // isolation guards in GeneralSchemaTest / AppearanceSchemaTest.
            $fingerprints = [];
            foreach ( self::LEGACY_OPTIONS as $option ) {
                $fingerprints[ $option ] = 'fp_' . $option;
                update_option( $option, [ 'fingerprint' => $fingerprints[ $option ] ] );
            }

            // Pick a dokan_live_chat field — the largest sub-section in the
            // Moderation tab and the one carrying the trace-confirmed
            // credential round-trip concern. A targeted write here should
            // leave all three sibling options completely untouched.
            $target = null;
            foreach ( $tab_fields as $element ) {
                if ( 'dokan_live_chat' === $element['legacy_key']['option'] ) {
                    $target = $element;
                    break;
                }
            }
            $this->assertNotNull( $target, 'No dokan_live_chat field found in Moderation tab.' );

            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $target['id'] => '__T_isolated' ] );

            // The targeted option got the new value, with its fingerprint
            // preserved (proof of nested write_to, not wholesale overwrite).
            $live_chat = get_option( 'dokan_live_chat', [] );
            $this->assertSame(
                '__T_isolated',
                $live_chat[ $target['legacy_key']['field'] ] ?? null,
                'Bridge write should have landed the new value in dokan_live_chat.'
            );
            $this->assertSame(
                $fingerprints['dokan_live_chat'],
                $live_chat['fingerprint'] ?? null,
                'dokan_live_chat fingerprint must remain untouched after a targeted write.'
            );

            // All three sibling options must remain pristine.
            foreach ( self::LEGACY_OPTIONS as $option ) {
                if ( 'dokan_live_chat' === $option ) {
                    continue;
                }
                $row = get_option( $option, [] );
                $this->assertSame(
                    $fingerprints[ $option ],
                    $row['fingerprint'] ?? null,
                    "{$option} fingerprint must remain untouched — writes to dokan_live_chat must not pollute the sibling option."
                );
                $this->assertArrayNotHasKey(
                    $target['legacy_key']['field'],
                    $row,
                    "Field {$target['legacy_key']['field']} leaked from dokan_live_chat into {$option}."
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard for the live-chat credential round-trip contract.
     *
     * Trace report finding: `dokan_live_chat.app_id` and `app_secret` are
     * returned UNMASKED on the legacy AJAX GET path. The `secret_text:true`
     * (CSV `OtherInfoJSON`) / `variant:'show_hide'` (in-progress non-CSV
     * plugin-ui schema) flags are UI-only — there is no
     * `response_sanitize_callback` registered for either field.
     *
     * The bridge is storage-layer; it round-trips bytes. Response masking is
     * the new REST GET layer's concern. This test pins that contract: a raw
     * value goes in, the same raw value comes out, BOTH directions. If a
     * future bridge change ever introduces a transformer that masks or
     * wraps credential values, this test fails loudly and the developer must
     * consciously move the masking into the correct layer (REST GET
     * `response_sanitize_callback`).
     *
     * Distinct from the loop in
     * `test_legacy_save_propagates_to_new_settings_for_moderation` and
     * `test_new_save_propagates_back_to_legacy_for_moderation` because it
     * uses a CREDENTIAL-LIKE value (looks like a real API key/secret) rather
     * than a `__T_parity_*` sentinel — closer to what would actually flow
     * through in production.
     */
    public function test_live_chat_credentials_round_trip_opaquely(): void {
        $tab_fields = $this->fragment_for_tab( 'Moderation' );

        // Locate the app_id and app_secret fields. If either is ever moved
        // out of dokan_live_chat the inventory test catches it; this test
        // only runs against the canonical pair.
        $app_id_field     = null;
        $app_secret_field = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_live_chat' !== $element['legacy_key']['option'] ) {
                continue;
            }
            if ( 'app_id' === $element['legacy_key']['field'] ) {
                $app_id_field = $element;
            } elseif ( 'app_secret' === $element['legacy_key']['field'] ) {
                $app_secret_field = $element;
            }
        }
        $this->assertNotNull(
            $app_id_field,
            'Expected dokan_live_chat.app_id to be mapped into the Moderation tab.'
        );
        $this->assertNotNull(
            $app_secret_field,
            'Expected dokan_live_chat.app_secret to be mapped into the Moderation tab.'
        );

        $map_filter = function ( $map ) use ( $app_id_field, $app_secret_field ) {
            $map[ $app_id_field['id'] ]     = $app_id_field['legacy_key'];
            $map[ $app_secret_field['id'] ] = $app_secret_field['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Credential-shaped values — long enough that any masking pass
            // would be impossible to confuse with a passthrough (no leading
            // `__T_*`).
            $raw_app_id     = 'lc_app_id_a1b2c3d4e5f6_LIVE';
            $raw_app_secret = 'fake_app_secret_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

            // ---- Forward direction: legacy → new (opaque) ----
            update_option(
                'dokan_live_chat',
                [
                    'app_id'     => $raw_app_id,
                    'app_secret' => $raw_app_secret,
                ]
            );

            $bridge = new LegacySettingsBridge();
            $slice  = $bridge->transform_legacy_payload_to_new(
                'dokan_live_chat',
                [
                    'app_id'     => $raw_app_id,
                    'app_secret' => $raw_app_secret,
                ]
            );

            $this->assertSame(
                $raw_app_id,
                $slice[ $app_id_field['id'] ] ?? null,
                'Bridge must NOT mask or wrap dokan_live_chat.app_id on legacy→new. ' .
                'Masking is the new REST GET layer\'s concern, not the bridge\'s.'
            );
            $this->assertSame(
                $raw_app_secret,
                $slice[ $app_secret_field['id'] ] ?? null,
                'Bridge must NOT mask or wrap dokan_live_chat.app_secret on legacy→new. ' .
                'Masking is the new REST GET layer\'s concern, not the bridge\'s.'
            );

            // ---- Reverse direction: new → legacy (opaque) ----
            $bridge->write_new_to_legacy(
                [
                    $app_id_field['id']     => $raw_app_id,
                    $app_secret_field['id'] => $raw_app_secret,
                ]
            );

            $live_chat = get_option( 'dokan_live_chat', [] );
            $this->assertSame(
                $raw_app_id,
                $live_chat['app_id'] ?? null,
                'Bridge must NOT mask or wrap dokan_live_chat.app_id on new→legacy.'
            );
            $this->assertSame(
                $raw_app_secret,
                $live_chat['app_secret'] ?? null,
                'Bridge must NOT mask or wrap dokan_live_chat.app_secret on new→legacy.'
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard for the rma_reasons repeater round-trip.
     *
     * `dokan_rma.rma_reasons` is a `repeatable` field type — the legacy AJAX
     * save stores the WHOLE array as the value at `dokan_rma.rma_reasons`.
     * The CSV-derived fragment uses a flat (single-segment) `legacy_key.field`
     * (not a deep path), so the bridge stores and reads the nested array as
     * an opaque value.
     *
     * This test sends a synthetic repeater payload, writes through both
     * directions, and asserts structural equality. If the generator ever
     * emits a deep-path `legacy_key` (e.g. `rma_reasons.0.value`) for this
     * field, or if the bridge ever tries to "unwrap" the rows, this test
     * fails loudly.
     *
     * Note: the per-row `dokan_pro_register_rms_reason` action dispatch
     * documented in the trace report is a save-handler concern (fired by
     * `dokan_after_saving_settings` at `Settings.php:200`), NOT a bridge
     * concern. It is NOT exercised here — see class docblock hazard #2 for
     * the deferred REST writer follow-up.
     */
    public function test_rma_reasons_repeater_round_trips(): void {
        $tab_fields = $this->fragment_for_tab( 'Moderation' );

        $rma_reasons_field = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_rma' === $element['legacy_key']['option']
                && 'rma_reasons' === $element['legacy_key']['field']
            ) {
                $rma_reasons_field = $element;
                break;
            }
        }
        $this->assertNotNull(
            $rma_reasons_field,
            'Expected dokan_rma.rma_reasons to be mapped into the Moderation tab.'
        );

        // Synthetic repeater payload — structurally what the legacy UI
        // submits (an indexed array of `{ id, value }` rows). The bridge
        // must NOT transform rows, drop keys, or reshape the array.
        $rows = [
            [
                'id'    => 'r1',
                'value' => 'Damaged',
            ],
            [
                'id'    => 'r2',
                'value' => 'Wrong',
            ],
        ];

        $map_filter = function ( $map ) use ( $rma_reasons_field ) {
            $map[ $rma_reasons_field['id'] ] = $rma_reasons_field['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // ---- Forward: legacy → new ----
            update_option( 'dokan_rma', [ 'rma_reasons' => $rows ] );

            $bridge = new LegacySettingsBridge();
            $slice  = $bridge->transform_legacy_payload_to_new( 'dokan_rma', [ 'rma_reasons' => $rows ] );

            $this->assertSame(
                $rows,
                $slice[ $rma_reasons_field['id'] ] ?? null,
                'Bridge must round-trip dokan_rma.rma_reasons rows opaquely (legacy→new). ' .
                'No row-level reshape, no key drop, no per-row transform.'
            );

            // ---- Reverse: new → legacy ----
            // Clear legacy so the reverse write is observable.
            update_option( 'dokan_rma', [] );

            $bridge->write_new_to_legacy( [ $rma_reasons_field['id'] => $rows ] );

            $legacy = get_option( 'dokan_rma', [] );
            $this->assertIsArray(
                $legacy,
                'dokan_rma should be an array after bridge write.'
            );
            $this->assertSame(
                $rows,
                $legacy['rma_reasons'] ?? null,
                'Bridge must round-trip dokan_rma.rma_reasons rows opaquely (new→legacy). ' .
                'No row-level reshape, no key drop, no per-row transform.'
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
     * @param array<string,int> $input
     *
     * @return array<string,int>
     */
    private function ksort_copy( array $input ): array {
        ksort( $input );
        return $input;
    }
}
