<?php

namespace WeDevs\Dokan\Commission\Calculators;

class PercentageCommissionCalculator implements CommissionCalculatorInterface {
    private $percentage = 0;
    private $admin_commission = 0;
    private $per_item_admin_commission = 0;
    private $vendor_earning = 0;
    private $items_total_quantity = 1;

    /**
     * @return mixed
     */
    public function get_percentage() {
        return dokan()->commission->validate_rate( $this->percentage );
    }
    const SOURCE = 'percentage';

    public function __construct( $percentage ) {
        $this->percentage = $percentage;
    }

    public function calculate( $total_amount, $total_quantity = 1 ) {
        $this->admin_commission = ( $total_amount * $this->get_percentage() ) / 100;
        $this->per_item_admin_commission = $this->admin_commission / $total_quantity;
        $this->vendor_earning   = $total_amount - $this->admin_commission;

        // vendor will get 100 percent if commission rate > 100
        // TODO: commission-restructure need to re-consider this about the vendor earning and admin commission.
        if ( $this->get_percentage() > 100 ) {
            $this->vendor_earning   = $total_amount;
            $this->admin_commission = 0;
        }

        $this->items_total_quantity = $total_quantity;
    }

    public function get_parameters(): array {
        return [
            'percentage' => $this->percentage,
        ];
    }

    public function get_source(): string {
        return self::SOURCE;
    }

    public function is_applicable(): bool {
        return is_numeric( $this->percentage );
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
