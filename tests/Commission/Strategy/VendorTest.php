<?php

namespace WeDevs\Dokan\Test\Commission\Strategy;

use WeDevs\Dokan\Commission\Formula\Percentage;
use WeDevs\Dokan\Commission\Strategies\Vendor;
use WP_UnitTestCase;

class VendorTest extends WP_UnitTestCase {

    /**
     * Test if no setting is saved before.
     *
     * @test
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function test_commission_calculation_for_no_settings() {
        $category_id = 15;

        $vendor = $this->factory()->user->create_and_get(
            [
                'role' => 'seller',
            ]
        );

        $vendor = dokan()->vendor->get( $vendor->ID );

        $strategy   = new Vendor( $vendor->get_id(), $category_id );
        $formula = $strategy->get_commission_formula();

        $this->assertNotNull( $formula );
        $this->assertTrue( is_a( $formula, Percentage::class ) );
        $this->assertFalse( $formula->is_applicable() );
    }

    /**
     * Different commission data ser.
     *
     * @since DOKAN_SINCE
     *
     * @return array[]
     */
    public function commission_data_settings() {
        return [
            // Category based commission.
            [
                [
                    'type'           => 'category_based',
                    'flat'           => 0,
                    'percentage'     => 0,
                    'category_id'    => 15,
                    'cat_commission' => [
                        'all'   => [
                            'flat'       => 0,
                            'percentage' => 0,
                        ],
                        'items' => [
                            15 => [
                                'flat'       => 0,
                                'percentage' => 0,
                            ],
                        ],
                    ],
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'category_based',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 150,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\CategoryBased',
                ],
            ],
            [
                [
                    'type'           => 'category_based',
                    'flat'           => 10,
                    'percentage'     => null,
                    'category_id'    => 20,
                    'cat_commission' => [
                        'all'   => [
                            'flat'       => 20,
                            'percentage' => 0,
                        ],
                        'items' => [
                            22 => [
                                'flat'       => 0,
                                'percentage' => 0,
                            ],
                        ],
                    ],
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'category_based',
                    'admin_commission'          => 20,
                    'per_item_admin_commission' => 20,
                    'vendor_earning'            => 130,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\CategoryBased',
                ],
            ],
            [
                [
                    'type'           => 'category_based',
                    'flat'           => 10,
                    'percentage'     => null,
                    'category_id'    => 20,
                    'cat_commission' => [],
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => false,
                    'source'                    => 'category_based',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 150,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\CategoryBased',
                ],
            ],
            [
                [
                    'type'           => 'category_based',
                    'flat'           => 10,
                    'percentage'     => null,
                    'category_id'    => 22,
                    'cat_commission' => [
                        'all'   => [
                            'flat'       => 20,
                            'percentage' => 0,
                        ],
                        'items' => [
                            22 => [
                                'flat'       => 10,
                                'percentage' => 10,
                            ],
                        ],
                    ],
                    'total_price'    => 400,
                    'total_quantity' => 4,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'category_based',
                    'admin_commission'          => 80,
                    'per_item_admin_commission' => 20,
                    'vendor_earning'            => 320,
                    'total_quantity'            => 4,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\CategoryBased',
                ],
            ],
            [
                [
                    'type'           => 'category_based',
                    'flat'           => 10,
                    'percentage'     => null,
                    'category_id'    => 22,
                    'cat_commission' => [
                        'all'   => [
                            'flat'       => 20,
                            'percentage' => 0,
                        ],
                        'items' => [
                            22 => [
                                'flat'       => '',
                                'percentage' => null,
                            ],
                        ],
                    ],
                    'total_price'    => 400,
                    'total_quantity' => 4,
                ],
                [
                    'is_applicable'             => false,
                    'source'                    => 'category_based',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 400,
                    'total_quantity'            => 4,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\CategoryBased',
                ],
            ],
            [
                [
                    'type'           => 'category_based',
                    'flat'           => null,
                    'percentage'     => null,
                    'category_id'    => 22,
                    'cat_commission' => [
                        'all'   => [
                            'flat'       => 20,
                            'percentage' => 0,
                        ],
                        'items' => [
                            22 => [
                                'flat'       => '',
                                'percentage' => 20,
                            ],
                        ],
                    ],
                    'total_price'    => 400,
                    'total_quantity' => 4,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'category_based',
                    'admin_commission'          => 80,
                    'per_item_admin_commission' => 20,
                    'vendor_earning'            => 320,
                    'total_quantity'            => 4,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\CategoryBased',
                ],
            ],

            // Fixed commission.
            [
                [
                    'type'           => 'fixed',
                    'flat'           => 0,
                    'percentage'     => 0,
                    'category_id'    => 15,
                    'cat_commission' => [
                        'all'   => [
                            'flat'       => 0,
                            'percentage' => 0,
                        ],
                        'items' => [
                            15 => [
                                'flat'       => 0,
                                'percentage' => 0,
                            ],
                        ],
                    ],
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'fixed',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 150,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Fixed',
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => 10,
                    'percentage'     => null,
                    'category_id'    => 20,
                    'cat_commission' => [
                        'all'   => [
                            'flat'       => 20,
                            'percentage' => 0,
                        ],
                        'items' => [
                            22 => [
                                'flat'       => 0,
                                'percentage' => 0,
                            ],
                        ],
                    ],
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'fixed',
                    'admin_commission'          => 10,
                    'per_item_admin_commission' => 10,
                    'vendor_earning'            => 140,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Fixed',
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => '',
                    'percentage'     => 10,
                    'category_id'    => 20,
                    'cat_commission' => [],
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'fixed',
                    'admin_commission'          => 15,
                    'per_item_admin_commission' => 15,
                    'vendor_earning'            => 135,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Fixed',
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => null,
                    'percentage'     => null,
                    'category_id'    => 22,
                    'cat_commission' => [
                        'all'   => [
                            'flat'       => 20,
                            'percentage' => 0,
                        ],
                        'items' => [
                            22 => [
                                'flat'       => 10,
                                'percentage' => 10,
                            ],
                        ],
                    ],
                    'total_price'    => 400,
                    'total_quantity' => 4,
                ],
                [
                    'is_applicable'             => false,
                    'source'                    => 'fixed',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 400,
                    'total_quantity'            => 4,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Fixed',
                ],
            ],

            // Combine commission.
            [
                [
                    'type'           => 'combine',
                    'flat'           => 0,
                    'percentage'     => 0,
                    'category_id'    => 15,
                    'cat_commission' => [
                        'all'   => [
                            'flat'       => 0,
                            'percentage' => 0,
                        ],
                        'items' => [
                            15 => [
                                'flat'       => 0,
                                'percentage' => 0,
                            ],
                        ],
                    ],
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'combine',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 150,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Combine',
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => 10,
                    'percentage'     => null,
                    'category_id'    => 20,
                    'cat_commission' => [
                        'all'   => [
                            'flat'       => 20,
                            'percentage' => 0,
                        ],
                        'items' => [
                            22 => [
                                'flat'       => 0,
                                'percentage' => 0,
                            ],
                        ],
                    ],
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'combine',
                    'admin_commission'          => 10,
                    'per_item_admin_commission' => 10,
                    'vendor_earning'            => 140,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Combine',
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => '',
                    'percentage'     => 10,
                    'category_id'    => 20,
                    'cat_commission' => [],
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'combine',
                    'admin_commission'          => 15,
                    'per_item_admin_commission' => 15,
                    'vendor_earning'            => 135,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Combine',
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => null,
                    'percentage'     => null,
                    'category_id'    => 22,
                    'cat_commission' => [
                        'all'   => [
                            'flat'       => 20,
                            'percentage' => 0,
                        ],
                        'items' => [
                            22 => [
                                'flat'       => 10,
                                'percentage' => 10,
                            ],
                        ],
                    ],
                    'total_price'    => 400,
                    'total_quantity' => 4,
                ],
                [
                    'is_applicable'             => false,
                    'source'                    => 'combine',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 400,
                    'total_quantity'            => 4,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Combine',
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => 5,
                    'percentage'     => 10,
                    'category_id'    => 22,
                    'cat_commission' => [
                        'all'   => [
                            'flat'       => 20,
                            'percentage' => 0,
                        ],
                        'items' => [
                            22 => [
                                'flat'       => 10,
                                'percentage' => 10,
                            ],
                        ],
                    ],
                    'total_price'    => 400,
                    'total_quantity' => 4,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'combine',
                    'admin_commission'          => 45,
                    'per_item_admin_commission' => 11.25,
                    'vendor_earning'            => 355,
                    'total_quantity'            => 4,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Combine',
                ],
            ],
        ];
    }

