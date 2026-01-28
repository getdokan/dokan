<?php
/**
 * Element Factory Test
 *
 * @package WeDevs\Dokan\Test\FieldFactory
 */

namespace WeDevs\Dokan\Test\FieldFactory;

use WeDevs\Dokan\FieldFactory\Factory\ElementFactory;
use WeDevs\Dokan\FieldFactory\Registry\ElementRegistry;
use WeDevs\Dokan\FieldFactory\Contracts\ContainerInterface;
use WeDevs\Dokan\FieldFactory\Contracts\FieldInterface;
use WeDevs\Dokan\FieldFactory\Elements\Fields\TextField;
use WeDevs\Dokan\FieldFactory\Elements\Fields\SelectField;
use WeDevs\Dokan\FieldFactory\Elements\Layouts\Section;
use WeDevs\Dokan\FieldFactory\Elements\Containers\Page;
use InvalidArgumentException;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Class ElementFactoryTest
 *
 * Tests for the ElementFactory class.
 */
class ElementFactoryTest extends DokanTestCase {

    /**
     * Indicates unit test mode.
     *
     * @var bool
     */
    protected $is_unit_test = true;

    /**
     * Element factory instance.
     *
     * @var ElementFactory
     */
    private $element_factory;

    /**
     * Set up the test.
     */
    public function set_up(): void {
        parent::set_up();
        ElementRegistry::reset_instance();
        $this->element_factory = new ElementFactory();
    }

    /**
     * Tear down the test.
     */
    public function tear_down(): void {
        ElementRegistry::reset_instance();
        parent::tear_down();
    }

    /**
     * Test creating a text field.
     */
    public function test_create_text_field(): void {
        $config = [
            'id'      => 'test_field',
            'type'    => 'field',
            'variant' => 'text',
            'title'   => 'Test Field',
        ];

        $element = $this->element_factory->create( $config );

        $this->assertInstanceOf( TextField::class, $element );
        $this->assertInstanceOf( FieldInterface::class, $element );
        $this->assertEquals( 'test_field', $element->get_id() );
        $this->assertEquals( 'Test Field', $element->get_label() );
    }

    /**
     * Test creating a select field with elements.
     */
    public function test_create_select_field_with_elements(): void {
        $config = [
            'id'       => 'country',
            'type'     => 'field',
            'variant'  => 'select',
            'title'    => 'Country',
            'elements' => [
                [
					'value' => 'US',
					'label' => 'United States',
				],
                [
					'value' => 'UK',
					'label' => 'United Kingdom',
				],
            ],
        ];

        $element = $this->element_factory->create( $config );

        $this->assertInstanceOf( SelectField::class, $element );
        $this->assertEquals( 'country', $element->get_id() );

        $elements = $element->get_elements();
        $this->assertCount( 2, $elements );
    }

    /**
     * Test creating a section with children.
     */
    public function test_create_section_with_children(): void {
        $config = [
            'id'       => 'settings_section',
            'type'     => 'section',
            'title'    => 'Settings',
            'children' => [
                [
                    'id'      => 'name',
                    'type'    => 'field',
                    'variant' => 'text',
                    'title'   => 'Name',
                ],
                [
                    'id'      => 'enabled',
                    'type'    => 'field',
                    'variant' => 'switch',
                    'title'   => 'Enabled',
                ],
            ],
        ];

        $element = $this->element_factory->create( $config );

        $this->assertInstanceOf( Section::class, $element );
        $this->assertInstanceOf( ContainerInterface::class, $element );
        $this->assertEquals( 'settings_section', $element->get_id() );

        $children = $element->get_children();
        $this->assertCount( 2, $children );
        $this->assertEquals( 'name', $children[0]->get_id() );
        $this->assertEquals( 'enabled', $children[1]->get_id() );
    }

