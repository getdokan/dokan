<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Schema\SchemaValidator;
use WeDevs\Dokan\Admin\Settings\Schema\SettingsSchema;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Tests for the Lite SettingsSchema flat array output.
 *
 * Validates that the schema produced by SettingsSchema::get_schema() is
 * structurally correct and contains all expected elements.
 *
 * @group admin-settings
 * @group settings-schema
 */
class SettingsSchemaTest extends DokanTestCase {

    /**
     * Cached schema from get_schema().
     *
     * @var array|null
     */
    private ?array $schema = null;

    /**
     * Get the schema (cached per test class instance).
     *
     * @return array
     */
    private function get_schema(): array {
        if ( null === $this->schema ) {
            $this->schema = SettingsSchema::get_schema();
        }

        return $this->schema;
    }

    /**
     * Helper to get all elements of a specific type.
     *
     * @param string $type Element type.
     *
     * @return array
     */
    private function get_elements_by_type( string $type ): array {
        return array_filter( $this->get_schema(), fn( $el ) => ( $el['type'] ?? '' ) === $type );
    }

    /**
     * Helper to find an element by id and type.
     *
     * @param string $id   Element ID.
     * @param string $type Element type.
     *
     * @return array|null
     */
    private function find_element( string $id, string $type = '' ): ?array {
        foreach ( $this->get_schema() as $el ) {
            if ( ( $el['id'] ?? '' ) === $id ) {
                if ( '' === $type || ( $el['type'] ?? '' ) === $type ) {
                    return $el;
                }
            }
        }

        return null;
    }

    /**
     * Helper to get all field elements.
     *
     * @return array
     */
    private function get_fields(): array {
        return $this->get_elements_by_type( 'field' );
    }

    // =========================================================================
    // Schema structure
    // =========================================================================

    public function test_schema_is_non_empty_array(): void {
        $schema = $this->get_schema();

        $this->assertIsArray( $schema );
        $this->assertNotEmpty( $schema );
    }

    public function test_every_element_has_id_and_type(): void {
        foreach ( $this->get_schema() as $index => $el ) {
            $this->assertArrayHasKey( 'id', $el, "Element at index {$index} is missing 'id'." );
            $this->assertArrayHasKey( 'type', $el, "Element at index {$index} is missing 'type'." );
        }
    }

    // =========================================================================
    // Schema passes validation
    // =========================================================================

    public function test_schema_passes_validator_with_no_errors(): void {
        $validator = new SchemaValidator();
        $result    = $validator->validate( $this->get_schema() );

        $this->assertTrue(
            SchemaValidator::is_valid( $result ),
            'Schema has validation errors: ' . implode( '; ', $result['errors'] )
        );
    }

    public function test_schema_passes_validator_with_no_warnings(): void {
        $validator = new SchemaValidator();
        $result    = $validator->validate( $this->get_schema() );

        $this->assertEmpty(
            $result['warnings'],
            'Schema has warnings: ' . implode( '; ', $result['warnings'] )
        );
    }

    // =========================================================================
    // Expected pages
    // =========================================================================

    public function test_schema_has_all_lite_pages(): void {
        $pages    = $this->get_elements_by_type( 'page' );
        $page_ids = array_column( $pages, 'id' );

        $expected = [ 'general', 'transaction', 'vendor', 'appearance', 'compliance', 'ai_assist', 'moderation', 'product' ];

        foreach ( $expected as $id ) {
            $this->assertContains( $id, $page_ids, "Page '{$id}' is missing from the schema." );
        }
    }

    public function test_every_page_has_title(): void {
        $pages = $this->get_elements_by_type( 'page' );

        foreach ( $pages as $page ) {
            $this->assertNotEmpty( $page['title'], "Page '{$page['id']}' has empty title." );
        }
    }

    // =========================================================================
    // Expected subpages
    // =========================================================================

    public function test_general_page_has_expected_subpages(): void {
        $subpages = array_filter(
            $this->get_elements_by_type( 'subpage' ),
            fn( $el ) => ( $el['page_id'] ?? '' ) === 'general'
        );
        $ids = array_column( $subpages, 'id' );

        $this->assertContains( 'marketplace', $ids );
        $this->assertContains( 'dokan_pages', $ids );
        $this->assertContains( 'location', $ids );
    }

    public function test_transaction_page_has_expected_subpages(): void {
        $subpages = array_filter(
            $this->get_elements_by_type( 'subpage' ),
            fn( $el ) => ( $el['page_id'] ?? '' ) === 'transaction'
        );
        $ids = array_column( $subpages, 'id' );

        $this->assertContains( 'fees', $ids );
        $this->assertContains( 'commission', $ids );
        $this->assertContains( 'withdraw_charge', $ids );
        $this->assertContains( 'reverse_withdrawal', $ids );
    }

    // =========================================================================
    // Expected fields
    // =========================================================================

    public function test_vendor_store_url_slug_field_exists(): void {
        $field = $this->find_element( 'vendor_store_url_slug', 'field' );

        $this->assertNotNull( $field, 'vendor_store_url_slug field not found.' );
        $this->assertSame( 'text', $field['variant'] );
        $this->assertSame( 'store', $field['default'] );
        $this->assertSame( 'marketplace_settings', $field['section_id'] );
    }

