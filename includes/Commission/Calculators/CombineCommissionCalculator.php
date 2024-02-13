<?php

namespace WeDevs\Dokan\Commission\Calculators;

class CombineCommissionCalculator implements CommissionCalculatorInterface {
    private $flat;
    private $percentage;
    private $per_item_admin_commission = 0;
    private $admin_commission = 0;
    private $vendor_earning = 0;
    private $items_total_quantity = 1;

    /**
     * @return mixed
     */
    public function get_flat() {
        return $this->flat;
    }

    /**
     * @return mixed
     */
    public function get_percentage() {
        return $this->percentage;
    }
    const SOURCE = 'fixed';
    /**
     * @var mixed|string
     */
    private $type;

    /**
     * @return mixed|string
     */
    public function get_type() {
        return $this->type;
    }

    public function __construct( $type, $flat, $percentage ) {
        $this->flat = $flat;
        $this->percentage = $percentage;
        $this->type = $type;
    }

    public function calculate( $total_amount, $total_quantity = 1 ) {
        $percent_commission = $total_amount * ( $this->percentage / 100 );
        $commission         = (float) $this->flat + $percent_commission;

        $per_item_flat       = $this->get_flat() / $total_quantity;
        $per_item_percentage = $percent_commission / $total_quantity;

        $this->admin_commission          = $commission;
        $this->vendor_earning            = $total_amount - $this->admin_commission;
        $this->per_item_admin_commission = $per_item_flat + $per_item_percentage;
        $this->items_total_quantity = 1;
    }

    public function get_parameters(): array {
        return [
            'flat' => $this->flat,
            'percentage' => $this->percentage,
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

        return in_array( $this->type, $all_types, true ) || $this->get_type() === self::SOURCE;
    }

    private function valid_commission(): bool {
        return is_numeric( $this->flat ) || is_numeric( $this->percentage );
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