    /**
     * Test creating nested structure.
     */
    public function test_create_nested_structure(): void {
        $config = [
            'id'       => 'main_page',
            'type'     => 'page',
            'title'    => 'Main',
            'children' => [
                [
                    'id'       => 'general',
                    'type'     => 'subpage',
                    'title'    => 'General',
                    'children' => [
                        [
                            'id'       => 'store_section',
                            'type'     => 'section',
                            'title'    => 'Store Settings',
                            'children' => [
                                [
                                    'id'      => 'store_name',
                                    'type'    => 'field',
                                    'variant' => 'text',
                                    'title'   => 'Store Name',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $page = $this->element_factory->create( $config );

        $this->assertInstanceOf( Page::class, $page );

        // Navigate the tree
        $children = $page->get_children();
        $this->assertCount( 1, $children );

        $subpage = $children[0];
        $this->assertEquals( 'general', $subpage->get_id() );

        $section = $subpage->get_children()[0];
        $this->assertEquals( 'store_section', $section->get_id() );

        $field = $section->get_children()[0];
        $this->assertEquals( 'store_name', $field->get_id() );
    }

    /**
     * Test create_from_data with multiple elements.
     */
    public function test_create_from_data_multiple_elements(): void {
        $data = [
            [
                'id'    => 'section1',
                'type'  => 'section',
                'title' => 'Section 1',
            ],
            [
                'id'    => 'section2',
                'type'  => 'section',
                'title' => 'Section 2',
            ],
        ];

        $elements = $this->element_factory->create_from_data( $data );

        $this->assertCount( 2, $elements );
        $this->assertEquals( 'section1', $elements[0]->get_id() );
        $this->assertEquals( 'section2', $elements[1]->get_id() );
    }

    /**
     * Test create with legacy type alias.
     */
    public function test_create_with_legacy_alias(): void {
        $config = [
            'id'    => 'test_field',
            'type'  => 'text', // Legacy alias
            'title' => 'Test',
        ];

        $element = $this->element_factory->create( $config );

        $this->assertInstanceOf( TextField::class, $element );
    }

    /**
     * Test supports method.
     */
    public function test_supports_method(): void {
        $this->assertTrue( $this->element_factory->supports( 'field', 'text' ) );
        $this->assertTrue( $this->element_factory->supports( 'section' ) );
        // Note: Unknown types fall back to default 'field' type by design
        $this->assertTrue( $this->element_factory->supports( 'field', 'nonexistent' ) );
    }

    /**
     * Test make method.
     */
    public function test_make_method(): void {
        $element = $this->element_factory->make( 'field', 'text' );

        $this->assertInstanceOf( TextField::class, $element );
    }

    /**
     * Test to_array conversion.
     */
    public function test_to_array_conversion(): void {
        $elements = $this->element_factory->create_from_data(
            [
				[
					'id'      => 'name',
					'type'    => 'field',
					'variant' => 'text',
					'title'   => 'Name',
					'default' => 'Test',
				],
			]
        );

        $array = $this->element_factory->to_array( $elements );

        $this->assertIsArray( $array );
        $this->assertCount( 1, $array );
        $this->assertEquals( 'name', $array[0]['id'] );
        $this->assertEquals( 'Name', $array[0]['title'] );
    }

    /**
     * Test find_by_id in flat structure.
     */
    public function test_find_by_id_flat(): void {
        $elements = $this->element_factory->create_from_data(
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

        $found = $this->element_factory->find_by_id( $elements, 'field2' );

        $this->assertNotNull( $found );
        $this->assertEquals( 'field2', $found->get_id() );
    }

    /**
     * Test find_by_id in nested structure.
     */
    public function test_find_by_id_nested(): void {
        $elements = $this->element_factory->create_from_data(
            [
				[
					'id'       => 'section',
					'type'     => 'section',
					'title'    => 'Section',
					'children' => [
						[
							'id'      => 'nested_field',
							'type'    => 'field',
							'variant' => 'text',
							'title'   => 'Nested Field',
						],
					],
				],
			]
        );

        $found = $this->element_factory->find_by_id( $elements, 'nested_field' );

        $this->assertNotNull( $found );
        $this->assertEquals( 'nested_field', $found->get_id() );
    }

    /**
     * Test find_by_id returns null for non-existent.
     */
    public function test_find_by_id_returns_null_for_nonexistent(): void {
        $elements = $this->element_factory->create_from_data(
            [
				[
					'id' => 'field1',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Field 1',
				],
			]
        );

        $found = $this->element_factory->find_by_id( $elements, 'nonexistent' );

        $this->assertNull( $found );
    }

    /**
     * Test get_registry returns registry instance.
     */
    public function test_get_registry(): void {
        $registry = $this->element_factory->get_registry();

        $this->assertInstanceOf( ElementRegistry::class, $registry );
    }

    /**
     * Test creating field with default type fallback.
     */
    public function test_create_with_default_field_type(): void {
        $config = [
            'id'    => 'unknown_variant',
            'type'  => 'field',
            // No variant - should fall back to default field
        ];

        $element = $this->element_factory->create( $config );

        // Should create a TextField as the default
        $this->assertInstanceOf( TextField::class, $element );
    }

    /**
     * Test field properties are filled correctly.
     */
    public function test_field_properties_filled(): void {
        $config = [
            'id'          => 'test_field',
            'type'        => 'field',
            'variant'     => 'text',
            'title'       => 'Test Title',
            'description' => 'Test description',
            'placeholder' => 'Enter value',
            'default'     => 'default_value',
            'required'    => true,
        ];

        $element = $this->element_factory->create( $config );

        $this->assertEquals( 'test_field', $element->get_id() );
        $this->assertEquals( 'Test Title', $element->get_label() );
        $this->assertEquals( 'Test description', $element->get_property( 'description' ) );
        $this->assertEquals( 'Enter value', $element->get_property( 'placeholder' ) );
        $this->assertEquals( 'default_value', $element->get_property( 'default' ) );
        $this->assertTrue( $element->get_property( 'required' ) );
    }
}
