<?php

namespace WeDevs\Dokan\Commission\Calculation;

class CommissionCalculation {

    private $commission_type;
    private $admin_commission_percentage;
    private $admin_commission_flat;
    private $order;

    /**
     * @param $commission_type
     * @param $admin_commission_percentage
     * @param $admin_commission_flat
     * @param $order
     */
    public function __construct( $commission_type, $admin_commission_percentage, $admin_commission_flat, $order ) {
        $this->commission_type             = $commission_type;
        $this->admin_commission_percentage = $admin_commission_percentage;
        $this->admin_commission_flat       = $admin_commission_flat;
        $this->order                       = $order;
    }


}
