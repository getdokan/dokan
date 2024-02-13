<?php

namespace WeDevs\Dokan\Commission\Calculators;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class CategoryBasedCommissionCalculator implements CommissionCalculatorInterface {
    private $category_commissions = [];
    private $admin_commission = 0;
    private $vendor_earning = 0;
    const SOURCE = 'category_based';
    private FixedCommissionCalculator $fixed_commission_calculator;
    /**
     * @var mixed
     */
    private $type;
    /**
     * @var mixed
     */
    private $category_id = '';

    /**
     * @return mixed
     */
    public function get_category_id() {
        return $this->category_id;
    }

    public function get_category_commissions(): array {
        return $this->category_commissions;
    }

    /**
     * @return mixed
     */
    public function get_type() {
        return $this->type;
    }

    public function __construct( $type, $category_id, array $category_commissions ) {
        $this->category_commissions = $category_commissions;
        $this->type = $type;
        $this->category_id = $category_id;
    }

    public function calculate( $total_amount, $total_quantity = 1 ) {
        $valid_commission = $this->get_valid_commission();
        // Use FixedCommissionCalculator for the calculation
        $this->fixed_commission_calculator = new FixedCommissionCalculator( FixedCommissionCalculator::SOURCE, $valid_commission['flat'], $valid_commission['percentage'] );
        $this->fixed_commission_calculator->calculate( $total_amount, $total_quantity );

        $this->admin_commission = $this->fixed_commission_calculator->get_admin_commission();
        $this->vendor_earning = $this->fixed_commission_calculator->get_vendor_earning();
    }

    public function get_parameters(): array {
        $parameters = $this->fixed_commission_calculator->get_parameters();

        $parameters['category_id'] = $this->get_category_id();

        return $parameters;
    }

    public function get_source(): string {
        return self::SOURCE;
    }


    public function is_applicable(): bool {
        return $this->valid_commission_type() && $this->is_valid_commission();
    }

    private function valid_commission_type(): bool {
        return $this->get_type() === $this->get_source();
    }

    private function is_valid_commission(): bool {
        if ( is_numeric( $this->get_category_id() ) && isset( $this->get_category_commissions()['items'][ $this->get_category_id() ] ) ) {
            return true;
        } elseif ( is_numeric( $this->get_category_commissions()['all']['flat'] ) || is_numeric( $this->get_category_commissions()['all']['percentage'] ) ) {
            return true;
        }

        return false;
    }

    private function get_valid_commission(): array {
        if ( is_numeric( $this->get_category_id() ) && isset( $this->get_category_commissions()['items'][ $this->get_category_id() ] ) ) {
            $commission = $this->get_category_commissions()['items'][ $this->get_category_id() ];
            return [
                'flat' => $commission['flat'] ?? 0,
                'percentage' => $commission['percentage'] ?? 0,
            ];
        } elseif ( is_numeric( $this->get_category_commissions()['all']['flat'] ) || is_numeric( $this->get_category_commissions()['all']['percentage'] ) ) {
            $commission = $this->get_category_commissions()['all'];
            return [
                'flat' => $commission['flat'] ?? 0,
                'percentage' => $commission['percentage'] ?? 0,
            ];
        }

        return [
            'flat' => 0,
            'percentage' => 0,
        ];
    }

    public function get_admin_commission(): float {
        return $this->admin_commission;
    }

    public function get_vendor_earning(): float {
        return $this->vendor_earning;
    }
}
