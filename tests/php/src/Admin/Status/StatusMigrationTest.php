<?php
/**
 * Status Migration Test
 *
 * Tests for Status class migration to Unified Field Factory.
 *
 * @package WeDevs\Dokan\Test\Admin\Status
 */

namespace WeDevs\Dokan\Test\Admin\Status;

use WeDevs\Dokan\Admin\Status\Status;
use WeDevs\Dokan\FieldFactory\FieldFactory;
use WeDevs\Dokan\FieldFactory\Adapters\StatusElementAdapter;
use WeDevs\Dokan\FieldFactory\Elements\Layouts\Section;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Class StatusMigrationTest
 * @group field-migration
 * @group field-factory
 * @group rest-api-admin-dashboard
 */
class StatusMigrationTest extends DokanTestCase {

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
	 * Test Status class can be instantiated.
	 */
	public function test_status_instantiation(): void {
		$status = new Status();

		$this->assertInstanceOf( Status::class, $status );
		$this->assertEquals( 'dokan_status', $status->get_hook_key() );
	}

	/**
	 * Test Status can add FieldFactory elements.
	 */
	public function test_add_element(): void {
		$status = new Status();
		$section = FieldFactory::section( 'test_section', 'Test Section' );

		$status->add( $section );

		$elements = $status->get_elements();
		$this->assertCount( 1, $elements );
		$this->assertInstanceOf( Section::class, $elements[0] );
		$this->assertEquals( 'test_section', $elements[0]->get_id() );
	}

	/**
	 * Test Status can add multiple FieldFactory elements.
	 */
	public function test_add_elements(): void {
		$status = new Status();
		$section1 = FieldFactory::section( 'section1', 'Section 1' );
		$section2 = FieldFactory::section( 'section2', 'Section 2' );

		$status->add_elements( [ $section1, $section2 ] );

		$elements = $status->get_elements();
		$this->assertCount( 2, $elements );
	}

	/**
	 * Test Status render returns StatusElement format.
	 */
	public function test_render_returns_status_element_format(): void {
		$status = new Status();
		$section = FieldFactory::section(
            'test_section', 'Test Section', [], [
				'description' => 'Test Description',
				'hook_key'    => 'test_hook',
			]
        );

		$status->add( $section );
		$output = $status->render();

		// Should return array in StatusElement format
		$this->assertIsArray( $output );
		$this->assertCount( 1, $output );

		$rendered_section = $output[0];
		$this->assertArrayHasKey( 'id', $rendered_section );
		$this->assertArrayHasKey( 'title', $rendered_section );
		$this->assertArrayHasKey( 'description', $rendered_section );
		$this->assertArrayHasKey( 'type', $rendered_section );
		$this->assertArrayHasKey( 'data', $rendered_section );
		$this->assertArrayHasKey( 'hook_key', $rendered_section );
		$this->assertArrayHasKey( 'children', $rendered_section );

		$this->assertEquals( 'test_section', $rendered_section['id'] );
		$this->assertEquals( 'Test Section', $rendered_section['title'] );
		$this->assertEquals( 'Test Description', $rendered_section['description'] );
		$this->assertEquals( 'section', $rendered_section['type'] );
		$this->assertEquals( 'test_hook', $rendered_section['hook_key'] );
	}

	/**
	 * Test Status render with table element.
	 */
	public function test_render_with_table(): void {
		$status = new Status();

		$table = FieldFactory::create(
            [
				'id'      => 'test_table',
				'type'    => 'table',
				'title'   => 'Test Table',
				'headers' => [ 'Column 1', 'Column 2' ],
				'children' => [
					[
						'id'      => 'row1',
						'type'    => 'table-row',
						'children' => [
							[
								'id'      => 'col1',
								'type'    => 'table-column',
								'children' => [
									[
										'id'      => 'para1',
										'type'    => 'paragraph',
										'content' => 'Test Content',
									],
								],
							],
						],
					],
				],
			]
        );

		$status->add( $table );
		$output = $status->render();

		$this->assertIsArray( $output );
		$this->assertCount( 1, $output );

		$rendered_table = $output[0];
		$this->assertEquals( 'test_table', $rendered_table['id'] );
		$this->assertEquals( 'table', $rendered_table['type'] );
		$this->assertArrayHasKey( 'headers', $rendered_table );
		$this->assertEquals( [ 'Column 1', 'Column 2' ], $rendered_table['headers'] );
		$this->assertArrayHasKey( 'children', $rendered_table );
		$this->assertCount( 1, $rendered_table['children'] );
	}

