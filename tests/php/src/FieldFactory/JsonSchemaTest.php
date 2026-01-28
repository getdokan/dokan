<?php
/**
 * JSON Schema Test
 *
 * @package WeDevs\Dokan\Test\FieldFactory
 */

namespace WeDevs\Dokan\Test\FieldFactory;

use WeDevs\Dokan\FieldFactory\FieldFactory;
use WeDevs\Dokan\FieldFactory\Contracts\ContainerInterface;
use WeDevs\Dokan\FieldFactory\Contracts\FieldInterface;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Class JsonSchemaTest
 *
 * Tests for JSON schema-based element creation (end-to-end).
 * @group field-factory
 */
class JsonSchemaTest extends DokanTestCase {

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
     * Test basic field JSON schema.
     */
    public function test_basic_field_schema(): void {
        $json = [
            'id'          => 'store_name',
            'type'        => 'field',
            'variant'     => 'text',
            'title'       => 'Store Name',
            'description' => 'Enter your store name',
            'placeholder' => 'My Store',
            'required'    => true,
            'default'     => '',
        ];

        $field = FieldFactory::create( $json );

        $this->assertInstanceOf( FieldInterface::class, $field );
        $this->assertEquals( 'store_name', $field->get_id() );
        $this->assertEquals( 'Store Name', $field->get_label() );
        $this->assertEquals( 'Enter your store name', $field->get_property( 'description' ) );
        $this->assertEquals( 'My Store', $field->get_property( 'placeholder' ) );
        $this->assertTrue( $field->get_property( 'required' ) );
    }

    /**
     * Test select field with elements.
     */
    public function test_select_field_schema(): void {
        $json = [
            'id'       => 'country',
            'type'     => 'field',
            'variant'  => 'select',
            'title'    => 'Country',
            'default'  => 'US',
            'elements' => [
                [
					'value' => 'US',
					'label' => 'United States',
				],
                [
					'value' => 'UK',
					'label' => 'United Kingdom',
				],
                [
					'value' => 'CA',
					'label' => 'Canada',
				],
            ],
        ];

        $field = FieldFactory::create( $json );

        $this->assertEquals( 'country', $field->get_id() );
        $this->assertEquals( 'US', $field->get_property( 'default' ) );

        $elements = $field->get_elements();
        $this->assertCount( 3, $elements );
        $this->assertEquals( 'US', $elements[0]['value'] );
        $this->assertEquals( 'United States', $elements[0]['label'] );
    }

    /**
     * Test switch field schema.
     */
    public function test_switch_field_schema(): void {
        $json = [
            'id'           => 'enable_shipping',
            'type'         => 'field',
            'variant'      => 'switch',
            'title'        => 'Enable Shipping',
            'description'  => 'Allow vendors to configure shipping',
            'default'      => true,
            'enable_state' => [
                'value' => 'on',
                'title' => 'Enabled',
            ],
            'disable_state' => [
                'value' => 'off',
                'title' => 'Disabled',
            ],
        ];

        $field = FieldFactory::create( $json );

        $this->assertEquals( 'enable_shipping', $field->get_id() );
        $this->assertTrue( $field->get_property( 'default' ) );
    }

    /**
     * Test number field with min/max.
     */
    public function test_number_field_schema(): void {
        $json = [
            'id'      => 'commission_rate',
            'type'    => 'field',
            'variant' => 'number',
            'title'   => 'Commission Rate',
            'default' => 10,
            'min'     => 0,
            'max'     => 100,
            'step'    => 0.5,
            'postfix' => '%',
        ];

        $field = FieldFactory::create( $json );

        $this->assertEquals( 'commission_rate', $field->get_id() );
        $this->assertEquals( 10, $field->get_property( 'default' ) );
        $this->assertEquals( 0, $field->get_property( 'min' ) );
        $this->assertEquals( 100, $field->get_property( 'max' ) );
        $this->assertEquals( '%', $field->get_property( 'postfix' ) );
    }

    /**
     * Test radio box field schema.
     */
    public function test_radio_box_field_schema(): void {
        $json = [
            'id'       => 'marketplace_type',
            'type'     => 'field',
            'variant'  => 'radio_box',
            'title'    => 'Marketplace Type',
            'default'  => 'multi',
            'elements' => [
                [
                    'value'       => 'single',
                    'label'       => 'Single Vendor',
                    'description' => 'Only admin can sell',
                    'icon'        => 'dashicons-store',
                ],
                [
                    'value'       => 'multi',
                    'label'       => 'Multi Vendor',
                    'description' => 'Multiple vendors can sell',
                    'icon'        => 'dashicons-groups',
                ],
            ],
        ];

        $field = FieldFactory::create( $json );

        $this->assertEquals( 'marketplace_type', $field->get_id() );
        $this->assertEquals( 'multi', $field->get_property( 'default' ) );

        $elements = $field->get_elements();
        $this->assertCount( 2, $elements );
        $this->assertEquals( 'Single Vendor', $elements[0]['label'] );
        $this->assertEquals( 'Only admin can sell', $elements[0]['description'] );
    }

