<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Schema\SettingsSchema;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Behavior tests for show_if / dependencies rules in the Lite SettingsSchema.
 *
 * Phase 2 of the dependency_key cleanup (Task 5) rewrites every dot-path
 * dependency key in the schema to flat-key form so it resolves to a real
 * field id. These tests guard against regressing back to a dot-path: the
 * client-side `evaluateDependencies()` only resolves flat-key targets to
 * the schema's id index, so a stale dot-path leaves the dependent field
 * permanently invisible (or visible when it should hide).
 *
 * The tests intentionally operate at the data level — show_if visibility
 * is enforced client-side, so the meaningful PHP assertion is that every
 * declared key resolves to an existing field id.
 *
 * @group admin-settings
 * @group settings-schema
 * @group settings-show-if
 */
class ShowIfBehaviorTest extends DokanTestCase {

    /**
     * Cached schema for the test class.
     *
     * @var array<int, array<string, mixed>>
     */
    private array $schema = [];

    /**
     * Map of field id => true for fast existence checks.
     *
     * @var array<string, bool>
     */
    private array $field_ids = [];

    public function set_up() {
        parent::set_up();

        $this->schema    = SettingsSchema::get_schema();
        $this->field_ids = [];

        foreach ( $this->schema as $element ) {
            if ( ( $element['type'] ?? '' ) === 'field' ) {
                $id = $element['id'] ?? null;
                if ( is_string( $id ) && $id !== '' ) {
                    $this->field_ids[ $id ] = true;
                }
            }
        }
    }

    /**
     * Every show_if rule must reference a flat field id that exists in the schema.
     *
     * A dot-path key like 'commission.commission.commission_type' would be
     * treated as a literal id and would not resolve to any field — meaning
     * the dependency silently does nothing.
     */
    public function test_every_show_if_rule_targets_an_existing_field(): void {
        $rules_checked = 0;
        $missing       = [];

        foreach ( $this->schema as $element ) {
            $show_if = $element['show_if'] ?? null;
            if ( ! is_array( $show_if ) ) {
                continue;
            }

            foreach ( $show_if as $key => $_value ) {
                if ( ! is_string( $key ) || $key === '' ) {
                    continue;
                }

                $rules_checked++;

                $this->assertStringNotContainsString(
                    '.',
                    $key,
                    "show_if key '{$key}' on element '" . ( $element['id'] ?? '?' ) . "' must be a flat field id, not a dot-path."
                );

                if ( ! isset( $this->field_ids[ $key ] ) ) {
                    $missing[] = ( $element['id'] ?? '?' ) . ": show_if key '{$key}' targets unknown field";
                }
            }
        }

        // The schema may or may not declare show_if at the SettingsSchema level
        // (dependencies are the preferred form). Don't fail when zero — only
        // fail when a declared rule is broken.
        $this->assertEmpty(
            $missing,
            "All show_if rule keys must resolve to an existing field id. Failures:\n" . implode( "\n", $missing )
        );
    }

    /**
     * Every dependencies[].key must reference a flat field id that exists.
     *
     * This is the primary form used in SettingsSchema (fieldgroup/field
     * conditional visibility). A stale dot-path here is the bug Task 5 fixes.
     */
    public function test_every_dependencies_rule_targets_an_existing_field(): void {
        $rules_checked = 0;
        $missing       = [];

        foreach ( $this->schema as $element ) {
            $deps = $element['dependencies'] ?? null;
            if ( ! is_array( $deps ) ) {
                continue;
            }

            foreach ( $deps as $dep ) {
                if ( ! is_array( $dep ) ) {
                    continue;
                }

                $key = $dep['key'] ?? null;
                if ( ! is_string( $key ) || $key === '' ) {
                    continue;
                }

                $rules_checked++;

                $this->assertStringNotContainsString(
                    '.',
                    $key,
                    "dependencies key '{$key}' on element '" . ( $element['id'] ?? '?' ) . "' must be a flat field id, not a dot-path."
                );

                if ( ! isset( $this->field_ids[ $key ] ) ) {
                    $missing[] = ( $element['id'] ?? '?' ) . ": dependency key '{$key}' targets unknown field";
                }
            }
        }

        $this->assertGreaterThan(
            0,
            $rules_checked,
            'No dependencies rules were checked — the test is meaningless if the schema has zero rules. Either the schema was emptied or the test query is wrong.'
        );

        $this->assertEmpty(
            $missing,
            "All dependency keys must resolve to an existing field id. Failures:\n" . implode( "\n", $missing )
        );
    }

    /**
     * Reverse-withdrawal child fields must depend on `billing_type` (flat),
     * never on the old dot-path `reverse_withdrawal.reverse_withdrawal_section.billing_type`.
     *
     * This is a representative spot-check: if Task 5 left any stale dot-path
     * in this subpage, this test catches it directly rather than relying on
     * the generic dot-detector.
     */
    public function test_reverse_withdrawal_billing_type_dependencies_are_flat(): void {
        $threshold = null;
        foreach ( $this->schema as $element ) {
            if ( ( $element['id'] ?? '' ) === 'reverse_balance_threshold'
                && ( $element['type'] ?? '' ) === 'field'
            ) {
                $threshold = $element;
                break;
            }
        }

        $this->assertNotNull(
            $threshold,
            'reverse_balance_threshold field must exist in the schema.'
        );
        $this->assertArrayHasKey( 'dependencies', $threshold );
        $this->assertNotEmpty( $threshold['dependencies'] );

        $dep_keys = array_column( $threshold['dependencies'], 'key' );

        $this->assertContains(
            'billing_type',
            $dep_keys,
            'reverse_balance_threshold should depend on the flat key `billing_type`.'
        );

        foreach ( $dep_keys as $dep_key ) {
            $this->assertStringNotContainsString(
                '.',
                (string) $dep_key,
                "reverse_balance_threshold dependency key '{$dep_key}' must be flat, not dot-path."
            );
        }
    }
}
