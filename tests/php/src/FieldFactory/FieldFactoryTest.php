<?php
/**
 * Field Factory Facade Test
 *
 * @package WeDevs\Dokan\Test\FieldFactory
 */

namespace WeDevs\Dokan\Test\FieldFactory;

use WeDevs\Dokan\FieldFactory\FieldFactory;
use WeDevs\Dokan\FieldFactory\Factory\ElementFactory;
use WeDevs\Dokan\FieldFactory\Registry\ElementRegistry;
use WeDevs\Dokan\FieldFactory\Contracts\ContainerInterface;
use WeDevs\Dokan\FieldFactory\Contracts\FieldInterface;
use WeDevs\Dokan\FieldFactory\Elements\Fields\TextField;
use WeDevs\Dokan\FieldFactory\Elements\Fields\SelectField;
use WeDevs\Dokan\FieldFactory\Elements\Fields\SwitchField;
use WeDevs\Dokan\FieldFactory\Elements\Fields\NumberField;
use WeDevs\Dokan\FieldFactory\Elements\Layouts\Section;
use WeDevs\Dokan\FieldFactory\Elements\Containers\Page;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Class FieldFactoryTest
 *
 * Tests for the FieldFactory static facade.
 * @group field-factory
 */
class FieldFactoryTest extends DokanTestCase {

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
     * Test get_factory returns ElementFactory instance.
     */
    public function test_get_factory(): void {
        $factory = FieldFactory::get_factory();

        $this->assertInstanceOf( ElementFactory::class, $factory );
    }

    /**
     * Test get_registry returns ElementRegistry instance.
     */
    public function test_get_registry(): void {
        $registry = FieldFactory::get_registry();

        $this->assertInstanceOf( ElementRegistry::class, $registry );
    }

    /**
     * Test text field creation.
     */
    public function test_text_field(): void {
        $field = FieldFactory::text(
            'store_name', 'Store Name', [
				'required'    => true,
				'placeholder' => 'Enter name',
			]
        );

        $this->assertInstanceOf( TextField::class, $field );
        $this->assertInstanceOf( FieldInterface::class, $field );
        $this->assertEquals( 'store_name', $field->get_id() );
        $this->assertEquals( 'Store Name', $field->get_label() );
        $this->assertTrue( $field->get_property( 'required' ) );
        $this->assertEquals( 'Enter name', $field->get_property( 'placeholder' ) );
    }

    /**
     * Test textarea field creation.
     */
    public function test_textarea_field(): void {
        $field = FieldFactory::textarea(
            'description', 'Description', [
				'rows' => 5,
			]
        );

        $this->assertInstanceOf( FieldInterface::class, $field );
        $this->assertEquals( 'description', $field->get_id() );
        $this->assertEquals( 'Description', $field->get_label() );
    }

    /**
     * Test select field creation.
     */
    public function test_select_field(): void {
        $elements = [
            [
				'value' => 'US',
				'label' => 'United States',
			],
            [
				'value' => 'UK',
				'label' => 'United Kingdom',
			],
        ];

        $field = FieldFactory::select(
            'country', 'Country', $elements, [
				'default' => 'US',
			]
        );

        $this->assertInstanceOf( SelectField::class, $field );
        $this->assertEquals( 'country', $field->get_id() );
        $this->assertEquals( 'Country', $field->get_label() );
        $this->assertCount( 2, $field->get_elements() );
        $this->assertEquals( 'US', $field->get_property( 'default' ) );
    }

    /**
     * Test toggle field creation.
     */
    public function test_toggle_field(): void {
        $field = FieldFactory::toggle(
            'enabled', 'Enable Feature', [
				'default' => true,
			]
        );

        $this->assertInstanceOf( SwitchField::class, $field );
        $this->assertEquals( 'enabled', $field->get_id() );
        $this->assertEquals( 'Enable Feature', $field->get_label() );
        $this->assertTrue( $field->get_property( 'default' ) );
    }

