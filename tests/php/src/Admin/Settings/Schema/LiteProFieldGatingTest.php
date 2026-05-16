<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Schema\SettingsSchema;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Tests for Lite/Pro field gating in SettingsSchema::get_schema().
 *
 * The CSV-derived fragment at
 * `includes/Admin/Settings/Schema/Generated/csv_fields.php` emits an `is_lite`
 * flag on every `type: field` entry (true = Lite, false = Pro-only). When
 * Dokan Pro is inactive the schema must filter out Pro-only generated entries
 * so the admin UI never offers settings the runtime cannot honour.
 *
 * The gate is driven by the canonical accessor `dokan()->is_pro_exists()`
 * which under the hood is `apply_filters( 'dokan_is_pro_exists', false )` —
 * filter-overridable for tests.
 *
 * Critical contracts pinned here:
 *
 *  1. With Pro inactive, ZERO generated entries with `is_lite: false` survive
 *     `get_schema()`.
 *  2. With Pro inactive, generated entries with `is_lite: true` DO survive.
 *  3. With Pro active (filter forced true), all 208 generated entries survive.
 *  4. Hand-authored elements (no `is_lite` key) are never filtered, regardless
 *     of Pro state — preserves backward compatibility for elements added
 *     before the CSV migration and for elements added via the
 *     `dokan_get_admin_settings_schema` filter by Pro/extensions.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 * @group settings-lite-pro-gating
 */
class LiteProFieldGatingTest extends DokanTestCase {

    /**
     * Sentinel priority used so we can guarantee remove_filter targets exactly
     * the filter we added (and not, e.g., a value Pro registered at default
     * priority during plugin bootstrap).
     */
    private const FILTER_PRIORITY = 1000;

    public function set_up() {
        parent::set_up();
        update_option( 'dokan_csv_schema_enabled', true );
    }

    public function tear_down() {
        delete_option( 'dokan_csv_schema_enabled' );
        // Defensive: remove either possible override so test ordering can't
        // leak Pro-state across tests.
        remove_filter( 'dokan_is_pro_exists', '__return_false', self::FILTER_PRIORITY );
        remove_filter( 'dokan_is_pro_exists', '__return_true', self::FILTER_PRIORITY );
        parent::tear_down();
    }

    /**
     * Helper: extract the CSV-generated slice of the schema (every generated
     * field carries `top_tab`; hand-authored elements do not).
     *
     * @param array $schema
     * @return array
     */
    private function generated_elements( array $schema ): array {
        return array_filter( $schema, static fn ( $el ) => isset( $el['top_tab'] ) );
    }

    public function test_pro_fields_are_filtered_out_when_pro_inactive(): void {
        add_filter( 'dokan_is_pro_exists', '__return_false', self::FILTER_PRIORITY );

        $schema    = SettingsSchema::get_schema();
        $generated = $this->generated_elements( $schema );
        $pro_only  = array_filter(
            $generated,
            static fn ( $el ) => array_key_exists( 'is_lite', $el ) && false === $el['is_lite']
        );

        $this->assertCount(
            0,
            $pro_only,
            'Pro-only generated fields must be filtered out when Pro is inactive.'
        );
    }

    public function test_lite_fields_remain_when_pro_inactive(): void {
        add_filter( 'dokan_is_pro_exists', '__return_false', self::FILTER_PRIORITY );

        $schema    = SettingsSchema::get_schema();
        $generated = $this->generated_elements( $schema );
        $lite      = array_filter(
            $generated,
            static fn ( $el ) => ! empty( $el['is_lite'] )
        );

        $this->assertGreaterThan(
            0,
            count( $lite ),
            'Lite fields must remain visible when Pro is inactive.'
        );
    }

    public function test_pro_fields_appear_when_pro_active(): void {
        add_filter( 'dokan_is_pro_exists', '__return_true', self::FILTER_PRIORITY );

        $schema    = SettingsSchema::get_schema();
        $generated = $this->generated_elements( $schema );
        $pro_only  = array_filter(
            $generated,
            static fn ( $el ) => array_key_exists( 'is_lite', $el ) && false === $el['is_lite']
        );

        $this->assertGreaterThan(
            100,
            count( $pro_only ),
            'Many Pro fields should be visible when Pro is active.'
        );
    }

