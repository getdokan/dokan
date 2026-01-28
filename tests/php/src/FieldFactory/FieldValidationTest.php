<?php
/**
 * Field Validation Test
 *
 * @package WeDevs\Dokan\Test\FieldFactory
 */

namespace WeDevs\Dokan\Test\FieldFactory;

use WeDevs\Dokan\FieldFactory\FieldFactory;
use WeDevs\Dokan\FieldFactory\Registry\ElementRegistry;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Class FieldValidationTest
 *
 * Tests for field validation functionality.
 */
class FieldValidationTest extends DokanTestCase {

    /**
     * Indicates unit test mode.
     *
     * @var bool
     */
    protected $is_unit_test = true;

    /**
     * Set up the test.
     */
    public function set_up(): void {
        parent::set_up();
        FieldFactory::reset();
    }

    /**
     * Tear down the test.
     */
    public function tear_down(): void {
        FieldFactory::reset();
        parent::tear_down();
    }

    /**
     * Test required field validation - valid.
     */
    public function test_required_field_valid(): void {
        $field = FieldFactory::text( 'name', 'Name', [ 'required' => true ] );

        $result = $field->validate( [ 'name' => 'John' ] );

        $this->assertTrue( $result['valid'] );
        $this->assertEmpty( $result['errors'] );
    }

    /**
     * Test required field validation - empty value.
     */
    public function test_required_field_empty(): void {
        $field = FieldFactory::text( 'name', 'Name', [ 'required' => true ] );

        $result = $field->validate( [ 'name' => '' ] );

        $this->assertFalse( $result['valid'] );
        $this->assertNotEmpty( $result['errors'] );
    }

    /**
     * Test required field validation - missing key.
     */
    public function test_required_field_missing(): void {
        $field = FieldFactory::text( 'name', 'Name', [ 'required' => true ] );

        $result = $field->validate( [] );

        $this->assertFalse( $result['valid'] );
    }

    /**
     * Test optional field with empty value.
     */
    public function test_optional_field_empty(): void {
        $field = FieldFactory::text( 'name', 'Name', [ 'required' => false ] );

        $result = $field->validate( [ 'name' => '' ] );

        $this->assertTrue( $result['valid'] );
    }

    /**
     * Test number field min validation - valid.
     */
    public function test_number_min_valid(): void {
        $field = FieldFactory::number( 'age', 'Age', [ 'min' => 18 ] );

        $result = $field->validate( [ 'age' => 25 ] );

        $this->assertTrue( $result['valid'] );
    }

    /**
     * Test number field min validation - invalid.
     */
    public function test_number_min_invalid(): void {
        $field = FieldFactory::number( 'age', 'Age', [ 'min' => 18 ] );

        $result = $field->validate( [ 'age' => 15 ] );

        $this->assertFalse( $result['valid'] );
        $this->assertNotEmpty( $result['errors'] );
    }

    /**
     * Test number field max validation - valid.
     */
    public function test_number_max_valid(): void {
        $field = FieldFactory::number( 'rate', 'Rate', [ 'max' => 100 ] );

        $result = $field->validate( [ 'rate' => 50 ] );

        $this->assertTrue( $result['valid'] );
    }

    /**
     * Test number field max validation - invalid.
     */
    public function test_number_max_invalid(): void {
        $field = FieldFactory::number( 'rate', 'Rate', [ 'max' => 100 ] );

        $result = $field->validate( [ 'rate' => 150 ] );

        $this->assertFalse( $result['valid'] );
    }

    /**
     * Test number field min and max validation.
     */
    public function test_number_min_max_valid(): void {
        $field = FieldFactory::number(
            'rate', 'Rate', [
				'min' => 0,
				'max' => 100,
			]
        );

        $result = $field->validate( [ 'rate' => 50 ] );

        $this->assertTrue( $result['valid'] );
    }

