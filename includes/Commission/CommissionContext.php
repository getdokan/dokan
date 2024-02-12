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

    public function calculate_commission( float $price ): array {
        foreach ( $this->strategies as $strategy ) {
            $calculator = $strategy->get_commission_calculator();
            if ( $calculator !== null ) {
                return [
                    'source'     => $strategy->get_source(),
                    'amount'     => $calculator->calculate( $price ),
                    'type'       => $calculator->get_source(),
                    'parameters' => $calculator->get_parameters(),
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
