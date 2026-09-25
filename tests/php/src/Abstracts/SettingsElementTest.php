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
     * After the dependency_key cleanup, the dependency_key property/methods
     * are gone entirely — only `id` survives. Children resolved via the
     * parent's `get_children()` must carry their declared id unchanged.
     */
    public function test_get_id_returns_field_identifier_after_set_children() {
        $parent = new Page( 'general' );
        $child  = new Field( 'commission_type' );
        $parent->set_children( [ $child ] );

        $children = $parent->get_children();
        $resolved = $children['commission_type'];

        $this->assertSame( 'commission_type', $resolved->get_id() );
        $this->assertFalse( method_exists( $resolved, 'get_dependency_key' ) );
        $this->assertFalse( method_exists( $resolved, 'set_dependency_key' ) );
    }

    /**
     * Verifies get_dependencies() stamps the `self` key with the element's id,
     * so downstream consumers (UI dependency engine) match rules by the flat
     * key the rest of the system uses.
     */
    public function test_get_dependencies_uses_id_for_self() {
        $field = new Field( 'commission_type' );
        $field->add_dependency( 'enable_commission', true );

        $dependencies = $field->get_dependencies();

        $this->assertCount( 1, $dependencies );
        $this->assertSame( 'commission_type', $dependencies[0]['self'] );
    }

    /**
     * Mirrors test_get_dependencies_uses_id_for_self: get_validations() must
     * stamp the `self` key with the element's id.
     */
    public function test_get_validations_uses_id_for_self() {
        $field = new Field( 'commission_type' );
        $field->add_validation( 'required', 'Required' );

        $validations = $field->get_validations();

        $this->assertCount( 1, $validations );
        $this->assertSame( 'commission_type', $validations[0]['self'] );
    }

    /**
     * to_array() / populate() output must omit the legacy `dependency_key`
     * field — it was deleted from the schema in Task 11.
     */
    public function test_populate_omits_dependency_key() {
        $field = new Field( 'site_logo' );
        $this->assertArrayNotHasKey( 'dependency_key', $field->populate() );
    }
}
