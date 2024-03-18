<?php

namespace WeDevs\Dokan\Test\Commission\Strategy;

use WeDevs\Dokan\Commission\Calculators\PercentageCommissionCalculator;
use WeDevs\Dokan\Commission\Strategies\GlobalCommissionSourceStrategy;
use WeDevs\Dokan\Commission\Strategies\ProductCommissionSourceStrategy;
use WeDevs\Dokan\Commission\Strategies\VendorCommissionSourceStrategy;
use WeDevs\Dokan\Test\Helpers\WC_Helper_Product;
use WP_UnitTestCase;

class ProductStrategyTest extends WP_UnitTestCase {

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
        $product = dokan()->product->create(
            [
                'name'          => 'apple',
                'regular_price' => 200,
            ]
        );

        $global_strategy = new ProductCommissionSourceStrategy( $product->get_id() );
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
            // Fixed commission.
            [
                [
                    'type'           => 'fixed',
                    'flat'           => 0,
                    'percentage'     => 0,
                    'category_id'    => 15,
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
        $product = dokan()->product->create(
            [
                'name'          => 'apple',
                'regular_price' => 200,
            ]
        );

        dokan()->product->save_commission_settings(
            $product->get_id(),
            [
                'percentage' => $settings_data['percentage'],
                'type'       => $settings_data['type'],
                'flat'       => $settings_data['flat'],
            ]
        );

        $global_strategy = new ProductCommissionSourceStrategy( $product->get_id() );
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

    /**
     * We are test here that for a variation product the commission value will be the same a the parent product.
     *
     * @since DOKAN_SINCE
     *
     * @test
     * @return void
     */
    public function test_that_we_can_get_commission_data_properly_of_a_variation_product() {
        $product    = WC_Helper_Product::create_variation_product();
        $percentage = 19;
        $flat       = 7;

        $parent_commission_data = dokan()->product->save_commission_settings(
            $product->get_id(),
            [
                'percentage' => $percentage,
                'type'       => PercentageCommissionCalculator::SOURCE,
                'flat'       => $flat,
            ]
        );

        foreach ( $product->get_children() as $variation_id ) {
            $variation_commission_data = dokan()->product->get_commission_settings( $variation_id );

            $this->assertEquals( $parent_commission_data->get_type(), $variation_commission_data->get_type() );
            $this->assertEquals( $parent_commission_data->get_flat(), $variation_commission_data->get_flat() );
            $this->assertEquals( $parent_commission_data->get_percentage(), $variation_commission_data->get_percentage() );
            $this->assertEquals( $parent_commission_data->get_category_commissions(), $variation_commission_data->get_category_commissions() );
            $this->assertEquals( $parent_commission_data->get_meta_data(), $variation_commission_data->get_meta_data() );
            $this->assertEquals( $parent_commission_data->get_category_id(), $variation_commission_data->get_category_id() );
        }
    }
}