    /**
     * Test section with children schema.
     */
    public function test_section_with_children_schema(): void {
        $json = [
            'id'          => 'general_settings',
            'type'        => 'section',
            'title'       => 'General Settings',
            'description' => 'Configure general settings',
            'children'    => [
                [
                    'id'       => 'store_name',
                    'type'     => 'field',
                    'variant'  => 'text',
                    'title'    => 'Store Name',
                    'required' => true,
                ],
                [
                    'id'      => 'store_description',
                    'type'    => 'field',
                    'variant' => 'textarea',
                    'title'   => 'Description',
                    'rows'    => 4,
                ],
            ],
        ];

        $section = FieldFactory::create( $json );

        $this->assertInstanceOf( ContainerInterface::class, $section );
        $this->assertEquals( 'general_settings', $section->get_id() );

        $children = $section->get_children();
        $this->assertCount( 2, $children );
        $this->assertEquals( 'store_name', $children[0]->get_id() );
        $this->assertEquals( 'store_description', $children[1]->get_id() );
    }

    /**
     * Test conditional visibility schema.
     */
    public function test_conditional_visibility_schema(): void {
        $json = [
            'id'         => 'shipping_cost',
            'type'       => 'field',
            'variant'    => 'number',
            'title'      => 'Shipping Cost',
            'visibility' => [
                'field'    => 'enable_shipping',
                'value'    => true,
                'operator' => 'equal',
            ],
        ];

        $field = FieldFactory::create( $json );

        $visibility = $field->get_property( 'visibility' );
        $this->assertIsArray( $visibility );
        $this->assertEquals( 'enable_shipping', $visibility['field'] );
        $this->assertTrue( $visibility['value'] );
        $this->assertEquals( 'equal', $visibility['operator'] );
    }