    /**
     * Test number field creation.
     */
    public function test_number_field(): void {
        $field = FieldFactory::number(
            'commission', 'Commission Rate', [
				'default' => 10,
				'min'     => 0,
				'max'     => 100,
			]
        );

        $this->assertInstanceOf( NumberField::class, $field );
        $this->assertEquals( 'commission', $field->get_id() );
        $this->assertEquals( 'Commission Rate', $field->get_label() );
        $this->assertEquals( 10, $field->get_property( 'default' ) );
        $this->assertEquals( 0, $field->get_property( 'min' ) );
        $this->assertEquals( 100, $field->get_property( 'max' ) );
    }

    /**
     * Test radio field creation.
     */
    public function test_radio_field(): void {
        $elements = [
            [
				'value' => 'yes',
				'label' => 'Yes',
			],
            [
				'value' => 'no',
				'label' => 'No',
			],
        ];

        $field = FieldFactory::radio( 'option', 'Select Option', $elements );

        $this->assertInstanceOf( FieldInterface::class, $field );
        $this->assertEquals( 'option', $field->get_id() );
    }

    /**
     * Test radio_box field creation.
     */
    public function test_radio_box_field(): void {
        $elements = [
            [
				'value' => 'single',
				'label' => 'Single',
				'description' => 'Single vendor',
			],
            [
				'value' => 'multi',
				'label' => 'Multi',
				'description' => 'Multiple vendors',
			],
        ];

        $field = FieldFactory::radio_box( 'type', 'Marketplace Type', $elements );

        $this->assertInstanceOf( FieldInterface::class, $field );
        $this->assertEquals( 'type', $field->get_id() );
    }

    /**
     * Test multicheck field creation.
     */
    public function test_multicheck_field(): void {
        $elements = [
            [
				'value' => 'paypal',
				'label' => 'PayPal',
			],
            [
				'value' => 'stripe',
				'label' => 'Stripe',
			],
        ];

        $field = FieldFactory::multicheck(
            'payments', 'Payment Methods', $elements, [
				'default' => [ 'paypal' ],
			]
        );

        $this->assertInstanceOf( FieldInterface::class, $field );
        $this->assertEquals( 'payments', $field->get_id() );
    }

    /**
     * Test color field creation.
     */
    public function test_color_field(): void {
        $field = FieldFactory::color(
            'primary', 'Primary Color', [
				'default' => '#1e73be',
			]
        );

        $this->assertInstanceOf( FieldInterface::class, $field );
        $this->assertEquals( 'primary', $field->get_id() );
        $this->assertEquals( '#1e73be', $field->get_property( 'default' ) );
    }

    /**
     * Test file field creation.
     */
    public function test_file_field(): void {
        $field = FieldFactory::file(
            'logo', 'Store Logo', [
				'allowed_types' => [ 'image/jpeg', 'image/png' ],
			]
        );

        $this->assertInstanceOf( FieldInterface::class, $field );
        $this->assertEquals( 'logo', $field->get_id() );
    }

    /**
     * Test page container creation.
     */
    public function test_page_container(): void {
        $page = FieldFactory::page(
            'settings', 'Settings', [
				[
					'id'    => 'section1',
					'type'  => 'section',
					'title' => 'Section 1',
				],
			]
        );

        $this->assertInstanceOf( Page::class, $page );
        $this->assertInstanceOf( ContainerInterface::class, $page );
        $this->assertEquals( 'settings', $page->get_id() );
        $this->assertCount( 1, $page->get_children() );
    }

    /**
     * Test subpage container creation.
     */
    public function test_subpage_container(): void {
        $subpage = FieldFactory::subpage( 'general', 'General', [] );

        $this->assertInstanceOf( ContainerInterface::class, $subpage );
        $this->assertEquals( 'general', $subpage->get_id() );
    }

    /**
     * Test section container creation.
     */
    public function test_section_container(): void {
        $section = FieldFactory::section(
            'settings', 'Settings', [
				[
					'id'      => 'name',
					'type'    => 'field',
					'variant' => 'text',
					'title'   => 'Name',
				],
			]
        );

        $this->assertInstanceOf( Section::class, $section );
        $this->assertInstanceOf( ContainerInterface::class, $section );
        $this->assertEquals( 'settings', $section->get_id() );
        $this->assertCount( 1, $section->get_children() );
    }

