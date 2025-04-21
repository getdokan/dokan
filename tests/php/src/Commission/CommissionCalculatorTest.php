<?php

namespace WeDevs\Dokan\Test\Commission;

use WeDevs\Dokan\Commission\Calculator;
use WeDevs\Dokan\Commission\CouponInfo;
use WeDevs\Dokan\Commission\Model\Setting;
use WeDevs\Dokan\Test\DokanTestCase;

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
					'coupon_commissions_type' => 'admin',

				],
			]
        );

        $comm = $calc->set_subtotal( 880 )->set_quantity( 10 )
            ->set_discount( $coupon_info )
            ->set_settings( $settings )
            ->calculate();

        $this->assertEquals( 67.792, $comm->get_admin_commission() );
    }
}