    /**
     * @test
     *
     * @dataProvider commission_data_settings
     *
     * @param $settings_data
     * @param $expected
     *
     * @return void
     */
    public function test_commission_for_different_data_set( $settings_data, $expected ) {
        $vendor = $this->factory()->user->create_and_get(
            [
                'role' => 'seller',
            ]
        );

        $vendor = dokan()->vendor->get( $vendor->ID );
        $vendor->update_meta( 'dokan_admin_percentage', $settings_data['percentage'] );
        $vendor->update_meta( 'dokan_admin_percentage_type', $settings_data['type'] );
        $vendor->update_meta( 'dokan_admin_additional_fee', $settings_data['flat'] );
        $vendor->update_meta( 'admin_category_commission', $settings_data['cat_commission'] );

        $vendor->update_meta_data();
        $vendor->save();

        $global_strategy = new Vendor( $vendor->get_id(), $settings_data['category_id'] );
        $formula      = $global_strategy->get_commission_formula();

        $this->assertNotNull( $formula );
        $this->assertEquals( $expected['is_applicable'], $formula->is_applicable() );
        $this->assertNotNull( $formula );
        $this->assertTrue( is_a( $formula, 'WeDevs\Dokan\Commission\Formula\AbstractFormula' ) );
        $this->assertTrue( is_a( $formula, $expected['calculator'] ) );

        $formula->set_amount( $settings_data['total_price'] )
                   ->set_quantity( $settings_data['total_quantity'] )
                   ->calculate();

        $this->assertEquals( $expected['admin_commission'], $formula->get_admin_commission() );
        $this->assertEquals( $expected['vendor_earning'], $formula->get_vendor_earning() );
        $this->assertEquals( $expected['source'], $formula->get_source() );
        $this->assertEquals( $expected['per_item_admin_commission'], $formula->get_per_item_admin_commission() );
        $this->assertEquals( $expected['total_quantity'], $formula->get_items_total_quantity() );
    }
}
