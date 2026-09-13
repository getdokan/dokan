<?php

namespace WeDevs\Dokan\Test\Abstracts;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Minimal concrete `page` element for exercising the abstract.
 */
class SettingsElementPageDouble extends SettingsElement {

    protected $type = 'page';

    public function data_validation( $data ): bool {
        return is_array( $data );
    }

    public function sanitize_element( $data ) {
        return $data;
    }

    public function escape_element( $data ) {
        return $data;
    }
}

/**
 * Minimal concrete `field` element for exercising the abstract.
 */
class SettingsElementFieldDouble extends SettingsElement {

    protected $type = 'field';

    public function data_validation( $data ): bool {
        return true;
    }

    public function sanitize_element( $data ) {
        return $data;
    }

    public function escape_element( $data ) {
        return $data;
    }
}

/**
 * Tests for the abstract SettingsElement class.
 *
 * Lightweight in-file doubles stand in for the abstract so the assertions cover
 * the generic element behavior (id, children, dependencies, validations,
 * serialization) without depending on any concrete production element.
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
        $parent = new SettingsElementPageDouble( 'general' );
        $child  = new SettingsElementFieldDouble( 'commission_type' );
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
        $field = new SettingsElementFieldDouble( 'commission_type' );
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
        $field = new SettingsElementFieldDouble( 'commission_type' );
        $field->add_validation( 'required', 'Required' );

        $validations = $field->get_validations();

        $this->assertCount( 1, $validations );
        $this->assertSame( 'commission_type', $validations[0]['self'] );
    }

    /**
     * populate() output must omit the legacy `dependency_key` field — it was
     * deleted from the schema in the dependency_key cleanup.
     */
    public function test_populate_omits_dependency_key() {
        $field = new SettingsElementFieldDouble( 'site_logo' );
        $this->assertArrayNotHasKey( 'dependency_key', $field->populate() );
    }
}
