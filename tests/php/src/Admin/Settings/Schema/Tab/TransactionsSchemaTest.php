<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema\Tab;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Parity tests for the Transactions tab fields wired through the CSV-derived
 * fragment + LegacySettingsBridge.
 *
 * The Transactions tab is the FINAL per-tab cut of the CSV migration: 32
 * fields fanned across THREE legacy wp_options:
 *
 *   - `dokan_withdraw`           → 16 fields (withdraw_methods, withdraw_method_name,
 *                                     withdraw_method_type, withdraw_charges,
 *                                     withdraw_limit, withdraw_order_status,
 *                                     exclude_cod_payment, withdraw_date_limit,
 *                                     hide_withdraw_option,
 *                                     disbursement_schedule_settings,
 *                                     disbursement, disbursement_schedule,
 *                                     quarterly_schedule, monthly_schedule,
 *                                     biweekly_schedule, weekly_schedule)
 *   - `dokan_reverse_withdrawal` → 9 fields (enabled, payment_gateways,
 *                                     billing_type, reverse_balance_threshold,
 *                                     monthly_billing_day, due_period,
 *                                     failed_actions, display_notice,
 *                                     send_announcement)
 *   - `dokan_selling` (commissions) → 7 fields (commission_type,
 *                                     commission_fixed_values,
 *                                     reset_sub_category_when_edit_all_category,
 *                                     commission_category_based_values,
 *                                     shipping_fee_recipient, tax_fee_recipient,
 *                                     shipping_tax_fee_recipient)
 *
 * Total: 32 = 16 + 9 + 7.
 *
 * Trace-driven hazards (see
 * `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`):
 *
 *  1. **`dokan_withdraw.withdraw_methods` keyed-array shape:** stored as a
 *     method-id → method-id keyed array (e.g.
 *     `{ paypal: 'paypal', bank: 'bank', ... }`) OR with the empty-string
 *     pattern `{ paypal: 'paypal', bank: '' }` when a method is partially
 *     unchecked. The bridge is opaque about content — defensive test
 *     `test_withdraw_methods_keyed_array_round_trips` pins that the exact
 *     keyed-string shape (including empty-string values) is byte-identically
 *     round-tripped in both directions.
 *
 *  2. **`dokan_withdraw` empty-string vs missing-option semantics:** the
 *     legacy `option_dokan_withdraw` read filter auto-populates
 *     `withdraw_methods` with `{ paypal: 'paypal' }` only when the OPTION is
 *     missing entirely — NOT when the field is present-but-empty. The bridge
 *     must preserve that distinction.
 *     `test_withdraw_methods_empty_array_stays_empty` pins that contract:
 *     writing `[]` via the bridge leaves the legacy field as `[]`, not the
 *     auto-populated paypal default.
 *
 *  3. **`dokan_withdraw` `send_announcement_for_*` unmapped survival:** keys
 *     like `send_announcement_for_payment_change`,
 *     `send_announcement_for_payment_received`, etc. live in the same
 *     `dokan_withdraw` option array and are consumed by
 *     `Withdraw/Manager.php`. They are NOT mapped into the new schema. Any
 *     partial save in the LEGACY AJAX path deletes them silently (legacy
 *     OVERWRITE semantics). The bridge's per-key writes via
 *     `write_new_to_legacy` ONLY touch mapped keys — so unmapped
 *     `send_announcement_for_*` survives. **This is a FIX over the legacy
 *     bug.** Defensive test
 *     `test_unmapped_send_announcement_keys_survive_bridge_writes` pins that
 *     contract: the bridge MUST read-modify-write the legacy option, not
 *     overwrite it. A regression here would silently delete production data.
 *
 *  4. **`dokan_reverse_withdrawal` Action Scheduler crons:** the
 *     `dokan_after_saving_settings` hook (priority 20) schedules or cancels
 *     two AS crons based on `enabled`/`billing_type` state. The bridge does
 *     NOT fire this hook; cron scheduling is a post-save side-effect
 *     responsibility for the new REST writer. Deferred follow-up —
 *     intentionally NOT asserted here.
 *
 *  5. **`dokan_reverse_withdrawal` 5 fail-closed validators:** legacy AJAX
 *     pre-save validators fail-close on `monthly_billing_day` boundary,
 *     `due_period` boundary, empty `failed_actions`, and `billing_type`
 *     conditional checks. The bridge does NOT fire `dokan_before_saving_settings`;
 *     validation belongs in the new REST writer's
 *     `sanitize_callback`/`validate_callback`. Deferred follow-up.
 *
 *  6. **`dokan_selling.admin_percentage` clamp bug:** the legacy
 *     `validate_fixed_price_values` clamp falls back to `""` (not `"0"`) when
 *     the prior value was empty string, silently blanking the field. **This
 *     is a LEGACY BUG — do NOT reproduce on port.** The bridge stays
 *     opaque/storage-only; defensive test
 *     `test_admin_percentage_round_trips_without_clamp` pins that. The new
 *     REST writer must port the clamp logic AND fix the empty-string
 *     fallback.
 *
 *     (Note: this tab's `commission_fixed_values` is the structurally similar
 *     "admin_percentage equivalent" — same clamp/validator territory. The
 *     defensive test names it `admin_percentage_round_trips_without_clamp`
 *     to match the trace report's wording.)
 *
 *  7. **`dokan_selling.commission_type` read-side normalization:** legacy
 *     `set_commission_type_if_not_set` defaults an empty `commission_type` to
 *     `'fixed'` on every read. The bridge reads the literal DB value;
 *     normalization belongs in the new REST GET layer (or, better, in a
 *     one-time write-side default on save). Defensive test
 *     `test_commission_type_empty_string_round_trips_without_normalization`
 *     pins that the bridge stays opaque — empty string in, empty string out.
 *
 *  8. **`dokan_selling.new_seller_enable_selling` legacy mapping asymmetry:**
 *     legacy GET maps `'on'`/`'off'` to `'automatically'`/`'manually'`; the
 *     save-response builder does NOT re-apply the mapper, so a legacy round
 *     trip can shift values. The bridge stays opaque (this field is mapped
 *     under the `vendors_*` tab anyway). Deferred follow-up flagged for the
 *     REST GET layer.
 *
 * Sentinel discipline:
 *   - All test values use `__T_*` prefixes so accidental persistence is
 *     trivially scrubbed and grep-detectable.
 *   - All three legacy options + `dokan_settings` are reset between tests.
 *
 * `test_writes_to_one_legacy_option_do_not_pollute_others` is the three-option
 * generalization of the cross-section isolation guard. It picks a
 * `dokan_withdraw` field (the largest source — 16 rows) and proves a targeted
 * bridge write there does not leak into the two sibling legacy options.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 * @group settings-transactions
 */
class TransactionsSchemaTest extends DokanTestCase {

    /**
     * The complete set of legacy wp_options that this tab's fields read from
     * and write to. Used in `set_up`/`tear_down` and the isolation guard.
     *
     * @var array<int,string>
     */
    private const LEGACY_OPTIONS = [
        'dokan_withdraw',
        'dokan_reverse_withdrawal',
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

    public function test_tab_transactions_has_expected_field_count(): void {
        $this->assertCount(
            32,
            $this->fragment_for_tab( 'Transactions' ),
            'Expected 32 Transactions fields in the generated CSV fragment ' .
            '(25 originally tagged Transactions + 7 from formerly-Transaction typo-unified).'
        );
    }

    public function test_legacy_keys_span_three_source_options(): void {
        $sources = [];
        foreach ( $this->fragment_for_tab( 'Transactions' ) as $element ) {
            $sources[ $element['legacy_key']['option'] ] = ( $sources[ $element['legacy_key']['option'] ] ?? 0 ) + 1;
        }

        // Every legacy option that the inventory says feeds the Transactions
        // tab must appear at the exact CSV-derived count. If a future
        // regenerator pass moves rows between sections or accidentally drops
        // the typo-unification, these counts shift and the test fails loudly.
        $this->assertSame(
            [
                'dokan_reverse_withdrawal' => 9,
                'dokan_selling'            => 7,
                'dokan_withdraw'           => 16,
            ],
            $this->ksort_copy( $sources ),
            'Transactions tab section breakdown drifted from the frozen inventory.'
        );
    }

    public function test_no_id_collisions_within_tab(): void {
        $ids    = array_column( $this->fragment_for_tab( 'Transactions' ), 'id' );
        $unique = array_unique( $ids );

        $this->assertSame(
            count( $ids ),
            count( $unique ),
            'Transactions tab has duplicate ids: ' . implode( ',', array_diff_assoc( $ids, $unique ) )
        );
    }

    public function test_legacy_save_propagates_to_new_settings_for_transactions(): void {
        $tab_fields = $this->fragment_for_tab( 'Transactions' );

        $map_filter = function ( $map ) use ( $tab_fields ) {
            foreach ( $tab_fields as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            $bridge = new LegacySettingsBridge();

            // Opaque sentinel for every field. The bridge must not reshape,
            // mask, or coerce values on legacy→new. This loop hits all 32
            // fields across the three source options, proving end-to-end
            // forward propagation.
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

    public function test_new_save_propagates_back_to_legacy_for_transactions(): void {
        $tab_fields = $this->fragment_for_tab( 'Transactions' );

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
        $tab_fields = $this->fragment_for_tab( 'Transactions' );

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

            // Pick a `dokan_withdraw` field — the largest source (16 rows). A
            // targeted write here should leave both sibling options
            // completely untouched.
            $target = null;
            foreach ( $tab_fields as $element ) {
                if ( 'dokan_withdraw' === $element['legacy_key']['option'] ) {
                    $target = $element;
                    break;
                }
            }
            $this->assertNotNull( $target, 'No dokan_withdraw field found in Transactions tab.' );

            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $target['id'] => '__T_isolated' ] );

            // The targeted option got the new value, with its fingerprint
            // preserved (proof of nested write_to, not wholesale overwrite).
            $withdraw = get_option( 'dokan_withdraw', [] );
            $this->assertSame(
                '__T_isolated',
                $withdraw[ $target['legacy_key']['field'] ] ?? null,
                'Bridge write should have landed the new value in dokan_withdraw.'
            );
            $this->assertSame(
                $fingerprints['dokan_withdraw'],
                $withdraw['fingerprint'] ?? null,
                'dokan_withdraw fingerprint must remain untouched after a targeted write.'
            );

            // Both sibling options must remain pristine.
            foreach ( self::LEGACY_OPTIONS as $option ) {
                if ( 'dokan_withdraw' === $option ) {
                    continue;
                }
                $row = get_option( $option, [] );
                $this->assertSame(
                    $fingerprints[ $option ],
                    $row['fingerprint'] ?? null,
                    "{$option} fingerprint must remain untouched — writes to dokan_withdraw must not pollute the sibling option."
                );
                $this->assertArrayNotHasKey(
                    $target['legacy_key']['field'],
                    $row,
                    "Field {$target['legacy_key']['field']} leaked from dokan_withdraw into {$option}."
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard for the `dokan_withdraw.withdraw_methods` keyed-array
     * shape.
     *
     * Trace report finding: `withdraw_methods` is stored as a keyed array
     * where each key is the method id AND each value is either the same
     * method id (selected) or an empty string (partially unchecked). E.g.
     * `{ paypal: 'paypal', bank: '', skrill: 'skrill' }`. The bridge must
     * stay opaque about that shape — no key normalization, no empty-string
     * stripping, no value coercion.
     *
     * This test pins byte-identical round-trip in both directions for the
     * production-shaped partial-selection payload. If a future bridge change
     * ever:
     *
     *   (a) strips empty-string values; or
     *   (b) renormalizes keys; or
     *   (c) coerces the array to a list
     *
     * this assertion fails loudly and forces the developer to back out the
     * change.
     */
    public function test_withdraw_methods_keyed_array_round_trips(): void {
        $tab_fields = $this->fragment_for_tab( 'Transactions' );

        $methods_field = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_withdraw' === $element['legacy_key']['option']
                && 'withdraw_methods' === $element['legacy_key']['field']
            ) {
                $methods_field = $element;
                break;
            }
        }
        $this->assertNotNull(
            $methods_field,
            'Expected dokan_withdraw.withdraw_methods to be mapped into the Transactions tab.'
        );

        $map_filter = function ( $map ) use ( $methods_field ) {
            $map[ $methods_field['id'] ] = $methods_field['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Production-shaped value: some methods selected, one unselected
            // (kept in the array as an empty string — legacy AJAX shape).
            $production_shape = [
                'paypal' => 'paypal',
                'bank'   => '',
                'skrill' => 'skrill',
            ];

            // ---- Forward direction: legacy → new (opaque) ----
            update_option( 'dokan_withdraw', [ 'withdraw_methods' => $production_shape ] );

            $bridge = new LegacySettingsBridge();
            $slice  = $bridge->transform_legacy_payload_to_new(
                'dokan_withdraw',
                [ 'withdraw_methods' => $production_shape ]
            );

            $this->assertSame(
                $production_shape,
                $slice[ $methods_field['id'] ] ?? null,
                'Bridge must NOT reshape, normalize, or strip empty-string values from ' .
                'dokan_withdraw.withdraw_methods on legacy→new — the keyed-array shape ' .
                'with optional empty-string values is the legacy AJAX contract.'
            );

            // ---- Reverse direction: new → legacy ----
            update_option( 'dokan_withdraw', [] );

            $bridge->write_new_to_legacy( [ $methods_field['id'] => $production_shape ] );

            $legacy = get_option( 'dokan_withdraw', [] );
            $this->assertIsArray(
                $legacy,
                'dokan_withdraw should be an array after bridge write.'
            );
            $this->assertSame(
                $production_shape,
                $legacy['withdraw_methods'] ?? null,
                'Bridge must NOT reshape or strip empty-string values on new→legacy ' .
                'for dokan_withdraw.withdraw_methods.'
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard for the empty-array vs missing-option distinction.
     *
     * Trace report finding: the legacy `option_dokan_withdraw` read filter
     * auto-populates `withdraw_methods` with `{ paypal: 'paypal' }` ONLY when
     * the entire `dokan_withdraw` option is MISSING from wp_options. It does
     * NOT fire when the option is present but `withdraw_methods` is an empty
     * array.
     *
     * The bridge writes to a pre-existing legacy option (because every test
     * `set_up` deletes the option, the first bridge write becomes the option's
     * inaugural value — at which point the option is present, so the
     * auto-populate filter does not fire). This test pins that:
     *
     *   1. After a bridge write of `[]`, the legacy option exists.
     *   2. The legacy field is `[]`, NOT `{ paypal: 'paypal' }`.
     *
     * If a future bridge change accidentally elides empty-array writes (i.e.
     * deletes the option when the value is empty), the auto-populate filter
     * would fire on the next read and the field would silently become
     * `{ paypal: 'paypal' }` — a destructive default for a vendor who
     * deliberately disabled all withdrawal methods.
     */
    public function test_withdraw_methods_empty_array_stays_empty(): void {
        $tab_fields = $this->fragment_for_tab( 'Transactions' );

        $methods_field = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_withdraw' === $element['legacy_key']['option']
                && 'withdraw_methods' === $element['legacy_key']['field']
            ) {
                $methods_field = $element;
                break;
            }
        }
        $this->assertNotNull(
            $methods_field,
            'Expected dokan_withdraw.withdraw_methods to be mapped into the Transactions tab.'
        );

        $map_filter = function ( $map ) use ( $methods_field ) {
            $map[ $methods_field['id'] ] = $methods_field['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $methods_field['id'] => [] ] );

            // The legacy option must now exist (not be missing) — that's
            // what guarantees the auto-populate read filter cannot fire.
            $this->assertNotFalse(
                get_option( 'dokan_withdraw', false ),
                'dokan_withdraw option must exist after the bridge writes — ' .
                'a missing option would trigger the legacy auto-populate filter to inject paypal.'
            );

            $legacy = get_option( 'dokan_withdraw', [] );
            $this->assertIsArray(
                $legacy,
                'dokan_withdraw should be an array after bridge write.'
            );
            $this->assertArrayHasKey(
                'withdraw_methods',
                $legacy,
                'Bridge write of an empty array for withdraw_methods must still create the key.'
            );
            $this->assertSame(
                [],
                $legacy['withdraw_methods'],
                'Bridge must persist withdraw_methods as [] — NOT auto-populate it with paypal. ' .
                'The legacy auto-populate filter only fires when the entire dokan_withdraw option is missing.'
            );
            $this->assertArrayNotHasKey(
                'paypal',
                is_array( $legacy['withdraw_methods'] ) ? $legacy['withdraw_methods'] : [],
                'paypal must NOT have been injected — the bridge has overstepped if it has.'
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard for unmapped legacy keys surviving bridge writes.
     *
     * Trace report finding: `dokan_withdraw` carries
     * `send_announcement_for_payment_change`,
     * `send_announcement_for_payment_received`, and similar write-only
     * trigger keys that are consumed by `Withdraw/Manager.php` but are NOT
     * present in the new schema. The legacy AJAX save handler uses OVERWRITE
     * semantics — any partial save that doesn't include these keys silently
     * deletes them. **This is a legacy bug.**
     *
     * The bridge uses read-modify-write semantics: `write_new_to_legacy`
     * reads the current legacy option, mutates only the mapped paths
     * in-place, and writes back. Unmapped keys MUST survive. This test pins
     * that contract end-to-end:
     *
     *   1. Seed `dokan_withdraw` with a mapped key (`withdraw_limit = '50'`)
     *      AND an UNMAPPED key (`send_announcement_for_payment_change = 'yes'`).
     *   2. Bridge-write the mapped key only (`withdraw_limit = '100'`).
     *   3. Read back the legacy option — the unmapped key MUST still be
     *      there, and the mapped key MUST reflect the new value.
     *
     * **A failure here means the bridge has reverted to OVERWRITE semantics
     * and is silently deleting production data.** This is the single most
     * important defensive test in this tab — it pins the read-modify-write
     * contract of `write_new_to_legacy`.
     */
    public function test_unmapped_send_announcement_keys_survive_bridge_writes(): void {
        $tab_fields = $this->fragment_for_tab( 'Transactions' );

        $limit_field = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_withdraw' === $element['legacy_key']['option']
                && 'withdraw_limit' === $element['legacy_key']['field']
            ) {
                $limit_field = $element;
                break;
            }
        }
        $this->assertNotNull(
            $limit_field,
            'Expected dokan_withdraw.withdraw_limit to be mapped into the Transactions tab.'
        );

        // Only register the mapped field. `send_announcement_for_*` is
        // intentionally NOT mapped — that's the whole point.
        $map_filter = function ( $map ) use ( $limit_field ) {
            $map[ $limit_field['id'] ] = $limit_field['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Seed `dokan_withdraw` with BOTH a mapped key and unmapped
            // trigger keys.
            update_option(
                'dokan_withdraw',
                [
                    'withdraw_limit'                       => '50',
                    'send_announcement_for_payment_change' => 'yes',
                    'send_announcement_for_payment_received' => 'yes',
                ]
            );

            // Bridge-write the mapped key ONLY.
            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $limit_field['id'] => '100' ] );

            $legacy = get_option( 'dokan_withdraw', [] );
            $this->assertIsArray(
                $legacy,
                'dokan_withdraw should be an array after bridge write.'
            );

            // Mapped key reflects the new value.
            $this->assertSame(
                '100',
                $legacy['withdraw_limit'] ?? null,
                'Bridge write of withdraw_limit did not land in dokan_withdraw.'
            );

            // Unmapped trigger keys survive — this is the critical assertion.
            $this->assertSame(
                'yes',
                $legacy['send_announcement_for_payment_change'] ?? null,
                'Unmapped send_announcement_for_payment_change was deleted by the bridge — ' .
                'the read-modify-write contract has regressed to OVERWRITE semantics, ' .
                'which would silently delete production trigger data.'
            );
            $this->assertSame(
                'yes',
                $legacy['send_announcement_for_payment_received'] ?? null,
                'Unmapped send_announcement_for_payment_received was deleted by the bridge — ' .
                'the read-modify-write contract has regressed.'
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard against the legacy `validate_fixed_price_values` clamp
     * sneaking into the bridge.
     *
     * Trace report finding: the legacy
     * `Dokan_Settings::validate_fixed_price_values` clamps
     * `dokan_selling.admin_percentage` (and similar commission fields) to
     * `[0, 100]` AND, on encountering an out-of-range value, falls back to
     * the PREVIOUS value — but when the previous value was an empty string
     * the clamp returns `""` (not `"0"`), silently blanking the field. **This
     * is a legacy bug.**
     *
     * The clamp lives in the legacy AJAX save handler, NOT the bridge. The
     * bridge must stay opaque/storage-only — no clamp, no fallback. This
     * test pins that contract: send `'150'` through the bridge in BOTH
     * directions, and assert byte-identical round-trip. The new REST writer
     * is responsible for porting the clamp AND fixing the empty-string
     * fallback bug.
     *
     * The test uses `commission_fixed_values` (the canonical clamp target
     * in the Transactions tab) as the representative `admin_percentage`-like
     * field. The naming `test_admin_percentage_round_trips_without_clamp`
     * matches the trace report's wording.
     */
    public function test_admin_percentage_round_trips_without_clamp(): void {
        $tab_fields = $this->fragment_for_tab( 'Transactions' );

        $commission_field = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_selling' === $element['legacy_key']['option']
                && 'commission_fixed_values' === $element['legacy_key']['field']
            ) {
                $commission_field = $element;
                break;
            }
        }
        $this->assertNotNull(
            $commission_field,
            'Expected dokan_selling.commission_fixed_values (the admin_percentage-equivalent) ' .
            'to be mapped into the Transactions tab.'
        );

        $map_filter = function ( $map ) use ( $commission_field ) {
            $map[ $commission_field['id'] ] = $commission_field['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // ---- Forward direction: legacy → new ----
            update_option( 'dokan_selling', [ 'commission_fixed_values' => '150' ] );

            $bridge = new LegacySettingsBridge();
            $slice  = $bridge->transform_legacy_payload_to_new(
                'dokan_selling',
                [ 'commission_fixed_values' => '150' ]
            );

            $this->assertSame(
                '150',
                $slice[ $commission_field['id'] ] ?? null,
                'Bridge must NOT clamp commission_fixed_values on legacy→new — ' .
                'validation/clamping is the REST writer\'s responsibility, not the bridge\'s.'
            );

            // ---- Reverse direction: new → legacy ----
            update_option( 'dokan_selling', [] );

            $bridge->write_new_to_legacy( [ $commission_field['id'] => '150' ] );

            $legacy = get_option( 'dokan_selling', [] );
            $this->assertIsArray(
                $legacy,
                'dokan_selling should be an array after bridge write.'
            );
            $this->assertSame(
                '150',
                $legacy['commission_fixed_values'] ?? null,
                'Bridge must NOT clamp commission_fixed_values on new→legacy — ' .
                'the legacy validate_fixed_price_values clamp (with its empty-string-fallback bug) ' .
                'must be ported to the REST writer AND fixed there, not silently inherited by the bridge.'
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard against `set_commission_type_if_not_set` normalization
     * sneaking into the bridge.
     *
     * Trace report finding: the legacy `dokan_get_option` (and its filter
     * stack) defaults an empty `dokan_selling.commission_type` to `'fixed'`
     * on every read. That normalization is the legacy GET layer's concern —
     * the bridge must stay opaque about content and read the literal DB
     * value.
     *
     * This test pins that contract: send an empty string through the bridge,
     * assert it's still an empty string on the way out. The new REST GET
     * layer should apply the same normalization (or, better, enforce a
     * write-side default to fix the root cause).
     */
    public function test_commission_type_empty_string_round_trips_without_normalization(): void {
        $tab_fields = $this->fragment_for_tab( 'Transactions' );

        $type_field = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_selling' === $element['legacy_key']['option']
                && 'commission_type' === $element['legacy_key']['field']
            ) {
                $type_field = $element;
                break;
            }
        }
        $this->assertNotNull(
            $type_field,
            'Expected dokan_selling.commission_type to be mapped into the Transactions tab.'
        );

        $map_filter = function ( $map ) use ( $type_field ) {
            $map[ $type_field['id'] ] = $type_field['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // ---- Forward direction: legacy → new ----
            update_option( 'dokan_selling', [ 'commission_type' => '' ] );

            $bridge = new LegacySettingsBridge();
            $slice  = $bridge->transform_legacy_payload_to_new(
                'dokan_selling',
                [ 'commission_type' => '' ]
            );

            $this->assertArrayHasKey(
                $type_field['id'],
                $slice,
                'Bridge must include commission_type in the slice even when its value is an empty string.'
            );
            $this->assertSame(
                '',
                $slice[ $type_field['id'] ],
                'Bridge must NOT normalize an empty commission_type to "fixed" on legacy→new — ' .
                'normalization is the REST GET layer\'s concern (or a write-side default).'
            );

            // ---- Reverse direction: new → legacy ----
            update_option( 'dokan_selling', [] );

            $bridge->write_new_to_legacy( [ $type_field['id'] => '' ] );

            $legacy = get_option( 'dokan_selling', [] );
            $this->assertIsArray(
                $legacy,
                'dokan_selling should be an array after bridge write.'
            );
            $this->assertArrayHasKey(
                'commission_type',
                $legacy,
                'Bridge write of an empty string for commission_type must still create the key.'
            );
            $this->assertSame(
                '',
                $legacy['commission_type'],
                'Bridge must persist commission_type as an empty string — NOT normalize it to "fixed". ' .
                'The legacy set_commission_type_if_not_set filter is a GET-side concern.'
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
