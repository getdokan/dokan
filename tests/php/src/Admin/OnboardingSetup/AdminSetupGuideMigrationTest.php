<?php
/**
 * Admin Setup Guide Migration Test
 *
 * Tests for migrating Admin Setup Guide to Unified Field Factory.
 *
 * @package WeDevs\Dokan\Test\Admin\OnboardingSetup
 */

namespace WeDevs\Dokan\Test\Admin\OnboardingSetup;

use WeDevs\Dokan\Admin\OnboardingSetup\Steps\BasicStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\CommissionStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\WithdrawStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\AppearanceStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\AbstractStep;
use WeDevs\Dokan\FieldFactory\FieldFactory;
use WeDevs\Dokan\FieldFactory\Adapters\SettingsElementAdapter;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Class AdminSetupGuideMigrationTest
 * @group field-migration
 * @group field-factory
 * @group rest-api-admin-setup-guide
 */
class AdminSetupGuideMigrationTest extends DokanTestCase {

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
	 * Test BasicStep can be instantiated.
	 */
	public function test_basic_step_instantiation(): void {
		$step = new BasicStep();
		$this->assertInstanceOf( AbstractStep::class, $step );
		$this->assertEquals( 'basic', $step->get_id() );
	}

	/**
	 * Test BasicStep uses FieldFactory elements.
	 */
	public function test_basic_step_uses_field_factory(): void {
		$step = new BasicStep();
		$step->describe_settings();

		$elements = $step->get_field_elements();
		$this->assertNotEmpty( $elements );
		$this->assertCount( 1, $elements ); // Should have one section
	}

	/**
	 * Test populate returns SettingsElement format.
	 */
	public function test_populate_returns_settings_element_format(): void {
		$step = new BasicStep();
		$output = $step->populate();

		// Should return array-of-elements in SettingsElement format (section wrapper as first element)
		$this->assertIsArray( $output );
		$this->assertArrayHasKey( 0, $output );

		$section = $output[0] ?? [];
		$this->assertIsArray( $section );
		$this->assertArrayHasKey( 'id', $section );
		$this->assertArrayHasKey( 'type', $section );
		$this->assertArrayHasKey( 'title', $section );
		$this->assertArrayHasKey( 'children', $section );
		$this->assertArrayHasKey( 'hook_key', $section );

		// Check that children exist and have proper structure
		$this->assertNotEmpty( $section['children'] );
		$first_child = $section['children'][0] ?? [];
		$this->assertArrayHasKey( 'id', $first_child );
		$this->assertArrayHasKey( 'type', $first_child );

		// First child should be a field/subsection; if field, it has a variant.
		if ( isset( $first_child['type'] ) && $first_child['type'] === 'field' ) {
			$this->assertArrayHasKey( 'variant', $first_child );
		}
	}

	/**
	 * Test populate with radio_box field.
	 */
	public function test_populate_with_radio_box_field(): void {
		$step = new BasicStep();
		$output = $step->populate();

		// Find shipping_fee_recipient field
		$children = $output[0]['children'] ?? [];
		$shipping_field = null;
		foreach ( $children as $child ) {
			if ( isset( $child['id'] ) && $child['id'] === 'shipping_fee_recipient' ) {
				$shipping_field = $child;
				break;
			}
		}

		$this->assertNotNull( $shipping_field, 'Shipping fee recipient field should exist' );
		$this->assertEquals( 'field', $shipping_field['type'] );
		$this->assertEquals( 'radio_box', $shipping_field['variant'] );
		$this->assertArrayHasKey( 'options', $shipping_field );
		$this->assertArrayHasKey( 'value', $shipping_field );
		$this->assertArrayHasKey( 'default', $shipping_field );
	}

