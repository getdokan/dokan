<?php

namespace WeDevs\Dokan\Commission\Calculators;

class FixedCommissionCalculator implements CommissionCalculatorInterface {
    private $flat;
    private $percentage;
    private $admin_commission = 0;
    private $per_item_admin_commission = 0;
    private $vendor_earning = 0;
    private $items_total_quantity = 1;

    /**
     * @return mixed
     */
    public function get_flat() {
        return dokan()->commission->validate_rate( $this->flat );
    }

    /**
     * @return mixed
     */
    public function get_percentage() {
        return dokan()->commission->validate_rate( $this->percentage );
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
        $total_quantity = max( $total_quantity, 1 );
        $flat_calculator = new FlatCommissionCalculator( $this->get_flat() );
        $percentage_calculator = new PercentageCommissionCalculator( $this->get_percentage() );

        $flat_calculator->calculate( $total_amount, $total_quantity );
        $percentage_calculator->calculate( $total_amount, $total_quantity );

        $this->per_item_admin_commission = $flat_calculator->get_per_item_admin_commission() + $percentage_calculator->get_per_item_admin_commission();
        $this->admin_commission          = $flat_calculator->get_admin_commission() + $percentage_calculator->get_admin_commission();
        $this->vendor_earning            = $this->vendor_earning = $total_amount - $this->admin_commission;
        $this->items_total_quantity  = $total_quantity;
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
