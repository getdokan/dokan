<?php

namespace WeDevs\Dokan\Commission\Calculators;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class CombineCommissionCalculator implements CommissionCalculatorInterface {

    private $per_item_admin_commission = 0;
    private $admin_commission = 0;
    private $vendor_earning = 0;
    private $items_total_quantity = 1;
    private CommissionSettings $settings;
    const SOURCE = 'fixed';

    public function __construct( CommissionSettings $settings ) {
        $this->settings = $settings;
    }

    public function calculate( $total_amount, $total_quantity = 1 ) {
        $percent_commission = $total_amount * ( dokan()->commission->validate_rate( $this->settings->get_percentage() ) / 100 );
        $commission         = (float) dokan()->commission->validate_rate( $this->settings->get_flat() ) + $percent_commission;

        $per_item_flat       = dokan()->commission->validate_rate( $this->settings->get_flat() ) / $total_quantity;
        $per_item_percentage = $percent_commission / $total_quantity;

        $this->admin_commission          = $commission;
        $this->vendor_earning            = $total_amount - $this->admin_commission;
        $this->per_item_admin_commission = $per_item_flat + $per_item_percentage;
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
