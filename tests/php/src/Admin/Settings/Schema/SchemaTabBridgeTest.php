<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Admin\Settings\Schema\SettingsSchema;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Schema-driven LegacySettingsBridge parity tests, grouped by settings tab.
 *
 * Replaces the former per-tab CSV-fragment parity tests. Instead of a
 * generated fragment, these drive the canonical hand-authored
 * {@see SettingsSchema::get_schema()} — the same source the bridge harvests
 * its mapping from ({@see LegacySettingsBridge::harvest_from_schema()}). Every
 * field that declares a `legacy_key` is exercised through the real bridge:
 *
 *   1. Mapping integrity — every `legacy_key` field is harvested into
 *      `get_mapping()` under its own id, with the declared legacy option.
 *   2. Value + type fidelity — the canonical new value is projected into
 *      legacy storage and read back (new → legacy → new) and must return
 *      identical. Asserted with `assertSame` so both the value AND its PHP
 *      type must match (`'50'` string vs `50` int is a failure). This proves
 *      each `legacy_transformer` is a clean, type-preserving inverse — the
 *      property that actually protects stored data from corruption. For
 *      pass-through / symmetric fields (the majority) the new and legacy
 *      domains coincide, so this directly verifies old-value fidelity; for
 *      bespoke transformers whose legacy shape differs (e.g.
 *      WithdrawMethodToggle stores a method key, not on/off) it verifies
 *      inverse-consistency. Per-transformer legacy-domain fixtures are a
 *      separate, narrower concern and are out of scope for this generic sweep.
 *   3. Multi-slot fields — 1:N maps (multicheck like withdraw_order_status)
 *      fan out to several legacy slots and reassemble (strict set parity).
 *   4. Drift guard — an undeclared legacy payload key cannot pollute the new
 *      slice.
 *
 * Field counts are intentionally NOT pinned (they drift as the schema grows);
 * coverage is asserted structurally — every `legacy_key` field, spanning the
 * core lite tabs. Failures are labeled with the owning tab + field id.
 *
 * Scope: this verifies the BRIDGE layer (LegacyAddress + transformers + WP
 * option storage), which moves values without coercing their type. It does
 * NOT exercise the REST/AJAX sanitization layer, where type coercion (e.g.
 * sanitize_text_field stringifying a number) is the real residual risk — that
 * belongs to controller-level tests such as SettingsRoundTripTest.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-migration
 * @group settings-bridge
 *
 * @covers \WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge
 */
class SchemaTabBridgeTest extends DokanTestCase {

    /**
     * Cached schema from get_schema().
     *
     * @var array<int,array<string,mixed>>|null
     */
    private ?array $schema = null;

    /**
     * Scalar field variants for which a string sentinel is a valid value when
     * the field declares no `default` to seed from.
     */
    private const SCALAR_VARIANTS = [
        'text',
        'number',
        'textarea',
        'select',
        'show_hide',
        'color_picker',
        'rich_text',
    ];

    public function set_up() {
        parent::set_up();

        // Isolate the bridge from Dokan's runtime read-time option overlays.
        // Several legacy options carry `option_<name>` filters that resolve
        // stored values on read (e.g. `option_dokan_pages` maps a stored page
        // id to the live published page). Those overlays would mask raw
        // storage, which is the exact layer the bridge moves and what these
        // round-trip assertions must observe. Removing them yields raw reads.
        foreach ( $this->legacy_key_fields() as $field ) {
            foreach ( $this->legacy_options( $field['legacy_key'] ) as $option ) {
                remove_all_filters( "option_{$option}" );
                remove_all_filters( "default_option_{$option}" );
            }
        }
    }

    public function tear_down() {
        // Drop any legacy option a round-trip touched so state never bleeds
        // into sibling tests. Only legacy `dokan_*` section options are
        // written here (via the bridge) — never `dokan_admin_settings`
        // directly, which is owned exclusively by SettingsRepository.
        foreach ( $this->legacy_key_fields() as $field ) {
            foreach ( $this->legacy_options( $field['legacy_key'] ) as $option ) {
                delete_option( $option );
            }
        }
        parent::tear_down();
    }

    // =========================================================================
    // 1. Mapping integrity
    // =========================================================================