	/**
	 * Test populate with switch/toggle field.
	 */
	public function test_populate_with_switch_field(): void {
		$step = new BasicStep();
		$output = $step->populate();

		// Find order_status_change field
		$children = $output[0]['children'] ?? [];
		$order_status_field = null;
		foreach ( $children as $child ) {
			if ( isset( $child['id'] ) && $child['id'] === 'order_status_change' ) {
				$order_status_field = $child;
				break;
			}
		}

		$this->assertNotNull( $order_status_field, 'Order status change field should exist' );
		$this->assertEquals( 'field', $order_status_field['type'] );
		$this->assertContains( $order_status_field['variant'], [ 'switch', 'toggle' ] );
		$this->assertArrayHasKey( 'enable_state', $order_status_field );
		$this->assertArrayHasKey( 'disable_state', $order_status_field );
	}

	/**
	 * Test SettingsElementAdapter converts FieldFactory to SettingsElement format.
	 */
	public function test_settings_element_adapter_conversion(): void {
		$section = FieldFactory::section( 'test_section', 'Test Section' );
		$field = FieldFactory::radio_box(
			'test_field',
			'Test Field',
			[
				[
					'value' => 'option1',
					'label' => 'Option 1',
				],
				[
					'value' => 'option2',
					'label' => 'Option 2',
				],
			],
			[
				'description' => 'Test description',
				'default'     => 'option1',
				'value'       => 'option2',
			]
		);

		$section->add_child( $field );
		$converted = SettingsElementAdapter::to_settings_format( $section );

		$this->assertIsArray( $converted );
		$this->assertEquals( 'test_section', $converted['id'] );
		$this->assertEquals( 'section', $converted['type'] );
		$this->assertArrayHasKey( 'children', $converted );
		$this->assertCount( 1, $converted['children'] );

		$converted_field = $converted['children'][0];
		$this->assertEquals( 'test_field', $converted_field['id'] );
		$this->assertEquals( 'field', $converted_field['type'] );
		$this->assertEquals( 'radio_box', $converted_field['variant'] );
		$this->assertEquals( 'option2', $converted_field['value'] );
		$this->assertEquals( 'option1', $converted_field['default'] );
		$this->assertArrayHasKey( 'options', $converted_field );
		$this->assertCount( 2, $converted_field['options'] );
		$this->assertEquals( 'Option 1', $converted_field['options'][0]['title'] );
	}

	/**
	 * Test SettingsElementAdapter hierarchical hook_key.
	 */
	public function test_settings_element_adapter_hierarchical_hook_key(): void {
		$section = FieldFactory::section( 'parent', 'Parent Section' );
		$field = FieldFactory::text( 'child', 'Child Field' );
		$section->add_child( $field );

		$converted = SettingsElementAdapter::to_settings_format( $section, 'dokan_admin_onboarding_setup_step_basic' );

		$this->assertStringContainsString( 'dokan_admin_onboarding_setup_step_basic', $converted['hook_key'] );
		$this->assertStringContainsString( 'parent', $converted['hook_key'] );

		$child_hook_key = $converted['children'][0]['hook_key'] ?? '';
		$this->assertStringContainsString( $converted['hook_key'], $child_hook_key );
		$this->assertStringContainsString( 'child', $child_hook_key );
	}

	/**
	 * Test SettingsElementAdapter with nested structure.
	 */
	public function test_settings_element_adapter_nested_structure(): void {
		$parent_section = FieldFactory::section( 'parent', 'Parent Section' );
		$child_section = FieldFactory::section( 'child', 'Child Section' );
		$field = FieldFactory::text( 'field', 'Field' );

		$child_section->add_child( $field );
		$parent_section->add_child( $child_section );

		$converted = SettingsElementAdapter::to_settings_format( $parent_section );

		$this->assertArrayHasKey( 'children', $converted );
		$this->assertCount( 1, $converted['children'] );

		$child = $converted['children'][0];
		$this->assertEquals( 'child', $child['id'] );
		$this->assertArrayHasKey( 'children', $child );
		$this->assertCount( 1, $child['children'] );
		$this->assertEquals( 'field', $child['children'][0]['id'] );
	}

