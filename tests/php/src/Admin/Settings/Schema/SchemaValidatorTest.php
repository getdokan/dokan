<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Schema\SchemaValidator;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Tests for SchemaValidator.
 *
 * @group admin-settings
 * @group schema-validator
 */
class SchemaValidatorTest extends DokanTestCase {

    /**
     * @var SchemaValidator
     */
    private SchemaValidator $validator;

    protected function setUp(): void {
        parent::setUp();
        $this->validator = new SchemaValidator();
    }

    // =========================================================================
    // Helper: minimal valid elements
    // =========================================================================

    /**
     * Returns a minimal valid schema with page → subpage → section → field.
     *
     * @return array
     */
    private function get_valid_schema(): array {
        return [
            [ 'id' => 'general', 'type' => 'page', 'title' => 'General' ],
            [ 'id' => 'marketplace', 'type' => 'subpage', 'page_id' => 'general' ],
            [ 'id' => 'settings', 'type' => 'section', 'subpage_id' => 'marketplace' ],
            [ 'id' => 'store_url', 'type' => 'field', 'variant' => 'text', 'section_id' => 'settings' ],
        ];
    }

    // =========================================================================
    // Valid schema passes
    // =========================================================================

    public function test_valid_schema_passes_with_no_errors(): void {
        $result = $this->validator->validate( $this->get_valid_schema() );

        $this->assertTrue( SchemaValidator::is_valid( $result ) );
        $this->assertEmpty( $result['errors'] );
        $this->assertEmpty( $result['warnings'] );
    }

    public function test_empty_schema_passes(): void {
        $result = $this->validator->validate( [] );

        $this->assertTrue( SchemaValidator::is_valid( $result ) );
    }

    // =========================================================================
    // Required properties checks
    // =========================================================================

