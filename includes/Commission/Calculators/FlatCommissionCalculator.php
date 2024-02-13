<?php

namespace WeDevs\Dokan\Commission\Calculators;

class FlatCommissionCalculator implements CommissionCalculatorInterface {
    private $flat;
    private $per_item_admin_commission = 0;
    private $admin_commission = 0;
    private $vendor_earning = 0;
    private $items_total_quantity = 1;

    /**
     * @return mixed
     */
    public function get_flat() {
        return dokan()->commission->validate_rate( $this->flat );
    }

    const SOURCE = 'flat';

    public function __construct( $flat ) {
        $this->flat = $flat;
    }

    public function calculate( $total_amount, $total_quantity = 1 ) {
        $total_quantity = max( $total_quantity, 1 );

        $this->per_item_admin_commission = $this->flat;
        if ( (int) $total_quantity > 1 ) {
            $this->flat *= apply_filters( 'dokan_commission_multiply_by_order_quantity', $total_quantity );
        }

        $this->admin_commission = $this->get_flat();

        if ( $this->admin_commission > $total_amount ) { // TODO: commission-restruture need discussion that if total amount is less then commission then admin commission will be 0/vendor earning is 0, here admin commissin is 0 in percentage vendor earnig was 0
            $this->admin_commission = $total_amount;
        }

        $this->vendor_earning = $total_amount - $this->admin_commission;
        $this->items_total_quantity = $total_quantity;
    }

    public function get_parameters(): array {
        return [
            'flat' => $this->flat,
        ];
    }

    public function get_source(): string {
        return self::SOURCE;
    }

    public function is_applicable(): bool {
        return is_numeric( $this->flat );
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

    public function get_items_total_quantity()
    : int {
        return $this->items_total_quantity;
    }
}