    public function test_commission_type_field_exists_with_options(): void {
        $field = $this->find_element( 'commission_type', 'field' );

        $this->assertNotNull( $field );
        $this->assertSame( 'radio_capsule', $field['variant'] );
        $this->assertArrayHasKey( 'options', $field );
        $this->assertCount( 2, $field['options'] );

        $values = array_column( $field['options'], 'value' );
        $this->assertContains( 'fixed', $values );
        $this->assertContains( 'category_based', $values );
    }

    public function test_admin_commission_field_has_dependencies(): void {
        $field = $this->find_element( 'admin_commission', 'field' );

        $this->assertNotNull( $field );
        $this->assertSame( 'combine_input', $field['variant'] );
        $this->assertArrayHasKey( 'dependencies', $field );
        $this->assertNotEmpty( $field['dependencies'] );
    }

    public function test_data_clear_field_has_confirm_modal(): void {
        $field = $this->find_element( 'data_clear_on_uninstall', 'field' );

        $this->assertNotNull( $field );
        $this->assertSame( 'switch', $field['variant'] );
        $this->assertTrue( $field['should_confirm'] );
        $this->assertSame( 'error', $field['switcher_type'] );
        $this->assertArrayHasKey( 'confirm_modal', $field );
        $this->assertArrayHasKey( 'title', $field['confirm_modal'] );
        $this->assertArrayHasKey( 'confirmText', $field['confirm_modal'] );
    }

    public function test_reverse_withdrawal_fields_have_correct_dependencies(): void {
        $threshold = $this->find_element( 'reverse_balance_threshold', 'field' );

        $this->assertNotNull( $threshold );
        $this->assertNotEmpty( $threshold['dependencies'] );

        // Should depend on billing_type.
        $dep_keys = array_column( $threshold['dependencies'], 'key' );
        $this->assertTrue(
            in_array( 'billing_type', $dep_keys, true ),
            'reverse_balance_threshold should depend on billing_type (flat-key form).'
        );
    }

    // =========================================================================
    // Translation (i18n)
    // =========================================================================

    public function test_page_titles_are_strings_not_null(): void {
        $pages = $this->get_elements_by_type( 'page' );

        foreach ( $pages as $page ) {
            $this->assertIsString( $page['title'], "Page '{$page['id']}' title should be a string." );
        }
    }

    public function test_field_titles_are_strings(): void {
        foreach ( $this->get_fields() as $field ) {
            if ( isset( $field['title'] ) ) {
                $this->assertIsString(
                    $field['title'],
                    "Field '{$field['id']}' title should be a string."
                );
            }
        }
    }

    // =========================================================================
    // Filter extensibility
    // =========================================================================

    public function test_schema_is_filterable(): void {
        add_filter( 'dokan_get_admin_settings_schema', function ( $elements ) {
            $elements[] = [
                'id'       => 'custom_page',
                'type'     => 'page',
                'title'    => 'Custom',
                'priority' => 999,
            ];
            return $elements;
        } );

        // Reset cache.
        $this->schema = null;
        $schema       = $this->get_schema();

        $custom = $this->find_element( 'custom_page', 'page' );
        $this->assertNotNull( $custom );
        $this->assertSame( 'Custom', $custom['title'] );
    }

    // =========================================================================
    // Switch fields have enable/disable states
    // =========================================================================

    public function test_switch_fields_have_enable_disable_states(): void {
        $switches = array_filter(
            $this->get_fields(),
            fn( $f ) => ( $f['variant'] ?? '' ) === 'switch'
        );

        foreach ( $switches as $field ) {
            $this->assertArrayHasKey(
                'enable_state',
                $field,
                "Switch field '{$field['id']}' is missing enable_state."
            );
            $this->assertArrayHasKey(
                'disable_state',
                $field,
                "Switch field '{$field['id']}' is missing disable_state."
            );
            $this->assertArrayHasKey( 'label', $field['enable_state'] );
            $this->assertArrayHasKey( 'value', $field['enable_state'] );
            $this->assertArrayHasKey( 'label', $field['disable_state'] );
            $this->assertArrayHasKey( 'value', $field['disable_state'] );
        }
    }

    // =========================================================================
    // Select/radio fields have options
    // =========================================================================

    public function test_select_and_radio_fields_have_options(): void {
        $option_variants = [ 'select', 'radio_capsule', 'radio', 'radio_box', 'customize_radio', 'multicheck' ];

        $fields = array_filter(
            $this->get_fields(),
            fn( $f ) => in_array( $f['variant'] ?? '', $option_variants, true )
        );

        foreach ( $fields as $field ) {
            // Some selects have dynamic options (populated at runtime).
            if ( isset( $field['options'] ) ) {
                $this->assertIsArray(
                    $field['options'],
                    "Field '{$field['id']}' options should be an array."
                );
            }
        }
    }

    // =========================================================================
    // Number fields have numeric defaults
    // =========================================================================

    public function test_number_fields_have_numeric_defaults(): void {
        $numbers = array_filter(
            $this->get_fields(),
            fn( $f ) => ( $f['variant'] ?? '' ) === 'number' && isset( $f['default'] )
        );

        foreach ( $numbers as $field ) {
            $this->assertTrue(
                is_numeric( $field['default'] ),
                "Number field '{$field['id']}' default should be numeric, got: " . var_export( $field['default'], true )
            );
        }
    }
}
