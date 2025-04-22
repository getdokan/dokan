<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\AbstractCommissionCalculator;
use WeDevs\Dokan\Commission\Model\Commission;
use WeDevs\Dokan\Commission\Model\Setting;

class Calculator extends AbstractCommissionCalculator {

    protected float $subtotal = 0.0;
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
	 * @inheritDoc
	 */
	public function calculate(): Commission {
        $net_amount_with_admin_discount = $this->subtotal - $this->get_discount()->get_vendor_discount();
        $admin_commission = ( $net_amount_with_admin_discount * $this->settings->get_percentage() / 100 ) + $this->settings->get_flat() * $this->quantity + $this->settings->get_combine_flat() - $this->get_discount()->get_admin_discount();

        $net_amount = $this->subtotal - $this->get_discount()->get_total_discount();
        $vendor_earning = $net_amount - $admin_commission;

        $commission = new Commission();
        $commission->set_net_admin_commission( $admin_commission );
        $commission->set_vendor_discount( $this->get_discount()->get_vendor_discount() );
        $commission->set_vendor_earning( $vendor_earning );
        $commission->set_admin_discount( $this->get_discount()->get_admin_discount() );

        return $commission;
	}

	/**
	 * @inheritDoc
	 */
	public function get(): Commission {
		return $this->calculate();
	}
}
