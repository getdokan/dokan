<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Calculators\CommissionCalculatorInterface;
use WeDevs\Dokan\Commission\CommissionCalculatorFactory;
use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class ProductCommissionSourceStrategy implements CommissionSourceStrategyInterface {

    /**
     * @var false|\WC_Product|null
     */
    private $product;

    const SOURCE = 'product';

    public function __construct( $product_id ) {
        $this->product = dokan()->product->get( $product_id );
    }

    public function get_commission_calculator(): ?CommissionCalculatorInterface {
        $settings = $this->getProductCommissionSettings();
        $commission_calculator = CommissionCalculatorFactory::createCalculator( $settings, 0 );

        if ( $commission_calculator && $commission_calculator->is_applicable() ) {
            return $commission_calculator;
        }

        return null;
    }

    private function getProductCommissionSettings() {
        $percentage = $this->product ? $this->product->get_meta( '_per_product_admin_commission', true ) : '';
        $type = $this->product ? $this->product->get_meta( '_per_product_admin_commission_type', true ) : '';
        $flat = $this->product ? $this->product->get_meta( '_per_product_admin_additional_fee', true ) : '';

        return new CommissionSettings( $type, $flat, $percentage );
    }

    public function get_source(): string {
        return self::SOURCE;
    }
}
