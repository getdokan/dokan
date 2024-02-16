<?php

namespace WeDevs\Dokan\Commission\Calculators;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class FlatCommissionCalculator implements CommissionCalculatorInterface {
    private $flat_commission = 0;
    private CommissionSettings $settings;
    private $per_item_admin_commission = 0;
    private $admin_commission = 0;
    private $vendor_earning = 0;
    private $items_total_quantity = 1;

    const SOURCE = 'flat';

    public function __construct( CommissionSettings $settings ) {
        $this->settings = $settings;
    }

    public function calculate( $total_amount, $total_quantity = 1 ) {
        $total_quantity = max( $total_quantity, 1 );

        $this->per_item_admin_commission = dokan()->commission->validate_rate( $this->settings->get_flat() ) ?? 0;
        $this->flat_commission = $this->per_item_admin_commission;
        if ( (int) $total_quantity > 1 ) {
            $this->flat_commission = $this->per_item_admin_commission * apply_filters( 'dokan_commission_multiply_by_order_quantity', $total_quantity );
        }

        $this->admin_commission = $this->flat_commission;

        if ( $this->admin_commission > $total_amount ) {
            $this->admin_commission = $total_amount;
        }

        $this->vendor_earning = $total_amount - $this->admin_commission;
        $this->items_total_quantity = $total_quantity;
    }

    public function get_parameters(): array {
        return [
            'flat'      => $this->settings->get_flat(),
            'meta_data' => $this->settings->get_meta_data(),
        ];
    }

    public function get_source(): string {
        return self::SOURCE;
    }

    public function is_applicable(): bool {
        return is_numeric( $this->settings->get_flat() );
    }

    public function get_admin_commission(): float {
        return $this->admin_commission;
    }

    public function get_vendor_earning(): float {
        return $this->vendor_earning;
    }

    public function get_per_item_admin_commission(): float {
        return dokan()->commission->validate_rate( $this->per_item_admin_commission );
    }

    public function get_items_total_quantity(): int {
        return $this->items_total_quantity;
    }
}
