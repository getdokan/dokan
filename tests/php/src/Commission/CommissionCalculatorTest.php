<?php

namespace WeDevs\Dokan\Test\Commission;

use WeDevs\Dokan\Commission\Calculator;
use WeDevs\Dokan\Commission\CouponInfo;
use WeDevs\Dokan\Commission\Model\Setting;
use WeDevs\Dokan\Test\DokanTestCase;
/**
 * @group commission
 * @group commission-order
 */
class CommissionCalculatorTest extends DokanTestCase {

    public function test_calculator() {
        $calc = dokan_get_container()->get( Calculator::class );
        $settings = new Setting();
        $settings->set_type( 'flat' );
        $settings->set_percentage( 7.59 );
        $settings->set_flat( 3.62 );

        $coupon_info = new CouponInfo(
            [
				[
					'discount' => 35.2,
					'coupon_commissions_type' => 'from_admin',

				],
			]
        );

        $comm = $calc->set_subtotal( 880 )->set_quantity( 10 )
            ->set_discount( $coupon_info )
            ->set_settings( $settings )
            ->calculate();

        $this->assertEquals( 67.792, $comm->get_admin_commission() );
    }

    public function test_calculate_for_refund() {
        $calculator = dokan_get_container()->get( Calculator::class );

        // Full refund case
        $vendor_earning    = 80.00;
        $admin_commission  = 20.00;
        $item_total        = 100.00;
        $refund_amount     = 100.00;

        $commission = $calculator->calculate_for_refund( $vendor_earning, $admin_commission, $item_total, $refund_amount );

        $this->assertEquals( 80.00, $commission->get_vendor_net_earning() );
        $this->assertEquals( 20.00, $commission->get_admin_net_commission() );

        // Partial refund case
        $refund_amount = 50.00;
        $commission = $calculator->calculate_for_refund( $vendor_earning, $admin_commission, $item_total, $refund_amount );

        $this->assertEquals( 40.00, $commission->get_vendor_net_earning() );
        $this->assertEquals( 10.00, $commission->get_admin_net_commission() );

        // Zero item total
        $commission = $calculator->calculate_for_refund( $vendor_earning, $admin_commission, 0.0, $refund_amount );

        $this->assertEquals( 0.0, $commission->get_vendor_net_earning() );
        $this->assertEquals( 0.0, $commission->get_admin_net_commission() );
    }
}