	/**
	 * Test populate_children_only returns only children.
	 */
	public function test_populate_children_only(): void {
		$step = new BasicStep();
		$output = $step->populate_children_only();

		$this->assertIsArray( $output );
		// Should return array of children (sections/fields)
		$this->assertNotEmpty( $output );
		$this->assertArrayHasKey( 0, $output );
		$this->assertArrayHasKey( 'id', $output[0] );
	}

	/**
	 * Test add_field_element method.
	 */
	public function test_add_field_element(): void {
		$step = new BasicStep();
		$field = FieldFactory::text( 'test', 'Test Field' );

		$step->add_field_element( $field );
		$elements = $step->get_field_elements();

		$this->assertNotEmpty( $elements );
		$this->assertContains( $field, $elements );
	}

	/**
	 * Test clear_field_elements method.
	 */
	public function test_clear_field_elements(): void {
		$step = new BasicStep();
		$step->describe_settings(); // This adds elements

		$elements_before = $step->get_field_elements();
		$this->assertNotEmpty( $elements_before );

		$step->clear_field_elements();
		$elements_after = $step->get_field_elements();

		$this->assertEmpty( $elements_after );
	}

	/**
	 * Test SettingsElementAdapter with switch field enable/disable states.
	 */
	public function test_settings_element_adapter_switch_states(): void {
		$switch_field = FieldFactory::toggle(
			'test_switch',
			'Test Switch',
			[
				'default'       => true,
				'value'         => false,
				'enable_state'  => [
					'value' => 'on',
					'title' => 'Enabled',
				],
				'disable_state' => [
					'value' => 'off',
					'title' => 'Disabled',
				],
			]
		);

		$converted = SettingsElementAdapter::to_settings_format( $switch_field );

		$this->assertEquals( 'switch', $converted['variant'] );
		$this->assertArrayHasKey( 'enable_state', $converted );
		$this->assertArrayHasKey( 'disable_state', $converted );
		$this->assertEquals( 'on', $converted['enable_state']['value'] );
		$this->assertEquals( 'off', $converted['disable_state']['value'] );
		$this->assertEquals( 'Enabled', $converted['enable_state']['title'] );
		$this->assertEquals( 'Disabled', $converted['disable_state']['title'] );
	}

	/**
	 * Test SettingsElementAdapter preserves field properties.
	 */
	public function test_settings_element_adapter_preserves_properties(): void {
		$field = FieldFactory::text(
			'test_field',
			'Test Field',
			[
				'description' => 'Test description',
				'placeholder' => 'Enter text',
				'default'     => 'default value',
				'value'       => 'current value',
				'read_only'   => true,
				'disabled'    => false,
				'size'        => 50,
			]
		);

		$converted = SettingsElementAdapter::to_settings_format( $field );

		$this->assertEquals( 'Test description', $converted['description'] );
		$this->assertEquals( 'Enter text', $converted['placeholder'] );
		$this->assertEquals( 'default value', $converted['default'] );
		$this->assertEquals( 'current value', $converted['value'] );
		$this->assertTrue( $converted['readonly'] );
		$this->assertFalse( $converted['disabled'] );
		$this->assertEquals( 50, $converted['size'] );
	}

	/**
	 * Test CommissionStep uses FieldFactory.
	 */
	public function test_commission_step_uses_field_factory(): void {
		$step = new CommissionStep();
		$step->describe_settings();

		$elements = $step->get_field_elements();
		$this->assertNotEmpty( $elements );
		$this->assertCount( 1, $elements ); // Should have one section
	}

	/**
	 * Test CommissionStep populate returns correct format.
	 */
	public function test_commission_step_populate(): void {
		$step = new CommissionStep();
		$output = $step->populate();

		$this->assertIsArray( $output );
		$this->assertArrayHasKey( 0, $output );
		$this->assertEquals( 'commission', $output[0]['id'] );
		$this->assertArrayHasKey( 'children', $output[0] );
		$this->assertNotEmpty( $output[0]['children'] );
	}