    public function test_every_legacy_key_field_is_harvested_into_bridge_mapping(): void {
        $lookup  = $this->lookup();
        $mapping = ( new LegacySettingsBridge() )->get_mapping();
        $checked = 0;

        foreach ( $this->legacy_key_fields() as $field ) {
            $id  = $field['id'];
            $tab = $this->resolve_tab( $field, $lookup );

            $this->assertArrayHasKey(
                $id,
                $mapping,
                "[{$tab}] {$id}: field declares a legacy_key but the bridge did not harvest it into get_mapping()."
            );

            if ( $this->is_multi( $field['legacy_key'] ) ) {
                $this->assertIsArray(
                    $mapping[ $id ],
                    "[{$tab}] {$id}: multi-slot mapping entry must be an array of slots."
                );
            } else {
                $expected_option = $this->legacy_options( $field['legacy_key'] )[0] ?? '';
                $this->assertArrayHasKey(
                    'option',
                    $mapping[ $id ],
                    "[{$tab}] {$id}: single mapping entry must carry an 'option'."
                );
                $this->assertSame(
                    $expected_option,
                    $mapping[ $id ]['option'],
                    "[{$tab}] {$id}: mapping resolved to the wrong legacy option."
                );
            }

            ++$checked;
        }

        $this->assertGreaterThan( 0, $checked, 'Expected at least one legacy_key field in the schema.' );
    }

    public function test_legacy_key_fields_span_the_core_lite_tabs(): void {
        $lookup = $this->lookup();
        $tabs   = [];

        foreach ( $this->legacy_key_fields() as $field ) {
            $tabs[ $this->resolve_tab( $field, $lookup ) ] = true;
        }

        foreach ( [ 'general', 'transaction', 'vendor' ] as $expected_tab ) {
            $this->assertArrayHasKey(
                $expected_tab,
                $tabs,
                "Expected mapped (legacy_key) fields under the '{$expected_tab}' tab."
            );
        }

        $this->assertGreaterThanOrEqual(
            3,
            count( $tabs ),
            'Mapped fields should span multiple settings tabs.'
        );
    }

    // =========================================================================
    // 2. Round-trip parity (single-mapped)
    // =========================================================================

    public function test_mapped_value_and_type_survive_round_trip_through_legacy_storage(): void {
        $lookup  = $this->lookup();
        $checked = 0;

        foreach ( $this->legacy_key_fields() as $field ) {
            if ( $this->is_multi( $field['legacy_key'] ) ) {
                continue; // Covered by the multi-slot test.
            }

            [ $seed, $seedable ] = $this->seed_for( $field );
            if ( ! $seedable ) {
                continue; // No generically valid value; mapping integrity covers it.
            }

            $id      = $field['id'];
            $tab     = $this->resolve_tab( $field, $lookup );
            $options = $this->legacy_options( $field['legacy_key'] );

            foreach ( $options as $option ) {
                delete_option( $option );
            }

            try {
                $bridge = new LegacySettingsBridge();

                // new -> legacy: project the canonical new value into the
                // legacy store (runs the transformer's to_legacy direction).
                $bridge->write_new_to_legacy( [ $id => $seed ] );

                // legacy -> new: read it back (runs to_new). A clean,
                // type-preserving inverse must return the original value.
                $primary = $options[0];
                $legacy  = get_option( $primary, [] );
                $slice   = $bridge->transform_legacy_payload_to_new(
                    $primary,
                    is_array( $legacy ) ? $legacy : []
                );

                $this->assertArrayHasKey(
                    $id,
                    $slice,
                    "[{$tab}] {$id}: bridge produced no new value after a legacy round-trip."
                );

                // assertSame, not assertEquals — both value AND PHP type must
                // match, so e.g. '50' (string) vs 50 (int) is a failure.
                $this->assertSame(
                    $seed,
                    $slice[ $id ],
                    "[{$tab}] {$id}: value/type not preserved across new->legacy->new (transformer not a clean inverse?)."
                );

                ++$checked;
            } finally {
                foreach ( $options as $option ) {
                    delete_option( $option );
                }
            }
        }

        $this->assertGreaterThan(
            0,
            $checked,
            'Expected at least one single-mapped field to round-trip through the bridge.'
        );
    }

    // =========================================================================
    // 3. Multi-slot fields (1:N)
    // =========================================================================