    /**
     * Test generic field creation.
     */
    public function test_field_method(): void {
        $field = FieldFactory::field(
            'test', 'switch', [
				'title'   => 'Test Toggle',
				'default' => false,
			]
        );

        $this->assertInstanceOf( SwitchField::class, $field );
        $this->assertEquals( 'test', $field->get_id() );
    }

    /**
     * Test create method.
     */
    public function test_create_method(): void {
        $element = FieldFactory::create(
            [
				'id'      => 'test',
				'type'    => 'field',
				'variant' => 'number',
				'title'   => 'Test Number',
			]
        );

        $this->assertInstanceOf( NumberField::class, $element );
    }

    /**
     * Test create_from_data method.
     */
    public function test_create_from_data(): void {
        $elements = FieldFactory::create_from_data(
            [
				[
					'id' => 'field1',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Field 1',
				],
				[
					'id' => 'field2',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Field 2',
				],
			]
        );

        $this->assertCount( 2, $elements );
        $this->assertEquals( 'field1', $elements[0]->get_id() );
        $this->assertEquals( 'field2', $elements[1]->get_id() );
    }

    /**
     * Test to_array method.
     */
    public function test_to_array(): void {
        $elements = FieldFactory::create_from_data(
            [
				[
					'id'      => 'test',
					'type'    => 'field',
					'variant' => 'text',
					'title'   => 'Test',
				],
			]
        );

        $array = FieldFactory::to_array( $elements );

        $this->assertIsArray( $array );
        $this->assertEquals( 'test', $array[0]['id'] );
    }

    /**
     * Test find method.
     */
    public function test_find(): void {
        $elements = FieldFactory::create_from_data(
            [
				[
					'id'       => 'section',
					'type'     => 'section',
					'title'    => 'Section',
					'children' => [
						[
							'id'      => 'nested',
							'type'    => 'field',
							'variant' => 'text',
							'title'   => 'Nested',
						],
					],
				],
			]
        );

        $found = FieldFactory::find( $elements, 'nested' );

        $this->assertNotNull( $found );
        $this->assertEquals( 'nested', $found->get_id() );
    }

    /**
     * Test supports method.
     */
    public function test_supports(): void {
        $this->assertTrue( FieldFactory::supports( 'field', 'text' ) );
        $this->assertTrue( FieldFactory::supports( 'section' ) );
        // Note: Unknown types fall back to default 'field' type by design
        $this->assertTrue( FieldFactory::supports( 'field', 'nonexistent' ) );
    }

    /**
     * Test register method.
     */
    public function test_register(): void {
        FieldFactory::register( 'field:custom', TextField::class );

        $this->assertTrue( FieldFactory::supports( 'field', 'custom' ) );
    }

    /**
     * Test get_all_fields method.
     */
    public function test_get_all_fields(): void {
        $elements = FieldFactory::create_from_data(
            [
				[
					'id'       => 'section',
					'type'     => 'section',
					'title'    => 'Section',
					'children' => [
						[
							'id' => 'field1',
							'type' => 'field',
							'variant' => 'text',
							'title' => 'Field 1',
						],
						[
							'id' => 'field2',
							'type' => 'field',
							'variant' => 'number',
							'title' => 'Field 2',
						],
					],
				],
				[
					'id' => 'field3',
					'type' => 'field',
					'variant' => 'switch',
					'title' => 'Field 3',
				],
			]
        );

        $fields = FieldFactory::get_all_fields( $elements );

        $this->assertCount( 3, $fields );
        $this->assertContainsOnlyInstancesOf( FieldInterface::class, $fields );
    }

    /**
     * Test get_values method.
     */
    public function test_get_values(): void {
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
			]
        );

        $data = [
            'name' => 'John',
            'age'  => 30,
        ];

        $values = FieldFactory::get_values( $elements, $data );

        $this->assertEquals( 'John', $values['name'] );
        $this->assertEquals( 30, $values['age'] );
    }

    /**
     * Test reset method.
     */
    public function test_reset(): void {
        $factory1 = FieldFactory::get_factory();
        FieldFactory::reset();
        $factory2 = FieldFactory::get_factory();

        $this->assertNotSame( $factory1, $factory2 );
    }
}
