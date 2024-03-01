<?php

namespace Commission;

use WeDevs\Dokan\Commission\Calculators\FixedCommissionCalculator;
use WeDevs\Dokan\Commission\Strategies\GlobalCommissionSourceStrategy;
use WeDevs\Dokan\Commission\Utils\CommissionData;
use WP_UnitTestCase;

class CommissionDataTest extends WP_UnitTestCase {

    /**
     * Test if commission data class has all the required methods.
     *
     * @since DOKAN_SINCE
     *
     * @test
     *
     * @return void
     */
    public function test_that_commission_data_class_has_all_the_required_methods() {
        $data = new CommissionData();

        $this->assertTrue( method_exists( $data, 'get_source' ) );
        $this->assertTrue( method_exists( $data, 'set_source' ) );
        $this->assertTrue( method_exists( $data, 'get_per_item_admin_commission' ) );
        $this->assertTrue( method_exists( $data, 'set_per_item_admin_commission' ) );
        $this->assertTrue( method_exists( $data, 'get_admin_commission' ) );
        $this->assertTrue( method_exists( $data, 'set_admin_commission' ) );
        $this->assertTrue( method_exists( $data, 'get_vendor_earning' ) );
        $this->assertTrue( method_exists( $data, 'set_vendor_earning' ) );
        $this->assertTrue( method_exists( $data, 'get_total_quantity' ) );
        $this->assertTrue( method_exists( $data, 'set_total_quantity' ) );
        $this->assertTrue( method_exists( $data, 'get_total_amount' ) );
        $this->assertTrue( method_exists( $data, 'set_total_amount' ) );
        $this->assertTrue( method_exists( $data, 'get_type' ) );
        $this->assertTrue( method_exists( $data, 'set_type' ) );
        $this->assertTrue( method_exists( $data, 'get_parameters' ) );
        $this->assertTrue( method_exists( $data, 'set_parameters' ) );
        $this->assertTrue( method_exists( $data, 'get_data' ) );
    }

    /**
     * Test that we can get and set commission data.
     *
     * @test
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function test_that_we_can_set_and_get_commission_data() {
        $data = new CommissionData();

        $this->assertEquals( 'none', $data->get_source() );
        $this->assertEquals( 0, $data->get_per_item_admin_commission() );
        $this->assertEquals( 0, $data->get_admin_commission() );
        $this->assertEquals( 0, $data->get_vendor_earning() );
        $this->assertEquals( 1, $data->get_total_quantity() );
        $this->assertEquals( 0, $data->get_total_amount() );
        $this->assertEquals( 'none', $data->get_type() );
        $this->assertEquals( [], $data->get_parameters() );
        $this->assertEquals(
            [
            'source'                    => 'none',
            'per_item_admin_commission' => 0,
            'admin_commission'          => 0,
            'vendor_earning'            => 0,
            'total_quantity'            => 1,
            'total_amount'              => '0',
            'type'                      => 'none',
            'parameters'                => [],
            ],
            $data->get_data()
        );

        $data->set_type( FixedCommissionCalculator::SOURCE )
            ->set_admin_commission( 10 )
            ->set_vendor_earning( 100 )
            ->set_per_item_admin_commission( 10 )
            ->set_parameters( [ 'flat' => 10, 'percentage' => 0 ] )
            ->set_total_amount( 100 )
            ->set_total_quantity(1)
            ->set_source( GlobalCommissionSourceStrategy::SOURCE );


        $this->assertEquals( GlobalCommissionSourceStrategy::SOURCE, $data->get_source() );
        $this->assertEquals( 10, $data->get_per_item_admin_commission() );
        $this->assertEquals( 10, $data->get_admin_commission() );
        $this->assertEquals( 100, $data->get_vendor_earning() );
        $this->assertEquals( 1, $data->get_total_quantity() );
        $this->assertEquals( 100, $data->get_total_amount() );
        $this->assertEquals( FixedCommissionCalculator::SOURCE, $data->get_type() );
        $this->assertEquals( [ 'flat' => 10, 'percentage' => 0 ], $data->get_parameters() );
        $this->assertEquals(
            [
                'source'                    => GlobalCommissionSourceStrategy::SOURCE,
                'per_item_admin_commission' => 10,
                'admin_commission'          => 10,
                'vendor_earning'            => 100,
                'total_quantity'            => 1,
                'total_amount'              => '100',
                'type'                      => FixedCommissionCalculator::SOURCE,
                'parameters'                => [ 'flat' => 10, 'percentage' => 0 ],
            ],
            $data->get_data()
        );
    }
}
