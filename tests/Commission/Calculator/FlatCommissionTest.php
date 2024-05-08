<?php

namespace WeDevs\Dokan\Test\Commission\Calculator;

use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Model\Setting;
use WP_UnitTestCase;

class FlatCommissionTest extends WP_UnitTestCase {

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
        $class = 'WeDevs\Dokan\Commission\Formula\Flat';

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
     * Test that flat commission is not applicable for empty settings.
     *
     * @since DOKAN_SINCE
     *
     * @test
     *
     * @return void
     */
    public function test_that_commission_is_not_applicable_for_empty_settings() {
        $settings        = new Setting();
        $flat_commission = new Flat( $settings );

        $this->assertFalse( $flat_commission->is_applicable() );
    }

    /**
     * Flat commission data provider.
     *
     * @since DOKAN_SINCE
     *
     * @return array[]
     */
    public function flat_commisssion_data_provider() {
        return [
            [
                [
                    'type'           => 'flat',
                    'flat'           => 0,
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'flat',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 150,
                    'total_quantity'            => 1,
                ],
            ],
            [
                [
                    'type'           => 'flat',
                    'flat'           => 10,
                    'total_price'    => 300,
                    'total_quantity' => 3,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'flat',
                    'admin_commission'          => 30,
                    'per_item_admin_commission' => 10,
                    'vendor_earning'            => 270,
                    'total_quantity'            => 3,
                ],
            ],
            [
                [
                    'type'           => 'flat',
                    'flat'           => '---',
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => false,
                    'source'                    => 'flat',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 150,
                    'total_quantity'            => 1,
                ],
            ],
            [
                [
                    'type'           => 'flat',
                    'flat'           => null,
                    'total_price'    => 120,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => false,
                    'source'                    => 'flat',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 120,
                    'total_quantity'            => 1,
                ],
            ],
            [
                [
                    'type'           => 'flat',
                    'flat'           => '',
                    'total_price'    => 120,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => false,
                    'source'                    => 'flat',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 120,
                    'total_quantity'            => 1,
                ],
            ],
        ];
    }

    /**
     * Test flat commission for data sets.
     *
     * @since        DOKAN_SINCE
     *
     * @test
     *
     * @dataProvider flat_commisssion_data_provider
     *
     * @param $settings_data
     *
     * @param $expected
     *
     * @return void
     */
    public function test_flat_commission_functionality_works_properly_for_different_settings( $settings_data, $expected ) {
        $settings = new Setting();

        $settings->set_type( $settings_data['type'] )
                 ->set_flat( $settings_data['flat'] );

        $flat_commission = new Flat( $settings );

        $this->assertEquals( $expected['is_applicable'], $flat_commission->is_applicable() );

        $flat_commission->calculate( $settings_data['total_price'], $settings_data['total_quantity'] );

        $this->assertEquals( $expected['admin_commission'], $flat_commission->get_admin_commission() );
        $this->assertEquals( $expected['vendor_earning'], $flat_commission->get_vendor_earning() );
        $this->assertEquals( $expected['source'], $flat_commission->get_source() );
        $this->assertEquals( $expected['per_item_admin_commission'], $flat_commission->get_per_item_admin_commission() );
        $this->assertEquals( $expected['total_quantity'], $flat_commission->get_items_total_quantity() );
    }
}
