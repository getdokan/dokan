<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\Calculators\CombineCommissionCalculator;
use WeDevs\Dokan\Commission\Calculators\FlatCommissionCalculator;
use WeDevs\Dokan\Commission\Calculators\PercentageCommissionCalculator;
use WeDevs\Dokan\Commission\Utils\CommissionSettings;
use WeDevs\Dokan\Commission\Calculators\FixedCommissionCalculator;
use WeDevs\Dokan\Commission\Calculators\CategoryBasedCommissionCalculator;
use WeDevs\Dokan\Commission\Calculators\CommissionCalculatorInterface;

class CommissionCalculatorFactory {
    public static function createCalculator( CommissionSettings $settings ): ?CommissionCalculatorInterface {
        switch ( $settings->get_type() ) {
            case 'flat':
                // In Dokan before DOKAN_SINCE version if the commission type was flat the flat value used to be saved in the percentage key, that is why we are passing the percentage value.
                return new FlatCommissionCalculator( $settings );
            case 'percentage':
                return new PercentageCommissionCalculator( $settings );
            case 'combine': // Assuming 'combine' implies a combination of flat + percentage
                return new CombineCommissionCalculator( $settings );
            case 'fixed':
                return new FixedCommissionCalculator( $settings );
            case 'category_based':
                return new CategoryBasedCommissionCalculator( $settings );
        }

        return null;
    }
}
