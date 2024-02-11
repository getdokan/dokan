<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Calculators\CommissionCalculatorInterface;
use WeDevs\Dokan\Commission\CommissionCalculatorFactory;
use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class VendorCommissionSourceStrategy implements CommissionSourceStrategyInterface {

    /**
     * @var object|\WeDevs\Dokan\Vendor\Vendor
     */
    private $vendor;
    const SOURCE = 'vendor';
    /**
     * @var mixed
     */
    private $category_id;

    public function __construct( $vendor_id, $category_id ) {
        $this->vendor = dokan()->vendor->get( $vendor_id );
        $this->category_id = $category_id;
    }

    /**
     * @return mixed
     */
    public function get_category_id() {
        return $this->category_id;
    }

    public function get_commission_calculator(): ?CommissionCalculatorInterface {
        $settings = $this->getVendorCommissionSettings();
        $commission_calculator = CommissionCalculatorFactory::createCalculator( $settings, $this->get_category_id() );

        if ( $commission_calculator && $commission_calculator->is_applicable() ) {
            return $commission_calculator;
        }

        return null;
    }

    private function getVendorCommissionSettings(): CommissionSettings {
        $percentage = $this->vendor->get_meta( 'dokan_admin_percentage', true );
        $type       = $this->vendor->get_meta( 'dokan_admin_percentage_type', true );
        $flat       = $this->vendor->get_meta( 'dokan_admin_additional_fee', true );
        $category  = $this->vendor->get_meta( 'admin_category_commission', true ) ?? [];

        return new CommissionSettings( $type, $flat, $percentage, $category );
    }

    public function get_source(): string {
        return self::SOURCE;
    }
}
