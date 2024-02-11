<?php

namespace WeDevs\Dokan\Commission\Calculators;

interface CommissionCalculatorInterface {
    public function calculate( $price ): float;
    public function get_parameters(): array;
    public function get_source(): string;
    public function is_applicable(): bool;
}
