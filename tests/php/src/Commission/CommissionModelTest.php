<?php

namespace WeDevs\Dokan\Test\Commission;

use WeDevs\Dokan\Commission\Settings\DefaultSetting;
use WeDevs\Dokan\Commission\Model\Commission;
use WP_UnitTestCase;


/**
 * @group commission
 *
 * @group commission-model
 */
class CommissionModelTest extends WP_UnitTestCase {

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
        $data = new Commission();

        $this->assertTrue( method_exists( $data, 'set_settings' ) );
        $this->assertTrue( method_exists( $data, 'get_settings' ) );
        $this->assertTrue( method_exists( $data, 'set_admin_net_commission' ) );
        $this->assertTrue( method_exists( $data, 'get_admin_net_commission' ) );
        $this->assertTrue( method_exists( $data, 'set_vendor_net_earning' ) );
        $this->assertTrue( method_exists( $data, 'get_vendor_net_earning' ) );
        $this->assertTrue( method_exists( $data, 'set_admin_discount' ) );
        $this->assertTrue( method_exists( $data, 'get_admin_discount' ) );
        $this->assertTrue( method_exists( $data, 'set_vendor_discount' ) );
        $this->assertTrue( method_exists( $data, 'get_vendor_discount' ) );
        $this->assertTrue( method_exists( $data, 'get_admin_commission' ) );
        $this->assertTrue( method_exists( $data, 'get_vendor_earning' ) );
        $this->assertTrue( method_exists( $data, 'get_admin_subsidy' ) );
        $this->assertTrue( method_exists( $data, 'get_type' ) );
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
        $data = new Commission();
        $data->set_settings( ( new DefaultSetting() )->get() );

        $this->assertEquals( 0, $data->get_admin_commission() );
        $this->assertEquals( 0, $data->get_vendor_earning() );
        $this->assertEquals( DefaultSetting::TYPE, $data->get_type() );
        $this->assertEquals( 0, $data->get_admin_subsidy() );
        $this->assertEquals( 0, $data->get_vendor_discount() );
        $this->assertEquals( 0, $data->get_admin_discount() );

        $data->set_admin_net_commission( 10 )
            ->set_vendor_net_earning( 100 )
            ->set_admin_discount( 5 )
            ->set_vendor_discount( 2 );

        $this->assertEquals( 10, $data->get_admin_net_commission() );
        $this->assertEquals( 10, $data->get_admin_commission() );
        $this->assertEquals( 100, $data->get_vendor_net_earning() );
        $this->assertEquals( 100, $data->get_vendor_earning() );
        $this->assertEquals( 5, $data->get_admin_discount() );
        $this->assertEquals( 2, $data->get_vendor_discount() );

        $this->assertEquals( 0, $data->get_admin_subsidy() );

        $data->set_admin_net_commission( -7 );
        $this->assertEquals( 0, $data->get_admin_commission() );
        $this->assertEquals( 7, $data->get_admin_subsidy() );
    }
}
