<?php
/**
 * Field Value Test
 *
 * @package WeDevs\Dokan\Test\FieldFactory
 */

namespace WeDevs\Dokan\Test\FieldFactory;

use WeDevs\Dokan\FieldFactory\FieldFactory;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Class FieldValueTest
 *
 * Tests for field value getting and setting.
 * @group field-factory
 */
class FieldValueTest extends DokanTestCase {

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
     * Test get_value from data array.
     */
    public function test_get_value_from_data(): void {
        $field = FieldFactory::text( 'name', 'Name' );

        $value = $field->get_value( [ 'name' => 'John' ] );

        $this->assertEquals( 'John', $value );
    }

    /**
     * Test get_value returns default when key missing.
     */
    public function test_get_value_returns_default(): void {
        $field = FieldFactory::text( 'name', 'Name', [ 'default' => 'Default Name' ] );

        $value = $field->get_value( [] );

        $this->assertEquals( 'Default Name', $value );
    }

    /**
     * Test get_value returns null when no default.
     */
    public function test_get_value_returns_null_without_default(): void {
        $field = FieldFactory::text( 'name', 'Name' );

        $value = $field->get_value( [] );

        $this->assertNull( $value );
    }

    /**
     * Test set_value returns array structure.
     */
    public function test_set_value_returns_array(): void {
        $field = FieldFactory::text( 'name', 'Name' );

        $result = $field->set_value( 'John' );

        $this->assertIsArray( $result );
        $this->assertArrayHasKey( 'name', $result );
        $this->assertEquals( 'John', $result['name'] );
    }

    /**
     * Test number field value.
     */
    public function test_number_field_value(): void {
        $field = FieldFactory::number( 'age', 'Age', [ 'default' => 18 ] );

        // Get from data
        $this->assertEquals( 25, $field->get_value( [ 'age' => 25 ] ) );

        // Get default
        $this->assertEquals( 18, $field->get_value( [] ) );

        // Set value
        $result = $field->set_value( 30 );
        $this->assertEquals( 30, $result['age'] );
    }

    /**
     * Test switch field value.
     */
    public function test_switch_field_value(): void {
        $field = FieldFactory::toggle( 'enabled', 'Enabled', [ 'default' => true ] );

        // Get from data
        $this->assertFalse( $field->get_value( [ 'enabled' => false ] ) );

        // Get default
        $this->assertTrue( $field->get_value( [] ) );
    }