    public function test_multi_slot_fields_round_trip_through_bridge(): void {
        $lookup  = $this->lookup();
        $checked = 0;

        foreach ( $this->legacy_key_fields() as $field ) {
            if ( ! $this->is_multi( $field['legacy_key'] ) ) {
                continue;
            }
            if ( ! array_key_exists( 'default', $field ) || ! is_array( $field['default'] ) ) {
                continue; // Need a representative array of selected slots to seed.
            }

            $id      = $field['id'];
            $tab     = $this->resolve_tab( $field, $lookup );
            // Keep the default's shape intact — different 1:N fields use
            // different new-value shapes (a flat list of selected slots like
            // withdraw_order_status, or an associative slot=>bool map like
            // single_product_page_appearance). Flattening would scramble it.
            $seed    = $field['default'];
            $options = $this->legacy_options( $field['legacy_key'] );

            foreach ( $options as $option ) {
                delete_option( $option );
            }

            try {
                $bridge = new LegacySettingsBridge();

                // new -> legacy -> new: the default is the canonical new value;
                // a clean inverse transformer must reproduce it exactly.
                $bridge->write_new_to_legacy( [ $id => $seed ] );

                $primary = $options[0];
                $legacy  = get_option( $primary, [] );
                $slice   = $bridge->transform_legacy_payload_to_new(
                    $primary,
                    is_array( $legacy ) ? $legacy : []
                );

                $this->assertArrayHasKey(
                    $id,
                    $slice,
                    "[{$tab}] {$id}: multi-slot field was not reassembled by the bridge."
                );
                $this->assertIsArray(
                    $slice[ $id ],
                    "[{$tab}] {$id}: multi-slot new value should be an array."
                );

                // Compare order-independently but strictly on value + type.
                $expected = $seed;
                $actual   = $slice[ $id ];
                $this->normalize_for_compare( $expected );
                $this->normalize_for_compare( $actual );
                $this->assertSame(
                    $expected,
                    $actual,
                    "[{$tab}] {$id}: multi-slot round-trip did not preserve the selected slots (value/type)."
                );

                ++$checked;
            } finally {
                foreach ( $options as $option ) {
                    delete_option( $option );
                }
            }
        }

        $this->assertGreaterThan(
            0,
            $checked,
            'Expected at least one multi-slot field to round-trip through the bridge.'
        );
    }

    // =========================================================================
    // 4. Drift guard
    // =========================================================================

