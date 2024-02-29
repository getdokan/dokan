<?php

namespace Commission\Calculator;

use WeDevs\Dokan\Commission\Calculators\FixedCommissionCalculator;
use WeDevs\Dokan\Commission\Utils\CommissionSettings;
use WP_UnitTestCase;

class FixedCommissionTest extends WP_UnitTestCase {

    /**
     * Test if the class has overridden all the methods of the interface class.
     *
     * @since DOKAN_SINCE
     *
     * @test
     *
     * @return void
     */
    public function test_that_the_mandatory_methods_exists_in_the_class() {
        $class = 'WeDevs\Dokan\Commission\Calculators\FixedCommissionCalculator';

        $this->assertTrue( method_exists( $class, 'calculate' ) );
        $this->assertTrue( method_exists( $class, 'get_admin_commission' ) );
        $this->assertTrue( method_exists( $class, 'get_vendor_earning' ) );
        $this->assertTrue( method_exists( $class, 'get_parameters' ) );
        $this->assertTrue( method_exists( $class, 'get_source' ) );
        $this->assertTrue( method_exists( $class, 'get_per_item_admin_commission' ) );
        $this->assertTrue( method_exists( $class, 'get_items_total_quantity' ) );
        $this->assertTrue( method_exists( $class, 'is_applicable' ) );
    }

    /**
     * Test that category commission is not applicable for empty settings.
     *
     * @since DOKAN_SINCE
     *
     * @test
     *
     * @return void
     */
    public function test_that_commission_is_not_applicable_for_empty_settings() {
        $settings            = new CommissionSettings();
        $category_commission = new FixedCommissionCalculator( $settings );

        $this->assertFalse( $category_commission->is_applicable() );
    }

    /**
     * Fixed commission data provider.
     *
     * @since DOKAN_SINCE
     *
     * @return array[]
     */
    public function fixed_commisssion_data_provider() {
        return [
            [
                [
                    'type'           => 'fixed',
                    'flat'           => 0,
                    'percentage'     => 0,
                    'total_price' => 150,
                    'total_quantity'=> 1,
                ],
                [
                    'is_applicable' => true,
                    'source' => 'fixed',
                    'admin_commission' => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning' => 150,
                    'total_quantity' => 1
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => 10,
                    'percentage'     => null,
                    'total_price' => 150,
                    'total_quantity'=> 1,
                ],
                [
                    'is_applicable' => true,
                    'source' => 'fixed',
                    'admin_commission' => 20,
                    'per_item_admin_commission' => 20,
                    'vendor_earning' => 130,
                    'total_quantity' => 1
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => 10,
                    'percentage'     => null,
                    'total_price' => 150,
                    'total_quantity'=> 1,
                ],
                [
                    'is_applicable' => false,
                    'source' => 'fixed',
                    'admin_commission' => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning' => 0,
                    'total_quantity' => 1
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => 10,
                    'percentage'     => null,
                    'total_price' => 400,
                    'total_quantity'=> 4,
                ],
                [
                    'is_applicable' => true,
                    'source' => 'fixed',
                    'admin_commission' => 80,
                    'per_item_admin_commission' => 20,
                    'vendor_earning' => 320,
                    'total_quantity' => 4,
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => 10,
                    'percentage'     => null,
                    'total_price' => 400,
                    'total_quantity'=> 4,
                ],
                [
                    'is_applicable' => false,
                    'source' => 'fixed',
                    'admin_commission' => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning' => 0,
                    'total_quantity' => 4,
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => null,
                    'percentage'     => null,
                    'total_price' => 400,
                    'total_quantity'=> 4,
                ],
                [
                    'is_applicable' => true,
                    'source' => 'fixed',
                    'admin_commission' => 80,
                    'per_item_admin_commission' => 20,
                    'vendor_earning' => 320,
                    'total_quantity' => 4,
                ],
            ],
        ];
    }

    /**
     * Test category commission for data sets.
     *
     * @since DOKAN_SINCE
     *
     * @test
     *
     * @dataProvider fixed_commisssion_data_provider
     *
     * @param $settings_data
     *
     * @param $expected
     *
     * @return void
     */
    public function test_category_commission_functionality_works_properly_for_different_settings( $settings_data, $expected ) {
        $settings = new CommissionSettings();

        $settings->set_type( $settings_data['type'] )
            ->set_flat( $settings_data['flat'] )
            ->set_percentage( $settings_data['percentage'] );

        $category_commission = new FixedCommissionCalculator( $settings );

        $this->assertEquals( $expected['is_applicable'], $category_commission->is_applicable() );

        $category_commission->calculate( $settings_data['total_price'], $settings_data['total_quantity'] );

        $this->assertEquals( $expected['admin_commission'], $category_commission->get_admin_commission() );
        $this->assertEquals( $expected['vendor_earning'], $category_commission->get_vendor_earning() );
        $this->assertEquals( $expected['source'], $category_commission->get_source() );
        $this->assertEquals( $expected['per_item_admin_commission'], $category_commission->get_per_item_admin_commission() );
        $this->assertEquals( $expected['total_quantity'], $category_commission->get_items_total_quantity() );
    }
}
