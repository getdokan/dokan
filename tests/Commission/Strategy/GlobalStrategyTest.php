<?php

namespace Commission\Strategy;

use WeDevs\Dokan\Commission\Strategies\GlobalCommissionSourceStrategy;
use WP_UnitTestCase;

class GlobalStrategyTest extends WP_UnitTestCase {

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

        $global_strategy = new GlobalCommissionSourceStrategy( $category_id );
        $calculator = $global_strategy->get_commission_calculator();

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
                    'total_price' => 150,
                    'total_quantity'=> 1,
                ],
                [
                    'is_applicable' => true,
                    'source' => 'category_based',
                    'admin_commission' => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning' => 150,
                    'total_quantity' => 1,
                    'calculator' => 'WeDevs\Dokan\Commission\Calculators\CategoryBasedCommissionCalculator',
                ],
            ],






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
                    'total_price' => 150,
                    'total_quantity'=> 1,
                ],
                [
                    'is_applicable' => true,
                    'source' => 'category_based',
                    'admin_commission' => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning' => 150,
                    'total_quantity' => 1
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
                    'total_price' => 150,
                    'total_quantity'=> 1,
                ],
                [
                    'is_applicable' => true,
                    'source' => 'category_based',
                    'admin_commission' => 20,
                    'per_item_admin_commission' => 20,
                    'vendor_earning' => 130,
                    'total_quantity' => 1
                ],
            ],
            [
                [
                    'type'           => 'category_based',
                    'flat'           => 10,
                    'percentage'     => null,
                    'category_id'    => 20,
                    'cat_commission' => [],
                    'total_price' => 150,
                    'total_quantity'=> 1,
                ],
                [
                    'is_applicable' => false,
                    'source' => 'category_based',
                    'admin_commission' => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning' => 0,
                    'total_quantity' => 1
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
                    'total_price' => 400,
                    'total_quantity'=> 4,
                ],
                [
                    'is_applicable' => true,
                    'source' => 'category_based',
                    'admin_commission' => 80,
                    'per_item_admin_commission' => 20,
                    'vendor_earning' => 320,
                    'total_quantity' => 4,
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
                    'total_price' => 400,
                    'total_quantity'=> 4,
                ],
                [
                    'is_applicable' => false,
                    'source' => 'category_based',
                    'admin_commission' => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning' => 0,
                    'total_quantity' => 4,
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
                    'total_price' => 400,
                    'total_quantity'=> 4,
                ],
                [
                    'is_applicable' => true,
                    'source' => 'category_based',
                    'admin_commission' => 80,
                    'per_item_admin_commission' => 20,
                    'vendor_earning' => 320,
                    'total_quantity' => 4,
                ],
            ],
        ];
    }

    /**
     * @test
     *
     * @dataProvider commission_data_settings
     * @param $settings_data
     * @param $expected
     *
     * @return void
     */
    public function test_commission_for_different_data_set( $settings_data, $expected ) {
        $settings = [
            'admin_percentage'                 => $settings_data['percentage'],
            'commission_type'                  => $settings_data['type'],
            'additional_fee'                   => $settings_data['flat'],
            'commission_category_based_values' => $settings_data['cat_commission'],
        ];

        update_option( 'dokan_selling', $settings );

        $global_strategy = new GlobalCommissionSourceStrategy( $settings_data['category_id'] );
        $calculator = $global_strategy->get_commission_calculator();

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
