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

    public function calculate_commission( float $price, $quantity = 1 ): array {
        if ( ! is_numeric( $quantity ) || $quantity < 1 ) {
            $quantity = 1;
        }

        foreach ( $this->strategies as $strategy ) {
            $calculator = $strategy->get_commission_calculator();
            if ( $calculator !== null ) {
                $calculator->calculate( $price, $quantity );

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

        // If no commission is defined at any level, default to 0
        return [
            'source'     => 'none',
            'amount'     => 0,
            'type'       => 'none', // TODO: commission-restructure need to re-consider this default type.
            'parameters' => [],
        ];
    }
}
