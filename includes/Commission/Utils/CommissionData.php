<?php

namespace WeDevs\Dokan\Commission\Utils;

class CommissionData {
    private $source = 'none';
    private $per_item_admin_commission = 0;
    private $admin_commission = 0;
    private $vendor_earning = 0;
    private $total_quantity = 1;
    private $total_amount = 0;
    private $type = 'none';
    private $parameters = [];

    public function get_source(): string {
        return $this->source;
    }

    public function set_source( string $source ): CommissionData {
        $this->source = $source;

        return $this;
    }

    public function get_per_item_admin_commission(): int {
        return $this->per_item_admin_commission;
    }

    public function set_per_item_admin_commission( int $per_item_admin_commission ): CommissionData {
        $this->per_item_admin_commission = $per_item_admin_commission;

        return $this;
    }

    public function get_admin_commission(): int {
        return $this->admin_commission;
    }

    public function set_admin_commission( int $admin_commission ): CommissionData {
        $this->admin_commission = $admin_commission;

        return $this;
    }

    public function get_vendor_earning(): int {
        return $this->vendor_earning;
    }

    public function set_vendor_earning( int $vendor_earning ): CommissionData {
        $this->vendor_earning = $vendor_earning;

        return $this;
    }

    public function get_total_quantity(): int {
        return $this->total_quantity;
    }

    public function set_total_quantity( int $total_quantity ): CommissionData {
        $this->total_quantity = $total_quantity;

        return $this;
    }

    public function get_total_amount(): int {
        return $this->total_amount;
    }

    public function set_total_amount( int $total_amount ): CommissionData {
        $this->total_amount = $total_amount;

        return $this;
    }

    public function get_type(): string {
        return $this->type;
    }

    public function set_type( string $type ): CommissionData {
        $this->type = $type;

        return $this;
    }

    public function get_parameters(): array {
        return $this->parameters;
    }

    public function set_parameters( array $parameters ): CommissionData {
        $this->parameters = $parameters;

        return $this;
    }

    public function get_data(): array {
        return [
            'source'                    => $this->get_source(),
            'per_item_admin_commission' => $this->get_per_item_admin_commission(),
            'admin_commission'          => $this->get_admin_commission(),
            'vendor_earning'            => $this->get_vendor_earning(),
            'total_quantity'            => $this->get_total_quantity(),
            'total_amount'              => $this->get_total_amount(),
            'type'                      => $this->get_type(),
            'parameters'                => $this->get_parameters(),
        ];
    }
}