    /**
     * Test complete settings page schema.
     */
    public function test_complete_settings_page_schema(): void {
        $json = [
            [
                'id'       => 'general',
                'type'     => 'page',
                'title'    => 'General',
                'icon'     => 'dashicons-admin-generic',
                'children' => [
                    [
                        'id'       => 'store_settings',
                        'type'     => 'subpage',
                        'title'    => 'Store Settings',
                        'children' => [
                            [
                                'id'       => 'basic_info',
                                'type'     => 'section',
                                'title'    => 'Basic Information',
                                'children' => [
                                    [
                                        'id'          => 'store_name',
                                        'type'        => 'field',
                                        'variant'     => 'text',
                                        'title'       => 'Store Name',
                                        'required'    => true,
                                        'placeholder' => 'Enter store name',
                                    ],
                                    [
                                        'id'      => 'store_description',
                                        'type'    => 'field',
                                        'variant' => 'textarea',
                                        'title'   => 'Description',
                                        'rows'    => 4,
                                    ],
                                ],
                            ],
                            [
                                'id'       => 'selling_options',
                                'type'     => 'section',
                                'title'    => 'Selling Options',
                                'children' => [
                                    [
                                        'id'      => 'enable_selling',
                                        'type'    => 'field',
                                        'variant' => 'switch',
                                        'title'   => 'Enable Selling',
                                        'default' => true,
                                    ],
                                    [
                                        'id'       => 'commission_type',
                                        'type'     => 'field',
                                        'variant'  => 'select',
                                        'title'    => 'Commission Type',
                                        'default'  => 'percentage',
                                        'elements' => [
                                            [
												'value' => 'percentage',
												'label' => 'Percentage',
											],
                                            [
												'value' => 'fixed',
												'label' => 'Fixed Amount',
											],
                                            [
												'value' => 'combined',
												'label' => 'Combined',
											],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $elements = FieldFactory::create_from_data( $json );

        // Check root structure
        $this->assertCount( 1, $elements );

        $page = $elements[0];
        $this->assertEquals( 'general', $page->get_id() );
        $this->assertEquals( 'dashicons-admin-generic', $page->get_property( 'icon' ) );

        // Check subpage
        $subpages = $page->get_children();
        $this->assertCount( 1, $subpages );
        $this->assertEquals( 'store_settings', $subpages[0]->get_id() );

        // Check sections
        $sections = $subpages[0]->get_children();
        $this->assertCount( 2, $sections );
        $this->assertEquals( 'basic_info', $sections[0]->get_id() );
        $this->assertEquals( 'selling_options', $sections[1]->get_id() );

        // Check fields in first section
        $basic_fields = $sections[0]->get_children();
        $this->assertCount( 2, $basic_fields );
        $this->assertEquals( 'store_name', $basic_fields[0]->get_id() );
        $this->assertTrue( $basic_fields[0]->get_property( 'required' ) );

        // Find nested field
        $commission_field = $page->find_child( 'commission_type' );
        $this->assertNotNull( $commission_field );
        $this->assertCount( 3, $commission_field->get_elements() );
    }

    /**
     * Test setup wizard schema.
     */
    public function test_setup_wizard_schema(): void {
        $json = [
            [
                'id'          => 'basic_setup',
                'type'        => 'section',
                'title'       => 'Basic Setup',
                'description' => 'Configure your marketplace basics',
                'children'    => [
                    [
                        'id'       => 'marketplace_type',
                        'type'     => 'field',
                        'variant'  => 'radio_box',
                        'title'    => 'Marketplace Type',
                        'default'  => 'multi',
                        'elements' => [
                            [
                                'value'       => 'single',
                                'label'       => 'Single Vendor',
                                'description' => 'Only you can sell products',
                                'icon'        => 'store',
                            ],
                            [
                                'value'       => 'multi',
                                'label'       => 'Multi Vendor',
                                'description' => 'Allow multiple vendors to sell',
                                'icon'        => 'groups',
                            ],
                        ],
                    ],
                    [
                        'id'         => 'vendor_options',
                        'type'       => 'subsection',
                        'title'      => 'Vendor Options',
                        'visibility' => [
                            'field'    => 'marketplace_type',
                            'value'    => 'multi',
                            'operator' => 'equal',
                        ],
                        'children' => [
                            [
                                'id'      => 'vendor_registration',
                                'type'    => 'field',
                                'variant' => 'switch',
                                'title'   => 'Allow Vendor Registration',
                                'default' => true,
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $elements = FieldFactory::create_from_data( $json );

        $this->assertCount( 1, $elements );

        $section = $elements[0];
        $this->assertEquals( 'basic_setup', $section->get_id() );

        $children = $section->get_children();
        $this->assertCount( 2, $children );

        // Check radio_box field
        $marketplace_field = $children[0];
        $this->assertEquals( 'marketplace_type', $marketplace_field->get_id() );
        $this->assertEquals( 'multi', $marketplace_field->get_property( 'default' ) );

        // Check subsection
        $vendor_options = $children[1];
        $this->assertEquals( 'vendor_options', $vendor_options->get_id() );

        // Verify children exist
        $this->assertCount( 1, $vendor_options->get_children() );
        $this->assertEquals( 'vendor_registration', $vendor_options->get_children()[0]->get_id() );
    }

    /**
     * Test multicheck field schema.
     */
    public function test_multicheck_field_schema(): void {
        $json = [
            'id'       => 'payment_methods',
            'type'     => 'field',
            'variant'  => 'multicheck',
            'title'    => 'Payment Methods',
            'default'  => [ 'paypal', 'stripe' ],
            'elements' => [
                [
					'value' => 'paypal',
					'label' => 'PayPal',
				],
                [
					'value' => 'stripe',
					'label' => 'Stripe',
				],
                [
					'value' => 'bank',
					'label' => 'Bank Transfer',
				],
                [
					'value' => 'cod',
					'label' => 'Cash on Delivery',
				],
            ],
        ];

        $field = FieldFactory::create( $json );

        $this->assertEquals( 'payment_methods', $field->get_id() );
        $this->assertEquals( [ 'paypal', 'stripe' ], $field->get_property( 'default' ) );
        $this->assertCount( 4, $field->get_elements() );
    }

    /**
     * Test to_array roundtrip.
     */
    public function test_to_array_roundtrip(): void {
        $original = [
            [
                'id'       => 'section',
                'type'     => 'section',
                'title'    => 'Test Section',
                'children' => [
                    [
                        'id'       => 'name',
                        'type'     => 'field',
                        'variant'  => 'text',
                        'title'    => 'Name',
                        'required' => true,
                    ],
                ],
            ],
        ];

        $elements = FieldFactory::create_from_data( $original );
        $output   = FieldFactory::to_array( $elements );

        // Verify key properties are preserved
        $this->assertEquals( 'section', $output[0]['id'] );
        $this->assertEquals( 'Test Section', $output[0]['title'] );
        $this->assertArrayHasKey( 'children', $output[0] );
        $this->assertEquals( 'name', $output[0]['children'][0]['id'] );
        $this->assertEquals( 'Name', $output[0]['children'][0]['title'] );
    }

    /**
     * Test validation with JSON schema.
     */
    public function test_validation_with_json_schema(): void {
        $json = [
            [
                'id'        => 'email',
                'type'      => 'field',
                'variant'   => 'text',
                'title'     => 'Email Address',
                'required'  => true,
                'minlength' => 5,
            ],
            [
                'id'      => 'age',
                'type'    => 'field',
                'variant' => 'number',
                'title'   => 'Age',
                'min'     => 18,
                'max'     => 100,
            ],
        ];

        $elements = FieldFactory::create_from_data( $json );

        // Valid data
        $valid_result = FieldFactory::validate(
            $elements, [
				'email' => 'test@example.com',
				'age'   => 25,
			]
        );
        $this->assertTrue( $valid_result['valid'] );

        // Invalid data
        $invalid_result = FieldFactory::validate(
            $elements, [
				'email' => '',      // Required
				'age'   => 15,      // Below min
			]
        );
        $this->assertFalse( $invalid_result['valid'] );
        $this->assertArrayHasKey( 'email', $invalid_result['errors'] );
        $this->assertArrayHasKey( 'age', $invalid_result['errors'] );
    }
}
