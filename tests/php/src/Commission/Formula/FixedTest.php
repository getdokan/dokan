<?php

namespace WeDevs\Dokan\Test\Commission\Calculator;

use WeDevs\Dokan\Commission\Formula\Fixed;
use WeDevs\Dokan\Commission\Model\Setting;
use WP_UnitTestCase;

class FixedTest extends WP_UnitTestCase {

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
        $class = 'WeDevs\Dokan\Commission\Formula\Fixed';

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
     * Test that fixed commission is not applicable for empty settings.
     *
     * @since DOKAN_SINCE
     *
     * @test
     *
     * @return void
     */
    public function test_that_commission_is_not_applicable_for_empty_settings() {
        $settings         = new Setting();
        $fixed_commission = new Fixed( $settings );

        $this->assertFalse( $fixed_commission->is_applicable() );
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
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => 10,
                    'percentage'     => null,
                    'total_price'    => 300,
                    'total_quantity' => 2,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'fixed',
                    'admin_commission'          => 20,
                    'per_item_admin_commission' => 10,
                    'vendor_earning'            => 280,
                    'total_quantity'            => 2,
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => '---',
                    'percentage'     => null,
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => false,
                    'source'                    => 'fixed',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 150,
                    'total_quantity'            => 1,
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => 10,
                    'percentage'     => 10,
                    'total_price'    => 400,
                    'total_quantity' => 4,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'fixed',
                    'admin_commission'          => 80,
                    'per_item_admin_commission' => 20,
                    'vendor_earning'            => 320,
                    'total_quantity'            => 4,
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => '--',
                    'percentage'     => 30,
                    'total_price'    => 120,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'fixed',
                    'admin_commission'          => 36,
                    'per_item_admin_commission' => 36,
                    'vendor_earning'            => 84,
                    'total_quantity'            => 1,
                ],
            ],
        ];
    }

    /**
     * Test fixed commission for data sets.
     *
     * @since        DOKAN_SINCE
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
    public function test_fixed_commission_functionality_works_properly_for_different_settings( $settings_data, $expected ) {
        $settings = new Setting();

        $settings->set_type( $settings_data['type'] )
                 ->set_flat( $settings_data['flat'] )
                 ->set_percentage( $settings_data['percentage'] );

        $fixed_commission = new Fixed( $settings );

        $this->assertEquals( $expected['is_applicable'], $fixed_commission->is_applicable() );

        $fixed_commission->set_amount( $settings_data['total_price'] )
            ->set_quantity( $settings_data['total_quantity'] )
            ->calculate();

        $this->assertEquals( $expected['admin_commission'], $fixed_commission->get_admin_commission() );
        $this->assertEquals( $expected['vendor_earning'], $fixed_commission->get_vendor_earning() );
        $this->assertEquals( $expected['source'], $fixed_commission->get_source() );
        $this->assertEquals( $expected['per_item_admin_commission'], $fixed_commission->get_per_item_admin_commission() );
        $this->assertEquals( $expected['total_quantity'], $fixed_commission->get_items_total_quantity() );
    }
}