    public function test_element_missing_type_reports_error(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'no_type' ],
        ] );

        $this->assertFalse( SchemaValidator::is_valid( $result ) );
        $this->assertStringContainsString( 'missing required "type"', $result['errors'][0] );
    }

    public function test_page_missing_title_reports_error(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'general', 'type' => 'page' ],
        ] );

        $this->assertFalse( SchemaValidator::is_valid( $result ) );
        $this->assertStringContainsString( 'missing required property "title"', $result['errors'][0] );
    }

    public function test_page_with_empty_title_reports_error(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'general', 'type' => 'page', 'title' => '' ],
        ] );

        $this->assertFalse( SchemaValidator::is_valid( $result ) );
        $this->assertStringContainsString( 'missing required property "title"', $result['errors'][0] );
    }

    public function test_field_missing_variant_reports_error(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'general', 'type' => 'page', 'title' => 'General' ],
            [ 'id' => 'mp', 'type' => 'subpage', 'page_id' => 'general' ],
            [ 'id' => 'sec', 'type' => 'section', 'subpage_id' => 'mp' ],
            [ 'id' => 'field1', 'type' => 'field', 'section_id' => 'sec' ],
        ] );

        $this->assertFalse( SchemaValidator::is_valid( $result ) );
        $this->assertStringContainsString( 'missing required property "variant"', $result['errors'][0] );
    }

    public function test_unknown_type_generates_warning(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'general', 'type' => 'page', 'title' => 'General' ],
            [ 'id' => 'widget1', 'type' => 'custom_widget', 'page_id' => 'general' ],
        ] );

        $this->assertNotEmpty( $result['warnings'] );
        $this->assertStringContainsString( 'unknown type "custom_widget"', $result['warnings'][0] );
    }

    // =========================================================================
    // Parent reference checks
    // =========================================================================

    public function test_subpage_with_nonexistent_page_id_reports_error(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'marketplace', 'type' => 'subpage', 'page_id' => 'nonexistent' ],
        ] );

        $this->assertFalse( SchemaValidator::is_valid( $result ) );
        $this->assertStringContainsString( 'page_id="nonexistent"', $result['errors'][0] );
        $this->assertStringContainsString( 'no page with that ID', $result['errors'][0] );
    }

    public function test_field_with_nonexistent_section_id_reports_error(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'general', 'type' => 'page', 'title' => 'General' ],
            [ 'id' => 'mp', 'type' => 'subpage', 'page_id' => 'general' ],
            [ 'id' => 'field1', 'type' => 'field', 'variant' => 'text', 'section_id' => 'ghost_section' ],
        ] );

        $this->assertFalse( SchemaValidator::is_valid( $result ) );
        $this->assertCount(
            1,
            array_filter( $result['errors'], fn( $e ) => str_contains( $e, 'section_id="ghost_section"' ) )
        );
    }

    public function test_valid_parent_reference_passes(): void {
        $result = $this->validator->validate( $this->get_valid_schema() );

        $parent_errors = array_filter( $result['errors'], fn( $e ) => str_contains( $e, 'no page' ) || str_contains( $e, 'no section' ) );
        $this->assertEmpty( $parent_errors );
    }

    // =========================================================================
    // Parent requirement checks (every non-page needs a parent)
    // =========================================================================

    public function test_section_without_any_parent_pointer_reports_error(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'general', 'type' => 'page', 'title' => 'General' ],
            [ 'id' => 'orphan_section', 'type' => 'section' ],
        ] );

        $this->assertFalse( SchemaValidator::is_valid( $result ) );
        $this->assertCount(
            1,
            array_filter( $result['errors'], fn( $e ) => str_contains( $e, 'Section "orphan_section" has no parent pointer' ) )
        );
    }

    public function test_fieldgroup_without_any_parent_pointer_reports_error(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'general', 'type' => 'page', 'title' => 'General' ],
            [ 'id' => 'orphan_fg', 'type' => 'fieldgroup' ],
        ] );

        $this->assertFalse( SchemaValidator::is_valid( $result ) );
        $this->assertCount(
            1,
            array_filter( $result['errors'], fn( $e ) => str_contains( $e, 'Fieldgroup "orphan_fg" has no parent pointer' ) )
        );
    }

    public function test_field_without_any_parent_pointer_reports_error(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'general', 'type' => 'page', 'title' => 'General' ],
            [ 'id' => 'orphan_field', 'type' => 'field', 'variant' => 'text' ],
        ] );

        $this->assertFalse( SchemaValidator::is_valid( $result ) );
        $this->assertCount(
            1,
            array_filter( $result['errors'], fn( $e ) => str_contains( $e, 'Field "orphan_field" has no parent pointer' ) )
        );
    }

    public function test_section_with_any_valid_parent_passes(): void {
        // Section inside a subpage.
        $result1 = $this->validator->validate( [
            [ 'id' => 'p', 'type' => 'page', 'title' => 'P' ],
            [ 'id' => 'sp', 'type' => 'subpage', 'page_id' => 'p' ],
            [ 'id' => 'sec', 'type' => 'section', 'subpage_id' => 'sp' ],
        ] );
        $this->assertEmpty( array_filter( $result1['errors'], fn( $e ) => str_contains( $e, 'no parent pointer' ) ) );

        // Section inside a tab.
        $result2 = $this->validator->validate( [
            [ 'id' => 'p', 'type' => 'page', 'title' => 'P' ],
            [ 'id' => 'sp', 'type' => 'subpage', 'page_id' => 'p' ],
            [ 'id' => 'tab1', 'type' => 'tab', 'subpage_id' => 'sp' ],
            [ 'id' => 'sec', 'type' => 'section', 'tab_id' => 'tab1' ],
        ] );
        $this->assertEmpty( array_filter( $result2['errors'], fn( $e ) => str_contains( $e, 'no parent pointer' ) ) );
    }

    // =========================================================================
    // Reachability checks
    // =========================================================================

    public function test_element_reachable_to_page_passes(): void {
        $result = $this->validator->validate( $this->get_valid_schema() );

        $reachability_warnings = array_filter( $result['warnings'], fn( $w ) => str_contains( $w, 'cannot trace' ) );
        $this->assertEmpty( $reachability_warnings );
    }

    public function test_deep_chain_reaches_page(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'p', 'type' => 'page', 'title' => 'P' ],
            [ 'id' => 'sp', 'type' => 'subpage', 'page_id' => 'p' ],
            [ 'id' => 'tab1', 'type' => 'tab', 'subpage_id' => 'sp' ],
            [ 'id' => 'sec', 'type' => 'section', 'tab_id' => 'tab1' ],
            [ 'id' => 'subsec', 'type' => 'subsection', 'section_id' => 'sec' ],
            [ 'id' => 'fg', 'type' => 'fieldgroup', 'subsection_id' => 'subsec' ],
            [ 'id' => 'f', 'type' => 'field', 'variant' => 'text', 'field_group_id' => 'fg' ],
        ] );

        $this->assertTrue( SchemaValidator::is_valid( $result ) );
        $this->assertEmpty( $result['warnings'] );
    }

    // =========================================================================
    // Duplicate ID checks
    // =========================================================================

    public function test_duplicate_section_id_generates_warning(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'p', 'type' => 'page', 'title' => 'P' ],
            [ 'id' => 'sp', 'type' => 'subpage', 'page_id' => 'p' ],
            [ 'id' => 'sec', 'type' => 'section', 'subpage_id' => 'sp' ],
            [ 'id' => 'sec', 'type' => 'section', 'subpage_id' => 'sp' ],
        ] );

        $this->assertNotEmpty( $result['warnings'] );
        $this->assertStringContainsString( 'Duplicate ID', $result['warnings'][0] );
    }

    public function test_same_field_id_in_different_sections_is_allowed(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'p', 'type' => 'page', 'title' => 'P' ],
            [ 'id' => 'sp', 'type' => 'subpage', 'page_id' => 'p' ],
            [ 'id' => 'sec1', 'type' => 'section', 'subpage_id' => 'sp' ],
            [ 'id' => 'sec2', 'type' => 'section', 'subpage_id' => 'sp' ],
            [ 'id' => 'enabled', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'sec1' ],
            [ 'id' => 'enabled', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'sec2' ],
        ] );

        $dup_warnings = array_filter( $result['warnings'], fn( $w ) => str_contains( $w, 'Duplicate' ) );
        $this->assertEmpty( $dup_warnings );
    }

    public function test_same_id_different_types_is_allowed(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'p', 'type' => 'page', 'title' => 'P' ],
            [ 'id' => 'commission', 'type' => 'subpage', 'page_id' => 'p' ],
            [ 'id' => 'commission', 'type' => 'section', 'subpage_id' => 'commission' ],
        ] );

        $dup_warnings = array_filter( $result['warnings'], fn( $w ) => str_contains( $w, 'Duplicate' ) );
        $this->assertEmpty( $dup_warnings );
    }

    // =========================================================================
    // Globally-unique field-id checks (error, not warning)
    // =========================================================================

    /**
     * Build a canonical two-page schema (page → subpage → section → field) with one field per page.
     *
     * The structure matches the chain that real Dokan schemas use, so the
     * helper exercises check_reachability and check_parent_requirements
     * cleanly — any spurious validator error becomes visible in tests
     * rather than silently passing through filter-based assertions.
     *
     * @param string $field_id_general     The id for the general page's field.
     * @param string $field_id_transaction The id for the transaction page's field.
     *
     * @return array
     */
    private function build_two_page_schema( string $field_id_general, string $field_id_transaction ): array {
        return [
            [ 'id' => 'general', 'type' => 'page', 'title' => 'General' ],
            [ 'id' => 'transaction', 'type' => 'page', 'title' => 'Transaction' ],
            [ 'id' => 'general_sub', 'type' => 'subpage', 'page_id' => 'general' ],
            [ 'id' => 'transaction_sub', 'type' => 'subpage', 'page_id' => 'transaction' ],
            [ 'id' => 'general_section', 'type' => 'section', 'subpage_id' => 'general_sub' ],
            [ 'id' => 'txn_section', 'type' => 'section', 'subpage_id' => 'transaction_sub' ],
            [ 'id' => $field_id_general, 'type' => 'field', 'variant' => 'text', 'section_id' => 'general_section' ],
            [ 'id' => $field_id_transaction, 'type' => 'field', 'variant' => 'text', 'section_id' => 'txn_section' ],
        ];
    }

    public function test_unique_field_ids_passes_when_all_ids_distinct(): void {
        $result = $this->validator->validate( $this->build_two_page_schema( 'foo', 'bar' ) );

        // Sanity: schema should be fully valid, not just free of duplicate-field-id errors.
        $this->assertEmpty( $result['errors'], 'Helper schema must validate cleanly: ' . implode( '; ', $result['errors'] ) );

        $duplicate_errors = array_filter(
            $result['errors'],
            fn( $msg ) => str_contains( $msg, 'Duplicate field id' )
        );

        $this->assertEmpty( $duplicate_errors, 'No duplicate-field-id errors expected when all ids are unique.' );
    }

    public function test_unique_field_ids_fails_on_cross_page_collision(): void {
        $result = $this->validator->validate( $this->build_two_page_schema( 'shared_id', 'shared_id' ) );

        $duplicate_errors = array_filter(
            $result['errors'],
            fn( $msg ) => str_contains( $msg, 'Duplicate field id' ) && str_contains( $msg, 'shared_id' )
        );

        $this->assertNotEmpty( $duplicate_errors, 'Expected a duplicate-field-id error when the same id appears under two pages.' );
    }

    public function test_unique_field_ids_ignores_non_field_elements(): void {
        // A `fieldgroup` and a `field` can share an id (existing schema pattern: google_map_api_key).
        $result = $this->validator->validate( [
            [ 'id' => 'general', 'type' => 'page', 'title' => 'General' ],
            [ 'id' => 'general_section', 'type' => 'section', 'page_id' => 'general', 'title' => 'General Section' ],
            [ 'id' => 'my_group', 'type' => 'fieldgroup', 'section_id' => 'general_section' ],
            [ 'id' => 'my_group', 'type' => 'field', 'variant' => 'text', 'field_group_id' => 'my_group', 'title' => 'My Field' ],
        ] );

        $duplicate_errors = array_filter(
            $result['errors'],
            fn( $msg ) => str_contains( $msg, 'Duplicate field id' )
        );

        $this->assertEmpty( $duplicate_errors, 'A field and a fieldgroup sharing an id must not trigger the field-id-uniqueness rule.' );
    }

    // =========================================================================
    // Variant checks
    // =========================================================================

    public function test_known_variant_passes(): void {
        $result = $this->validator->validate( $this->get_valid_schema() );

        $variant_warnings = array_filter( $result['warnings'], fn( $w ) => str_contains( $w, 'unknown variant' ) );
        $this->assertEmpty( $variant_warnings );
    }

    public function test_unknown_variant_generates_warning(): void {
        $result = $this->validator->validate( [
            [ 'id' => 'p', 'type' => 'page', 'title' => 'P' ],
            [ 'id' => 'sp', 'type' => 'subpage', 'page_id' => 'p' ],
            [ 'id' => 'sec', 'type' => 'section', 'subpage_id' => 'sp' ],
            [ 'id' => 'f', 'type' => 'field', 'variant' => 'alien_widget', 'section_id' => 'sec' ],
        ] );

        $variant_warnings = array_filter( $result['warnings'], fn( $w ) => str_contains( $w, 'unknown variant "alien_widget"' ) );
        $this->assertCount( 1, $variant_warnings );
    }

    public function test_custom_variant_registered_via_filter_passes(): void {
        add_filter( 'dokan_admin_settings_known_variants', function ( $variants ) {
            $variants[] = 'my_custom_field';
            return $variants;
        } );

        $result = $this->validator->validate( [
            [ 'id' => 'p', 'type' => 'page', 'title' => 'P' ],
            [ 'id' => 'sp', 'type' => 'subpage', 'page_id' => 'p' ],
            [ 'id' => 'sec', 'type' => 'section', 'subpage_id' => 'sp' ],
            [ 'id' => 'f', 'type' => 'field', 'variant' => 'my_custom_field', 'section_id' => 'sec' ],
        ] );

        $variant_warnings = array_filter( $result['warnings'], fn( $w ) => str_contains( $w, 'unknown variant' ) );
        $this->assertEmpty( $variant_warnings );
    }

    // =========================================================================
    // Filter extensibility
    // =========================================================================

    public function test_custom_type_via_required_properties_filter(): void {
        add_filter( 'dokan_admin_settings_schema_required_properties', function ( $props ) {
            $props['widget'] = [ 'id', 'type', 'widget_type' ];
            return $props;
        } );

        // Missing widget_type should error.
        $result = $this->validator->validate( [
            [ 'id' => 'w1', 'type' => 'widget', 'page_id' => 'p' ],
        ] );

        $this->assertFalse( SchemaValidator::is_valid( $result ) );
        $this->assertStringContainsString( 'missing required property "widget_type"', $result['errors'][0] );
    }

    public function test_custom_parent_pointer_via_filter(): void {
        add_filter( 'dokan_admin_settings_schema_parent_pointer_map', function ( $map ) {
            $map['panel_id'] = 'panel';
            return $map;
        } );

        $result = $this->validator->validate( [
            [ 'id' => 'p', 'type' => 'page', 'title' => 'P' ],
            [ 'id' => 'sec', 'type' => 'section', 'panel_id' => 'nonexistent_panel' ],
        ] );

        // Should report that 'nonexistent_panel' panel doesn't exist.
        $panel_errors = array_filter( $result['errors'], fn( $e ) => str_contains( $e, 'panel_id="nonexistent_panel"' ) );
        $this->assertNotEmpty( $panel_errors );
    }

    public function test_types_requiring_parent_filter(): void {
        add_filter( 'dokan_admin_settings_schema_types_requiring_parent', function ( $types ) {
            $types[] = 'card';
            return $types;
        } );

        add_filter( 'dokan_admin_settings_schema_required_properties', function ( $props ) {
            $props['card'] = [ 'id', 'type' ];
            return $props;
        } );

        $result = $this->validator->validate( [
            [ 'id' => 'p', 'type' => 'page', 'title' => 'P' ],
            [ 'id' => 'c1', 'type' => 'card' ], // No parent pointer.
        ] );

        $parent_errors = array_filter( $result['errors'], fn( $e ) => str_contains( $e, 'Card "c1" has no parent pointer' ) );
        $this->assertNotEmpty( $parent_errors );
    }

    // =========================================================================
    // Skip / bypass
    // =========================================================================

    public function test_skip_validation_via_filter(): void {
        add_filter( 'dokan_admin_settings_schema_skip_validation', '__return_true' );

        // Invalid schema — but validation is skipped.
        $result = $this->validator->validate( [
            [ 'id' => 'bad' ],
        ] );

        $this->assertTrue( SchemaValidator::is_valid( $result ) );
        $this->assertEmpty( $result['errors'] );
    }

    public function test_validation_result_filter_can_suppress_errors(): void {
        add_filter( 'dokan_admin_settings_schema_validation_result', function ( $result ) {
            $result['errors'] = []; // Suppress all errors.
            return $result;
        } );

        $result = $this->validator->validate( [
            [ 'id' => 'bad' ],
        ] );

        $this->assertTrue( SchemaValidator::is_valid( $result ) );
    }

    // =========================================================================
    // Action hooks
    // =========================================================================

    public function test_before_validate_action_can_add_errors(): void {
        add_action( 'dokan_admin_settings_schema_before_validate', function ( $elements, $validator ) {
            $validator->add_error( 'Custom pre-check failed.' );
        }, 10, 2 );

        $result = $this->validator->validate( $this->get_valid_schema() );

        $this->assertFalse( SchemaValidator::is_valid( $result ) );
        $this->assertContains( 'Custom pre-check failed.', $result['errors'] );
    }

    public function test_before_validate_action_can_add_warnings(): void {
        add_action( 'dokan_admin_settings_schema_before_validate', function ( $elements, $validator ) {
            $validator->add_warning( 'Custom advisory note.' );
        }, 10, 2 );

        $result = $this->validator->validate( $this->get_valid_schema() );

        $this->assertTrue( SchemaValidator::is_valid( $result ) ); // Warnings don't fail.
        $this->assertContains( 'Custom advisory note.', $result['warnings'] );
    }

    // =========================================================================
    // add_error / add_warning public API
    // =========================================================================

    public function test_add_error_is_included_in_result(): void {
        add_action( 'dokan_admin_settings_schema_before_validate', function ( $el, $v ) {
            $v->add_error( 'Error one' );
            $v->add_error( 'Error two' );
        }, 10, 2 );

        $result = $this->validator->validate( [] );

        $this->assertCount( 2, $result['errors'] );
        $this->assertContains( 'Error one', $result['errors'] );
        $this->assertContains( 'Error two', $result['errors'] );
    }

    public function test_add_warning_is_included_in_result(): void {
        add_action( 'dokan_admin_settings_schema_before_validate', function ( $el, $v ) {
            $v->add_warning( 'Heads up' );
        }, 10, 2 );

        $result = $this->validator->validate( [] );

        $this->assertCount( 1, $result['warnings'] );
    }

    // =========================================================================
    // is_valid helper
    // =========================================================================

    public function test_is_valid_returns_true_when_no_errors(): void {
        $this->assertTrue( SchemaValidator::is_valid( [ 'errors' => [], 'warnings' => [ 'some warning' ] ] ) );
    }

    public function test_is_valid_returns_false_when_errors_exist(): void {
        $this->assertFalse( SchemaValidator::is_valid( [ 'errors' => [ 'something broke' ], 'warnings' => [] ] ) );
    }

    // =========================================================================
    // All known Lite variants pass
    // =========================================================================

    /**
     * @dataProvider known_variant_provider
     */
    public function test_all_lite_variants_pass_validation( string $variant ): void {
        $result = $this->validator->validate( [
            [ 'id' => 'p', 'type' => 'page', 'title' => 'P' ],
            [ 'id' => 'sp', 'type' => 'subpage', 'page_id' => 'p' ],
            [ 'id' => 'sec', 'type' => 'section', 'subpage_id' => 'sp' ],
            [ 'id' => 'f', 'type' => 'field', 'variant' => $variant, 'section_id' => 'sec' ],
        ] );

        $variant_warnings = array_filter( $result['warnings'], fn( $w ) => str_contains( $w, 'unknown variant' ) );
        $this->assertEmpty( $variant_warnings, "Variant '{$variant}' should be recognized." );
    }

    /**
     * Data provider for all 31 known Lite variants.
     *
     * @return array<string, array{string}>
     */
    public static function known_variant_provider(): array {
        $variants = [
            'text', 'number', 'checkbox', 'select', 'refresh_select', 'radio', 'tel',
            'password', 'radio_box', 'switch', 'multicheck', 'currency', 'combine_input',
            'category_based_commission', 'radio_capsule', 'info', 'double_input',
            'base_field_label', 'customize_radio', 'html', 'notice', 'repeater',
            'rich_text', 'show_hide', 'select_color_picker', 'copy_field', 'file_upload',
            'vendor_info_preview', 'single_product_preview', 'textarea', 'withdraw_schedule',
        ];

        $data = [];
        foreach ( $variants as $v ) {
            $data[ $v ] = [ $v ];
        }

        return $data;
    }
}
