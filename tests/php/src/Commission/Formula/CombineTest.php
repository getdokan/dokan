<?php

namespace WeDevs\Dokan\Test\Commission\Calculator;

use WeDevs\Dokan\Commission\Formula\Combine;
use WeDevs\Dokan\Commission\Model\Setting;
use WP_UnitTestCase;

class CombineTest extends WP_UnitTestCase {

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
        $class = 'WeDevs\Dokan\Commission\Formula\Combine';

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
     * Test that combine commission is not applicable for empty settings.
     *
     * @since DOKAN_SINCE
     *
     * @test
     *
     * @return void
     */
    public function test_that_commission_is_not_applicable_for_empty_settings() {
        $settings         = new Setting();
        $fixed_commission = new Combine( $settings );

        $this->assertFalse( $fixed_commission->is_applicable() );
    }

    /**
     * Combine commission data provider.
     *
     * @since DOKAN_SINCE
     *
     * @return array[]
     */
    public function fixed_commisssion_data_provider() {
        return [
            [
                [
                    'type'           => 'combine',
                    'flat'           => 0,
                    'percentage'     => 0,
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
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => 10,
                    'percentage'     => null,
                    'total_price'    => 300,
                    'total_quantity' => 2,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'combine',
                    'admin_commission'          => 10,
                    'per_item_admin_commission' => 5,
                    'vendor_earning'            => 290,
                    'total_quantity'            => 2,
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => '---',
                    'percentage'     => null,
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => false,
                    'source'                    => 'combine',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 150,
                    'total_quantity'            => 1,
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => 10,
                    'percentage'     => 10,
                    'total_price'    => 400,
                    'total_quantity' => 4,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'combine',
                    'admin_commission'          => 50,
                    'per_item_admin_commission' => 12.5,
                    'vendor_earning'            => 350,
                    'total_quantity'            => 4,
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => '--',
                    'percentage'     => 30,
                    'total_price'    => 120,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'combine',
                    'admin_commission'          => 36,
                    'per_item_admin_commission' => 36,
                    'vendor_earning'            => 84,
                    'total_quantity'            => 1,
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => '5',
                    'percentage'     => 30,
                    'total_price'    => 120,
                    'total_quantity' => 3,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'combine',
                    'admin_commission'          => 41,
                    'per_item_admin_commission' => 13.67,
                    'vendor_earning'            => 79,
                    'total_quantity'            => 3,
                ],
            ],
        ];
    }

    /**
     * Test combine commission for data sets.
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

        $fixed_commission = new Combine( $settings );

        $this->assertEquals( $expected['is_applicable'], $fixed_commission->is_applicable() );

        $fixed_commission->set_amount( $settings_data['total_price'] )
            ->set_quantity( $settings_data['total_quantity'] )
            ->calculate();

        $this->assertEquals( $expected['admin_commission'], $fixed_commission->get_admin_commission() );
        $this->assertEquals( $expected['vendor_earning'], $fixed_commission->get_vendor_earning() );
        $this->assertEquals( $expected['source'], $fixed_commission->get_source() );
        $this->assertEquals( wc_format_decimal( $expected['per_item_admin_commission'], 2 ), wc_format_decimal( $fixed_commission->get_per_item_admin_commission(), 2 ) );
        $this->assertEquals( $expected['total_quantity'], $fixed_commission->get_items_total_quantity() );
    }
}
