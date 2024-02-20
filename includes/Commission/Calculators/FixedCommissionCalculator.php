<?php

namespace WeDevs\Dokan\Commission\Calculators;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class FixedCommissionCalculator implements CommissionCalculatorInterface {

    private $admin_commission = 0;
    private $per_item_admin_commission = 0;
    private $vendor_earning = 0;
    private $items_total_quantity = 1;
    private CommissionSettings $settings;
    const SOURCE = 'fixed';

    public function __construct( CommissionSettings $settings ) {
        $this->settings = $settings;
    }

    public function calculate( $total_amount, $total_quantity = 1 ) {
        $total_quantity = max( $total_quantity, 1 );

        $flat_calculator = new FlatCommissionCalculator( $this->settings );
        $percentage_calculator = new PercentageCommissionCalculator( $this->settings );

        if ( $flat_calculator->is_applicable() ) {
            $flat_calculator->calculate( $total_amount, $total_quantity );
            $this->per_item_admin_commission += $flat_calculator->get_per_item_admin_commission();
            $this->admin_commission          += $flat_calculator->get_admin_commission();
        }

        if ( $percentage_calculator->is_applicable() ) {
            $percentage_calculator->calculate( $total_amount, $total_quantity );
            $this->per_item_admin_commission += $percentage_calculator->get_per_item_admin_commission();
            $this->admin_commission          += $percentage_calculator->get_admin_commission();
        }

        if ( $this->get_per_item_admin_commission() > $total_amount ) {
            $this->per_item_admin_commission = $total_amount;
        }

        if ( $this->get_admin_commission() > $total_amount ) {
            $this->admin_commission = $total_amount;
        }

        $this->vendor_earning            = $total_amount - $this->get_admin_commission();
        $this->items_total_quantity      = $total_quantity;
    }

    public function get_parameters(): array {
        return [
            'flat'       => $this->settings->get_flat(),
            'percentage' => $this->settings->get_percentage(),
            'meta_data'  => $this->settings->get_meta_data(),
        ];
    }

    public function get_source(): string {
        return self::SOURCE;
    }

    public function is_applicable(): bool {
        return $this->valid_commission_type() && $this->valid_commission();
    }

    private function valid_commission_type(): bool {
        $legacy_types = dokan()->commission->get_legacy_commission_types();

        $all_types = array_keys( $legacy_types );

        return in_array( $this->settings->get_type(), $all_types, true ) || $this->settings->get_type() === self::SOURCE;
    }

    private function valid_commission(): bool {
        return is_numeric( $this->settings->get_flat() ) || is_numeric( $this->settings->get_percentage() );
    }

    public function get_admin_commission(): float {
        return dokan()->commission->validate_rate( $this->admin_commission );
    }

    public function get_vendor_earning(): float {
        return dokan()->commission->validate_rate( $this->vendor_earning );
    }

    public function get_per_item_admin_commission(): float {
        return dokan()->commission->validate_rate( $this->per_item_admin_commission );
    }

    public function get_items_total_quantity(): int {
        return $this->items_total_quantity;
    }
}
