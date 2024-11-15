<?php

namespace WeDevs\Dokan\Test\Commission\Strategy;

use WeDevs\Dokan\Commission\Strategies\GlobalStrategy;
use WP_UnitTestCase;

class GlobalTest extends WP_UnitTestCase {

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

        $global_strategy = new GlobalStrategy( $category_id );
        $calculator      = $global_strategy->create_formula();

        $this->assertNotNull( $calculator );
        $this->assertFalse( $calculator->is_applicable() );
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
        $settings = [
            'admin_percentage'                 => $settings_data['percentage'],
            'commission_type'                  => $settings_data['type'],
            'additional_fee'                   => $settings_data['flat'],
            'commission_category_based_values' => $settings_data['cat_commission'],
        ];

        update_option( 'dokan_selling', $settings );

        $global_strategy = new GlobalStrategy( $settings_data['category_id'] );
        $calculator      = $global_strategy->create_formula();

        $this->assertNotNull( $calculator );

        $this->assertEquals( $expected['is_applicable'], $calculator->is_applicable() );
        $this->assertNotNull( $calculator );
        $this->assertTrue( is_a( $calculator, 'WeDevs\Dokan\Commission\Formula\AbstractFormula' ) );
        $this->assertTrue( is_a( $calculator, $expected['calculator'] ) );

        $calculator->set_amount( $settings_data['total_price'] )
                   ->set_quantity( $settings_data['total_quantity'] )
                   ->calculate();

        $this->assertEquals( $expected['admin_commission'], $calculator->get_admin_commission() );
        $this->assertEquals( $expected['vendor_earning'], $calculator->get_vendor_earning() );
        $this->assertEquals( $expected['source'], $calculator->get_source() );
        $this->assertEquals( $expected['per_item_admin_commission'], $calculator->get_per_item_admin_commission() );
        $this->assertEquals( $expected['total_quantity'], $calculator->get_items_total_quantity() );
    }
}