	/**
	 * Test Status render with paragraph element.
	 */
	public function test_render_with_paragraph(): void {
		$status = new Status();

		$paragraph = FieldFactory::create(
            [
				'id'      => 'test_para',
				'type'    => 'paragraph',
				'content' => '<code>test.php</code>',
				'title'   => 'Test Paragraph',
			]
        );

		$status->add( $paragraph );
		$output = $status->render();

		$this->assertIsArray( $output );
		$this->assertCount( 1, $output );

		$rendered_para = $output[0];
		$this->assertEquals( 'test_para', $rendered_para['id'] );
		$this->assertEquals( 'paragraph', $rendered_para['type'] );
		$this->assertArrayHasKey( 'title', $rendered_para );
		$this->assertArrayHasKey( 'data', $rendered_para );
		// Paragraph content should be in title field (frontend uses RawHTML with element.title)
		$this->assertStringContainsString( 'test.php', $rendered_para['title'] );
		// Data field should be empty for paragraphs
		$this->assertEquals( '', $rendered_para['data'] );
	}

	/**
	 * Test Status can clear elements.
	 */
	public function test_clear_elements(): void {
		$status = new Status();
		$section = FieldFactory::section( 'test_section', 'Test Section' );

		$status->add( $section );
		$this->assertCount( 1, $status->get_elements() );

		$status->clear();
		$this->assertCount( 0, $status->get_elements() );
	}

	/**
	 * Test StatusElementAdapter converts FieldFactory to StatusElement format.
	 */
	public function test_status_element_adapter_conversion(): void {
		$section = FieldFactory::section(
            'test_section', 'Test Section', [], [
				'description' => 'Test Description',
				'hook_key'    => 'test_hook',
			]
        );

		$status_format = StatusElementAdapter::to_status_format( $section );

		$this->assertIsArray( $status_format );
		$this->assertArrayHasKey( 'id', $status_format );
		$this->assertArrayHasKey( 'title', $status_format );
		$this->assertArrayHasKey( 'description', $status_format );
		$this->assertArrayHasKey( 'type', $status_format );
		$this->assertArrayHasKey( 'data', $status_format );
		$this->assertArrayHasKey( 'hook_key', $status_format );
		$this->assertArrayHasKey( 'children', $status_format );

		$this->assertEquals( 'test_section', $status_format['id'] );
		$this->assertEquals( 'Test Section', $status_format['title'] );
		$this->assertEquals( 'Test Description', $status_format['description'] );
		$this->assertEquals( 'section', $status_format['type'] );
		$this->assertEquals( 'test_hook', $status_format['hook_key'] );
	}

	/**
	 * Test StatusElementAdapter handles table headers.
	 */
	public function test_status_element_adapter_table_headers(): void {
		$table = FieldFactory::create(
            [
				'id'      => 'test_table',
				'type'    => 'table',
				'title'   => 'Test Table',
				'headers' => [ 'Header 1', 'Header 2' ],
			]
        );

		$status_format = StatusElementAdapter::to_status_format( $table );

		$this->assertArrayHasKey( 'headers', $status_format );
		$this->assertEquals( [ 'Header 1', 'Header 2' ], $status_format['headers'] );
	}

	/**
	 * Test StatusElementAdapter handles paragraph content.
	 */
	public function test_status_element_adapter_paragraph_content(): void {
		$paragraph = FieldFactory::create(
            [
				'id'      => 'test_para',
				'type'    => 'paragraph',
				'content' => '<code>test.php</code>',
			]
        );

		$status_format = StatusElementAdapter::to_status_format( $paragraph );

		$this->assertArrayHasKey( 'title', $status_format );
		$this->assertArrayHasKey( 'data', $status_format );
		// Paragraph content should be in title field (matching frontend expectation)
		$this->assertStringContainsString( 'test.php', $status_format['title'] );
		// Data field should be empty for paragraphs
		$this->assertEquals( '', $status_format['data'] );
	}