    /**
     * Test minlength validation - valid.
     */
    public function test_minlength_valid(): void {
        $field = FieldFactory::text( 'name', 'Name', [ 'minlength' => 3 ] );

        $result = $field->validate( [ 'name' => 'John' ] );

        $this->assertTrue( $result['valid'] );
    }

    /**
     * Test minlength validation - invalid.
     */
    public function test_minlength_invalid(): void {
        $field = FieldFactory::text( 'name', 'Name', [ 'minlength' => 3 ] );

        $result = $field->validate( [ 'name' => 'Jo' ] );

        $this->assertFalse( $result['valid'] );
    }

    /**
     * Test maxlength validation - valid.
     */
    public function test_maxlength_valid(): void {
        $field = FieldFactory::text( 'code', 'Code', [ 'maxlength' => 5 ] );

        $result = $field->validate( [ 'code' => 'ABC' ] );

        $this->assertTrue( $result['valid'] );
    }

    /**
     * Test maxlength validation - invalid.
     */
    public function test_maxlength_invalid(): void {
        $field = FieldFactory::text( 'code', 'Code', [ 'maxlength' => 5 ] );

        $result = $field->validate( [ 'code' => 'ABCDEFGH' ] );

        $this->assertFalse( $result['valid'] );
    }

    /**
     * Test select field with valid option.
     */
    public function test_select_valid_option(): void {
        $field = FieldFactory::select(
            'country', 'Country', [
				[
					'value' => 'US',
					'label' => 'United States',
				],
				[
					'value' => 'UK',
					'label' => 'United Kingdom',
				],
			]
        );

        $result = $field->validate( [ 'country' => 'US' ] );

        $this->assertTrue( $result['valid'] );
    }

    /**
     * Test select field with invalid option.
     */
    public function test_select_invalid_option(): void {
        $field = FieldFactory::select(
            'country', 'Country', [
				[
					'value' => 'US',
					'label' => 'United States',
				],
				[
					'value' => 'UK',
					'label' => 'United Kingdom',
				],
			]
        );

        $result = $field->validate( [ 'country' => 'INVALID' ] );

        $this->assertFalse( $result['valid'] );
    }

    /**
     * Test multicheck with valid options.
     */
    public function test_multicheck_valid_options(): void {
        $field = FieldFactory::multicheck(
            'methods', 'Methods', [
				[
					'value' => 'paypal',
					'label' => 'PayPal',
				],
				[
					'value' => 'stripe',
					'label' => 'Stripe',
				],
			]
        );

        $result = $field->validate( [ 'methods' => [ 'paypal', 'stripe' ] ] );

        $this->assertTrue( $result['valid'] );
    }

    /**
     * Test FieldFactory::validate on element tree.
     */
    public function test_factory_validate_valid(): void {
        $elements = FieldFactory::create_from_data(
            [
				[
					'id' => 'name',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Name',
					'required' => true,
				],
				[
					'id' => 'age',
					'type' => 'field',
					'variant' => 'number',
					'title' => 'Age',
					'min' => 0,
				],
			]
        );

        $data = [
            'name' => 'John',
            'age'  => 25,
        ];

        $result = FieldFactory::validate( $elements, $data );

        $this->assertTrue( $result['valid'] );
        $this->assertEmpty( $result['errors'] );
    }

    /**
     * Test FieldFactory::validate with errors.
     */
    public function test_factory_validate_with_errors(): void {
        $elements = FieldFactory::create_from_data(
            [
				[
					'id' => 'name',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Name',
					'required' => true,
				],
				[
					'id' => 'age',
					'type' => 'field',
					'variant' => 'number',
					'title' => 'Age',
					'min' => 18,
				],
			]
        );

        $data = [
            'name' => '',   // Required but empty
            'age'  => 15,   // Below minimum
        ];

        $result = FieldFactory::validate( $elements, $data );

        $this->assertFalse( $result['valid'] );
        $this->assertArrayHasKey( 'name', $result['errors'] );
        $this->assertArrayHasKey( 'age', $result['errors'] );
    }

