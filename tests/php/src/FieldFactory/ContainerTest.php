<?php
/**
 * Container Test
 *
 * @package WeDevs\Dokan\Test\FieldFactory
 */

namespace WeDevs\Dokan\Test\FieldFactory;

use WeDevs\Dokan\FieldFactory\FieldFactory;
use WeDevs\Dokan\FieldFactory\Registry\ElementRegistry;
use WeDevs\Dokan\FieldFactory\Contracts\ContainerInterface;
use WeDevs\Dokan\FieldFactory\Contracts\FieldInterface;
use WeDevs\Dokan\FieldFactory\Elements\Containers\Page;
use WeDevs\Dokan\FieldFactory\Elements\Containers\Subpage;
use WeDevs\Dokan\FieldFactory\Elements\Layouts\Section;
use WeDevs\Dokan\FieldFactory\Elements\Layouts\Subsection;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Class ContainerTest
 *
 * Tests for container elements (Page, Section, etc.).
 */
class ContainerTest extends DokanTestCase {

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
     * Test Page container creation.
     */
    public function test_page_creation(): void {
        $page = FieldFactory::page( 'settings', 'Settings' );

        $this->assertInstanceOf( Page::class, $page );
        $this->assertInstanceOf( ContainerInterface::class, $page );
        $this->assertEquals( 'settings', $page->get_id() );
        $this->assertEquals( 'Settings', $page->get_property( 'title' ) );
    }

    /**
     * Test Page with icon.
     */
    public function test_page_with_icon(): void {
        $page = FieldFactory::page(
            'settings', 'Settings', [], [
				'icon' => 'dashicons-admin-generic',
			]
        );

        $this->assertEquals( 'dashicons-admin-generic', $page->get_property( 'icon' ) );
    }

    /**
     * Test Subpage container creation.
     */
    public function test_subpage_creation(): void {
        $subpage = FieldFactory::subpage( 'general', 'General' );

        $this->assertInstanceOf( Subpage::class, $subpage );
        $this->assertInstanceOf( ContainerInterface::class, $subpage );
        $this->assertEquals( 'general', $subpage->get_id() );
    }

    /**
     * Test Section container creation.
     */
    public function test_section_creation(): void {
        $section = FieldFactory::section( 'store', 'Store Settings' );

        $this->assertInstanceOf( Section::class, $section );
        $this->assertInstanceOf( ContainerInterface::class, $section );
        $this->assertEquals( 'store', $section->get_id() );
    }

    /**
     * Test Section with description.
     */
    public function test_section_with_description(): void {
        $section = FieldFactory::section(
            'store', 'Store Settings', [], [
				'description' => 'Configure your store settings',
			]
        );

        $this->assertEquals( 'Configure your store settings', $section->get_property( 'description' ) );
    }

    /**
     * Test adding children to container.
     */
    public function test_add_child(): void {
        $section = FieldFactory::section( 'store', 'Store Settings' );
        $field   = FieldFactory::text( 'name', 'Store Name' );

        $section->add_child( $field );

        $children = $section->get_children();
        $this->assertCount( 1, $children );
        $this->assertEquals( 'name', $children[0]->get_id() );
    }

    /**
     * Test adding multiple children.
     */
    public function test_add_multiple_children(): void {
        $section = FieldFactory::section( 'store', 'Store Settings' );

        $section->add_child( FieldFactory::text( 'name', 'Name' ) );
        $section->add_child( FieldFactory::text( 'email', 'Email' ) );
        $section->add_child( FieldFactory::number( 'commission', 'Commission' ) );

        $this->assertCount( 3, $section->get_children() );
    }

    /**
     * Test get_children returns array.
     */
    public function test_get_children_returns_array(): void {
        $section = FieldFactory::section( 'store', 'Store Settings' );

        $this->assertIsArray( $section->get_children() );
        $this->assertEmpty( $section->get_children() );
    }

