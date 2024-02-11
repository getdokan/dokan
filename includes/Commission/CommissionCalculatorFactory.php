<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;
use WeDevs\Dokan\Commission\Calculators\FixedCommissionCalculator;
use WeDevs\Dokan\Commission\Calculators\CategoryBasedCommissionCalculator;
use WeDevs\Dokan\Commission\Calculators\CommissionCalculatorInterface;

class CommissionCalculatorFactory {
    public static function createCalculator( CommissionSettings $settings, $category_id ): ?CommissionCalculatorInterface {
        switch ( $settings->get_type() ) {
            case 'fixed':
            case 'flat':
            case 'percentage':
            case 'combine': // Assuming 'combine' implies a combination of flat + percentage
                return new FixedCommissionCalculator( $settings->get_type(), $settings->get_flat(), $settings->get_percentage() );
            case 'category_based':
                return new CategoryBasedCommissionCalculator( $settings->get_type(), $category_id, $settings->get_category_commission() ?? [] );
        }

        return null;
    }
}
