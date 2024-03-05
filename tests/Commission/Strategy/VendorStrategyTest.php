<?php

namespace Commission\Strategy;

use WeDevs\Dokan\Commission\Strategies\GlobalCommissionSourceStrategy;
use WeDevs\Dokan\Commission\Strategies\VendorCommissionSourceStrategy;
use WP_UnitTestCase;

class VendorStrategyTest extends WP_UnitTestCase {

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

        $global_strategy = new VendorCommissionSourceStrategy( $vendor->get_id(), $category_id );
        $calculator      = $global_strategy->get_commission_calculator();

        $this->assertNull( $calculator );
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
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\CategoryBasedCommissionCalculator',
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
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\CategoryBasedCommissionCalculator',
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
                    'vendor_earning'            => 0,
                    'total_quantity'            => 1,
                    'calculator'                => null,
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
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\CategoryBasedCommissionCalculator',
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
                    'vendor_earning'            => 0,
                    'total_quantity'            => 4,
                    'calculator'                => null,
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
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\CategoryBasedCommissionCalculator',
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
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\FixedCommissionCalculator',
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
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\FixedCommissionCalculator',
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
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\FixedCommissionCalculator',
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
                    'calculator'                => null,
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
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\CombineCommissionCalculator',
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
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\CombineCommissionCalculator',
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
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\CombineCommissionCalculator',
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
                    'calculator'                => null,
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
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\CombineCommissionCalculator',
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

        $global_strategy = new VendorCommissionSourceStrategy( $vendor->get_id(), $settings_data['category_id'] );
        $calculator      = $global_strategy->get_commission_calculator();

        if ( null === $expected['calculator'] ) {
            $this->assertNull( $calculator );
        } else {
            $this->assertEquals( $expected['is_applicable'], $calculator->is_applicable() );
            $this->assertNotNull( $calculator );
            $this->assertTrue( is_a( $calculator, 'WeDevs\Dokan\Commission\Calculators\CommissionCalculatorInterface' ) );
            $this->assertTrue( is_a( $calculator, $expected['calculator'] ) );

            $calculator->calculate( $settings_data['total_price'], $settings_data['total_quantity'] );

            $this->assertEquals( $expected['admin_commission'], $calculator->get_admin_commission() );
            $this->assertEquals( $expected['vendor_earning'], $calculator->get_vendor_earning() );
            $this->assertEquals( $expected['source'], $calculator->get_source() );
            $this->assertEquals( $expected['per_item_admin_commission'], $calculator->get_per_item_admin_commission() );
            $this->assertEquals( $expected['total_quantity'], $calculator->get_items_total_quantity() );

        }
    }
}
