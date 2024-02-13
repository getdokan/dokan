<?php

namespace WeDevs\Dokan\Commission\Calculators;

interface CommissionCalculatorInterface {
    public function calculate( $total_amount, $total_quantity = 1 );
    public function get_admin_commission(): float;
    public function get_vendor_earning(): float;
    public function get_parameters(): array;
    public function get_source(): string;
    public function is_applicable(): bool;
}