	/**
	 * Test WithdrawStep uses FieldFactory.
	 */
	public function test_withdraw_step_uses_field_factory(): void {
		$step = new WithdrawStep();
		$step->describe_settings();

		$elements = $step->get_field_elements();
		$this->assertNotEmpty( $elements );
		$this->assertCount( 1, $elements ); // Should have one section
	}

	/**
	 * Test WithdrawStep populate returns correct format.
	 */
	public function test_withdraw_step_populate(): void {
		$step = new WithdrawStep();
		$output = $step->populate();

		$this->assertIsArray( $output );
		$this->assertArrayHasKey( 0, $output );
		$this->assertEquals( 'withdraw', $output[0]['id'] );
		$this->assertArrayHasKey( 'children', $output[0] );
		$this->assertNotEmpty( $output[0]['children'] );
	}

	/**
	 * Test AppearanceStep uses FieldFactory.
	 */
	public function test_appearance_step_uses_field_factory(): void {
		$step = new AppearanceStep();
		$step->describe_settings();

		$elements = $step->get_field_elements();
		$this->assertNotEmpty( $elements );
		$this->assertCount( 1, $elements ); // Should have one section
	}

	/**
	 * Test AppearanceStep populate returns correct format.
	 */
	public function test_appearance_step_populate(): void {
		$step = new AppearanceStep();
		$output = $step->populate();

		$this->assertIsArray( $output );
		$this->assertArrayHasKey( 0, $output );
		$this->assertEquals( 'appearance', $output[0]['id'] );
		$this->assertArrayHasKey( 'children', $output[0] );
		$this->assertNotEmpty( $output[0]['children'] );
	}

	/**
	 * Test SettingsElementAdapter with combine_input field.
	 */
	public function test_settings_element_adapter_combine_input(): void {
		$combine_field = FieldFactory::create(
            [
				'id'      => 'test_combine',
				'type'    => 'field',
				'variant' => 'combine_input',
				'title'   => 'Test Combine',
				'inputs'  => [
					[
						'id'      => 'percentage',
						'label'   => 'Percentage',
						'type'    => 'number',
						'postfix' => '%',
					],
					[
						'id'     => 'fixed',
						'label'  => 'Fixed',
						'type'   => 'number',
						'prefix' => '$',
					],
				],
				'value'   => [
					'percentage' => '10',
					'fixed'      => '5',
				],
			]
        );

		$converted = SettingsElementAdapter::to_settings_format( $combine_field );

		$this->assertEquals( 'combine_input', $converted['variant'] );
		$this->assertIsArray( $converted['value'] );
		$this->assertEquals( '10', $converted['value']['percentage'] );
		$this->assertEquals( '5', $converted['value']['fixed'] );
	}

	/**
	 * Test SettingsElementAdapter with multicheck field.
	 */
	public function test_settings_element_adapter_multicheck(): void {
		$multicheck_field = FieldFactory::multicheck(
			'test_multicheck',
			'Test Multicheck',
			[
				[
					'value' => 'option1',
					'label' => 'Option 1',
				],
				[
					'value' => 'option2',
					'label' => 'Option 2',
				],
				[
					'value' => 'option3',
					'label' => 'Option 3',
				],
			],
			[
				'default' => [ 'option1', 'option2' ],
				'value'   => [ 'option1', 'option3' ],
			]
		);

		$converted = SettingsElementAdapter::to_settings_format( $multicheck_field );

		$this->assertEquals( 'multicheck', $converted['variant'] );
		$this->assertIsArray( $converted['value'] );
		$this->assertContains( 'option1', $converted['value'] );
		$this->assertContains( 'option3', $converted['value'] );
		$this->assertArrayHasKey( 'options', $converted );
		$this->assertCount( 3, $converted['options'] );
	}
}
