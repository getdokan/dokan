<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Calculators\CommissionCalculatorInterface;
use WeDevs\Dokan\Commission\CommissionCalculatorFactory;
use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class GlobalCommissionSourceStrategy extends AbstractCommissionSourceStrategy {

    const SOURCE = 'global';
    /**
     * @var mixed
     */
    private $category_id;

    public function __construct( $category_id ) {
        $this->category_id = $category_id;
    }

    /**
     * @return mixed
     */
    public function get_category_id() {
        return $this->category_id;
    }

    public function get_source(): string {
        return self::SOURCE;
    }

    public function get_settings(): CommissionSettings {
        $percentage = dokan_get_option( 'admin_percentage', 'dokan_selling', '' );
        $type       = dokan_get_option( 'commission_type', 'dokan_selling', '' );
        $flat       = dokan_get_option( 'additional_fee', 'dokan_selling', '' );
        $category_commissions   = dokan_get_option( 'commission_category_based_values', 'dokan_selling', [] );

        return new CommissionSettings( $type, $flat, $percentage, $category_commissions, $this->get_category_id() );
    }
}
