<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Calculators\CommissionCalculatorInterface;
use WeDevs\Dokan\Commission\CommissionCalculatorFactory;
use WeDevs\Dokan\Commission\Utils\CommissionSettings;

abstract class AbstractCommissionSourceStrategy {
    abstract public function get_source(): string;
    abstract public function get_settings(): CommissionSettings;

    public function get_commission_calculator(  ): ?CommissionCalculatorInterface {
        $settings = $this->get_settings();

        $commission_calculator = CommissionCalculatorFactory::createCalculator( $settings );

        if ( $commission_calculator && $commission_calculator->is_applicable() ) {
            return $commission_calculator;
        }

        return null;
    }
}
