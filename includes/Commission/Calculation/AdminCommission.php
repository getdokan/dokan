<?php

namespace WeDevs\Dokan\Commission\Calculation;

class AdminCommission {

    private $order_amount;
    private $commission_percentage;
    private $order_discount;
    private $discount_provider;
    private $gateway_fee;
    private $gateway_fee_provider;
    private $admin_commission;
    private $vendor_earning;
    private $admin_max;
    private $vendor_max;

    public function __construct(
        $order_amount,
        $commission_percentage,
        $order_discount,
        $discount_provider,
        $gateway_fee,
        $gateway_fee_provider
	) {
		$this->order_amount = $order_amount;
		$this->commission_percentage = $commission_percentage;
		$this->order_discount = $order_discount;
		$this->discount_provider = $discount_provider;
		$this->gateway_fee = $gateway_fee;
		$this->gateway_fee_provider = $gateway_fee_provider;

        $this->set_max_amount( $this->order_amount, $commission_percentage );
        $this->calculation();
    }

    public function set_max_amount( $order_amount, $commission_percentage ) {
        $this->admin_max = $order_amount * $commission_percentage / 100;
        $this->vendor_max = $order_amount - $this->admin_max;
    }

    public function discount_provider_admin() {
        $this->admin_commission = $this->order_amount * $this->commission_percentage / 100 - $this->order_discount;
    }

    public function discount_provider_vendor() {
        $this->admin_commission = ( $this->order_amount - $this->order_discount ) * $this->commission_percentage / 100;
    }

    public function discount_provider_shared() {
        $this->admin_commission = ( ( $this->order_amount - ( $this->order_discount / 2 ) ) * $this->commission_percentage / 100 ) - ( $this->order_discount / 2 );
    }

    private function gateway_provider_admin() {
        $this->admin_commission -= $this->gateway_fee;
    }

    private function gateway_provider_vendor() {
    }

    public function calculation() {
        $discount_provider = 'discount_provider_' . $this->discount_provider;
        $gateway_fee_provider = 'gateway_provider_' . $this->gateway_fee_provider;

        call_user_func_array( [ $this, $discount_provider ], [] );
        call_user_func_array( [ $this, $gateway_fee_provider ], [] );
    }

    public function result() {
        return $this->admin_commission;
    }
}