    /**
     * Test select field value.
     */
    public function test_select_field_value(): void {
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
			], [ 'default' => 'US' ]
        );

        // Get from data
        $this->assertEquals( 'UK', $field->get_value( [ 'country' => 'UK' ] ) );

        // Get default
        $this->assertEquals( 'US', $field->get_value( [] ) );
    }

    /**
     * Test multicheck field value.
     */
    public function test_multicheck_field_value(): void {
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
			], [ 'default' => [ 'paypal' ] ]
        );

        // Get from data
        $this->assertEquals( [ 'paypal', 'stripe' ], $field->get_value( [ 'methods' => [ 'paypal', 'stripe' ] ] ) );

        // Get default
        $this->assertEquals( [ 'paypal' ], $field->get_value( [] ) );
    }

    /**
     * Test FieldFactory::get_values for multiple fields.
     */
    public function test_factory_get_values(): void {
        $elements = FieldFactory::create_from_data(
            [
				[
					'id' => 'name',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Name',
				],
				[
					'id' => 'age',
					'type' => 'field',
					'variant' => 'number',
					'title' => 'Age',
				],
				[
					'id' => 'enabled',
					'type' => 'field',
					'variant' => 'switch',
					'title' => 'Enabled',
				],
			]
        );

        $data = [
            'name'    => 'John',
            'age'     => 30,
            'enabled' => true,
        ];

        $values = FieldFactory::get_values( $elements, $data );

        $this->assertEquals( 'John', $values['name'] );
        $this->assertEquals( 30, $values['age'] );
        $this->assertTrue( $values['enabled'] );
    }

    /**
     * Test FieldFactory::get_values with nested elements.
     */
    public function test_factory_get_values_nested(): void {
        $elements = FieldFactory::create_from_data(
            [
				[
					'id'       => 'section',
					'type'     => 'section',
					'title'    => 'Section',
					'children' => [
						[
							'id' => 'nested_field',
							'type' => 'field',
							'variant' => 'text',
							'title' => 'Nested',
						],
					],
				],
				[
					'id' => 'top_field',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Top',
				],
			]
        );

        $data = [
            'nested_field' => 'Nested Value',
            'top_field'    => 'Top Value',
        ];

        $values = FieldFactory::get_values( $elements, $data );

        $this->assertEquals( 'Nested Value', $values['nested_field'] );
        $this->assertEquals( 'Top Value', $values['top_field'] );
    }

    /**
     * Test get_value with nested path (dot notation).
     */
    public function test_get_value_nested_path(): void {
        $field = FieldFactory::create(
            [
				'id'      => 'settings.store.name',
				'type'    => 'field',
				'variant' => 'text',
				'title'   => 'Store Name',
			]
        );

        $data = [
            'settings' => [
                'store' => [
                    'name' => 'My Store',
                ],
            ],
        ];

        $value = $field->get_value( $data );

        $this->assertEquals( 'My Store', $value );
    }

    /**
     * Test value type coercion.
     */
    public function test_value_type_coercion(): void {
        $number_field = FieldFactory::number( 'count', 'Count' );

        // String number should work
        $value = $number_field->get_value( [ 'count' => '42' ] );
        $this->assertEquals( '42', $value );

        $switch_field = FieldFactory::toggle( 'enabled', 'Enabled' );

        // Various truthy values
        $this->assertTrue( $switch_field->get_value( [ 'enabled' => true ] ) );
        $this->assertEquals( 1, $switch_field->get_value( [ 'enabled' => 1 ] ) );
        $this->assertEquals( 'yes', $switch_field->get_value( [ 'enabled' => 'yes' ] ) );
    }

    /**
     * Test to_array includes value.
     */
    public function test_to_array_includes_value(): void {
        $field = FieldFactory::text( 'name', 'Name', [ 'default' => 'Default' ] );

        $array = $field->to_array();

        $this->assertArrayHasKey( 'id', $array );
        $this->assertArrayHasKey( 'title', $array );
        $this->assertArrayHasKey( 'default', $array );
        $this->assertEquals( 'name', $array['id'] );
        $this->assertEquals( 'Name', $array['title'] );
        $this->assertEquals( 'Default', $array['default'] );
    }

    /**
     * Test field with empty default.
     */
    public function test_field_with_empty_default(): void {
        $field = FieldFactory::text( 'name', 'Name', [ 'default' => '' ] );

        $value = $field->get_value( [] );

        $this->assertEquals( '', $value );
    }

    /**
     * Test field with zero default.
     */
    public function test_field_with_zero_default(): void {
        $field = FieldFactory::number( 'count', 'Count', [ 'default' => 0 ] );

        $value = $field->get_value( [] );

        $this->assertEquals( 0, $value );
    }

    /**
     * Test field with false default.
     */
    public function test_field_with_false_default(): void {
        $field = FieldFactory::toggle( 'enabled', 'Enabled', [ 'default' => false ] );

        $value = $field->get_value( [] );

        $this->assertFalse( $value );
    }

    /**
     * Test field with array default.
     */
    public function test_field_with_array_default(): void {
        $field = FieldFactory::multicheck(
            'options', 'Options', [
				[
					'value' => 'a',
					'label' => 'A',
				],
				[
					'value' => 'b',
					'label' => 'B',
				],
			], [ 'default' => [ 'a', 'b' ] ]
        );

        $value = $field->get_value( [] );

        $this->assertEquals( [ 'a', 'b' ], $value );
    }
}
