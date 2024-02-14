<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\Strategies\AbstractCommissionSourceStrategy;

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

    public function calculate_commission( $total_amount, $total_quantity = 1 ): array {
        if ( ! is_numeric( $total_quantity ) || $total_quantity < 1 ) {
            $total_quantity = 1;
        }

        foreach ( $this->strategies as $strategy ) {
            $calculator = $strategy->get_commission_calculator();
            if ( $calculator !== null ) {
                $calculator->calculate( $total_amount, $total_quantity );

                return [
                    'source'                    => $strategy->get_source(),
                    'per_item_admin_commission' => $calculator->get_per_item_admin_commission(),
                    'admin_commission'          => $calculator->get_admin_commission(),
                    'vendor_earning'            => $calculator->get_vendor_earning(),
                    'items_total_quantity'      => $calculator->get_items_total_quantity(),
                    'type'                      => $calculator->get_source(),
                    'parameters'                => $calculator->get_parameters(),
                ];
            }
        }

        // If no commission is defined at any level.
        return [
            'source'                    => 'none',
            'per_item_admin_commission' => '',
            'admin_commission'          => 0,
            'vendor_earning'            => 0,
            'items_total_quantity'      => 1,
            'type'                      => 'none',
            'parameters'                => [],
        ];
    }
}