    public function test_total_generated_count_matches_expected_when_pro_active(): void {
        add_filter( 'dokan_is_pro_exists', '__return_true', self::FILTER_PRIORITY );

        $schema    = SettingsSchema::get_schema();
        $generated = $this->generated_elements( $schema );

        $this->assertSame(
            208,
            count( $generated ),
            'Pro-active state should surface all 208 generated CSV fields.'
        );
    }

    public function test_lite_count_matches_fragment_when_pro_inactive(): void {
        add_filter( 'dokan_is_pro_exists', '__return_false', self::FILTER_PRIORITY );

        $schema    = SettingsSchema::get_schema();
        $generated = $this->generated_elements( $schema );

        // Cross-reference: lite fields surviving the gate must equal the
        // number of `is_lite: true` rows in the raw fragment.
        $fragment       = require DOKAN_DIR . '/includes/Admin/Settings/Schema/Generated/csv_fields.php';
        $fragment_lite  = array_filter(
            $fragment,
            static fn ( $el ) => ( $el['type'] ?? '' ) === 'field' && ! empty( $el['is_lite'] )
        );

        $this->assertSame(
            count( $fragment_lite ),
            count( $generated ),
            'Generated elements surviving Pro-inactive gating must equal the count of is_lite=true rows in the fragment.'
        );
    }

    public function test_hand_authored_elements_unaffected_by_gating(): void {
        // Capture the baseline hand-authored slice with the CSV feature flag
        // OFF — no generated entries at all, just the legacy hand-authored
        // schema. None of these elements carry an `is_lite` flag, so they
        // must survive Pro-inactive gating untouched.
        delete_option( 'dokan_csv_schema_enabled' );
        $baseline_hand_authored = SettingsSchema::get_schema();
        update_option( 'dokan_csv_schema_enabled', true );

        add_filter( 'dokan_is_pro_exists', '__return_false', self::FILTER_PRIORITY );

        $gated_schema = SettingsSchema::get_schema();

        // Hand-authored elements are exactly those that were present in the
        // baseline (identified by id+type so we don't double-count).
        $baseline_ids = array_map(
            static fn ( $el ) => ( $el['type'] ?? '' ) . ':' . ( $el['id'] ?? '' ),
            $baseline_hand_authored
        );

        $surviving_ids = array_map(
            static fn ( $el ) => ( $el['type'] ?? '' ) . ':' . ( $el['id'] ?? '' ),
            $gated_schema
        );

        $missing = array_diff( $baseline_ids, $surviving_ids );

        $this->assertSame(
            [],
            array_values( $missing ),
            'Hand-authored elements (no is_lite flag) must not be filtered by Pro gating.'
        );
    }

    public function test_bridge_only_entries_survive_gating(): void {
        add_filter( 'dokan_is_pro_exists', '__return_false', self::FILTER_PRIORITY );

        $schema      = SettingsSchema::get_schema();
        $bridge_only = array_filter(
            $schema,
            static fn ( $el ) => ! empty( $el['bridge_only'] )
        );

        // The fragment ships 8 bridge-only entries; none carry `type: field`
        // nor `is_lite`, so the gate must leave them untouched.
        $this->assertCount(
            8,
            $bridge_only,
            'All 8 bridge-only fragment entries must survive Pro-inactive gating.'
        );
    }

    public function test_bridge_only_fragment_entries_exist(): void {
        $fragment    = require DOKAN_DIR . '/includes/Admin/Settings/Schema/Generated/csv_fields.php';
        $bridge_only = array_filter( $fragment, static fn ( $el ) => ! empty( $el['bridge_only'] ) );

        // Bridge-only entries are not type=field; gating only operates on
        // visible `type: field` elements, so bridge-only entries (which are
        // never surfaced as UI elements anyway) are untouched. The intent of
        // this test is to pin that the fragment still ships these entries
        // unchanged regardless of Pro state.
        $this->assertGreaterThan(
            0,
            count( $bridge_only ),
            'Bridge-only entries should exist in the generated fragment.'
        );
    }
}
