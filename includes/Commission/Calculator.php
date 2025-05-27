<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\AbstractCommissionCalculator;
use WeDevs\Dokan\Commission\Model\Commission;
use WeDevs\Dokan\Commission\Model\Setting;

class Calculator extends AbstractCommissionCalculator {

    protected float $subtotal = 0.0;
    protected float $total = 0.0;
    protected int $quantity = 0;
    protected Setting $settings;
    protected ?CouponInfo $discount;

    /**
     * @return float
     */
    public function get_subtotal(): float {
        return $this->subtotal;
    }

    /**
     * @param float $subtotal
     *
     * @return Calculator
     */
    public function set_subtotal( float $subtotal ): Calculator {
        $this->subtotal = $subtotal;

        return $this;
    }


    /**
     * @return float
     */
    public function get_total(): float {
        return $this->total;
    }

    /**
     * @param float $total
     *
     * @return Calculator
     */
    public function set_total( float $total ): Calculator {
        $this->total = $total;

        return $this;
    }

    /**
     * @return int
     */
    public function get_quantity(): int {
        return $this->quantity;
    }

    /**
     * @param int $quantity
     *
     * @return Calculator
     */
    public function set_quantity( int $quantity ): Calculator {
        $this->quantity = $quantity;

        return $this;
    }

    /**
     * @return Setting
     */
    public function get_settings(): Setting {
        return $this->settings;
    }

    /**
     * @param Setting $settings
     *
     * @return Calculator
     */
    public function set_settings( Setting $settings ): Calculator {
        $this->settings = $settings;

        return $this;
    }

    /**
     * @return mixed
     */
    public function get_discount(): CouponInfo {
        return $this->discount ?? new CouponInfo( [] );
    }

    /**
     * @param CouponInfo $discount
     *
     * @return Calculator
     */
    public function set_discount( CouponInfo $discount ): Calculator {
        $this->discount = $discount;

        return $this;
    }

    /**
     * Calculates the commission based on discounts and settings.
     *
     * @return Commission
     */
    public function calculate(): Commission {
        $raw_admin_commission = $this->calculate_raw_admin_commission();

        $net_amount       = $this->get_total();
        $admin_commission = min( $raw_admin_commission, $net_amount );

        $vendor_earning = $net_amount - $admin_commission;

        return $this->create_commission(
            $admin_commission,
            $vendor_earning,
        );
    }


    /**
     * Calculates the raw admin commission before capping.
     *
     * @param float $net_amount_with_admin_discount Amount after vendor discount.
     * @param float $vendor_discount Discount given by vendor.
     * @param float $admin_discount Discount given by admin.
     * @return float
     */
    private function calculate_raw_admin_commission(): float {
        $admin_discount = $this->get_discount()->get_admin_discount();

        $net_amount_with_admin_discount = $this->get_total() + $admin_discount;

        $percentage_commission = ( $net_amount_with_admin_discount * $this->settings->get_percentage_value() ) / 100;
        $flat_commission       = $this->settings->get_flat_value() * $this->quantity;
        $combine_flat          = $this->settings->get_combine_flat();

        return $percentage_commission + $flat_commission + $combine_flat - $admin_discount;
    }

    /**
     * Creates the commission object with all related values.
     *
     * @param float $admin_commission Final admin commission.
     * @param float $vendor_discount Vendor's discount.
     * @param float $vendor_earning Vendor's earning.
     * @param float $admin_discount Admin's discount.
     * @return Commission
     */
    private function create_commission(
        float $admin_commission,
        float $vendor_earning
    ): Commission {
        $commission = new Commission();
        $commission->set_admin_net_commission( $admin_commission );
        $commission->set_vendor_discount( $this->get_discount()->get_vendor_discount() );
        $commission->set_vendor_net_earning( $vendor_earning );
        $commission->set_admin_discount( $this->get_discount()->get_admin_discount() );
        $commission->set_settings( $this->settings );

        return $commission;
    }

	/**
	 * @inheritDoc
	 */
	public function get(): Commission {
		return $this->calculate();
	}

    /**
     * Calculate vendor and admin earnings after a refund.
     *
     * @param float $vendor_earning    Original vendor earning.
     * @param float $admin_commission  Original admin commission.
     * @param float $item_total        Original item total (excluding tax/shipping).
     * @param float $refund_amount     Refunded amount for the item.
     *
     * @return Commission
     */
    public function calculate_for_refund( float $vendor_earning, float $admin_commission, float $item_total, float $refund_amount ): Commission {
        $commission = new Commission();

		if ( $item_total === floatval( 0 ) ) {
			$commission->set_admin_net_commission( 0 );
            $commission->set_vendor_net_earning( 0 );

            return $commission;
		}

        $refund_amount = abs( $refund_amount );

		$vendor_earning_for_refund   = ( $vendor_earning / $item_total ) * $refund_amount;
		$admin_commission_for_refund = ( $admin_commission / $item_total ) * $refund_amount;

        $commission->set_vendor_net_earning( $vendor_earning_for_refund );
        $commission->set_admin_net_commission( $admin_commission_for_refund );

        return $commission;
	}
}