    /**
     * Test find_child method.
     */
    public function test_find_child(): void {
        $section = FieldFactory::section(
            'store', 'Store', [
				[
					'id' => 'name',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Name',
				],
				[
					'id' => 'email',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Email',
				],
			]
        );

        $found = $section->find_child( 'email' );

        $this->assertNotNull( $found );
        $this->assertEquals( 'email', $found->get_id() );
    }

    /**
     * Test find_child returns null for non-existent.
     */
    public function test_find_child_not_found(): void {
        $section = FieldFactory::section(
            'store', 'Store', [
				[
					'id' => 'name',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Name',
				],
			]
        );

        $found = $section->find_child( 'nonexistent' );

        $this->assertNull( $found );
    }

    /**
     * Test find_child in nested structure.
     */
    public function test_find_child_nested(): void {
        $page = FieldFactory::page(
            'settings', 'Settings', [
				[
					'id'       => 'general',
					'type'     => 'subpage',
					'title'    => 'General',
					'children' => [
						[
							'id'       => 'store_section',
							'type'     => 'section',
							'title'    => 'Store',
							'children' => [
								[
									'id' => 'deep_field',
									'type' => 'field',
									'variant' => 'text',
									'title' => 'Deep',
								],
							],
						],
					],
				],
			]
        );

        $found = $page->find_child( 'deep_field' );

        $this->assertNotNull( $found );
        $this->assertEquals( 'deep_field', $found->get_id() );
    }

    /**
     * Test has_children method.
     */
    public function test_has_children(): void {
        $empty_section = FieldFactory::section( 'empty', 'Empty' );
        $full_section  = FieldFactory::section(
            'full', 'Full', [
				[
					'id' => 'field',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Field',
				],
			]
        );

        $this->assertFalse( $empty_section->has_children() );
        $this->assertTrue( $full_section->has_children() );
    }

    /**
     * Test container to_array includes children.
     */
    public function test_to_array_includes_children(): void {
        $section = FieldFactory::section(
            'store', 'Store', [
				[
					'id' => 'name',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Name',
				],
				[
					'id' => 'email',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Email',
				],
			]
        );

        $array = $section->to_array();

        $this->assertArrayHasKey( 'children', $array );
        $this->assertCount( 2, $array['children'] );
        $this->assertEquals( 'name', $array['children'][0]['id'] );
        $this->assertEquals( 'email', $array['children'][1]['id'] );
    }

    /**
     * Test nested structure to_array.
     */
    public function test_nested_to_array(): void {
        $page = FieldFactory::page(
            'settings', 'Settings', [
				[
					'id'       => 'general',
					'type'     => 'subpage',
					'title'    => 'General',
					'children' => [
						[
							'id'       => 'store',
							'type'     => 'section',
							'title'    => 'Store',
							'children' => [
								[
									'id' => 'name',
									'type' => 'field',
									'variant' => 'text',
									'title' => 'Name',
								],
							],
						],
					],
				],
			]
        );

        $array = $page->to_array();

        $this->assertEquals( 'settings', $array['id'] );
        $this->assertCount( 1, $array['children'] );
        $this->assertEquals( 'general', $array['children'][0]['id'] );
        $this->assertEquals( 'store', $array['children'][0]['children'][0]['id'] );
        $this->assertEquals( 'name', $array['children'][0]['children'][0]['children'][0]['id'] );
    }

    /**
     * Test Section with subsection.
     */
    public function test_section_with_subsection(): void {
        $section = FieldFactory::create(
            [
				'id'       => 'main',
				'type'     => 'section',
				'title'    => 'Main Section',
				'children' => [
					[
						'id'       => 'sub',
						'type'     => 'subsection',
						'title'    => 'Sub Section',
						'children' => [
							[
								'id' => 'field',
								'type' => 'field',
								'variant' => 'text',
								'title' => 'Field',
							],
						],
					],
				],
			]
        );

        $this->assertInstanceOf( Section::class, $section );

        $children = $section->get_children();
        $this->assertCount( 1, $children );
        $this->assertInstanceOf( Subsection::class, $children[0] );

        $sub_children = $children[0]->get_children();
        $this->assertCount( 1, $sub_children );
        $this->assertInstanceOf( FieldInterface::class, $sub_children[0] );
    }

