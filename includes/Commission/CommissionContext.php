<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\Strategies\CommissionSourceStrategyInterface;

class CommissionContext {

    /**
     * @var CommissionSourceStrategyInterface[]
     */
    private array $strategies;

    /**
     * @param CommissionSourceStrategyInterface[] $strategies
     */
    public function __construct( array $strategies ) {
        $this->strategies = $strategies;
    }

    public function calculate_commission( float $price ): array {
        foreach ( $this->strategies as $strategy ) {
            $calculator = $strategy->get_commission_calculator();
            if ( $calculator !== null ) {
                return [
                    'source'               => $strategy->get_source(),
                    'commissionAmount'     => $calculator->calculate( $price ),
                    'commissionType'       => $calculator->get_source(),
                    'commissionParameters' => $calculator->get_parameters(),
                ];
            }
        }

        // If no commission is defined at any level, default to 0
        return [
            'source'               => 'none',
            'commissionAmount'     => 0,
            'commissionType'       => 'none',
            'commissionParameters' => [],
        ];
    }
}