    /**
     * Test FieldFactory::validate with nested elements.
     */
    public function test_factory_validate_nested(): void {
        $elements = FieldFactory::create_from_data(
            [
				[
					'id'       => 'section',
					'type'     => 'section',
					'title'    => 'Section',
					'children' => [
						[
							'id' => 'name',
							'type' => 'field',
							'variant' => 'text',
							'title' => 'Name',
							'required' => true,
						],
					],
				],
			]
        );

        $data = [ 'name' => '' ];

        $result = FieldFactory::validate( $elements, $data );

        $this->assertFalse( $result['valid'] );
        $this->assertArrayHasKey( 'name', $result['errors'] );
    }

    /**
     * Test FieldFactory::validate stop_first option.
     */
    public function test_factory_validate_stop_first(): void {
        $elements = FieldFactory::create_from_data(
            [
				[
					'id' => 'field1',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Field 1',
					'required' => true,
				],
				[
					'id' => 'field2',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Field 2',
					'required' => true,
				],
				[
					'id' => 'field3',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Field 3',
					'required' => true,
				],
			]
        );

        $data = [
            'field1' => '',
            'field2' => '',
            'field3' => '',
        ];

        // With stop_first = true
        $result = FieldFactory::validate( $elements, $data, true );

        $this->assertFalse( $result['valid'] );
        // Should only have one error (stopped at first)
        $this->assertCount( 1, $result['errors'] );
    }

    /**
     * Test validation with combined constraints.
     */
    public function test_combined_constraints(): void {
        $field = FieldFactory::text(
            'username', 'Username', [
				'required'  => true,
				'minlength' => 3,
				'maxlength' => 20,
			]
        );

        // Valid
        $this->assertTrue( $field->validate( [ 'username' => 'john_doe' ] )['valid'] );

        // Too short
        $this->assertFalse( $field->validate( [ 'username' => 'ab' ] )['valid'] );

        // Too long
        $this->assertFalse( $field->validate( [ 'username' => 'this_username_is_way_too_long' ] )['valid'] );

        // Missing (required)
        $this->assertFalse( $field->validate( [] )['valid'] );
    }

    /**
     * Test number boundary validation (edge cases).
     */
    public function test_number_boundary_edge_cases(): void {
        $field = FieldFactory::number(
            'rate', 'Rate', [
				'min' => 0,
				'max' => 100,
			]
        );

        // Exactly at min
        $this->assertTrue( $field->validate( [ 'rate' => 0 ] )['valid'] );

        // Exactly at max
        $this->assertTrue( $field->validate( [ 'rate' => 100 ] )['valid'] );

        // Just below min
        $this->assertFalse( $field->validate( [ 'rate' => -1 ] )['valid'] );

        // Just above max
        $this->assertFalse( $field->validate( [ 'rate' => 101 ] )['valid'] );
    }

    /**
     * Test empty string vs null vs missing.
     */
    public function test_empty_values(): void {
        $field = FieldFactory::text( 'name', 'Name', [ 'required' => true ] );

        // Empty string
        $this->assertFalse( $field->validate( [ 'name' => '' ] )['valid'] );

        // Null value
        $this->assertFalse( $field->validate( [ 'name' => null ] )['valid'] );

        // Missing key
        $this->assertFalse( $field->validate( [] )['valid'] );

        // Zero is a valid value
        $number = FieldFactory::number( 'count', 'Count', [ 'required' => true ] );
        $this->assertTrue( $number->validate( [ 'count' => 0 ] )['valid'] );

        // False is a valid value for switch
        $switch = FieldFactory::toggle( 'enabled', 'Enabled', [ 'required' => true ] );
        $this->assertTrue( $switch->validate( [ 'enabled' => false ] )['valid'] );
    }
}