    /**
     * Test Page hierarchy (Page > Subpage > Section > Field).
     */
    public function test_page_hierarchy(): void {
        $page = FieldFactory::page(
            'dokan', 'Dokan Settings', [
				[
					'id'       => 'general',
					'type'     => 'subpage',
					'title'    => 'General',
					'children' => [
						[
							'id'       => 'store_settings',
							'type'     => 'section',
							'title'    => 'Store Settings',
							'children' => [
								[
									'id' => 'store_name',
									'type' => 'field',
									'variant' => 'text',
									'title' => 'Store Name',
								],
								[
									'id' => 'store_url',
									'type' => 'field',
									'variant' => 'text',
									'title' => 'Store URL',
								],
							],
						],
						[
							'id'       => 'selling_settings',
							'type'     => 'section',
							'title'    => 'Selling Settings',
							'children' => [
								[
									'id' => 'commission',
									'type' => 'field',
									'variant' => 'number',
									'title' => 'Commission',
								],
							],
						],
					],
				],
				[
					'id'       => 'payments',
					'type'     => 'subpage',
					'title'    => 'Payments',
					'children' => [
						[
							'id'       => 'withdrawal',
							'type'     => 'section',
							'title'    => 'Withdrawal',
							'children' => [
								[
									'id' => 'min_amount',
									'type' => 'field',
									'variant' => 'number',
									'title' => 'Min Amount',
								],
							],
						],
					],
				],
			]
        );

        // Check structure
        $subpages = $page->get_children();
        $this->assertCount( 2, $subpages );

        // First subpage
        $general_subpage = $subpages[0];
        $this->assertEquals( 'general', $general_subpage->get_id() );
        $this->assertCount( 2, $general_subpage->get_children() );

        // Find deep nested field
        $store_name_field = $page->find_child( 'store_name' );
        $this->assertNotNull( $store_name_field );
        $this->assertEquals( 'Store Name', $store_name_field->get_label() );

        // Find field in second subpage
        $min_amount_field = $page->find_child( 'min_amount' );
        $this->assertNotNull( $min_amount_field );
    }

    /**
     * Test container display property.
     */
    public function test_container_display_property(): void {
        $section = FieldFactory::section(
            'hidden', 'Hidden Section', [], [
				'display' => false,
			]
        );

        $this->assertFalse( $section->get_property( 'display' ) );
    }

    /**
     * Test mixed children types.
     */
    public function test_mixed_children_types(): void {
        $section = FieldFactory::section(
            'mixed', 'Mixed', [
				[
					'id' => 'text_field',
					'type' => 'field',
					'variant' => 'text',
					'title' => 'Text',
				],
				[
					'id' => 'select_field',
					'type' => 'field',
					'variant' => 'select',
					'title' => 'Select',
					'elements' => [],
				],
				[
					'id' => 'switch_field',
					'type' => 'field',
					'variant' => 'switch',
					'title' => 'Switch',
				],
				[
					'id'       => 'subsection',
					'type'     => 'subsection',
					'title'    => 'Subsection',
					'children' => [
						[
							'id' => 'nested',
							'type' => 'field',
							'variant' => 'number',
							'title' => 'Nested',
						],
					],
				],
			]
        );

        $children = $section->get_children();
        $this->assertCount( 4, $children );

        // Verify types
        $this->assertInstanceOf( FieldInterface::class, $children[0] );
        $this->assertInstanceOf( FieldInterface::class, $children[1] );
        $this->assertInstanceOf( FieldInterface::class, $children[2] );
        $this->assertInstanceOf( ContainerInterface::class, $children[3] );
    }
}
