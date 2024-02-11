<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Calculators\CommissionCalculatorInterface;

interface CommissionSourceStrategyInterface {
    public function get_commission_calculator(): ?CommissionCalculatorInterface;
    public function get_source(): string;
}
