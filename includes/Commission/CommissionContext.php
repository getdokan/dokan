<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\Strategies\AbstractCommissionSourceStrategy;
use WeDevs\Dokan\Commission\Utils\CommissionData;

class CommissionContext {

    /**
     * @var AbstractCommissionSourceStrategy[]
     */
    private array $strategies;

    /**
     * @param AbstractCommissionSourceStrategy[] $strategies
     */
    public function __construct( array $strategies ) {
        $this->strategies = $strategies;
    }

    public function calculate_commission( $total_amount, $total_quantity = 1 ): CommissionData {
        if ( ! is_numeric( $total_quantity ) || $total_quantity < 1 ) {
            $total_quantity = 1;
        }

        if ( ! is_numeric( $total_amount ) ) {
            $total_quantity = 0;
        }

        $commission_data = new CommissionData();
        $commission_data->set_vendor_earning( $total_amount )
            ->set_total_quantity( $total_quantity )
            ->set_total_amount( $total_amount );

        foreach ( $this->strategies as $strategy ) {
            $calculator = $strategy->get_commission_calculator();
            if ( $calculator !== null ) {
                $calculator->calculate( $total_amount, $total_quantity );

                $commission_data->set_source( $strategy->get_source() )
                    ->set_per_item_admin_commission( $calculator->get_per_item_admin_commission() )
                    ->set_admin_commission( $calculator->get_admin_commission() )
                    ->set_vendor_earning( $calculator->get_vendor_earning() )
                    ->set_total_quantity( $calculator->get_items_total_quantity() )
                    ->set_total_amount( $total_amount )
                    ->set_type( $calculator->get_source() )
                    ->set_parameters( $calculator->get_parameters() );

                return $commission_data;
            }
        }

        // If no commission is defined at any level.
        return $commission_data;
    }
}
