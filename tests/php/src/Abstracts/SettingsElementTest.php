<?php

namespace WeDevs\Dokan\Test\Abstracts;

use WeDevs\Dokan\Admin\OnboardingSetup\Components\Field;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Page;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Tests for the abstract SettingsElement class.
 *
 * Concrete subclasses (Page, Field) are used as instantiable stand-ins for the
 * abstract — they are the same classes the legacy onboarding flow exercises in
 * production, so the assertions reflect the real wiring.
 *
 * @group admin-settings
 * @group settings-schema
 */
class SettingsElementTest extends DokanTestCase {

    /**
     * After the dependency_key cleanup, a child's dependency_key must equal its
     * own id — not the parent-prefixed dot-path that the previous implementation
     * emitted. The JS plugin-ui no longer expects dot-paths, so the PHP layer
     * must hand back the flat key the formatter assumes.
     */
    public function test_dependency_key_equals_id_not_dot_path() {
        $parent = new Page( 'general' );
        $child  = new Field( 'commission_type' );
        $parent->set_children( [ $child ] );

        $children = $parent->get_children();
        $resolved = $children['commission_type'];

        $this->assertSame( 'commission_type', $resolved->get_dependency_key() );
    }

    /**
     * Verifies get_dependencies() stamps the `self` key with the element's id,
     * so downstream consumers (UI dependency engine) match rules by the flat
     * key the rest of the system uses.
     */
    public function test_get_dependencies_uses_id_for_self() {
        $field = new Field( 'commission_type' );
        $field->add_dependency( 'enable_commission', true );

        // Pretend a parent already assigned a stale dependency_key — id must win.
        $field->set_dependency_key( 'general.commission_type' );

        $dependencies = $field->get_dependencies();

        $this->assertCount( 1, $dependencies );
        $this->assertSame( 'commission_type', $dependencies[0]['self'] );
    }

    /**
     * Mirrors test_get_dependencies_uses_id_for_self: get_validations() must
     * stamp the `self` key with the element's id, not its dependency_key.
     */
    public function test_get_validations_uses_id_for_self() {
        $field = new Field( 'commission_type' );
        $field->add_validation( 'required', 'Required' );

        $field->set_dependency_key( 'general.commission_type' );

        $validations = $field->get_validations();

        $this->assertCount( 1, $validations );
        $this->assertSame( 'commission_type', $validations[0]['self'] );
    }
}
