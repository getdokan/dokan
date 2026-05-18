<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema\Tab;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Parity tests for the Vendors tab fields wired through the CSV-derived
 * fragment + LegacySettingsBridge.
 *
 * Vendors is the LARGEST tab in the CSV migration: 46 fields fanned across
 * SEVEN distinct legacy wp_options. It is also the tab carrying the most
 * trace-confirmed downstream hazards — none of which the bridge layer owns,
 * but every one of which has a defensive guard here so a future bridge change
 * that quietly takes on the wrong responsibility fails loudly:
 *
 *   - `dokan_general`                   → 6 fields (setup_wizard_logo_url,
 *                                          setup_wizard_message,
 *                                          disable_welcome_wizard,
 *                                          global_digital_mode,
 *                                          enabled_address_on_reg,
 *                                          enable_tc_on_reg)
 *   - `dokan_selling`                   → 14 fields (new_seller_enable_selling,
 *                                          plus 13 vendor-capability toggles)
 *   - `dokan_product_subscription`      → 6 fields (subscription_pack,
 *                                          enable_pricing,
 *                                          enable_subscription_pack_in_reg,
 *                                          notify_by_email,
 *                                          no_of_days_before_mail,
 *                                          product_status_after_end)
 *   - `dokan_spmv`                      → 5 fields (enable_pricing,
 *                                          sell_item_btn,
 *                                          available_vendor_list_title,
 *                                          available_vendor_list_position,
 *                                          show_order)
 *   - `dokan_social_api`                → 6 fields (enabled,
 *                                          facebook_details,
 *                                          twitter_details,
 *                                          google_details,
 *                                          linkedin_details,
 *                                          apple_details)
 *   - `dokan_verification_sms_gateways` → 7 fields (sender_name,
 *                                          sms_text,
 *                                          sms_sent_msg,
 *                                          sms_sent_error,
 *                                          active_gateway,
 *                                          nexmo_details,
 *                                          twilio_details)
 *   - `dokan_vendor_analytics`          → 2 fields (profile, add_tracking_code)
 *
 * Trace-driven hazards (see `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`):
 *
 *  1. **`dokan_verification_sms_gateways` 73% schema mismatch (Task 17 in
 *     trace):** the in-progress non-CSV plugin-ui schema for SMS Gateways had
 *     8 of 11 fields reading from completely different DB keys than they
 *     wrote. The CSV-driven migration sidesteps the mismatch by namespacing
 *     each row's `legacy_key.option` + `legacy_key.field` to the original
 *     storage location. `test_legacy_keys_span_seven_source_options` and
 *     `test_legacy_save_propagates_to_new_settings_for_vendors` together pin
 *     down that every SMS Gateways row reads from AND writes to
 *     `dokan_verification_sms_gateways`, not some renamed sibling option.
 *
 *  2. **`dokan_verification_sms_gateways.auth_token` sensitive-key wrapper:**
 *     legacy GET masks this value as `"[BLOCKED: Sensitive key]"` while the
 *     DB stores the literal token. In the CSV slice, `auth_token` is NOT a
 *     top-level row — it is NESTED inside the compound `twilio_details`
 *     field (`field_type: social`). The bridge round-trips the whole compound
 *     opaquely, including the nested `auth_token`. Defensive test
 *     `test_sms_gateway_compound_auth_token_round_trips_opaquely` proves
 *     the bridge does NOT mask, wrap, or strip the inner `auth_token`. If a
 *     future bridge change introduces masking, the test fails loudly and
 *     forces the developer to move it into the new REST GET layer (the
 *     correct location for response-side masking).
 *
 *  3. **`dokan_social_api` plaintext OAuth credentials (Task 22 in trace):**
 *     5 OAuth secrets (`facebook_details.app_secret`,
 *     `twitter_details.consumer_secret`, `google_details.client_secret`,
 *     `linkedin_details.client_secret`, `apple_details.client_secret`) plus
 *     the Apple private key body (`apple_details.key_content`) are returned
 *     cleartext on legacy GET. Same shape as SMS: they live INSIDE the
 *     compound `*_details` fields (`field_type: social`), not as top-level
 *     rows. The bridge round-trips the compound opaquely. Defensive test
 *     `test_social_api_compound_oauth_secrets_round_trip_opaquely` proves
 *     the bridge does not mask, wrap, or strip nested secret keys.
 *
 *  4. **`dokan_product_subscription` destructive `wp_posts` rewrite:**
 *     `Shortcode::insert_shortcode_into_page` overwrites the subscription_pack
 *     page's `post_content` with `[dps_product_pack]` on every save. This
 *     fires from `dokan_after_saving_settings` on `Settings.php:200`, NOT
 *     from the bridge. The bridge has no opinion on side effects.
 *     `test_subscription_save_does_not_trigger_wp_posts_writes_via_bridge`
 *     pins this contract — a `write_new_to_legacy` for a
 *     `dokan_product_subscription` field MUST NOT touch wp_posts. When the
 *     new REST writer lands, it will need to decide whether to keep the
 *     legacy behavior or drop it; that is tracked as a deferred follow-up
 *     and NOT asserted here.
 *
 *  5. **`dokan_spmv` background visibility-recalc job:** dispatched on every
 *     save via `dokan_after_saving_settings`. Same situation as #4 — fires
 *     from the legacy save handler. The bridge does not fire
 *     `dokan_after_saving_settings`, so no bridge-layer change. Deferred
 *     follow-up for the new REST writer.
 *
 *  6. **`dokan_vendor_analytics` auth-gate skew:** the trace report flagged a
 *     potential mismatch between the legacy AJAX permission check and the
 *     in-progress non-CSV plugin-ui REST permission. The CSV migration does
 *     not change permissions at the bridge layer — the bridge is invoked by
 *     authenticated callers regardless of which path. Deferred follow-up.
 *
 *  7. **Schema id-collision risks at the new-id level:** none expected in
 *     Vendors because the slug rule namespaces by sub-path (e.g.
 *     `vendors_vendor_capabilities_*` vs `vendors_vendor_onboarding_*` vs
 *     `vendors_single_product_multi_vendor_*`). The `enable_pricing` field
 *     name appears in both `dokan_spmv` and `dokan_product_subscription`,
 *     but the sub-paths differ so the slugs are distinct
 *     (`vendors_single_product_multi_vendor_enable_pricing` vs
 *     `vendors_vendor_subscription_enable_pricing`).
 *     `test_no_id_collisions_within_tab` pins this down.
 *
 * `test_writes_to_one_legacy_option_do_not_pollute_others` is the
 * cross-section isolation guard generalized to SEVEN options — it picks a
 * `dokan_social_api` field (carries the OAuth-credential concern) and proves
 * a targeted bridge write there does not leak into the six sibling legacy
 * options.
 *
 * Sentinel discipline:
 *   - All test values use `__T_*` prefixes so accidental persistence is
 *     trivially scrubbed and grep-detectable.
 *   - All seven legacy options + `dokan_settings` are reset between tests.
 *   - The wp_posts snapshot test also runs a one-time `[dps_product_pack]`
 *     cleanup in `set_up()` so a sibling test's stray seed cannot make the
 *     subscription-side-effect guard look like it passed.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 * @group settings-vendors
 */