    public function test_unknown_legacy_key_does_not_pollute_new_slice(): void {
        $target = $this->find_drift_guard_target();
        $this->assertNotNull(
            $target,
            'Expected at least one transformer-free, top-level single-mapped field for the drift guard.'
        );

        $bridge  = new LegacySettingsBridge();
        $payload = [
            $target['field']                 => 'real-value',
            '__attacker_drift_legacy_field__' => 'drift-value',
        ];

        $slice = $bridge->transform_legacy_payload_to_new( $target['option'], $payload );

        $this->assertArrayHasKey(
            $target['id'],
            $slice,
            "Declared field {$target['id']} must round-trip through the bridge."
        );
        $this->assertSame( 'real-value', $slice[ $target['id'] ] );
        $this->assertArrayNotHasKey(
            '__attacker_drift_legacy_field__',
            $slice,
            'Undeclared legacy key leaked into the new-option slice.'
        );

        // Every key the bridge emitted must be a declared schema field id —
        // nothing synthesized from the drift key.
        $valid_ids = array_column(
            array_filter( $this->get_schema(), static fn ( $el ) => ( $el['type'] ?? '' ) === 'field' ),
            'id'
        );
        foreach ( array_keys( $slice ) as $emitted_id ) {
            $this->assertContains(
                $emitted_id,
                $valid_ids,
                "Bridge emitted an id ({$emitted_id}) that is not a declared schema field."
            );
        }
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    /**
     * Schema from get_schema(), cached per test instance.
     *
     * @return array<int,array<string,mixed>>
     */
    private function get_schema(): array {
        if ( null === $this->schema ) {
            $this->schema = SettingsSchema::get_schema();
        }
        return $this->schema;
    }

    /**
     * `type:id` => element lookup for parent-chain (tab) resolution.
     *
     * @return array<string,array<string,mixed>>
     */
    private function lookup(): array {
        $lookup = [];
        foreach ( $this->get_schema() as $element ) {
            if ( isset( $element['id'], $element['type'] ) ) {
                $lookup[ $element['type'] . ':' . $element['id'] ] = $element;
            }
        }
        return $lookup;
    }

    /**
     * Every `type: field` (or bridge-only) element that declares a legacy_key.
     *
     * @return array<int,array<string,mixed>>
     */
    private function legacy_key_fields(): array {
        $fields = [];
        foreach ( $this->get_schema() as $element ) {
            $is_field       = ( $element['type'] ?? '' ) === 'field';
            $is_bridge_only = ! empty( $element['bridge_only'] );
            if ( ! $is_field && ! $is_bridge_only ) {
                continue;
            }
            if ( empty( $element['id'] ) ) {
                continue;
            }
            $legacy = $element['legacy_key'] ?? null;
            if ( null === $legacy || '' === $legacy ) {
                continue;
            }
            $fields[] = $element;
        }
        return $fields;
    }

    /**
     * Resolve the owning page ("tab") id for a field by walking the parent
     * chain — mirrors SettingsRegistry::generate_keys().
     *
     * @param array<string,mixed>               $field
     * @param array<string,array<string,mixed>> $lookup
     *
     * @return string Page id, or '<unknown>' if the chain can't be resolved.
     */
    private function resolve_tab( array $field, array $lookup ): string {
        $pointers = [
            'page_id'        => 'page',
            'subpage_id'     => 'subpage',
            'tab_id'         => 'tab',
            'section_id'     => 'section',
            'subsection_id'  => 'subsection',
            'field_group_id' => 'fieldgroup',
        ];

        $current = $field;
        for ( $i = 0; $i < 10; $i++ ) {
            if ( ( $current['type'] ?? '' ) === 'page' ) {
                return (string) $current['id'];
            }

            $advanced = false;
            foreach ( $pointers as $pointer => $parent_type ) {
                if ( empty( $current[ $pointer ] ) ) {
                    continue;
                }
                $parent_id  = $current[ $pointer ];
                $parent_key = $parent_type . ':' . $parent_id;
                if ( isset( $lookup[ $parent_key ] ) ) {
                    $current  = $lookup[ $parent_key ];
                    $advanced = true;
                    break;
                }
                // Parent not present as its own element — that id is the top we know.
                return (string) $parent_id;
            }

            if ( ! $advanced ) {
                break;
            }
        }

        return (string) ( $current['id'] ?? '<unknown>' );
    }

    /**
     * Whether a legacy_key is a 1:N (multi-slot) map rather than a 1:1 address.
     *
     * @param string|array<string,mixed> $legacy_key
     */
    private function is_multi( $legacy_key ): bool {
        return is_array( $legacy_key )
            && ! ( isset( $legacy_key['option'] ) && isset( $legacy_key['field'] ) );
    }

    /**
     * Distinct legacy option name(s) a legacy_key resolves to.
     *
     * @param string|array<string,mixed> $legacy_key
     *
     * @return array<int,string>
     */
    private function legacy_options( $legacy_key ): array {
        if ( is_string( $legacy_key ) ) {
            return [ explode( '.', $legacy_key )[0] ];
        }
        if ( isset( $legacy_key['option'], $legacy_key['field'] ) ) {
            return [ (string) $legacy_key['option'] ];
        }

        $options = [];
        foreach ( (array) $legacy_key as $address ) {
            if ( is_string( $address ) ) {
                $options[] = explode( '.', $address )[0];
            } elseif ( is_array( $address ) && isset( $address['option'] ) ) {
                $options[] = (string) $address['option'];
            }
        }
        return array_values( array_unique( $options ) );
    }

    /**
     * Path segments (below the option) for a single 1:1 legacy_key.
     *
     * @param string|array<string,mixed> $legacy_key
     *
     * @return array<int,string>
     */
    private function legacy_path( $legacy_key ): array {
        if ( is_string( $legacy_key ) ) {
            $segments = explode( '.', $legacy_key );
            array_shift( $segments );
            return $segments;
        }
        if ( isset( $legacy_key['option'], $legacy_key['field'] ) ) {
            return explode( '.', (string) $legacy_key['field'] );
        }
        return [];
    }

    /**
     * Normalize an array for order-independent comparison while keeping value
     * + type intact: lists are sorted by value, maps by key.
     *
     * @param array<mixed> $value By-reference array to normalize in place.
     */
    private function normalize_for_compare( array &$value ): void {
        $is_list = array_keys( $value ) === range( 0, count( $value ) - 1 );
        if ( $is_list ) {
            sort( $value );
        } else {
            ksort( $value );
        }
    }

    /**
     * Choose a representative, always-valid seed value for round-tripping a
     * field: its declared `default`, else a string sentinel for scalar
     * variants. Returns `[value, seedable]`.
     *
     * @param array<string,mixed> $field
     *
     * @return array{0:mixed,1:bool}
     */
    private function seed_for( array $field ): array {
        if ( array_key_exists( 'default', $field )
            && null !== $field['default']
            && '' !== $field['default']
        ) {
            return [ $field['default'], true ];
        }

        if ( in_array( $field['variant'] ?? '', self::SCALAR_VARIANTS, true ) ) {
            return [ '__rt_' . $field['id'], true ];
        }

        return [ null, false ];
    }

    /**
     * Find a transformer-free, single-segment, single-mapped field to drive the
     * drift guard (so the asserted value is unaffected by any transformer).
     *
     * @return array{id:string,option:string,field:string}|null
     */
    private function find_drift_guard_target(): ?array {
        foreach ( $this->legacy_key_fields() as $field ) {
            $legacy_key = $field['legacy_key'];
            if ( $this->is_multi( $legacy_key ) ) {
                continue;
            }
            if ( ! empty( $field['legacy_transformer'] ) ) {
                continue;
            }
            $path = $this->legacy_path( $legacy_key );
            if ( 1 !== count( $path ) ) {
                continue; // Need a top-level legacy field so payload[$field] sits at the path.
            }
            return [
                'id'     => (string) $field['id'],
                'option' => $this->legacy_options( $legacy_key )[0],
                'field'  => $path[0],
            ];
        }
        return null;
    }
}
