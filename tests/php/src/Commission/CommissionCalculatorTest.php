<?php

namespace WeDevs\Dokan\Test\Commission;

use WeDevs\Dokan\Commission\Calculator;
use WeDevs\Dokan\Commission\CouponInfo;
use WeDevs\Dokan\Commission\Model\Setting;
use WeDevs\Dokan\Test\DokanTestCase;
/**
 * @group commission
 *
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

        $comm = $calc->set_total( 880 - 35.2 )
            ->set_quantity( 10 )
            ->set_discount( $coupon_info )
            ->set_settings( $settings )
            ->calculate();

        // 67.792 before the commission split was rounded to the currency's precision.
        $this->assertEquals( 67.79, $comm->get_admin_commission() );
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

    /**
     * The two shares must always add back up to the amount the customer paid.
     *
     * 6.45 at 30% is 1.935 — exactly half a cent. Rounding each share on its own
     * sends 1.93 to the admin and 4.51 to the vendor, and the remaining cent is
     * credited to nobody.
     *
     * @dataProvider half_cent_split_provider
     */
    public function test_admin_and_vendor_shares_sum_to_the_total( $total, $percentage, $expected_admin, $expected_vendor ) {
        $settings = new Setting();
        $settings->set_type( 'percentage' );
        $settings->set_percentage( $percentage );
        $settings->set_flat( 0 );

        $commission = dokan_get_container()->get( Calculator::class )
            ->set_total( $total )
            ->set_quantity( 1 )
            ->set_discount( new CouponInfo( [] ) )
            ->set_settings( $settings )
            ->calculate();

        $admin  = $commission->get_admin_net_commission();
        $vendor = $commission->get_vendor_net_earning();

        // The vendor's share is the exact remainder rather than a second rounded
        // figure, so it carries the usual float noise (0.15 - 0.08 is 0.0699...).
        // Every path that shows or stores it rounds, so compare at that precision.
        $this->assertEqualsWithDelta( $expected_admin, $admin, 0.0001 );
        $this->assertEqualsWithDelta( $expected_vendor, $vendor, 0.0001 );
        $this->assertEquals( $total, round( $admin + $vendor, 2 ) );
    }

    public function half_cent_split_provider() {
        return [
            'issue 5937 reproduction' => [ 6.45, 30, 1.94, 4.51 ],
            'half cent rounds up'     => [ 0.15, 50, 0.08, 0.07 ],
            'no rounding needed'      => [ 100.00, 25, 25.00, 75.00 ],
            'admin takes everything'  => [ 6.45, 100, 6.45, 0.00 ],
        ];
    }

    /**
     * A refunded amount must split without losing a cent either, and the
     * proration in calculate_for_refund() is a prime source of long tails.
     */
    public function test_refund_shares_sum_to_the_refunded_amount() {
        $commission = dokan_get_container()->get( Calculator::class )
            ->calculate_for_refund( 4.51, 1.94, 6.45, 6.45 );

        $this->assertEquals(
            6.45,
            round( $commission->get_vendor_net_earning() + $commission->get_admin_net_commission(), 2 )
        );
    }
}