class VendorsSchemaTest extends DokanTestCase {

    /**
     * The complete set of legacy wp_options that this tab's fields read from
     * and write to. Used in `set_up`/`tear_down` and the isolation guard.
     *
     * @var array<int,string>
     */
    private const LEGACY_OPTIONS = [
        'dokan_general',
        'dokan_selling',
        'dokan_product_subscription',
        'dokan_spmv',
        'dokan_social_api',
        'dokan_verification_sms_gateways',
        'dokan_vendor_analytics',
    ];

    /**
     * Absolute path to the generated fragment.
     */
    private function fragment_path(): string {
        $root = defined( 'DOKAN_DIR' ) ? DOKAN_DIR : dirname( __DIR__, 6 );
        return $root . '/includes/Admin/Settings/Schema/Generated/csv_fields.php';
    }

    /**
     * Load the Vendors slice of the generated fragment.
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

        // One-time cleanup: the wp_posts snapshot test relies on a stable
        // count of posts whose post_content contains the `[dps_product_pack]`
        // shortcode. If any sibling test in the broader suite leaves such a
        // post behind, the snapshot delta becomes ambiguous. Wipe stragglers.
        global $wpdb;
        $wpdb->query( "DELETE FROM {$wpdb->posts} WHERE post_content LIKE '%[dps_product_pack]%'" );
    }

    public function tear_down() {
        foreach ( self::LEGACY_OPTIONS as $option ) {
            delete_option( $option );
        }
        delete_option( 'dokan_admin_settings' );
        parent::tear_down();
    }

    public function test_tab_vendors_has_expected_field_count(): void {
        $this->assertCount(
            46,
            $this->fragment_for_tab( 'Vendors' ),
            'Expected 46 Vendors fields in the generated CSV fragment.'
        );
    }

    public function test_legacy_keys_span_seven_source_options(): void {
        $sources = [];
        foreach ( $this->fragment_for_tab( 'Vendors' ) as $element ) {
            $sources[ $element['legacy_key']['option'] ] = ( $sources[ $element['legacy_key']['option'] ] ?? 0 ) + 1;
        }

        // Every legacy option that the inventory says feeds the Vendors tab
        // must appear at the exact CSV-derived count. If a row is moved
        // between tabs or its legacy_key is rewritten, the counts shift and
        // this test fails loudly. This is the Vendors-tab guard against the
        // SMS-gateway 73% schema mismatch surfaced in the trace.
        $this->assertSame(
            [
                'dokan_general'                   => 6,
                'dokan_product_subscription'      => 6,
                'dokan_selling'                   => 14,
                'dokan_social_api'                => 6,
                'dokan_spmv'                      => 5,
                'dokan_vendor_analytics'          => 2,
                'dokan_verification_sms_gateways' => 7,
            ],
            $this->ksort_copy( $sources ),
            'Vendors tab section breakdown drifted from the frozen inventory.'
        );
    }

    public function test_no_id_collisions_within_tab(): void {
        $ids    = array_column( $this->fragment_for_tab( 'Vendors' ), 'id' );
        $unique = array_unique( $ids );

        $this->assertSame(
            count( $ids ),
            count( $unique ),
            'Vendors tab has duplicate ids: ' . implode( ',', array_diff_assoc( $ids, $unique ) )
        );
    }

    public function test_legacy_save_propagates_to_new_settings_for_vendors(): void {
        $tab_fields = $this->fragment_for_tab( 'Vendors' );

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
            // fields (e.g. `twilio_details`, `*_details`) because the bridge
            // is opaque about content. If a future bridge change ever
            // introduces masking here, this assertion fails loudly.
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

    public function test_new_save_propagates_back_to_legacy_for_vendors(): void {
        $tab_fields = $this->fragment_for_tab( 'Vendors' );

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
        $tab_fields = $this->fragment_for_tab( 'Vendors' );

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
            // would erase it. Seven-option generalization of the cross-section
            // isolation guards in prior tab tests.
            $fingerprints = [];
            foreach ( self::LEGACY_OPTIONS as $option ) {
                $fingerprints[ $option ] = 'fp_' . $option;
                update_option( $option, [ 'fingerprint' => $fingerprints[ $option ] ] );
            }

            // Pick a dokan_social_api field — carries the plaintext OAuth
            // credential concern surfaced in the trace. A targeted write here
            // should leave all six sibling options completely untouched.
            $target = null;
            foreach ( $tab_fields as $element ) {
                if ( 'dokan_social_api' === $element['legacy_key']['option'] ) {
                    $target = $element;
                    break;
                }
            }
            $this->assertNotNull( $target, 'No dokan_social_api field found in Vendors tab.' );

            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $target['id'] => '__T_isolated' ] );

            // The targeted option got the new value, with its fingerprint
            // preserved (proof of nested write_to, not wholesale overwrite).
            $social = get_option( 'dokan_social_api', [] );
            $this->assertSame(
                '__T_isolated',
                $social[ $target['legacy_key']['field'] ] ?? null,
                'Bridge write should have landed the new value in dokan_social_api.'
            );
            $this->assertSame(
                $fingerprints['dokan_social_api'],
                $social['fingerprint'] ?? null,
                'dokan_social_api fingerprint must remain untouched after a targeted write.'
            );

            // All six sibling options must remain pristine.
            foreach ( self::LEGACY_OPTIONS as $option ) {
                if ( 'dokan_social_api' === $option ) {
                    continue;
                }
                $row = get_option( $option, [] );
                $this->assertSame(
                    $fingerprints[ $option ],
                    $row['fingerprint'] ?? null,
                    "{$option} fingerprint must remain untouched — writes to dokan_social_api must not pollute the sibling option."
                );
                $this->assertArrayNotHasKey(
                    $target['legacy_key']['field'],
                    $row,
                    "Field {$target['legacy_key']['field']} leaked from dokan_social_api into {$option}."
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard for the SMS-gateway compound credential round-trip.
     *
     * Trace report finding (Task 17): `dokan_verification_sms_gateways` had a
     * 73% schema mismatch in the in-progress non-CSV plugin-ui schema. The
     * CSV migration uses the original storage names, so the mismatch is
     * sidestepped. But the trace also flagged the `auth_token` sensitive-key
     * wrapper: legacy GET masks this field as `"[BLOCKED: Sensitive key]"`
     * while the DB stores the literal token.
     *
     * In the CSV slice `auth_token` is NESTED inside the compound
     * `twilio_details` field (`field_type: social`) — it is not a top-level
     * CSV row. The bridge round-trips the entire compound opaquely. This test
     * pins that contract: a credential-shaped nested `auth_token` value goes
     * in, the same value comes out, in BOTH directions. If a future bridge
     * change ever introduces a transformer that masks or wraps nested
     * credential keys, this test fails loudly and the developer must
     * consciously move the masking into the correct layer (new REST GET
     * `response_sanitize_callback`).
     *
     * Distinct from the loop in
     * `test_legacy_save_propagates_to_new_settings_for_vendors` because the
     * value here is the FULL COMPOUND shape (`account_sid`, `auth_token`,
     * `from`) rather than a scalar sentinel — closer to the production
     * payload the legacy AJAX save and the new REST writer will hand to the
     * bridge.
     */
    public function test_sms_gateway_compound_auth_token_round_trips_opaquely(): void {
        $tab_fields = $this->fragment_for_tab( 'Vendors' );

        $twilio_field = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_verification_sms_gateways' === $element['legacy_key']['option']
                && 'twilio_details' === $element['legacy_key']['field']
            ) {
                $twilio_field = $element;
                break;
            }
        }
        $this->assertNotNull(
            $twilio_field,
            'Expected dokan_verification_sms_gateways.twilio_details to be mapped into the Vendors tab.'
        );

        $map_filter = function ( $map ) use ( $twilio_field ) {
            $map[ $twilio_field['id'] ] = $twilio_field['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Production-shaped compound value. `auth_token` is the field the
            // legacy GET path explicitly masks; the bridge must NOT.
            $compound = [
                'account_sid' => 'AC_a1b2c3d4e5f6g7h8i9j0_TEST',
                'auth_token'  => 'tw_auth_a1b2c3d4e5f6g7h8i9j0_LIVE',
                'from'        => '+15555550100',
            ];

            // ---- Forward direction: legacy → new (opaque) ----
            update_option( 'dokan_verification_sms_gateways', [ 'twilio_details' => $compound ] );

            $bridge = new LegacySettingsBridge();
            $slice  = $bridge->transform_legacy_payload_to_new(
                'dokan_verification_sms_gateways',
                [ 'twilio_details' => $compound ]
            );

            $this->assertSame(
                $compound,
                $slice[ $twilio_field['id'] ] ?? null,
                'Bridge must NOT mask, wrap, or reshape dokan_verification_sms_gateways.twilio_details on legacy→new. ' .
                'The auth_token sensitive-key wrapper is the new REST GET layer\'s concern, not the bridge\'s.'
            );

            // ---- Reverse direction: new → legacy (opaque) ----
            // Clear legacy so the reverse write is observable.
            update_option( 'dokan_verification_sms_gateways', [] );

            $bridge->write_new_to_legacy( [ $twilio_field['id'] => $compound ] );

            $legacy = get_option( 'dokan_verification_sms_gateways', [] );
            $this->assertIsArray(
                $legacy,
                'dokan_verification_sms_gateways should be an array after bridge write.'
            );
            $this->assertSame(
                $compound,
                $legacy['twilio_details'] ?? null,
                'Bridge must NOT mask, wrap, or reshape dokan_verification_sms_gateways.twilio_details on new→legacy.'
            );
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard for the social-API OAuth-secret round-trip.
     *
     * Trace report finding (Task 22): five OAuth secrets and the Apple
     * private-key body are returned cleartext on legacy GET. In the CSV
     * slice these live INSIDE the compound `*_details` fields
     * (`field_type: social`) for each provider — they are not top-level CSV
     * rows.
     *
     * This test iterates every `dokan_social_api` compound field present in
     * the Vendors slice, feeds it a production-shaped payload with both a
     * non-secret key (`app_id` / `client_id` / `consumer_key`) and one or
     * more secret-shaped nested keys (`app_secret`, `consumer_secret`,
     * `client_secret`, `key_content`), and asserts structural equality in
     * BOTH directions.
     *
     * The bridge is storage-layer; masking is the new REST GET layer's
     * concern. If a future bridge change scans nested keys for `*_secret` /
     * `*_key_content` and masks them, this test fails loudly and forces the
     * developer to move the masking into the correct layer.
     */
    public function test_social_api_compound_oauth_secrets_round_trip_opaquely(): void {
        $tab_fields = $this->fragment_for_tab( 'Vendors' );

        // Per-provider production-shaped compounds. Every entry has BOTH a
        // non-secret key (proves opacity is uniform, not just for `_secret`
        // suffixes) and at least one nested key that legacy GET would
        // disclose in cleartext.
        $compound_by_field = [
            'facebook_details' => [
                'app_id'     => 'fb_app_id_a1b2c3d4_TEST',
                'app_secret' => 'fb_app_secret_a1b2c3d4_LIVE',
            ],
            'twitter_details' => [
                'consumer_key'    => 'tw_consumer_key_a1b2c3d4_TEST',
                'consumer_secret' => 'tw_consumer_secret_a1b2c3d4_LIVE',
            ],
            'google_details' => [
                'client_id'     => 'gg_client_id_a1b2c3d4.apps.googleusercontent.com',
                'client_secret' => 'gg_client_secret_a1b2c3d4_LIVE',
            ],
            'linkedin_details' => [
                'client_id'     => 'li_client_id_a1b2c3d4_TEST',
                'client_secret' => 'li_client_secret_a1b2c3d4_LIVE',
            ],
            'apple_details' => [
                'client_id'   => 'com.example.app',
                'team_id'     => 'TEAMID123',
                'key_id'      => 'KEYID4567',
                'key_content' => "-----BEGIN PRIVATE KEY-----\nMIGTAg__T_FAKE_KEY_BODY\n-----END PRIVATE KEY-----\n",
            ],
        ];

        $targets = [];
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_social_api' !== $element['legacy_key']['option'] ) {
                continue;
            }
            $field_name = $element['legacy_key']['field'];
            if ( isset( $compound_by_field[ $field_name ] ) ) {
                $targets[ $field_name ] = $element;
            }
        }
        $this->assertCount(
            count( $compound_by_field ),
            $targets,
            'Expected every dokan_social_api *_details compound field to be mapped into the Vendors tab.'
        );

        $map_filter = function ( $map ) use ( $targets ) {
            foreach ( $targets as $element ) {
                $map[ $element['id'] ] = $element['legacy_key'];
            }
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            $bridge = new LegacySettingsBridge();

            foreach ( $targets as $field_name => $element ) {
                $compound = $compound_by_field[ $field_name ];

                // ---- Forward: legacy → new (opaque) ----
                update_option( 'dokan_social_api', [ $field_name => $compound ] );

                $slice = $bridge->transform_legacy_payload_to_new(
                    'dokan_social_api',
                    [ $field_name => $compound ]
                );
                $this->assertSame(
                    $compound,
                    $slice[ $element['id'] ] ?? null,
                    "Bridge must NOT mask or reshape dokan_social_api.{$field_name} on legacy→new. " .
                    'Plaintext-credential masking is the new REST GET layer\'s concern, not the bridge\'s.'
                );

                // ---- Reverse: new → legacy (opaque) ----
                // Clear legacy so the reverse write is observable in isolation.
                update_option( 'dokan_social_api', [] );

                $bridge->write_new_to_legacy( [ $element['id'] => $compound ] );

                $legacy = get_option( 'dokan_social_api', [] );
                $this->assertIsArray(
                    $legacy,
                    'dokan_social_api should be an array after bridge write.'
                );
                $this->assertSame(
                    $compound,
                    $legacy[ $field_name ] ?? null,
                    "Bridge must NOT mask or reshape dokan_social_api.{$field_name} on new→legacy."
                );
            }
        } finally {
            remove_filter( 'dokan_legacy_settings_key_mapping', $map_filter );
        }
    }

    /**
     * Defensive guard against the subscription-side-effect wp_posts rewrite.
     *
     * Trace report finding: `Shortcode::insert_shortcode_into_page` overwrites
     * the subscription_pack page's `post_content` with `[dps_product_pack]`
     * on every save. The action fires from `dokan_after_saving_settings` at
     * `Settings.php:200` — that is a save-handler concern, NOT a bridge
     * concern. The bridge does not fire `dokan_after_saving_settings`.
     *
     * This test pins the contract: a `write_new_to_legacy` for a
     * `dokan_product_subscription` field must not cause any new wp_posts row
     * to gain `[dps_product_pack]` in its `post_content`. The set_up() hook
     * pre-clears any straggler rows so the before/after counts are stable.
     *
     * Deferred follow-up: when the new REST writer lands, it must consciously
     * decide whether to keep the page-rewrite behavior or drop it. The
     * decision belongs upstream; this test simply guarantees the bridge layer
     * stays storage-only.
     */
    public function test_subscription_save_does_not_trigger_wp_posts_writes_via_bridge(): void {
        global $wpdb;

        $tab_fields = $this->fragment_for_tab( 'Vendors' );

        // Pick the subscription_pack field — the one the legacy
        // `insert_shortcode_into_page` action keys off of. If the bridge ever
        // accidentally fires the save-handler action, the page rewrite would
        // fire for THIS field above all others.
        $target = null;
        foreach ( $tab_fields as $element ) {
            if ( 'dokan_product_subscription' === $element['legacy_key']['option']
                && 'subscription_pack' === $element['legacy_key']['field']
            ) {
                $target = $element;
                break;
            }
        }
        $this->assertNotNull(
            $target,
            'Expected dokan_product_subscription.subscription_pack to be mapped into the Vendors tab.'
        );

        $map_filter = function ( $map ) use ( $target ) {
            $map[ $target['id'] ] = $target['legacy_key'];
            return $map;
        };
        add_filter( 'dokan_legacy_settings_key_mapping', $map_filter );

        try {
            // Snapshot the wp_posts state BEFORE the bridge write. The
            // set_up() hook has already removed any straggler rows whose
            // post_content matches `[dps_product_pack]`, so this should be
            // zero in a clean run — but the test stays robust to a non-zero
            // baseline by asserting the COUNT does not change, not that it
            // stays at zero.
            $before_count = (int) $wpdb->get_var(
                "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_content LIKE '%[dps_product_pack]%'"
            );

            $bridge = new LegacySettingsBridge();
            $bridge->write_new_to_legacy( [ $target['id'] => '__T_subscription_pack_id' ] );

            $after_count = (int) $wpdb->get_var(
                "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_content LIKE '%[dps_product_pack]%'"
            );

            $this->assertSame(
                $before_count,
                $after_count,
                'Bridge write for dokan_product_subscription.subscription_pack must NOT trigger ' .
                'the legacy `insert_shortcode_into_page` action. Bridge is storage-layer; the ' .
                'page rewrite is a save-handler concern that the new REST writer will own.'
            );

            // Sanity: confirm the bridge DID land the value in the legacy
            // option (so we know the test exercised the write path).
            $legacy = get_option( 'dokan_product_subscription', [] );
            $this->assertSame(
                '__T_subscription_pack_id',
                $legacy['subscription_pack'] ?? null,
                'Bridge write for subscription_pack should still land in dokan_product_subscription.'
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
