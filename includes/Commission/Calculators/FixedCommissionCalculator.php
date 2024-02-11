<?php

namespace WeDevs\Dokan\Commission\Calculators;

class FixedCommissionCalculator implements CommissionCalculatorInterface {
    private $flat;
    private $percentage;

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

    public function calculate( $price, $category_id = 0 ): float {
        return (float) $this->flat + ( $price * ( $this->percentage / 100 ) );
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
}