	/**
	 * Test StatusElementAdapter handles nested structures.
	 */
	public function test_status_element_adapter_nested_structure(): void {
		$section = FieldFactory::create(
            [
				'id'      => 'parent',
				'type'    => 'section',
				'title'   => 'Parent Section',
				'children' => [
					[
						'id'    => 'child',
						'type'  => 'section',
						'title' => 'Child Section',
					],
				],
			]
        );

		$status_format = StatusElementAdapter::to_status_format( $section );

		$this->assertArrayHasKey( 'children', $status_format );
		$this->assertCount( 1, $status_format['children'] );
		$this->assertEquals( 'child', $status_format['children'][0]['id'] );
		// Verify hierarchical hook_key
		$this->assertEquals( 'dokan_status_parent_child', $status_format['children'][0]['hook_key'] );
	}

	/**
	 * Test StatusElementAdapter generates hierarchical hook_key correctly.
	 */
	public function test_status_element_adapter_hierarchical_hook_key(): void {
		$section = FieldFactory::create(
            [
				'id'      => 'overridden_features',
				'type'    => 'section',
				'title'   => 'Overridden Features',
				'children' => [
					[
						'id'      => 'override_table',
						'type'    => 'table',
						'title'   => 'Table',
						'headers' => [ 'Column' ],
						'children' => [
							[
								'id'      => 'row1',
								'type'    => 'table-row',
								'children' => [
									[
										'id'      => 'col1',
										'type'    => 'table-column',
										'children' => [
											[
												'id'      => 'para1',
												'type'    => 'paragraph',
												'content' => 'Test',
											],
										],
									],
								],
							],
						],
					],
				],
			]
        );

		$status_format = StatusElementAdapter::to_status_format( $section );

		// Verify root hook_key
		$this->assertEquals( 'dokan_status_overridden_features', $status_format['hook_key'] );

		// Verify table hook_key
		$table = $status_format['children'][0];
		$this->assertEquals( 'dokan_status_overridden_features_override_table', $table['hook_key'] );

		// Verify row hook_key
		$row = $table['children'][0];
		$this->assertEquals( 'dokan_status_overridden_features_override_table_row1', $row['hook_key'] );

		// Verify column hook_key
		$col = $row['children'][0];
		$this->assertEquals( 'dokan_status_overridden_features_override_table_row1_col1', $col['hook_key'] );

		// Verify paragraph hook_key
		$para = $col['children'][0];
		$this->assertEquals( 'dokan_status_overridden_features_override_table_row1_col1_para1', $para['hook_key'] );
	}

	/**
	 * Test Status hook dokan_status_after_describing_elements is fired.
	 */
	public function test_status_hook_fired(): void {
		$status = new Status();
		$hook_fired = false;

		add_action(
			'dokan_status_after_describing_elements',
			function ( $status_instance ) use ( &$hook_fired, $status ) {
				if ( $status_instance === $status ) {
					$hook_fired = true;
				}
			}
		);

		$status->describe();

		$this->assertTrue( $hook_fired, 'Hook dokan_status_after_describing_elements should be fired' );
	}


	/**
	 * Test Status render with empty elements returns empty array.
	 */
	public function test_render_with_empty_elements(): void {
		$status = new Status();
		$output = $status->render();

		$this->assertIsArray( $output );
		$this->assertEmpty( $output );
	}

	/**
	 * Test Status handles exceptions in describe method.
	 */
	public function test_status_handles_exceptions(): void {
		$status = new Status();

		// Add filter to throw exception
		add_filter(
			'dokan_status_field_elements',
			function () {
				throw new \Exception( 'Test exception' );
			}
		);

		// Should not throw exception, should log it
		$output = $status->render();

		$this->assertIsArray( $output );

		remove_filter( 'dokan_status_field_elements', '__return_empty_array' );
	}
}
