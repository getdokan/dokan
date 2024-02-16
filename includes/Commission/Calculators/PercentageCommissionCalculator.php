<?php

namespace WeDevs\Dokan\Commission\Calculators;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class PercentageCommissionCalculator implements CommissionCalculatorInterface {

    private $admin_commission = 0;
    private $per_item_admin_commission = 0;
    private $vendor_earning = 0;
    private $items_total_quantity = 1;
    private CommissionSettings $settings;

    const SOURCE = 'percentage';

    public function __construct( CommissionSettings $settings ) {
        $this->settings = $settings;
    }

    public function calculate( $total_amount, $total_quantity = 1 ) {
        $this->admin_commission          = ( $total_amount * dokan()->commission->validate_rate( $this->settings->get_percentage() ) ) / 100;
        $this->per_item_admin_commission = $this->admin_commission / $total_quantity;
        $this->vendor_earning            = $total_amount - $this->admin_commission;

        // Admin will get 100 percent if commission rate > 100
        if ( $this->settings->get_percentage() > 100 ) {
            $this->admin_commission = $total_amount;
            $this->vendor_earning   = 0;
        }

        $this->items_total_quantity = $total_quantity;
    }

    public function get_parameters(): array {
        return [
            'percentage' => $this->settings->get_percentage(),
            'meta_data'  => $this->settings->get_meta_data(),
        ];
    }

    public function get_source(): string {
        return self::SOURCE;
    }

    public function is_applicable(): bool {
        return is_numeric( $this->settings->get_percentage() );
    }

    public function get_admin_commission(): float {
        return dokan()->commission->validate_rate( $this->admin_commission );
    }

    public function get_vendor_earning(): float {
        return dokan()->commission->validate_rate( $this->vendor_earning );
    }

    public function get_per_item_admin_commission(): float {
        return dokan()->commission->validate_rate( $this->per_item_admin_commission ?? 0 );
    }

    public function get_items_total_quantity(): int {
        return $this->items_total_quantity;
    }
}
